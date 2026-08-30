/**
 * Razorpay provider adapter. Server-only.
 * Keeping every provider call behind this file means the rest of the app never
 * touches Razorpay directly and the provider can be swapped in one place.
 */
import { createHmac, timingSafeEqual } from "crypto";

type Credentials = { keyId: string; keySecret: string };

export function getCredentials(): Credentials {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) {
    throw new Error("Payments are not configured yet.");
  }
  return { keyId, keySecret };
}

function authHeader({ keyId, keySecret }: Credentials) {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export async function createProviderOrder(input: {
  amountPaise: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  if (!Number.isSafeInteger(input.amountPaise) || input.amountPaise <= 0) {
    throw new Error("Payment amount must be a positive whole number of paise.");
  }

  const creds = getCredentials();
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: authHeader(creds) },
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: input.currency,
      receipt: input.receipt.slice(0, 40),
      notes: input.notes ?? {},
    }),
  });
  const body = (await res.json()) as { id?: string; error?: { description?: string } };
  if (!res.ok || !body.id) {
    console.error("RAZORPAY STATUS:", res.status);
    console.error("RAZORPAY RESPONSE:", body);
    throw new Error(body.error?.description || `Razorpay failed with status ${res.status}`);
  }
  return { id: body.id, keyId: creds.keyId };
}

export function verifyProviderSignature(input: {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}) {
  const { keySecret } = getCredentials();
  const expected = createHmac("sha256", keySecret)
    .update(`${input.providerOrderId}|${input.providerPaymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(input.signature || "");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Second check straight from the provider — never trust the browser alone. */
export async function fetchProviderPayment(providerPaymentId: string) {
  const creds = getCredentials();
  const res = await fetch(`https://api.razorpay.com/v1/payments/${providerPaymentId}`, {
    headers: { authorization: authHeader(creds) },
  });
  if (!res.ok) throw new Error("Could not confirm the payment. Please contact support.");
  return (await res.json()) as {
    id: string;
    order_id: string;
    status: string;
    amount: number;
    currency: string;
  };
}
