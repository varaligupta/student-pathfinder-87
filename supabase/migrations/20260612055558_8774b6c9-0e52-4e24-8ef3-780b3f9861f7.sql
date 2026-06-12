
-- 1. Extend opportunities with eligibility + link fields
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS eligible_years text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS eligible_branches text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS min_cgpa numeric(3,2),
  ADD COLUMN IF NOT EXISTS degree_types text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS location_restrictions text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS details_url text,
  ADD COLUMN IF NOT EXISTS registration_url text;

-- 2. Extend profiles with eligibility-relevant fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cgpa numeric(3,2),
  ADD COLUMN IF NOT EXISTS degree_type text,
  ADD COLUMN IF NOT EXISTS location text;

-- 3. Track visited opportunities
CREATE TABLE IF NOT EXISTS public.opportunity_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  last_visited_at timestamptz NOT NULL DEFAULT now(),
  visit_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, opportunity_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunity_visits TO authenticated;
GRANT ALL ON public.opportunity_visits TO service_role;

ALTER TABLE public.opportunity_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own visits"
  ON public.opportunity_visits
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Re-seed opportunities with realistic data
DELETE FROM public.opportunities;

INSERT INTO public.opportunities
  (title, organization, category, description, deadline,
   apply_link, details_url, registration_url,
   tags, eligible_years, eligible_branches, min_cgpa, degree_types, location_restrictions)
VALUES
  ('Reliance Foundation Undergraduate Scholarship', 'Reliance Foundation', 'scholarship',
   'Merit-cum-means scholarship of up to ₹2,00,000 for first-year undergraduate students across India.',
   '2026-10-15',
   'https://www.reliancefoundation.org/scholarships/undergraduate',
   'https://www.reliancefoundation.org/scholarships/undergraduate',
   NULL,
   ARRAY['scholarship','merit','undergraduate'],
   ARRAY['First Year'],
   ARRAY['Any'],
   7.00,
   ARRAY['B.Tech','B.Sc','B.A','B.Com','BBA'],
   ARRAY['India']),

  ('Google Summer of Code 2026', 'Google Open Source', 'internship',
   'Global program where students contribute to open source projects with stipend and mentorship.',
   '2026-04-09',
   'https://summerofcode.withgoogle.com/programs/2026',
   'https://summerofcode.withgoogle.com/',
   'https://summerofcode.withgoogle.com/programs/2026/register',
   ARRAY['open source','web dev','ai','programming'],
   ARRAY['First Year','Second Year','Third Year','Fourth Year'],
   ARRAY['Computer Science','Information Technology','Electronics','Any'],
   NULL,
   ARRAY['B.Tech','B.Sc','M.Tech','M.Sc'],
   ARRAY['Any']),

  ('Microsoft Engage Mentorship 2026', 'Microsoft India', 'internship',
   'Mentorship program for pre-final year engineering students with project-based learning and PPO opportunities.',
   '2026-07-20',
   'https://careers.microsoft.com/students/engage/apply',
   'https://careers.microsoft.com/students/engage',
   NULL,
   ARRAY['web dev','ai','programming','mentorship'],
   ARRAY['Third Year'],
   ARRAY['Computer Science','Information Technology','Electronics'],
   7.50,
   ARRAY['B.Tech','B.E'],
   ARRAY['India']),

  ('Smart India Hackathon 2026', 'Ministry of Education, AICTE', 'hackathon',
   'National-level hackathon solving real problems posed by ministries and industry. Cash prizes up to ₹1L.',
   '2026-08-30',
   'https://sih.gov.in/sih2026Registration',
   'https://sih.gov.in/',
   'https://sih.gov.in/sih2026Registration',
   ARRAY['hackathon','ai','web dev','iot','programming'],
   ARRAY['First Year','Second Year','Third Year','Fourth Year'],
   ARRAY['Any'],
   NULL,
   ARRAY['B.Tech','B.E','B.Sc','M.Tech'],
   ARRAY['India']),

  ('ETH Global Online Hackathon', 'ETHGlobal', 'hackathon',
   'Global virtual hackathon for Web3/blockchain projects with $500K+ prize pool.',
   '2026-09-12',
   'https://ethglobal.com/events/online2026/apply',
   'https://ethglobal.com/events/online2026',
   'https://ethglobal.com/events/online2026/register',
   ARRAY['blockchain','web3','programming','hackathon'],
   ARRAY['Second Year','Third Year','Fourth Year'],
   ARRAY['Any'],
   NULL,
   ARRAY['B.Tech','B.Sc','M.Tech','M.Sc'],
   ARRAY['Any']),

  ('AWS AI/ML Workshop Series', 'Amazon Web Services', 'workshop',
   'Hands-on virtual workshop series on SageMaker, Bedrock, and generative AI for students.',
   '2026-07-05',
   'https://aws.amazon.com/events/aiml-student-workshop/register',
   'https://aws.amazon.com/events/aiml-student-workshop',
   'https://aws.amazon.com/events/aiml-student-workshop/register',
   ARRAY['ai','machine learning','cloud','workshop'],
   ARRAY['Second Year','Third Year','Fourth Year'],
   ARRAY['Computer Science','Information Technology','Electronics','Any'],
   NULL,
   ARRAY['B.Tech','B.Sc','M.Tech','M.Sc'],
   ARRAY['Any']),

  ('Adobe India Women-in-Technology Scholarship', 'Adobe India', 'scholarship',
   '₹2,50,000/year scholarship + summer internship for women in CS/IT pursuing undergraduate degree.',
   '2026-06-30',
   'https://research.adobe.com/scholarship/india-wit/apply',
   'https://research.adobe.com/scholarship/india-wit/',
   NULL,
   ARRAY['scholarship','women in tech','programming'],
   ARRAY['Second Year','Third Year'],
   ARRAY['Computer Science','Information Technology'],
   8.00,
   ARRAY['B.Tech','B.E'],
   ARRAY['India']),

  ('Goldman Sachs Engineering Campus Hiring', 'Goldman Sachs', 'internship',
   'Summer analyst internship in engineering for final-year students based in Bengaluru/Hyderabad.',
   '2026-09-25',
   'https://www.goldmansachs.com/careers/students/programs/india/summer-analyst-engineering',
   'https://www.goldmansachs.com/careers/students/programs/india/summer-analyst-engineering',
   NULL,
   ARRAY['finance','programming','web dev'],
   ARRAY['Fourth Year'],
   ARRAY['Computer Science','Information Technology','Electronics','Mathematics'],
   8.00,
   ARRAY['B.Tech','B.E','M.Tech'],
   ARRAY['India']);
