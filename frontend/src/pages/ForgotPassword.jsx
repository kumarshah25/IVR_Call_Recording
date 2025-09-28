import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordReset } from '../firebase/firebase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await sendPasswordReset(email);
      setMessage('Password reset email sent. Check your inbox.');
    } catch (err) {
      setMessage(err.message || 'An error occurred.');
    }
  };

  return (
    <div className="card">
      <h3>Forgot Password</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
        </div>
        <button type="submit" className="cta">Send Reset Email</button>
      </form>
      {message && <p className="small-muted">{message}</p>}
      <p className="small-muted">
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}
