import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Bookmark, Calendar, Target, User as UserIcon, Sparkles, LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthedLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/deadlines", label: "Deadlines", icon: Calendar },
  { to: "/plans", label: "Action Plans", icon: Target },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/profile", label: "Profile", icon: UserIcon },
] as const;

function AuthedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden lg:flex w-64 flex-col border-r border-border bg-sky-softer">
        <div className="px-6 py-5">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></div>
            Life Admin
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-card"}`}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">{user.email}</div>
          <button onClick={logout} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-card">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <header className="lg:hidden sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="h-3.5 w-3.5" /></div>
            Life Admin
          </Link>
          <button onClick={logout} className="text-sm text-muted-foreground">Sign out</button>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-2">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${active ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`}>
                {n.label}
              </Link>
            );
          })}
        </div>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
