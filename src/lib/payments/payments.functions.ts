import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CURRENCY, type CheckoutSession } from "./config";

const customerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(20),
});

const SHIPPING_CENTS = 9900;
const FREE_SHIPPING_OVER_CENTS = 500000;

/** Public config the browser needs to open the checkout widget. */
export const getPaymentConfig = createServerFn({ method: "GET" }).handler(async () => {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  return { enabled: Boolean(keyId && process.env["RAZORPAY_KEY_SECRET"]), keyId: keyId ?? "" };
});

/* ------------------------------- Products -------------------------------- */

export const createProductCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        customer: customerSchema,
        shipping: z.object({
          address: z.string().trim().min(6).max(300),
          city: z.string().trim().min(2).max(80),
          state: z.string().trim().min(2).max(80),
          postcode: z.string().trim().min(3).max(20),
        }),
        notes: z.string().trim().max(500).optional(),
        items: z
          .array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(20) }))
          .min(1)
          .max(30),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<CheckoutSession> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createProviderOrder } = await import("./provider.server");

    const ids = data.items.map((i) => i.productId);
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("id, name, price_cents, images, active")
      .in("id", ids);
    if (error) throw error;

    const lines = data.items.map((item) => {
      const product = (products ?? []).find((p) => p.id === item.productId);
      if (!product || !product.active) throw new Error("A product in your cart is no longer available.");
      return {
        product_id: product.id,
        product_name: product.name,
        unit_price_cents: product.price_cents,
        quantity: item.quantity,
        image_url: product.images?.[0] ?? null,
      };
    });

    const subtotal = lines.reduce((s, l) => s + l.unit_price_cents * l.quantity, 0);
    const shipping = subtotal >= FREE_SHIPPING_OVER_CENTS ? 0 : SHIPPING_CENTS;
    const total = subtotal + shipping;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: context.userId,
        status: "pending",
        payment_status: "pending",
        currency: CURRENCY,
        subtotal_cents: subtotal,
        shipping_cents: shipping,
        total_cents: total,
        customer_email: data.customer.email,
        shipping_name: data.customer.name,
        shipping_phone: data.customer.phone,
        shipping_address: data.shipping.address,
        shipping_city: data.shipping.city,
        shipping_state: data.shipping.state,
        shipping_postcode: data.shipping.postcode,
        notes: data.notes ?? null,
      })
      .select("id, order_number")
      .single();
    if (orderError) throw orderError;

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(lines.map((l) => ({ ...l, order_id: order.id })));
    if (itemsError) throw itemsError;

    const provider = await createProviderOrder({
      amountCents: total,
      currency: CURRENCY,
      receipt: order.order_number,
      notes: { kind: "product", order_id: order.id },
    });

    const payment = await insertPayment(supabaseAdmin, {
      kind: "product",
      order_id: order.id,
      user_id: context.userId,
      amount_cents: total,
      customer: data.customer,
      razorpay_order_id: provider.id,
    });

    await supabaseAdmin.from("orders").update({ razorpay_order_id: provider.id }).eq("id", order.id);

    return {
      paymentId: payment.id,
      providerOrderId: provider.id,
      keyId: provider.keyId,
      amountCents: total,
      currency: CURRENCY,
      recordId: order.id,
      recordLabel: order.order_number,
      customer: data.customer,
    };
  });

/* ----------------------------- Consultations ------------------------------ */

export const createConsultationCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        customer: customerSchema,
        service: z.string().trim().min(2).max(120),
        consultationType: z.string().trim().min(2).max(60),
        preferredDate: z.string().trim().min(4).max(20),
        preferredTime: z.string().trim().min(2).max(20),
        message: z.string().trim().max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<CheckoutSession> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createProviderOrder } = await import("./provider.server");

    const { data: service } = await supabaseAdmin
      .from("services")
      .select("name, price_cents")
      .eq("name", data.service)
      .maybeSingle();
    const amount = service?.price_cents && service.price_cents > 0 ? service.price_cents : 150000;

    const { data: booking, error } = await supabaseAdmin
      .from("consultation_bookings")
      .insert({
        customer_name: data.customer.name,
        email: data.customer.email,
        phone: data.customer.phone,
        service: data.service,
        consultation_type: data.consultationType,
        preferred_date: data.preferredDate,
        preferred_time: data.preferredTime,
        message: data.message ?? "",
        status: "pending",
        payment_status: "pending",
        amount_cents: amount,
      })
      .select("id")
      .single();
    if (error) throw error;

    const provider = await createProviderOrder({
      amountCents: amount,
      currency: CURRENCY,
      receipt: `booking-${booking.id.slice(0, 8)}`,
      notes: { kind: "consultation", booking_id: booking.id },
    });

    const payment = await insertPayment(supabaseAdmin, {
      kind: "consultation",
      booking_id: booking.id,
      amount_cents: amount,
      customer: data.customer,
      razorpay_order_id: provider.id,
    });

    await supabaseAdmin
      .from("consultation_bookings")
      .update({ razorpay_order_id: provider.id })
      .eq("id", booking.id);

    return {
      paymentId: payment.id,
      providerOrderId: provider.id,
      keyId: provider.keyId,
      amountCents: amount,
      currency: CURRENCY,
      recordId: booking.id,
      recordLabel: data.service,
      customer: data.customer,
    };
  });

