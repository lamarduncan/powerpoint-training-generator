const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const PptxGenJS = require("pptxgenjs"); const OpenAI = require("openai"); const fetch = require("node-fetch"); require("dotenv").config();

const app = express();
const PORT = 3002; let openai = null; if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_openai_api_key_here") { openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); console.log("?? OpenAI GPT-4 enabled"); } else { console.log("?? OpenAI not configured"); } const hasUnsplash = process.env.UNSPLASH_ACCESS_KEY && process.env.UNSPLASH_ACCESS_KEY !== "your_unsplash_access_key_here"; if (hasUnsplash) { console.log("??? Unsplash enabled"); }

const outputDir = './output';
const uploadsDir = './uploads';
fs.ensureDirSync(outputDir);
fs.ensureDirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, uuidv4() + '.pdf')
});
const upload = multer({ storage });

const jobStatus = {};

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.static('public'));

app.get('/test', (req, res) => {
  res.json({ status: 'PowerPoint Training Generator is running!' });
});

app.post('/api/upload', upload.single('pdfFile'), async (req, res) => {
  const jobId = path.basename(req.file.filename, '.pdf');
  jobStatus[jobId] = { status: 'processing', progress: 0 };
  
  console.log('?? Starting PowerPoint generation:', jobId);
  
  generatePowerPoint(jobId, req.file.path)
    .then(() => {
      jobStatus[jobId] = { status: 'completed', progress: 100 };
      console.log('? PowerPoint completed:', jobId);
    })
    .catch(err => {
      console.error('? PowerPoint failed:', err.message);
      jobStatus[jobId] = { status: 'failed', error: err.message };
    });
  
  res.json({ jobId, message: 'PowerPoint generation started' });
});

app.get('/api/status/:jobId', (req, res) => {
  const status = jobStatus[req.params.jobId] || { status: 'not_found' };
  res.json(status);
});

