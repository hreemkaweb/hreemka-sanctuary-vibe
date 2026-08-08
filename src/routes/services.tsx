import { createFileRoute } from "@tanstack/react-router";
import { SectionPage } from "@/components/hreemka/SectionPage";
import { Services } from "@/components/hreemka/sections";

const title = "Healing Services & Modalities — Hreemka";
const description =
  "Tarot, crystal healing, breathwork, sound healing, numerology and switchwords — offered online or in person.";

export const Route = createFileRoute("/services")({
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
      <Services />
    </SectionPage>
  ),
});
