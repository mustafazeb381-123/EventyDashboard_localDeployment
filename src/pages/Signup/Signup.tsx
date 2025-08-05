import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import AppAssets from "@/utils/Assets";
import LanguageToggle from "@/components/LanguageToggle/LanguageToggle";

interface Step1FormData {
  name: string;
  email: string;
  companyName: string;
  password: string;
  passwordConfirmation: string;
  agreeTerms: boolean;
}

const Step1Data: React.FC = () => {
  const { t } = useTranslation("signupPage");
  const [showPassword, setShowPassword] = useState(false);

  // Validation schema using yup
  const validationSchema = yup.object({
    name: yup.string().required(t("errorMessages.nameRequired")),
    email: yup
      .string()
      .email(t("errorMessages.invalidEmail"))
      .required(t("errorMessages.emailRequired")),
    companyName: yup.string().required(t("errorMessages.companyNameRequired")),
    password: yup
      .string()
      .min(8, t("errorMessages.passwordMinLength"))
      .required(t("errorMessages.passwordRequired")),
    passwordConfirmation: yup
      .string()
      .oneOf([yup.ref("password")], t("errorMessages.passwordMismatch"))
      .required(t("errorMessages.confirmPasswordRequired")),
    agreeTerms: yup
      .boolean()
      .oneOf([true], t("errorMessages.agreeTermsRequired"))
      .required(t("errorMessages.agreeTermsRequired")),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Step1FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      email: "",
      companyName: "",
      password: "",
      passwordConfirmation: "",
      agreeTerms: false,
    },
  });

  const agreeTerms = watch("agreeTerms");

  const onSubmit = async (data: Step1FormData) => {
    console.log("Step 1 Data:", data);
    // Here you would typically save the data and proceed to the next step
    // For now, we'll just log the data
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* <LanguageToggle /> */}
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={AppAssets.images.eventyLoginLogo}
              alt="Eventy Logo"
              className="h-12 w-auto"
            />
          </div>

          {/* Title and Progress */}
          <div className="space-y-6">
            <Text size="xl" weight="semibold">
              {t("title")}
            </Text>

            {/* Progress indicators */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 flex-col">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  1
                </div>
                <Text as="span" size="sm" weight="medium">
                  {t("step1Title")}
                </Text>
              </div>
              <div className="w-12 h-px bg-gray-300"></div>
              <div className="flex items-center space-x-2 flex-col">
                <div className="w-6 h-6 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-xs">
                  2
                </div>
                <Text as="span" size="sm" color="text-gray-400">
                  Company Address
                </Text>
              </div>
              <div className="w-12 h-px bg-gray-300"></div>
              <div className="flex items-center space-x-2 flex-col">
                <div className="w-6 h-6 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-xs">
                  3
                </div>
                <Text as="span" size="sm" color="text-gray-400">
                  Money transfer data
                </Text>
              </div>
              <div className="w-12 h-px bg-gray-300"></div>
              <div className="flex items-center space-x-2 flex-col">
                <div className="w-6 h-6 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-xs">
                  4
                </div>
                <Text as="span" size="sm" color="text-gray-400">
                  Documents
                </Text>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <Input
              id="name"
              type="text"
              placeholder={t("namePlaceholder")}
              {...register("name")}
            />
            {errors.name && (
              <Text size="sm" color="text-red-500">
                {errors.name.message}
              </Text>
            )}

            {/* Email Field */}
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              {...register("email")}
            />
            {errors.email && (
              <Text size="sm" color="text-red-500">
                {errors.email.message}
              </Text>
            )}

            {/* Company Name Field */}
            <Input
              id="companyName"
              type="text"
              placeholder={t("companyNamePlaceholder")}
              {...register("companyName")}
            />
            {errors.companyName && (
              <Text size="sm" color="text-red-500">
                {errors.companyName.message}
              </Text>
            )}

            {/* Password Field */}
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordPlaceholder")}
                {...register("password")}
                className="pr-12"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <Text size="sm" color="text-red-500">
                {errors.password.message}
              </Text>
            )}

            {/* Password Confirmation Field */}
            <Input
              id="passwordConfirmation"
              type="password"
              placeholder={t("confirmPasswordPlaceholder")}
              {...register("passwordConfirmation")}
            />
            {errors.passwordConfirmation && (
              <Text size="sm" color="text-red-500">
                {errors.passwordConfirmation.message}
              </Text>
            )}

            {/* Terms and Conditions Checkbox */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeTerms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) =>
                    setValue("agreeTerms", !!checked)
                  }
                  className="mt-1"
                />
                <Label
                  htmlFor="agreeTerms"
                  className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                  {t("agreeTerms")
                    .split("&")
                    .map((part, index) => {
                      if (index === 0) {
                        return part + " ";
                      } else {
                        const linkText = part.trim();
                        if (linkText.includes("terms and condition")) {
                          return (
                            <Link
                              key={index}
                              to="/terms"
                              className="text-blue-600 hover:underline">
                              {t("termsAndConditions")}
                            </Link>
                          );
                        } else if (linkText.includes("privacy and policy")) {
                          return (
                            <>
                              {" & "}
                              <Link
                                key={index}
                                to="/privacy"
                                className="text-blue-600 hover:underline">
                                {t("privacyPolicy")}
                              </Link>
                            </>
                          );
                        }
                        return linkText;
                      }
                    })}
                </Label>
              </div>
              {errors.agreeTerms && (
                <Text size="sm" color="text-red-500">
                  {errors.agreeTerms.message}
                </Text>
              )}
            </div>

            {/* Next Button */}
            <Button type="submit" disabled={isSubmitting} variant="default">
              {isSubmitting ? "Loading..." : t("nextButton")}
            </Button>

            {/* Sign in link */}
            <div className="text-center pt-4">
              <Text size="sm" color="text-gray-600">
                {t("doYouHaveAccount")}{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:underline font-medium">
                  {t("signInLink")}
                </Link>
              </Text>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="flex-1 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 hidden lg:flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-transparent"></div>
        <img
          src={AppAssets.images.loginRIghtImage}
          alt="Signup illustration"
          className="relative z-10 max-w-2xl w-full h-auto object-contain"
        />
      </div>
    </div>
  );
};

const Signup: React.FC = () => {
  return <Step1Data />;
};

export default Signup;
