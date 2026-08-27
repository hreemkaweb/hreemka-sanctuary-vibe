import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ShopShell } from "@/components/shop/ShopShell";
import { formatPrice, productImageUrl, type Product } from "@/lib/shop";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/shop/$slug")({
  head: ({ params }) => {
    const title = `${params.slug.replace(/-/g, " ")} — Hreemka Shop`;
    const description = "A consecrated companion from the Hreemka collection.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });

  if (isLoading) {
    return (
      <ShopShell>
        <p className="text-center text-sm text-muted-foreground">Loading…</p>
      </ShopShell>
    );
  }

  if (!product) {
    return (
      <ShopShell title="Not found" subtitle="This companion is no longer available.">
        <div className="text-center">
          <Link to="/shop" className="btn-sacred">
            Back to shop
          </Link>
        </div>
      </ShopShell>
    );
  }

  const image = productImageUrl(product.images[0]);
  const soldOut = product.stock <= 0;

  return (
    <ShopShell>
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="liquid-glass card-liquid aspect-square overflow-hidden">
          {image ? (
            <img src={image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-7xl text-muted-foreground/30">
              ॐ
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="eyebrow">{product.category}</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">{product.name}</h1>
          <p className="mt-5 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-8 flex items-baseline gap-4">
            <span className="font-display text-3xl">
              {formatPrice(product.price_cents, product.currency)}
            </span>
            {product.compare_at_cents ? (
              <span className="text-sm line-through text-muted-foreground">
                {formatPrice(product.compare_at_cents, product.currency)}
              </span>
            ) : null}
          </div>

          <p className="mt-2 text-xs tracking-[0.16em] uppercase text-muted-foreground">
            {soldOut ? "Currently sold out" : `${product.stock} in stock`}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-border px-4 py-2">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease"
              >
                −
              </button>
              <span className="w-6 text-center text-sm">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))}
                aria-label="Increase"
              >
                +
              </button>
            </div>
            <button
              type="button"
              disabled={soldOut}
              onClick={() => {
                add(
                  {
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    priceCents: product.price_cents,
                    image: product.images[0] ?? null,
                  },
                  qty,
                );
                toast.success(`${product.name} added to your cart`);
              }}
              className="btn-sacred disabled:cursor-not-allowed disabled:opacity-50"
            >
              {soldOut ? "Sold out" : "Add to cart"}
            </button>
            <Link to="/cart" className="btn-ghost-sacred">
              View cart
            </Link>
          </div>
        </div>
      </div>
    </ShopShell>
  );
}
