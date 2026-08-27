import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrudManager } from "@/components/admin/crud";

export const Route = createFileRoute("/_authenticated/admin/blogs")({
  component: () => (
    <AdminShell title="Blog" subtitle="Write and publish articles.">
      <CrudManager
        table="blogs"
        titleKey="title"
        subtitle={(r) =>
          `${String(r["category"] || "General")} · ${r["published"] ? "published" : "draft"}`
        }
        searchKeys={["title", "excerpt", "category"]}
        orderBy={{ column: "created_at", ascending: false }}
        extraInvalidate={["site-blogs"]}
        toggles={[{ key: "published", label: "Published" }]}
        defaults={{
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          category: "",
          cover_url: null,
          tags: [],
          published: false,
        }}
        fields={[
          { key: "title", label: "Title", type: "text", slugFrom: "slug" },
          { key: "slug", label: "Slug", type: "text" },
          { key: "category", label: "Category", type: "text" },
          { key: "cover_url", label: "Cover image", type: "image" },
          { key: "tags", label: "Tags (comma separated)", type: "tags" },
          { key: "excerpt", label: "Excerpt", type: "textarea" },
          { key: "content", label: "Content", type: "textarea" },
          { key: "published", label: "Published", type: "checkbox" },
        ]}
      />
    </AdminShell>
  ),
});
