import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { daysUntil, type Opp } from "@/components/OpportunityCard";
import { Bell, Calendar } from "lucide-react";

export const Route = createFileRoute("/_authenticated/deadlines")({
  head: () => ({ meta: [{ title: "Deadlines — Life Admin Agent" }] }),
  component: DeadlinesPage,
});

function DeadlinesPage() {
  const [opps, setOpps] = useState<Opp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("opportunities").select("*").order("deadline");
      setOpps(data ?? []);
      setLoading(false);
    })();
  }, []);

  const grouped = useMemo(() => {
    const buckets = { today: [] as Opp[], week: [] as Opp[], month: [] as Opp[], later: [] as Opp[] };
    for (const o of opps) {
      const d = daysUntil(o.deadline);
      if (d < 0) continue;
      if (d <= 1) buckets.today.push(o);
      else if (d <= 7) buckets.week.push(o);
      else if (d <= 30) buckets.month.push(o);
      else buckets.later.push(o);
    }
    return buckets;
  }, [opps]);

  const reminders = useMemo(() => {
    return opps
      .filter((o) => [0, 1, 3, 7].includes(daysUntil(o.deadline)))
      .map((o) => {
        const d = daysUntil(o.deadline);
        const msg = d === 0 ? "Last day to apply!" : d === 1 ? "Deadline tomorrow" : `Deadline in ${d} days`;
        return { ...o, msg, urgent: d <= 1 };
      });
  }, [opps]);

  if (loading) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Deadline Tracker</h1>
        <p className="text-muted-foreground mt-1">Don't let an opportunity slip away.</p>
      </div>

      {reminders.length > 0 && (
        <div className="rounded-2xl bg-card border border-border/40 p-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Smart Reminders</h2>
          <div className="mt-4 space-y-2">
            {reminders.map((r) => (
              <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg ${r.urgent ? "bg-destructive/10" : "bg-background"}`}>
                <div>
                  <div className="font-medium text-foreground text-sm">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{r.organization}</div>
                </div>
                <span className={`text-xs font-semibold ${r.urgent ? "text-destructive" : "text-foreground"}`}>{r.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {[
        { key: "today", label: "Today & Tomorrow", items: grouped.today },
        { key: "week", label: "This Week", items: grouped.week },
        { key: "month", label: "This Month", items: grouped.month },
        { key: "later", label: "Later", items: grouped.later },
      ].map((g) => g.items.length > 0 && (
        <section key={g.key}>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> {g.label}
          </h2>
          <div className="rounded-2xl bg-card border border-border/40 divide-y divide-border">
            {g.items.map((o) => {
              const d = daysUntil(o.deadline);
              return (
                <div key={o.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">{o.title}</div>
                    <div className="text-xs text-muted-foreground capitalize">{o.organization} · {o.category}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${d <= 3 ? "text-destructive" : "text-foreground"}`}>
                      {d === 0 ? "Today" : d === 1 ? "Tomorrow" : `${d} days`}
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(o.deadline).toLocaleDateString()}</div>
                  </div>
                  <a href={o.apply_link} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary hover:underline">Apply</a>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
