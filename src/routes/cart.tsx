import { createFileRoute, Link } from "@tanstack/react-router";
import { ShopShell } from "@/components/shop/ShopShell";
import { useCart } from "@/lib/cart";
import { formatPrice, productImageUrl, SHIPPING_CENTS, FREE_SHIPPING_OVER_CENTS } from "@/lib/shop";

const title = "Your Cart — Hreemka";
const description = "Review the sacred companions you have chosen before checkout.";

export const Route = createFileRoute("/cart")({
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
  component: CartPage,
});

function CartPage() {
  const { lines, subtotalCents, setQuantity, remove } = useCart();
  const shipping =
    lines.length === 0 || subtotalCents >= FREE_SHIPPING_OVER_CENTS ? 0 : SHIPPING_CENTS;

  return (
    <ShopShell
      title="Your cart"
      subtitle="Everything here is cleansed and charged before dispatch."
    >
      {lines.length === 0 ? (
        <div className="text-center">
          <p className="mb-8 text-sm text-muted-foreground">Your cart is still empty.</p>
          <Link to="/shop" className="btn-sacred">
            Browse the collection
          </Link>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            {lines.map((l) => {
              const image = productImageUrl(l.image);
              return (
                <article
                  key={l.productId}
                  className="liquid-glass card-liquid flex items-center gap-5 p-5"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-secondary">
                    {image ? (
                      <img src={image} alt={l.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl text-muted-foreground/40">
                        ॐ
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg">{l.name}</h2>
                    <p className="text-sm text-muted-foreground">{formatPrice(l.priceCents)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(l.productId, l.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="text-sm">{l.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(l.productId, l.quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(l.productId)}
                        className="ml-3 text-xs tracking-[0.16em] uppercase text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <span className="font-display text-xl">
                    {formatPrice(l.priceCents * l.quantity)}
                  </span>
                </article>
              );
            })}
          </div>

          <aside className="liquid-glass card-liquid h-fit space-y-4 p-7">
            <h2 className="font-display text-2xl">Summary</h2>
            <Row label="Subtotal" value={formatPrice(subtotalCents)} />
            <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
            <div className="border-t border-border/60 pt-4">
              <Row label="Total" value={formatPrice(subtotalCents + shipping)} strong />
            </div>
            <Link to="/checkout" className="btn-sacred w-full">
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </ShopShell>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-display text-xl" : ""}>{value}</span>
    </div>
  );
}
