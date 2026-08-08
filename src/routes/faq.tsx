import { createFileRoute } from "@tanstack/react-router";
import { SectionPage } from "@/components/hreemka/SectionPage";
import { FAQ } from "@/components/hreemka/sections";

const title = "Frequently Asked Questions — Hreemka";
const description =
  "Answers about sessions, pricing, online consultations and what to expect from your Hreemka experience.";

export const Route = createFileRoute("/faq")({
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
      <FAQ />
    </SectionPage>
  ),
});
