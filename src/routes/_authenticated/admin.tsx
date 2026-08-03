import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ShopShell } from "@/components/shop/ShopShell";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice, ORDER_STATUSES, productImageUrl, type Order, type Product } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Hreemka" },
      { name: "description", content: "Manage the Hreemka product catalog and orders." },
      { property: "og:title", content: "Admin — Hreemka" },
      { property: "og:description", content: "Manage the Hreemka product catalog and orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const emptyDraft = {
  id: "",
  slug: "",
  name: "",
  description: "",
  category: "Healing Crystals",
  price: "",
  stock: "0",
  images: [] as string[],
  featured: false,
  active: true,
};
type Draft = typeof emptyDraft;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<"products" | "orders">("products");

  if (loading) {
    return (
      <ShopShell>
        <p className="text-center text-sm text-muted-foreground">Checking access…</p>
      </ShopShell>
    );
  }

  if (!isAdmin) {
    return (
      <ShopShell title="Restricted" subtitle="This area is reserved for the Hreemka team.">
        <p className="text-center text-sm text-muted-foreground">
          Your account does not have admin access.
        </p>
      </ShopShell>
    );
  }

  return (
    <ShopShell title="Admin" subtitle="Manage the catalog, stock, pricing and orders.">
      <div className="mb-10 flex justify-center gap-2">
        {(["products", "orders"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full border px-5 py-2 text-xs tracking-[0.16em] uppercase ${
              t === tab
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "products" ? <ProductsAdmin /> : <OrdersAdmin />}
    </ShopShell>
  );
}

/* -------------------------------- Products -------------------------------- */

function ProductsAdmin() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    await queryClient.invalidateQueries({ queryKey: ["products", "public"] });
  };

  const startEdit = (p: Product) =>
    setDraft({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      category: p.category,
      price: String(p.price_cents / 100),
      stock: String(p.stock),
      images: p.images,
      featured: p.featured,
      active: p.active,
    });

  const upload = async (file: File) => {
    if (!draft) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      setDraft({ ...draft, images: [...draft.images, path] });
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!draft) return;
    const priceCents = Math.round(Number(draft.price) * 100);
    if (!draft.name.trim()) return toast.error("Name is required");
    if (!Number.isFinite(priceCents) || priceCents < 0) return toast.error("Enter a valid price");

    setSaving(true);
    try {
      const payload = {
        slug: draft.slug.trim() || slugify(draft.name),
        name: draft.name.trim().slice(0, 120),
        description: draft.description.trim().slice(0, 2000),
        category: draft.category.trim().slice(0, 60) || "General",
        price_cents: priceCents,
        stock: Math.max(0, Math.round(Number(draft.stock) || 0)),
        images: draft.images,
        featured: draft.featured,
        active: draft.active,
      };

      const { error } = draft.id
        ? await supabase.from("products").update(payload).eq("id", draft.id)
        : await supabase.from("products").insert(payload);
      if (error) throw error;

      toast.success(draft.id ? "Product updated" : "Product added");
      setDraft(null);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    await refresh();
  };

  const quickPatch = async (p: Product, patch: Partial<Product>) => {
    const { error } = await supabase.from("products").update(patch).eq("id", p.id);
    if (error) return toast.error(error.message);
    await refresh();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button type="button" className="btn-sacred" onClick={() => setDraft({ ...emptyDraft })}>
          Add product
        </button>
      </div>

      {draft ? (
        <div className="liquid-glass card-liquid space-y-4 p-7">
          <h2 className="font-display text-2xl">{draft.id ? "Edit product" : "New product"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className="glass-field"
              placeholder="Name"
              value={draft.name}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  name: e.target.value,
                  slug: draft.id ? draft.slug : slugify(e.target.value),
                })
              }
            />
            <input
              className="glass-field"
              placeholder="Slug"
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })}
            />
            <input
              className="glass-field"
              placeholder="Category"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            />
            <input
              className="glass-field"
              placeholder="Price (₹)"
              inputMode="decimal"
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: e.target.value })}
            />
            <input
              className="glass-field"
              placeholder="Stock"
              inputMode="numeric"
              value={draft.stock}
              onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
            />
            <label className="flex items-center gap-6 px-2 text-sm">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="glass-check"
                  checked={draft.featured}
                  onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                />
                Featured
              </span>
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="glass-check"
                  checked={draft.active}
                  onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                />
                Visible
              </span>
            </label>
          </div>

          <textarea
            className="glass-field min-h-28"
            placeholder="Description"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />

          <div>
            <p className="eyebrow mb-3">Images</p>
            <div className="flex flex-wrap items-center gap-3">
              {draft.images.map((img) => (
                <div key={img} className="relative h-20 w-20 overflow-hidden rounded-xl bg-secondary">
                  <img
                    src={productImageUrl(img) ?? ""}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({ ...draft, images: draft.images.filter((i) => i !== img) })
                    }
                    className="absolute top-1 right-1 rounded-full bg-background/80 px-1.5 text-xs"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="grid h-20 w-20 cursor-pointer place-content-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                {uploading ? "…" : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void upload(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={save} disabled={saving} className="btn-sacred disabled:opacity-60">
              {saving ? "Saving…" : "Save product"}
            </button>
            <button type="button" onClick={() => setDraft(null)} className="btn-ghost-sacred">
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {products.map((p) => {
          const image = productImageUrl(p.images[0]);
          return (
            <article
              key={p.id}
              className="liquid-glass card-liquid flex flex-wrap items-center gap-5 p-5"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
                {image ? (
                  <img src={image} alt={p.name} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg">{p.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {p.category} · {formatPrice(p.price_cents, p.currency)} · {p.stock} in stock
                  {p.active ? "" : " · hidden"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => quickPatch(p, { featured: !p.featured })}
                className={`rounded-full border px-3 py-1 text-[0.65rem] tracking-[0.16em] uppercase ${
                  p.featured ? "border-gold text-gold" : "border-border text-muted-foreground"
                }`}
              >
                {p.featured ? "★ Featured" : "☆ Feature"}
              </button>
              <button
                type="button"
                onClick={() => startEdit(p)}
                className="text-xs tracking-[0.16em] uppercase text-primary"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(p)}
                className="text-xs tracking-[0.16em] uppercase text-muted-foreground hover:text-destructive"
              >
                Delete
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------- Orders --------------------------------- */

function OrdersAdmin() {
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  const setStatus = async (order: Order, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
    if (error) return toast.error(error.message);
    toast.success(`${order.order_number} → ${status}`);
    await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  if (orders.length === 0) {
    return <p className="text-center text-sm text-muted-foreground">No orders yet.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <article key={o.id} className="liquid-glass card-liquid flex flex-wrap items-center gap-5 p-5">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg">{o.order_number}</h3>
            <p className="text-xs text-muted-foreground">
              {new Date(o.created_at).toLocaleString()} · {o.shipping_name} · {o.shipping_city}
            </p>
          </div>
          <span className="font-display text-xl">{formatPrice(o.total_cents, o.currency)}</span>
          <select
            className="glass-field !w-auto"
            value={o.status}
            onChange={(e) => setStatus(o, e.target.value)}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </article>
      ))}
    </div>
  );
}
