import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Globe } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "../auth/Login.css";
import "./Register.css";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "user" as "user" | "lender",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container glass">
        <div className="login-left desktop-only register-bg">
          <div className="login-overlay"></div>
          <div className="login-left-content">
            <h1 className="hero-title">
              Join the <span className="text-gradient">Elite</span>
            </h1>
            <p>
              Sign up today and get access to the world's most exclusive car
              collection.
            </p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-container">
            <div className="login-header">
              <h2>Create Account</h2>
              <p>Join LuxeDrive and start your journey</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              {error && <div className="error-message glass">{error}</div>}

              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
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
                <label>Confirm Password</label>
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

              <div className="form-group">
                <label>I want to</label>
                <select
                  className="auth-select"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as "user" | "lender",
                    })
                  }
                >
                  <option value="user">Rent a Car (Borrower)</option>
                  <option value="lender">List My Car (Lender)</option>
                </select>
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input type="checkbox" required />I agree to the{" "}
                  <Link to="/terms">Terms of Service</Link>
                </label>
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
                    <span>Create Account</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="divider-h">
              <span>Or sign up with</span>
            </div>

            <div className="social-auth-btns">
              <button className="social-btn glass">
                <Globe size={20} />
                <span>Google</span>
              </button>
              <button className="social-btn glass">
                <Globe size={20} />
                <span>Github</span>
              </button>
            </div>

            <div className="login-footer">
              <p>
                Already have an account? <Link to="/login">Sign in here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
