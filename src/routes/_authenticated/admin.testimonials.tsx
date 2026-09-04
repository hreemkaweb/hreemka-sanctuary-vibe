import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrudManager } from "@/components/admin/crud";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  component: () => (
    <AdminShell title="Testimonials" subtitle="Client stories shown on the homepage.">
      <CrudManager
        table="testimonials"
        titleKey="name"
        subtitle={(r) => `${String(r["location"] || "")} · ${String(r["rating"] ?? 5)}★`}
        searchKeys={["name", "quote", "location"]}
        orderBy={{ column: "sort_order", ascending: true }}
        extraInvalidate={["site-testimonials"]}
        toggles={[
          { key: "featured", label: "Featured" },
          { key: "active", label: "Active" },
        ]}
        defaults={{
          name: "",
          location: "",
          quote: "",
          service: "",
          rating: 5,
          image_url: null,
          sort_order: 0,
          featured: false,
          active: true,
        }}
        fields={[
          { key: "name", label: "Client name", type: "text" },
          { key: "location", label: "Location", type: "text" },
          { key: "service", label: "Service", type: "text" },
          { key: "rating", label: "Rating (1-5)", type: "number" },
          { key: "sort_order", label: "Display order", type: "number" },
          { key: "image_url", label: "Photo", type: "image" },
          { key: "quote", label: "Testimonial", type: "textarea" },
          { key: "featured", label: "Featured", type: "checkbox" },
          { key: "active", label: "Active", type: "checkbox" },
        ]}
      />
    </AdminShell>
  ),
});
