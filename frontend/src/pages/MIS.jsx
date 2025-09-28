import React, {useState, useEffect} from "react";
import axios from "axios";
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import MockIVR from "../components/MockIVR";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function exportCsv(rows){
  if(!rows.length){ alert("No rows to export"); return; }
  const keys = Object.keys(rows[0]);
  const lines = [keys.join(",")].concat(rows.map(r => keys.map(k=>`"${(r[k]||'').toString().replace( /"/g, '""')}"`).join(",")));
  const blob = new Blob([lines.join("\n")], {type:'text/csv'});
  const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='mis_export.csv'; a.click(); URL.revokeObjectURL(url);
}

export default function MIS(){
  const [rows, setRows] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  useEffect(()=> {
    axios.get("http://localhost:5000/api/records").then(r => {
      setRows(Array.isArray(r.data) ? r.data : []);
    }).catch(()=>{});
  }, []);

  const statusData = {
    labels: ['Pending', 'Completed', 'Failed', 'Rescheduled'],
    datasets: [
      {
        data: [
          rows.filter(r => r.Status === 'Pending').length,
          rows.filter(r => r.Status === 'Completed').length,
          rows.filter(r => r.Status === 'Failed').length,
          rows.filter(r => r.Status === 'Rescheduled').length,
        ],
        backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384', '#FF9F40'],
      },
    ],
  };

  const callsByDay = rows.reduce((acc, row) => {
    const date = new Date(row.DateTime).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const barData = {
    labels: Object.keys(callsByDay),
    datasets: [
      {
        label: 'Calls per day',
        data: Object.values(callsByDay),
        backgroundColor: '#36A2EB',
      },
    ],
  };


  return (
    <div>
      {selectedRecipient && <MockIVR recipient={selectedRecipient} onClose={() => setSelectedRecipient(null)} />}
      <div className="card">
        <h3>MIS Dashboard</h3>
        <p className="small-muted">Statuses: Pending, Completed, Failed, Rescheduled</p>
        <div style={{display:'flex',gap:8,marginTop:10}}>
          <button className="cta small" onClick={()=>exportCsv(rows)}>Export CSV</button>
          <button className="btn btn-outline small" onClick={()=>alert("Export PDF (mock)")}>Export PDF</button>
        </div>

        <div className="grid" style={{marginTop:16}}>
          <div className="col-4">
            <h4>Call Status</h4>
            <Pie data={statusData} />
          </div>
          <div className="col-8">
            <h4>Calls per day</h4>
            <Bar data={barData} />
          </div>
        </div>

        <div style={{marginTop:16}}>
          <table className="table">
            <thead><tr><th>Name</th><th>Mobile</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {rows.map((r,i)=>(<tr key={i}><td>{r.Name}</td><td>{r.Mobile}</td><td>{r.Status}</td><td>{r.DateTime}</td><td><button className="btn btn-outline small" onClick={() => setSelectedRecipient(r)}>Call</button></td></tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
