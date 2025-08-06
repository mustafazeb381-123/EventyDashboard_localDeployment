import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import AppAssets from "@/utils/Assets";

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
  addressLine2?: string;
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

// Progress Indicator Component
interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
}) => {
  return (
    <div className="flex items-center justify-between max-w-lg">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <React.Fragment key={stepNumber}>
            <div className="flex items-center flex-col">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-500"
                }`}>
                {stepNumber}
              </div>
              <Text
                as="span"
                size="sm"
                weight={isActive ? "medium" : "normal"}
                color={isActive ? "text-gray-900" : "text-gray-400"}
                className="mt-2 text-center max-w-20">
                {stepTitles[index]}
              </Text>
            </div>
            {stepNumber < totalSteps && (
              <div className="flex-1 h-px bg-gray-300 mx-3"></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
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

  const stepTitles = [
    t("step1Title"),
    "Company Address",
    "Money transfer data",
    "Documents",
  ];

  return (
    <div className="space-y-6">
      <Text size="xl" weight="semibold">
        {t("title")}
      </Text>

      <ProgressIndicator
        currentStep={1}
        totalSteps={4}
        stepTitles={stepTitles}
      />

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div>
          <Input
            id="name"
            type="text"
            placeholder={t("namePlaceholder")}
            {...register("name")}
            className="w-full"
          />
          {errors.name && (
            <Text size="sm" color="text-red-500" className="mt-1">
              {errors.name.message}
            </Text>
          )}
        </div>

        {/* Email Field */}
        <div>
          <Input
            id="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            {...register("email")}
            className="w-full"
          />
          {errors.email && (
            <Text size="sm" color="text-red-500" className="mt-1">
              {errors.email.message}
            </Text>
          )}
        </div>

        {/* Company Name Field */}
        <div>
          <Input
            id="companyName"
            type="text"
            placeholder={t("companyNamePlaceholder")}
            {...register("companyName")}
            className="w-full"
          />
          {errors.companyName && (
            <Text size="sm" color="text-red-500" className="mt-1">
              {errors.companyName.message}
            </Text>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("passwordPlaceholder")}
              {...register("password")}
              className="w-full pr-12"
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
            <Text size="sm" color="text-red-500" className="mt-1">
              {errors.password.message}
            </Text>
          )}
        </div>

        {/* Password Confirmation Field */}
        <div>
          <Input
            id="passwordConfirmation"
            type="password"
            placeholder={t("confirmPasswordPlaceholder")}
            {...register("passwordConfirmation")}
            className="w-full"
          />
          {errors.passwordConfirmation && (
            <Text size="sm" color="text-red-500" className="mt-1">
              {errors.passwordConfirmation.message}
            </Text>
          )}
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="agreeTerms"
              checked={agreeTerms}
              onCheckedChange={(checked) => setValue("agreeTerms", !!checked)}
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
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="default"
          className="w-full">
          {isSubmitting ? "Loading..." : t("nextButton")}
        </Button>

        {/* Sign in link */}
        <div className="text-center pt-2">
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
    addressLine2: yup.string().optional(),
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
    "Company Address",
    "Money transfer data",
    "Documents",
  ];

  return (
    <div className="space-y-6">
      <Text size="xl" weight="semibold">
        {t("title")}
      </Text>

      <ProgressIndicator
        currentStep={2}
        totalSteps={4}
        stepTitles={stepTitles}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            id="country"
            type="text"
            placeholder="Country*"
            {...register("country")}
            className="w-full"
          />
          {errors.country && (
            <Text size="sm" color="text-red-500" className="mt-1">
              {errors.country.message}
            </Text>
          )}
        </div>

        <div>
          <Input
            id="city"
            type="text"
            placeholder="City*"
            {...register("city")}
            className="w-full"
          />
          {errors.city && (
            <Text size="sm" color="text-red-500" className="mt-1">
              {errors.city.message}
            </Text>
          )}
        </div>

        <div>
          <Input
            id="state"
            type="text"
            placeholder="State*"
            {...register("state")}
            className="w-full"
          />
          {errors.state && (
            <Text size="sm" color="text-red-500" className="mt-1">
              {errors.state.message}
            </Text>
          )}
        </div>

        <div>
          <Input
            id="addressLine1"
            type="text"
            placeholder="Address line 1*"
            {...register("addressLine1")}
            className="w-full"
          />
          {errors.addressLine1 && (
            <Text size="sm" color="text-red-500" className="mt-1">
              {errors.addressLine1.message}
            </Text>
          )}
        </div>

        <div>
          <Input
            id="addressLine2"
            type="text"
            placeholder="Address line 2*"
            {...register("addressLine2")}
            className="w-full"
          />
        </div>

        <div>
          <Input
            id="zipCode"
            type="text"
            placeholder="Zip code*"
            {...register("zipCode")}
            className="w-full"
          />
          {errors.zipCode && (
            <Text size="sm" color="text-red-500" className="mt-1">
              {errors.zipCode.message}
            </Text>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="flex-1">
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="default"
            className="flex-1">
            {isSubmitting ? "Loading..." : "Next"}
          </Button>
        </div>

        <div className="text-center pt-2">
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
    formState: { errors, isSubmitting },
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
    "Company Address",
    "Money transfer data",
    "Documents",
  ];

  return (
    <div className="space-y-6">
      <Text size="xl" weight="semibold">
        {t("title")}
      </Text>

      <ProgressIndicator
        currentStep={3}
        totalSteps={4}
        stepTitles={stepTitles}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <Text size="sm" className="text-blue-600 mb-4">
            This data is mandatory to activate Paid option on our features.
          </Text>
        </div>

        {/* Use Bank Data Toggle */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <Checkbox
            id="useBankData"
            checked={useBankData}
            onCheckedChange={(checked) => setValue("useBankData", !!checked)}
          />
          <Label htmlFor="useBankData" className="font-medium">
            Use our payment, enter your bank data
          </Label>
        </div>

        {useBankData && (
          <div className="space-y-4">
            <Input
              id="cardName"
              type="text"
              placeholder="Card Name*"
              {...register("cardName")}
              className="w-full"
            />
            <Input
              id="cardNumber"
              type="text"
              placeholder="Card Number*"
              {...register("cardNumber")}
              className="w-full"
            />
            <Input
              id="cvv"
              type="text"
              placeholder="CVV*"
              {...register("cvv")}
              className="w-full"
            />
          </div>
        )}

        <div className="text-center">
          <Text size="sm" color="text-gray-500">
            Or
          </Text>
        </div>

        {/* Use Tap Account Toggle */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <Checkbox
            id="useTapAccount"
            checked={useTapAccount}
            onCheckedChange={(checked) => setValue("useTapAccount", !!checked)}
          />
          <Label htmlFor="useTapAccount" className="font-medium">
            Use your tap account.
          </Label>
        </div>

        {useTapAccount && (
          <div className="space-y-4">
            <Text size="sm" color="text-gray-600">
              If you have tap account, enter your account data here : (your
              money will transfer direct to you without fee)
            </Text>
            <Input
              id="apiKey"
              type="text"
              placeholder="Api Key"
              {...register("apiKey")}
              className="w-full"
            />
            <Input
              id="securityKey"
              type="password"
              placeholder="Security Key"
              {...register("securityKey")}
              className="w-full"
            />
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="flex-1">
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="default"
            className="flex-1">
            {isSubmitting ? "Loading..." : "Next"}
          </Button>
        </div>

        <div className="text-center pt-2">
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
    "Company Address",
    "Money transfer data",
    "Documents",
  ];

  return (
    <div className="space-y-6">
      <Text size="xl" weight="semibold">
        {t("title")}
      </Text>

      <ProgressIndicator
        currentStep={4}
        totalSteps={4}
        stepTitles={stepTitles}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* VAT Registration Upload */}
        <div className="space-y-2">
          <Label htmlFor="vatRegistration">Upload VAT registration *</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <Text size="sm" color="text-gray-600">
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
            <Text size="sm" color="text-green-600">
              File selected: {vatFile.name}
            </Text>
          )}
        </div>

        {/* CR Document Upload */}
        <div className="space-y-2">
          <Label htmlFor="crDocument">Upload CR *</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center relative">
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <Text size="sm" color="text-gray-600">
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
            <Text size="sm" color="text-green-600">
              File selected: {crFile.name}
            </Text>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="flex-1">
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="default"
            className="flex-1">
            {isSubmitting ? "Loading..." : "Sign up"}
          </Button>
        </div>

        <div className="text-center pt-2">
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

  return (
    <div
      className="flex w-full h-[100vh] rounded-[48px] border-white border-[24px] overflow-hidden justify-between items-center"
      style={{
        background:
          "linear-gradient(150deg,rgba(228, 230, 238, 1) 1%, rgba(255, 255, 255, 1) 29%)",
      }}>
      <div className="flex-1 flex flex-row h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="px-4 w-full max-w-md">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img
                src={AppAssets.images.eventyLoginLogo}
                alt="Eventy Logo"
                className="h-12 w-auto"
              />
            </div>

            {renderCurrentStep()}
          </div>
        </div>

        {/* Right side - Image */}
        <div className="flex-1 flex items-center rounded-4xl overflow-hidden justify-center max-w-[684px]">
          <img
            src={AppAssets.images.loginRIghtImage}
            alt="Signup illustration"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;
