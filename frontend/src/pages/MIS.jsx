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
