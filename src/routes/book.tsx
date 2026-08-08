import { createFileRoute } from "@tanstack/react-router";
import { SectionPage } from "@/components/hreemka/SectionPage";
import { Booking } from "@/components/hreemka/sections";

const title = "Book a Consultation — Hreemka";
const description =
  "Share a little about what you're navigating and book your personalized Hreemka consultation.";

export const Route = createFileRoute("/book")({
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
  component: () => (
    <SectionPage>
      <Booking />
    </SectionPage>
  ),
});
