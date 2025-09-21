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
