import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const consultationRequestSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().min(6).max(20),
  }),
  service: z.string().trim().min(2).max(120),
  consultationType: z.string().trim().min(2).max(60),
  preferredDate: z.string().trim().min(4).max(20),
  preferredTime: z.string().trim().min(2).max(20),
  message: z.string().trim().min(1).max(1000),
  consent: z.literal(true),
});

export const createConsultationRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => consultationRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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
        message: data.message,
        consent: data.consent,
        status: "pending",
        payment_status: "unpaid",
        amount_cents: 0,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Consultation insert failed", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }
    return { id: booking.id };
  });
