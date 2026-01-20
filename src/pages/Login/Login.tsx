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
  const [rememberMe, setRememberMe] = useState(false); // New state for remember me
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
      setNotification({ message: "You have been logged out.", type: "info" });
      localStorage.removeItem("loggedOut");
    }
  }, [navigate]);

  // Auto-hide notification after 3 seconds
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
      const tenantUuid =
        response?.data?.data?.current_user?.data?.attributes?.tenant_uuid;
      console.log("tenanUuiidddddddddddd", tenantUuid);
      if (tenantUuid) {
        localStorage.setItem("tenant_uuid", tenantUuid);
        console.log("✅ TENANT LOGIN:", tenantUuid);
      } else {
        console.warn("⚠️ No tenant UUID found in response");
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
      showNotification(error?.response?.data?.error || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen p-4 overflow-hidden bg-white">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                  ? "bg-red-500 text-white"
                  : "bg-blue-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      {/* Main Container with Gradient */}
      <div
        className="w-full h-[calc(100vh-2rem)] flex flex-col md:flex-row rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(150deg, rgba(228, 230, 238, 1) 1%, rgba(255, 255, 255, 1) 29%)",
        }}
      >
        {/* Left Half - Login Form */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-8 py-12">
          <div className="w-full max-w-md flex flex-col items-center">
            {/* Logo */}
            <img
              src={Assets.images.eventyLoginLogo}
              width="186"
              height="80"
              alt="Logo"
              className="mb-8 animate-float"
            />

            {/* Welcome Text */}
            <h1 className="text-5xl font-poppins font-semibold text-gray-900 mb-10 text-center">
              Welcome 👋
            </h1>

            <div className="space-y-4 w-full">
              {/* Email Field */}
              <div>
                <Input
                  className="font-light font-poppins text-gray-400"
                  style={{ fontSize: 12, borderRadius: 12, height: 40 }}
                  type="email"
                  placeholder={t("Enter your email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs font-poppins mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field + Show/Hide */}
              <div className="relative">
                <Input
                  className="font-light font-poppins text-gray-400 pr-10"
                  style={{ fontSize: 12, borderRadius: 12, height: 40 }}
                  type={showPassword ? "text" : "password"}
                  placeholder={t("Enter your password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-xs font-poppins mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot password */}
              <div className="flex gap-1">
                <p className="text-sm text-gray-900 font-poppins font-light">
                  {t("Forget password?")}
                </p>
                <p className="text-sm font-poppins font-semibold text-[#3563E9] underline cursor-pointer">
                  {t("Reset the password")}
                </p>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label
                  htmlFor="remember-me"
                  className="text-sm font-poppins text-gray-700"
                >
                  {t("Remember me")}
                </Label>
              </div>

              {/* Signin Button */}
              <Button
                onClick={handleSignIn}
                style={{ backgroundColor: "#1A1F58", borderRadius: 20 }}
                className="w-full mt-4"
                disabled={loading}
              >
                {loading ? (
                  <p className="text-white">...Loading</p>
                ) : (
                  <span className="text-white">{t("signin")}</span>
                )}
              </Button>

              {/* Signup Redirect */}
              <div className="mt-4 flex justify-center gap-1">
                <p className="text-sm text-gray-900 font-poppins font-light">
                  {t("Don't have an account?")}
                </p>
                <p
                  className="text-sm font-poppins font-light text-[#3563E9] underline cursor-pointer"
                  onClick={() => navigate("/signup")}
                >
                  {t("signup")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Half - Image */}
        <div className="hidden md:block md:w-1/2 p-6">
          <img
            src={Assets.images.loginRightImage}
            className="w-full h-full object-cover rounded-2xl"
            alt="login visual"
          />
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Login;
