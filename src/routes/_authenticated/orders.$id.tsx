import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShopShell } from "@/components/shop/ShopShell";
import { formatPrice, productImageUrl, type Order, type OrderItem } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order details — Hreemka" },
      { name: "description", content: "Track the status of your Hreemka order." },
      { property: "og:title", content: "Order details — Hreemka" },
      { property: "og:description", content: "Track the status of your Hreemka order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderPage,
});

const TIMELINE = ["pending", "confirmed", "packed", "shipped", "delivered"];

function OrderPage() {
  const { id } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);
      if (itemsError) throw itemsError;
      return { order: order as Order | null, items: (items ?? []) as OrderItem[] };
    },
  });

  if (isLoading) {
    return (
      <ShopShell>
        <p className="text-center text-sm text-muted-foreground">Loading…</p>
      </ShopShell>
    );
  }

  if (!data?.order) {
    return (
      <ShopShell title="Order not found">
        <div className="text-center">
          <Link to="/account" className="btn-sacred">
            Back to account
          </Link>
        </div>
      </ShopShell>
    );
  }

  const { order, items } = data;
  const stepIndex = TIMELINE.indexOf(order.status);

  return (
    <ShopShell title={order.order_number} subtitle={`Placed ${new Date(order.created_at).toLocaleString()}`}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="liquid-glass card-liquid p-7">
            <h2 className="mb-5 font-display text-2xl">Tracking</h2>
            {order.status === "cancelled" ? (
              <p className="text-sm text-destructive">This order was cancelled.</p>
            ) : (
              <ol className="space-y-4">
                {TIMELINE.map((step, i) => (
                  <li key={step} className="flex items-center gap-4">
                    <span
                      className={`grid h-7 w-7 place-content-center rounded-full text-[0.65rem] ${
                        i <= stepIndex
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={`text-sm capitalize ${
                        i <= stepIndex ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="liquid-glass card-liquid space-y-4 p-7">
            <h2 className="font-display text-2xl">Items</h2>
            {items.map((it) => {
              const image = productImageUrl(it.image_url);
              return (
                <div key={it.id} className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-secondary">
                    {image ? (
                      <img src={image} alt={it.product_name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{it.product_name}</p>
                    <p className="text-xs text-muted-foreground">Qty {it.quantity}</p>
                  </div>
                  <span className="text-sm">
                    {formatPrice(it.unit_price_cents * it.quantity, order.currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="liquid-glass card-liquid h-fit space-y-4 p-7 text-sm">
          <h2 className="font-display text-2xl">Summary</h2>
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal_cents, order.currency)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>
              {order.shipping_cents === 0
                ? "Free"
                : formatPrice(order.shipping_cents, order.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-4">
            <span className="text-muted-foreground">Total</span>
            <span className="font-display text-2xl">
              {formatPrice(order.total_cents, order.currency)}
            </span>
          </div>
          <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">
            Payment: {order.payment_status}
          </p>
          <div className="border-t border-border/60 pt-4 leading-relaxed text-muted-foreground">
            <p className="text-foreground">{order.shipping_name}</p>
            <p>{order.shipping_phone}</p>
            <p>{order.shipping_address}</p>
            <p>
              {order.shipping_city} {order.shipping_postcode}
            </p>
          </div>
        </aside>
      </div>
    </ShopShell>
  );
}
