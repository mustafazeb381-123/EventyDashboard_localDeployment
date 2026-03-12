import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWorkspaceNavigate } from "@/hooks/useWorkspaceNavigate";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CURRENT_PLAN = "Express";
const UPGRADE_PLAN = "Advance";
const CURRENT_CAPACITY = 400;
const PLAN_UPGRADE_PRICE = 50; // $/month
const PRICE_PER_100_REGISTRATIONS = 15; // $30 for 200 → subtotal $50 + $30 = $80
const VAT_RATE = 0.15;

const ADVANCE_FEATURES = [
  "Mobile App Access",
  "Advanced Reports",
  "Invitations Management",
  "Priority Support",
];

export default function UpgradePlan() {
  const { t } = useTranslation("dashboard");
  const navigateTo = useWorkspaceNavigate();
  const { id: eventId } = useParams();

  const [selectedPlan, setSelectedPlan] = useState<"express" | "advance">("advance");
  const [customRegistrations, setCustomRegistrations] = useState(200);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const additionalRegistrations = customRegistrations;
  const newCapacity = CURRENT_CAPACITY + additionalRegistrations;
  const planPrice = selectedPlan === "advance" ? PLAN_UPGRADE_PRICE : 0;
  const registrationPrice = Math.ceil(additionalRegistrations / 100) * PRICE_PER_100_REGISTRATIONS;
  const subtotal = planPrice + registrationPrice;
  const vat = Math.round(subtotal * VAT_RATE * 100) / 100;
  const total = Math.round((subtotal + vat) * 100) / 100;

  const handleConfirmPay = () => {
    if (!agreeTerms) return;
    // Placeholder: would integrate payment here
    navigateTo(`home/${eventId}`);
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Upgrade Plan + Increase Registrations */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upgrade Plan section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-[#202242]">
              {t("upgradePlanPage.title")}
            </h1>
            <p className="text-sm text-[#656C95] mt-1">
              {t("upgradePlanPage.subtitle")}
            </p>

            <p className="mt-4 text-sm text-[#656C95]">
              {t("upgradePlanPage.currentPlan")}{" "}
              <span className="font-medium text-[#7C3AED]">{CURRENT_PLAN}</span>
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="plan"
                  checked={selectedPlan === "express"}
                  onChange={() => setSelectedPlan("express")}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-[#202242]">
                  {t("upgradePlanPage.stayOnExpress")}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="plan"
                  checked={selectedPlan === "advance"}
                  onChange={() => setSelectedPlan("advance")}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-[#202242]">
                  {t("upgradePlanPage.upgradeToAdvance")}
                </span>
              </label>
            </div>

            {selectedPlan === "advance" && (
              <>
                <p className="mt-4 text-sm font-medium text-[#656C95]">
                  {t("upgradePlanPage.includes")}
                </p>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ADVANCE_FEATURES.map((feature) => (
                    <span
                      key={feature}
                      className="text-sm text-[#202242]"
                    >
                      {t(`upgradePlanPage.features.${feature.replace(/\s+/g, "")}`)}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm text-[#656C95]">
                  {t("upgradePlanPage.priceDifference")}{" "}
                  <span className="font-semibold text-blue-600">
                    +${PLAN_UPGRADE_PRICE} / {t("upgradePlanPage.month")}
                  </span>
                </p>
              </>
            )}
          </div>

          {/* Increase Registrations section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#202242]">
              {t("upgradePlanPage.increaseRegistrations")}
            </h2>
            <p className="mt-2 text-sm text-[#656C95]">
              {t("upgradePlanPage.currentCapacity")}{" "}
              <span className="font-semibold text-[#7C3AED]">
                {CURRENT_CAPACITY} {t("upgradePlanPage.users")}
              </span>
            </p>

            <p className="mt-3 text-sm font-medium text-[#656C95]">
              {t("upgradePlanPage.addMoreRegistrations")}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[100, 200, 300, 400].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCustomRegistrations(num)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                    customRegistrations === num
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-[#202242] border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  )}
                >
                  +{num}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-[#656C95]">
                {t("upgradePlanPage.custom")}
              </span>
              <input
                type="number"
                min={0}
                value={customRegistrations}
                onChange={(e) => setCustomRegistrations(Number(e.target.value) || 0)}
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#202242] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <p className="mt-4 text-sm text-[#656C95]">
              {t("upgradePlanPage.newCapacity")}{" "}
              <span className="font-semibold text-[#7C3AED]">
                {CURRENT_CAPACITY} + {additionalRegistrations} = {newCapacity}
              </span>
            </p>
            <p className="mt-1 text-sm text-[#656C95]">
              {t("upgradePlanPage.price")}{" "}
              <span className="font-semibold text-[#7C3AED]">
                ${registrationPrice}
              </span>
            </p>
          </div>
        </div>

        {/* Right column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-lg font-bold text-[#202242]">
              {t("upgradePlanPage.orderSummary")}
            </h2>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#656C95]">{t("upgradePlanPage.plan")}</span>
                <span className="font-medium text-[#7C3AED]">
                  {CURRENT_PLAN} → {selectedPlan === "advance" ? UPGRADE_PLAN : CURRENT_PLAN}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#656C95]">
                  {t("upgradePlanPage.registrationLimit")}
                </span>
                <span className="font-medium text-[#7C3AED]">
                  {CURRENT_CAPACITY} → {newCapacity}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#656C95]">{t("upgradePlanPage.subtotal")}</span>
                <span className="font-medium text-[#202242]">${subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#656C95]">{t("upgradePlanPage.vat", { rate: 15 })}</span>
                <span className="font-medium text-[#202242]">${vat}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-base font-bold text-[#202242]">
                {t("upgradePlanPage.total")}
              </span>
              <span className="text-xl font-bold text-blue-600">${total}</span>
            </div>

            <Button
              onClick={handleConfirmPay}
              className="w-full mt-6 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {t("upgradePlanPage.confirmAndPay")}
            </Button>

            <label className="mt-4 flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-[#656C95]">
                {t("upgradePlanPage.agreeTerms")}
              </span>
            </label>

            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <span className="text-xs text-[#656C95]">
                {t("upgradePlanPage.paymentMethods")}:
              </span>
              <div className="flex gap-2 items-center">
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                  VISA
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                  PayPal
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                  Apple Pay
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                  stc pay
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
