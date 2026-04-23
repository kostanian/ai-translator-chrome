// popup.js

// ── i18n ─────────────────────────────────────────────────────────────────────
const I18N = {
  ru: {
    enabled:       'Включено',
    disabled:      'Выключено',
    targetLang:    'Язык перевода',
    apiSource:     'API ключ',
    save:          'Сохранить',
    validate:      'Проверить',
    delete:        'Удалить',
    keyActive:     'Ключ сохранён',
    validating:    'Проверка ключа…',
    keyValid:      '✓ Ключ рабочий',
    keyInvalid:    '✗ Ключ недействителен',
    instant:       'Переводить сразу при выделении',
    instantTip:    'Перевод начинается сразу после отпускания мыши — кнопка перевода не появляется.',
    dictionary:    'Использовать словарь',
    openDict:      'Открыть',
    colorTheme:    'Тема оформления',
  },
  en: {
    enabled:       'Enabled',
    disabled:      'Disabled',
    targetLang:    'Translation language',
    apiSource:     'API key',
    save:          'Save',
    validate:      'Validate',
    delete:        'Delete',
    keyActive:     'Key saved',
    validating:    'Validating key…',
    keyValid:      '✓ Key is valid',
    keyInvalid:    '✗ Key is invalid',
    instant:       'Instant translation on selection',
    instantTip:    'Translation starts immediately when you release the mouse — the translate button does not appear.',
    dictionary:    'Use dictionary',
    openDict:      'Open',
    colorTheme:    'Color theme',
  },
  es: {
    enabled:       'Activado',
    disabled:      'Desactivado',
    targetLang:    'Idioma de traducción',
    apiSource:     'Clave API',
    save:          'Guardar',
    validate:      'Validar',
    delete:        'Eliminar',
    keyActive:     'Clave guardada',
    validating:    'Validando clave…',
    keyValid:      '✓ Clave válida',
    keyInvalid:    '✗ Clave inválida',
    instant:       'Traducción inmediata al seleccionar',
    instantTip:    'La traducción comienza al soltar el ratón — el botón de traducción no aparece.',
    dictionary:    'Usar diccionario',
    openDict:      'Abrir',
    colorTheme:    'Tema de color',
  },
  zh: {
    enabled:       '已启用',
    disabled:      '已禁用',
    targetLang:    '翻译语言',
    apiSource:     'API 密钥',
    save:          '保存',
    validate:      '验证',
    delete:        '删除',
    keyActive:     '密钥已保存',
    validating:    '正在验证密钥…',
    keyValid:      '✓ 密钥有效',
    keyInvalid:    '✗ 密钥无效',
    instant:       '选中即翻译',
    instantTip:    '松开鼠标后立即开始翻译——翻译按钮不会出现。',
    dictionary:    '使用词典',
    openDict:      '打开',
    colorTheme:    '颜色主题',
  },
};

