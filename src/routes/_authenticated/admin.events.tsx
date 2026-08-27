import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrudManager } from "@/components/admin/crud";

export const Route = createFileRoute("/_authenticated/admin/events")({
  component: () => (
    <AdminShell title="Events" subtitle="Workshops, retreats and circles.">
      <CrudManager
        table="events"
        titleKey="title"
        subtitle={(r) =>
          `${String(r["starts_at"] ?? "")
            .slice(0, 16)
            .replace("T", " ")} · ${String(r["location"] || "Online")}`
        }
        searchKeys={["title", "location", "description"]}
        orderBy={{ column: "starts_at", ascending: false }}
        extraInvalidate={["site-events"]}
        toggles={[
          { key: "featured", label: "Featured" },
          { key: "active", label: "Active" },
        ]}
        defaults={{
          title: "",
          slug: "",
          description: "",
          image_url: null,
          location: "",
          starts_at: null,
          ends_at: null,
          price_cents: 0,
          capacity: 0,
          featured: false,
          active: true,
        }}
        fields={[
          { key: "title", label: "Title", type: "text", slugFrom: "slug" },
          { key: "slug", label: "Slug", type: "text" },
          { key: "location", label: "Location", type: "text" },
          { key: "starts_at", label: "Starts", type: "datetime" },
          { key: "ends_at", label: "Ends", type: "datetime" },
          { key: "price_cents", label: "Price (₹)", type: "price" },
          { key: "capacity", label: "Capacity", type: "number" },
          { key: "image_url", label: "Cover image", type: "image" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "featured", label: "Featured", type: "checkbox" },
          { key: "active", label: "Active", type: "checkbox" },
        ]}
      />
    </AdminShell>
  ),
});
