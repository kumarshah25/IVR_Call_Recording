import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import MIS from "./pages/MIS";
import Invoices from "./pages/Invoices";
import LoginKYC from "./pages/LoginKYC";
import Home from "./pages/Home";
import IVR from "./pages/IVR";

export default function App() {
  return (
    <div className="app-root">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/mis" element={<MIS />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/login" element={<LoginKYC />} />
          <Route path="/ivr" element={<IVR />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">© {new Date().getFullYear()} Lean IVR MVP</footer>
    </div>
  );
}
