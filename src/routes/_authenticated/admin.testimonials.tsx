import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrudManager } from "@/components/admin/crud";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  component: () => (
    <AdminShell title="Testimonials" subtitle="Client stories shown on the homepage.">
      <CrudManager
        table="testimonials"
        titleKey="client_name"
        subtitle={(r) => `${String(r["location"] || "")} · ${String(r["rating"] ?? 5)}★`}
        searchKeys={["client_name", "quote", "location"]}
        orderBy={{ column: "sort_order", ascending: true }}
        extraInvalidate={["site-testimonials"]}
        toggles={[
          { key: "featured", label: "Featured" },
          { key: "approved", label: "Approved" },
        ]}
        defaults={{
          client_name: "",
          location: "",
          quote: "",
          rating: 5,
          featured: false,
          approved: true,
        }}
        fields={[
          { key: "client_name", label: "Client name", type: "text" },
          { key: "location", label: "Location", type: "text" },
          { key: "rating", label: "Rating (1-5)", type: "number" },
          { key: "quote", label: "Testimonial", type: "textarea" },
        ]}
      />
    </AdminShell>
  ),
});
