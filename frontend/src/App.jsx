import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import MIS from "./pages/MIS";
import Invoices from "./pages/Invoices";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import { useAuth } from "./context/AuthContext";
import IVR from "./pages/IVR";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


export default function App() {
  const { currentUser } = useAuth();

  return (
    <div className="app-root">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={currentUser ? <Home /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/mis" element={<ProtectedRoute><MIS /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/ivr" element={<IVR />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">© {new Date().getFullYear()} Lean IVR MVP</footer>
    </div>
  );
}