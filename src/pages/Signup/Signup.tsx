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

interface SignupFormData {
  name: string;
  email: string;
  company: string;
  password: string;
  passwordConfirmation: string;
}

const RHFInput = React.forwardRef<HTMLInputElement, any>((props, ref) => (
  <Input ref={ref} {...props} />
));
RHFInput.displayName = "RHFInput";

function Signup() {
  const { t } = useTranslation("signupPage");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const validationSchema = yup.object({
    name: yup.string().trim().required(t("errorMessages.nameRequired")),
    company: yup.string().trim().required(t("errorMessages.companyRequired")),
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
      const payload = {
        name: data.name.trim(),
        email: data.email.trim(),
        company: data.company.trim(),
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
        response?.data?.message || "Signup successful!",
        "success"
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
                : (field as keyof SignupFormData);
            setError(key, { message: (messages as string[]).join(", ") });
          }
        );
      } else if (error?.response?.data?.error) {
        showNotification(error.response.data.error, "error");
      } else {
        showNotification("Signup failed. Please try again.", "error");
      }
    }
  };

  const renderPasswordInput = (
    id: keyof SignupFormData,
    placeholder: string,
    show: boolean,
    toggle: () => void
  ) => (
    <div className="relative">
      <RHFInput
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        {...register(id)}
        className="w-full h-10 sm:h-11 text-sm pr-10 border-[#A3ADBC] rounded-2xl"
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

  const renderInput = (
    id: keyof SignupFormData,
    placeholder: string,
    type: string = "text"
  ) => (
    <>
      <RHFInput
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(id)}
        className="w-full h-10 sm:h-11 text-sm border-[#A3ADBC] rounded-2xl"
      />
      {errors[id] && (
        <Text size="xs" color="text-red-500" className="animate-slide-down">
          {errors[id]?.message}
        </Text>
      )}
    </>
  );

  return (
    <div className="h-[100svh] p-2 sm:p-4 self-center">
      <div className="flex flex-1 h-full flex-col lg:flex-row gap-2 sm:gap-4">
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 flex rounded-2xl sm:rounded-4xl justify-center items-center flex-col bg-[linear-gradient(150deg,rgba(228,230,238,1)_1%,rgba(255,255,255,1)_29%)] overflow-hidden p-4 sm:p-6">
          <div className="pb-2 flex flex-col items-center">
            <img
              className="h-[60px] sm:h-[80px]"
              src={AppAssets.images.eventyLoginLogo}
              alt="Eventy Logo"
            />
            <span className="pb-2 text-lg font-semibold text-[#0F4999]">
              Signup
            </span>
          </div>

          <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              {renderInput("name", t("namePlaceholder"))}
              {renderInput("company", t("companyPlaceholder"))}
              {renderInput("email", t("emailPlaceholder"), "email")}
              {renderPasswordInput(
                "password",
                t("passwordPlaceholder"),
                showPassword,
                () => setShowPassword(!showPassword)
              )}
              {renderPasswordInput(
                "passwordConfirmation",
                t("confirmPasswordPlaceholder"),
                showConfirmPassword,
                () => setShowConfirmPassword(!showConfirmPassword)
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                variant="default"
                className={`${myButtonClass} ${myButtonVariants.default} w-full h-10 sm:h-11 text-sm`}
              >
                {isSubmitting ? "Loading..." : t("nextButton")}
              </Button>

              <div className="text-center pt-1">
                <Text size="xs" color="text-gray-600">
                  {t("doYouHaveAccount")}{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {t("signInLink")}
                  </Link>
                </Text>
              </div>
            </form>
          </div>
        </div>

        {/* Right side Image */}
        <div className="hidden lg:flex w-full lg:w-1/2 overflow-hidden rounded-2xl sm:rounded-4xl">
          <img
            className="h-full w-full object-cover object-top"
            src={AppAssets.images.loginRightImage}
            alt="Signup illustration"
          />
        </div>
      </div>

      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

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
      `}</style>
    </div>
  );
}

export default Signup;
