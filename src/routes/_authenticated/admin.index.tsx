import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  ShoppingBag,
  CalendarHeart,
  Users,
  CalendarDays,
  IndianRupee,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

type Counts = {
  products: number;
  orders: number;
  bookings: number;
  customers: number;
  events: number;
  revenueCents: number;
  recentOrders: { id: string; order_number: string; total_cents: number; status: string; created_at: string }[];
  recentBookings: { id: string; customer_name: string; service: string; status: string; created_at: string }[];
  activity: { id: string; title: string; message: string; created_at: string }[];
  revenueByDay: { day: string; total: number }[];
};

function AdminDashboard() {
  const { data } = useQuery<Counts>({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const count = async (table: string) => {
        const { count: c } = await supabase
          .from(table as never)
          .select("id", { count: "exact", head: true });
        return c ?? 0;
      };

      const [products, orders, bookings, customers, events] = await Promise.all([
        count("products"),
        count("orders"),
        count("consultation_bookings"),
        count("profiles"),
        count("events"),
      ]);

      const { data: orderRows } = await supabase
        .from("orders")
        .select("id, order_number, total_cents, status, created_at")
        .order("created_at", { ascending: false });

      const { data: bookingRows } = await supabase
        .from("consultation_bookings")
        .select("id, customer_name, service, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6);

      const { data: activity } = await supabase
        .from("admin_notifications")
        .select("id, title, message, created_at")
        .order("created_at", { ascending: false })
        .limit(8);

      const paid = (orderRows ?? []).filter((o) => o.status !== "cancelled");
      const revenueCents = paid.reduce((sum, o) => sum + o.total_cents, 0);

      const byDay = new Map<string, number>();
      for (const o of paid) {
        const day = new Date(o.created_at).toISOString().slice(0, 10);
        byDay.set(day, (byDay.get(day) ?? 0) + o.total_cents);
      }
      const revenueByDay = [...byDay.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-14)
        .map(([day, total]) => ({ day, total }));

      return {
        products,
        orders,
        bookings,
        customers,
        events,
        revenueCents,
        recentOrders: (orderRows ?? []).slice(0, 6),
        recentBookings: bookingRows ?? [],
        activity: activity ?? [],
        revenueByDay,
      };
    },
  });

  const stats = [
    { label: "Products", value: data?.products ?? 0, icon: Package, to: "/admin/products" },
    { label: "Orders", value: data?.orders ?? 0, icon: ShoppingBag, to: "/admin/orders" },
    { label: "Consultations", value: data?.bookings ?? 0, icon: CalendarHeart, to: "/admin/bookings" },
    { label: "Customers", value: data?.customers ?? 0, icon: Users, to: "/admin/customers" },
    { label: "Events", value: data?.events ?? 0, icon: CalendarDays, to: "/admin/events" },
    {
      label: "Revenue",
      value: formatPrice(data?.revenueCents ?? 0),
      icon: IndianRupee,
      to: "/admin/payments",
    },
  ];

  const max = Math.max(1, ...(data?.revenueByDay ?? []).map((d) => d.total));

  return (
    <AdminShell title="Dashboard" subtitle="Everything happening across Hreemka right now.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to as never}
            className="liquid-glass card-liquid flex items-center gap-4 p-6"
          >
            <span className="grid h-12 w-12 place-content-center rounded-2xl bg-primary/12 text-primary">
              <s.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="eyebrow block">{s.label}</span>
              <span className="font-display text-3xl">{s.value}</span>
            </span>
          </Link>
        ))}
      </div>

      <section className="liquid-glass card-liquid mt-8 p-6">
        <h2 className="font-display text-2xl">Revenue — last 14 active days</h2>
        <div className="mt-6 flex h-44 items-end gap-2">
          {(data?.revenueByDay ?? []).map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-primary/60"
                style={{ height: `${Math.max(4, (d.total / max) * 100)}%` }}
                title={`${d.day}: ${formatPrice(d.total)}`}
              />
              <span className="text-[0.6rem] text-muted-foreground">{d.day.slice(5)}</span>
            </div>
          ))}
          {(data?.revenueByDay ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No revenue recorded yet.</p>
          ) : null}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="liquid-glass card-liquid p-6">
          <h2 className="font-display text-2xl">Recent orders</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(data?.recentOrders ?? []).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3">
                <span className="truncate">{o.order_number}</span>
                <span className="text-muted-foreground">{o.status}</span>
                <span>{formatPrice(o.total_cents)}</span>
              </li>
            ))}
            {(data?.recentOrders ?? []).length === 0 ? (
              <li className="text-muted-foreground">No orders yet.</li>
            ) : null}
          </ul>
        </section>

        <section className="liquid-glass card-liquid p-6">
          <h2 className="font-display text-2xl">Recent consultations</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(data?.recentBookings ?? []).map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3">
                <span className="truncate">{b.customer_name}</span>
                <span className="truncate text-muted-foreground">{b.service || "—"}</span>
                <span className="text-muted-foreground">{b.status}</span>
              </li>
            ))}
            {(data?.recentBookings ?? []).length === 0 ? (
              <li className="text-muted-foreground">No bookings yet.</li>
            ) : null}
          </ul>
        </section>

        <section className="liquid-glass card-liquid p-6 lg:col-span-2">
          <h2 className="font-display text-2xl">Recent activity</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(data?.activity ?? []).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-x-3">
                <span>{a.title}</span>
                <span className="text-muted-foreground">{a.message}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleString()}
                </span>
              </li>
            ))}
            {(data?.activity ?? []).length === 0 ? (
              <li className="text-muted-foreground">Nothing yet.</li>
            ) : null}
          </ul>
        </section>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Add product", to: "/admin/products" },
          { label: "Add event", to: "/admin/events" },
          { label: "Write a blog", to: "/admin/blogs" },
          { label: "Edit homepage", to: "/admin/content" },
        ].map((q) => (
          <Link
            key={q.label}
            to={q.to as never}
            className="liquid-glass card-liquid p-5 text-center text-sm tracking-[0.16em] uppercase"
          >
            {q.label}
          </Link>
        ))}
      </section>
    </AdminShell>
  );
}
