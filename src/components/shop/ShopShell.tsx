import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/lib/cart";

/** Shared page frame for every commerce screen. */
export function ShopShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="veil min-h-screen">
      <ShopNav />
      <main className="mx-auto max-w-6xl px-6 pt-32 pb-24 sm:pt-36">
        {title ? (
          <header className="mb-12 text-center">
            <h1 className="font-display text-4xl sm:text-5xl">{title}</h1>
            {subtitle ? (
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </header>
        ) : null}
        {children}
      </main>
      <footer className="border-t border-border/60 py-10 text-center text-xs tracking-[0.2em] uppercase text-muted-foreground">
        Hreemka — crafted with care
      </footer>
    </div>
  );
}

export function ShopNav() {
  const { count } = useCart();
  const { user, isAdmin } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="liquid-glass liquid-glass-strong mx-auto max-w-6xl rounded-full">
        <div className="flex items-center justify-between gap-4 px-5 py-3 sm:px-7">
          <Link to="/" className="font-display text-xl tracking-[0.28em] uppercase text-foreground">
            Hreemka
          </Link>

          <nav className="flex items-center gap-4 text-xs tracking-[0.18em] uppercase sm:gap-6">
            <Link to="/shop" className="hover:opacity-60">
              Shop
            </Link>
            {isAdmin ? (
              <Link to="/admin" className="text-primary hover:opacity-60">
                Admin
              </Link>
            ) : null}
            <Link to={user ? "/account" : "/auth"} className="hover:opacity-60">
              {user ? "Account" : "Sign in"}
            </Link>
            <Link to="/cart" className="relative hover:opacity-60">
              Cart
              {count > 0 ? (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[0.65rem] text-primary-foreground">
                  {count}
                </span>
              ) : null}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
