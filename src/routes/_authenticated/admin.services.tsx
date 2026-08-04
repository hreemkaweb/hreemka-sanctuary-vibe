import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrudManager } from "@/components/admin/crud";

export const Route = createFileRoute("/_authenticated/admin/services")({
  component: () => (
    <AdminShell title="Services" subtitle="Healing modalities shown across the website.">
      <CrudManager
        table="services"
        titleKey="name"
        subtitle={(r) => `${String(r["duration"] || "—")} · order ${String(r["sort_order"])}`}
        searchKeys={["name", "slug", "description"]}
        orderBy={{ column: "sort_order", ascending: true }}
        extraInvalidate={["site-services"]}
        toggles={[{ key: "active", label: "Active" }]}
        defaults={{
          name: "",
          slug: "",
          description: "",
          icon: "",
          image_url: null,
          price_cents: 0,
          duration: "",
          sort_order: 0,
          active: true,
        }}
        fields={[
          { key: "name", label: "Name", type: "text", slugFrom: "slug" },
          { key: "slug", label: "Slug", type: "text" },
          { key: "icon", label: "Icon (emoji or name)", type: "text" },
          { key: "duration", label: "Duration", type: "text" },
          { key: "price_cents", label: "Price (₹)", type: "price" },
          { key: "sort_order", label: "Display order", type: "number" },
          { key: "image_url", label: "Image", type: "image" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "active", label: "Active", type: "checkbox" },
        ]}
      />
    </AdminShell>
  ),
});
