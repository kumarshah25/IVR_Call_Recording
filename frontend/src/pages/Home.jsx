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