app.get('/api/download/:jobId', (req, res) => {
  const filePath = path.join(outputDir, req.params.jobId + '.pptx');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'Training-Presentation.pptx');
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

async function generatePowerPoint(jobId, pdfPath) {
  updateStatus(jobId, 10, 'Reading PDF...');
  
  const pdfBuffer = await fs.readFile(pdfPath);
  const pdfData = await pdfParse(pdfBuffer);
  const text = pdfData.text || "No text found"; let sections = []; let aiAnalysisWorked = false;
  
  updateStatus(jobId, 30, "Analyzing content..."); if (openai && text.length > 100) { try { updateStatus(jobId, 35, "AI analyzing content structure..."); const analysisResponse = await openai.chat.completions.create({ model: "gpt-4", messages: [{ role: "system", content: "You are an expert training content designer. Create clear, professional slide content from training documents." }, { role: "user", content: `Analyze this training document and create presentation slides. Create exactly 1-3 concise bullet points per section. Each bullet should be under 60 characters, capture essential ideas, and be complete thoughts without truncation. Document text: "${text.substring(0, 2000)}" Respond with JSON: [{"title": "Clear Title", "bullets": ["Concise point", "Key concept"], "speakerNotes": "Brief guidance", "keywords": ["search", "terms"]}]` }], temperature: 0.3, max_tokens: 1000 }); sections = JSON.parse(analysisResponse.choices[0].message.content).slice(0, 8); aiAnalysisWorked = true; console.log("?? AI created", sections.length, "enhanced sections"); } catch (error) { console.log("?? AI failed, using basic analysis:", error.message); } } else { console.log("?? Using basic content analysis"); }
  
  console.log('?? Extracted text length:', text.length);
  
  if (!aiAnalysisWorked) { console.log("?? Using fallback basic content analysis"); // Better content analysis
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, 50); // First 50 non-empty lines
  
  // Group lines into sections
  const sections = [];
  let currentSection = { title: 'Overview', bullets: [] };
  
  for (const line of lines) {
    // Check if line is likely a heading (short, no periods, not all caps)
    if (line.length < 60 && 
        line.split(' ').length < 10 && 
        !line.endsWith('.') && 
        line !== line.toUpperCase() &&
        line.length > 3) {
      
      // Save previous section if it has content
      if (currentSection.bullets.length > 0) {
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = { 
        title: line, 
        bullets: [] 
      };
    } else if (line.length > 10 && line.length < 150) {
      // Add as bullet point (clean up the text)  
      let bullet = line;
      if (bullet.length > 80) {
        bullet = bullet.length > 70 ? bullet.substring(0, bullet.lastIndexOf(" ", 70)) || bullet.substring(0, 60) : bullet;
      }
      currentSection.bullets.push(bullet);
    }
    
    // Limit bullets per section
    if (currentSection.bullets.length >= 6) {
      sections.push(currentSection);
      currentSection = { title: 'Additional Information', bullets: [] };
    }
  }
  
  // Add final section
  if (currentSection.bullets.length > 0) {
    sections.push(currentSection);
  }
  
  // Ensure we have at least some content
  if (sections.length === 0) {
    sections.push({
      title: 'Document Summary',
      bullets: [
        'This document contains important procedure information',
        'Please refer to the original PDF for complete details',
        'Training materials have been automatically generated',
        'Contact your supervisor for additional guidance'
      ]
    });
  }
  
  } updateStatus(jobId, 60, "Creating slides...");
  
  console.log('?? Creating', sections.length, 'sections');
  
  // Create PowerPoint
  let pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  
  // Title slide
  let titleSlide = pptx.addSlide();
  titleSlide.addText('Training Presentation', {
    x: 1, y: 2, w: 8, h: 1.5,
    fontSize: 44, 
    bold: true, 
    color: '004080', 
    align: 'center',
    fontFace: 'Arial'
  });
  
  titleSlide.addText('Generated from PDF Document', {
    x: 1, y: 4, w: 8, h: 1,
    fontSize: 20, 
    color: '666666', 
    align: 'center',
    fontFace: 'Arial'
  });
  
  // Date
  titleSlide.addText(new Date().toLocaleDateString(), {
    x: 1, y: 5.5, w: 8, h: 0.5,
    fontSize: 14, 
    color: '888888', 
    align: 'center',
    fontFace: 'Arial'
  });
  
  // Content slides (limit to 8 slides)
  for (let i = 0; i < Math.min(sections.length, 8); i++) {
    const section = sections[i];
    let slide = pptx.addSlide();
    
    console.log('Creating slide:', section.title);
    
    // Section title
    slide.addText(section.title, {
      x: 0.5, y: 0.5, w: 9, h: 1,
      fontSize: 32, 
      bold: true, 
      color: '004080',
      fontFace: 'Arial'
    });
    
    // Add bullets if we have them
    if (section.bullets && section.bullets.length > 0) {
      // Add each bullet as separate text to avoid the property error
      for (let j = 0; j < section.bullets.length; j++) {
        slide.addText('• ' + section.bullets[j], {
          x: 0.5, 
          y: 2 + (j * 0.6), 
          w: 9, 
          h: 0.5,
          fontSize: 16, 
          color: '333333',
          fontFace: 'Arial'
        });
      }
    }
  }
  
  updateStatus(jobId, 90, 'Saving PowerPoint...');
  
  const outputPath = path.join(outputDir, jobId + '.pptx');
  await pptx.writeFile({ fileName: outputPath });
  
  console.log('?? PowerPoint saved:', outputPath);
}

function updateStatus(jobId, progress, message) {
  jobStatus[jobId] = {
    status: 'processing',
    progress: progress,
    message: message
  };
  console.log(`[${jobId}] ${progress}% - ${message}`);
}

app.listen(PORT, () => {
  console.log(`?? PowerPoint Training Generator running on port ${PORT}`);
  console.log(`?? Open http://localhost:${PORT} to use the tool`);
});
