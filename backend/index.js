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

// Multer setup for CSV upload
const upload = multer({ dest: "uploads/" });

// POST upload CSV (multipart/form-data)
// field name: file
app.post("/api/upload-csv", upload.single("file"), (req, res) => {
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Mock backend listening on http://localhost:${PORT}`);
});
