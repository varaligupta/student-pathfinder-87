import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Calendar, Bookmark, Target, Bell, Rocket } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Life Admin Agent — Never Miss an Opportunity Again" },
      { name: "description", content: "All your internships, hackathons, scholarships and deadlines in one smart dashboard for college students." },
      { property: "og:title", content: "Life Admin Agent" },
      { property: "og:description", content: "The student productivity platform to track every opportunity that matters." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></div>
            Life Admin Agent
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
            <Link to="/auth" search={{ mode: "signup" }} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:py-28 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-xs font-medium text-accent-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Built for college students
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
          Never Miss an<br />Opportunity Again
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          Life Admin Agent helps students discover internships, scholarships, hackathons,
          workshops, and important deadlines from one smart dashboard.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/auth" search={{ mode: "signup" }} className="rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:opacity-90">
            Get Started
          </Link>
          <Link to="/auth" className="rounded-lg bg-card px-6 py-3 text-base font-medium text-foreground hover:bg-accent">
            Explore Opportunities
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Rocket, title: "Smart Dashboard", desc: "Browse hackathons, internships, scholarships and workshops in one place." },
            { icon: Sparkles, title: "AI Recommendations", desc: "Get opportunities matched to your interests, skills, and career goals." },
            { icon: Calendar, title: "Deadline Tracker", desc: "Countdown timers and a calendar view so urgent dates never slip." },
            { icon: Bell, title: "Smart Reminders", desc: "Notifications at 7 days, 3 days, and the last day to apply." },
            { icon: Target, title: "Action Plan Generator", desc: "Turn a goal into a week-by-week plan you can edit and check off." },
            { icon: Bookmark, title: "Saved Library", desc: "Bookmark opportunities, search and filter your shortlist anytime." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl bg-card p-6 border border-border/40">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><f.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Life Admin Agent. Built for students.
      </footer>
    </div>
  );
}
