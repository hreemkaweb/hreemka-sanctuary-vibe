import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ShopShell } from "@/components/shop/ShopShell";
import { formatPrice, type Order } from "@/lib/shop";

const title = "Your Account — Hreemka";
const description = "Your Hreemka profile and complete order history.";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const id = userData.user?.id;
      if (!id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return { ...data, email: userData.user?.email ?? "" };
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const id = userData.user?.id;
      if (!id) throw new Error("Please sign in again");
      const { error } = await supabase
        .from("profiles")
        .upsert({ id, full_name: fullName.trim().slice(0, 100), phone: phone.trim().slice(0, 20) });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };

  return (
    <ShopShell title="Your account" subtitle="Profile details and every order you have placed.">
      <div className="grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)]">
        <form onSubmit={save} className="liquid-glass card-liquid h-fit space-y-4 p-7">
          <h2 className="font-display text-2xl">Profile</h2>
          <p className="text-xs text-muted-foreground">{profile?.email}</p>
          <input
            className="glass-field"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={100}
          />
          <input
            className="glass-field"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
          />
          <button type="submit" disabled={saving} className="btn-sacred w-full disabled:opacity-60">
            {saving ? "Saving…" : "Save profile"}
          </button>
          <button
            type="button"
            onClick={signOut}
            className="w-full text-center text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-destructive"
          >
            Sign out
          </button>
        </form>

        <section>
          <h2 className="mb-5 font-display text-2xl">Order history</h2>
          {orders.length === 0 ? (
            <div className="liquid-glass card-liquid p-8 text-center">
              <p className="mb-6 text-sm text-muted-foreground">No orders yet.</p>
              <Link to="/shop" className="btn-sacred">
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  to="/orders/$id"
                  params={{ id: o.id }}
                  className="liquid-glass card-liquid flex flex-wrap items-center justify-between gap-4 p-6"
                >
                  <div>
                    <p className="font-display text-lg">{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="rounded-full border border-border px-3 py-1 text-[0.65rem] tracking-[0.18em] uppercase">
                    {o.status}
                  </span>
                  <span className="font-display text-xl">{formatPrice(o.total_cents)}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </ShopShell>
  );
}
