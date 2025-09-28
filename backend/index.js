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

// Multer setup for CSV upload
const upload = multer({ dest: "uploads/" });

// POST upload CSV (multipart/form-data)
app.post("/api/upload-csv", upload.single("file"), (req, res) => {
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


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
});
