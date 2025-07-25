# PowerPoint Training Generator **v2**

AI-assisted PDF → PowerPoint pipeline with on-the-fly image sourcing  
Version 2 adds machine-intelligence to the solid v1 foundation, delivering smarter slides and richer visuals with minimal developer effort.

---

## 1. What’s New in v2 🎉
| Category | v1 | **v2 (this branch)** |
|----------|----|----------------------|
| Slide structuring | Heuristic line-based parsing | **GPT-4 powered** – clarity, tone, concision |
| Speaker notes | Basic templated text | AI-generated guidance per slide |
| Bullet phrasing | Truncated source sentences | Re-written, concise, professional |
| Images | None / manual | **Unsplash API integration** – context-matched royalty-free photos |
| Styling | Simple bullets | Modern typography, colour palette, optional branding |
| Config | No `.env` required | **API-key driven** – OpenAI & Unsplash |
| Code | `ppt-server.js` | `ppt-server-v2.js` with modular service layer |

---

## 2. High-Level Architecture

```
PDF → pdf-parse ──► Raw text
            │
            ▼
AI Analysis Service (OpenAI GPT-4)
            │  JSON slide spec
            ▼
Image Service (Unsplash)
            │  URLs
            ▼
Slide Builder (pptxgenjs)
            │  .pptx
            ▼
Express REST API  ──► download
```

*   **AI Analysis Service**  
    Sends first 3 000 characters of document to GPT-4 with a structured prompt.  
    Receives an array of slide descriptors `{ title, bullets[], speakerNotes, keywords[] }`.

*   **Image Service**  
    Searches Unsplash with `keywords.join(" ")` and returns the first landscape photo URL.

*   **Slide Builder**  
    Combines text + image into widescreen slides (16:9) with speaker notes.

---

## 3. Prerequisites & API Keys

| Variable | Purpose | Where to get it |
|----------|---------|-----------------|
| `OPENAI_API_KEY` | GPT-4 completion for content analysis | https://platform.openai.com/account/api-keys |
| `UNSPLASH_ACCESS_KEY` | Photo search & licensing | https://unsplash.com/developers |

Copy `.env.example` → `.env` and fill in real keys:

```
PORT=3002
OPENAI_API_KEY=sk-...
UNSPLASH_ACCESS_KEY=abc123...
```

> Demo mode: set `DEMO_MODE=true` to disable external calls (placeholders only).

---

## 4. Installation

```bash
git clone https://github.com/lamarduncan/powerpoint-training-generator.git
cd powerpoint-training-generator
git checkout v2-enhanced-features   # this branch
npm install
cp .env.example .env                # add keys
node ppt-server-v2.js               # or `npm run dev`
```

Requires **Node.js 18+** (20+ recommended).

---

## 5. Usage

1. Open `http://localhost:3002` (or `/public/index-v2.html`).
2. Drag-drop a PDF.  
3. Watch progress: *read → analyse → fetch images → build*.
4. Click **Download Enhanced Presentation**.

### REST Endpoints

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| GET | `/test` | – | Health + feature flags |
| POST | `/api/upload` | `pdfFile` (multipart) | Start job, returns `{ jobId }` |
| GET | `/api/status/:jobId` | – | Progress `{ status, progress, message }` |
| GET | `/api/download/:jobId` | – | `.pptx` file once complete |

---

## 6. Example Output

Slide 1 (AI-generated):

- Title: **“Supply Chain Integrity Overview”**  
- Bullets:  
  • Supplier qualification process  
  • Non-GMO verification checkpoints  
  • Traceability documentation flow  
- Image: High-resolution warehouse photo from Unsplash  
- Speaker notes: *“Introduce the end-to-end integrity workflow and emphasise risk mitigation.”*

Result: 16:9 deck, ~1 MB, ready for live training or LMS upload.

---

## 7. Development Roadmap

*Short term*
1. **Template selector** (corporate / minimal / dark)
2. **Brand injection** (logo & colour variables)
3. **Batch upload endpoint** – queue worker
4. **Unit tests** (Jest) for service modules

*Long term*
5. Voice-over generation (Google TTS) → auto-timed video export  
6. Cloud deployment module (AWS Lambda & S3)  
7. Collaborative web editor with slide preview  
8. Plug-in system for alternative AI models / image providers

Issues & PRs welcome!

---

## 8. Contributing

1. `git checkout -b feat/my-awesome-feature`
2. Follow ESLint/Prettier config (`npm run lint`)
3. Add tests where reasonable
4. Submit PR against `v2-enhanced-features`

Please discuss big ideas in an issue first.

---

## 9. License

MIT © 2025 – PowerPoint Training Generator