/* --------------------------------- Events --------------------------------- */

const eventRegistrationInput = z.object({
  customer: customerSchema,
  eventId: z.string().uuid(),
  seats: z.number().int().min(1).max(10),
});

/** Free events skip payment entirely and confirm immediately. */
export const registerForFreeEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => eventRegistrationInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: event, error } = await supabaseAdmin
      .from("events")
      .select("id, title, is_paid, price_cents, registration_enabled")
      .eq("id", data.eventId)
      .maybeSingle();
    if (error) throw error;
    if (!event || !event.registration_enabled) throw new Error("Registration is closed for this event.");
    if (event.is_paid && event.price_cents > 0) throw new Error("This event requires payment.");

    const { data: reg, error: regError } = await supabaseAdmin
      .from("event_registrations")
      .insert({
        event_id: event.id,
        name: data.customer.name,
        email: data.customer.email,
        phone: data.customer.phone,
        seats: data.seats,
        status: "confirmed",
        payment_status: "free",
        amount_cents: 0,
      })
      .select("id")
      .single();
    if (regError) throw regError;
    return { registrationId: reg.id, eventTitle: event.title };
  });

export const createEventCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => eventRegistrationInput.parse(input))
  .handler(async ({ data }): Promise<CheckoutSession> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createProviderOrder } = await import("./provider.server");

    const { data: event, error } = await supabaseAdmin
      .from("events")
      .select("id, title, is_paid, price_cents, registration_enabled")
      .eq("id", data.eventId)
      .maybeSingle();
    if (error) throw error;
    if (!event || !event.registration_enabled) throw new Error("Registration is closed for this event.");
    if (!event.is_paid || event.price_cents <= 0) throw new Error("This event is free — no payment needed.");

    const amount = event.price_cents * data.seats;

    const { data: reg, error: regError } = await supabaseAdmin
      .from("event_registrations")
      .insert({
        event_id: event.id,
        name: data.customer.name,
        email: data.customer.email,
        phone: data.customer.phone,
        seats: data.seats,
        status: "pending",
        payment_status: "pending",
        amount_cents: amount,
      })
      .select("id")
      .single();
    if (regError) throw regError;

    const provider = await createProviderOrder({
      amountCents: amount,
      currency: CURRENCY,
      receipt: `event-${reg.id.slice(0, 8)}`,
      notes: { kind: "event", registration_id: reg.id },
    });

    const payment = await insertPayment(supabaseAdmin, {
      kind: "event",
      registration_id: reg.id,
      amount_cents: amount,
      customer: data.customer,
      razorpay_order_id: provider.id,
    });

    await supabaseAdmin
      .from("event_registrations")
      .update({ razorpay_order_id: provider.id })
      .eq("id", reg.id);

    return {
      paymentId: payment.id,
      providerOrderId: provider.id,
      keyId: provider.keyId,
      amountCents: amount,
      currency: CURRENCY,
      recordId: reg.id,
      recordLabel: event.title,
      customer: data.customer,
    };
  });

/* ------------------------------ Verification ------------------------------ */

