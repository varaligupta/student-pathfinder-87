import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { OpportunityCard, daysUntil, type Opp } from "@/components/OpportunityCard";
import type { Tables } from "@/integrations/supabase/types";
import { evaluateEligibility } from "@/lib/eligibility";
import { Sparkles, TrendingUp, Calendar, Bell } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Life Admin Agent" }] }),
  component: Dashboard,
});

const CATEGORIES = ["all", "hackathon", "internship", "scholarship", "workshop"] as const;
const ELIG_FILTERS = ["all", "eligible", "partial", "not_eligible"] as const;

function Dashboard() {
  const { user } = useAuth();
  const [opps, setOpps] = useState<Opp[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("all");
  const [eligFilter, setEligFilter] = useState<(typeof ELIG_FILTERS)[number]>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: o }, { data: s }, { data: p }] = await Promise.all([
        supabase.from("opportunities").select("*").order("deadline"),
        supabase.from("saved_opportunities").select("opportunity_id").eq("user_id", user!.id),
        supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
      ]);
      setOpps(o ?? []);
      setSavedIds(new Set((s ?? []).map((x) => x.opportunity_id)));
      setProfile(p ?? null);
      setLoading(false);
    })();
  }, [user]);

  // Evaluate eligibility once per opp
  const enriched = useMemo(
    () => opps.map((o) => ({ o, elig: evaluateEligibility(o, profile) })),
    [opps, profile],
  );

  const filtered = useMemo(() => {
    return enriched.filter(({ o, elig }) => {
      if (cat !== "all" && o.category !== cat) return false;
      if (eligFilter !== "all" && elig.status !== eligFilter) return false;
      if (search && !`${o.title} ${o.organization}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [enriched, cat, eligFilter, search]);

  // Recommendations: eligibility-FIRST. Interests only sort within eligible pool.
  const recommendations = useMemo(() => {
    const interests = (profile?.interests ?? []).map((x) => x.toLowerCase());
    return enriched
      .filter(({ elig, o }) => elig.status === "eligible" && daysUntil(o.deadline) >= 0)
      .map(({ o, elig }) => ({
        o,
        elig,
        interestScore: interests.length
          ? (o.tags ?? []).filter((t) => interests.includes(t.toLowerCase())).length
          : 0,
      }))
      .sort((a, b) => b.interestScore - a.interestScore || daysUntil(a.o.deadline) - daysUntil(b.o.deadline))
      .slice(0, 6);
  }, [enriched, profile]);

  const upcoming = useMemo(
    () => enriched.filter(({ o }) => daysUntil(o.deadline) >= 0).slice(0, 4),
    [enriched],
  );

  async function toggleSave(id: string) {
    const isSaved = savedIds.has(id);
    const next = new Set(savedIds);
    if (isSaved) {
      next.delete(id);
      setSavedIds(next);
      const { error } = await supabase.from("saved_opportunities").delete().eq("user_id", user!.id).eq("opportunity_id", id);
      if (error) { setSavedIds(savedIds); toast.error(error.message); }
      else toast.success("Removed from saved");
    } else {
      next.add(id);
      setSavedIds(next);
      const { error } = await supabase.from("saved_opportunities").insert({ user_id: user!.id, opportunity_id: id });
      if (error) { setSavedIds(savedIds); toast.error(error.message); }
      else toast.success("Saved!");
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading opportunities…</div>;

  const eligibleCount = enriched.filter((e) => e.elig.status === "eligible").length;
  const stats = [
    { label: "Eligible For You", value: eligibleCount, icon: Sparkles },
    { label: "Saved", value: savedIds.size, icon: TrendingUp },
    { label: "Upcoming (7 days)", value: enriched.filter(({ o }) => daysUntil(o.deadline) >= 0 && daysUntil(o.deadline) <= 7).length, icon: Calendar },
    { label: "Urgent (≤ 3 days)", value: enriched.filter(({ o }) => daysUntil(o.deadline) >= 0 && daysUntil(o.deadline) <= 3).length, icon: Bell },
  ];

  const profileIncomplete = !profile?.year || !profile?.branch;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Hi {profile?.full_name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">Here's what's happening on your radar.</p>
      </div>

      {profileIncomplete && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
          Complete your <Link to="/profile" className="font-semibold underline">profile</Link> (year, branch, CGPA, degree, location) to unlock accurate eligibility-based recommendations.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card p-5 border border-border/40">
            <s.icon className="h-5 w-5 text-primary" />
            <div className="mt-3 text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Recommended For You</h2>
          <Link to="/profile" className="text-sm text-primary hover:underline">Edit profile →</Link>
        </div>
        {recommendations.length === 0 ? (
          <div className="rounded-2xl bg-card p-6 border border-border/40 text-sm text-muted-foreground">
            No opportunities currently match your eligibility. Update your <Link to="/profile" className="text-primary hover:underline">profile</Link> or check back soon.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map(({ o }) => (
              <OpportunityCard key={o.id} opp={o} saved={savedIds.has(o.id)} onToggleSave={toggleSave} profile={profile} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">⏰ Upcoming Deadlines</h2>
          <div className="rounded-2xl bg-card border border-border/40 divide-y divide-border">
            {upcoming.map(({ o }) => {
              const days = daysUntil(o.deadline);
              return (
                <div key={o.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium text-foreground truncate">{o.title}</div>
                    <div className="text-xs text-muted-foreground">{o.organization} · {o.category}</div>
                  </div>
                  <div className={`text-sm font-semibold ${days <= 3 ? "text-destructive" : "text-foreground"}`}>
                    {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* All opportunities */}
      <section>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-foreground mr-auto">All Opportunities</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm w-44"
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm capitalize ${cat === c ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-accent"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {ELIG_FILTERS.map((e) => (
            <button key={e} onClick={() => setEligFilter(e)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs capitalize ${eligFilter === e ? "bg-foreground text-background" : "bg-background border border-border text-muted-foreground hover:bg-accent"}`}>
              {e.replace("_", " ")}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-card p-6 border border-border/40 text-sm text-muted-foreground">No opportunities match your filters.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(({ o }) => (
              <OpportunityCard key={o.id} opp={o} saved={savedIds.has(o.id)} onToggleSave={toggleSave} profile={profile} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
