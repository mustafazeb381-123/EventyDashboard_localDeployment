import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { myButtonClass, myButtonVariants } from "@/components/ui/myButton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import AppAssets from "@/utils/Assets";
import CustomStepper from "@/components/CustomStepper/CustomStepper";

interface Step1FormData {
  name: string;
  email: string;
  companyName: string;
  password: string;
  passwordConfirmation: string;
  agreeTerms: boolean;
}

interface Step2FormData {
  country: string;
  city: string;
  state: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
}

interface Step3FormData {
  useBankData: boolean;
  cardName?: string;
  cardNumber?: string;
  cvv?: string;
  useTapAccount: boolean;
  apiKey?: string;
  securityKey?: string;
}

interface Step4FormData {
  vatRegistration?: File;
  crDocument?: File;
}

interface SignupFormData
  extends Step1FormData,
    Step2FormData,
    Step3FormData,
    Step4FormData {}

// Progress Indicator Component using CustomStepper
interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  stepTitles,
}) => {
  const steps = stepTitles.map((title) => ({ label: title }));

  return (
    <CustomStepper
      steps={steps}
      activeStep={currentStep - 1}
      connectorStateColors={true}
      nonLinear={false}
      hideConnectors={false}
    />
  );
};

// Step 1: Your Data
interface Step1Props {
  onNext: (data: Step1FormData) => void;
  initialData?: Partial<Step1FormData>;
}

const Step1: React.FC<Step1Props> = ({ onNext, initialData }) => {
  const { t } = useTranslation("signupPage");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      name: initialData?.name || "",
      email: initialData?.email || "",
      companyName: initialData?.companyName || "",
      password: initialData?.password || "",
      passwordConfirmation: initialData?.passwordConfirmation || "",
      agreeTerms: initialData?.agreeTerms || false,
    },
  });

  const agreeTerms = watch("agreeTerms");

  const onSubmit = async (data: Step1FormData) => {
    onNext(data);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const stepTitles = [
    t("step1Title"),
    t("step2Title"),
    t("step3Title"),
    t("step4Title"),
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 mb-3 sm:mb-4">
        <Text className="text-gray-500 mb-3 sm:mb-4" size="sm" weight="medium">
          {t("title")}
        </Text>
        <ProgressIndicator
          currentStep={1}
          totalSteps={4}
          stepTitles={stepTitles}
        />
      </div>

      {/* Form Content */}
      <div className="flex-1 ">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          {/* Name Field */}
          <Input
            id="name"
            type="text"
            placeholder={t("namePlaceholder")}
            {...register("name")}
            className="w-full h-10 sm:h-11 text-sm border-[#A3ADBC] rounded-2xl"
          />
          <div className="h-4 mt-1">
            {errors.name && (
              <Text
                size="xs"
                color="text-red-500"
                className="animate-slide-down"
              >
                {errors.name.message}
              </Text>
            )}
          </div>

          {/* Email Field */}
          <div className="min-h-[50px] sm:min-h-[60px]">
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              {...register("email")}
              className="w-full h-10 sm:h-11 text-sm border-[#A3ADBC] rounded-2xl"
            />
            <div className="h-4 mt-1">
              {errors.email && (
                <Text
                  size="xs"
                  color="text-red-500"
                  className="animate-slide-down"
                >
                  {errors.email.message}
                </Text>
              )}
            </div>
          </div>

          {/* Company Name Field */}
          <div className="min-h-[50px] sm:min-h-[60px]">
            <Input
              id="companyName"
              type="text"
              placeholder={t("companyNamePlaceholder")}
              {...register("companyName")}
              className="w-full h-10 sm:h-11 text-sm border-[#A3ADBC] rounded-2xl"
            />
            <div className="h-4 mt-1">
              {errors.companyName && (
                <Text
                  size="xs"
                  color="text-red-500"
                  className="animate-slide-down"
                >
                  {errors.companyName.message}
                </Text>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div className="min-h-[50px] sm:min-h-[60px]">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordPlaceholder")}
                {...register("password")}
                className="w-full h-10 sm:h-11 text-sm pr-10 border-[#A3ADBC] rounded-2xl"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="h-4 mt-1">
              {errors.password && (
                <Text
                  size="xs"
                  color="text-red-500"
                  className="animate-slide-down"
                >
                  {errors.password.message}
                </Text>
              )}
            </div>
          </div>

          {/* Password Confirmation Field */}
          <div className="min-h-[50px] sm:min-h-[60px]">
            <div className="relative">
              <Input
                id="passwordConfirmation"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("confirmPasswordPlaceholder")}
                {...register("passwordConfirmation")}
                className="w-full h-10 sm:h-11 text-sm pr-10 border-[#A3ADBC] rounded-2xl"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="h-4 mt-1">
              {errors.passwordConfirmation && (
                <Text
                  size="xs"
                  color="text-red-500"
                  className="animate-slide-down"
                >
                  {errors.passwordConfirmation.message}
                </Text>
              )}
            </div>
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="min-h-[60px] sm:min-h-[68px] space-y-1">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeTerms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setValue("agreeTerms", !!checked)}
                className="mt-0.5 h-4 w-4"
              />
              <Label
                htmlFor="agreeTerms"
                className="text-xs sm:text-sm text-gray-600 leading-relaxed cursor-pointer"
              >
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
                            className="text-blue-600 hover:underline"
                          >
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
                              className="text-blue-600 hover:underline"
                            >
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
            <div className="h-4">
              {errors.agreeTerms && (
                <Text
                  size="xs"
                  color="text-red-500"
                  className="animate-slide-down"
                >
                  {errors.agreeTerms.message}
                </Text>
              )}
            </div>
          </div>

          {/* Next Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="default"
            className={`${myButtonClass} ${myButtonVariants.default} w-full h-10 sm:h-11 text-sm`}
          >
            {isSubmitting ? "Loading..." : t("nextButton")}
          </Button>

          {/* Sign in link */}
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
  );
};

