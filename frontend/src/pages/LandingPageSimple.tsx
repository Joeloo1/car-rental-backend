import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPageSimple: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <section
        className="hero"
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
            Experience the{" "}
            <span style={{ color: "#fbbf24" }}>Ultimate Drive</span>
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              marginBottom: "2rem",
              maxWidth: "600px",
              margin: "0 auto 2rem",
            }}
          >
            Rent premium cars from local hosts. Whether it's a weekend getaway
            or a business trip, drive the car of your dreams.
          </p>
          <button
            onClick={() => navigate("/browse")}
            style={{
              padding: "12px 32px",
              fontSize: "1.1rem",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Browse Cars
          </button>
        </div>
      </section>

      <section style={{ padding: "60px 20px", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ fontSize: "2.5rem", marginBottom: "3rem" }}>
            Why Choose LuxeDrive?
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2rem",
            }}
          >
            <div
              style={{
                padding: "30px",
                background: "#111115",
                borderRadius: "12px",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚗</div>
              <h3 style={{ marginBottom: "0.5rem" }}>Premium Selection</h3>
              <p style={{ color: "#9ca3af" }}>
                Choose from 500+ luxury and exotic vehicles
              </p>
            </div>
            <div
              style={{
                padding: "30px",
                background: "#111115",
                borderRadius: "12px",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚡</div>
              <h3 style={{ marginBottom: "0.5rem" }}>Instant Booking</h3>
              <p style={{ color: "#9ca3af" }}>
                Book your dream car in just a few clicks
              </p>
            </div>
            <div
              style={{
                padding: "30px",
                background: "#111115",
                borderRadius: "12px",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛡️</div>
              <h3 style={{ marginBottom: "0.5rem" }}>Fully Insured</h3>
              <p style={{ color: "#9ca3af" }}>
                All rentals include comprehensive insurance
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="cta-section section-padding"
        style={{ padding: "60px 20px" }}
      >
        <div className="container">
          <div
            style={{
              background: "rgba(17, 17, 21, 0.8)",
              backdropFilter: "blur(12px)",
              padding: "60px 40px",
              borderRadius: "16px",
              textAlign: "center",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              Ready to hit the road?
            </h2>
            <p style={{ color: "#9ca3af", marginBottom: "2rem" }}>
              Join thousands of satisfied travelers and car owners today.
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => navigate("/browse")}
                style={{
                  padding: "12px 32px",
                  fontSize: "1rem",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Find a Car
              </button>
              <button
                onClick={() => navigate("/register")}
                style={{
                  padding: "12px 32px",
                  fontSize: "1rem",
                  background: "transparent",
                  color: "white",
                  border: "2px solid #3b82f6",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                List Your Car
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPageSimple;
