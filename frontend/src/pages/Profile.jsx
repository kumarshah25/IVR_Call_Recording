import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function Profile() {
  const [kyc, setKyc] = useState({ pan: '', gst: '', bank: '' });
  const mobile = localStorage.getItem('mobile');

  useEffect(() => {
    if (mobile) {
      axios.get(`${API_URL}/kyc?mobile=${mobile}`)
        .then(res => {
          if (res.data) {
            setKyc(res.data);
          }
        })
        .catch(err => console.error('Error fetching KYC', err));
    }
  }, [mobile]);

  const handleChange = (e) => {
    setKyc({ ...kyc, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/kyc`, { ...kyc, mobile });
      if (res.data.success) {
        alert('KYC updated successfully');
      } else {
        alert('Failed to update KYC');
      }
    } catch (err) {
      console.error('KYC update error', err);
      alert('An error occurred while updating KYC.');
    }
  };

  return (
    <div className="card">
      <h3>Your Profile</h3>
      <form onSubmit={handleSubmit}>
        <h4>KYC Details</h4>
        <div className="form-row">
          <input name="pan" placeholder="PAN" value={kyc.pan} onChange={handleChange} required />
          <input name="gst" placeholder="GSTIN" value={kyc.gst} onChange={handleChange} required />
          <input name="bank" placeholder="Bank Account & IFSC" value={kyc.bank} onChange={handleChange} required />
        </div>
        <button type="submit" className="cta">Update KYC</button>
      </form>
    </div>
  );
}
