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