export const verifyPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        paymentId: z.string().uuid(),
        providerOrderId: z.string().trim().min(4).max(80),
        providerPaymentId: z.string().trim().min(4).max(80),
        signature: z.string().trim().min(8).max(256),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { verifyProviderSignature, fetchProviderPayment } = await import("./provider.server");

    const { data: row, error } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("id", data.paymentId)
      .maybeSingle();
    if (error) throw error;
    if (!row) throw new Error("Payment record not found.");

    // Duplicate protection — already verified, just report success again.
    if (row.status === "successful") {
      return { status: "successful" as const, recordId: recordIdOf(row) };
    }
    if (row.razorpay_order_id !== data.providerOrderId) throw new Error("Payment mismatch.");

    const signatureOk = verifyProviderSignature({
      providerOrderId: data.providerOrderId,
      providerPaymentId: data.providerPaymentId,
      signature: data.signature,
    });

    let captured = false;
    if (signatureOk) {
      const remote = await fetchProviderPayment(data.providerPaymentId);
      captured =
        remote.order_id === data.providerOrderId &&
        remote.amount === row.amount_cents &&
        (remote.status === "captured" || remote.status === "authorized");
    }

    if (!signatureOk || !captured) {
      await settle(supabaseAdmin, row, "failed", data.providerPaymentId);
      return { status: "failed" as const, recordId: recordIdOf(row) };
    }

    await settle(supabaseAdmin, row, "successful", data.providerPaymentId);
    return { status: "successful" as const, recordId: recordIdOf(row) };
  });

export const markPaymentFailed = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        paymentId: z.string().uuid(),
        status: z.enum(["failed", "cancelled"]),
        reason: z.string().trim().max(300).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("id", data.paymentId)
      .maybeSingle();
    if (!row || row.status === "successful") return { ok: true };
    await settle(supabaseAdmin, row, data.status, null, data.reason);
    return { ok: true };
  });

/* -------------------------------- helpers --------------------------------- */

type AdminClient = Awaited<
  typeof import("@/integrations/supabase/client.server")
>["supabaseAdmin"];

type PaymentRow = {
  id: string;
  kind: string;
  order_id: string | null;
  booking_id: string | null;
  registration_id: string | null;
  amount_cents: number;
  status: string;
  razorpay_order_id: string | null;
  meta: unknown;
};

function recordIdOf(row: PaymentRow) {
  return row.order_id ?? row.booking_id ?? row.registration_id ?? row.id;
}

async function insertPayment(
  supabaseAdmin: AdminClient,
  input: {
    kind: string;
    order_id?: string;
    booking_id?: string;
    registration_id?: string;
    user_id?: string;
    amount_cents: number;
    customer: { name: string; email: string; phone: string };
    razorpay_order_id: string;
  },
) {
  const { data, error } = await supabaseAdmin
    .from("payments")
    .insert({
      kind: input.kind,
      order_id: input.order_id ?? null,
      booking_id: input.booking_id ?? null,
      registration_id: input.registration_id ?? null,
      user_id: input.user_id ?? null,
      provider: "razorpay",
      amount_cents: input.amount_cents,
      currency: CURRENCY,
      status: "pending",
      customer_name: input.customer.name,
      customer_email: input.customer.email,
      razorpay_order_id: input.razorpay_order_id,
      meta: { phone: input.customer.phone },
    })
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

/** Writes the payment outcome across the payment row and its domain record. */
async function settle(
  supabaseAdmin: AdminClient,
  row: PaymentRow,
  status: "successful" | "failed" | "cancelled",
  providerPaymentId: string | null,
  reason?: string,
) {
  const meta =
    typeof row.meta === "object" && row.meta !== null ? (row.meta as Record<string, unknown>) : {};

  await supabaseAdmin
    .from("payments")
    .update({
      status,
      transaction_ref: providerPaymentId,
      razorpay_payment_id: providerPaymentId,
      meta: reason ? { ...meta, reason } : meta,
    })
    .eq("id", row.id);

  const paid = status === "successful";

  if (row.order_id) {
    await supabaseAdmin
      .from("orders")
      .update({
        payment_status: paid ? "paid" : status,
        status: paid ? "confirmed" : "pending",
        payment_ref: providerPaymentId,
        razorpay_payment_id: providerPaymentId,
      })
      .eq("id", row.order_id);
  }
  if (row.booking_id) {
    await supabaseAdmin
      .from("consultation_bookings")
      .update({
        payment_status: paid ? "paid" : status,
        status: paid ? "confirmed" : "pending",
        razorpay_payment_id: providerPaymentId,
      })
      .eq("id", row.booking_id);
  }
  if (row.registration_id) {
    await supabaseAdmin
      .from("event_registrations")
      .update({
        payment_status: paid ? "paid" : status,
        status: paid ? "confirmed" : "pending",
        razorpay_payment_id: providerPaymentId,
      })
      .eq("id", row.registration_id);
  }
}