// ── Languages ─────────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'ar', ru: 'Арабский',       en: 'Arabic',     es: 'Árabe',      zh: '阿拉伯语'  },
  { code: 'zh', ru: 'Китайский',      en: 'Chinese',    es: 'Chino',      zh: '中文'      },
  { code: 'cs', ru: 'Чешский',        en: 'Czech',      es: 'Checo',      zh: '捷克语'    },
  { code: 'nl', ru: 'Нидерландский',  en: 'Dutch',      es: 'Neerlandés', zh: '荷兰语'    },
  { code: 'en', ru: 'Английский',     en: 'English',    es: 'Inglés',     zh: '英语'      },
  { code: 'fr', ru: 'Французский',    en: 'French',     es: 'Francés',    zh: '法语'      },
  { code: 'de', ru: 'Немецкий',       en: 'German',     es: 'Alemán',     zh: '德语'      },
  { code: 'it', ru: 'Итальянский',    en: 'Italian',    es: 'Italiano',   zh: '意大利语'  },
  { code: 'ja', ru: 'Японский',       en: 'Japanese',   es: 'Japonés',    zh: '日语'      },
  { code: 'ko', ru: 'Корейский',      en: 'Korean',     es: 'Coreano',    zh: '韩语'      },
  { code: 'pl', ru: 'Польский',       en: 'Polish',     es: 'Polaco',     zh: '波兰语'    },
  { code: 'pt', ru: 'Португальский',  en: 'Portuguese', es: 'Portugués',  zh: '葡萄牙语'  },
  { code: 'ru', ru: 'Русский',        en: 'Russian',    es: 'Ruso',       zh: '俄语'      },
  { code: 'es', ru: 'Испанский',      en: 'Spanish',    es: 'Español',    zh: '西班牙语'  },
  { code: 'sv', ru: 'Шведский',       en: 'Swedish',    es: 'Sueco',      zh: '瑞典语'    },
  { code: 'tr', ru: 'Турецкий',       en: 'Turkish',    es: 'Turco',      zh: '土耳其语'  },
  { code: 'uk', ru: 'Украинский',     en: 'Ukrainian',  es: 'Ucraniano',  zh: '乌克兰语'  },
];

// ── Color themes ──────────────────────────────────────────────────────────────
const THEMES = [
  { id: 'indigo', a: '#6366f1', b: '#8b5cf6', dark: '#4f46e5', light: '#eef2ff' },
  { id: 'blue',   a: '#3b82f6', b: '#2563eb', dark: '#1d4ed8', light: '#eff6ff' },
  { id: 'teal',   a: '#14b8a6', b: '#0d9488', dark: '#0f766e', light: '#f0fdfa' },
  { id: 'rose',   a: '#f43f5e', b: '#e11d48', dark: '#be123c', light: '#fff1f2' },
  { id: 'amber',  a: '#f59e0b', b: '#d97706', dark: '#b45309', light: '#fffbeb' },
  { id: 'slate',  a: '#64748b', b: '#475569', dark: '#334155', light: '#f1f5f9' },
];

function applyPopupTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty('--accent',       theme.a);
  root.style.setProperty('--accent-b',     theme.b);
  root.style.setProperty('--accent-dark',  theme.dark);
  root.style.setProperty('--accent-light', theme.light);
}

// ── Models per provider ───────────────────────────────────────────────────────
const PROVIDER_MODELS = {
  openai:    [
    { id: 'gpt-4o-mini',  label: 'GPT-4o mini',  hint: 'fast' },
    { id: 'gpt-4o',       label: 'GPT-4o',        hint: 'powerful' },
  ],
  anthropic: [
    { id: 'claude-haiku-4-5-20251001', label: 'Haiku',  hint: 'fast' },
    { id: 'claude-sonnet-4-6',         label: 'Sonnet', hint: 'powerful' },
  ],
  grok: [
    { id: 'grok-3', label: 'Grok 3', hint: 'fast' },
  ],
  gemini: [
    { id: 'gemini-2.0-flash', label: 'Flash 2.0',  hint: 'fast' },
    { id: 'gemini-2.5-flash', label: 'Flash 2.5',  hint: 'powerful' },
  ],
};

const DEFAULT_SELECTED_MODELS = {
  openai:    'gpt-4o-mini',
  anthropic: 'claude-haiku-4-5-20251001',
  grok:      'grok-3',
  gemini:    'gemini-2.0-flash',
};

