import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { OpportunityCard, type Opp } from "@/components/OpportunityCard";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({ meta: [{ title: "Saved Opportunities — Life Admin Agent" }] }),
  component: SavedPage,
});

const CATEGORIES = ["all", "hackathon", "internship", "scholarship", "workshop"] as const;

function SavedPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Opp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("all");

  async function load() {
    const { data } = await supabase
      .from("saved_opportunities")
      .select("opportunity:opportunities(*)")
      .eq("user_id", user!.id);
    setItems((data ?? []).map((r: any) => r.opportunity).filter(Boolean));
    setLoading(false);
  }

  useEffect(() => { load(); }, [user]);

  const filtered = useMemo(() => items.filter((o) => {
    if (cat !== "all" && o.category !== cat) return false;
    if (search && !`${o.title} ${o.organization}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [items, cat, search]);

  async function remove(id: string) {
    setItems(items.filter((i) => i.id !== id));
    const { error } = await supabase.from("saved_opportunities").delete().eq("user_id", user!.id).eq("opportunity_id", id);
    if (error) { toast.error(error.message); load(); }
    else toast.success("Removed");
  }

  if (loading) return <div className="text-muted-foreground">Loading saved…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Saved Opportunities</h1>
        <p className="text-muted-foreground mt-1">Your bookmarked applications, all in one place.</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-card p-10 border border-border/40 text-center">
          <p className="text-muted-foreground">You haven't saved any opportunities yet.</p>
          <Link to="/dashboard" className="mt-4 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Browse Dashboard</Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search saved…"
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm w-56" />
            <div className="flex gap-2 overflow-x-auto">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCat(c)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm capitalize ${cat === c ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-accent"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-card p-6 border border-border/40 text-sm text-muted-foreground">No saved opportunities match those filters.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((o) => (
                <OpportunityCard key={o.id} opp={o} saved={true} onToggleSave={remove} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
