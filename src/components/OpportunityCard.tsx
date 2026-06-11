import { Bookmark, BookmarkCheck, ExternalLink, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

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

export function OpportunityCard({
  opp, saved, onToggleSave,
}: { opp: Opp; saved: boolean; onToggleSave: (id: string) => void }) {
  const days = daysUntil(opp.deadline);
  const urgent = days <= 3;
  return (
    <div className="rounded-2xl bg-card p-5 border border-border/40 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[opp.category] ?? "bg-slate-100 text-slate-800"}`}>
            {opp.category}
          </span>
          <h3 className="mt-2 font-semibold text-foreground leading-tight">{opp.title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{opp.organization}</p>
        </div>
        <button
          onClick={() => onToggleSave(opp.id)}
          aria-label={saved ? "Unsave" : "Save"}
          className="text-primary hover:bg-accent rounded-lg p-1.5"
        >
          {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
        </button>
      </div>
      <p className="text-sm text-foreground/80 mt-3 line-clamp-3">{opp.description}</p>
      <div className="mt-4 flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className={`text-xs font-medium ${urgent ? "text-destructive" : "text-muted-foreground"}`}>
          {days < 0 ? "Closed" : days === 0 ? "Last day!" : `${days} day${days === 1 ? "" : "s"} left`}
        </span>
      </div>
      <a href={opp.apply_link} target="_blank" rel="noreferrer"
         className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
        Apply <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
