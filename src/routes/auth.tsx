import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const searchSchema = z.object({ mode: z.enum(["signin", "signup", "forgot"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in — Life Admin Agent" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode = "signin" } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", college: "", branch: "", year: "1",
  });

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: form.fullName,
          college: form.college,
          branch: form.branch,
          year: form.year,
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created! Welcome.");
  }

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email, password: form.password,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
  }

  async function onForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password reset link sent — check your email.");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-card p-12">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></div>
          Life Admin Agent
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Track every opportunity that matters.</h2>
          <p className="mt-4 text-muted-foreground max-w-md">
            Hackathons, internships, scholarships, workshops — and the deadlines that come with them, all in one student dashboard.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">© Life Admin Agent</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset password" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup" ? "Start tracking opportunities in seconds." : mode === "forgot" ? "We'll email you a reset link." : "Sign in to your dashboard."}
          </p>

          <form onSubmit={mode === "signup" ? onSignUp : mode === "forgot" ? onForgot : onSignIn} className="mt-6 space-y-3">
            {mode === "signup" && (
              <>
                <Field label="Full Name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} required />
                <Field label="College" value={form.college} onChange={(v) => setForm({ ...form, college: v })} required />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Branch" value={form.branch} onChange={(v) => setForm({ ...form, branch: v })} required />
                  <div>
                    <label className="text-sm font-medium text-foreground">Year</label>
                    <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      <option value="1">1st</option><option value="2">2nd</option><option value="3">3rd</option><option value="4">4th</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            {mode !== "forgot" && (
              <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required minLength={6} />
            )}
            <button disabled={loading} className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60 hover:opacity-90">
              {loading ? "Please wait…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            {mode !== "signup" ? (
              <Link to="/auth" search={{ mode: "signup" }} className="text-primary hover:underline">Create account</Link>
            ) : (
              <Link to="/auth" search={{ mode: "signin" }} className="text-primary hover:underline">Have an account? Sign in</Link>
            )}
            {mode === "signin" && (
              <Link to="/auth" search={{ mode: "forgot" }} className="text-muted-foreground hover:underline">Forgot password?</Link>
            )}
            {mode === "forgot" && (
              <Link to="/auth" search={{ mode: "signin" }} className="text-muted-foreground hover:underline">Back to sign in</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field(props: { label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean; minLength?: number }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{props.label}</label>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        required={props.required}
        minLength={props.minLength}
        className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
    </div>
  );
}
