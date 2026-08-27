import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  component: AdminCustomers,
});

function AdminCustomers() {
  const [search, setSearch] = useState("");

  const { data = [] } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const { data: orders } = await supabase.from("orders").select("user_id, total_cents");
      return (profiles ?? []).map((p) => {
        const mine = (orders ?? []).filter((o) => o.user_id === p.id);
        return {
          ...p,
          orders: mine.length,
          spent: mine.reduce((s, o) => s + o.total_cents, 0),
        };
      });
    },
  });

  const q = search.trim().toLowerCase();
  const filtered = data.filter((c) =>
    q ? `${c.full_name ?? ""} ${c.phone ?? ""}`.toLowerCase().includes(q) : true,
  );

  return (
    <AdminShell title="Customers" subtitle="Everyone who has an account with Hreemka.">
      <input
        className="glass-field mb-6 max-w-xs"
        placeholder="Search customers…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="space-y-3">
        {filtered.map((c) => (
          <article
            key={c.id}
            className="liquid-glass card-liquid flex flex-wrap items-center gap-4 p-5"
          >
            <span className="min-w-0 flex-1 truncate">{c.full_name || "Unnamed seeker"}</span>
            <span className="text-xs text-muted-foreground">{c.phone || "—"}</span>
            <span className="text-xs text-muted-foreground">{c.orders} orders</span>
            <span className="text-xs text-muted-foreground">
              Joined {new Date(c.created_at).toLocaleDateString()}
            </span>
          </article>
        ))}
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No customers yet.</p>
        ) : null}
      </div>
    </AdminShell>
  );
}
