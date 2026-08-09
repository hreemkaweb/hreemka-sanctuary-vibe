/**
 * Browser-side checkout helper. UI components call `runCheckout` and only ever
 * see a simple result, so the provider can change without touching screens.
 */
import type { CheckoutSession, PaymentStatus } from "./config";
import { verifyPayment, markPaymentFailed } from "./payments.functions";

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

function loadScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("unavailable"));
    if (window.Razorpay) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Payment window failed to load.")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Payment window failed to load."));
    document.body.appendChild(script);
  });
}

export type CheckoutResult = {
  status: PaymentStatus;
  recordId: string;
  message?: string;
};

export async function runCheckout(
  session: CheckoutSession,
  options: { description: string },
): Promise<CheckoutResult> {
  await loadScript();
  const RazorpayCtor = window.Razorpay;
  if (!RazorpayCtor) throw new Error("Payment window failed to load.");

  return new Promise<CheckoutResult>((resolve) => {
    let settled = false;
    const finish = (result: CheckoutResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const rzp = new RazorpayCtor({
      key: session.keyId,
      amount: session.amountCents,
      currency: session.currency,
      order_id: session.providerOrderId,
      name: "Hreemka",
      description: options.description,
      prefill: {
        name: session.customer.name,
        email: session.customer.email,
        contact: session.customer.phone,
      },
      theme: { color: "#6F4BAE" },
      modal: {
        ondismiss: () => {
          void markPaymentFailed({
            data: { paymentId: session.paymentId, status: "cancelled" },
          });
          finish({
            status: "cancelled",
            recordId: session.recordId,
            message: "Payment was cancelled before it completed.",
          });
        },
      },
      handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        void (async () => {
          try {
            const verified = await verifyPayment({
              data: {
                paymentId: session.paymentId,
                providerOrderId: response.razorpay_order_id,
                providerPaymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
            });
            finish(
              verified.status === "successful"
                ? { status: "successful", recordId: verified.recordId }
                : {
                    status: "failed",
                    recordId: verified.recordId,
                    message:
                      "We could not confirm this payment. Nothing has been charged to your order.",
                  },
            );
          } catch {
            finish({
              status: "processing",
              recordId: session.recordId,
              message: "Payment received — we are still confirming it. We will be in touch shortly.",
            });
          }
        })();
      },
    } as Record<string, unknown>);

    rzp.on("payment.failed", () => {
      void markPaymentFailed({ data: { paymentId: session.paymentId, status: "failed" } });
      finish({
        status: "failed",
        recordId: session.recordId,
        message: "The payment did not go through. You can try again.",
      });
    });

    rzp.open();
  });
}
