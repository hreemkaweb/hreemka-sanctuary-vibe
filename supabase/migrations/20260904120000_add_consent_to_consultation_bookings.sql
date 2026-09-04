ALTER TABLE public.consultation_bookings
  ADD COLUMN IF NOT EXISTS consent boolean NOT NULL DEFAULT false;
