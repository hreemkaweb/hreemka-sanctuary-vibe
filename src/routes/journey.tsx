import { createFileRoute } from "@tanstack/react-router";
import { SectionPage } from "@/components/hreemka/SectionPage";
import { Journey } from "@/components/hreemka/sections";

const title = "Your Healing Journey — Hreemka";
const description =
  "A gentle step-by-step path: from first conversation to lasting transformation with Hreemka.";

export const Route = createFileRoute("/journey")({
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
      <Journey />
    </SectionPage>
  ),
});
