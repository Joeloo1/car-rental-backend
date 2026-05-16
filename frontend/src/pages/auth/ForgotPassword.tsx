import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import api from "../../api/axios";
import "./Login.css"; // Reuse login styles

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await api.post("/auth/forgot-Password", { email });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container glass" style={{ maxWidth: "500px" }}>
        <div className="login-right" style={{ width: "100%" }}>
          <div className="login-form-container">
            <div className="login-header">
              <h2>Forgot Password?</h2>
              <p>
                Enter your email and we'll send you a link to reset your
                password.
              </p>
            </div>

            {isSuccess ? (
              <div
                className="success-view animate-fade-in"
                style={{ textAlign: "center", padding: "2rem 0" }}
              >
                <div
                  className="success-icon"
                  style={{ fontSize: "3rem", marginBottom: "1rem" }}
                >
                  📧
                </div>
                <h3>Check your email</h3>
                <p>
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <Link
                  to="/login"
                  className="btn-primary"
                  style={{
                    marginTop: "1.5rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <ArrowLeft size={18} />
                  Back to Login
                </Link>
              </div>
            ) : (
              <form className="login-form" onSubmit={handleSubmit}>
                {error && <div className="error-message glass">{error}</div>}

                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={20} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="login-submit"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <span className="loader"></span>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>

                <div className="login-footer">
                  <Link
                    to="/login"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <ArrowLeft size={18} />
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
