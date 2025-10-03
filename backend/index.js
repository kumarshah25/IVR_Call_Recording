/**
 * Backend for Lean IVR MVP
 * - Uses Firestore for data storage
 * - Manages recipients and campaigns
 * - Mock IVR and payment endpoints
 */

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const path = require("path");

// Initialize Firebase Admin SDK
// IMPORTANT: Replace with the actual path to your service account key file
const serviceAccount = require("./data/serviceAccountKey.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const csvParser = require("csv-parser");
const cors = require("cors");
const googleTTS = require('google-tts-api');
const fetch = require('node-fetch');
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

// GET health
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Lean IVR backend 🚀" });
});

// KYC endpoints
app.get("/api/kyc", async (req, res) => {
  const { uid } = req.query;
  if (!uid) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(userDoc.data().kyc || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/kyc", async (req, res) => {
  const { uid, pan, gst, bank } = req.body;
  if (!uid || !pan || !gst || !bank) {
    return res.status(400).json({ error: "All KYC fields are required" });
  }
  try {
    await db.collection("users").doc(uid).set({ kyc: { pan, gst, bank } }, { merge: true });
    res.json({ success: true, message: "KYC updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all records
app.get("/api/records", async (req, res) => {
  try {
    const recordsSnapshot = await db.collection("records").get();
    const records = recordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add a single recipient
app.post("/api/recipients", async (req, res) => {
  const body = req.body || {};
  const required = ["Name", "Mobile", "Email", "City"];
  for (const f of required) {
    if (!body[f]) {
      return res.status(400).json({ error: `Missing required field: ${f}` });
    }
  }

  try {
    const docRef = await db.collection("records").add(body);
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  if (!req.file.originalname.match(/\.csv$/i)) {
    fs.unlinkSync(filePath);
    return res.status(400).json({ error: "Only CSV allowed" });
  }

  const records = [];
  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (data) => records.push(data))
    .on("end", async () => {
      try {
        const batch = db.batch();
        records.forEach(record => {
          const docRef = db.collection("records").doc();
          batch.set(docRef, record);
        });
        await batch.commit();
        fs.unlinkSync(filePath);
        res.json({ success: true, message: "CSV data imported into Firestore" });
      } catch (error) {
        fs.unlinkSync(filePath);
        res.status(500).json({ error: "Failed to import CSV to Firestore" });
      }
    })
    .on("error", (err) => {
      fs.unlinkSync(filePath);
      res.status(500).json({ error: "Failed to process CSV file" });
    });
});

// Campaign endpoints
app.get("/api/campaigns", async (req, res) => {
  try {
    const campaignsSnapshot = await db.collection("campaigns").get();
    const campaigns = campaignsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/campaigns", async (req, res) => {
  const { name, question, scheduledAt } = req.body || {};
  if (!name || !question) return res.status(400).json({ error: "name & question required" });
  const newC = { name, question, scheduledAt: scheduledAt || new Date().toISOString(), status: "scheduled" };

  try {
    const docRef = await db.collection("campaigns").add(newC);
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mock IVR endpoint
app.post("/api/ivr/call", (req, res) => {
    const { mobile } = req.body;
    if (!mobile) {
        return res.status(400).json({ error: "Mobile number is required" });
    }
    // Mocking the IVR call
    console.log(`Initiating mock IVR call to ${mobile}`);
    setTimeout(() => {
        console.log(`Mock IVR call to ${mobile} completed.`);
        // You can add more logic here to simulate call status updates
    }, 5000);
    res.json({ success: true, message: `Mock IVR call initiated to ${mobile}` });
});

// Billing and Invoicing endpoints
app.get("/api/invoices", async (req, res) => {
  const { uid } = req.query;
  if (!uid) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const invoicesSnapshot = await db.collection("invoices").where("uid", "==", uid).get();
    const invoices = invoicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/payments/create", (req, res) => {
  const { amount, invoiceId } = req.body;
  // In a real app, you would use the Razorpay SDK to create an order
  const mockOrder = {
    id: `order_${Date.now()}`,
    amount: amount * 100, // amount in paise
    currency: "INR",
  };
  res.json(mockOrder);
});

app.post("/api/payments/verify", async (req, res) => {
  const { paymentId, orderId, signature, invoiceId, amount } = req.body;
  // In a real app, you would verify the signature
  try {
    await db.collection("invoices").doc(invoiceId).update({ status: "paid" });
    await db.collection("payments").add({ invoiceId, amount, status: 'success', paymentId });
    res.json({ success: true, message: "Payment successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
});
