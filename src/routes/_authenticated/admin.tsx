import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Hreemka" },
      {
        name: "description",
        content: "Manage the Hreemka website, catalog, bookings and content.",
      },
      { property: "og:title", content: "Admin — Hreemka" },
      {
        property: "og:description",
        content: "Manage the Hreemka website, catalog, bookings and content.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Outlet />,
});
