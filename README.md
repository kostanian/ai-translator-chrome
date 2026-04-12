> **Language / Язык:**&ensp; [![English](https://img.shields.io/badge/English-blue?style=for-the-badge)](#english) &ensp; [![Русский](https://img.shields.io/badge/Русский-red?style=for-the-badge)](#русский)

---

<a id="english"></a>

# AI Translator — Chrome Extension

**Translate any selected text on any webpage using AI.**
Pick your provider, bring your own API key, and get instant translations powered by OpenAI, Claude, Grok, or Gemini.

## Features

- **Select & Translate** — highlight text on any page and get an AI-powered translation in a popup
- **Streaming** — translation appears word-by-word in real time
- **4 AI Providers** — OpenAI (GPT-4o), Anthropic (Claude), xAI (Grok), Google (Gemini)
- **Model selection** — choose between fast and powerful models per provider
- **Per-provider API keys** — save a separate key for each provider, switch freely
- **Instant mode** — translate immediately on text selection (no button click needed)
- **Dictionary** — save words with the `+` button, export as CSV or Excel
- **Dictionary panel** — resizable side panel, opened via button or `Alt+Shift+S`
- **4 interface languages** — Russian, English, Spanish, Chinese
- **17 translation languages** — Arabic, Chinese, Czech, Dutch, English, French, German, Italian, Japanese, Korean, Polish, Portuguese, Russian, Spanish, Swedish, Turkish, Ukrainian
- **6 color themes** — Indigo, Blue, Teal, Rose, Amber, Slate
- **Hotkeys** — `Alt+Shift+T` toggle extension, `Alt+Shift+S` toggle dictionary, `Esc` close popup
- **Privacy** — no data collection, no third-party servers; API calls go directly to the provider you choose

## Installation

1. Download or clone this repository
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the project folder
5. Click the extension icon, choose a provider, enter your API key, and start translating

## Usage

1. **Select text** on any webpage
2. Click the translate button (or enable instant mode for automatic translation)
3. The translation appears in a popup — copy it or add to dictionary
4. Open the dictionary panel to review saved words, export to CSV/Excel

## Hotkeys

| Shortcut | Action |
|---|---|
| `Alt+Shift+T` | Enable / disable extension |
| `Alt+Shift+S` | Open / close dictionary |
| `Esc` | Close translation popup |

## Supported Models

| Provider | Models |
|---|---|
| OpenAI | GPT-4o mini (fast), GPT-4o (powerful) |
| Anthropic | Haiku (fast), Sonnet (powerful) |
| xAI | Grok 3 (fast), Grok 3 Fast (fastest) |
| Google | Gemini 2.0 Flash (fast), Gemini 2.5 Flash (powerful) |

## Project Structure

```
├── manifest.json     # Extension manifest (MV3)
├── background.js     # Service worker — API calls, caching, streaming
├── content.js        # Content script — selection detection, popup, dictionary panel
├── content.css       # Styles for on-page UI (popup, dictionary, button)
├── popup.html        # Extension popup markup
├── popup.js          # Popup logic — settings, i18n, key management
├── popup.css         # Popup styles
└── icons/            # Extension icons (16/48/128, on/off states)
```

## Privacy & Security

- **No data collection** — the extension does not send data anywhere except the AI provider you select
- **API keys stored locally** — saved in `chrome.storage.local`, never transmitted to third parties
- **No analytics, no tracking, no telemetry**
- **Open source** — review every line of code

## License

MIT

---

<a id="русский"></a>

# AI Translator — Расширение для Chrome

> [![English](https://img.shields.io/badge/English-blue?style=flat-square)](#english) &ensp; [![Русский](https://img.shields.io/badge/Русский-red?style=flat-square)](#русский)

**Переводите любой выделенный текст на любой веб-странице с помощью ИИ.**
Выберите провайдера, введите свой API-ключ и получайте мгновенные переводы от OpenAI, Claude, Grok или Gemini.

## Возможности

- **Выдели и переведи** — выделите текст на странице и получите ИИ-перевод во всплывающем окне
- **Стриминг** — перевод появляется пословно в реальном времени
- **4 ИИ-провайдера** — OpenAI (GPT-4o), Anthropic (Claude), xAI (Grok), Google (Gemini)
- **Выбор модели** — для каждого провайдера можно выбрать быструю или мощную модель
- **Отдельный ключ для каждого провайдера** — сохраняйте ключи независимо, переключайтесь свободно
- **Мгновенный режим** — перевод запускается сразу при выделении текста (без нажатия кнопки)
- **Словарь** — сохраняйте слова кнопкой `+`, экспортируйте в CSV или Excel
- **Панель словаря** — боковая панель с изменяемым размером, открывается кнопкой или `Alt+Shift+S`
- **4 языка интерфейса** — русский, английский, испанский, китайский
- **17 языков перевода** — арабский, китайский, чешский, нидерландский, английский, французский, немецкий, итальянский, японский, корейский, польский, португальский, русский, испанский, шведский, турецкий, украинский
- **6 цветовых тем** — Indigo, Blue, Teal, Rose, Amber, Slate
- **Горячие клавиши** — `Alt+Shift+T` вкл/выкл расширение, `Alt+Shift+S` словарь, `Esc` закрыть окно
- **Приватность** — никакого сбора данных, никаких сторонних серверов; запросы идут напрямую к выбранному провайдеру

## Установка

1. Скачайте или клонируйте этот репозиторий
2. Откройте `chrome://extensions/` в Chrome
3. Включите **Режим разработчика** (правый верхний угол)
4. Нажмите **Загрузить распакованное** и выберите папку проекта
5. Нажмите на иконку расширения, выберите провайдера, введите API-ключ и начинайте переводить

## Использование

1. **Выделите текст** на любой веб-странице
2. Нажмите кнопку перевода (или включите мгновенный режим)
3. Перевод появится во всплывающем окне — скопируйте или добавьте в словарь
4. Откройте панель словаря для просмотра сохранённых слов, экспорта в CSV/Excel

## Горячие клавиши

| Сочетание | Действие |
|---|---|
| `Alt+Shift+T` | Включить / выключить расширение |
| `Alt+Shift+S` | Открыть / закрыть словарь |
| `Esc` | Закрыть окно перевода |

## Поддерживаемые модели

| Провайдер | Модели |
|---|---|
| OpenAI | GPT-4o mini (быстрая), GPT-4o (мощная) |
| Anthropic | Haiku (быстрая), Sonnet (мощная) |
| xAI | Grok 3 (быстрая), Grok 3 Fast (самая быстрая) |
| Google | Gemini 2.0 Flash (быстрая), Gemini 2.5 Flash (мощная) |

## Структура проекта

```
├── manifest.json     # Манифест расширения (MV3)
├── background.js     # Service worker — API-запросы, кеширование, стриминг
├── content.js        # Контент-скрипт — определение выделения, попап, панель словаря
├── content.css       # Стили для UI на странице (попап, словарь, кнопка)
├── popup.html        # Разметка попапа расширения
├── popup.js          # Логика попапа — настройки, i18n, управление ключами
├── popup.css         # Стили попапа
└── icons/            # Иконки расширения (16/48/128, вкл/выкл)
```

## Приватность и безопасность

- **Никакого сбора данных** — расширение не отправляет данные никуда, кроме выбранного вами ИИ-провайдера
- **Ключи хранятся локально** — в `chrome.storage.local`, никогда не передаются третьим лицам
- **Нет аналитики, трекинга, телеметрии**
- **Открытый исходный код** — проверьте каждую строку

## Лицензия

MIT
