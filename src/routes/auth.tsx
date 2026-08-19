import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ShopShell } from "@/components/shop/ShopShell";

const title = "Sign in — Hreemka";
const description = "Sign in to track your orders, revisit your history and manage your profile.";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
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
  component: AuthPage,
});

function safePath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const destination = safePath(search.redirect);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const handleForgotPassword = async () => {
  if (!email) {
    alert("Please enter your email address first.");
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Password reset link has been sent to your email.");
};

  useEffect(() => {
    if (window.location.pathname === "/reset-password") return;
    
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) void navigate({ to: destination, replace: true });
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: destination, replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [destination, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/account",
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          toast.success("Check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };
const google = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    toast.error(error.message);
    return;
  }
};

  return (
    <ShopShell
      title={mode === "signin" ? "Welcome back" : "Create your account"}
      subtitle="Your orders, history and preferences, kept safely in one place."
    >
      <div className="liquid-glass card-liquid mx-auto max-w-md p-8">
        {sent ? (
          <p className="text-center text-sm leading-relaxed text-muted-foreground">
            We've sent a confirmation link to <strong>{email}</strong>. Open it to finish creating
            your account.
          </p>
        ) : (
          <>
            <button type="button" onClick={google} className="btn-ghost-sacred w-full">
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3 text-[0.65rem] tracking-[0.24em] uppercase text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" ? (
                <input
                  className="glass-field"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={100}
                  required
                />
              ) : null}
              <input
                className="glass-field"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
              />
              <input
                className="glass-field"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              {mode === "signin" && (
               <button
              type="button"
              onClick={handleForgotPassword}
               className="mt-3 text-sm text-primary hover:underline"
             >
               Forgot password?
             </button>
               )}
              <button type="submit" disabled={busy} className="btn-sacred w-full disabled:opacity-60">
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              {mode === "signin" ? "New to Hreemka?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="text-primary underline-offset-4 hover:underline"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              >
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </div>
    </ShopShell>
  );
}
