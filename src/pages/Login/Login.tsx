import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Assets from "../../utils/Assets";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
      toast.info("You have been logged out.");
      localStorage.removeItem("loggedOut");
    }
  }, [navigate]);

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
      const tenantUuid = response?.data?.data?.current_user?.data?.attributes?.tenant_uuid;
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

      toast.success("Logged in successfully!");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Login error", error);
      toast.error(error?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <div
        style={{
          background:
            "linear-gradient(150deg,rgba(228, 230, 238, 1) 1%, rgba(255, 255, 255, 1) 29%)",
        }}
        className="w-full flex flex-col md:flex-row justify-evenly min-h-[calc(100vh-5rem)]  rounded-2xl"
      >
        {/* Left Section (Form) */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-4 py-8">
          <img
            src={Assets.images.eventyLoginLogo}
            width="186"
            height="80"
            alt="Logo"
          />

          <p
            style={{ fontSize: 48 }}
            className="mt-10 font-poppins font-semibold text-gray-900"
          >
            Welcome 👋
          </p>
          <div className="mt-10 w-full max-w-sm space-y-4">
            {/* Email Field */}
            <Input
              className="font-light font-poppins text-gray-400"
              style={{ fontSize: 12, borderRadius: 12, height: 40 }}
              type="email"
              placeholder={t("Enter your email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-xs font-poppins">
                {errors.email}
              </p>
            )}

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
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs font-poppins">
                {errors.password}
              </p>
            )}

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
                onCheckedChange={setRememberMe}
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

        {/* Right Section (Image) */}
        <div className="hidden md:flex justify-center items-center w-1/2">
          <img
            src={Assets.images.loginRightImage}
            className=" w-2/3 max-w-md h-auto object-cover rounded-lg"
            alt="login visual"
          />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
