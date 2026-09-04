import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrudManager } from "@/components/admin/crud";

export const Route = createFileRoute("/_authenticated/admin/faqs")({
  component: () => (
    <AdminShell title="FAQs" subtitle="Questions answered on the website.">
      <CrudManager
        table="faqs"
        titleKey="question"
        subtitle={(r) => `order ${String(r["sort_order"])}`}
        searchKeys={["question", "answer"]}
        orderBy={{ column: "sort_order", ascending: true }}
        extraInvalidate={["site-faqs"]}
        toggles={[{ key: "active", label: "Active" }]}
        defaults={{ question: "", answer: "", sort_order: 0, active: true }}
        fields={[
          { key: "question", label: "Question", type: "text" },
          { key: "answer", label: "Answer", type: "textarea" },
          { key: "sort_order", label: "Display order", type: "number" },
          { key: "active", label: "Active", type: "checkbox" },
        ]}
      />
    </AdminShell>
  ),
});