// ── Help i18n ─────────────────────────────────────────────────────────────────
const HELP_I18N = {
  ru: {
    title: 'Справка и руководство',
    sections: [
      { h: 'Горячие клавиши', items: [
        ['{T}', 'Включить / выключить расширение'],
        ['{S}', 'Открыть / закрыть словарь'],
        ['Esc', 'Закрыть окно перевода'],
      ]},
      { h: 'Параметры', items: [
        ['Переводить сразу', 'Перевод запускается при отпускании мыши — кнопка не появляется'],
        ['Использовать словарь', 'Включает «+» в окне перевода для сохранения слов'],
      ]},
      { h: 'Словарь', items: [
        ['Открыть', 'Кнопка «Открыть» или {S}'],
        ['Добавить слово', '«+» в окне перевода'],
        ['Экспорт', 'CSV / Excel в заголовке панели словаря'],
        ['Размер панели', 'Потяните за левый край'],
      ]},
      { h: 'API ключ и модели', items: [
        ['Провайдеры', 'OpenAI, Claude, Grok, Gemini — выберите вкладку'],
        ['Ключ', 'Сохраняется отдельно для каждого провайдера'],
        ['Модель', 'Для каждого провайдера можно выбрать модель (fast / powerful)'],
      ]},
    ],
  },
  en: {
    title: 'Help & Guide',
    sections: [
      { h: 'Hotkeys', items: [
        ['{T}', 'Enable / disable the extension'],
        ['{S}', 'Open / close the dictionary'],
        ['Esc', 'Close the translation popup'],
      ]},
      { h: 'Options', items: [
        ['Instant translation', 'Starts on mouse release — no translate button shown'],
        ['Use dictionary', 'Adds «+» in the translation popup to save words'],
      ]},
      { h: 'Dictionary', items: [
        ['Open', '«Open» button or {S}'],
        ['Add word', '«+» in the translation popup'],
        ['Export', 'CSV / Excel buttons in the dictionary header'],
        ['Resize panel', 'Drag the left edge of the panel'],
      ]},
      { h: 'API key & models', items: [
        ['Providers', 'OpenAI, Claude, Grok, Gemini — pick a tab'],
        ['Key', 'Saved separately for each provider'],
        ['Model', 'Choose a model per provider (fast / powerful)'],
      ]},
    ],
  },
  es: {
    title: 'Ayuda y guía',
    sections: [
      { h: 'Atajos de teclado', items: [
        ['{T}', 'Activar / desactivar la extensión'],
        ['{S}', 'Abrir / cerrar el diccionario'],
        ['Esc', 'Cerrar la ventana de traducción'],
      ]},
      { h: 'Opciones', items: [
        ['Traducción inmediata', 'Se inicia al soltar el ratón — sin botón de traducción'],
        ['Usar diccionario', 'Activa «+» en la ventana de traducción para guardar palabras'],
      ]},
      { h: 'Diccionario', items: [
        ['Abrir', 'Botón «Abrir» o {S}'],
        ['Agregar palabra', '«+» en la ventana de traducción'],
        ['Exportar', 'CSV / Excel en el encabezado del diccionario'],
        ['Cambiar tamaño', 'Arrastra el borde izquierdo del panel'],
      ]},
      { h: 'Clave API y modelos', items: [
        ['Proveedores', 'OpenAI, Claude, Grok, Gemini — elige una pestaña'],
        ['Clave', 'Se guarda por separado para cada proveedor'],
        ['Modelo', 'Elige un modelo por proveedor (fast / powerful)'],
      ]},
    ],
  },
  zh: {
    title: '帮助与指南',
    sections: [
      { h: '快捷键', items: [
        ['{T}', '启用 / 禁用扩展'],
        ['{S}', '打开 / 关闭词典'],
        ['Esc', '关闭翻译弹窗'],
      ]},
      { h: '选项', items: [
        ['选中即翻译', '松开鼠标后自动翻译，不显示翻译按钮'],
        ['使用词典', '在翻译弹窗中启用「+」按钮保存单词'],
      ]},
      { h: '词典', items: [
        ['打开', '「打开」按钮或 {S}'],
        ['添加单词', '翻译弹窗中的「+」'],
        ['导出', '词典标题栏中的 CSV / Excel 按钮'],
        ['调整大小', '拖动面板左边缘'],
      ]},
      { h: 'API 密钥与模型', items: [
        ['供应商', 'OpenAI、Claude、Grok、Gemini — 选择标签'],
        ['密钥', '每个供应商单独保存'],
        ['模型', '为每个供应商选择模型（fast / powerful）'],
      ]},
    ],
  },
};

