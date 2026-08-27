import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin/newsletter")({
  component: AdminNewsletter,
});

function AdminNewsletter() {
  const { data = [] } = useQuery({
    queryKey: ["admin", "newsletter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const exportCsv = () => {
    const csv = ["email,subscribed_at", ...data.map((s) => `${s.email},${s.created_at}`)].join(
      "\n",
    );
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "hreemka-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell title="Newsletter" subtitle="People who asked to hear from Hreemka.">
      <div className="mb-6 flex items-center gap-4">
        <span className="font-display text-3xl">{data.length}</span>
        <span className="eyebrow">subscribers</span>
        <button type="button" onClick={exportCsv} className="btn-sacred ml-auto">
          Export CSV
        </button>
      </div>
      <div className="space-y-2">
        {data.map((s) => (
          <div key={s.id} className="liquid-glass card-liquid flex items-center gap-4 p-4 text-sm">
            <span className="min-w-0 flex-1 truncate">{s.email}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(s.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No subscribers yet.</p>
        ) : null}
      </div>
    </AdminShell>
  );
}
