import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
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
import { useParams, useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { getEventPaymentStatus } from "@/apis/apiHelpers";
import { Button } from "@/components/ui/button";
import { useWorkspaceNavigate } from "@/hooks/useWorkspaceNavigate";
import {
  clearPendingEventPayment,
  loadPendingEventPayment,
  type PendingEventPayment,
} from "./paymentSession";

type PaymentViewState = "success" | "failed";
type PaymentStatusResponse = {
  status?: string;
  charge_id?: string;
  transaction_id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  time?: string;
};

const STATIC_PAYMENT_FALLBACK = {
  orderNumber: "#12345",
  paymentAmount: "1,500 SAR",
  paymentDate: "10 Mar 2026, 3:45 PM",
  chargeId: "ch_3QxM2dLkZ4eIGjL60VsZpFQB",
  transactionId: "txn_9Kp1AbcXyz",
  orderId: "12345",
  paymentStatus: "CAPTURED",
};

function formatCurrency(amount?: number, currency = "SAR") {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return null;
  }

  return `${currency} ${amount.toFixed(2)}`;
}

function formatPaymentDate(value?: string) {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

function getFallbackViewState(status?: string): PaymentViewState {
  return status?.toUpperCase() === "CAPTURED" ? "success" : "failed";
}

function getErrorStatus(error: unknown) {
  return (error as { response?: { status?: number } })?.response?.status;
}

const ReceiptPrintContent = forwardRef<
  HTMLDivElement,
  {
    viewState: PaymentViewState;
    orderNumber: string;
    orderId: string;
    chargeId: string;
    transactionId: string;
    paymentStatus: string;
    paymentAmount: string;
    paymentDate: string;
  }
>(function ReceiptPrintContent(
  {
    viewState,
    orderNumber,
    orderId,
    chargeId,
    transactionId,
    paymentStatus,
    paymentAmount,
    paymentDate,
  },
  ref
) {
  const isSuccess = viewState === "success";

  return (
    <div
      ref={ref}
      className="receipt-print-root"
      style={{
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        background: "#ffffff",
        color: "#111827",
        padding: "18mm",
        boxSizing: "border-box",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          paddingBottom: "10mm",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            width: "18mm",
            height: "18mm",
            borderRadius: "9999px",
            margin: "0 auto 6mm",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isSuccess ? "#10b981" : "#ef4444",
            color: "#ffffff",
            fontSize: "9mm",
            fontWeight: 700,
          }}
        >
          {isSuccess ? "✓" : "!"}
        </div>
        <h1 style={{ fontSize: "11mm", fontWeight: 700, margin: 0 }}>
          {isSuccess ? "Payment Successful" : "Payment Failed"}
        </h1>
        <p style={{ margin: "4mm 0 0", color: "#6b7280", fontSize: "4.5mm" }}>
          {isSuccess
            ? "Thank you! Your payment has been completed successfully."
            : "Something went wrong with your payment."}
        </p>
      </div>

      <div
        style={{
          marginTop: "10mm",
          borderRadius: "6mm",
          padding: "6mm",
          background: isSuccess ? "#ecfdf5" : "#fef2f2",
        }}
      >
        <p
          style={{
            margin: 0,
            color: isSuccess ? "#047857" : "#b91c1c",
            fontSize: "5.5mm",
            fontWeight: 700,
          }}
        >
          {isSuccess ? "Payment Successful" : "Payment Failed"}
        </p>

        <div
          style={{
            marginTop: "5mm",
            borderRadius: "5mm",
            padding: "5mm",
            background: "#ffffff",
          }}
        >
          {[
            ["Order Number", orderNumber],
            [isSuccess ? "Amount Paid" : "Attempted Amount", paymentAmount],
            ["Date & Time", paymentDate],
            ["Payment Status", paymentStatus],
            ["Order ID", orderId],
            ["Charge ID", chargeId],
            ["Transaction ID", transactionId],
          ].map(([label, value], index) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "8mm",
                padding: "3.5mm 0",
                borderTop: index === 0 ? "none" : "1px solid #f3f4f6",
              }}
            >
              <span style={{ color: "#6b7280", fontSize: "4.2mm" }}>{label}</span>
              <span
                style={{
                  color: "#111827",
                  fontSize: "4.2mm",
                  fontWeight: 700,
                  textAlign: "right",
                  wordBreak: "break-word",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default function PaymentCallback() {
  const navigateTo = useWorkspaceNavigate();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const [viewState, setViewState] = useState<PaymentViewState>("success");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isPreparingReceipt, setIsPreparingReceipt] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingEventPayment | null>(
    null
  );
  const [paymentStatusData, setPaymentStatusData] =
    useState<PaymentStatusResponse | null>(null);
  const printComponentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const eventId = id;

    const storedPayment = loadPendingEventPayment(eventId);
    setPendingPayment(storedPayment);

    const chargeIdToLookup =
      searchParams.get("charge_id") || storedPayment?.chargeId || "";

    if (!chargeIdToLookup) {
      return;
    }

    let isActive = true;

    async function fetchPaymentStatus() {
      try {
        const response = await getEventPaymentStatus(
          eventId,
          chargeIdToLookup,
          "event"
        );
        if (!isActive) return;

        const data = (response.data ?? {}) as PaymentStatusResponse;
        setPaymentStatusData(data);
        setViewState(getFallbackViewState(data.status));

        if (data.status?.toUpperCase() === "CAPTURED") {
          clearPendingEventPayment(eventId);
        }
      } catch (error) {
        if (!isActive) return;

        const status = getErrorStatus(error);
        if (status === 404 || status === 422) {
          setViewState("failed");
        }
      }
    }

    fetchPaymentStatus();

    return () => {
      isActive = false;
    };
  }, [id, searchParams]);

  const paymentDetails = useMemo(() => {
    const orderId =
      paymentStatusData?.order_id ||
      pendingPayment?.orderId ||
      STATIC_PAYMENT_FALLBACK.orderId;
    const amount =
      formatCurrency(paymentStatusData?.amount, paymentStatusData?.currency) ||
      formatCurrency(pendingPayment?.totalPrice) ||
      STATIC_PAYMENT_FALLBACK.paymentAmount;
    const paymentDate =
      formatPaymentDate(paymentStatusData?.time) ||
      formatPaymentDate(pendingPayment?.initiatedAt) ||
      STATIC_PAYMENT_FALLBACK.paymentDate;
    const paymentStatus =
      paymentStatusData?.status || STATIC_PAYMENT_FALLBACK.paymentStatus;

    return {
      orderNumber: orderId.startsWith("#") ? orderId : `#${orderId}`,
      paymentAmount: amount,
      paymentDate,
      chargeId:
        paymentStatusData?.charge_id ||
        pendingPayment?.chargeId ||
        STATIC_PAYMENT_FALLBACK.chargeId,
      transactionId:
        paymentStatusData?.transaction_id ||
        pendingPayment?.transactionId ||
        STATIC_PAYMENT_FALLBACK.transactionId,
      orderId,
      paymentStatus,
    };
  }, [paymentStatusData, pendingPayment, searchParams]);

  const {
    orderNumber,
    paymentAmount,
    paymentDate,
    chargeId,
    transactionId,
    orderId,
    paymentStatus,
  } = paymentDetails;

  const handleReceiptPrintFromHook = useReactToPrint({
    contentRef: printComponentRef,
    pageStyle: `
      @page { size: A4 portrait; margin: 0; }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .receipt-print-root, .receipt-print-root * {
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    `,
    onAfterPrint: () => {
      setIsPreparingReceipt(false);
    },
  });

  function handleDownloadReceipt() {
    if (isPreparingReceipt) return;
    setIsPreparingReceipt(true);
    setTimeout(() => {
      handleReceiptPrintFromHook();
    }, 0);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">

      {/* ─────────────── SUCCESS ─────────────── */}
      {viewState === "success" && (
        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="bg-white">

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
            onClick={handleDownloadReceipt}
            className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <Download className="h-3.5 w-3.5" />
            {isPreparingReceipt ? "Opening Print Dialog..." : "Download Receipt"}
          </button>
        </div>
      )}

      {/* ─────────────── FAILED ─────────────── */}
      {viewState === "failed" && (
        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="bg-white">

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

      <div className="absolute -left-[99999px] top-0">
        <ReceiptPrintContent
          ref={printComponentRef}
          viewState={viewState}
          orderNumber={orderNumber}
          orderId={orderId}
          chargeId={chargeId}
          transactionId={transactionId}
          paymentStatus={paymentStatus}
          paymentAmount={paymentAmount}
          paymentDate={paymentDate}
        />
      </div>
    </div>
  );
}