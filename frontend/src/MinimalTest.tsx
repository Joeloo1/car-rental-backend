function MinimalTest() {
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
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        🚗 LuxeDrive is Loading...
      </h1>
      <p style={{ fontSize: "1.25rem", color: "#cbd5e1" }}>
        If you see this, React is working!
      </p>
      <div
        style={{
          marginTop: "2rem",
          padding: "20px",
          background: "#111115",
          borderRadius: "8px",
        }}
      >
        <h2>System Check:</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>✅ React Rendering</li>
          <li>✅ Vite Dev Server</li>
          <li>✅ TypeScript Compiling</li>
        </ul>
      </div>
    </div>
  );
}

export default MinimalTest;
