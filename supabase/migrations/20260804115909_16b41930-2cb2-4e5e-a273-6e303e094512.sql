
-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views active categories" ON public.categories FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins view all categories" ON public.categories FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update categories" ON public.categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete categories" ON public.categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CONSULTATION BOOKINGS
CREATE TABLE public.consultation_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  service text NOT NULL DEFAULT '',
  consultation_type text NOT NULL DEFAULT 'online',
  preferred_date date,
  preferred_time text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'unpaid',
  amount_cents integer NOT NULL DEFAULT 0,
  admin_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.consultation_bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultation_bookings TO authenticated;
GRANT ALL ON public.consultation_bookings TO service_role;
ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can request a consultation" ON public.consultation_bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users view own bookings" ON public.consultation_bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view bookings" ON public.consultation_bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update bookings" ON public.consultation_bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete bookings" ON public.consultation_bookings FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER consultation_bookings_updated_at BEFORE UPDATE ON public.consultation_bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- EVENTS
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  banner_url text,
  gallery text[] NOT NULL DEFAULT '{}',
  starts_at timestamptz,
  ends_at timestamptz,
  venue text NOT NULL DEFAULT '',
  speaker_name text NOT NULL DEFAULT '',
  speaker_bio text NOT NULL DEFAULT '',
  is_paid boolean NOT NULL DEFAULT false,
  price_cents integer NOT NULL DEFAULT 0,
  max_seats integer NOT NULL DEFAULT 0,
  registration_enabled boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'upcoming',
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views published events" ON public.events FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins view all events" ON public.events FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update events" ON public.events FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete events" ON public.events FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- EVENT REGISTRATIONS
CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  seats integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'registered',
  payment_status text NOT NULL DEFAULT 'unpaid',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.event_registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_registrations TO authenticated;
GRANT ALL ON public.event_registrations TO service_role;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can register for events" ON public.event_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users view own registrations" ON public.event_registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view registrations" ON public.event_registrations FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update registrations" ON public.event_registrations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete registrations" ON public.event_registrations FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER event_registrations_updated_at BEFORE UPDATE ON public.event_registrations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SERVICES
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '',
  image_url text,
  price_cents integer NOT NULL DEFAULT 0,
  duration text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views active services" ON public.services FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins view all services" ON public.services FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert services" ON public.services FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update services" ON public.services FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete services" ON public.services FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- TESTIMONIALS
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  location text NOT NULL DEFAULT '',
  quote text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  photo_url text,
  approved boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views approved testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (approved = true);
CREATE POLICY "Admins view all testimonials" ON public.testimonials FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- BLOGS
CREATE TABLE public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_url text,
  author text NOT NULL DEFAULT 'Hreemka',
  tags text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blogs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blogs TO authenticated;
