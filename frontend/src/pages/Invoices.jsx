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
