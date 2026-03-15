import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import AppAssets from "@/utils/Assets";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { myButtonClass, myButtonVariants } from "@/components/ui/myButton";
import { Text } from "@/components/ui/text";

import { signupApi } from "@/apis/apiHelpers";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

/** Sub-domain: max 6 chars, a-z, 0-9, dash only. Sent as `company` to API. */
const SUBDOMAIN_REGEX = /^[a-z0-9-]{1,6}$/;
const SUBDOMAIN_MAX_LENGTH = 6;

/** Workspace URL for preview: on localhost shows subdomain.localhost:port; otherwise uses VITE_APP_ROOT_DOMAIN or eventy.com. */
function getWorkspaceUrlConfig() {
  if (typeof window === "undefined")
    return { rootDomain: "eventy.com", port: "", isLocalhost: false };
  const hostname = window.location.hostname;
  const port = window.location.port || "";
  const isLocalhost =
    hostname === "localhost" || hostname === "127.0.0.1";
  const rootDomain =
    (import.meta as any).env?.VITE_APP_ROOT_DOMAIN ||
    (isLocalhost ? "localhost" : "eventy.com");
  return { rootDomain, port, isLocalhost };
}

function buildWorkspacePreviewUrl(subdomain: string, rootDomain: string, port: string) {
  if (!subdomain) return "";
  const protocol = typeof window !== "undefined" ? window.location.protocol : "https:";
  const withPort = port ? `:${port}` : "";
  return `${protocol}//${subdomain}.${rootDomain}${withPort}`;
}

interface SignupFormData {
  name: string;
  email: string;
  subdomain: string;
  password: string;
  passwordConfirmation: string;
}

const RHFInput = React.forwardRef<HTMLInputElement, any>((props, ref) => (
  <Input ref={ref} {...props} />
));
RHFInput.displayName = "RHFInput";

