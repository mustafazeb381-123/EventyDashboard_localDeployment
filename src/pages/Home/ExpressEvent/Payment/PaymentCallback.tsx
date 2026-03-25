import { useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Download,
  Headphones,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceNavigate } from "@/hooks/useWorkspaceNavigate";

type PaymentViewState = "success" | "failed";

export default function PaymentCallback() {
  const navigateTo = useWorkspaceNavigate();
  const [viewState] = useState<PaymentViewState>("success"); // toggle to "failed" to preview failed state
  const [detailsOpen, setDetailsOpen] = useState(true);

  // ── Static placeholder data (replace with dynamic props/API when available) ──
  const orderNumber = "#12345";
  const paymentAmount = "1,500 SAR";
  const paymentDate = "10 Mar 2026, 3:45 PM";
  const chargeId = "ch_3QxM2dLkZ4eIGjL60VsZpFQB";
  const transactionId = "txn_9Kp1AbcXyz";
  const orderId = "12345";
  const paymentStatus = "CAPTURED";
  const plan = "Express";
  const tax = "SAR 195.00";

  return (
    <div className="mx-auto max-w-xl px-4 py-10">

      {/* ─────────────── SUCCESS ─────────────── */}
      {viewState === "success" && (
        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm md:p-8">

          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Payment Successful</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Thank you! Your payment has been completed successfully.
            </p>
          </div>

          {/* Green summary block */}
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-[18px] w-[18px] text-emerald-600 shrink-0" />
              <p className="text-sm font-semibold text-emerald-700">Payment Successful</p>
            </div>

            <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-sm">

                <div className="flex items-center justify-between py-2.5">
                  <span className="font-medium text-gray-500">Order Number:</span>
                  <span className="font-bold text-gray-900">{orderNumber}</span>
                </div>
                <div className="h-px bg-gray-100" />

                <div className="flex items-center justify-between py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-gray-500">
                    <CheckCircle2 className="h-[15px] w-[15px] text-emerald-500 shrink-0" />
                    Amount Paid:
                  </span>
                  <span className="font-bold text-gray-900">{paymentAmount}</span>
                </div>
                <div className="h-px bg-gray-100" />

                <div className="flex items-center justify-between py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-gray-500">
                    <CreditCard className="h-[15px] w-[15px] text-emerald-500 shrink-0" />
                    Payment Method:
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-xs font-semibold text-gray-700">
                      VISA
                    </span>
                    <span className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 inline-flex items-center gap-1">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                      </svg>
                      Pay
                    </span>
                  </span>
                </div>
                <div className="h-px bg-gray-100" />

                <div className="flex items-center justify-between py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-gray-500">
                    <CalendarDays className="h-[15px] w-[15px] text-emerald-500 shrink-0" />
                    Date &amp; Time:
                  </span>
                  <span className="font-bold text-gray-900">{paymentDate}</span>
                </div>

              </div>
            </div>
          </div>

          {/* Collapsible View Details */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setDetailsOpen((p) => !p)}
              className="flex w-full items-center justify-between px-5 py-3.5 text-left"
            >
              <span className="text-sm font-semibold text-gray-900">View Details</span>
              {detailsOpen
                ? <ChevronUp className="h-4 w-4 text-gray-400" />
                : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>

            {detailsOpen && (
              <div className="border-t border-gray-100 px-5 py-4">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Charge ID</p>
                    <p className="mt-1 font-medium text-gray-900 break-all">{chargeId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Payment Status</p>
                    <p className="mt-1 font-medium text-gray-900">{paymentStatus}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Transaction ID</p>
                    <p className="mt-1 font-medium text-gray-900 break-all">{transactionId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Order ID</p>
                    <p className="mt-1 font-medium text-gray-900">{orderId}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Plan / Tax */}
          <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400">Plan</p>
                <p className="mt-1 font-medium text-gray-900">{plan}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Tax</p>
                <p className="mt-1 font-medium text-gray-900">{tax}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex gap-3">
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-xl border-gray-200 text-sm font-medium"
            >
              View Invoice
            </Button>
            <Button
              onClick={() => navigateTo("")}
              className="h-11 flex-1 rounded-xl bg-emerald-600 text-sm font-medium hover:bg-emerald-700"
            >
              Go to Dashboard
            </Button>
          </div>

          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <Download className="h-3.5 w-3.5" />
            Download Receipt
          </button>
        </div>
      )}

      {/* ─────────────── FAILED ─────────────── */}
      {viewState === "failed" && (
        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm md:p-8">

          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white">
              <XCircle className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Payment Failed</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Something went wrong with your payment.
            </p>
          </div>

          {/* Error alert */}
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                <AlertCircle className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-700">Card declined</p>
                <p className="mt-0.5 text-sm text-red-600">Your bank has declined the charge.</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-6">
            <p className="text-base font-bold text-gray-900">Order Summary</p>
            <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="text-sm">
                <div className="flex items-center justify-between py-2.5">
                  <span className="font-medium text-gray-500">Order Number:</span>
                  <span className="font-bold text-gray-900">{orderNumber}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex items-center justify-between py-2.5">
                  <span className="font-medium text-gray-500">Attempted Amount:</span>
                  <span className="font-bold text-gray-900">{paymentAmount}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex items-center justify-between py-2.5">
                  <span className="font-medium text-gray-500">Date &amp; Time:</span>
                  <span className="font-bold text-gray-900">{paymentDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Options list */}
          <div className="mt-5 space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <RotateCcw className="h-4 w-4 shrink-0 text-gray-400" />
              <span>Try again</span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 shrink-0 text-gray-400" />
              <span>Use another payment method</span>
            </div>
            <div className="flex items-center gap-3">
              <Headphones className="h-4 w-4 shrink-0 text-gray-400" />
              <span>Contact support</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-3">
            <Button className="h-11 w-full rounded-xl bg-red-500 text-sm font-medium hover:bg-red-600">
              Retry Payment
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full rounded-xl border-gray-200 text-sm font-medium"
            >
              Change Payment Method
            </Button>
            <button
              type="button"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50"
            >
              <Headphones className="h-4 w-4" />
              Contact Support
            </button>
          </div>
        </div>
      )}
    </div>
  );
}