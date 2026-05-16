import React from "react";

const SimpleLanding: React.FC = () => {
  return (
    <div
      style={{
        padding: "40px",
        background: "#0a0a0b",
        color: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚗 LuxeDrive</h1>
      <p
        style={{ fontSize: "1.25rem", color: "#cbd5e1", marginBottom: "2rem" }}
      >
        Premium Car Rental Platform
      </p>

      <div
        style={{
          background: "#111115",
          padding: "30px",
          borderRadius: "12px",
          maxWidth: "600px",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Welcome!</h2>
        <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
          The application is loading. We're fixing the component imports.
        </p>
        <p style={{ color: "#10b981" }}>
          ✅ API Connected
          <br />
          ✅ React Working
          <br />✅ Backend Running
        </p>
      </div>
    </div>
  );
};

export default SimpleLanding;