GRANT ALL ON public.blogs TO service_role;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views published blogs" ON public.blogs FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins view all blogs" ON public.blogs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert blogs" ON public.blogs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update blogs" ON public.blogs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete blogs" ON public.blogs FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER blogs_updated_at BEFORE UPDATE ON public.blogs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FAQS
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views active faqs" ON public.faqs FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins view all faqs" ON public.faqs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert faqs" ON public.faqs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update faqs" ON public.faqs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete faqs" ON public.faqs FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- GALLERY
CREATE TABLE public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;
GRANT ALL ON public.gallery_items TO service_role;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views active gallery" ON public.gallery_items FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins view all gallery" ON public.gallery_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert gallery" ON public.gallery_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update gallery" ON public.gallery_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete gallery" ON public.gallery_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER gallery_items_updated_at BEFORE UPDATE ON public.gallery_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- NEWSLETTER
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT, INSERT, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins view subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete subscribers" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- PAYMENTS
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.consultation_bookings(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'manual',
  transaction_ref text,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'pending',
  refund_status text NOT NULL DEFAULT 'none',
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own payments" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view payments" ON public.payments FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update payments" ON public.payments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SITE CONTENT (homepage, founder, contact, settings)
CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views site content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert site content" ON public.site_content FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update site content" ON public.site_content FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete site content" ON public.site_content FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ADMIN NOTIFICATIONS
CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view notifications" ON public.admin_notifications FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update notifications" ON public.admin_notifications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete notifications" ON public.admin_notifications FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Notification triggers
CREATE OR REPLACE FUNCTION public.notify_admin_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'consultation_bookings' THEN
    INSERT INTO public.admin_notifications (type, title, message, link)
    VALUES ('booking', 'New consultation booking', NEW.customer_name || ' requested ' || COALESCE(NULLIF(NEW.service,''),'a consultation'), '/admin/bookings');
  ELSIF TG_TABLE_NAME = 'orders' THEN
    INSERT INTO public.admin_notifications (type, title, message, link)
    VALUES ('order', 'New order', 'Order ' || NEW.order_number || ' was placed', '/admin/orders');
  ELSIF TG_TABLE_NAME = 'event_registrations' THEN
    INSERT INTO public.admin_notifications (type, title, message, link)
    VALUES ('registration', 'New event registration', NEW.name || ' registered for an event', '/admin/events');
  ELSIF TG_TABLE_NAME = 'profiles' THEN
    INSERT INTO public.admin_notifications (type, title, message, link)
    VALUES ('customer', 'New customer', COALESCE(NEW.full_name,'A new customer') || ' joined', '/admin/customers');
  ELSIF TG_TABLE_NAME = 'newsletter_subscribers' THEN
    INSERT INTO public.admin_notifications (type, title, message, link)
    VALUES ('newsletter', 'New subscriber', NEW.email || ' subscribed', '/admin/newsletter');
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.notify_admin_event() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER notify_new_booking AFTER INSERT ON public.consultation_bookings FOR EACH ROW EXECUTE FUNCTION public.notify_admin_event();
CREATE TRIGGER notify_new_order AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.notify_admin_event();
CREATE TRIGGER notify_new_registration AFTER INSERT ON public.event_registrations FOR EACH ROW EXECUTE FUNCTION public.notify_admin_event();
CREATE TRIGGER notify_new_customer AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.notify_admin_event();
CREATE TRIGGER notify_new_subscriber AFTER INSERT ON public.newsletter_subscribers FOR EACH ROW EXECUTE FUNCTION public.notify_admin_event();

-- Seed baseline content
INSERT INTO public.site_content (key, value) VALUES
('homepage', '{"hero_heading":"Find clarity, healing and transformation","hero_description":"A sanctuary for the soul — guided by ancient wisdom, held with modern care.","cta_primary":"Book a consultation","cta_secondary":"Explore services","stats":[{"label":"Years of practice","value":"9+"},{"label":"Souls guided","value":"2800+"},{"label":"Modalities","value":"10"}]}'::jsonb),
('founder', '{"name":"Founder, Hreemka","bio":"A lifelong student of energy, ritual and inner transformation.","photo_url":"","experience":"9+ years","certifications":[],"achievements":[],"videos":[]}'::jsonb),
('contact', '{"phone":"","whatsapp":"","email":"","address":"","maps_url":"","hours":"Mon–Sat, 10am–7pm","social":{"instagram":"","facebook":"","youtube":""}}'::jsonb),
('settings', '{"site_name":"Hreemka","logo_url":"","favicon_url":"","seo_title":"Hreemka — Spiritual Healing & Guidance","seo_description":"A sanctuary for clarity, healing and transformation.","google_analytics_id":"","facebook_pixel_id":""}'::jsonb);

INSERT INTO public.categories (name, slug, description, sort_order) VALUES
('Crystals','crystals','Charged crystals and stones',1),
('Candles','candles','Hand-poured ritual candles',2),
('Oils','oils','Sacred oils and blends',3);
