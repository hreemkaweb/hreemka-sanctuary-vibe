import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  CalendarHeart,
  CreditCard,
  Users,
  Sparkles,
  Star,
  PenLine,
  HelpCircle,
  Images,
  CalendarDays,
  Mail,
  Settings,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };

export const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/bookings", label: "Consultations", icon: CalendarHeart },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/services", label: "Services", icon: Sparkles },
  { to: "/admin/testimonials", label: "Testimonials", icon: Star },
  { to: "/admin/blogs", label: "Blog", icon: PenLine },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/admin/gallery", label: "Gallery", icon: Images },
  { to: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { to: "/admin/content", label: "Site content", icon: Settings },
];

export function AdminShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { isAdmin, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data: unread = 0 } = useQuery({
    queryKey: ["admin-unread-notifications"],
    enabled: isAdmin,
    refetchInterval: 60_000,
    queryFn: async () => {
      const { count } = await supabase
        .from("admin_notifications")
        .select("id", { count: "exact", head: true })
        .eq("read", false);
      return count ?? 0;
    },
  });

  if (loading) {
    return (
      <div className="veil grid min-h-screen place-content-center">
        <p className="text-sm text-muted-foreground">Checking access…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="veil grid min-h-screen place-content-center px-6 text-center">
        <h1 className="font-display text-3xl">Restricted</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This area is reserved for the Hreemka team.
        </p>
        <Link to="/" className="mt-6 text-xs tracking-[0.2em] uppercase text-primary">
          Back to site
        </Link>
      </div>
    );
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {ADMIN_NAV.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to as never}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition-colors ${
              active
                ? "bg-primary/12 text-primary"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="veil min-h-screen">
      <div className="mx-auto flex max-w-[1500px] gap-8 px-4 py-6 sm:px-6">
        <aside className="liquid-glass sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col overflow-y-auto rounded-3xl p-5 lg:flex">
          <Link to="/" className="mb-6 block px-3 font-display text-2xl">
            Hreemka
          </Link>
          {nav}
        </aside>

        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <aside className="liquid-glass absolute top-0 left-0 h-full w-72 overflow-y-auto rounded-r-3xl p-5">
              <div className="mb-6 flex items-center justify-between px-2">
                <span className="font-display text-2xl">Hreemka</span>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {nav}
            </aside>
          </div>
        ) : null}

        <main className="min-w-0 flex-1 pb-16">
          <header className="mb-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="liquid-glass rounded-2xl p-2.5 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              {actions}
              <span className="liquid-glass relative flex items-center gap-2 rounded-full px-3 py-2 text-xs text-muted-foreground">
                <Bell className="h-4 w-4" />
                {unread}
              </span>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
