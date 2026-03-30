import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { Check, ChevronLeft, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { chargeEventPayment } from "@/apis/apiHelpers";
import { savePendingEventPayment } from "./paymentSession";

const VAT_RATE = 0.15;
const SUPPORT_HOURLY_RATE = 350;
const SUPPORT_HOURS_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
const CURRENT_CAPACITY = 400;
const REGISTRATION_PRICE_PER_USER = 3.75;
const REGISTRATION_OPTIONS = [100, 200, 300, 400] as const;
const BACKEND_PACKAGE_NAME_BY_PLAN = {
  express: "express",
  advance: "premium",
} as const;
const BACKEND_PACKAGE_PRICES = {
  express: 1000,
  premium: 1000,
} as const;
const COUNTRY_NAMES: Record<string, string> = {
  SA: "Saudi Arabia",
  AE: "UAE",
  KW: "Kuwait",
  BH: "Bahrain",
  OM: "Oman",
};
const CITY_NAMES: Record<string, string> = {
  RUH: "Riyadh",
  JED: "Jeddah",
  DMM: "Dammam",
  MEC: "Mecca",
};

type BillingType = "individual" | "company";
type SupportHours = (typeof SUPPORT_HOURS_OPTIONS)[number];

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
  plan = "express",
  eventId,
}) => {
  const { company: companySlug } = useParams<{ company?: string }>();
  const { t } = useTranslation("dashboard");
  const [contact] = useState(DEFAULT_CONTACT);
  const [billingType, setBillingType] = useState<BillingType>("individual");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [vatError, setVatError] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [buildingNo, setBuildingNo] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const [supportHours, setSupportHours] = useState<SupportHours>(0);
  const [additionalRegistrations, setAdditionalRegistrations] = useState(0);

  const normalizedPlan = plan === "advance" ? "advance" : "express";
  const backendPackageName = BACKEND_PACKAGE_NAME_BY_PLAN[normalizedPlan];
  const planName =
    normalizedPlan === "advance"
      ? t("pricing.advanced")
      : t("pricing.express");
  const planPrice = BACKEND_PACKAGE_PRICES[backendPackageName];
  const supportTotal = supportHours * SUPPORT_HOURLY_RATE;
  const registrationPrice = additionalRegistrations * REGISTRATION_PRICE_PER_USER;
  const subtotal = planPrice + supportTotal + registrationPrice;
  const vatAmount = subtotal * VAT_RATE;
  const totalAmount = subtotal + vatAmount;
  const checkoutTotal = Number(totalAmount.toFixed(2));
  const newCapacity = CURRENT_CAPACITY + additionalRegistrations;
  const formatSar = (amount: number) => `SAR ${amount.toFixed(2)}`;
  const supportSummary = `${supportHours} Hour${supportHours > 1 ? "s" : ""} - ${formatSar(supportTotal)}`;
  const selectedAddons = [
    supportHours > 0
      ? {
          name: "support_hours",
          quantity: supportHours,
        }
      : null,
    additionalRegistrations > 0
      ? {
          name: "additional_registration_capacity",
          quantity: additionalRegistrations,
        }
      : null,
  ].filter(
    (
      addon,
    ): addon is {
      name: "support_hours" | "additional_registration_capacity";
      quantity: number;
    } => addon !== null,
  );

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
      setVatError(t("expressEvent.vatError"));
    } else {
      setVatError("");
    }
  }

  const addressValid =
    country.trim() !== "" &&
    city.trim() !== "" &&
    district.trim() !== "" &&
    buildingNo.trim() !== "" &&
    postalCode.trim() !== "";

  const isCompanyValid =
    billingType === "company"
      ? companyName.trim() !== "" &&
        vatNumber.trim() !== "" &&
        !vatError &&
        validateSaudiVat(vatNumber) &&
        addressValid
      : companyName.trim() !== "" && addressValid;

  const canPay = isCompanyValid && termsAccepted;

  function buildRedirectUrl(currentEventId: string | number) {
    const basePath = companySlug
      ? `/${companySlug}/express-event/${currentEventId}/payment/callback`
      : `/express-event/${currentEventId}/payment/callback`;

    const redirectUrl = new URL(`${window.location.origin}${basePath}`);
    redirectUrl.searchParams.set("plan", plan);
    return redirectUrl.toString();
  }

  function getCountryName(value: string) {
    return COUNTRY_NAMES[value] ?? value;
  }

  function getCityName(value: string) {
    return CITY_NAMES[value] ?? value;
  }

  function getPaymentErrorMessage(error: unknown) {
    const response = (error as {
      response?: { status?: number; data?: { error?: string; message?: string } };
    })?.response;

    if (response?.status === 401) {
      return t("expressEvent.paymentUnauthorized");
    }

    if (response?.status === 404) {
      return t("expressEvent.paymentNotFound");
    }

    if (response?.status === 422) {
      return (
        response.data?.error ||
        response.data?.message ||
        t("expressEvent.paymentValidationError")
      );
    }

    return (
      response?.data?.message ||
      response?.data?.error ||
      t("expressEvent.paymentUnexpectedError")
    );
  }

  async function handlePayNow() {
    if (!canPay) return;

    if (!eventId) {
      setPaymentError(t("expressEvent.eventIdMissing"));
      return;
    }

    setIsInitiatingPayment(true);
    setPaymentError("");

    try {
      const redirectUrl = buildRedirectUrl(eventId);
      const response = await chargeEventPayment(eventId, {
        package_name: backendPackageName,
        redirect_url: redirectUrl,
        total_amount: checkoutTotal,
        addons: selectedAddons,
        company_billing_details: {
          company_name: companyName.trim(),
          country: getCountryName(country),
          city: getCityName(city),
          postal_code: postalCode.trim(),
          district: district.trim(),
          building_number: buildingNo.trim(),
          additional_info: additionalInfo.trim(),
          ...(billingType === "company" && vatNumber.trim()
            ? { vat_number: vatNumber.trim() }
            : {}),
        },
      });

      const {
        transaction_url: transactionUrl,
        transaction_id: transactionId,
        order_id: orderId,
        charge_id: chargeId,
        total_price: totalPrice,
        tax,
      } = response.data ?? {};

      if (!transactionUrl || !transactionId || !orderId || !chargeId) {
        throw new Error("Missing payment redirect data");
      }

      savePendingEventPayment({
        eventId: String(eventId),
        plan,
        chargeId,
        transactionId,
        orderId,
        transactionUrl,
        totalPrice,
        tax,
        initiatedAt: new Date().toISOString(),
      });

      window.location.assign(transactionUrl);
    } catch (error) {
      setPaymentError(getPaymentErrorMessage(error));
      setIsInitiatingPayment(false);
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-gray-100/80 rounded-2xl p-4 md:p-6">
      {/* Process flow indicator – circles with connecting lines (screenshot style) */}
      <div className="w-full flex items-start mb-8">
        {/* 01 Plan */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-semibold tabular-nums">
            <Check className="w-5 h-5" aria-hidden />
          </div>
          <span className="text-xs md:text-sm font-medium text-gray-700 mt-2 whitespace-nowrap">{t("expressEvent.plan")}</span>
        </div>
        <div className="flex-1 h-0.5 mt-5 mx-1 bg-gray-300 rounded" aria-hidden />
        {/* 02 Billing */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-semibold tabular-nums shadow-md">
            <Check className="w-5 h-5" aria-hidden />
          </div>
          <span className="text-xs md:text-sm font-medium text-gray-700 mt-2 whitespace-nowrap">{t("expressEvent.billing")}</span>
        </div>
        <div className="flex-1 h-0.5 mt-5 mx-1 bg-gray-300 rounded" aria-hidden />
        {/* 03 Payment */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-sm font-semibold tabular-nums">
            03
          </div>
          <span className="text-xs md:text-sm font-medium text-gray-700 mt-2 whitespace-nowrap">{t("expressEvent.paymentStep")}</span>
        </div>
        <div className="flex-1 h-0.5 mt-5 mx-1 bg-gray-300 rounded" aria-hidden />
        {/* 04 Confirmation */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-sky-200 text-sky-900 flex items-center justify-center text-sm font-semibold tabular-nums">
            04
          </div>
          <span className="text-xs md:text-sm font-medium text-gray-700 mt-2 whitespace-nowrap">{t("expressEvent.confirmation")}</span>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
        {t("expressEvent.billingAndCheckout")}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left: Billing Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Contact Summary */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 md:p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              {t("expressEvent.contactSummary")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block mb-0.5">{t("expressEvent.nameLabel")}</span>
                <span className="text-gray-900 font-medium">{contact.name}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">{t("expressEvent.emailLabel")}</span>
                <span className="text-gray-900 font-medium">{contact.email}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5">{t("expressEvent.phoneLabel")}</span>
                <span className="text-gray-900 font-medium">{contact.phone}</span>
              </div>
            </div>
            <Link
              to={companySlug ? `/${companySlug}` : "/"}
              className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {t("expressEvent.editProfile")}
            </Link>
          </div>

          {/* Billing Type + Selected Add-ons */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 md:p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              {t("expressEvent.billingType")}
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
                <span className="text-gray-800">{t("expressEvent.individual")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="billingType"
                  checked={billingType === "company"}
                  onChange={() => setBillingType("company")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-800">{t("expressEvent.company")}</span>
              </label>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                {t("expressEvent.selectedAddons")}
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
              {t("expressEvent.billingInformation")}
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
                {t("expressEvent.individual")}
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
                {t("expressEvent.company")}
              </button>
            </div>

            {(billingType === "individual" || billingType === "company") && (
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="billingName" className="text-gray-700 text-sm">
                    {billingType === "individual" ? t("expressEvent.personName") : t("expressEvent.companyName")}
                  </Label>
                  <Input
                    id="billingName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="-"
                    className="mt-1.5 h-10 rounded-lg border-gray-300"
                  />
                </div>
                {billingType === "company" && (
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="vatNumber" className="text-gray-700 text-sm">
                        {t("expressEvent.vatNumber")}
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
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 text-sm">{t("expressEvent.country")}</Label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm"
                    >
                      <option value="">-</option>
                      <option value="SA">{t("expressEvent.saudiArabia")}</option>
                      <option value="AE">{t("expressEvent.uae")}</option>
                      <option value="KW">{t("expressEvent.kuwait")}</option>
                      <option value="BH">{t("expressEvent.bahrain")}</option>
                      <option value="OM">{t("expressEvent.oman")}</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-gray-700 text-sm">{t("expressEvent.city")}</Label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm"
                    >
                      <option value="">-</option>
                      <option value="RUH">{t("expressEvent.riyadh")}</option>
                      <option value="JED">{t("expressEvent.jeddah")}</option>
                      <option value="DMM">{t("expressEvent.dammam")}</option>
                      <option value="MEC">{t("expressEvent.mecca")}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 text-sm">{t("expressEvent.district")}</Label>
                    <Input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="-"
                      className="mt-1.5 h-10 rounded-lg border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 text-sm">{t("expressEvent.buildingNo")}</Label>
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
                    <Label className="text-gray-700 text-sm">{t("expressEvent.postalCode")}</Label>
                    <Input
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="-"
                      className="mt-1.5 h-10 rounded-lg border-gray-300"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-700 text-sm">
                      {t("expressEvent.additionalInfo")}
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
              {t("expressEvent.additionalServices")}
            </h2>
            <div className="space-y-6">
              <div>
                <Label className="text-gray-700 text-sm block mb-2">
                  Support Hours
                </Label>
                <select
                  value={String(supportHours)}
                  onChange={(e) =>
                    setSupportHours(Number(e.target.value) as SupportHours)
                  }
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm w-full max-w-xs"
                >
                  {SUPPORT_HOURS_OPTIONS.map((hours) => (
                    <option key={hours} value={hours}>
                      {hours === 0
                        ? `0 Hours - ${formatSar(0)}`
                        : `${hours} Hour${hours > 1 ? "s" : ""} - ${formatSar(
                            hours * SUPPORT_HOURLY_RATE
                          )}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-gray-900">
                    Current Capacity
                  </p>
                  <span className="text-base font-semibold text-fuchsia-600">
                    {CURRENT_CAPACITY} Users
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    Add More Registrations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {REGISTRATION_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAdditionalRegistrations(option)}
                        className={`min-w-16 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                          additionalRegistrations === option
                            ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-600"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-slate-50"
                        }`}
                      >
                        +{option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <Label
                    htmlFor="customRegistrationsLeft"
                    className="text-sm font-semibold text-gray-900"
                  >
                    Custom
                  </Label>
                  <Input
                    id="customRegistrationsLeft"
                    type="number"
                    min={0}
                    step={1}
                    value={additionalRegistrations}
                    onChange={(e) =>
                      setAdditionalRegistrations(Math.max(0, Number(e.target.value) || 0))
                    }
                    className="mt-2 h-12 rounded-xl border-gray-200 text-lg font-medium text-gray-700"
                  />
                </div>

                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-900">
                    New Capacity
                  </p>
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {CURRENT_CAPACITY} + {additionalRegistrations} ={" "}
                    <span className="text-fuchsia-600">{newCapacity}</span>
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-900">
                    Price
                  </p>
                  <p className="mt-1 text-xl font-bold text-blue-600">
                    {formatSar(registrationPrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 md:p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              {t("expressEvent.orderSummary")}
            </h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <span className="font-medium text-gray-800">{t("expressEvent.plan")}:</span>{" "}
                {planName} – {formatSar(planPrice)}/mo
              </li>
              <li>
                <span className="font-medium text-gray-800">{t("expressEvent.billingType")}:</span>{" "}
                {billingType === "individual" ? t("expressEvent.individual") : t("expressEvent.company")}
              </li>
              <li>
                <span className="font-medium text-gray-800">Support Hours:</span>{" "}
                {supportSummary}
              </li>
              {/* {badgePrinting && (
                <li>
                  <span className="font-medium text-gray-800">Add-ons:</span>{" "}
                  On-site badge printing
                </li>
              )} */}
              <li>
                <span className="font-medium text-gray-800">{t("expressEvent.venueTiming")}:</span>{" "}
                1 Day
              </li>
            </ul>
            <div className="mt-5 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm text-gray-700">
                <span>{t("expressEvent.subtotal")}</span>
                <span>{formatSar(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>{t("expressEvent.vatPercent")}</span>
                <span>{formatSar(vatAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                <span>{t("expressEvent.total")}</span>
                <span>{formatSar(totalAmount)}</span>
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
                {t("expressEvent.agreeTerms")}
              </Label>
            </div>

            {paymentError && (
              <div
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {paymentError}
              </div>
            )}

            <Button
              onClick={handlePayNow}
              disabled={!canPay || isInitiatingPayment}
              className="w-full mt-4 py-6 text-base font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none rounded-xl"
            >
              {isInitiatingPayment ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("expressEvent.redirectingToCheckout")}
                </span>
              ) : (
                t("expressEvent.payNow")
              )}
            </Button>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">{t("expressEvent.paymentMethods")}</p>
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
          {t("expressEvent.previous")}
        </Button>
        <span className="text-sm text-gray-500">
          {t("expressEvent.stepOf", { current: currentStep + 1, total: totalSteps })}
        </span>
        <Button
          onClick={() => onNext()}
          disabled
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 rounded-lg disabled:pointer-events-none"
        >
          {t("expressEvent.completePaymentFirst")}
        </Button>
      </div>
    </div>
  );
};

export default Payment;
