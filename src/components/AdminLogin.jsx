import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [passKey, setPassKey] = useState("");
  const [error, setError] = useState("");

  const ADMIN_PASS_KEY = "2026";

  const handleLogin = (e) => {
    e.preventDefault();

    if (passKey.trim() === ADMIN_PASS_KEY) {
      sessionStorage.setItem("adminLoggedIn", "true");
      navigate("/admin");
    } else {
      setError("Invalid admin pass key.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080d1c",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "400px",
          padding: "40px",
          background: "#111a30",
          borderRadius: "20px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "45px", marginBottom: "10px" }}>
          🛡️
        </div>

        <h1 style={{ marginBottom: "5px" }}>
          ResolveAI
        </h1>

        <div
          style={{
            color: "#7d9cff",
            fontSize: "12px",
            fontWeight: "bold",
            marginBottom: "25px",
            letterSpacing: "1px",
          }}
        >
          ADMIN PORTAL
        </div>

        <h2>Admin Sign In</h2>

        <p
          style={{
            color: "#8996b2",
            fontSize: "14px",
            marginBottom: "25px",
          }}
        >
          Enter your secure pass key to access
          the Admin Dashboard.
        </p>

        <form onSubmit={handleLogin}>

          <input
            type="password"
            placeholder="Enter admin pass key"
            value={passKey}
            onChange={(e) => {
              setPassKey(e.target.value);
              setError("");
            }}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #344363",
              background: "#080f22",
              color: "white",
              outline: "none",
              fontSize: "14px",
              marginBottom: "15px",
            }}
          />

          {error && (
            <p
              style={{
                color: "#ff7777",
                fontSize: "13px",
              }}
            >
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: "#5d7cff",
              color: "white",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Sign In →
          </button>

        </form>

        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "25px",
            background: "transparent",
            border: "none",
            color: "#8197ff",
            cursor: "pointer",
          }}
        >
          ← Back to Home
        </button>

      </div>
    </div>
  );
}

export default AdminLogin;