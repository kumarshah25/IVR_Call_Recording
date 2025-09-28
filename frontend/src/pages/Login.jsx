import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailPassword } from '../firebase/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailPassword(email, password);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'An error occurred during login.');
    }
  };

  return (
    <div className="card">
      <h3>Login</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        </div>
        <button type="submit" className="cta">Login</button>
      </form>
      <p className="small-muted">
        <Link to="/forgot-password">Forgot Password?</Link>
      </p>
      <p className="small-muted">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}