// Step 2: Company Address
interface Step2Props {
  onNext: (data: Step2FormData) => void;
  onBack: () => void;
  initialData?: Partial<Step2FormData>;
}

const Step2: React.FC<Step2Props> = ({ onNext, onBack, initialData }) => {
  const { t } = useTranslation("signupPage");

  const validationSchema = yup.object({
    country: yup.string().required("Country is required"),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    addressLine1: yup.string().required("Address line 1 is required"),
    addressLine2: yup.string().required("Address line 2 is required"),
    zipCode: yup.string().required("Zip code is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Step2FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      country: initialData?.country || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      addressLine1: initialData?.addressLine1 || "",
      addressLine2: initialData?.addressLine2 || "",
      zipCode: initialData?.zipCode || "",
    },
  });

  const onSubmit = async (data: Step2FormData) => {
    onNext(data);
  };

  const stepTitles = [
    t("step1Title"),
    t("step2Title"),
    t("step3Title"),
    t("step4Title"),
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 mb-3 sm:mb-4">
        <Text className="text-gray-500 mb-3 sm:mb-4" size="sm" weight="medium">
          {t("title")}
        </Text>

        <ProgressIndicator
          currentStep={2}
          totalSteps={4}
          stepTitles={stepTitles}
        />
      </div>

      {/* Form Content */}
      <div className="flex-1 ">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div className="min-h-[60px]">
            <Input
              id="country"
              type="text"
              placeholder="Country*"
              {...register("country")}
              className="w-full h-10 text-sm border-[#A3ADBC] rounded-2xl"
            />
            <div className="h-4 mt-1">
              {errors.country && (
                <Text
                  size="xs"
                  color="text-red-500"
                  className="animate-slide-down"
                >
                  {errors.country.message}
                </Text>
              )}
            </div>
          </div>

          <div className="min-h-[60px]">
            <Input
              id="city"
              type="text"
              placeholder="City*"
              {...register("city")}
              className="w-full h-10 text-sm border-[#A3ADBC] rounded-2xl"
            />
            <div className="h-4 mt-1">
              {errors.city && (
                <Text
                  size="xs"
                  color="text-red-500"
                  className="animate-slide-down"
                >
                  {errors.city.message}
                </Text>
              )}
            </div>
          </div>

          <div className="min-h-[60px]">
            <Input
              id="state"
              type="text"
              placeholder="State*"
              {...register("state")}
              className="w-full h-10 text-sm border-[#A3ADBC] rounded-2xl"
            />
            <div className="h-4 mt-1">
              {errors.state && (
                <Text
                  size="xs"
                  color="text-red-500"
                  className="animate-slide-down"
                >
                  {errors.state.message}
                </Text>
              )}
            </div>
          </div>

          <div className="min-h-[60px]">
            <Input
              id="addressLine1"
              type="text"
              placeholder="Address line 1*"
              {...register("addressLine1")}
              className="w-full h-10 text-sm border-[#A3ADBC] rounded-2xl"
            />
            <div className="h-4 mt-1">
              {errors.addressLine1 && (
                <Text
                  size="xs"
                  color="text-red-500"
                  className="animate-slide-down"
                >
                  {errors.addressLine1.message}
                </Text>
              )}
            </div>
          </div>

          <div className="min-h-[60px]">
            <Input
              id="addressLine2"
              type="text"
              placeholder="Address line 2*"
              {...register("addressLine2")}
              className="w-full h-10 text-sm border-[#A3ADBC] rounded-2xl"
            />
            <div className="h-4 mt-1">
              {errors.addressLine2 && (
                <Text
                  size="xs"
                  color="text-red-500"
                  className="animate-slide-down"
                >
                  {errors.addressLine2.message}
                </Text>
              )}
            </div>
          </div>

          <div className="min-h-[60px]">
            <Input
              id="zipCode"
              type="text"
              placeholder="Zip code*"
              {...register("zipCode")}
              className="w-full h-10 text-sm border-[#A3ADBC] rounded-2xl"
            />
            <div className="h-4 mt-1">
              {errors.zipCode && (
                <Text
                  size="xs"
                  color="text-red-500"
                  className="animate-slide-down"
                >
                  {errors.zipCode.message}
                </Text>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className={`${myButtonClass} ${myButtonVariants.outline} flex-1 h-10 sm:h-11 text-sm`}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="default"
              className={`${myButtonClass} ${myButtonVariants.default} flex-1 h-10 sm:h-11 text-sm`}
            >
              {isSubmitting ? "Loading..." : "Next"}
            </Button>
          </div>

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
  );
};

// Step 3: Money Transfer Data
interface Step3Props {
  onNext: (data: Step3FormData) => void;
  onBack: () => void;
  initialData?: Partial<Step3FormData>;
}

const Step3: React.FC<Step3Props> = ({ onNext, onBack, initialData }) => {
  const { t } = useTranslation("signupPage");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<Step3FormData>({
    defaultValues: {
      useBankData: initialData?.useBankData || false,
      cardName: initialData?.cardName || "",
      cardNumber: initialData?.cardNumber || "",
      cvv: initialData?.cvv || "",
      useTapAccount: initialData?.useTapAccount || false,
      apiKey: initialData?.apiKey || "",
      securityKey: initialData?.securityKey || "",
    },
  });

  const useBankData = watch("useBankData");
  const useTapAccount = watch("useTapAccount");

  const onSubmit = async (data: Step3FormData) => {
    onNext(data);
  };

  const stepTitles = [
    t("step1Title"),
    t("step2Title"),
    t("step3Title"),
    t("step4Title"),
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 mb-3 sm:mb-4">
        <Text className="text-gray-500 mb-3 sm:mb-4" size="sm" weight="medium">
          {t("title")}
        </Text>
        <ProgressIndicator
          currentStep={3}
          totalSteps={4}
          stepTitles={stepTitles}
        />
      </div>

      {/* Form Content */}
      <div className="flex-1 ">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Text size="xs" className="text-blue-600">
              This data is mandatory to activate Paid option on our features.
            </Text>
          </div>

          {/* Use Bank Data Toggle */}
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <Checkbox
              id="useBankData"
              checked={useBankData}
              onCheckedChange={(checked) => setValue("useBankData", !!checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="useBankData" className="font-medium text-sm">
              Use our payment, enter your bank data
            </Label>
          </div>

          {useBankData && (
            <div className="space-y-2">
              <div className="min-h-[60px]">
                <Input
                  id="cardName"
                  type="text"
                  placeholder="Card Name*"
                  {...register("cardName")}
                  className="w-full h-10 text-sm border-[#A3ADBC] rounded-2xl"
                />
                <div className="h-4 mt-1">
                  {/* Add error handling if needed */}
                </div>
              </div>
              <div className="min-h-[60px]">
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="Card Number*"
                  {...register("cardNumber")}
                  className="w-full h-10 text-sm border-[#A3ADBC] rounded-2xl"
                />
                <div className="h-4 mt-1">
                  {/* Add error handling if needed */}
                </div>
              </div>
              <div className="min-h-[60px]">
                <Input
                  id="cvv"
                  type="text"
                  placeholder="CVV*"
                  {...register("cvv")}
                  className="w-full h-10 text-sm border-[#A3ADBC] rounded-2xl"
                />
                <div className="h-4 mt-1">
                  {/* Add error handling if needed */}
                </div>
              </div>
            </div>
          )}

          <div className="text-center py-1">
            <Text size="xs" color="text-gray-500">
              Or
            </Text>
          </div>

          {/* Use Tap Account Toggle */}
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <Checkbox
              id="useTapAccount"
              checked={useTapAccount}
              onCheckedChange={(checked) =>
                setValue("useTapAccount", !!checked)
              }
              className="h-4 w-4"
            />
            <Label htmlFor="useTapAccount" className="font-medium text-sm">
              Use your tap account.
            </Label>
          </div>

          {useTapAccount && (
            <div className="space-y-2">
              <Text size="xs" color="text-gray-600">
                If you have tap account, enter your account data here : (your
                money will transfer direct to you without fee)
              </Text>
              <div className="min-h-[60px]">
                <Input
                  id="apiKey"
                  type="text"
                  placeholder="Api Key"
                  {...register("apiKey")}
                  className="w-full h-10 text-sm border-[#A3ADBC] rounded-2xl"
                />
                <div className="h-4 mt-1">
                  {/* Add error handling if needed */}
                </div>
              </div>
              <div className="min-h-[60px]">
                <Input
                  id="securityKey"
                  type="password"
                  placeholder="Security Key"
                  {...register("securityKey")}
                  className="w-full h-10 text-sm border-[#A3ADBC] rounded-2xl"
                />
                <div className="h-4 mt-1">
                  {/* Add error handling if needed */}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className={`${myButtonClass} ${myButtonVariants.outline} flex-1 h-10 sm:h-11 text-sm`}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="default"
              className={`${myButtonClass} ${myButtonVariants.default} flex-1 h-10 sm:h-11 text-sm`}
            >
              {isSubmitting ? "Loading..." : "Next"}
            </Button>
          </div>

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
  );
};

// Step 4: Documents
interface Step4Props {
  onNext: (data: Step4FormData) => void;
  onBack: () => void;
  initialData?: Partial<Step4FormData>;
}

const Step4: React.FC<Step4Props> = ({ onNext, onBack, initialData }) => {
  const { t } = useTranslation("signupPage");
  const [vatFile, setVatFile] = useState<File | null>(null);
  const [crFile, setCrFile] = useState<File | null>(null);

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Step4FormData>({
    defaultValues: {
      vatRegistration: initialData?.vatRegistration,
      crDocument: initialData?.crDocument,
    },
  });

  const onSubmit = async () => {
    const data: Step4FormData = {
      vatRegistration: vatFile || undefined,
      crDocument: crFile || undefined,
    };
    onNext(data);
  };

  const handleVatFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVatFile(file);
    }
  };

  const handleCrFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCrFile(file);
    }
  };

  const stepTitles = [
    t("step1Title"),
    t("step2Title"),
    t("step3Title"),
    t("step4Title"),
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 mb-3 sm:mb-4">
        <Text className="text-gray-500 mb-3 sm:mb-4" size="sm" weight="medium">
          {t("title")}
        </Text>

        <ProgressIndicator
          currentStep={4}
          totalSteps={4}
          stepTitles={stepTitles}
        />
      </div>

      {/* Form Content */}
      <div className="flex-1 ">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* VAT Registration Upload */}
          <div className="space-y-1">
            <Label htmlFor="vatRegistration" className="text-sm">
              Upload VAT registration *
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative">
              <div className="flex flex-col items-center">
                <Upload className="h-6 w-6 text-gray-400 mb-1" />
                <Text size="xs" color="text-gray-600">
                  Choose file or drag & drop file
                </Text>
                <Text size="xs" color="text-gray-400">
                  PDF, PNG, TXT max file size is 5mb
                </Text>
              </div>
              <input
                type="file"
                id="vatRegistration"
                onChange={handleVatFileChange}
                accept=".pdf,.png,.txt"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {vatFile && (
              <Text
                size="xs"
                color="text-green-600"
                className="animate-slide-down"
              >
                File selected: {vatFile.name}
              </Text>
            )}
          </div>

          {/* CR Document Upload */}
          <div className="space-y-1">
            <Label htmlFor="crDocument" className="text-sm">
              Upload CR *
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative">
              <div className="flex flex-col items-center">
                <Upload className="h-6 w-6 text-gray-400 mb-1" />
                <Text size="xs" color="text-gray-600">
                  Choose file or drag & drop file
                </Text>
                <Text size="xs" color="text-gray-400">
                  PDF, PNG, TXT max file size is 5mb
                </Text>
              </div>
              <input
                type="file"
                id="crDocument"
                onChange={handleCrFileChange}
                accept=".pdf,.png,.txt"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {crFile && (
              <Text
                size="xs"
                color="text-green-600"
                className="animate-slide-down"
              >
                File selected: {crFile.name}
              </Text>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className={`${myButtonClass} ${myButtonVariants.outline} flex-1 h-10 sm:h-11 text-sm`}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="default"
              className={`${myButtonClass} ${myButtonVariants.default} flex-1 h-10 sm:h-11 text-sm`}
            >
              {isSubmitting ? "Loading..." : "Sign up"}
            </Button>
          </div>

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
  );
};

// Main Signup Component
const Signup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SignupFormData>>({});

  const handleStep1Next = (data: Step1FormData) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleStep2Next = (data: Step2FormData) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(3);
  };

  const handleStep3Next = (data: Step3FormData) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(4);
  };

  const handleStep4Next = (data: Step4FormData) => {
    const finalData = { ...formData, ...data };
    console.log("Final signup data:", finalData);
    // Here you would submit the complete form data to your API
    // For now, we'll just log it
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 onNext={handleStep1Next} initialData={formData} />;
      case 2:
        return (
          <Step2
            onNext={handleStep2Next}
            onBack={handleBack}
            initialData={formData}
          />
        );
      case 3:
        return (
          <Step3
            onNext={handleStep3Next}
            onBack={handleBack}
            initialData={formData}
          />
        );
      case 4:
        return (
          <Step4
            onNext={handleStep4Next}
            onBack={handleBack}
            initialData={formData}
          />
        );
      default:
        return <Step1 onNext={handleStep1Next} initialData={formData} />;
    }
  };
  // bg-[linear-gradient(150deg,rgba(228,230,238,1)_1%,rgba(255,255,255,1)_29%)]
  return (
    <div className="h-[100svh] p-2 sm:p-4 self-center">
      <div className="flex flex-1 h-full flex-col lg:flex-row gap-2 sm:gap-4">
        <div className="w-full lg:w-1/2 flex rounded-2xl sm:rounded-4xl justify-center items-center flex-col bg-[linear-gradient(150deg,rgba(228,230,238,1)_1%,rgba(255,255,255,1)_29%)] overflow-hidden p-4 sm:p-6">
          {/* Fixed Logo */}
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
          {/* Step Content */}
          <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
            {renderCurrentStep()}
          </div>
        </div>
        {/* Right side - Image */}
        <div className="hidden lg:flex w-full lg:w-1/2 overflow-hidden rounded-2xl sm:rounded-4xl">
          <img
            className="h-full w-full object-cover object-top"
            src={AppAssets.images.loginRightImage}
            alt="Signup illustration"
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;
