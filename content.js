// content.js — injected into every page

(function () {
  'use strict';

  // ── Color themes ─────────────────────────────────────────────────────────────
  const CONTENT_THEMES = {
    indigo: { a: '#6366f1', b: '#8b5cf6', dark: '#4f46e5', bg1: '#f5f3ff', bg2: '#ede9fe', text: '#1e1b4b', muted: '#c4b5fd', muted2: '#a78bfa' },
    blue:   { a: '#3b82f6', b: '#2563eb', dark: '#1d4ed8', bg1: '#eff6ff', bg2: '#dbeafe', text: '#1e3a8a', muted: '#93c5fd', muted2: '#60a5fa' },
    teal:   { a: '#14b8a6', b: '#0d9488', dark: '#0f766e', bg1: '#f0fdfa', bg2: '#ccfbf1', text: '#134e4a', muted: '#99f6e4', muted2: '#5eead4' },
    rose:   { a: '#f43f5e', b: '#e11d48', dark: '#be123c', bg1: '#fff1f2', bg2: '#ffe4e6', text: '#4c0519', muted: '#fda4af', muted2: '#fb7185' },
    amber:  { a: '#f59e0b', b: '#d97706', dark: '#b45309', bg1: '#fffbeb', bg2: '#fef3c7', text: '#451a03', muted: '#fcd34d', muted2: '#fbbf24' },
    slate:  { a: '#64748b', b: '#475569', dark: '#334155', bg1: '#f8fafc', bg2: '#f1f5f9', text: '#0f172a', muted: '#cbd5e1', muted2: '#94a3b8' },
  };

  function applyContentTheme(themeId) {
    const theme = CONTENT_THEMES[themeId] || CONTENT_THEMES.indigo;
    let style = document.getElementById('ai-tr-theme');
    if (!style) {
      style = document.createElement('style');
      style.id = 'ai-tr-theme';
      (document.head || document.documentElement).appendChild(style);
    }
    style.textContent = `:root {
      --ai-tr-a:     ${theme.a};
      --ai-tr-b:     ${theme.b};
      --ai-tr-dark:  ${theme.dark};
      --ai-tr-bg1:   ${theme.bg1};
      --ai-tr-bg2:   ${theme.bg2};
      --ai-tr-text:  ${theme.text};
      --ai-tr-muted: ${theme.muted};
      --ai-tr-muted2:${theme.muted2};
    }`;
  }

  // ── i18n ────────────────────────────────────────────────────────────────────
  const DICT_I18N = {
    ru: {
      title: 'Словарь',
      empty: 'Слов пока нет.\nИспользуйте кнопку + при переводе, чтобы добавить слова.',
      clearAll: 'Очистить всё',
      translating: 'Переводим…',
      translateSelection: 'Перевести выделение',
      copy: 'Копировать (оригинал, перевод)',
      addToDict: 'Добавить в словарь',
      deleteEntry: 'Удалить',
      close: 'Закрыть',
      translationFailed: 'Ошибка перевода',
      limitReached: 'Достигнут дневной лимит',
      explain: 'Объяснить в контексте',
      explaining: 'Анализируем…',
      explainFailed: 'Не удалось получить объяснение',
    },
    en: {
      title: 'Dictionary',
      empty: 'No words yet.\nUse the + button when translating to add words.',
      clearAll: 'Clear all',
      translating: 'Translating…',
      translateSelection: 'Translate selection',
      copy: 'Copy (original, translation)',
      addToDict: 'Add to dictionary',
      deleteEntry: 'Delete',
      close: 'Close',
      translationFailed: 'Translation failed',
      limitReached: 'Daily limit reached',
      explain: 'Explain in context',
      explaining: 'Analyzing…',
      explainFailed: 'Failed to get explanation',
    },
    es: {
      title: 'Diccionario',
      empty: 'Aún no hay palabras.\nUsa el botón + al traducir para agregar palabras.',
      clearAll: 'Borrar todo',
      translating: 'Traduciendo…',
      translateSelection: 'Traducir selección',
      copy: 'Copiar (original, traducción)',
      addToDict: 'Añadir al diccionario',
      deleteEntry: 'Eliminar',
      close: 'Cerrar',
      translationFailed: 'Error de traducción',
      limitReached: 'Límite diario alcanzado',
      explain: 'Explicar en contexto',
      explaining: 'Analizando…',
      explainFailed: 'No se pudo obtener la explicación',
    },
    zh: {
      title: '词典',
      empty: '暂无单词。\n翻译时使用 + 按钮添加单词。',
      clearAll: '全部清除',
      translating: '翻译中…',
      translateSelection: '翻译选中内容',
      copy: '复制（原文，译文）',
      addToDict: '添加到词典',
      deleteEntry: '删除',
      close: '关闭',
      translationFailed: '翻译失败',
      limitReached: '已达每日限额',
      explain: '在上下文中解释',
      explaining: '分析中…',
      explainFailed: '无法获取解释',
    },
  };
  function dt(key) {
    const lang = settings.interfaceLanguage;
    return (DICT_I18N[lang] || DICT_I18N.en)[key] ?? DICT_I18N.en[key] ?? key;
  }

  // ── State ───────────────────────────────────────────────────────────────────
  let settings = {
    enabled:           true,
    targetLanguage:    'ru',
    interfaceLanguage: 'en',
    instantTranslate:  false,
    useDictionary:     false,
  };
  let translateBtn    = null;
  let popup           = null;
  let dictPanel       = null;
  let selectedText    = '';
  let selectedSentence = '';
  let popupAnchor     = { x: 0, y: 0 };
  let streamActive    = false;
  let streamOrigText  = '';
  let activeRequestId = null;
  let streamRenderTimer = null;
  let streamedText    = '';
  let pendingDelta    = '';
  let explainRequestId = null;

  // ── Boot ────────────────────────────────────────────────────────────────────
  chrome.storage.local.get(['enabled', 'targetLanguage', 'interfaceLanguage', 'instantTranslate', 'useDictionary', 'accentTheme'], (result) => {
    settings.enabled           = result.enabled !== undefined ? result.enabled : true;
    settings.targetLanguage    = result.targetLanguage    || 'ru';
    settings.interfaceLanguage = result.interfaceLanguage || 'en';
    settings.instantTranslate  = !!result.instantTranslate;
    settings.useDictionary     = !!result.useDictionary;
    applyContentTheme(result.accentTheme || 'indigo');
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled           !== undefined) settings.enabled           = changes.enabled.newValue;
    if (changes.targetLanguage    !== undefined) settings.targetLanguage    = changes.targetLanguage.newValue;
    if (changes.interfaceLanguage !== undefined) {
      settings.interfaceLanguage = changes.interfaceLanguage.newValue;
      if (dictPanel) {
        chrome.storage.local.get('dictionary', ({ dictionary }) => renderDictList(dictionary || []));
      }
    }
    if (changes.instantTranslate  !== undefined) settings.instantTranslate  = changes.instantTranslate.newValue;
    if (changes.useDictionary     !== undefined) {
      settings.useDictionary = changes.useDictionary.newValue;
      if (!settings.useDictionary) closeDictPanel();
    }
    if (changes.accentTheme !== undefined) applyContentTheme(changes.accentTheme.newValue || 'indigo');
  });

  // Listen for background messages (dictionary toggle + streaming chunks)
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'toggleDictionary') { toggleDictPanel(); sendResponse({ ok: true }); return; }

    if (message.type === 'translationChunk') {
      if (!popup || message.requestId !== activeRequestId) return;
      streamActive = true;
      queueStreamingDelta(message.delta || '');
      return;
    }

    if (message.type === 'translationDone') {
      if (message.requestId !== activeRequestId) return;
      streamActive = false;
      flushStreamingText();
      if (!popup) return;
      if (message.success) {
        renderResult(streamOrigText, message.translation);
      } else if (message.error === 'limit_reached') {
        renderError(`${dt('limitReached')} (${message.limit}/${message.limit})`);
      } else {
        renderError(message.message || dt('translationFailed'));
      }
    }
  });

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function esc(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  // Minimal safe markdown: **bold**, *italic*. HTML is escaped first.
  function formatExplanation(text) {
    let html = esc(text || '');
    html = html.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(^|[^*\w])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
    return html;
  }

  function isOurNode(node) {
    return node && node.closest &&
      (node.closest('#ai-tr-btn') || node.closest('#ai-tr-popup') || node.closest('#ai-tr-dict'));
  }

  // Extract the full sentence containing the selection (bounded by .!?… or block edge)
  function getSurroundingSentence(selection, word) {
    try {
      if (!selection || !selection.rangeCount) return word;
      const range = selection.getRangeAt(0);

      let container = range.startContainer;
      if (container.nodeType === Node.TEXT_NODE) container = container.parentElement;
      while (container && container !== document.body) {
        const tag = container.tagName;
        if (tag === 'P' || tag === 'LI' || tag === 'TD' || tag === 'BLOCKQUOTE' || tag === 'ARTICLE' || tag === 'SECTION') break;
        const d = getComputedStyle(container).display;
        if (d === 'block' || d === 'list-item' || d === 'table-cell') break;
        container = container.parentElement;
      }
      if (!container) return word;

      const fullText = (container.innerText || container.textContent || '').replace(/\s+/g, ' ').trim();
      const idx = fullText.indexOf(word);
      if (idx === -1) return word;

      const terminators = /[.!?…。！？]/;
      let start = idx;
      let end = idx + word.length;
      while (start > 0 && !terminators.test(fullText[start - 1]) && fullText[start - 1] !== '\n') start--;
      while (end < fullText.length && !terminators.test(fullText[end])) end++;
      if (end < fullText.length) end++;

      const sentence = fullText.slice(start, end).trim();
      // If the sentence is too short or equals the word, just return the word
      if (sentence.length < word.length + 3) return word;
      // Cap length so we don't send huge paragraphs if no punctuation found
      return sentence.length > 600 ? sentence.slice(0, 600) : sentence;
    } catch (_) {
      return word;
    }
  }

  // ── Translate button ─────────────────────────────────────────────────────────
  function getBtn() {
    if (translateBtn) return translateBtn;

    translateBtn = document.createElement('button');
    translateBtn.id = 'ai-tr-btn';
    translateBtn.setAttribute('aria-label', dt('translateSelection'));
    translateBtn.title = dt('translateSelection');
    translateBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" fill="currentColor"/>
      </svg>
    `;

    translateBtn.addEventListener('click', onBtnClick);
    document.body.appendChild(translateBtn);
    return translateBtn;
  }

  function showBtn(x, y) {
    const btn = getBtn();
    btn.style.left = `${Math.round(x)}px`;
    btn.style.top  = `${Math.round(y)}px`;
    btn.classList.add('visible');
  }

  function hideBtn() {
    if (translateBtn) translateBtn.classList.remove('visible');
  }

  // ── Selection detection ──────────────────────────────────────────────────────
  document.addEventListener('mouseup', (e) => {
    if (!settings.enabled) return;
    if (isOurNode(e.target)) return;

    const mousePageX = e.pageX;
    const mousePageY = e.pageY;

    setTimeout(() => {
      const sel  = window.getSelection();
      const text = sel ? sel.toString().trim() : '';

      if (text.length >= 2 && text.length <= 5000) {
        selectedText = text;
        selectedSentence = getSurroundingSentence(sel, text);
        // Pre-warm the background service worker so the next translate has no cold-start delay
        try { chrome.runtime.sendMessage({ type: 'ping' }); } catch (_) {}
        try {
          const range = sel.getRangeAt(0);
          const rect  = range.getBoundingClientRect();
          popupAnchor = { x: rect.left + window.scrollX, y: rect.bottom + window.scrollY + 8 };

          if (settings.instantTranslate) {
            hideBtn();
            triggerTranslate(text);
          } else {
            const BTN = 32;
            let btnX = mousePageX - BTN / 2;
            let btnY = mousePageY - BTN - 8;
            if (btnY < window.scrollY + 4) btnY = mousePageY + 8;
            showBtn(btnX, btnY);
          }
        } catch (_) { hideBtn(); }
      } else {
        hideBtn();
        selectedText = '';
      }
    }, 10);
  });

  document.addEventListener('mousedown', (e) => {
    if (isOurNode(e.target)) return;
    hideBtn();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closePopup(); return; }

    // Use e.code (physical key) so hotkeys work with any keyboard layout (e.g. Russian)
    if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey) {
      if (e.code === 'KeyS') { e.preventDefault(); toggleDictPanel(); }
      if (e.code === 'KeyT') { e.preventDefault(); chrome.runtime.sendMessage({ type: 'toggleEnabled' }); }
    }
  });

  // ── Translate button click ───────────────────────────────────────────────────
  function onBtnClick(e) {
    e.stopPropagation();
    e.preventDefault();
    if (!selectedText) return;
    hideBtn();
    triggerTranslate(selectedText);
  }

  // ── Core translate + show popup ──────────────────────────────────────────────
  function triggerTranslate(text) {
    const lang = settings.targetLanguage;
    const requestId = `${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

    openPopup(popupAnchor.x, popupAnchor.y);
    streamOrigText = text;
    streamActive   = true;
    activeRequestId = requestId;
    streamedText = '';
    pendingDelta = '';
    clearStreamingTimer();
    renderLoading();
    chrome.runtime.sendMessage({ type: 'translate', text, targetLanguage: lang, stream: true, requestId });
  }

  // ── Popup ────────────────────────────────────────────────────────────────────
  function openPopup(anchorX, anchorY) {
    closePopup();

    popup = document.createElement('div');
    popup.id = 'ai-tr-popup';
    popup.innerHTML = `
      <div class="ai-tr-inner">
        <div class="ai-tr-body" id="ai-tr-body"></div>
      </div>
    `;

    const vpW = document.documentElement.clientWidth;
    const POPUP_W = Math.min(700, vpW - 24);
    let left = anchorX;
    if (left + POPUP_W > vpW + window.scrollX - 12) left = vpW + window.scrollX - POPUP_W - 12;
    if (left < window.scrollX + 8) left = window.scrollX + 8;

    popup.style.left = `${Math.round(left)}px`;
    popup.style.top  = `${Math.round(anchorY)}px`;

    document.body.appendChild(popup);
    requestAnimationFrame(() => popup.classList.add('visible'));

    setTimeout(() => {
      document.addEventListener('mousedown', outsideClickHandler);
    }, 0);
  }

  function outsideClickHandler(e) {
    if (popup && !popup.contains(e.target)) closePopup();
  }

  function closePopup() {
    if (activeRequestId) {
      chrome.runtime.sendMessage({ type: 'cancelTranslate', requestId: activeRequestId });
    }
    streamActive = false;
    activeRequestId = null;
    streamedText = '';
    pendingDelta = '';
    clearStreamingTimer();
    if (popup) {
      const el = popup;
      popup = null;
      el.classList.remove('visible');
      const removeEl = () => el.remove();
      el.addEventListener('transitionend', removeEl, { once: true });
      setTimeout(removeEl, 300); // fallback if transitionend never fires
    }
    document.removeEventListener('mousedown', outsideClickHandler);
  }

  function getBody() {
    return popup ? popup.querySelector('#ai-tr-body') : null;
  }

  function renderLoading() {
    const body = getBody();
    if (!body) return;
    body.innerHTML = `
      <div class="ai-tr-loading">
        <div class="ai-tr-spinner"></div>
        <span>${esc(dt('translating'))}</span>
      </div>
    `;
  }

  function renderStreamingText(text) {
    const body = getBody();
    if (!body) return;
    let el = body.querySelector('.ai-tr-result');
    if (el) {
      el.textContent = text;
    } else {
      body.innerHTML = `<div class="ai-tr-row"><div class="ai-tr-result">${esc(text)}</div></div>`;
    }
  }

  function clearStreamingTimer() {
    if (streamRenderTimer) {
      cancelAnimationFrame(streamRenderTimer);
      streamRenderTimer = null;
    }
  }

  function queueStreamingDelta(delta) {
    if (!delta) return;
    const wasEmpty = !pendingDelta && !streamedText;
    pendingDelta += delta;
    // First chunk: render immediately so the user sees output ASAP
    if (wasEmpty) { flushStreamingText(); return; }
    if (streamRenderTimer) return;
    streamRenderTimer = requestAnimationFrame(() => {
      streamRenderTimer = null;
      flushStreamingText();
    });
  }

  function flushStreamingText() {
    if (!pendingDelta) return;
    streamedText += pendingDelta;
    pendingDelta = '';
    renderStreamingText(streamedText);
  }

  // Icons
  const COPY_ICON = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
  </svg>`;

  const CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
  </svg>`;

  const ADD_ICON = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
  </svg>`;

  const LAMP_ICON = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" fill="currentColor"/>
  </svg>`;

  function renderResult(original, translation) {
    const body = getBody();
    if (!body) return;

    const copyText   = `${original}, ${translation}`;
    const addBtnHTML = settings.useDictionary
      ? `<button class="ai-tr-add-btn" title="${esc(dt('addToDict'))}" data-orig="${esc(original)}" data-tr="${esc(translation)}">${ADD_ICON}</button>`
      : '';
    const explainBtnHTML = `<button class="ai-tr-explain-btn" title="${esc(dt('explain'))}">${LAMP_ICON}</button>`;

    body.innerHTML = `
      <div class="ai-tr-row">
        <div class="ai-tr-result">${esc(translation)}</div>
        ${explainBtnHTML}
        ${addBtnHTML}
        <button class="ai-tr-copy-btn" title="${esc(dt('copy'))}" data-copy="${esc(copyText)}">
          ${COPY_ICON}
        </button>
      </div>
      <div class="ai-tr-explanation" id="ai-tr-explanation"></div>
    `;

    body.querySelector('.ai-tr-copy-btn').addEventListener('click', (e) => {
      const btn  = e.currentTarget;
      const text = btn.getAttribute('data-copy');
      navigator.clipboard.writeText(text).then(() => {
        btn.innerHTML = CHECK_ICON;
        btn.classList.add('copied');
        setTimeout(() => {
          if (btn) { btn.innerHTML = COPY_ICON; btn.classList.remove('copied'); }
        }, 1800);
      });
    });

    if (settings.useDictionary) {
      body.querySelector('.ai-tr-add-btn').addEventListener('click', (e) => {
        const btn  = e.currentTarget;
        const orig = btn.getAttribute('data-orig');
        const tr   = btn.getAttribute('data-tr');
        addToDictionary(orig, tr);
        btn.innerHTML = CHECK_ICON;
        btn.classList.add('added');
        setTimeout(() => {
          if (btn) { btn.innerHTML = ADD_ICON; btn.classList.remove('added'); }
        }, 1800);
      });
    }

    body.querySelector('.ai-tr-explain-btn').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const box = body.querySelector('#ai-tr-explanation');
      if (!box) return;
      // Toggle if already shown
      if (box.classList.contains('visible')) {
        box.classList.remove('visible');
        btn.classList.remove('active');
        return;
      }
      box.classList.add('visible');
      btn.classList.add('active');
      // If already has content — just show (cached render)
      if (box.dataset.loaded === '1') return;
      box.innerHTML = `<div class="ai-tr-explain-loading"><div class="ai-tr-spinner"></div><span>${esc(dt('explaining'))}</span></div>`;
      const requestId = `exp:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
      explainRequestId = requestId;
      chrome.runtime.sendMessage({
        type: 'explain',
        word: original,
        sentence: selectedSentence || original,
        interfaceLanguage: settings.interfaceLanguage,
        requestId,
      }, (response) => {
        if (requestId !== explainRequestId) return;
        if (!popup) return;
        const latestBox = body.querySelector('#ai-tr-explanation');
        if (!latestBox) return;
        if (response && response.success) {
          latestBox.innerHTML = formatExplanation(response.explanation);
          latestBox.dataset.loaded = '1';
        } else {
          latestBox.innerHTML = `<div class="ai-tr-error">${esc((response && response.message) || dt('explainFailed'))}</div>`;
        }
      });
    });
  }

  function renderError(message) {
    const body = getBody();
    if (!body) return;
    body.innerHTML = `<div class="ai-tr-error">${esc(message)}</div>`;
  }

  // ── Dictionary ───────────────────────────────────────────────────────────────
  function addToDictionary(original, translation) {
    chrome.storage.local.get('dictionary', ({ dictionary }) => {
      const dict = dictionary || [];
      if (!dict.find(e => e.original === original && e.translation === translation)) {
        dict.unshift({ original, translation, addedAt: Date.now() });
        chrome.storage.local.set({ dictionary: dict });
      }
      if (dictPanel) renderDictList(dict);
    });
  }

  function toggleDictPanel() {
    if (dictPanel) {
      closeDictPanel();
    } else {
      openDictPanel();
    }
  }

  function openDictPanel() {
    if (dictPanel) return;
    dictPanel = document.createElement('div');
    dictPanel.id = 'ai-tr-dict';

    // Resize handle — persistent, never overwritten by renderDictList
    const handle = document.createElement('div');
    handle.className = 'ai-tr-dict-handle';
    dictPanel.appendChild(handle);

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const startX     = e.clientX;
      const startWidth = dictPanel.offsetWidth;
      const onMove = (ev) => {
        const w = Math.max(180, Math.min(Math.floor(window.innerWidth / 2), startWidth + startX - ev.clientX));
        dictPanel.style.width = w + 'px';
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        chrome.storage.local.set({ dictPanelWidth: dictPanel.offsetWidth });
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // Content container — only this div gets replaced by renderDictList
    const content = document.createElement('div');
    content.className = 'ai-tr-dict-content';
    dictPanel.appendChild(content);

    document.body.appendChild(dictPanel);
    requestAnimationFrame(() => dictPanel && dictPanel.classList.add('visible'));

    chrome.storage.local.get(['dictionary', 'dictPanelWidth'], ({ dictionary, dictPanelWidth }) => {
      if (dictPanelWidth) dictPanel.style.width = dictPanelWidth + 'px';
      renderDictList(dictionary || []);
    });
  }

  function closeDictPanel() {
    if (!dictPanel) return;
    const panel = dictPanel;
    dictPanel = null;
    panel.classList.remove('visible');
    panel.addEventListener('transitionend', () => panel.remove(), { once: true });
  }

  // ── Dictionary export ────────────────────────────────────────────────────
  function downloadFile(fileContent, filename, mimeType) {
    const blob = new Blob([fileContent], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportDictAsCSV(entries) {
    const rows = [['Original', 'Translation'], ...entries.map(e => [e.original, e.translation])];
    const csv  = rows.map(r => r.map(c => '"' + c.replace(/"/g, '""') + '"').join(',')).join('\n');
    downloadFile('\uFEFF' + csv, 'dictionary.csv', 'text/csv;charset=utf-8');
  }

  function exportDictAsXLS(entries) {
    const escXML = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const rows   = [['Original', 'Translation'], ...entries.map(e => [e.original, e.translation])];
    const rowsXML = rows.map(r =>
      `<Row>${r.map(c => `<Cell><Data ss:Type="String">${escXML(c)}</Data></Cell>`).join('')}</Row>`
    ).join('');
    const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Dictionary"><Table>${rowsXML}</Table></Worksheet></Workbook>`;
    downloadFile(xml, 'dictionary.xls', 'application/vnd.ms-excel');
  }

  function renderDictList(entries) {
    const content = dictPanel && dictPanel.querySelector('.ai-tr-dict-content');
    if (!content) return;

    const exportBtnsHTML = entries.length > 0
      ? `<div class="ai-tr-dict-export">
           <button class="ai-tr-dict-exp-btn" data-fmt="csv">CSV</button>
           <button class="ai-tr-dict-exp-btn" data-fmt="xls">Excel</button>
         </div>`
      : '';

    const listHTML = entries.length === 0
      ? `<p class="ai-tr-dict-empty">${esc(dt('empty')).replace('\n', '<br>')}</p>`
      : entries.map((e, i) => `
          <div class="ai-tr-dict-entry">
            <div class="ai-tr-dict-words">
              <span class="ai-tr-dict-orig">${esc(e.original)}</span>
              <span class="ai-tr-dict-arr">→</span>
              <span class="ai-tr-dict-tr">${esc(e.translation)}</span>
            </div>
            <button class="ai-tr-dict-del" data-idx="${i}" title="${esc(dt('deleteEntry'))}">✕</button>
          </div>
        `).join('');

    const footerHTML = entries.length > 0
      ? `<div class="ai-tr-dict-footer"><button class="ai-tr-dict-clr">${esc(dt('clearAll'))}</button></div>`
      : '';

    content.innerHTML = `
      <div class="ai-tr-dict-header">
        <span class="ai-tr-dict-title">${esc(dt('title'))}</span>
        ${exportBtnsHTML}
        <button class="ai-tr-dict-close" title="${esc(dt('close'))}">✕</button>
      </div>
      <div class="ai-tr-dict-list">${listHTML}</div>
      ${footerHTML}
    `;

    content.querySelector('.ai-tr-dict-close').addEventListener('click', closeDictPanel);

    content.querySelectorAll('.ai-tr-dict-exp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.fmt === 'csv') exportDictAsCSV(entries);
        else exportDictAsXLS(entries);
      });
    });

    content.querySelectorAll('.ai-tr-dict-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = +btn.dataset.idx;
        chrome.storage.local.get('dictionary', ({ dictionary }) => {
          const dict = dictionary || [];
          dict.splice(idx, 1);
          chrome.storage.local.set({ dictionary: dict }, () => renderDictList(dict));
        });
      });
    });

    const clrBtn = content.querySelector('.ai-tr-dict-clr');
    if (clrBtn) {
      clrBtn.addEventListener('click', () => {
        chrome.storage.local.set({ dictionary: [] }, () => renderDictList([]));
      });
    }
  }

})();
