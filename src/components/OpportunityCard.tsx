import { Bookmark, BookmarkCheck, ExternalLink, Clock, Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { evaluateEligibility, isValidApplyUrl, type EligibilityResult, type Profile } from "@/lib/eligibility";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useState } from "react";

export type Opp = Tables<"opportunities">;

const CATEGORY_COLORS: Record<string, string> = {
  hackathon: "bg-purple-100 text-purple-800",
  internship: "bg-emerald-100 text-emerald-800",
  scholarship: "bg-amber-100 text-amber-800",
  workshop: "bg-rose-100 text-rose-800",
};

export function daysUntil(date: string) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

function EligibilityBadge({ result }: { result: EligibilityResult }) {
  const cfg = {
    eligible: { label: "Eligible", cls: "bg-emerald-100 text-emerald-800", Icon: CheckCircle2 },
    partial: { label: "Partially Eligible", cls: "bg-amber-100 text-amber-800", Icon: AlertTriangle },
    not_eligible: { label: "Not Eligible", cls: "bg-red-100 text-red-800", Icon: XCircle },
  }[result.status];
  const Icon = cfg.Icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.cls}`}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
}

export function OpportunityCard({
  opp, saved, onToggleSave, profile,
}: { opp: Opp; saved: boolean; onToggleSave: (id: string) => void; profile: Profile | null }) {
  const { user } = useAuth();
  const [showWhy, setShowWhy] = useState(false);
  const days = daysUntil(opp.deadline);
  const urgent = days <= 3;
  const elig = evaluateEligibility(opp, profile);
  const applyUrl = isValidApplyUrl(opp.apply_link) ? opp.apply_link : null;
  const detailsUrl = isValidApplyUrl(opp.details_url) ? opp.details_url : applyUrl;

  async function trackVisit() {
    if (!user) return;
    const { data: existing } = await supabase
      .from("opportunity_visits")
      .select("id, visit_count")
      .eq("user_id", user.id).eq("opportunity_id", opp.id).maybeSingle();
    if (existing) {
      await supabase.from("opportunity_visits")
        .update({ last_visited_at: new Date().toISOString(), visit_count: existing.visit_count + 1 })
        .eq("id", existing.id);
    } else {
      await supabase.from("opportunity_visits")
        .insert({ user_id: user.id, opportunity_id: opp.id });
    }
  }

  return (
    <div className="rounded-2xl bg-card p-5 border border-border/40 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[opp.category] ?? "bg-slate-100 text-slate-800"}`}>
              {opp.category}
            </span>
            <EligibilityBadge result={elig} />
          </div>
          <h3 className="mt-2 font-semibold text-foreground leading-tight">{opp.title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{opp.organization}</p>
        </div>
        <button
          onClick={() => onToggleSave(opp.id)}
          aria-label={saved ? "Unsave" : "Save"}
          className="text-primary hover:bg-accent rounded-lg p-1.5 shrink-0"
        >
          {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
        </button>
      </div>

      <p className="text-sm text-foreground/80 mt-3 line-clamp-3">{opp.description}</p>

      {elig.checks.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowWhy((v) => !v)}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Info className="h-3 w-3" /> {showWhy ? "Hide" : "Why?"} ({elig.checks.filter((c) => c.passed).length}/{elig.checks.length} checks passed)
          </button>
          {showWhy && (
            <ul className="mt-2 space-y-1 text-xs">
              {elig.checks.map((c) => (
                <li key={c.field} className={`flex items-start gap-1.5 ${c.passed ? "text-emerald-700" : "text-red-700"}`}>
                  {c.passed ? <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" /> : <XCircle className="h-3 w-3 mt-0.5 shrink-0" />}
                  <span><strong>{c.field}:</strong> {c.reason}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className={`text-xs font-medium ${urgent ? "text-destructive" : "text-muted-foreground"}`}>
          {days < 0 ? "Closed" : days === 0 ? "Last day!" : `${days} day${days === 1 ? "" : "s"} left`}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {applyUrl ? (
          <a href={applyUrl} target="_blank" rel="noreferrer" onClick={trackVisit}
             className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Apply Now <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="inline-flex items-center justify-center rounded-lg bg-muted py-2 text-xs text-muted-foreground text-center px-2">
            Application link not available yet
          </span>
        )}
        {detailsUrl ? (
          <a href={detailsUrl} target="_blank" rel="noreferrer" onClick={trackVisit}
             className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-input bg-background py-2 text-sm font-medium text-foreground hover:bg-accent">
            View Details <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="inline-flex items-center justify-center rounded-lg border border-input py-2 text-xs text-muted-foreground">
            No details page
          </span>
        )}
      </div>
    </div>
  );
}
