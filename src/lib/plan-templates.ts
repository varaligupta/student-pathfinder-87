export type Task = { id: string; week: number; title: string; completed: boolean };

const TEMPLATES: Record<string, { title: string; tasks: { week: number; title: string }[] }> = {
  "win-hackathon": {
    title: "Win a Hackathon",
    tasks: [
      { week: 1, title: "Build a team of 3-4 complementary members" },
      { week: 1, title: "Pick a hackathon and read the rules end-to-end" },
      { week: 2, title: "Research the problem space and validate idea" },
      { week: 2, title: "Sketch wireframes and define MVP scope" },
      { week: 3, title: "Build the MVP (frontend + backend)" },
      { week: 3, title: "Integrate AI / API features" },
      { week: 4, title: "Polish UI and record a demo video" },
      { week: 4, title: "Prepare a 5-slide pitch deck" },
      { week: 5, title: "Practice pitch with peers — get feedback" },
      { week: 5, title: "Submit before deadline and present confidently" },
    ],
  },
  "get-internship": {
    title: "Get an Internship",
    tasks: [
      { week: 1, title: "Update resume with quantified achievements" },
      { week: 1, title: "Build a portfolio site with 2-3 projects" },
      { week: 2, title: "Optimize LinkedIn — headline, about, projects" },
      { week: 2, title: "Shortlist 20 companies that hire interns" },
      { week: 3, title: "Apply to all 20 with tailored cover notes" },
      { week: 3, title: "Practice DSA — 5 problems per day" },
      { week: 4, title: "Mock interviews on Pramp or with friends" },
      { week: 4, title: "Cold email 10 hiring managers" },
      { week: 5, title: "Convert interview to offer — negotiate stipend" },
    ],
  },
  "secure-scholarship": {
    title: "Secure a Scholarship",
    tasks: [
      { week: 1, title: "List 10 scholarships you qualify for" },
      { week: 1, title: "Gather transcripts, ID, income proofs" },
      { week: 2, title: "Draft your statement of purpose" },
      { week: 2, title: "Request 2 letters of recommendation" },
      { week: 3, title: "Polish essays — peer review each one" },
      { week: 3, title: "Submit applications well before deadlines" },
      { week: 4, title: "Prepare for the interview round" },
      { week: 4, title: "Send thank-you notes after interviews" },
    ],
  },
  "learn-ai": {
    title: "Learn AI",
    tasks: [
      { week: 1, title: "Python refresher — NumPy, Pandas basics" },
      { week: 1, title: "Watch 3Blue1Brown neural networks series" },
      { week: 2, title: "Complete Andrew Ng ML course (week 1-3)" },
      { week: 2, title: "Build a linear regression model from scratch" },
      { week: 3, title: "Learn PyTorch — train an MNIST classifier" },
      { week: 3, title: "Read 2 foundational papers (Attention is All You Need)" },
      { week: 4, title: "Fine-tune a small LLM on your own data" },
      { week: 4, title: "Build and ship a Gen-AI side project" },
      { week: 5, title: "Write a blog post about what you built" },
    ],
  },
};

export const GOAL_OPTIONS = Object.entries(TEMPLATES).map(([k, v]) => ({ key: k, title: v.title }));

export function generatePlan(goalKey: string): { title: string; goal: string; tasks: Task[] } | null {
  const t = TEMPLATES[goalKey];
  if (!t) return null;
  return {
    title: t.title,
    goal: goalKey,
    tasks: t.tasks.map((task, i) => ({
      id: crypto.randomUUID(),
      week: task.week,
      title: task.title,
      completed: false,
    })),
  };
}
