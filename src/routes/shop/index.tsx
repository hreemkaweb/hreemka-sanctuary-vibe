import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShopShell } from "@/components/shop/ShopShell";
import { formatPrice, productImageUrl, type Product } from "@/lib/shop";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

const title = "Shop Sacred Companions — Hreemka";
const description =
  "Crystals, bracelets, candles, oils and ritual accessories — cleansed, charged and shipped from the Hreemka sanctuary.";

export const Route = createFileRoute("/shop/")({
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
  component: ShopPage,
});

function ShopPage() {
  const [category, setCategory] = useState<string>("All");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const visible = category === "All" ? products : products.filter((p) => p.category === category);

  return (
    <ShopShell
      title="Sacred companions"
      subtitle="A small, consecrated collection that extends your practice into everyday life."
    >
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full border px-4 py-2 text-xs tracking-[0.16em] uppercase transition-colors ${
              c === category
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground">Gathering the collection…</p>
      ) : visible.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          No products in this collection yet.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </ShopShell>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const image = productImageUrl(product.images[0]);
  const soldOut = product.stock <= 0;

  return (
    <article className="liquid-glass card-liquid flex flex-col overflow-hidden">
      <Link
        to="/shop/$slug"
        params={{ slug: product.slug }}
        className="block aspect-4/3 overflow-hidden bg-secondary"
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-4xl text-muted-foreground/40">
            ॐ
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">{product.category}</p>
            <h2 className="mt-1 truncate text-xl">
              <Link to="/shop/$slug" params={{ slug: product.slug }}>
                {product.name}
              </Link>
            </h2>
          </div>
          {product.featured ? (
            <span className="shrink-0 rounded-full border border-gold/50 px-2 py-1 text-[0.6rem] tracking-[0.2em] uppercase text-gold">
              Featured
            </span>
          ) : null}
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="font-display text-2xl">
            {formatPrice(product.price_cents, product.currency)}
          </span>
          <button
            type="button"
            disabled={soldOut}
            onClick={() => {
              add({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.price_cents,
                image: product.images[0] ?? null,
              });
              toast.success(`${product.name} added to your cart`);
            }}
            className="btn-sacred !px-5 !py-2.5 !text-[0.7rem] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {soldOut ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
