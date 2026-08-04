import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  component: AdminPayments,
});

function AdminPayments() {
  const { data = [] } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const total = data
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount_cents, 0);

  return (
    <AdminShell title="Payments" subtitle="Transactions recorded against orders and bookings.">
      <div className="liquid-glass card-liquid mb-6 p-6">
        <span className="eyebrow block">Collected</span>
        <span className="font-display text-4xl">{formatPrice(total)}</span>
      </div>
      <div className="space-y-3">
        {data.map((p) => (
          <article key={p.id} className="liquid-glass card-liquid flex flex-wrap items-center gap-4 p-5">
            <span className="min-w-0 flex-1 truncate">{p.transaction_ref || p.id}</span>
            <span className="text-xs text-muted-foreground">{p.provider}</span>
            <span className="text-xs text-muted-foreground">{p.status}</span>
            <span className="font-display text-lg">{formatPrice(p.amount_cents, p.currency)}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(p.created_at).toLocaleString()}
            </span>
          </article>
        ))}
        {data.length === 0 ? <p className="text-sm text-muted-foreground">No payments recorded yet.</p> : null}
      </div>
    </AdminShell>
  );
}
