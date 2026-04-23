# Packaging for Chrome Web Store

## What must be in the ZIP

Only the files the extension needs at runtime. Exclude docs, screenshots used for the README, and dotfiles.

**Include:**
- `manifest.json`
- `background.js`
- `content.js`
- `content.css`
- `popup.html`
- `popup.js`
- `popup.css`
- `icons/icon16.png`, `icon48.png`, `icon128.png` (and the `_off` variants used for the toolbar icon when the extension is disabled)

**Exclude:**
- `README.md`, `PRIVACY.md`, `STORE_LISTING.md`, `PACKAGING.md`
- `screenshot.png` and `icons/select_*.png` (README/walkthrough screenshots — not used by the extension)
- `.git/`, `.DS_Store`, any editor/IDE config

## Build the ZIP (macOS / Linux)

Run from the project root:

```sh
rm -f ai-translator-chrome-v1.0.0.zip
zip -r ai-translator-chrome-v1.0.0.zip \
  manifest.json \
  background.js \
  content.js \
  content.css \
  popup.html \
  popup.js \
  popup.css \
  icons/icon16.png \
  icons/icon16_off.png \
  icons/icon48.png \
  icons/icon48_off.png \
  icons/icon128.png \
  icons/icon128_off.png
```

Verify the archive:

```sh
unzip -l ai-translator-chrome-v1.0.0.zip
```

There should be exactly 13 entries, nothing else.

## Store assets you still need to prepare manually

Chrome Web Store requires visual assets that you upload in the dashboard (not part of the ZIP):

- **Store icon** — 128×128 PNG → reuse `icons/icon128.png`
- **Screenshots** — at least 1, up to 5, either **1280×800** or **640×400** PNG/JPEG
  - Recommended set: the 5 walkthrough screenshots from `icons/select_1.png` … `select_5.png` resized/padded to 1280×800
- **Small promo tile** — 440×280 PNG (optional but recommended for discovery)
- **Marquee promo tile** — 1400×560 PNG (optional, for featured placements)

## Upload flow

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Click **Add new item** → upload `ai-translator-chrome-v1.0.0.zip`.
3. Fill the listing form using the copy from `STORE_LISTING.md`.
4. Upload the visual assets (screenshots + promo tiles).
5. Paste the privacy policy URL and permission justifications from `STORE_LISTING.md`.
6. Submit for review. Initial review typically takes a few business days.

## Versioning for updates

After any change, bump `version` in `manifest.json` (e.g. `1.0.0` → `1.0.1`), rebuild the ZIP with a matching filename, and upload via **Package → Upload new package** in the dashboard.
