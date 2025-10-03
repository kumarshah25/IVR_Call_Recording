import React from "react";
import { NavLink } from "react-router-dom";

export default function Header(){
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <div className="logo">L</div>
          <div>
            <div style={{fontSize:14}}>Lean IVR</div>
            <div style={{fontSize:12,color:'#6b7280'}}>Audio Recording & IVR</div>
          </div>
        </div>

        <nav className="nav" role="navigation" aria-label="Main" style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflowX: 'auto' }}>
          <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink>
          <NavLink to="/ivr" className={({isActive}) => isActive ? 'active' : ''}>IVR</NavLink>
          <NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}>Dashboard</NavLink>
          <NavLink to="/upload" className={({isActive}) => isActive ? 'active' : ''}>Upload Recipients</NavLink>
          <NavLink to="/mis" className={({isActive}) => isActive ? 'active' : ''}>MIS</NavLink>
          <NavLink to="/invoices" className={({isActive}) => isActive ? 'active' : ''}>Invoices</NavLink>
          <NavLink to="/login" className={({isActive}) => isActive ? 'active' : ''}>Login</NavLink>
        </nav>

        <div className="right-actions">
          <button className="btn btn-outline small" onClick={()=>window.open('/','_self')}>Docs</button>
          <button className="cta" onClick={()=>alert('New Campaign (mock)')}>New Campaign</button>
        </div>
      </div>
    </header>
  );
}
