import { Link, useRouter } from "@tanstack/react-router";
import { Footer, Nav, WhatsAppButton } from "./sections";

/** Shared frame for standalone section pages, with a hassle-free back button. */
export function SectionPage({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="bg-background">
      <Nav />
      <div className="mx-auto max-w-6xl px-6 pt-28 sm:pt-32">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.history.back();
              } else {
                router.navigate({ to: "/" });
              }
            }}
            className="liquid-glass rounded-full px-5 py-2.5 text-xs tracking-[0.2em] uppercase text-foreground transition-opacity hover:opacity-70"
          >
            ← Back
          </button>
          <Link
            to="/"
            className="text-xs tracking-[0.2em] uppercase text-muted-foreground transition-opacity hover:opacity-60"
          >
            Home
          </Link>
        </div>
      </div>
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