// ── OS detection ─────────────────────────────────────────────────────────────
const IS_MAC = /Mac/.test(navigator.platform) || /Mac/.test(navigator.userAgent);

// Renders as: [⌥] [⇧] [T]  or  [Alt] [Shift] [T]
const HOTKEY_HTML = IS_MAC
  ? '<kbd>⌥</kbd><kbd>⇧</kbd><kbd>T</kbd>'
  : '<kbd>Alt</kbd><kbd>Shift</kbd><kbd>T</kbd>';

// Dictionary hotkey: Alt+Shift+S
const DICT_HOTKEY_HTML = IS_MAC
  ? '<kbd>⌥</kbd><kbd>⇧</kbd><kbd>S</kbd>'
  : '<kbd>Alt</kbd><kbd>Shift</kbd><kbd>S</kbd>';

// ── State ─────────────────────────────────────────────────────────────────────
const PROVIDER_LABELS = { openai: 'OpenAI', anthropic: 'Claude', grok: 'Grok', gemini: 'Gemini' };

let state = {
  enabled:           true,
  targetLanguage:    'ru',
  interfaceLanguage: 'ru',
  apiProvider:       'openai',
  apiKeys:           {},
  selectedModels:    { ...DEFAULT_SELECTED_MODELS },
  keyVisible:        false,
  instantTranslate:  false,
  useDictionary:     false,
  accentTheme:       'indigo',
};

// ── DOM refs ──────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const elToggle          = $('toggle-enabled');
const elLangSelect      = $('lang-select');
const elLblTargetLang   = $('lbl-target-lang');
const elLblApiSource    = $('lbl-api-source');
const elProviderTabs    = $('provider-tabs');
const elApiKeyInput     = $('api-key-input');
const elBtnToggleKey    = $('btn-toggle-key');
const elBtnSaveKey      = $('btn-save-key');
const elBtnValidateKey  = $('btn-validate-key');
const elBtnDeleteKey    = $('btn-delete-key');
const elKeyActive       = $('key-active');
const elKeyMasked       = $('key-masked');
const elLblKeyActive    = $('lbl-key-active');
const elValidateStatus  = $('validate-status');
const elInstantTipBubble = $('instant-tip-bubble');
const elChkInstant      = $('chk-instant');
const elChkDictionary   = $('chk-dictionary');
const elLblInstant      = $('lbl-instant');
const elLblDictionary   = $('lbl-dictionary');
const elDictControls    = $('dict-controls');
const elBtnDictOpen     = $('btn-dict-open');
const elDictHotkeyHint  = $('dict-hotkey-hint');
const elLblHelpTitle    = $('lbl-help-title');
const elHelpBody        = $('help-body');

// ── Boot ──────────────────────────────────────────────────────────────────────
chrome.storage.local.get(
  ['enabled', 'targetLanguage', 'interfaceLanguage', 'apiProvider', 'apiKey', 'apiKeys', 'selectedModels', 'instantTranslate', 'useDictionary', 'accentTheme'],
  (result) => {
    state.enabled           = result.enabled           !== undefined ? result.enabled : true;
    state.targetLanguage    = result.targetLanguage    || 'ru';
    state.interfaceLanguage = result.interfaceLanguage || 'ru';
    state.apiProvider       = result.apiProvider       || 'openai';
    state.apiKeys           = result.apiKeys           || {};
    state.selectedModels    = { ...DEFAULT_SELECTED_MODELS, ...(result.selectedModels || {}) };
    state.instantTranslate  = !!result.instantTranslate;
    state.useDictionary     = !!result.useDictionary;
    state.accentTheme = result.accentTheme || 'indigo';

    // Migrate legacy single apiKey → per-provider apiKeys
    if (result.apiKey && !Object.keys(state.apiKeys).length) {
      state.apiKeys[state.apiProvider] = result.apiKey;
      chrome.storage.local.set({ apiKeys: state.apiKeys });
      chrome.storage.local.remove('apiKey');
    }

    const bootTheme = THEMES.find(th => th.id === state.accentTheme) || THEMES[0];
    applyPopupTheme(bootTheme);

    renderAll();
  }
);

