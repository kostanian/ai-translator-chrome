# Privacy Policy — AI Translator

**Last updated:** April 23, 2026

> **In short:** AI Translator does not collect or transmit your data. Your API keys stay locally in your browser. Text you translate goes directly to the AI provider you chose.

---

## 1. Who we are

AI Translator is a Chrome extension that translates selected text and explains word grammar in sentence context via AI providers (OpenAI, Anthropic, xAI or Google) of your choice, using your own key. The extension is developed as an open-source project.

## 2. What we DO NOT do

The extension does none of the following:

- No personal data collection or transmission to the extension author or any third party
- No analytics, telemetry, or behavioral tracking of any kind
- No server of our own — we do not process your requests
- No selling of data, no advertising, no fingerprinting

## 3. What the extension handles

All data either stays locally in your browser or goes directly to the AI provider you selected:

- **API keys** (OpenAI / Anthropic / xAI / Google) — stored in `chrome.storage.local` on your device, used only to authenticate requests to the provider you selected.
- **Selected text** — when you click *Translate* or *Explain*, sent over HTTPS directly from your browser to the AI provider. Cached locally up to 20 minutes to avoid repeat calls.
- **Dictionary** — words you save with the `+` button are stored in `chrome.storage.local`. You can delete them or export to CSV/Excel at any time.
- **Preferences** — interface language, theme, selected model — all local, never synced.

## 4. Third-party AI providers

Translation and explanation requests go to the provider you configured. Their processing is governed by their privacy policies:

- **OpenAI** — https://api.openai.com ([privacy policy](https://openai.com/policies/privacy-policy))
- **Anthropic (Claude)** — https://api.anthropic.com ([privacy policy](https://www.anthropic.com/legal/privacy))
- **xAI (Grok)** — https://api.x.ai ([privacy policy](https://x.ai/legal/privacy-policy))
- **Google (Gemini)** — https://generativelanguage.googleapis.com ([privacy policy](https://policies.google.com/privacy))

## 5. Chrome permissions

The extension requests only the minimum permissions it needs:

- **`storage`** — store your keys, dictionary and preferences locally
- **`activeTab`** — operate on the tab you are currently viewing
- **`scripting`** — on-demand inject the content script on tabs opened before the extension was installed
- **`tabs`** — send UI commands (open dictionary, translate) from the popup to the active tab's content script
- **`host_permissions`** — limited to the four AI provider API endpoints. The extension never contacts any other origin.

## 6. Your control

- Delete any saved API key from the extension popup at any time
- Clear the dictionary from the dictionary side panel
- Uninstalling the extension removes all local data
- Full source code on GitHub — inspect every line
- The Chrome Web Store public release is in development. For now, install manually via developer mode

## 7. Changes

Any change to this policy is reflected in the **Last updated** date above and committed to the public GitHub repository at https://github.com/kostanian/ai-translator-chrome.

## 8. Contact

Questions: [kostanian.ag@gmail.com](mailto:kostanian.ag@gmail.com)
Issue tracker: https://github.com/kostanian/ai-translator-chrome/issues

---

This page is also available as a web version with language switching (ru / en / es / zh):
https://kostanian.github.io/ai-translator-website/privacy-policy.html
