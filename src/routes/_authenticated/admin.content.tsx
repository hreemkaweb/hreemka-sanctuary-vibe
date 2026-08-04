import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin/content")({
  component: AdminContent,
});

function AdminContent() {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data = [] } = useQuery({
    queryKey: ["admin", "site-content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("*").order("key");
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    setValues(Object.fromEntries(data.map((row) => [row.key, String(row.value ?? "")])));
  }, [data]);

  const save = async () => {
    setSaving(true);
    try {
      for (const row of data) {
        const next = values[row.key] ?? "";
        if (next === (row.value ?? "")) continue;
        const { error } = await supabase.from("site_content").update({ value: next }).eq("key", row.key);
        if (error) throw error;
      }
      toast.success("Website content updated");
      await queryClient.invalidateQueries({ queryKey: ["admin", "site-content"] });
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Site content"
      subtitle="Homepage copy, founder story, contact details and settings."
    >
      <div className="liquid-glass card-liquid space-y-5 p-7">
        {data.map((row) => (
          <label key={row.key} className="block">
            <span className="eyebrow mb-2 block">{row.key.replaceAll("_", " ")}</span>
            <textarea
              className="glass-field min-h-20"
              value={values[row.key] ?? ""}
              onChange={(e) => setValues({ ...values, [row.key]: e.target.value })}
            />
          </label>
        ))}
        {data.length === 0 ? <p className="text-sm text-muted-foreground">No content keys yet.</p> : null}
        <button type="button" onClick={save} disabled={saving} className="btn-sacred disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </AdminShell>
  );
}
