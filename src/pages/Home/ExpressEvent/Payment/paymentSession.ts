export interface PendingEventPayment {
  eventId: string;
  plan: string;
  chargeId: string;
  transactionId: string;
  orderId: string;
  transactionUrl: string;
  totalPrice?: number;
  tax?: number;
  initiatedAt?: string;
}

const PAYMENT_SESSION_PREFIX = "event_payment_session:";

export function getPaymentSessionKey(eventId: string | number) {
  return `${PAYMENT_SESSION_PREFIX}${eventId}`;
}

export function savePendingEventPayment(payment: PendingEventPayment) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    getPaymentSessionKey(payment.eventId),
    JSON.stringify(payment)
  );
}

export function loadPendingEventPayment(eventId: string | number) {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(getPaymentSessionKey(eventId));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingEventPayment;
  } catch {
    return null;
  }
}

export function clearPendingEventPayment(eventId: string | number) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(getPaymentSessionKey(eventId));
}
