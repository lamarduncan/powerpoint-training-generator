# PowerPoint Training Generator

Convert procedure PDFs into professional PowerPoint presentations with one click.

The app analyses the text inside a PDF, detects logical sections, and builds a clean widescreen `.pptx` file with title and bullet-point slides – perfect for corporate training or SOP overviews.

---

## ✨ Features
- **Drag-and-drop PDF upload** with real-time progress tracking  
- **Automatic content analysis** – detects headings & key points  
- **Instant PowerPoint generation** (wide 16:9 layout)  
- **REST API** for programmatic use  
- **Stateless / file-system storage** – no database required  
- **Cross-origin friendly** (CORS enabled)  
- **Clean modern UI** served from `public/`

---

## 🛠️ Technology Stack
| Layer                | Tech / Library                       |
|----------------------|--------------------------------------|
| Runtime              | Node.js ≥ 18                         |
| Web framework        | Express                              |
| File upload          | Multer                               |
| PDF text extraction  | `pdf-parse`                          |
| PowerPoint builder   | `pptxgenjs`                          |
| Utilities            | `fs-extra`, `uuid`, `sharp` (for placeholders) |
| Front-end            | Vanilla HTML/CSS/JS                  |

*(Optional integrations such as OpenAI GPT-4 or Unsplash API can be enabled in future versions.)*

---

## 📦 Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-org/powerpoint-training-generator.git
cd powerpoint-training-generator

# 2. Install dependencies
npm install

# 3. (Optional) create .env for API keys
cp .env.example .env
# OPENAI_API_KEY=...
# UNSPLASH_ACCESS_KEY=...

# 4. Run the server
node ppt-server.js     # default port 3002
```

Requires **Node.js 18+** (or 20+) and **npm**.

Docker and docker-compose files can be added later for container deployment.

---

## 🚀 Usage

1. Start the server (`node ppt-server.js`).
2. Open `http://localhost:3002` (or `/test-upload.html` for the minimalist tester).
3. Drag & drop a **PDF** or click **Select PDF File**.
4. Watch the progress bar – reading → analysing → slide creation → saving.
5. When complete, click **Download PowerPoint** to obtain `Training-Presentation.pptx`.

CLI / automation: use the REST endpoints below.

---

## 📡 API Endpoints

| Method | Endpoint                     | Description                              |
|--------|-----------------------------|------------------------------------------|
| GET    | `/test`                     | Health check – returns `{ status }`     |
| POST   | `/api/upload`               | Multipart upload (`pdfFile`) – returns `{ jobId }` |
| GET    | `/api/status/:jobId`        | Processing status `{ status, progress, message }` |
| GET    | `/api/download/:jobId`      | Download finished `.pptx` file           |

Status values: `processing`, `completed`, `failed`, `not_found`.

---

## 📂 Project Structure

```
.
├── ppt-server.js          # Main Express server (PowerPoint version)
├── public/                # Front-end assets
│   └── index.html         # Drag-drop UI
├── uploads/               # Temporary PDF uploads (git-ignored)
├── output/                # Generated PowerPoint files (git-ignored)
├── temp/                  # Scratch space (if used)
├── package.json
└── README.md
```

---

## 🌱 Future Enhancements (Version 2 Roadmap)

1. **AI-powered slide structuring** with GPT-4 (titles, bullets, speaker notes).  
2. **Image sourcing** – Unsplash/Stable Diffusion to embed relevant graphics.  
3. **Multiple slide templates & theming** (brand colours, logos, fonts).  
4. **Audio narration** – Google TTS per slide plus automatic timing.  
5. **Batch processing & queueing** for large training libraries.  
6. **Cloud deployment & serverless functions** (AWS Lambda / Azure Functions).  
7. **User accounts & persistence** – save generated decks, history, analytics.  
8. **Additional export formats** – PDF handouts, narrated MP4 video.  

Contributions and feedback on the roadmap are welcome!

---

## 🤝 Contributing

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feat/awesome-feature`)
3. **Commit** your changes with clear messages
4. **Push** to your fork and open a **Pull Request**
5. Follow the project’s coding style (ESLint / Prettier configuration coming soon)

Please open an **issue** first for major changes to discuss what you would like to add.

---

## 📝 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

Feel free to use, modify, and distribute – just provide attribution and contribute improvements back to the community!
