// background.js — Service Worker

// Deduplication: content.js keydown fires first, then chrome.commands ~50ms later
let _lastToggleMs = 0;
let _settingsReady = null;
const _settings = {
  apiProvider: 'openai',
  apiKeys: {},
  selectedModels: {},
};
const _inflight = new Map(); // key -> Promise<result>
const _activeStreamControllers = new Map(); // tabId -> { requestId, controller }

const LANGUAGE_NAMES = {
  ar: 'Arabic', zh: 'Chinese', cs: 'Czech', nl: 'Dutch',
  en: 'English', fr: 'French', de: 'German', it: 'Italian',
  ja: 'Japanese', ko: 'Korean', pl: 'Polish', pt: 'Portuguese',
  ru: 'Russian', es: 'Spanish', sv: 'Swedish', tr: 'Turkish', uk: 'Ukrainian'
};

// ── Icon switcher ────────────────────────────────────────────────────────────
function updateIcon(enabled) {
  const suffix = enabled ? '' : '_off';
  chrome.action.setIcon({
    path: {
      16:  `icons/icon16${suffix}.png`,
      48:  `icons/icon48${suffix}.png`,
      128: `icons/icon128${suffix}.png`,
    }
  });
}

// ── Detect browser language ───────────────────────────────────────────────────
const SUPPORTED_LANGS = new Set(Object.keys(LANGUAGE_NAMES));

function detectLang() {
  // chrome.i18n.getUILanguage() returns e.g. "ru", "en-US", "zh-CN"
  const raw  = (chrome.i18n.getUILanguage() || 'en').toLowerCase();
  const code = raw.split('-')[0]; // "en-US" → "en", "zh-CN" → "zh"
  return SUPPORTED_LANGS.has(code) ? code : 'en';
}

// ── Initialization ──────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get(['enabled', 'targetLanguage', 'interfaceLanguage', 'apiProvider']);

  const browserLang = detectLang();

  const toSet = {};
  if (stored.enabled === undefined) toSet.enabled           = true;
  if (!stored.targetLanguage)       toSet.targetLanguage    = browserLang;
  if (!stored.interfaceLanguage)    toSet.interfaceLanguage = browserLang;
  if (!stored.apiProvider)          toSet.apiProvider       = 'openai';

  if (Object.keys(toSet).length) await chrome.storage.local.set(toSet);
  await loadSettings();
  updateIcon(stored.enabled !== false);
});

// ── Sync icon on any enabled change (popup toggle or hotkey) ─────────────────
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.enabled !== undefined) {
    updateIcon(changes.enabled.newValue);
  }
  if (area === 'local') {
    if (changes.apiProvider !== undefined) _settings.apiProvider = changes.apiProvider.newValue || 'openai';
    if (changes.apiKeys !== undefined) _settings.apiKeys = changes.apiKeys.newValue || {};
    if (changes.selectedModels !== undefined) _settings.selectedModels = changes.selectedModels.newValue || {};
  }
});

// ── Message Handler ─────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'translate') {
    const tabId = _sender.tab?.id;
    if (message.stream && tabId) {
      handleTranslateStream(message.text, message.targetLanguage, tabId, message.requestId)
        .then(() => sendResponse({ started: true }));
    } else {
      handleTranslate(message.text, message.targetLanguage).then(sendResponse);
    }
    return true;
  }
  if (message.type === 'validateKey') {
    validateKey(message.provider, message.apiKey).then(sendResponse);
    return true;
  }
  if (message.type === 'cancelTranslate') {
    const tabId = _sender.tab?.id;
    if (tabId) cancelActiveTranslate(tabId, message.requestId);
    sendResponse({ ok: true });
    return true;
  }
  if (message.type === 'ping') {
    // Wakes the service worker so the next translate has no cold-start latency
    loadSettings();
    sendResponse({ ok: true });
    return true;
  }
  // Sent by content.js keydown (works with any keyboard layout via e.code)
  if (message.type === 'toggleEnabled') {
    _lastToggleMs = Date.now();
    chrome.storage.local.get('enabled', ({ enabled }) => {
      chrome.storage.local.set({ enabled: !enabled });
    });
    sendResponse({ ok: true });
    return true;
  }
});

// ── Hotkey commands ───────────────────────────────────────────────────────────
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-translation') {
    // Skip if content.js keydown already handled it within the last 300ms
    if (Date.now() - _lastToggleMs > 300) {
      chrome.storage.local.get('enabled', ({ enabled }) => {
        chrome.storage.local.set({ enabled: !enabled });
      });
    }
    _lastToggleMs = Date.now();
  }
});

// ── Translation cache (in-memory, lives while service worker is alive) ────────
const _cache = new Map(); // key → { result, ts }
const CACHE_MAX = 60;
const CACHE_TTL = 20 * 60 * 1000; // 20 min

