import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ShopShell } from "@/components/shop/ShopShell";
import { useCart } from "@/lib/cart";
import { formatPrice, FREE_SHIPPING_OVER_CENTS, SHIPPING_CENTS } from "@/lib/shop";
import { createProductCheckout } from "@/lib/payments/payments.functions";
import { runCheckout } from "@/lib/payments/checkout";

const title = "Checkout — Hreemka";
const description = "Complete your Hreemka order securely.";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  shipping_name: z.string().trim().min(2, "Please enter your name").max(100),
  shipping_email: z.string().trim().email("Please enter a valid email").max(255),
  shipping_phone: z.string().trim().min(6, "Please enter a phone number").max(20),
  shipping_address: z.string().trim().min(6, "Please enter your address").max(300),
  shipping_city: z.string().trim().min(2, "Please enter your city").max(80),
  shipping_state: z.string().trim().min(2, "Please enter your state").max(80),
  shipping_postcode: z.string().trim().min(3, "Please enter a postcode").max(20),
  notes: z.string().trim().max(500).optional(),
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { lines, subtotalCents, clear } = useCart();
  const [busy, setBusy] = useState(false);

  const shipping =
    lines.length === 0 || subtotalCents >= FREE_SHIPPING_OVER_CENTS ? 0 : SHIPPING_CENTS;
  const total = subtotalCents + shipping;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (lines.length === 0) return;

    const form = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(form));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }

    setBusy(true);
    try {
      const session = await createProductCheckout({
        data: {
          customer: {
            name: parsed.data.shipping_name,
            email: parsed.data.shipping_email,
            phone: parsed.data.shipping_phone,
          },
          shipping: {
            address: parsed.data.shipping_address,
            city: parsed.data.shipping_city,
            state: parsed.data.shipping_state,
            postcode: parsed.data.shipping_postcode,
          },
          ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        },
      });

      const result = await runCheckout(session, { description: `Order ${session.recordLabel}` });

      if (result.status === "successful") {
        clear();
        toast.success(`Payment received — order ${session.recordLabel} confirmed`);
      } else if (result.status === "processing") {
        clear();
        toast.message(result.message ?? "We are confirming your payment.");
      } else {
        toast.error(result.message ?? "Payment was not completed.");
      }

      void navigate({ to: "/orders/$id", params: { id: session.recordId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start the payment");
    } finally {
      setBusy(false);
    }
  };

  if (lines.length === 0) {
    return (
      <ShopShell title="Checkout" subtitle="Your cart is empty.">
        <div className="text-center">
          <Link to="/shop" className="btn-sacred">
            Browse the collection
          </Link>
        </div>
      </ShopShell>
    );
  }

  return (
    <ShopShell title="Checkout" subtitle="Tell us where your companions should travel.">
      <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="liquid-glass card-liquid space-y-4 p-7">
          <input name="shipping_name" className="glass-field" placeholder="Full name" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              name="shipping_email"
              type="email"
              className="glass-field"
              placeholder="Email"
              required
            />
            <input name="shipping_phone" className="glass-field" placeholder="Phone" required />
          </div>
          <textarea
            name="shipping_address"
            className="glass-field min-h-24"
            placeholder="Address"
            required
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <input name="shipping_city" className="glass-field" placeholder="City" required />
            <input name="shipping_state" className="glass-field" placeholder="State" required />
            <input
              name="shipping_postcode"
              className="glass-field"
              placeholder="Postcode"
              required
            />
          </div>
          <textarea name="notes" className="glass-field min-h-20" placeholder="Notes (optional)" />
        </div>

        <aside className="liquid-glass card-liquid h-fit space-y-4 p-7">
          <h2 className="font-display text-2xl">Order</h2>
          {lines.map((l) => (
            <div key={l.productId} className="flex justify-between text-sm">
              <span className="min-w-0 truncate text-muted-foreground">
                {l.name} × {l.quantity}
              </span>
              <span>{formatPrice(l.priceCents * l.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-border/60 pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-display text-2xl">{formatPrice(total)}</span>
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-sacred w-full disabled:opacity-60">
            {busy ? "Opening secure payment…" : "Pay securely"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Payments are processed securely by Razorpay. Cards, UPI, netbanking and wallets
            accepted.
          </p>
        </aside>
      </form>
    </ShopShell>
  );
}
