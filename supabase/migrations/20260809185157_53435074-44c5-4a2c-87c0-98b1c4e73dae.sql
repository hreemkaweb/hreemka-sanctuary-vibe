ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_state text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS razorpay_order_id text,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id text;

ALTER TABLE public.consultation_bookings
  ADD COLUMN IF NOT EXISTS razorpay_order_id text,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id text;

ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS amount_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS razorpay_order_id text,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id text;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS registration_id uuid REFERENCES public.event_registrations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'product',
  ADD COLUMN IF NOT EXISTS customer_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS razorpay_order_id text,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id text;

CREATE UNIQUE INDEX IF NOT EXISTS payments_razorpay_payment_id_key
  ON public.payments (razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS payments_razorpay_order_id_key
  ON public.payments (razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS payments_kind_status_idx ON public.payments (kind, status);