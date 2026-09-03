import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./components/Home";
import Chatbot from "./components/Chatbot";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";

function App() {
  return (
    <Routes>

      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* Customer Chatbot */}
      <Route path="/chatbot" element={<Chatbot />} />

      {/* Admin Login */}
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Admin Dashboard */}
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Unknown URL */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default App;