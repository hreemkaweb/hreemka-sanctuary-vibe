import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatPrice, ORDER_STATUSES } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const { data: orders = [] } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const patch = async (id: string, values: Record<string, string>) => {
    const { error } = await supabase.from("orders").update(values).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Order updated");
    await queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
  };

  const q = search.trim().toLowerCase();
  const filtered = orders.filter((o) => {
    if (status !== "All" && o.status !== status) return false;
    if (!q) return true;
    return `${o.order_number} ${o.shipping_name} ${o.shipping_phone}`.toLowerCase().includes(q);
  });

  return (
    <AdminShell title="Orders" subtitle="Fulfilment, status and shipping details.">
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          className="glass-field max-w-xs flex-1"
          placeholder="Search order, name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="glass-field !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          {["All", ...ORDER_STATUSES].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((o) => (
          <article key={o.id} className="liquid-glass card-liquid p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg">{o.order_number}</h3>
                <p className="text-xs text-muted-foreground">
                  {o.shipping_name} · {o.shipping_phone} · {new Date(o.created_at).toLocaleString()}
                </p>
              </div>
              <span className="font-display text-xl">{formatPrice(o.total_cents, o.currency)}</span>
              <select
                className="glass-field !w-auto"
                value={o.status}
                onChange={(e) => patch(o.id, { status: e.target.value })}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                className="glass-field !w-auto"
                value={o.payment_status}
                onChange={(e) => patch(o.id, { payment_status: e.target.value })}
              >
                {["unpaid", "paid", "refunded"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {o.shipping_address}, {o.shipping_city} {o.shipping_postcode}
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              {(o.order_items ?? []).map((it) => (
                <li key={it.id} className="flex justify-between gap-3">
                  <span className="truncate">
                    {it.product_name} × {it.quantity}
                  </span>
                  <span>{formatPrice(it.unit_price_cents * it.quantity, o.currency)}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
        {filtered.length === 0 ? <p className="text-sm text-muted-foreground">No orders found.</p> : null}
      </div>
    </AdminShell>
  );
}
