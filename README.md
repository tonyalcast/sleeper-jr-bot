# Sleeper Jr Bot

A **Manifest V3** browser extension for **Microsoft Edge**, built with [**WXT**](https://wxt.dev), **Vue 3**, and **Pinia**. It adds in-page utilities while you study on the web: a companion panel on **Coursera** course pages and a local tool to **inspect and remove PDF metadata**.

## Requirements

- **Node.js** (LTS recommended) and **npm**
- **Microsoft Edge** (the project defaults to this browser; Firefox build scripts are also available)

## Setup and development

```bash
git clone <your-repo-url>
cd sleeper-jr-bot
npm install
npm run dev
```

This produces the development output folder (for example `.output/edge-mv3`). In Edge, open `edge://extensions`, enable **Developer mode**, then **Load unpacked** and select the extension directory printed in the WXT console.

Other useful commands:

| Command | Description |
|--------|-------------|
| `npm run build` | Production build for Edge |
| `npm run build:firefox` | Production build for Firefox |
| `npm run compile` | Typecheck (`vue-tsc`) |
| `npm run zip` | Zip package for distribution (Edge) |

## How to use the extension

### Toolbar icon (popup)

Click the extension icon to open the **popup**:

- **Status (On / Paused):** Master switch. When paused, page automation does not run.
- **BoredClass (Coursera):** Turns the floating panel and related features on or off **on Coursera only** (when the extension is not paused).
- **FileCleaner:** Pick a PDF from your computer, review its document properties, and optionally download a **copy with metadata stripped** (the original file on disk is not modified).
- **Settings:** Opens the **options** page for your profile and more detail.

### Options page

From the popup (**Settings**) or from the extension’s details in Edge (**Extension options**):

1. **Sleeper profile**  
   - Display name.  
   - AI provider and **API key**: stored **only in the browser’s local storage** (`chrome.storage.local`). The extension uses that key for calls to the providers declared in the manifest.  
   - Click **Save** after changing name, provider, or key.

2. **Feature toggles**  
   - **Extension (master):** Same as **Paused** in the popup (inverted labeling).  
   - **BoredClass Sleeper:** Same as in the popup.

3. **FileCleaner**  
   Same tool as in the popup, with more room: choose a PDF, review the fields, then **Strip metadata & download** to save a cleaned copy. Processing happens **on your machine**; the PDF is not uploaded to any server.

### Using it on Coursera

With the extension **On** and **BoredClass** enabled, open a **Coursera course** page. A **floating panel** should appear with the companion features available in your build (for example course overview, a video list, or reading helpers).

**About AI:** If you add an API key, some features may offer **drafts or suggestions** from the model. **You are responsible** for what you submit, for following your institution’s policies, and for reviewing any text or deliverable before you rely on it officially.

### FileCleaner (PDF metadata)

Useful for **privacy and hygiene** before sharing a PDF: title, author, dates, keywords, typical **XMP** references on the catalog, and similar fields.

1. Click **Choose PDF…** and select a file.  
2. Review the detected properties.  
3. **Strip metadata & download** saves a new PDF (for example `name-metadata-stripped.pdf`).  
4. **Encrypted or password-protected** PDFs cannot be processed here until you unlock them with another tool.

Typical scope: the tool clears the standard **Info** dictionary and the catalog’s **XMP** reference. Other embedded data is not handled in this build.

### Feature status

On the options page, **Feature status** summarizes whether the master toggle is on, whether BoredClass is enabled, whether an API key is saved, plus an informational row for **FileCleaner** (local tool, no separate on/off toggle).

## Architecture (brief)

- **WXT** defines entrypoints (`popup`, `options`, `background`, content scripts).
- **Vue 3** + **Pinia** in the popup and options UI.
- **pdf-lib** reads and rewrites PDFs in **FileCleaner** (offline processing inside the extension page).
