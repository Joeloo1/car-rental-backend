import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import api from "../../api/axios";
import "./Login.css";

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    passwordConfirm: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await api.patch(`/auth/reset-password/${token}`, formData);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
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
              <h2>Reset Password</h2>
              <p>Choose a new secure password for your account.</p>
            </div>

            {isSuccess ? (
              <div
                className="success-view animate-fade-in"
                style={{ textAlign: "center", padding: "2rem 0" }}
              >
                <div
                  className="success-icon"
                  style={{ color: "var(--success)", marginBottom: "1rem" }}
                >
                  <CheckCircle size={64} />
                </div>
                <h3>Password Reset!</h3>
                <p>
                  Your password has been successfully updated. You can now log
                  in.
                </p>
                <Link
                  to="/login"
                  className="login-submit"
                  style={{
                    marginTop: "1.5rem",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <span>Go to Login</span>
                </Link>
              </div>
            ) : (
              <form className="login-form" onSubmit={handleSubmit}>
                {error && <div className="error-message glass">{error}</div>}

                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      minLength={8}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={formData.passwordConfirm}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passwordConfirm: e.target.value,
                        })
                      }
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="login-submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loader"></span>
                  ) : (
                    <>
                      <span>Update Password</span>
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

export default ResetPassword;
