import { useEffect, useState } from "react";
import api from "./api/axios";

function DebugApp() {
  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    const runTests = async () => {
      const results = [];

      // Test 1: API Connection
      try {
        const res = await api.get("/category");
        results.push({
          name: "API Connection",
          status: "success",
          data: res.data,
        });
      } catch (err: any) {
        results.push({
          name: "API Connection",
          status: "error",
          error: err.message,
        });
      }

      // Test 2: Check if components exist
      try {
        const Navbar = await import("./components/common/Navbar");
        results.push({ name: "Navbar Import", status: "success" });
      } catch (err: any) {
        results.push({
          name: "Navbar Import",
          status: "error",
          error: err.message,
        });
      }

      try {
        const Footer = await import("./components/common/Footer");
        results.push({ name: "Footer Import", status: "success" });
      } catch (err: any) {
        results.push({
          name: "Footer Import",
          status: "error",
          error: err.message,
        });
      }

      try {
        const LandingPage = await import("./pages/LandingPage");
        results.push({ name: "LandingPage Import", status: "success" });
      } catch (err: any) {
        results.push({
          name: "LandingPage Import",
          status: "error",
          error: err.message,
        });
      }

      setTests(results);
    };

    runTests();
  }, []);

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
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>
        🔍 LuxeDrive Debug Report
      </h1>

      {tests.map((test, idx) => (
        <div
          key={idx}
          style={{
            background: "#111115",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "1rem",
            border: `2px solid ${test.status === "success" ? "#10b981" : "#ef4444"}`,
          }}
        >
          <h3 style={{ marginBottom: "0.5rem" }}>
            {test.status === "success" ? "✅" : "❌"} {test.name}
          </h3>
          {test.error && (
            <pre
              style={{
                background: "#1a1a1f",
                padding: "10px",
                borderRadius: "4px",
                overflow: "auto",
                fontSize: "0.875rem",
                color: "#ef4444",
              }}
            >
              {test.error}
            </pre>
          )}
          {test.data && (
            <pre
              style={{
                background: "#1a1a1f",
                padding: "10px",
                borderRadius: "4px",
                overflow: "auto",
                fontSize: "0.875rem",
                maxHeight: "200px",
              }}
            >
              {JSON.stringify(test.data, null, 2)}
            </pre>
          )}
        </div>
      ))}

      {tests.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Running tests...</p>
        </div>
      )}
    </div>
  );
}

export default DebugApp;
