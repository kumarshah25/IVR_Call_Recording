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