// ── i18n helper ───────────────────────────────────────────────────────────────
function t(key, ...args) {
  const lang = state.interfaceLanguage;
  const str  = I18N[lang]?.[key] ?? I18N.en[key] ?? key;
  return typeof str === 'function' ? str(...args) : str;
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderAll() {
  renderToggle();
  renderUILangFlags();
  renderLangSelect();
  renderLabels();
  renderOptions();
  renderColorPicker();
  renderProviderTabs();
  renderModelSelector();
  renderApiKeySection();
}

function renderToggle() {
  elToggle.checked = state.enabled;
}

function renderUILangFlags() {
  document.querySelectorAll('.flag-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.lang === state.interfaceLanguage)
  );
}

function renderLangSelect() {
  const il = state.interfaceLanguage;
  // Rebuild options only when needed (first call or lang change)
  elLangSelect.innerHTML = '';
  LANGUAGES.forEach(lang => {
    const opt = document.createElement('option');
    opt.value = lang.code;
    opt.textContent = lang[il] || lang.en;
    if (lang.code === state.targetLanguage) opt.selected = true;
    elLangSelect.appendChild(opt);
  });
}

function renderLabels() {
  elLblTargetLang.textContent  = t('targetLang');
  elLblApiSource.textContent   = t('apiSource');
  elBtnSaveKey.textContent     = t('save');
  elBtnValidateKey.textContent = t('validate');
  elBtnDeleteKey.textContent   = t('delete');
  elLblKeyActive.textContent   = t('keyActive');
  document.getElementById('hotkey-hint').innerHTML = HOTKEY_HTML;
  elLblInstant.textContent         = t('instant');
  elInstantTipBubble.textContent   = t('instantTip');
  elLblDictionary.textContent = t('dictionary');
  elBtnDictOpen.textContent   = t('openDict');
  elDictHotkeyHint.innerHTML  = DICT_HOTKEY_HTML;
  renderToggle();
  renderHelp();
}

function renderHelp() {
  const lang = state.interfaceLanguage;
  const h    = HELP_I18N[lang] || HELP_I18N.en;
  const hkT  = IS_MAC ? '⌥⇧T' : 'Alt+Shift+T';
  const hkS  = IS_MAC ? '⌥⇧S' : 'Alt+Shift+S';
  const fmt  = s => s.replace('{T}', `<kbd>${hkT}</kbd>`).replace('{S}', `<kbd>${hkS}</kbd>`);

  elLblHelpTitle.textContent = h.title;

  elHelpBody.innerHTML = h.sections.map(sec => `
    <div class="help-group">
      <div class="help-group-title">${sec.h}</div>
      ${sec.items.map(([k, v]) => `
        <div class="help-item">
          <span class="help-key">${fmt(k)}</span>
          <span class="help-val">${fmt(v)}</span>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function renderOptions() {
  elChkInstant.checked    = state.instantTranslate;
  elChkDictionary.checked = state.useDictionary;
  elDictControls.classList.toggle('visible', state.useDictionary);
}

function renderColorPicker() {
  const container = document.getElementById('color-swatches');
  if (!container) return;
  const lbl = document.getElementById('lbl-color-theme');
  if (lbl) lbl.textContent = t('colorTheme');
  container.innerHTML = THEMES.map(th => `
    <button class="color-swatch${th.id === state.accentTheme ? ' active' : ''}"
            data-theme="${th.id}"
            style="background: linear-gradient(135deg, ${th.a}, ${th.b})"
            title="${th.id}">
    </button>
  `).join('');
  container.querySelectorAll('.color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = THEMES.find(th => th.id === btn.dataset.theme);
      if (!theme) return;
      state.accentTheme = theme.id;
      chrome.storage.local.set({ accentTheme: theme.id });
      applyPopupTheme(theme);
      container.querySelectorAll('.color-swatch').forEach(b =>
        b.classList.toggle('active', b === btn)
      );
    });
  });
}

function renderProviderTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.provider === state.apiProvider)
  );
}

function renderModelSelector() {
  const container = document.getElementById('model-selector');
  if (!container) return;
  const models  = PROVIDER_MODELS[state.apiProvider] || [];
  const current = state.selectedModels[state.apiProvider] || models[0]?.id;

  container.innerHTML = '';
  models.forEach(m => {
    const btn = document.createElement('button');
    btn.className = 'model-btn' + (m.id === current ? ' active' : '');
    btn.innerHTML = `<span class="model-name">${m.label}</span><span class="model-hint">${m.hint}</span>`;
    btn.addEventListener('click', () => {
      state.selectedModels[state.apiProvider] = m.id;
      chrome.storage.local.set({ selectedModels: state.selectedModels });
      renderModelSelector();
    });
    container.appendChild(btn);
  });
}

function currentApiKey() {
  return (state.apiKeys[state.apiProvider] || '').trim();
}

function renderApiKeySection() {
  const k = currentApiKey();
  const hasKey = !!k;

  if (hasKey) {
    elKeyActive.style.display = 'flex';
    const providerName = PROVIDER_LABELS[state.apiProvider] || state.apiProvider;
    elLblKeyActive.textContent = `${providerName} — ${t('keyActive')}`;
    elKeyMasked.textContent = k.length > 10
      ? k.slice(0, 4) + '••••••••' + k.slice(-4)
      : '••••••••••••';
    elBtnDeleteKey.style.display = 'inline-flex';
    elApiKeyInput.value = '';
  } else {
    elKeyActive.style.display = 'none';
    elBtnDeleteKey.style.display = 'none';
  }

  // Show summary of all saved keys across providers
  renderKeysSummary();
  clearValidateStatus();
}

function renderKeysSummary() {
  let container = document.getElementById('keys-summary');
  if (!container) {
    container = document.createElement('div');
    container.id = 'keys-summary';
    container.className = 'keys-summary';
    elKeyActive.parentElement.insertBefore(container, elKeyActive.nextSibling);
  }
  const saved = Object.entries(state.apiKeys).filter(([, v]) => v && v.trim());
  if (saved.length === 0) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }
  container.style.display = 'flex';
  container.innerHTML = saved.map(([prov, key]) => {
    const name = PROVIDER_LABELS[prov] || prov;
    const masked = key.length > 8
      ? key.slice(0, 3) + '…' + key.slice(-3)
      : '••••••';
    const isActive = prov === state.apiProvider;
    return `<span class="key-badge${isActive ? ' active' : ''}" title="${name}: ${masked}">${name} ✓</span>`;
  }).join('');
}

function clearValidateStatus() {
  elValidateStatus.className   = 'validate-status';
  elValidateStatus.textContent = '';
  elValidateStatus.style.display = 'none';
}

function showValidateStatus(text, type) { // type: 'ok' | 'err' | 'spin'
  elValidateStatus.textContent   = text;
  elValidateStatus.className     = `validate-status ${type}`;
  elValidateStatus.style.display = 'block';
}

// ── Sync toggle when changed externally (hotkey) ──────────────────────────────
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled !== undefined) {
    state.enabled = changes.enabled.newValue;
    renderToggle();
  }
});

// ── Events ────────────────────────────────────────────────────────────────────

// Toggle enabled
elToggle.addEventListener('change', () => {
  state.enabled = elToggle.checked;
  chrome.storage.local.set({ enabled: state.enabled });
  renderToggle();
});

// UI language flags
document.getElementById('ui-lang-flags').addEventListener('click', (e) => {
  const btn = e.target.closest('.flag-btn');
  if (!btn) return;
  state.interfaceLanguage = btn.dataset.lang;
  chrome.storage.local.set({ interfaceLanguage: state.interfaceLanguage });
  renderAll();
});

