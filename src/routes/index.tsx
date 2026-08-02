import { createFileRoute } from "@tanstack/react-router";
import { HeroStory } from "@/components/hreemka/HeroStory";
import { ExperienceGallery } from "@/components/hreemka/ExperienceGallery";
import {
  Booking,
  Events,
  FAQ,
  Footer,
  Founder,
  Journey,
  Nav,
  Products,
  Services,
  Stories,
  WhatsAppButton,
  WhyChoose,
} from "@/components/hreemka/sections";

const title = "Hreemka — Spiritual Healing, Tarot & Personalized Guidance";
const description =
  "A calm sanctuary for clarity and emotional healing. Tarot, crystal healing, breathwork, sound healing, numerology and switchwords — 9+ years, 2,800+ clients.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HealthAndBeautyBusiness",
          name: "Hreemka",
          description,
          url: "/",
          areaServed: "IN",
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div id="top" className="bg-background">
      <Nav />
      <main>
        <HeroStory />
        <ExperienceGallery />

        <Founder />
        <WhyChoose />
        <Journey />
        <Services />
        <Products />
        <Stories />
        <Events />
        <FAQ />
        <Booking />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
