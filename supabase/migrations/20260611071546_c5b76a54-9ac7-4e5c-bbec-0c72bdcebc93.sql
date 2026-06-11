
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

INSERT INTO public.opportunities (title, organization, category, deadline, description, apply_link, tags) VALUES
('Smart India Hackathon 2026', 'Government of India', 'hackathon', CURRENT_DATE + 5, 'India''s biggest nationwide hackathon. Solve real problems posed by ministries and win up to ₹1L.', 'https://sih.gov.in', ARRAY['ai','web','data']),
('Google AI Challenge', 'Google', 'hackathon', CURRENT_DATE + 12, 'Build innovative AI solutions using Gemini. Top teams win cloud credits and mentorship.', 'https://ai.google', ARRAY['ai','data']),
('HackMIT 2026', 'MIT', 'hackathon', CURRENT_DATE + 30, '36-hour international hackathon at MIT. Travel reimbursements available.', 'https://hackmit.org', ARRAY['web','ai']),
('React Frontend Hackathon', 'Vercel', 'hackathon', CURRENT_DATE + 18, 'Build a stunning frontend in React. Best UI wins a Macbook Pro.', 'https://vercel.com', ARRAY['web']),
('Google Capture The Flag', 'Google', 'hackathon', CURRENT_DATE + 22, 'World-class cybersecurity CTF. Beginner and advanced tracks.', 'https://capturetheflag.withgoogle.com', ARRAY['cybersecurity']),
('Google Summer of Code', 'Google', 'internship', CURRENT_DATE + 40, 'Paid 12-week open source internship with a stipend up to $6,600.', 'https://summerofcode.withgoogle.com', ARRAY['web','ai','data']),
('Microsoft Engage Internship', 'Microsoft', 'internship', CURRENT_DATE + 25, 'Mentorship-based internship for second/third-year students. Build production apps.', 'https://microsoft.com/engage', ARRAY['web']),
('AI Research Internship', 'IIT Delhi', 'internship', CURRENT_DATE + 15, 'Work alongside professors on cutting-edge ML research. Stipend + accommodation.', 'https://iitd.ac.in', ARRAY['ai','data']),
('Cyber Security Internship', 'Palo Alto Networks', 'internship', CURRENT_DATE + 20, 'Remote internship in threat intelligence and security ops.', 'https://paloaltonetworks.com', ARRAY['cybersecurity']),
('Frontend Developer Internship', 'Razorpay', 'internship', CURRENT_DATE + 9, 'Build React + TypeScript fintech UIs. Remote-first, ₹40k stipend.', 'https://razorpay.com', ARRAY['web']),
('Reliance Foundation Scholarship', 'Reliance Foundation', 'scholarship', CURRENT_DATE + 2, 'Up to ₹2L per year for undergraduates from any background.', 'https://scholarships.reliancefoundation.org', ARRAY['ai','web','data','cybersecurity']),
('Inspire Scholarship', 'DST India', 'scholarship', CURRENT_DATE + 60, '₹80,000/yr for students pursuing science streams.', 'https://online-inspire.gov.in', ARRAY['data','ai']),
('Google Generation Scholarship', 'Google', 'scholarship', CURRENT_DATE + 35, '$1,000 award for CS students from underrepresented groups in tech.', 'https://buildyourfuture.withgoogle.com', ARRAY['web','ai']),
('IIT Delhi AI Workshop', 'IIT Delhi', 'workshop', CURRENT_DATE + 1, 'Hands-on 3-day workshop covering deep learning fundamentals.', 'https://iitd.ac.in', ARRAY['ai']),
('Web3 Bootcamp', 'Polygon', 'workshop', CURRENT_DATE + 14, 'Free 2-week intensive on building dApps. Certificate on completion.', 'https://polygon.technology', ARRAY['web']),
('Content Creation Masterclass', 'Mr Beast Studios', 'workshop', CURRENT_DATE + 7, 'Behind-the-scenes class on YouTube growth and editing.', 'https://example.com', ARRAY['content']),
('Data Science with Python', 'Coursera', 'workshop', CURRENT_DATE + 4, 'Live cohort course taught by IBM data scientists.', 'https://coursera.org', ARRAY['data','ai']);
