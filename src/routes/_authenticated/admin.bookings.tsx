import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrudManager } from "@/components/admin/crud";

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  component: () => (
    <AdminShell title="Consultations" subtitle="Booking requests and their status.">
      <CrudManager
        table="consultation_bookings"
        titleKey="customer_name"
        subtitle={(r) =>
          `${String(r["service"] || "—")} · ${String(r["preferred_date"] ?? "")
            .slice(0, 16)
            .replace("T", " ")} · ${String(r["status"])}`
        }
        searchKeys={["customer_name", "email", "phone", "service"]}
        orderBy={{ column: "created_at", ascending: false }}
        defaults={{
          customer_name: "",
          email: "",
          phone: "",
          service: "",
          consultation_type: "online",
          preferred_date: null,
          preferred_time: "",
          message: "",
          consent: false,
          status: "pending",
          admin_notes: "",
        }}
        fields={[
          { key: "customer_name", label: "Name", type: "text" },
          { key: "email", label: "Email", type: "text" },
          { key: "phone", label: "Phone", type: "text" },
          { key: "service", label: "Service", type: "text" },
          { key: "consultation_type", label: "Mode", type: "text" },
          { key: "preferred_date", label: "Preferred date", type: "date" },
          { key: "preferred_time", label: "Preferred time", type: "text" },
          { key: "consent", label: "Consent received", type: "checkbox" },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: ["pending", "confirmed", "completed", "cancelled"],
          },
          { key: "message", label: "Message", type: "textarea" },
          { key: "admin_notes", label: "Internal notes", type: "textarea" },
        ]}
      />
    </AdminShell>
  ),
});