// Language dropdown
elLangSelect.addEventListener('change', () => {
  state.targetLanguage = elLangSelect.value;
  chrome.storage.local.set({ targetLanguage: state.targetLanguage });
});

// Provider tabs
elProviderTabs.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  state.apiProvider = btn.dataset.provider;
  chrome.storage.local.set({ apiProvider: state.apiProvider });
  renderProviderTabs();
  renderModelSelector();
  renderApiKeySection();
});

// Show / hide key
elBtnToggleKey.addEventListener('click', () => {
  state.keyVisible = !state.keyVisible;
  elApiKeyInput.type = state.keyVisible ? 'text' : 'password';
  const icon = document.getElementById('eye-icon');
  if (state.keyVisible) {
    icon.innerHTML = `<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/>`;
  } else {
    icon.innerHTML = `<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 100 6 3 3 0 000-6z" fill="currentColor"/>`;
  }
});

// Save key
elBtnSaveKey.addEventListener('click', () => {
  const key = elApiKeyInput.value.trim();
  if (!key) return;
  state.apiKeys[state.apiProvider] = key;
  chrome.storage.local.set({ apiKeys: state.apiKeys }, () => renderApiKeySection());
});

elApiKeyInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') elBtnSaveKey.click();
});

// Validate key
elBtnValidateKey.addEventListener('click', async () => {
  const key = (elApiKeyInput.value.trim() || currentApiKey()).trim();
  if (!key) {
    showValidateStatus('← Enter a key first', 'err');
    return;
  }

  elBtnValidateKey.disabled = true;
  showValidateStatus(t('validating'), 'spin');

  chrome.runtime.sendMessage(
    { type: 'validateKey', provider: state.apiProvider, apiKey: key },
    (response) => {
      elBtnValidateKey.disabled = false;
      if (response && response.valid) {
        showValidateStatus(t('keyValid'), 'ok');
      } else {
        const msg = response?.message
          ? `${t('keyInvalid')}: ${response.message}`
          : t('keyInvalid');
        showValidateStatus(msg, 'err');
      }
    }
  );
});

// Delete key
elBtnDeleteKey.addEventListener('click', () => {
  delete state.apiKeys[state.apiProvider];
  chrome.storage.local.set({ apiKeys: state.apiKeys }, () => renderApiKeySection());
});

// Instant translate toggle
elChkInstant.addEventListener('change', () => {
  state.instantTranslate = elChkInstant.checked;
  chrome.storage.local.set({ instantTranslate: state.instantTranslate });
});

// Dictionary toggle
elChkDictionary.addEventListener('change', () => {
  state.useDictionary = elChkDictionary.checked;
  chrome.storage.local.set({ useDictionary: state.useDictionary });
  renderOptions();
});

// Open dictionary panel button — with content-script injection fallback
function sendToActiveTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab || !tab.id) return;
    // Skip chrome://, chrome-extension://, edge://, about:, view-source: — content scripts are not allowed there
    if (tab.url && /^(chrome|edge|about|view-source|chrome-extension|devtools):/i.test(tab.url)) {
      showValidateStatus('Open a regular web page first', 'err');
      setTimeout(clearValidateStatus, 2500);
      return;
    }
    chrome.tabs.sendMessage(tab.id, message, () => {
      const err = chrome.runtime.lastError;
      if (err && /does not exist|no tab/i.test(err.message || '')) {
        chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['content.css'] }).catch(() => {});
        chrome.scripting.executeScript(
          { target: { tabId: tab.id }, files: ['content.js'] },
          () => {
            if (chrome.runtime.lastError) return;
            setTimeout(() => chrome.tabs.sendMessage(tab.id, message, () => void chrome.runtime.lastError), 100);
          }
        );
      }
    });
  });
}

elBtnDictOpen.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  sendToActiveTab({ type: 'toggleDictionary' });
});