function Signup() {
  const { t, i18n } = useTranslation("signupPage");
  const navigate = useNavigate();
  const isArabic = i18n.language?.toLowerCase().startsWith("ar");
  const dir = isArabic ? "rtl" : "ltr";
  const isRTL = isArabic;
  const lang = i18n.language || "en";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const validationSchema = yup.object({
    name: yup.string().trim().required(t("errorMessages.nameRequired")),
    subdomain: yup
      .string()
      .trim()
      .required(t("errorMessages.subdomainRequired"))
      .max(SUBDOMAIN_MAX_LENGTH, t("errorMessages.subdomainMaxLength"))
      .matches(SUBDOMAIN_REGEX, t("errorMessages.subdomainInvalid")),
    email: yup
      .string()
      .trim()
      .email(t("errorMessages.invalidEmail"))
      .required(t("errorMessages.emailRequired")),
    password: yup
      .string()
      .min(8, t("errorMessages.passwordMinLength"))
      .required(t("errorMessages.passwordRequired")),
    passwordConfirmation: yup
      .string()
      .oneOf([yup.ref("password")], t("errorMessages.passwordMismatch"))
      .required(t("errorMessages.confirmPasswordRequired")),
  });

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      const subdomain = data.subdomain.trim().toLowerCase();
      const payload = {
        name: data.name.trim(),
        email: data.email.trim(),
        company: subdomain,
        password: data.password,
        password_confirmation: data.passwordConfirmation,
      };
      console.log("Signup payload:", payload);

      const response = await signupApi(payload);
      console.log("Signup response:", response);

      // const token =
      //   response.headers["access-token"] || response.data?.data?.token;

      // if (token) {
      //   console.log("Token:", token);
      //   localStorage.setItem("token", token);
      // }

      showNotification(
        response?.data?.message || t("successMessage"),
        "success",
      );
      setTimeout(() => navigate("/login"), 1000);
    } catch (error: any) {
      console.error("Signup error:", error);

      if (error?.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(
          ([field, messages]) => {
            const key =
              field === "password_confirmation"
                ? "passwordConfirmation"
                : field === "company"
                  ? "subdomain"
                  : (field as keyof SignupFormData);
            setError(key, { message: (messages as string[]).join(", ") });
          },
        );
      } else if (error?.response?.data?.error) {
        showNotification(error.response.data.error, "error");
      } else {
        showNotification(t("signupFailed"), "error");
      }
    }
  };

  const renderPasswordInput = (
    id: keyof SignupFormData,
    placeholder: string,
    show: boolean,
    toggle: () => void,
  ) => (
    <div className="relative">
      <RHFInput
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        {...register(id)}
        className={`w-full h-10 sm:h-11 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-2xl ${isRTL ? "pl-10" : "pr-10"}`}
      />
      <button
        type="button"
        onClick={toggle}
        className={`absolute top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 ${isRTL ? "left-3" : "right-3"}`}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      {errors[id] && (
        <Text size="xs" color="text-red-500" className="animate-slide-down">
          {errors[id]?.message}
        </Text>
      )}
    </div>
  );

  const renderSubdomainInput = () => {
    const subdomain = watch("subdomain")?.trim().toLowerCase() || "";
    const { rootDomain, port, isLocalhost } = getWorkspaceUrlConfig();
    const suffix = rootDomain;
    const preview =
      subdomain.length > 0
        ? buildWorkspacePreviewUrl(subdomain, rootDomain, port)
        : t("subdomainWorkspacePreviewEmpty");
    return (
      <div className="space-y-1">
        <div className="relative">
          <RHFInput
            id="subdomain"
            type="text"
            placeholder={t("subdomainPlaceholder")}
            {...register("subdomain", {
              onChange: (e) => {
                const v = e.target.value.replace(/\s/g, "").toLowerCase();
                e.target.value = v.slice(0, SUBDOMAIN_MAX_LENGTH);
              },
            })}
            className={`w-full h-10 sm:h-11 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-2xl lowercase ${isRTL ? "pl-24" : "pr-24"}`}
            maxLength={SUBDOMAIN_MAX_LENGTH}
            autoComplete="off"
          />
          <span
            className={`absolute top-1/2 -translate-y-1/2 text-xs text-white/50 ${isRTL ? "left-3" : "right-3"}`}
          >
            .{suffix}
          </span>
        </div>
        <Text size="xs" className="text-white/70">
          {t("subdomainHint")} {preview}
        </Text>
        {isLocalhost && (
          <Text size="xs" className="text-white/60 italic">
            {t("subdomainLocalhostNote")}
          </Text>
        )}
        {errors.subdomain && (
          <Text size="xs" color="text-red-500" className="animate-slide-down">
            {errors.subdomain?.message}
          </Text>
        )}
      </div>
    );
  };

  const renderInput = (
    id: keyof SignupFormData,
    placeholder: string,
    type: string = "text",
  ) => (
    <>
      <RHFInput
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(id)}
        className="w-full h-10 sm:h-11 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-2xl"
      />
      {errors[id] && (
        <Text size="xs" color="text-red-500" className="animate-slide-down">
          {errors[id]?.message}
        </Text>
      )}
    </>
  );

  const handleChangeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="signup-wrapper" dir={dir} lang={lang}>
      {/* Notification Toast - same as Login */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Background Image - same as Login */}
      <div className="signup-background">
        <img src={AppAssets.images.loginbg} alt="Background" />
      </div>

      <div className="signup-content">
        {/* Centered form card - same as Login */}
        <div className="signup-card">
          <div className="pb-2 flex flex-col items-center">
            <img
              className="h-[60px] sm:h-[80px]"
              src={AppAssets.images.eventyLoginLogo}
              alt="Eventy Logo"
            />
            <span className="pb-2 text-lg font-semibold text-white">
              {t("signupTitle")}
            </span>
            {/* Language toggle: English | Arabic (direction follows language) */}
            <div className="flex items-center justify-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 shadow-sm pt-1 pb-2">
              <button
                type="button"
                onClick={() => handleChangeLanguage("en")}
                className={`rounded px-2 py-1 text-sm font-medium transition-colors ${lang.startsWith("en") ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10"}`}
              >
                English
              </button>
              <span className="text-white/40">|</span>
              <button
                type="button"
                onClick={() => handleChangeLanguage("ar")}
                className={`rounded px-2 py-1 text-sm font-medium transition-colors ${isArabic ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10"}`}
              >
                العربية
              </button>
            </div>
          </div>

          <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              {renderInput("name", t("namePlaceholder"))}
              {renderSubdomainInput()}
              {renderInput("email", t("emailPlaceholder"), "email")}
              {renderPasswordInput(
                "password",
                t("passwordPlaceholder"),
                showPassword,
                () => setShowPassword(!showPassword),
              )}
              {renderPasswordInput(
                "passwordConfirmation",
                t("confirmPasswordPlaceholder"),
                showConfirmPassword,
                () => setShowConfirmPassword(!showConfirmPassword),
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                variant="default"
                className={`${myButtonClass} ${myButtonVariants.default} w-full h-10 sm:h-11 text-sm`}
              >
                {isSubmitting ? t("loading") : t("nextButton")}
              </Button>

              <div className="text-center pt-1">
                <Text size="xs" className="text-white/80">
                  {t("doYouHaveAccount")}{" "}
                  <Link
                    to="/login"
                    className="text-[#93c5fd] hover:text-[#60a5fa] hover:underline font-medium"
                  >
                    {t("signInLink")}
                  </Link>
                </Text>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .signup-wrapper {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .signup-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .signup-background img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .signup-content {
          position: relative;
          z-index: 10;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .signup-card {
          width: 90%;
          max-width: 500px;
          padding: 48px 44px;
          background: linear-gradient(180deg, rgba(60, 65, 75, 0.95) 0%, rgba(70, 75, 85, 0.92) 50%, rgba(80, 85, 95, 0.88) 100%);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          animation: signupFadeInUp 0.6s ease-out;
        }

        @keyframes signupFadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
      `}</style>
    </div>
  );
}

export default Signup;