function loadSettings() {
  if (!_settingsReady) {
    _settingsReady = chrome.storage.local
      .get(['apiProvider', 'apiKey', 'apiKeys', 'selectedModels'])
      .then((stored) => {
        _settings.apiProvider = stored.apiProvider || 'openai';
        _settings.apiKeys = stored.apiKeys || {};
        _settings.selectedModels = stored.selectedModels || {};
        // Migrate legacy single apiKey → per-provider apiKeys
        if (stored.apiKey && !Object.keys(_settings.apiKeys).length) {
          _settings.apiKeys[_settings.apiProvider] = stored.apiKey;
          chrome.storage.local.set({ apiKeys: _settings.apiKeys });
          chrome.storage.local.remove('apiKey');
        }
        return _settings;
      });
  }
  return _settingsReady;
}

function getActiveApiKey() {
  return (_settings.apiKeys[_settings.apiProvider] || '').trim();
}

function withInflight(cacheKey, producer) {
  const existing = _inflight.get(cacheKey);
  if (existing) return existing;
  const promise = Promise.resolve()
    .then(producer)
    .finally(() => _inflight.delete(cacheKey));
  _inflight.set(cacheKey, promise);
  return promise;
}

function cancelActiveTranslate(tabId, requestId) {
  const current = _activeStreamControllers.get(tabId);
  if (!current) return;
  if (requestId && current.requestId !== requestId) return;
  current.controller.abort();
  _activeStreamControllers.delete(tabId);
}

function _cacheGet(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { _cache.delete(key); return null; }
  return entry.result;
}

function _cacheSet(key, result) {
  if (_cache.size >= CACHE_MAX) {
    _cache.delete(_cache.keys().next().value); // evict oldest
  }
  _cache.set(key, { result, ts: Date.now() });
}

// ── Default models per provider ───────────────────────────────────────────────
const DEFAULT_MODELS = {
  openai:    'gpt-4o-mini',
  anthropic: 'claude-haiku-4-5-20251001',
  grok:      'grok-3',
  gemini:    'gemini-2.0-flash',
};

// ── Translate dispatcher ─────────────────────────────────────────────────────
async function handleTranslate(text, targetLanguage) {
  const settings = await loadSettings();
  const apiKey = getActiveApiKey();
  if (!apiKey) {
    return { error: 'no_key', message: 'API key not set' };
  }
  const provider = settings.apiProvider;
  const model    = (settings.selectedModels || {})[provider] || DEFAULT_MODELS[provider];
  const cacheKey = `${provider}:${model}:${targetLanguage}:${text}`;

  const cached = _cacheGet(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const result = await withInflight(cacheKey, async () =>
    translateWithCustomAPI(text, targetLanguage, provider, apiKey, model)
  );

  if (result.success) _cacheSet(cacheKey, result);
  return result;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildSystemPrompt(targetLanguage) {
  const langName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
  return `Translate the following text to ${langName}. Return ONLY the translation, no explanations, no quotes.`;
}

// ── Custom AI providers ──────────────────────────────────────────────────────
async function translateWithCustomAPI(text, targetLanguage, provider, apiKey, model, signal) {
  const systemPrompt = buildSystemPrompt(targetLanguage);

  try {
    let translation;

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        signal,
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          temperature: 0.3
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `OpenAI error ${res.status}`);
      translation = data.choices[0].message.content.trim();

    } else if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        signal,
        body: JSON.stringify({
          model: model || 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          messages: [{ role: 'user', content: `${systemPrompt}\n\n${text}` }]
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `Anthropic error ${res.status}`);
      translation = data.content[0].text.trim();

    } else if (provider === 'grok') {
      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        signal,
        body: JSON.stringify({
          model: model || 'grok-3',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          max_tokens: 256,
          temperature: 0.3
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `Grok error ${res.status}`);
      translation = data.choices[0].message.content.trim();

    } else if (provider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash'}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${text}` }] }]
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `Gemini error ${res.status}`);
      translation = data.candidates[0].content.parts[0].text.trim();

    } else {
      throw new Error('Unknown provider: ' + provider);
    }

    return { success: true, translation, customApi: true };
  } catch (e) {
    return { error: 'api_error', message: e.message };
  }
}

// ── Key validation ────────────────────────────────────────────────────────────
async function validateKey(provider, apiKey) {
  try {
    let res;

    if (provider === 'openai') {
      res = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

    } else if (provider === 'anthropic') {
      // Minimal message — cheapest validation
      res = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        }
      });

    } else if (provider === 'grok') {
      res = await fetch('https://api.x.ai/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

    } else if (provider === 'gemini') {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    } else {
      return { valid: false, message: 'Unknown provider' };
    }

    if (res.ok) return { valid: true };

    const data = await res.json().catch(() => ({}));
    const msg  = data.error?.message || `HTTP ${res.status}`;
    return { valid: false, message: msg };

  } catch (e) {
    return { valid: false, message: e.message };
  }
}

