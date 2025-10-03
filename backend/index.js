/**
 * Mock Backend for Lean IVR MVP
 * - Serves CSV records
 * - Append a recipient (POST /api/recipients)
 * - Upload CSV (POST /api/upload-csv)
 * - Basic campaign endpoints
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const cors = require("cors");
const googleTTS = require('google-tts-api');
const fetch = require('node-fetch');
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

// file paths
const DATA_DIR = path.join(__dirname, "data");
const RECORDS_CSV = path.join(DATA_DIR, "records.csv");

// Helper: read CSV into array of objects
function readCsv(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser({ skipLines: 0 }))
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

// GET health
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Lean IVR mock backend 🚀" });
});

// GET all records (parsed CSV)
app.get("/api/records", async (req, res) => {
  try {
    if (!fs.existsSync(RECORDS_CSV)) {
      return res.json([]);
    }
    const rows = await readCsv(RECORDS_CSV);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read CSV" });
  }
});

// POST add a single recipient (appends to CSV)
app.post("/api/recipients", (req, res) => {
  const body = req.body || {};
  const required = ["Name", "Mobile", "Email", "City"];
  for (const f of required) {
    if (!body[f]) {
      return res.status(400).json({ error: `Missing required field: ${f}` });
    }
  }

  // default values
  const row = {
    Name: body.Name,
    Designation: body.Designation || "",
    Organization: body.Organization || "",
    City: body.City || "",
    Mobile: body.Mobile,
    Email: body.Email || "",
    Language: body.Language || "",
    DurationSec: body.DurationSec || "60",
    DateTime: body.DateTime || new Date().toISOString(),
    Status: body.Status || "Pending"
  };

  // if file doesn't exist, write header first
  const header = Object.keys(row).join(",") + "\n";
  const line = Object.values(row).map(v => `"${(v || "").toString().replace(/"/g, '""')}"`).join(",") + "\n";

  try {
    if (!fs.existsSync(RECORDS_CSV)) {
      fs.writeFileSync(RECORDS_CSV, header + line);
    } else {
      // append (no header)
      fs.appendFileSync(RECORDS_CSV, line);
    }
    res.json({ success: true, row });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to append record" });
  }
});

// --- Multer Setup ---
// Ensure upload directories exist
const UPLOADS_DIR = path.join(__dirname, "uploads");
const RECORDINGS_DIR = path.join(UPLOADS_DIR, "recordings");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(RECORDINGS_DIR)) fs.mkdirSync(RECORDINGS_DIR);

// Multer for CSVs
const csvUpload = multer({ dest: path.join(UPLOADS_DIR, "csv_temp") });

// Multer for audio recordings
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, RECORDINGS_DIR),
 filename: (req, file, cb) => cb(null, `${req.body.sessionId}-${Date.now()}.webm`),
});
const audioUpload = multer({ storage: audioStorage });

// POST upload CSV (multipart/form-data)
// field name: file
app.post("/api/upload-csv", csvUpload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const filePath = path.join(__dirname, req.file.path);
  // Simple validation: ensure CSV extension
  if (!req.file.originalname.match(/\.csv$/i)) {
    fs.unlinkSync(filePath);
    return res.status(400).json({ error: "Only CSV allowed" });
  }
  // Move/replace records.csv with uploaded file
  try {
    fs.copyFileSync(filePath, RECORDS_CSV);
    fs.unlinkSync(filePath);
    res.json({ success: true, message: "CSV uploaded and saved as records.csv" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save uploaded CSV" });
  }
});

// Simple campaign endpoints (mock)
let campaigns = [
  { id: 1, name: "Pilot Campaign", question: "How satisfied are you with service?", scheduledAt: "2025-09-30T10:00:00Z", status: "pending" }
];

app.get("/api/campaigns", (req, res) => {
  res.json(campaigns);
});

app.post("/api/campaigns", (req, res) => {
  const { name, question, scheduledAt } = req.body || {};
  if (!name || !question) return res.status(400).json({ error: "name & question required" });
  const newC = { id: campaigns.length + 1, name, question, scheduledAt: scheduledAt || new Date().toISOString(), status: "scheduled" };
  campaigns.push(newC);
  res.json(newC);
});

// Simulate marking a recipient recording as completed (mock)
app.post("/api/records/:name/complete", (req, res) => {
  // This is a mock - in real system you'd update DB or S3 metadata
  res.json({ success: true, message: `Marked ${req.params.name} as completed (mock)` });
});

// Mock IVR endpoints

// In-memory IVR session data (replace with a database for persistence)
const ivrSessions = {};

app.post("/ivr/start", async (req, res) => {
  const sessionId = Math.random().toString(36).substring(2, 15); // Generate a random session ID
  ivrSessions[sessionId] = { status: "active", currentMenu: "main" };

  const ttsResponse = await textToSpeech("Welcome to Lean IVR. Press 1 for Sales, 2 for Support.");
  res.json({ sessionId, audioUrl: ttsResponse.audioUrl, action: 'PLAY' });
});

app.post("/ivr/options", async (req, res) => {
  const { sessionId, option } = req.body;

  if (!ivrSessions[sessionId]) {
    return res.status(400).json({ error: "Invalid session ID" });
  }

  let message = "";
  if (option === "1") {
    message = "Connecting you to Sales...";
    ivrSessions[sessionId].currentMenu = "sales";
    // Sales path does not record
    ivrSessions[sessionId].awaitsRecording = true;
  } else if (option === "2") {
    // This option will now trigger a voice recording prompt
    message = "After the beep, please state the reason for your call.";
    ivrSessions[sessionId].currentMenu = "support";
    // Add a flag to the session to indicate we expect a recording
    ivrSessions[sessionId].awaitsRecording = true;
  } else {
    message = "Invalid option. Please try again.";
    // Also reset here for invalid options
    ivrSessions[sessionId].awaitsRecording = false;
  }

  const ttsResponse = await textToSpeech(message);
  res.json({ audioUrl: ttsResponse.audioUrl, action: ivrSessions[sessionId].awaitsRecording ? 'RECORD' : 'PLAY' });
});

// New endpoint to receive audio recordings
app.post("/ivr/record", audioUpload.single("audio"), async (req, res) => {
  const { sessionId } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: "No audio file received." });
  }
  console.log(`✅ Recording saved for session ${sessionId}: ${req.file.filename}`);

  // Respond with a confirmation message
  const ttsResponse = await textToSpeech("Thank you. Your response has been recorded. We will get back to you shortly.");
  res.json({ audioUrl: ttsResponse.audioUrl, action: 'PLAY' });
});

// Mock Text-to-Speech API (replace with a real TTS service or library)
async function textToSpeech(text) {
  try {
    // Fetch audio as base64 from google-tts-api on the server
    const base64 = await googleTTS.getAudioBase64(text, {
      lang: 'en',
      slow: false,
      timeout: 100000, // Increase timeout to 20 seconds
    });
    const audioUrl = `data:audio/mpeg;base64,${base64}`;
    return { audioUrl };
  } catch (err) {
    console.error("TTS Error:", err);
    // In case of an error, you might want to return a fallback audio or an error message
    return { audioUrl: null };
  }
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Mock backend listening on http://localhost:${PORT}`);
});
