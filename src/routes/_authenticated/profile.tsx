import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Life Admin Agent" }] }),
  component: ProfilePage,
});

const SUGGESTED_INTERESTS = ["AI", "Web Development", "Cyber Security", "Data Science", "Content Creation"];
const TAG_MAP: Record<string, string> = {
  "AI": "ai", "Web Development": "web", "Cyber Security": "cybersecurity",
  "Data Science": "data", "Content Creation": "content",
};

function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    full_name: "", college: "", branch: "", year: "First Year", career_goals: "",
    cgpa: "", degree_type: "B.Tech", location: "India",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (data) {
        const yearMap: Record<string, string> = { "1": "First Year", "2": "Second Year", "3": "Third Year", "4": "Fourth Year" };
        setForm({
          full_name: data.full_name ?? "",
          college: data.college ?? "",
          branch: data.branch ?? "",
          year: yearMap[data.year ?? ""] ?? data.year ?? "First Year",
          career_goals: data.career_goals ?? "",
          cgpa: data.cgpa != null ? String(data.cgpa) : "",
          degree_type: data.degree_type ?? "B.Tech",
          location: data.location ?? "India",
        });
        setSkills(data.skills ?? []);
        setInterests(data.interests ?? []);
      }
      setLoading(false);
    })();
  }, [user]);

  async function save() {
    setSaving(true);
    const interestTags = interests.map((i) => TAG_MAP[i] ?? i.toLowerCase());
    const cgpaNum = form.cgpa.trim() ? Number(form.cgpa) : null;
    if (cgpaNum != null && (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10)) {
      setSaving(false);
      return toast.error("CGPA must be a number between 0 and 10");
    }
    const { error } = await supabase.from("profiles").upsert({
      id: user!.id, email: user!.email,
      full_name: form.full_name, college: form.college, branch: form.branch,
      year: form.year, career_goals: form.career_goals,
      cgpa: cgpaNum, degree_type: form.degree_type, location: form.location,
      skills, interests: interestTags,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved!");
  }

  function toggleInterest(label: string) {
    const tag = TAG_MAP[label] ?? label.toLowerCase();
    if (interests.includes(tag) || interests.includes(label)) {
      setInterests(interests.filter((i) => i !== tag && i !== label));
    } else {
      setInterests([...interests, tag]);
    }
  }
  function isSelected(label: string) {
    const tag = TAG_MAP[label] ?? label.toLowerCase();
    return interests.includes(tag) || interests.includes(label);
  }

  function addSkill() {
    const v = skillInput.trim();
    if (v && !skills.includes(v)) setSkills([...skills, v]);
    setSkillInput("");
  }

  if (loading) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>
        <p className="text-muted-foreground mt-1">Help us recommend the right opportunities for you.</p>
      </div>

      <div className="rounded-2xl bg-card p-6 border border-border/40 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Full Name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
          <Input label="College" value={form.college} onChange={(v) => setForm({ ...form, college: v })} />
          <Input label="Branch" value={form.branch} onChange={(v) => setForm({ ...form, branch: v })} />
          <div>
            <label className="text-sm font-medium text-foreground">Year</label>
            <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
              <option value="1">1st</option><option value="2">2nd</option><option value="3">3rd</option><option value="4">4th</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Career Goals</label>
          <textarea value={form.career_goals} onChange={(e) => setForm({ ...form, career_goals: e.target.value })}
            rows={3} placeholder="e.g. Land an AI research internship and publish a paper"
            className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Interests (drives recommendations)</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUGGESTED_INTERESTS.map((i) => (
              <button key={i} onClick={() => toggleInterest(i)}
                className={`rounded-full px-3 py-1.5 text-sm transition ${isSelected(i) ? "bg-primary text-primary-foreground" : "bg-background border border-border text-foreground hover:bg-accent"}`}>
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Skills</label>
          <div className="mt-2 flex gap-2">
            <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              placeholder="Add a skill and press Enter"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <button onClick={addSkill} className="rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Add</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">
                {s}
                <button onClick={() => setSkills(skills.filter((x) => x !== s))} className="hover:text-destructive"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>

        <button onClick={save} disabled={saving}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60 hover:opacity-90">
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
    </div>
  );
}
