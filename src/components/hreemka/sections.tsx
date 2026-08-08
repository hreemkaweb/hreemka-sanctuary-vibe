import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mandala, Particles, Reveal, SectionHeading } from "./primitives";
import founderImg from "@/assets/founder.jpg";

const WHATSAPP = "https://wa.me/919000000000?text=Hi%20Hreemka%2C%20I%27d%20like%20to%20book%20a%20consultation";

/* ---------------------------------- Nav ---------------------------------- */

const navLinks = [
  { label: "Founder", to: "/founder" },
  { label: "Journey", to: "/journey" },
  { label: "Services", to: "/services" },
  { label: "Products", to: "/products" },
  { label: "Stories", to: "/stories" },
  { label: "Events", to: "/events" },
  { label: "FAQ", to: "/faq" },
] as const;


export function Nav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onHome = pathname === "/";
  const [atTop, setAtTop] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY <= 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Only the home page has a dark cinematic hero behind the nav.
  const scrolled = !onHome || !atTop;


  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={`liquid-glass mx-auto max-w-7xl rounded-full transition-all duration-700 ${
          scrolled ? "liquid-glass-strong" : ""
        }`}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 sm:px-7">
          <Link
            to="/"
            className={`min-w-0 font-display text-2xl tracking-[0.28em] uppercase transition-colors ${
              scrolled ? "text-foreground" : "text-primary-foreground"
            }`}
          >
            Hreemka
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-xs tracking-[0.18em] uppercase transition-opacity hover:opacity-60 ${
                  scrolled ? "text-foreground" : "text-primary-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link to="/book" className="btn-sacred !px-6 !py-3">
              Book now
            </Link>
          </nav>


          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className={`shrink-0 rounded-full border border-current/30 px-4 py-2 text-xs tracking-[0.2em] uppercase lg:hidden ${
              scrolled ? "text-foreground" : "text-primary-foreground"
            }`}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open ? (
        <div className="liquid-glass liquid-glass-strong mx-1 mt-3 rounded-3xl p-6 lg:hidden">

          <div className="flex flex-col gap-4">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-xs tracking-[0.2em] uppercase text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Link to="/book" onClick={() => setOpen(false)} className="btn-sacred mt-2">
              Book now
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

/* -------------------------------- Founder -------------------------------- */

const founderStats = [
  { value: "9+", label: "Years of practice" },
  { value: "2,800+", label: "Clients transformed" },
  { value: "10", label: "Healing modalities" },
  { value: "100%", label: "Ethical guidance" },
];

export function Founder() {
  return (
    <section id="founder" className="relative overflow-hidden py-28 sm:py-36">
      <Mandala className="absolute -left-40 top-10 h-[520px] w-[520px]" />
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-lavender" />
            <img
              src={founderImg}
              alt="Founder of Hreemka, spiritual healer and guide"
              width={1024}
              height={1280}
              loading="lazy"
              className="relative w-full rounded-[2rem] object-cover shadow-[var(--shadow-lift)]"
            />
          </div>
        </Reveal>

        <div>
          <SectionHeading
            align="left"
            eyebrow="Meet the founder"
            title="Guidance held with warmth, wisdom and complete confidentiality"
            subtitle="Hreemka was born from a simple belief — that healing should never feel frightening or transactional. For over nine years, our founder has walked beside people navigating heartbreak, career confusion, anxiety and the quiet ache of feeling stuck, blending ancient Indian spiritual wisdom with grounded, holistic practice."
          />
          <Reveal delay={120}>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              Every session is personal. No fear-based predictions, no rituals you did not ask
              for — only clarity, compassion and practices you can carry into daily life.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {founderStats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl text-primary">{s.value}</p>
                  <p className="mt-1 text-xs tracking-[0.14em] uppercase text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Why choose ------------------------------ */

const reasons = [
  {
    title: "Personal, never templated",
    text: "Your session is shaped around your story, energy and season of life — never a script.",
  },
  {
    title: "Ethical and fear-free",
    text: "No frightening predictions or pressure. Only honest insight and grounded next steps.",
  },
  {
    title: "Ancient wisdom, modern care",
    text: "Time-honoured Indian practices offered with the clarity of contemporary counselling.",
  },
  {
    title: "Complete confidentiality",
    text: "What you share stays in the sanctuary. Always.",
  },
];

export function WhyChoose() {
  return (
    <section className="veil relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Why Hreemka"
          title="A sanctuary, not a service"
          subtitle="Four promises that shape every consultation we hold."
        />
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={i * 90}>
              <article className="liquid-glass card-liquid h-full p-9">
                <span className="font-display text-4xl text-gold">{`0${i + 1}`}</span>
                <h3 className="mt-4 text-2xl">{r.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{r.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Journey -------------------------------- */

const journey = [
  { step: "Reach out", text: "Share what feels heavy — in a message or a short call." },
  { step: "Discovery", text: "We map your energy, patterns and emotional root causes together." },
  { step: "Healing session", text: "Tarot, crystals, breath or sound — chosen for what you need." },
  { step: "Your practice", text: "Switchwords, affirmations and rituals for daily life." },
  { step: "Integration", text: "A follow-up to steady the shift and celebrate the change." },
];

export function Journey() {
  return (
    <section id="journey" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading
          eyebrow="The healing journey"
          title="Five gentle steps from confusion to clarity"
        />
        <div className="mt-16 space-y-0">
          {journey.map((j, i) => (
            <Reveal key={j.step} delay={i * 80}>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-6 sm:gap-10">
                <div className="flex flex-col items-center">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/50 font-display text-lg text-primary">
                    {i + 1}
                  </span>
                  {i < journey.length - 1 ? (
                    <span className="w-px flex-1 bg-gradient-to-b from-gold/50 to-transparent" />
                  ) : null}
                </div>
                <div className="min-w-0 pb-12">
                  <h3 className="text-2xl">{j.step}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{j.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Services ------------------------------- */

const services = [
  ["Personalized Consultation", "A deep one-to-one reading of where you are and what wants to shift."],
  ["Tarot Guidance", "Honest, intuitive insight into love, career and life decisions."],
  ["Crystal Healing", "Stones selected for your energy to restore balance and calm."],
  ["Breathwork", "Guided breathing to release anxiety held in the nervous system."],
  ["Sound Healing", "Singing bowls and vibration to quiet an overactive mind."],
  ["Numerology", "Your numbers, decoded into practical life direction."],
  ["Switchwords", "Short sacred words to reprogram thought and attract flow."],
  ["Affirmations", "Personalised affirmations that rewrite inner dialogue."],
  ["Chakra Healing", "Rebalancing the energy centres that govern daily wellbeing."],
  ["Emotional Root Cause Healing", "Tracing recurring pain to its origin — and releasing it."],
] as const;

export function Services() {
  return (
    <section id="services" className="veil relative overflow-hidden py-28 sm:py-36">
      <Mandala className="absolute -right-52 bottom-0 h-[620px] w-[620px]" />
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Healing modalities"
          title="Choose the practice your heart is drawn to"
          subtitle="Every modality can be offered online or in person, and often blended within a single session."
        />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(([title, text], i) => (
            <Reveal key={title} delay={(i % 3) * 90}>
              <article className="liquid-glass card-liquid flex h-full flex-col p-8">
                <h3 className="text-2xl">{title}</h3>
                <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">{text}</p>
                <Link
                  to="/book"
                  className="mt-7 text-xs tracking-[0.2em] uppercase text-primary transition-opacity hover:opacity-60"
                >
                  Book now →
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Products ------------------------------- */

const products = [
  ["Healing Crystals", "Hand-picked, cleansed and charged before they reach you."],
  ["Crystal Bracelets", "Wearable support for grounding, love and protection."],
  ["Candles", "Slow-poured, softly scented companions for evening rituals."],
  ["Essential Oils", "Pure blends to steady the breath and lift the mood."],
  ["Incense", "Traditional resins that mark the beginning of sacred time."],
  ["Spiritual Accessories", "Malas, altar cloths and keepsakes for your practice."],
];

export function Products() {
  return (
    <section id="products" className="py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Sacred companions"
          title="Objects that hold the healing between sessions"
          subtitle="A small collection of consecrated pieces, available to order and delivered to your door."
        />
        <div className="mt-16 space-y-4">
          {products.map((p, i) => (
            <Reveal key={p[0]} delay={i * 70}>
              <article className="liquid-glass card-liquid group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 px-7 py-7">
                <span className="font-display text-sm text-gold">{`0${i + 1}`}</span>
                <div className="min-w-0">
                  <h3 className="text-2xl">{p[0]}</h3>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{p[1]}</p>
                </div>
                <Link
                  to="/shop"
                  className="shrink-0 text-xs tracking-[0.2em] uppercase text-primary"
                >
                  Shop
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/shop" className="btn-sacred">
            Visit the shop
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Stories -------------------------------- */

const stories = [
  {
    name: "Ananya R.",
    place: "Mumbai",
    quote:
      "I came in carrying five years of grief I could not name. Three sessions later I sleep through the night. Nothing about it felt mystical or forced — it felt like being understood.",
  },
  {
    name: "Karthik S.",
    place: "Bengaluru",
    quote:
      "I was stuck between two career paths. The reading did not tell me what to do; it showed me why I was afraid. I made the decision myself, calmly, that same week.",
  },
  {
    name: "Meera J.",
    place: "Pune",
    quote:
      "The switchwords and affirmations became my morning ritual. Six months on, my relationship with my mother has completely softened.",
  },
];

const testimonials = [
  { name: "Divya P.", text: "Genuine, warm and never fear-based. Rare in this space.", rating: 5 },
  { name: "Rohan M.", text: "The sound healing session was the first hour of quiet I'd had in years.", rating: 5 },
  { name: "Sneha K.", text: "Practical guidance I could actually use the next morning.", rating: 5 },
  { name: "Ayesha N.", text: "I felt held, not sold to. That made all the difference.", rating: 5 },
];

export function Stories() {
  return (
    <section id="stories" className="veil py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Transformation stories"
          title="What changes when someone finally listens"
        />
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {stories.map((s, i) => (
            <Reveal key={s.name} delay={i * 110}>
              <figure className="liquid-glass card-liquid flex h-full flex-col p-9">
                <span className="font-display text-5xl leading-none text-gold">&ldquo;</span>
                <blockquote className="mt-3 flex-1 text-lg leading-relaxed">{s.quote}</blockquote>
                <figcaption className="mt-7 text-xs tracking-[0.2em] uppercase text-muted-foreground">
                  {s.name} · {s.place}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <article className="liquid-glass card-liquid h-full p-7">
                <p className="text-sm tracking-[0.3em] text-gold">{"★".repeat(t.rating)}</p>
                <p className="mt-3 leading-relaxed">{t.text}</p>
                <p className="mt-5 text-xs tracking-[0.2em] uppercase text-muted-foreground">
                  {t.name}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Events -------------------------------- */

const events = [
  { date: "12 Aug", title: "Full Moon Sound Healing", place: "Mumbai · In person", spots: "12 seats" },
  { date: "24 Aug", title: "Breathwork for Anxiety", place: "Online · 90 minutes", spots: "Open" },
  { date: "07 Sep", title: "Crystal & Chakra Workshop", place: "Pune · In person", spots: "18 seats" },
  { date: "28 Sep", title: "Weekend Healing Retreat", place: "Lonavala · 2 days", spots: "9 seats" },
];

export function Events() {
  return (
    <section id="events" className="py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading
          eyebrow="Upcoming gatherings"
          title="Workshops, circles and retreats"
          subtitle="Small groups, held gently. Registration closes when the circle is full."
        />
        <div className="mt-16 space-y-4">
          {events.map((e, i) => (
            <Reveal key={e.title} delay={i * 80}>
              <article className="liquid-glass card-liquid grid grid-cols-[auto_minmax(0,1fr)] items-center gap-6 p-7 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                <div className="shrink-0 text-center">
                  <p className="font-display text-2xl text-primary">{e.date.split(" ")[0]}</p>
                  <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
                    {e.date.split(" ")[1]}
                  </p>
                </div>
                <div className="min-w-0">
                  <h3 className="text-2xl">{e.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {e.place} · {e.spots}
                  </p>
                </div>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost-sacred col-span-2 sm:col-span-1"
                >
                  Register
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- FAQ ---------------------------------- */

const faqs = [
  ["Is this astrology or fortune telling?", "No. We do not predict fixed futures or use fear. Our work is about clarity, emotional healing and practical guidance you can act on."],
  ["Do I need to believe in any of this?", "Not at all. Many clients arrive sceptical. You only need honesty about what feels heavy right now."],
  ["Are online sessions as effective?", "Yes. Energy work, tarot, breathwork and sound healing all translate beautifully over video."],
  ["How long is a consultation?", "A first consultation runs 60–75 minutes, with a short follow-up note afterwards."],
  ["Is my information private?", "Completely. Nothing shared in a session is ever discussed, recorded or published."],
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="veil py-28 sm:py-36">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading eyebrow="Questions" title="Everything you may be wondering" />
        <div className="liquid-glass mt-14 divide-y divide-border/60 rounded-[2rem] px-8 py-2 sm:px-10">
          {faqs.map(([q, a], i) => (
            <div key={q} className="py-6">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 text-left"
              >
                <span className="min-w-0 font-display text-xl">{q}</span>
                <span className="shrink-0 text-gold transition-transform duration-500" style={{ transform: open === i ? "rotate(45deg)" : "none" }}>
                  +
                </span>
              </button>
              <div
                className="grid transition-all duration-700 ease-out"
                style={{ gridTemplateRows: open === i ? "1fr" : "0fr", opacity: open === i ? 1 : 0 }}
              >
                <div className="overflow-hidden">
                  <p className="pt-4 leading-relaxed text-muted-foreground">{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Booking -------------------------------- */

export function Booking() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="booking" className="relative overflow-hidden py-28 sm:py-36">
      <div className="halo absolute inset-0" />
      <Particles />
      <div className="relative mx-auto max-w-5xl px-6">
        <SectionHeading
          eyebrow="Book a consultation"
          title="Your first conversation begins here"
          subtitle="Share a few details and we will confirm your session personally, usually within a day."
        />

        <Reveal delay={120}>
          <form
            className="liquid-glass liquid-glass-strong mt-14 grid gap-5 rounded-[2rem] p-8 sm:grid-cols-2 sm:p-10"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <Field label="Your name">
              <input required maxLength={100} className="field" placeholder="Full name" />
            </Field>
            <Field label="Email or phone">
              <input required maxLength={120} className="field" placeholder="How we reach you" />
            </Field>
            <Field label="Service">
              <select required className="field" defaultValue="">
                <option value="" disabled>
                  Select a service
                </option>
                {services.map(([s]) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Mode">
              <select required className="field" defaultValue="Online">
                <option>Online</option>
                <option>In person</option>
              </select>
            </Field>
            <Field label="Preferred date">
              <input required type="date" className="field" />
            </Field>
            <Field label="Preferred time">
              <input required type="time" className="field" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="What would you like guidance on?">
                <textarea rows={4} maxLength={1000} className="field resize-none" placeholder="Share as much or as little as you wish" />
              </Field>
            </div>
            <label className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground sm:col-span-2">
              <input type="checkbox" required className="glass-check mt-0.5" />
              <span>
                I understand this is a supportive wellness consultation and consent to being
                contacted about my session.
              </span>
            </label>
            <div className="flex flex-wrap items-center gap-4 sm:col-span-2">

              <button type="submit" className="btn-sacred">
                Request my session
              </button>
              <a href={WHATSAPP} target="_blank" rel="noreferrer" className="btn-ghost-sacred">
                Chat on WhatsApp
              </a>
              {submitted ? (
                <p className="text-sm text-primary">
                  Thank you — your request is received. We will confirm shortly.
                </p>
              ) : null}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs tracking-[0.18em] uppercase text-muted-foreground">{label}</span>
      <div className="mt-2 [&_.field]:glass-field">{children}</div>
    </label>
  );
}

/* --------------------------------- Footer -------------------------------- */

export function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  return (
    <footer className="veil border-t border-border py-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl tracking-[0.28em] uppercase">Hreemka</p>
          <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">
            A sanctuary for clarity, emotional healing and transformation — rooted in ancient
            Indian wisdom, offered with modern care.
          </p>
          <div className="mt-6 flex gap-4 text-xs tracking-[0.2em] uppercase text-muted-foreground">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer">YouTube</a>
          </div>
        </div>

        <div>
          <p className="eyebrow">Explore</p>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-opacity hover:opacity-60">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">Stay in the circle</p>
          <p className="mt-5 text-sm text-muted-foreground">
            Monthly reflections, switchwords and event invitations.
          </p>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSubscribed(true);
            }}
          >
            <input
              type="email"
              required
              maxLength={255}
              placeholder="Your email"
              className="glass-field min-w-0 flex-1 rounded-full"
            />
            <button type="submit" className="btn-sacred !px-6 !py-3">
              Join
            </button>
          </form>
          {subscribed ? <p className="mt-3 text-sm text-primary">You&apos;re in. Welcome.</p> : null}
        </div>
      </div>
      <p className="mx-auto mt-14 max-w-6xl px-6 text-xs tracking-[0.16em] uppercase text-muted-foreground">
        © {new Date().getFullYear()} Hreemka · Made with care
      </p>
    </footer>
  );
}

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Hreemka on WhatsApp"
      className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-lift)] transition-transform duration-500 hover:scale-105"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.13.82.83-3.05-.2-.31a8.16 8.16 0 0 1-1.25-4.35c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.24 8.21Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.02s.87 2.34.99 2.5c.12.17 1.71 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29Z" />
      </svg>
    </a>
  );
}