// ── Streaming translate ───────────────────────────────────────────────────────
async function handleTranslateStream(text, targetLanguage, tabId, requestId) {
  const settings = await loadSettings();

  const apiKey = getActiveApiKey();
  if (!apiKey) {
    chrome.tabs.sendMessage(tabId, {
      type: 'translationDone',
      requestId,
      error: 'no_key',
      message: 'API key not set'
    });
    return;
  }

  const provider = settings.apiProvider;
  const model    = (settings.selectedModels || {})[provider] || DEFAULT_MODELS[provider];
  const cacheKey = `${provider}:${model}:${targetLanguage}:${text}`;
  const previous = _activeStreamControllers.get(tabId);
  if (previous) previous.controller.abort();

  const cached = _cacheGet(cacheKey);
  if (cached) {
    chrome.tabs.sendMessage(tabId, {
      type: 'translationDone',
      requestId,
      success: true,
      translation: cached.translation,
      fromCache: true
    });
    return;
  }

  const controller = new AbortController();
  _activeStreamControllers.set(tabId, { requestId, controller });

  const finishActiveStream = () => {
    const current = _activeStreamControllers.get(tabId);
    if (current && current.requestId === requestId) {
      _activeStreamControllers.delete(tabId);
    }
  };

  const key   = apiKey;
  const sysPr = buildSystemPrompt(targetLanguage);

  try {
    let translation = '';

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        signal: controller.signal,
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [{ role: 'system', content: sysPr }, { role: 'user', content: text }],
          stream: true, temperature: 0.3
        })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error?.message || `OpenAI ${res.status}`); }
      translation = await readSSEStream(res.body, chunk => {
        try { return JSON.parse(chunk).choices[0]?.delta?.content || ''; } catch { return ''; }
      }, delta => {
        chrome.tabs.sendMessage(tabId, { type: 'translationChunk', requestId, delta });
      }, controller.signal);

    } else if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 'x-api-key': key,
          'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: model || 'claude-haiku-4-5-20251001', max_tokens: 400,
          stream: true, messages: [{ role: 'user', content: `${sysPr}\n\n${text}` }]
        })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error?.message || `Anthropic ${res.status}`); }
      translation = await readSSEStream(res.body, chunk => {
        try {
          const d = JSON.parse(chunk);
          return (d.type === 'content_block_delta' && d.delta?.type === 'text_delta') ? d.delta.text : '';
        } catch { return ''; }
      }, delta => {
        chrome.tabs.sendMessage(tabId, { type: 'translationChunk', requestId, delta });
      }, controller.signal);

    } else if (provider === 'grok') {
      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        signal: controller.signal,
        body: JSON.stringify({
          model: model || 'grok-3',
          messages: [{ role: 'system', content: sysPr }, { role: 'user', content: text }],
          stream: true,
          max_tokens: 256,
          temperature: 0.3
        })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error?.message || `Grok ${res.status}`); }
      translation = await readSSEStream(res.body, chunk => {
        try { return JSON.parse(chunk).choices[0]?.delta?.content || ''; } catch { return ''; }
      }, delta => {
        chrome.tabs.sendMessage(tabId, { type: 'translationChunk', requestId, delta });
      }, controller.signal);

    } else if (provider === 'gemini') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash'}:streamGenerateContent?key=${key}&alt=sse`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ contents: [{ parts: [{ text: `${sysPr}\n\n${text}` }] }] })
        }
      );
      if (!res.ok) { const d = await res.json(); throw new Error(d.error?.message || `Gemini ${res.status}`); }
      translation = await readSSEStream(res.body, chunk => {
        try { return JSON.parse(chunk).candidates?.[0]?.content?.parts?.[0]?.text || ''; } catch { return ''; }
      }, delta => {
        chrome.tabs.sendMessage(tabId, { type: 'translationChunk', requestId, delta });
      }, controller.signal);
    }

    const result = { success: true, translation: translation.trim(), customApi: true };

    finishActiveStream();
    _cacheSet(cacheKey, result);
    chrome.tabs.sendMessage(tabId, { type: 'translationDone', requestId, ...result });

  } catch (e) {
    finishActiveStream();
    if (e.name === 'AbortError') return;
    chrome.tabs.sendMessage(tabId, { type: 'translationDone', requestId, error: 'api_error', message: e.message });
  }
}

async function readSSEStream(responseBody, parseChunk, onDelta, signal) {
  const reader  = responseBody.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buf      = '';
  try {
    while (true) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith('data:')) continue;
        const data = t.slice(5).trim();
        if (data === '[DONE]') continue;
        const delta = parseChunk(data);
        if (delta) {
          fullText += delta;
          onDelta(delta);
        }
      }
    }
    // Flush any remaining bytes the server sent without a trailing newline
    if (buf.trim().startsWith('data:')) {
      const data = buf.trim().slice(5).trim();
      if (data && data !== '[DONE]') {
        const delta = parseChunk(data);
        if (delta) { fullText += delta; onDelta(delta); }
      }
    }
  } catch (e) {
    if (e.name !== 'AbortError') throw e;
    throw e;
  } finally {
    try { reader.releaseLock(); } catch (_) {}
  }
  return fullText;
}
