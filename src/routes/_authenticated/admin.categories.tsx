import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrudManager } from "@/components/admin/crud";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: () => (
    <AdminShell title="Categories" subtitle="Group products across the storefront.">
      <CrudManager
        table="categories"
        titleKey="name"
        subtitle={(r) => `${String(r["slug"])} · order ${String(r["sort_order"])}`}
        searchKeys={["name", "slug"]}
        orderBy={{ column: "sort_order", ascending: true }}
        extraInvalidate={["products"]}
        toggles={[{ key: "active", label: "Active" }]}
        defaults={{
          name: "",
          slug: "",
          description: "",
          image_url: null,
          sort_order: 0,
          active: true,
        }}
        fields={[
          { key: "name", label: "Name", type: "text", slugFrom: "slug" },
          { key: "slug", label: "Slug", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "image_url", label: "Image", type: "image" },
          { key: "sort_order", label: "Sort order", type: "number" },
          { key: "active", label: "Active", type: "checkbox" },
        ]}
      />
    </AdminShell>
  ),
});
