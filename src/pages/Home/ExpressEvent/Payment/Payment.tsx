import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const VAT_RATE = 0.15;
const VAT_ERROR_MSG =
  "Saudi VAT number must start and end with 3.";

type BillingType = "individual" | "company";
type SupportLevel = "none" | "basic" | "standard" | "premium";

const DEFAULT_CONTACT = {
  name: "Abdullah Saleh",
  email: "abdt23@gmail.com",
  phone: "+358 50 1234567",
};

interface PaymentProps {
  onNext: (id?: string | number, _plan?: string) => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps?: number;
  plan?: string;
  toggleStates?: unknown;
  eventId?: string;
}

const Payment: React.FC<PaymentProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps = 0,
}) => {
  const [contact] = useState(DEFAULT_CONTACT);
  const [billingType, setBillingType] = useState<BillingType>("individual");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [vatError, setVatError] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [buildingNo, setBuildingNo] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const [badgePrinting, setBadgePrinting] = useState(false);
  const [needSupportContact, setNeedSupportContact] = useState(false);
  const [supportLevel, setSupportLevel] = useState<SupportLevel>("none");

  const planName = "Standard Plan";
  const planPrice = 99;
  const supportLevelPrice: Record<SupportLevel, number> = {
    none: 0,
    basic: 25,
    standard: 50,
    premium: 100,
  };
  const supportTotal = supportLevelPrice[supportLevel];
  const subtotal = planPrice + supportTotal;
  const vatAmount = subtotal * VAT_RATE;
  const totalAmount = subtotal + vatAmount;

  function validateSaudiVat(value: string): boolean {
    if (!value.trim()) return false;
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 15) return false;
    if (digits[0] !== "3" || digits[14] !== "3") return false;
    return /^\d+$/.test(digits);
  }

  function handleVatChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setVatNumber(value);
    if (!value.trim()) {
      setVatError("");
      return;
    }
    if (!validateSaudiVat(value)) {
      setVatError(VAT_ERROR_MSG);
    } else {
      setVatError("");
    }
  }

  const isCompanyValid =
    billingType !== "company" ||
    (companyName.trim() !== "" &&
      vatNumber.trim() !== "" &&
      !vatError &&
      validateSaudiVat(vatNumber) &&
      country.trim() !== "" &&
      city.trim() !== "" &&
      district.trim() !== "" &&
      buildingNo.trim() !== "" &&
      postalCode.trim() !== "");

  const canPay = isCompanyValid && termsAccepted;

  function handlePayNow() {
    if (!canPay) return;
    console.log("Billing payload (API not connected yet):", {
      billing_type: billingType,
      company_details: billingType === "company" ? { companyName, vatNumber, country, city, district, buildingNo, postalCode, additionalInfo } : undefined,
      support_level: supportLevel,
      subtotal,
      vat: vatAmount,
      total_amount: totalAmount,
      customer_email: contact.email,
    });
  }

  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-gray-100/80 rounded-2xl p-4 md:p-6">
      {/* Process flow indicator – circles with connecting lines (screenshot style) */}
      <div className="w-full flex items-start mb-8">
        {/* 01 Plan */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-semibold tabular-nums">
            01
          </div>
          <span className="text-xs md:text-sm font-medium text-gray-700 mt-2 whitespace-nowrap">Plan</span>
        </div>
        <div className="flex-1 h-0.5 mt-5 mx-1 bg-gray-300 rounded" aria-hidden />
        {/* 02 Billing */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-semibold tabular-nums shadow-md">
            02
          </div>
          <span className="text-xs md:text-sm font-medium text-gray-700 mt-2 whitespace-nowrap">Billing</span>
        </div>
        <div className="flex-1 h-0.5 mt-5 mx-1 bg-gray-300 rounded" aria-hidden />
        {/* 03 Payment */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-sm font-semibold tabular-nums">
            03
          </div>
          <span className="text-xs md:text-sm font-medium text-gray-700 mt-2 whitespace-nowrap">Payment</span>
        </div>
        <div className="flex-1 h-0.5 mt-5 mx-1 bg-gray-300 rounded" aria-hidden />
        {/* 04 Confirmation */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-sky-200 text-sky-900 flex items-center justify-center text-sm font-semibold tabular-nums">
            04
          </div>
          <span className="text-xs md:text-sm font-medium text-gray-700 mt-2 whitespace-nowrap">Confirmation</span>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
        Billing & Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left: Billing Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Contact Summary */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 md:p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Contact Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block mb-0.5">Name</span>
                <span className="text-gray-900 font-medium">{contact.name}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">Email</span>
                <span className="text-gray-900 font-medium">{contact.email}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">Phone</span>
                <span className="text-gray-900 font-medium">{contact.phone}</span>
              </div>
            </div>
            <Link
              to="/"
              className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Edit Profile
            </Link>
          </div>

          {/* Billing Type + Selected Add-ons */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 md:p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              Billing Type
            </h2>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="billingType"
                  checked={billingType === "individual"}
                  onChange={() => setBillingType("individual")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-800">Individual</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="billingType"
                  checked={billingType === "company"}
                  onChange={() => setBillingType("company")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-800">Company</span>
              </label>
            </div>
            {billingType === "individual" && (
              <p className="text-gray-500 text-sm mt-2">
                No billing details required.
              </p>
            )}

            <div className="mt-6 pt-5 border-t border-gray-100">
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                Selected Add-ons
              </h3>
              {/* <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={badgePrinting}
                    onCheckedChange={(c) => setBadgePrinting(c === true)}
                  />
                  <span className="text-gray-800 text-sm">
                    On-site badge printing
                  </span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Contact Us
                </Button>
              </div> */}
            </div>
          </div>

          {/* Billing Information (Company) */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 md:p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Billing Information
            </h2>
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setBillingType("individual")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  billingType === "individual"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={() => setBillingType("company")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  billingType === "company"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Company
              </button>
            </div>

            {billingType === "company" && (
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="companyName" className="text-gray-700 text-sm">
                    Company Name *
                  </Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="-"
                    className="mt-1.5 h-10 rounded-lg border-gray-300"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="vatNumber" className="text-gray-700 text-sm">
                      VAT Number *
                    </Label>
                    <span
                      className="text-gray-400 cursor-help"
                      title="15 digits, numeric, must start and end with 3"
                    >
                      <Info className="w-4 h-4" />
                    </span>
                  </div>
                  <Input
                    id="vatNumber"
                    value={vatNumber}
                    onChange={handleVatChange}
                    placeholder="-"
                    className={`mt-1.5 h-10 rounded-lg max-w-xs ${
                      vatError ? "border-red-500 focus-visible:ring-red-500" : "border-gray-300"
                    }`}
                    maxLength={15}
                    aria-invalid={!!vatError}
                  />
                  {vatError && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1" role="alert">
                      {vatError}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 text-sm">Country *</Label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm"
                    >
                      <option value="">-</option>
                      <option value="SA">Saudi Arabia</option>
                      <option value="AE">UAE</option>
                      <option value="KW">Kuwait</option>
                      <option value="BH">Bahrain</option>
                      <option value="OM">Oman</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-gray-700 text-sm">City *</Label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm"
                    >
                      <option value="">-</option>
                      <option value="RUH">Riyadh</option>
                      <option value="JED">Jeddah</option>
                      <option value="DMM">Dammam</option>
                      <option value="MEC">Mecca</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 text-sm">District *</Label>
                    <Input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="-"
                      className="mt-1.5 h-10 rounded-lg border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 text-sm">Building No *</Label>
                    <Input
                      value={buildingNo}
                      onChange={(e) => setBuildingNo(e.target.value)}
                      placeholder="-"
                      className="mt-1.5 h-10 rounded-lg border-gray-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 text-sm">Postal Code *</Label>
                    <Input
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="-"
                      className="mt-1.5 h-10 rounded-lg border-gray-300"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-700 text-sm">
                      Additional Info (Optional)
                    </Label>
                    <Input
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="-"
                      className="mt-1.5 h-10 rounded-lg border-gray-300"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Services */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 md:p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Additional Services
            </h2>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={needSupportContact}
                  onCheckedChange={(c) => setNeedSupportContact(c === true)}
                />
                <span className="text-gray-800 text-sm pt-0.5">
                  Need our team to manage the event setup?
                </span>
              </label>
              <div>
                <Label className="text-gray-700 text-sm block mb-2">
                  Support Level
                </Label>
                <select
                  value={supportLevel}
                  onChange={(e) =>
                    setSupportLevel(e.target.value as SupportLevel)
                  }
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm w-full max-w-xs"
                >
                  <option value="none">None</option>
                  <option value="basic">Basic Support</option>
                  <option value="standard">Standard Support</option>
                  <option value="premium">Premium Support</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 md:p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Order Summary
            </h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <span className="font-medium text-gray-800">Plan:</span>{" "}
                {planName} – ${planPrice}/mo
              </li>
              <li>
                <span className="font-medium text-gray-800">Billing Type:</span>{" "}
                {billingType === "individual" ? "Individual" : "Company"}
              </li>
              {/* {badgePrinting && (
                <li>
                  <span className="font-medium text-gray-800">Add-ons:</span>{" "}
                  On-site badge printing
                </li>
              )} */}
              <li>
                <span className="font-medium text-gray-800">Venue & Timing:</span>{" "}
                1 Day
              </li>
            </ul>
            <div className="mt-5 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm text-gray-700">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>VAT (15%)</span>
                <span>${vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(c) => setTermsAccepted(c === true)}
              />
              <Label
                htmlFor="terms"
                className="text-sm text-gray-600 cursor-pointer leading-tight"
              >
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>

            <Button
              onClick={handlePayNow}
              disabled={!canPay}
              className="w-full mt-4 py-6 text-base font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none rounded-xl"
            >
              Pay Now
            </Button>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Payment methods</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">
                  VISA
                </span>
                <span className="text-[10px] font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">
                  PayPal
                </span>
                <span className="text-[10px] font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">
                  Apple Pay
                </span>
                <span className="text-[10px] font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">
                  STC Pay
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex items-center gap-2 rounded-lg"
        >
          <ChevronLeft size={20} />
          Previous
        </Button>
        <span className="text-sm text-gray-500">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <Button
          onClick={() => onNext()}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 rounded-lg"
        >
          Next
          <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );
};

export default Payment;
