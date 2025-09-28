import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUpWithEmailPassword } from '../firebase/firebase';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    pan: '',
    gst: '',
    bank: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signUpWithEmailPassword(formData.email, formData.password, {
        name: formData.name,
        mobile: formData.mobile,
        pan: formData.pan,
        gst: formData.gst,
        bank: formData.bank,
      });
      alert('Sign up successful!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Sign up error', err);
      alert(err.message || 'An error occurred during sign up.');
    }
  };

  return (
    <div className="card">
      <h3>Sign Up</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <input name="name" placeholder="Name" onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <input name="mobile" placeholder="Mobile" onChange={handleChange} required />
        </div>
        <h4>KYC Details</h4>
        <div className="form-row">
          <input name="pan" placeholder="PAN" onChange={handleChange} required />
          <input name="gst" placeholder="GSTIN" onChange={handleChange} required />
          <input name="bank" placeholder="Bank Account & IFSC" onChange={handleChange} required />
        </div>
        <button type="submit" className="cta">Sign Up</button>
      </form>
      <p className="small-muted">Already have an account? <Link to="/login">Log In</Link></p>
    </div>
  );
}
