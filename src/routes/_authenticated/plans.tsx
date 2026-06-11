import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { GOAL_OPTIONS, generatePlan, type Task } from "@/lib/plan-templates";
import { Trash2, Plus, Pencil, X, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/plans")({
  head: () => ({ meta: [{ title: "Action Plans — Life Admin Agent" }] }),
  component: PlansPage,
});

type Plan = {
  id: string;
  goal: string;
  title: string;
  tasks: Task[];
  created_at: string;
};

function PlansPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [goal, setGoal] = useState(GOAL_OPTIONS[0].key);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function load() {
    const { data } = await supabase.from("action_plans").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
    setPlans((data ?? []).map((p) => ({ ...p, tasks: (p.tasks as unknown as Task[]) ?? [] })));
    setLoading(false);
  }

  useEffect(() => { load(); }, [user]);

  async function onGenerate() {
    setGenerating(true);
    const tpl = generatePlan(goal);
    if (!tpl) { setGenerating(false); return; }
    const { data, error } = await supabase.from("action_plans").insert({
      user_id: user!.id, goal: tpl.goal, title: tpl.title, tasks: tpl.tasks as any,
    }).select().single();
    setGenerating(false);
    if (error) return toast.error(error.message);
    if (data) {
      setPlans([{ ...data, tasks: data.tasks as unknown as Task[] }, ...plans]);
      toast.success(`Plan generated: ${tpl.title}`);
    }
  }

  async function updatePlan(id: string, patch: Partial<Plan>) {
    const next = plans.map((p) => p.id === id ? { ...p, ...patch } : p);
    setPlans(next);
    const updated = next.find((p) => p.id === id)!;
    const { error } = await supabase.from("action_plans").update({
      title: updated.title, tasks: updated.tasks as any,
    }).eq("id", id);
    if (error) toast.error(error.message);
  }

  async function deletePlan(id: string) {
    if (!confirm("Delete this plan?")) return;
    setPlans(plans.filter((p) => p.id !== id));
    const { error } = await supabase.from("action_plans").delete().eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Plan deleted");
  }

  if (loading) return <div className="text-muted-foreground">Loading plans…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Action Plan Generator</h1>
        <p className="text-muted-foreground mt-1">Pick a goal, get a week-by-week roadmap, check things off.</p>
      </div>

      <div className="rounded-2xl bg-card p-5 border border-border/40 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-foreground">Choose a goal</label>
          <select value={goal} onChange={(e) => setGoal(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            {GOAL_OPTIONS.map((g) => <option key={g.key} value={g.key}>{g.title}</option>)}
          </select>
        </div>
        <button onClick={onGenerate} disabled={generating}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60 hover:opacity-90">
          <Plus className="h-4 w-4" /> {generating ? "Generating…" : "Generate Plan"}
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-2xl bg-card p-10 border border-border/40 text-center text-muted-foreground">
          No plans yet. Generate your first one above.
        </div>
      ) : (
        <div className="space-y-5">
          {plans.map((p) => <PlanCard key={p.id} plan={p} onUpdate={updatePlan} onDelete={deletePlan} />)}
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan, onUpdate, onDelete }: { plan: Plan; onUpdate: (id: string, p: Partial<Plan>) => void; onDelete: (id: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(plan.title);
  const [newTask, setNewTask] = useState("");
  const [newWeek, setNewWeek] = useState(1);

  const completed = plan.tasks.filter((t) => t.completed).length;
  const total = plan.tasks.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  function toggleTask(id: string) {
    onUpdate(plan.id, { tasks: plan.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t) });
  }
  function removeTask(id: string) {
    onUpdate(plan.id, { tasks: plan.tasks.filter((t) => t.id !== id) });
  }
  function editTaskTitle(id: string, title: string) {
    onUpdate(plan.id, { tasks: plan.tasks.map((t) => t.id === id ? { ...t, title } : t) });
  }
  function addTask() {
    const v = newTask.trim();
    if (!v) return;
    const task: Task = { id: crypto.randomUUID(), week: newWeek, title: v, completed: false };
    onUpdate(plan.id, { tasks: [...plan.tasks, task] });
    setNewTask("");
  }

  const byWeek = plan.tasks.reduce<Record<number, Task[]>>((acc, t) => {
    (acc[t.week] ??= []).push(t); return acc;
  }, {});
  const weeks = Object.keys(byWeek).map(Number).sort((a, b) => a - b);

  return (
    <div className="rounded-2xl bg-card p-6 border border-border/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {editing ? (
            <div className="flex gap-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-base font-semibold" />
              <button onClick={() => { onUpdate(plan.id, { title }); setEditing(false); toast.success("Renamed"); }}
                className="rounded-lg bg-primary px-3 text-sm text-primary-foreground"><Check className="h-4 w-4" /></button>
              <button onClick={() => { setTitle(plan.title); setEditing(false); }} className="rounded-lg bg-card border px-3"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">{plan.title}</h3>
              <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-1">Goal: {plan.goal} · Created {new Date(plan.created_at).toLocaleDateString()}</div>
        </div>
        <button onClick={() => onDelete(plan.id)} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">{completed} of {total} tasks complete</span>
          <span className="font-semibold text-foreground">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-background overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {weeks.map((w) => (
          <div key={w}>
            <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Week {w}</div>
            <div className="space-y-1.5">
              {byWeek[w].map((t) => (
                <div key={t.id} className="flex items-center gap-3 group">
                  <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t.id)}
                    className="h-4 w-4 rounded border-input accent-[var(--primary)]" />
                  <input
                    value={t.title}
                    onChange={(e) => editTaskTitle(t.id, e.target.value)}
                    className={`flex-1 bg-transparent text-sm focus:outline-none ${t.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                  />
                  <button onClick={() => removeTask(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-2 border-t border-border pt-4">
        <select value={newWeek} onChange={(e) => setNewWeek(Number(e.target.value))}
          className="rounded-lg border border-input bg-background px-2 py-1.5 text-sm">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => <option key={w} value={w}>Week {w}</option>)}
        </select>
        <input value={newTask} onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTask())}
          placeholder="Add a new task…"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm" />
        <button onClick={addTask} className="rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Add</button>
      </div>
    </div>
  );
}
