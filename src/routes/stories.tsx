import { createFileRoute } from "@tanstack/react-router";
import { SectionPage } from "@/components/hreemka/SectionPage";
import { Stories } from "@/components/hreemka/sections";

const title = "Client Stories & Testimonials — Hreemka";
const description =
  "Real people, real healing. Read stories from clients who found clarity and calm with Hreemka.";

export const Route = createFileRoute("/stories")({
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
      <Stories />
    </SectionPage>
  ),
});
