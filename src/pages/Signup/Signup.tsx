import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AppAssets from "@/utils/Assets";
import { signupApi } from "@/apis/apiHelpers";

function Signup() {
  const navigate = useNavigate();
  const { t } = useTranslation("signupPage");

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    company?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) newErrors.name = t("errorMessages.nameRequired");
    if (!company.trim()) newErrors.company = t("errorMessages.companyRequired");

    if (!email) newErrors.email = t("errorMessages.emailRequired");
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = t("errorMessages.invalidEmail");

    if (!password) newErrors.password = t("errorMessages.passwordRequired");
    else if (password.length < 8)
      newErrors.password = t("errorMessages.passwordMinLength");

    if (!confirmPassword)
      newErrors.confirmPassword = t("errorMessages.confirmPasswordRequired");
    else if (password !== confirmPassword)
      newErrors.confirmPassword = t("errorMessages.passwordMismatch");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setLoading(true);
    const payload = {
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      password,
      password_confirmation: confirmPassword,
    };

    try {
      const response = await signupApi(payload);
      toast.success(response?.message || t("successMessage"));
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error: any) {
      toast.error(error?.message || "Signup failed. Please try again.");
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
        className="w-full flex flex-col md:flex-row justify-evenly min-h-[calc(100vh-5rem)] rounded-2xl"
      >
        {/* Left Section - Form */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 py-12">
          <img
            src={AppAssets.images.eventyLoginLogo}
            width="186"
            height="80"
            alt="Logo"
          />

          <p
            className="mt-10 text-4xl md:text-5xl font-semibold text-gray-900 font-poppins"
          >
            {t("signupTitle", "Create Account")}
          </p>

          <div className="mt-10 w-full max-w-sm space-y-4">
            {/* Name */}
            <Input
              type="text"
              placeholder={t("namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-light font-poppins text-gray-600"
              style={{ fontSize: 14, borderRadius: 12, height: 44 }}
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name}</p>
            )}

            {/* Company */}
            <Input
              type="text"
              placeholder={t("companyPlaceholder")}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="font-light font-poppins text-gray-600"
              style={{ fontSize: 14, borderRadius: 12, height: 44 }}
            />
            {errors.company && (
              <p className="text-red-500 text-xs">{errors.company}</p>
            )}

            {/* Email */}
            <Input
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="font-light font-poppins text-gray-600"
              style={{ fontSize: 14, borderRadius: 12, height: 44 }}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}

            {/* Password */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-light font-poppins text-gray-600 pr-10"
                style={{ fontSize: 14, borderRadius: 12, height: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password}</p>
            )}

            {/* Confirm Password */}
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="font-light font-poppins text-gray-600 pr-10"
                style={{ fontSize: 14, borderRadius: 12, height: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
            )}

            {/* Signup Button */}
            <Button
              onClick={handleSignUp}
              style={{ backgroundColor: "#1A1F58", borderRadius: 20 }}
              className="w-full mt-4 h-11"
              disabled={loading}
            >
              {loading ? (
                <span className="text-white">...Loading</span>
              ) : (
                <span className="text-white">{t("signupButton", "Signup")}</span>
              )}
            </Button>

            {/* Login Redirect */}
            <div className="mt-4 flex justify-center gap-1">
              <p className="text-sm text-gray-900 font-light">
                {t("alreadyHaveAccount", "Already have an account?")}
              </p>
              <p
                className="text-sm font-light text-[#3563E9] underline cursor-pointer"
                onClick={() => navigate("/login")}
              >
                {t("signInLink", "Signin")}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Image */}
        <div className="hidden md:flex justify-center items-center w-1/2">
          <img
            src={AppAssets.images.loginRightImage}
            className="w-3/4 max-w-md h-auto object-contain rounded-2xl shadow-md"
            alt="Signup visual"
          />
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default Signup;
