import { createFileRoute } from "@tanstack/react-router";
import { SectionPage } from "@/components/hreemka/SectionPage";
import { Products } from "@/components/hreemka/sections";

const title = "Sacred Products & Companions — Hreemka";
const description =
  "Ethically sourced crystals, candles and oils to support your daily practice. Shop the Hreemka collection.";

export const Route = createFileRoute("/products")({
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
      <Products />
    </SectionPage>
  ),
});
