import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Assets from "../../utils/Assets";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { loginApi } from "@/apis/apiHelpers";

function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
      return;
    }

    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    const wasLoggedOut = localStorage.getItem("loggedOut");

    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    if (savedPassword) {
      setPassword(savedPassword);
    }

    if (wasLoggedOut) {
      setNotification({
        message: "You have been logged out.",
        type: "info",
      });
      localStorage.removeItem("loggedOut");
    }
  }, [navigate]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotification({ message, type });
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email address.";

    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 6)
      newErrors.password = "Password should be at least 6 characters long.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    setLoading(true);
    const data = {
      email: email,
      password: password,
    };

    try {
      const response = await loginApi(data);
      console.log("Login response", response);

      const currentUserAttrs =
        response?.data?.data?.current_user?.data?.attributes;
      const tenantUuid = currentUserAttrs?.tenant_uuid;
      console.log("tenanUuiidddddddddddd", tenantUuid);

      if (tenantUuid) {
        localStorage.setItem("tenant_uuid", tenantUuid);
        console.log("✅ TENANT LOGIN:", tenantUuid);
      } else {
        console.warn("⚠️ No tenant UUID found in response");
      }

      // Store current user for "Printed By" and other features
      if (currentUserAttrs) {
        const name = currentUserAttrs?.name ?? currentUserAttrs?.full_name ?? "";
        const email = currentUserAttrs?.email ?? "";
        localStorage.setItem("current_user_name", name);
        localStorage.setItem("current_user_email", email);
      }

      const token = response?.headers?.["access-token"];
      localStorage.setItem("token", token);

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      showNotification("Logged in successfully!", "success");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error: any) {
      console.error("Login error", error);
      showNotification(
        error?.response?.data?.error || "Login failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`notification-toast ${notification.type}`}
        >
          {notification.message}
        </div>
      )}

      {/* Background Image */}
      <div className="login-background">
        <img src={Assets.images.loginbg} alt="Background" />
      </div>

      {/* Login Card */}
      <div className="login-card">
        {/* Logo */}
        <div className="items-center justify-center flex"> 
        <img
              src={Assets.images.eventyLoginLogo}
              width="186"
              height="80"
              alt="Logo"
              className="mb-8 animate-float align-center"
            />
            </div>

        {/* Welcome Text */}
        <h1 className="login-title">Welcome!</h1>

        {/* Email Field */}
        <div className="input-group">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div className="input-group">
          <div className="password-wrapper">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        {/* Forgot Password & Remember Me */}
        <div className="login-options">
          <span className="forgot-text">Forget Password?</span>
          <a href="/reset-password" className="reset-link">
            Reset Password
          </a>
        </div>

        <div className="remember-me-section">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          <Label htmlFor="remember" className="remember-label">
            Remember me
          </Label>
        </div>

        {/* Sign In Button */}
        <Button
          onClick={handleSignIn}
          disabled={loading}
          className="signin-button"
        >
          {loading ? "Loading..." : t("signin")}
        </Button>

        {/* Sign Up Link */}
        <div className="signup-link">
          <span>{t("Don't have an account?")}</span>
          <a onClick={() => navigate("/signup")} className="signup-text">
            {t("signup")}
          </a>
        </div>
      </div>

      <style>{`
        .login-wrapper {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .login-background img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .login-card {
          position: relative;
          z-index: 10;
          width: 90%;
          max-width: 500px;
          padding: 48px 44px;
          background: linear-gradient(180deg, rgba(60, 65, 75, 0.95) 0%, rgba(70, 75, 85, 0.92) 50%, rgba(80, 85, 95, 0.88) 100%);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 28px;
        }

        .logo-icon {
          position: relative;
          width: 48px;
          height: 48px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
        }

        .logo-square {
          border-radius: 6px;
        }

        .logo-pink {
          background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
          grid-column: 2;
          grid-row: 1;
        }

        .logo-cyan {
          background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);
          grid-column: 1;
          grid-row: 2;
        }

        .logo-purple {
          background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
          grid-column: 2;
          grid-row: 2;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .logo-eventy {
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.5px;
        }

        .logo-arabic {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          opacity: 0.95;
        }

        .login-title {
          font-size: 42px;
          font-weight: 700;
          color: #ffffff;
          text-align: center;
          margin-bottom: 36px;
          letter-spacing: -0.5px;
        }

        .input-group {
          margin-bottom: 18px;
        }

        .login-input {
          width: 100%;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          color: #ffffff;
          font-size: 15px;
          transition: all 0.3s ease;
        }

        .login-input::placeholder {
          color: rgba(255, 255, 255, 0.45);
        }

        .login-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(100, 150, 255, 0.5);
        }

        .password-wrapper {
          position: relative;
          width: 100%;
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s ease;
        }

        .password-toggle:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .error-text {
          color: #ff6b6b;
          font-size: 13px;
          margin-top: 6px;
          margin-left: 4px;
        }

        .login-options {
          display: flex;
          gap: 6px;
          margin-bottom: 14px;
          font-size: 14px;
          align-items: center;
        }

        .forgot-text {
          color: rgba(255, 255, 255, 0.7);
        }

        .reset-link {
          color: #60a5fa;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .reset-link:hover {
          color: #93c5fd;
          text-decoration: underline;
        }

        .remember-me-section {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 32px;
        }

        .remember-label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          cursor: pointer;
          user-select: none;
        }

        .signin-button {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 20px;
        }

        .signin-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4);
        }

        .signin-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .signup-link {
          text-align: center;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
        }

        .signup-link span {
          margin-right: 6px;
        }

        .signup-text {
          color: #60a5fa;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .signup-text:hover {
          color: #93c5fd;
          text-decoration: underline;
        }

        .notification-toast {
          position: fixed;
          top: 24px;
          right: 24px;
          padding: 16px 24px;
          border-radius: 12px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          z-index: 1000;
          animation: slideInRight 0.3s ease-out;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .notification-toast.success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .notification-toast.error {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .notification-toast.info {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        /* Responsive Design */
        @media (max-width: 640px) {
          .login-card {
            width: 95%;
            padding: 36px 28px;
          }

          .login-title {
            font-size: 36px;
          }

          .login-options {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
