/**
 * Shared, backend-agnostic payment types.
 * Nothing here imports the database client, so the payment UI keeps working
 * even if the backend is swapped later.
 */

export type PaymentKind = "product" | "consultation" | "event";

export const PAYMENT_STATUSES = [
  "pending",
  "processing",
  "successful",
  "failed",
  "cancelled",
  "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_KINDS: PaymentKind[] = ["product", "consultation", "event"];

/** What the server hands back so the checkout widget can open. */
export type CheckoutSession = {
  /** Our own payments row id — used to verify / fail the attempt. */
  paymentId: string;
  providerOrderId: string;
  keyId: string;
  amountCents: number;
  currency: string;
  /** Domain record created in a pending state (order / booking / registration). */
  recordId: string;
  recordLabel: string;
  customer: { name: string; email: string; phone: string };
};

export const CURRENCY = "INR";
