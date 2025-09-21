#!/usr/bin/env bash
set -euo pipefail

echo "🎨 Creating frontend..."

ROOT="$(pwd)"
FRONTEND_DIR="$ROOT/frontend"

# Remove existing frontend if present
if [ -d "$FRONTEND_DIR" ]; then
  echo "Removing existing frontend folder..."
  rm -rf "$FRONTEND_DIR"
fi

mkdir -p "$FRONTEND_DIR"
cd "$FRONTEND_DIR"

# package.json
cat > package.json <<'JSON'
{
  "name": "lean-ivr-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.5.0",
    "papaparse": "^5.4.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.1"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
JSON

echo "Installing frontend npm packages (this may take a minute)..."
npm install --silent

# Vite config (optional default)
cat > vite.config.js <<'VITE'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
VITE

# index.html
cat > index.html <<'HTML'
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Lean IVR MVP UI</title>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
HTML

mkdir -p src src/components src/pages src/styles

# main.jsx
cat > src/main.jsx <<'JS'
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
JS

# App.jsx
cat > src/App.jsx <<'JS'
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import MIS from "./pages/MIS";
import Invoices from "./pages/Invoices";
import LoginKYC from "./pages/LoginKYC";
import Home from "./pages/Home";

export default function App() {
  return (
    <div className="app-root">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/mis" element={<MIS />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/login" element={<LoginKYC />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">© {new Date().getFullYear()} Lean IVR MVP</footer>
    </div>
  );
}
JS

# styles.css (polished UI)
cat > src/styles.css <<'CSS'
:root{
  --bg: #f7f9fc;
  --card: #ffffff;
  --primary: #1a73e8;
  --muted: #6b7280;
  --accent: #0b5ed7;
  --radius: 8px;
  --maxw: 1100px;
  --shadow: 0 6px 20px rgba(23,34,56,0.06);
}

*{box-sizing:border-box}
html,body,#root{height:100%}
body{
  margin:0;
  font-family: "Roboto", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  background: linear-gradient(180deg, var(--bg), #ffffff 60%);
  color:#111827;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}

.app-root{display:flex;flex-direction:column;min-height:100vh}
.header{
  background:var(--card);
  border-bottom: 1px solid #e6eefb;
  position:sticky;
  top:0;
  z-index:50;
  box-shadow: 0 1px 0 rgba(20,40,80,0.02);
}
.header-inner{
  max-width:var(--maxw);
  margin:0 auto;
  display:flex;
  align-items:center;
  gap:18px;
  padding:14px 20px;
}
.brand{
  display:flex;
  align-items:center;
  gap:10px;
  font-weight:600;
  color:var(--primary);
}
.brand .logo{
  width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,var(--primary),#0b63d7);
  display:flex;align-items:center;justify-content:center;color:white;font-weight:700;
}
.nav{display:flex;gap:8px; margin-left:12px; flex-wrap:wrap}
.nav a{
  color: #0f1724;
  text-decoration:none;
  padding:8px 12px;
  border-radius:6px;
  font-weight:500;
}
.nav a.active, .nav a:hover{
  background: rgba(26,115,232,0.08);
  color:var(--primary);
}

.right-actions{margin-left:auto;display:flex;gap:12px;align-items:center}
.cta{
  background:var(--primary); color:white;border:none;padding:8px 14px;border-radius:8px;font-weight:600;
  box-shadow: 0 6px 18px rgba(26,115,232,0.12);
}
.container{
  max-width:var(--maxw);
  margin:20px auto;
  padding:20px;
  flex:1;
}

.card{
  background:var(--card);
  border-radius:var(--radius);
  box-shadow:var(--shadow);
  padding:18px;
  margin-bottom:16px;
}

.grid{
  display:grid;
  grid-template-columns: repeat(12,1fr);
  gap:16px;
}
.col-4{grid-column:span 4}
.col-8{grid-column:span 8}
.col-6{grid-column:span 6}
.col-12{grid-column:span 12}

.kpi{
  display:flex;gap:12px;align-items:center;padding:12px;border-radius:10px;background:linear-gradient(180deg,#fff,#fbfdff);
}
.kpi h3{margin:0;font-size:20px}
.kpi p{margin:0;color:var(--muted)}

.table{
  width:100%;border-collapse:collapse;font-size:14px;margin-top:10px;
}
.table th, .table td{padding:10px;border-bottom:1px solid #eef4ff;text-align:left}
.table th{color:var(--muted);font-weight:600}
.btn{
  padding:8px 10px;border-radius:8px;border:none;font-weight:600;cursor:pointer;
}
.btn-outline{background:transparent;border:1px solid #e6eefb;color:var(--primary)}
.small{font-size:13px;padding:6px 8px}

.footer{
  text-align:center;color:#94a3b8;padding:18px 10px;font-size:13px;border-top:1px solid #f0f6ff;background:transparent;
}

/* Forms */
.form-row{display:flex;gap:12px;flex-wrap:wrap}
.input, textarea, select{
  border:1px solid #e6eefb;padding:10px;border-radius:8px;background:#fff;width:100%;
}
.input-inline{width:220px}
.small-muted{color:var(--muted);font-size:13px;margin-top:8px}

/* responsive */
@media(max-width:900px){
  .grid{grid-template-columns:repeat(6,1fr)}
  .col-8{grid-column:span 6}
  .col-4{grid-column:span 6}
}
CSS


# components/Header.jsx
cat > src/components/Header.jsx <<'COMP'
import React from "react";
import { NavLink } from "react-router-dom";

export default function Header(){
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <div className="logo">L</div>
          <div>
            <div style={{fontSize:14}}>Lean IVR</div>
            <div style={{fontSize:12,color:'#6b7280'}}>Audio Recording & IVR</div>
          </div>
        </div>

        <nav className="nav" role="navigation" aria-label="Main">
          <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink>
          <NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}>Dashboard</NavLink>
          <NavLink to="/upload" className={({isActive}) => isActive ? 'active' : ''}>Upload Recipients</NavLink>
          <NavLink to="/mis" className={({isActive}) => isActive ? 'active' : ''}>MIS</NavLink>
          <NavLink to="/invoices" className={({isActive}) => isActive ? 'active' : ''}>Invoices</NavLink>
          <NavLink to="/login" className={({isActive}) => isActive ? 'active' : ''}>Login & KYC</NavLink>
        </nav>

        <div className="right-actions">
          <button className="btn btn-outline small" onClick={()=>window.open('/','_self')}>Docs</button>
          <button className="cta" onClick={()=>alert('New Campaign (mock)')}>New Campaign</button>
        </div>
      </div>
    </header>
  );
}
COMP

# pages/Home.jsx
cat > src/pages/Home.jsx <<'PAGE'
import React from "react";
import { Link } from "react-router-dom";

export default function Home(){
  return (
    <div>
      <div className="card">
        <h2>Lean Audio Recording & IVR — MVP UI</h2>
        <p className="small-muted">This is a client-side demo of the RFP UI. It includes recipient upload, campaign dashboard, MIS and invoice UI. Replace mock actions with real backend endpoints & IVR provider integrations (Exotel / Knowlarity) when ready.</p>
      </div>

      <div className="grid">
        <div className="col-8">
          <div className="card">
            <h3>Quick start</h3>
            <ol>
              <li>Go to <Link to="/upload">Upload Recipients</Link> and upload a CSV (≤1,000 rows).</li>
              <li>Create a test campaign (New Campaign button).</li>
              <li>Use <Link to="/dashboard">Dashboard</Link> to view statuses and open the recording flow modal.</li>
            </ol>
          </div>
        </div>

        <div className="col-4">
          <div className="card">
            <h4>Contact</h4>
            <p className="small-muted">Team: [Your Company Name]</p>
            <p className="small-muted">Support: support@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
PAGE

# pages/LoginKYC.jsx
cat > src/pages/LoginKYC.jsx <<'PAGE'
import React, {useState} from "react";
import { useNavigate } from "react-router-dom";

export default function LoginKYC(){
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [kyc, setKyc] = useState({pan:'',gst:'',bank:''});
  const nav = useNavigate();

  function sendOtp(){
    if(!/^\d{10}$/.test(phone)){ alert("Enter 10-digit mobile"); return; }
    setOtpSent(true);
    alert("OTP mock sent (use 1234)");
  }
  function verifyOtp(){
    if(otp === "1234"){ alert("Verified"); nav("/dashboard"); } else alert("Wrong OTP (try 1234)");
  }

  return (
    <div>
      <div className="card">
        <h3>Login / OTP</h3>
        <div style={{maxWidth:440}}>
          <label className="small-muted">Mobile</label>
          <div style={{display:'flex',gap:8}}>
            <input className="input" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="9876543210" />
            <button className="btn btn-outline small" onClick={sendOtp}>Send OTP</button>
          </div>
          {otpSent && (
            <div style={{marginTop:12}}>
              <label className="small-muted">Enter OTP</label>
              <div style={{display:'flex',gap:8}}>
                <input className="input" value={otp} onChange={e=>setOtp(e.target.value)} placeholder="1234" />
                <button className="cta small" onClick={verifyOtp}>Verify</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3>KYC (PAN / GST / Bank)</h3>
        <div className="form-row">
          <input className="input input-inline" placeholder="PAN (ABCDE1234F)" value={kyc.pan} onChange={e=>setKyc({...kyc,pan:e.target.value})} />
          <input className="input input-inline" placeholder="GSTIN" value={kyc.gst} onChange={e=>setKyc({...kyc,gst:e.target.value})} />
          <input className="input" placeholder="Bank A/C & IFSC" value={kyc.bank} onChange={e=>setKyc({...kyc,bank:e.target.value})} />
        </div>
        <div style={{marginTop:10}}>
          <button className="cta" onClick={()=>alert("KYC saved (mock)")}>Save KYC</button>
        </div>
      </div>
    </div>
  );
}
PAGE

# pages/Upload.jsx
cat > src/pages/Upload.jsx <<'PAGE'
import React, {useState, useRef, useEffect} from "react";
import Papa from "papaparse";
import axios from "axios";

const SAMPLE = `Name,Designation,Organization,City,Mobile,Email,Language,DurationSec,DateTime
Ramesh Sharma,Cardiologist,ABC Hospital,Mumbai,9876543210,ramesh@abc.com,Hindi,60,2025-09-29 10:30:00
Anita Desai,Nurse,XYZ Clinic,Delhi,9123456789,anita@xyz.com,English,60,2025-09-30 11:00:00
`;

function validateRow(r){
  const mobileOk = /^\d{10}$/.test((r.Mobile||"").trim());
  const emailOk = /@/.test((r.Email||"").trim());
  return {mobileOk, emailOk};
}

export default function Upload(){
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const inputRef = useRef();

  useEffect(() => {
    // load server records on mount
    axios.get("http://localhost:5000/api/records").then(r => {
      if (Array.isArray(r.data)) {
        // normalize header names if needed
        setRows(r.data.map(x => ({ ...x, _valid: true })));
      }
    }).catch(()=>{});
  }, []);

  function parseFile(file){
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        if(res.data.length > 1000){ setErrors(["CSV has more than 1,000 rows."]); setRows([]); return; }
        const errs = [];
        const processed = res.data.map((r,i)=> {
          const v = validateRow(r);
          if(!v.mobileOk) errs.push(`Row ${i+1}: invalid mobile (${r.Mobile})`);
          if(!v.emailOk) errs.push(`Row ${i+1}: invalid email (${r.Email})`);
          return {...r, _valid: v.mobileOk && v.emailOk};
        });
        setErrors(errs);
        setRows(processed);
      }
    });
  }

  function onChoose(e){
    const f = e.target.files?.[0];
    if(f) parseFile(f);
  }

  function downloadSample(){
    const blob = new Blob([SAMPLE], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='sample.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  async function saveCampaign(){
    if(rows.length===0){ alert("Upload first"); return; }
    // Post each valid row to backend (simple approach)
    const validRows = rows.filter(r=>r._valid);
    try {
      for (const r of validRows) {
        await axios.post("http://localhost:5000/api/recipients", {
          Name: r.Name, Designation: r.Designation, Organization: r.Organization,
          City: r.City, Mobile: r.Mobile, Email: r.Email, Language: r.Language,
          DurationSec: r.DurationSec || 60, DateTime: r.DateTime
        });
      }
      alert("Mock: recipients saved to backend");
      inputRef.current.value = null;
    } catch (err) {
      console.error(err);
      alert("Failed to save to backend (check server)");
    }
  }

  return (
    <div>
      <div className="card">
        <h3>Upload Recipients (CSV / Excel exported CSV)</h3>
        <p className="small-muted">Max 1,000 records per campaign. Fields required in header: Name,Designation,Organization,City,Mobile,Email,Language,DurationSec,DateTime</p>

        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={onChoose} />
          <button className="btn btn-outline small" onClick={downloadSample}>Download sample</button>
        </div>

        {errors.length>0 && (
          <div style={{marginTop:12,color:'#b91c1c'}}>
            <strong>Validation issues:</strong>
            <ul>{errors.map((e,i)=><li key={i}>{e}</li>)}</ul>
          </div>
        )}

        <div style={{marginTop:16}} className="card">
          <h4>Preview ({rows.length})</h4>
          <table className="table">
            <thead><tr><th>Name</th><th>Mobile</th><th>Email</th><th>City</th><th>Duration</th><th>Time</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((r,idx)=>(
                <tr key={idx}>
                  <td>{r.Name}</td>
                  <td>{r.Mobile}</td>
                  <td>{r.Email}</td>
                  <td>{r.City}</td>
                  <td>{r.DurationSec}</td>
                  <td>{r.DateTime}</td>
                  <td>{r._valid ? <span style={{color:'#059669'}}>OK</span> : <span style={{color:'#b91c1c'}}>Invalid</span>}</td>
                </tr>
              ))}
              {rows.length===0 && <tr><td colSpan={7}>No data uploaded yet.</td></tr>}
            </tbody>
          </table>

          <div style={{marginTop:12}}>
            <button className="cta" onClick={saveCampaign}>Save Campaign</button>
            <button className="btn btn-outline small" onClick={()=>{ setRows([]); setErrors([]); inputRef.current.value=null; }}>Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
}
PAGE

# pages/Dashboard.jsx
cat > src/pages/Dashboard.jsx <<'PAGE'
import React, {useState, useEffect} from "react";
import axios from "axios";

function MiniChart({data=[]}){
  const max = Math.max(...data,1);
  return (
    <svg width="100%" height="70" viewBox="0 0 200 70" preserveAspectRatio="none">
      {data.map((v,i)=>{
        const x = i*(200/(data.length||1));
        const h = (v/max)*60;
        return <rect key={i} x={x+6} y={70-h-5} width="10" height={h} rx="2" fill="#cfe8ff" />
      })}
    </svg>
  );
}

export default function Dashboard(){
  const [stats, setStats] = useState({placed:0,recorded:0,failed:0,rescheduled:0});
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/records").then(r => {
      const rows = Array.isArray(r.data) ? r.data : [];
      setStats({
        placed: rows.length,
        recorded: rows.filter(x=> (x.Status||"").toLowerCase()==="completed").length,
        failed: rows.filter(x=> (x.Status||"").toLowerCase()==="failed").length,
        rescheduled: rows.filter(x=> (x.Status||"").toLowerCase()==="rescheduled").length
      });
      setRecent(rows.slice(0,6).map(x=>({ name: x.Name, city: x.City, status: x.Status })));
    }).catch(()=>{});
  }, []);

  return (
    <div>
      <div className="grid">
        <div className="col-4">
          <div className="card kpi">
            <div>
              <h3>{stats.placed}</h3>
              <p>Calls placed</p>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card kpi">
            <div>
              <h3>{stats.recorded}</h3>
              <p>Recordings completed</p>
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="card kpi">
            <div>
              <h3>{stats.failed}</h3>
              <p>Failed</p>
            </div>
          </div>
        </div>

        <div className="col-8">
          <div className="card">
            <h4>Recent activity</h4>
            <table className="table">
              <thead><tr><th>Name</th><th>City</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {recent.map((r,i)=>(
                  <tr key={i}>
                    <td>{r.name}</td>
                    <td>{r.city}</td>
                    <td>{r.status}</td>
                    <td><button className="btn btn-outline small" onClick={()=>alert("Open recording flow (mock)")}>Open</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-4">
          <div className="card">
            <h4>Weekly trend</h4>
            <MiniChart data={[4,8,12,8,20,10,14]} />
          </div>
        </div>
      </div>
    </div>
  );
}
PAGE

# pages/MIS.jsx
cat > src/pages/MIS.jsx <<'PAGE'
import React, {useState, useEffect} from "react";
import axios from "axios";

function exportCsv(rows){
  if(!rows.length){ alert("No rows to export"); return; }
  const keys = Object.keys(rows[0]);
  const lines = [keys.join(",")].concat(rows.map(r => keys.map(k=>`"${(r[k]||'').toString().replace(/"/g,'""')}"`).join(",")));
  const blob = new Blob([lines.join("\n")], {type:'text/csv'});
  const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='mis_export.csv'; a.click(); URL.revokeObjectURL(url);
}

export default function MIS(){
  const [rows, setRows] = useState([]);

  useEffect(()=> {
    axios.get("http://localhost:5000/api/records").then(r => {
      setRows(Array.isArray(r.data) ? r.data : []);
    }).catch(()=>{});
  }, []);

  return (
    <div>
      <div className="card">
        <h3>MIS Dashboard</h3>
        <p className="small-muted">Statuses: Pending, Completed, Failed, Rescheduled</p>
        <div style={{display:'flex',gap:8,marginTop:10}}>
          <button className="cta small" onClick={()=>exportCsv(rows)}>Export CSV</button>
          <button className="btn btn-outline small" onClick={()=>alert("Export PDF (mock)")}>Export PDF</button>
        </div>

        <div style={{marginTop:16}}>
          <table className="table">
            <thead><tr><th>Name</th><th>Mobile</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {rows.map((r,i)=>(<tr key={i}><td>{r.Name}</td><td>{r.Mobile}</td><td>{r.Status}</td><td>{r.DateTime}</td></tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
PAGE

# pages/Invoices.jsx
cat > src/pages/Invoices.jsx <<'PAGE'
import React from "react";

export default function Invoices(){
  const invoices = [
    {id:'INV-001',amount:1200,date:'2025-09-01',status:'Paid'},
    {id:'INV-002',amount:5000,date:'2025-09-10',status:'Pending'}
  ];

  return (
    <div>
      <div className="card">
        <h3>Billing & Invoices</h3>
        <p className="small-muted">Integrate Razorpay/PayU on backend. Here is a mock listing.</p>
        <table className="table">
          <thead><tr><th>Invoice</th><th>Amount (INR)</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {invoices.map((inv,i)=>(
              <tr key={i}>
                <td>{inv.id}</td>
                <td>{inv.amount}</td>
                <td>{inv.date}</td>
                <td>{inv.status}</td>
                <td><button className="btn btn-outline small" onClick={()=>alert('Open invoice (mock)')}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{marginTop:12}}>
          <button className="cta" onClick={()=>alert('Open payment flow (mock)')}>Make Payment</button>
        </div>
      </div>
    </div>
  );
}
PAGE

echo "Frontend scaffold created at $(pwd)"
echo "Run frontend: cd frontend && npm start"
echo "✅ Frontend setup finished."
