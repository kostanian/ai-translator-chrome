# Privacy Policy — AI Translator

**Last updated:** 2026-04-23

## Summary

AI Translator does **not** collect, store, sell, or transmit any personal data to the extension author or any third party. Everything you type, translate, or save stays either on your local device or is sent directly to the AI provider *you* choose and authenticate with.

## What the extension handles

| Data | Where it goes | How it is stored |
|---|---|---|
| API keys you enter (OpenAI / Anthropic / xAI / Google) | Stays on your device in `chrome.storage.local`. Used only to authenticate requests to the provider you selected. | Local browser storage. Never synced, never uploaded to any server of ours. |
| Text you select on webpages (for translation or explanation) | Sent as the request body to the AI provider you chose (OpenAI / Anthropic / xAI / Google). | Held in memory for the duration of the request. Cached locally for up to 20 minutes to avoid repeat calls. |
| Dictionary entries (words you save) | Stored locally in `chrome.storage.local`. | Never synced, never uploaded. You can export them as CSV/Excel and delete them at any time. |
| Preferences (interface language, theme, selected model) | Stored locally in `chrome.storage.local`. | Local only. |

## What the extension does NOT do

- No analytics, telemetry, crash reporting, or usage tracking of any kind.
- No advertising, no fingerprinting, no behavioral profiling.
- No third-party servers operated by the extension author.
- No selling or sharing of data with anyone.
- No keystroke logging beyond what the user explicitly selects and sends to translate.

## Third-party AI providers

When you click *Translate* or *Explain*, the selected text, the target language, and (for Explain) the surrounding sentence are sent over HTTPS directly from your browser to the provider you configured:

- **OpenAI** — https://api.openai.com ([privacy policy](https://openai.com/policies/privacy-policy))
- **Anthropic (Claude)** — https://api.anthropic.com ([privacy policy](https://www.anthropic.com/legal/privacy))
- **xAI (Grok)** — https://api.x.ai ([privacy policy](https://x.ai/legal/privacy-policy))
- **Google (Gemini)** — https://generativelanguage.googleapis.com ([privacy policy](https://policies.google.com/privacy))

These providers process your request under their own privacy terms. We have no visibility into or control over their handling of the data.

## Permissions justification

- **`storage`** — save your API keys, dictionary, and preferences locally.
- **`activeTab`** — run the translation popup on the tab you are currently viewing.
- **`scripting`** — inject the content script on demand when you open the dictionary from the popup and the script has not been loaded yet (e.g. on tabs opened before the extension was installed).
- **`tabs`** — find the active tab in order to send it the "open dictionary" / "translate" message from the popup.
- **`host_permissions`** — limited to the four AI provider API endpoints listed above. No access to any other website.

## Your control

- You can delete any saved API key from the extension popup at any time.
- You can clear your dictionary from the dictionary panel at any time.
- You can uninstall the extension; all local data is removed with it.

## Changes

Any change to this policy will be committed to the public GitHub repository at https://github.com/kostanian/ai-translator-chrome and reflected in the file timestamp above.

## Contact

Issues and questions: https://github.com/kostanian/ai-translator-chrome/issues
