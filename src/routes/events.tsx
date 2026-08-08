import { createFileRoute } from "@tanstack/react-router";
import { SectionPage } from "@/components/hreemka/SectionPage";
import { Events } from "@/components/hreemka/sections";

const title = "Circles, Workshops & Events — Hreemka";
const description =
  "Join upcoming healing circles, workshops and retreats hosted by Hreemka. Limited seats each month.";

export const Route = createFileRoute("/events")({
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
      <Events />
    </SectionPage>
  ),
});
