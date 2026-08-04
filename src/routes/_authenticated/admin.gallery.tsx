import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrudManager } from "@/components/admin/crud";

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  component: () => (
    <AdminShell title="Gallery" subtitle="Images in the Experience Hreemka carousel.">
      <CrudManager
        table="gallery_items"
        titleKey="caption"
        subtitle={(r) => `${String(r["media_type"] || "image")} · order ${String(r["sort_order"])}`}
        searchKeys={["caption", "media_type"]}
        orderBy={{ column: "sort_order", ascending: true }}
        extraInvalidate={["site-gallery"]}
        toggles={[{ key: "active", label: "Active" }]}
        defaults={{ caption: "", media_url: null, media_type: "image", sort_order: 0, active: true }}
        fields={[
          { key: "caption", label: "Caption", type: "text" },
          { key: "media_url", label: "Image", type: "image" },
          { key: "media_type", label: "Media type", type: "text" },
          { key: "sort_order", label: "Display order", type: "number" },
          { key: "active", label: "Active", type: "checkbox" },
        ]}
      />
    </AdminShell>
  ),
});
