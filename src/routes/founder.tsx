import { createFileRoute } from "@tanstack/react-router";
import { SectionPage } from "@/components/hreemka/SectionPage";
import { Founder } from "@/components/hreemka/sections";

const title = "Meet the Founder — Hreemka";
const description =
  "Nine years of spiritual practice, 2,800+ clients guided. Meet the founder behind Hreemka's healing sanctuary.";

export const Route = createFileRoute("/founder")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <SectionPage>
      <Founder />
    </SectionPage>
  ),
});
