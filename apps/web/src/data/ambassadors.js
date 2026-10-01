// AIYatra Student Ambassador Program — content source of truth.
// Mirrors the program deck (public/decks/AIYatra-Student-Ambassador-Program-2026.pptx).
import {
	BookOpen, Hammer, Microscope, Flag, Sigma, Code2, FileSearch, GitPullRequest,
	Sprout, ShieldCheck, Building2, Compass, Presentation, Globe2, Link2, Users,
	Crown, Cpu, FlaskConical, Megaphone, Rocket, GraduationCap, Brain, Layers,
	Target, Bot, Wand2, Database, Server, ScrollText, NotebookPen, Repeat, Gauge,
	Lightbulb, Moon, FileCode2, Boxes, Mic, Trophy, Wrench, BarChart3, PenLine,
	MonitorPlay, Package, Map, Sparkles, UserPlus, Award,
} from 'lucide-react';

export const PILLARS = [
	{ label: 'Learn', icon: BookOpen },
	{ label: 'Build', icon: Hammer },
	{ label: 'Research', icon: Microscope },
	{ label: 'Lead', icon: Flag },
];

export const LEVEL_UPS = [
	{ from: 'Attendee', to: 'Organizer', body: 'Convene peers, host labs, invite speakers, and create momentum.' },
	{ from: 'Tutorials', to: 'First principles', body: 'Learn the math, architectures, code, and papers behind modern AI.' },
	{ from: 'Projects', to: 'Contribution', body: 'Publish notes, notebooks, demos, evals, and open-source PRs.' },
];

export const PRINCIPLES = [
	{ icon: Sigma, title: 'First principles', body: 'Math, papers, architectures, implementations.' },
	{ icon: Code2, title: 'Build-first culture', body: 'Demos, notebooks, mini-products, tools.' },
	{ icon: FileSearch, title: 'Research literacy', body: 'Read, reproduce, explain, evaluate.' },
	{ icon: GitPullRequest, title: 'Open collaboration', body: 'GitHub, peer review, public notes.' },
	{ icon: Sprout, title: 'Leadership pipeline', body: 'Students mentor students and grow successors.' },
	{ icon: ShieldCheck, title: 'Responsible AI', body: 'Safety, privacy, governance, and evaluation habits.' },
];

export const DEEP_DIVES = [
	['Speculative Decoding', 'Inference systems'],
	['DeepSeek V3 from Scratch', 'Model architecture'],
	['Linear Algebra for AI Engineers', 'Foundations'],
	['PyTorch Foundations', 'Core implementation'],
	['Harnessing Agentic AI', 'Agent systems'],
	['SFT → Reinforcement Learning', 'Post-training'],
	['Diffusion Models from First Principles', 'Generative models'],
];

export const CAMPUS_LAYERS = [
	{ title: 'Replicate depth', body: 'Run serious deep dives inside your college.' },
	{ title: 'Add a research layer', body: 'Paper circles, reproductions, benchmarks.' },
	{ title: 'Add a builder layer', body: 'Notebooks, demos, hack labs, GitHub repos.' },
	{ title: 'Add a leadership layer', body: 'Core team, faculty link, speakers, outcomes.' },
];

export const ROLE = [
	{ icon: Building2, title: 'Create the chapter', body: 'Form a core team, work with faculty, set the cadence, plan the first event.' },
	{ icon: Compass, title: 'Curate serious tech', body: 'Pick topics, papers, repos, datasets, model releases, and hands-on formats.' },
	{ icon: Presentation, title: 'Host & facilitate', body: 'Run labs, paper sessions, lightning talks, project sessions, and demos.' },
	{ icon: Globe2, title: 'Build in public', body: 'Publish notes, code, models, demos, recaps, and technical explainers.' },
	{ icon: Link2, title: 'Connect people', body: 'Bring in faculty, alumni, practitioners, founders, and other chapters.' },
	{ icon: Sprout, title: 'Develop successors', body: 'Train the next chapter leaders before you graduate.' },
];

export const BLUEPRINT = [
	{ title: 'Core team', body: '3–6 committed students' },
	{ title: 'Faculty link', body: 'One point of contact' },
	{ title: 'Cadence', body: '2 learning + 1 build / month' },
	{ title: 'Output', body: 'Notes + code + demos' },
	{ title: 'Showcase', body: 'Campus or cross-college' },
];

export const MONTHLY_RHYTHM = [
	{ week: 'Week 1', icon: BookOpen, title: 'Concept circle', body: 'Read one paper or chapter; explain it from first principles.' },
	{ week: 'Week 2', icon: FlaskConical, title: 'Hands-on lab', body: 'Reproduce a result, build a notebook, test an open model.' },
	{ week: 'Week 3', icon: Mic, title: 'Guest session', body: 'Invite a practitioner, researcher, alum, or senior student.' },
	{ week: 'Week 4', icon: Rocket, title: 'Ship & publish', body: 'Blog, recap, repo, demo, write-up, or benchmark.' },
];

export const SQUAD = [
	{ icon: Crown, title: 'Chapter Lead', body: 'Roadmap, core team, college alignment, and monthly output.' },
	{ icon: Cpu, title: 'Technical Lead', body: 'Topics, papers, hands-on labs, code quality, learning paths.' },
	{ icon: Microscope, title: 'Research Lead', body: 'Paper circles, reproductions, literature maps, summaries.' },
	{ icon: Megaphone, title: 'Community Lead', body: 'Registrations, comms, posters, WhatsApp/LinkedIn, feedback.' },
	{ icon: Rocket, title: 'Project Lead', body: 'Turns learning into demos, OSS tasks, and campus use-cases.' },
	{ icon: GraduationCap, title: 'Faculty Mentor', body: 'Institutional support, rooms, permissions, academic alignment.' },
];

export const JOURNEY = [
	{ month: '0', title: 'Onboard', body: 'Orientation, charter, core team, faculty link.' },
	{ month: '1–2', title: 'Foundations', body: 'Math, PyTorch, model internals, systems thinking.' },
	{ month: '3–4', title: 'Build', body: 'Labs on agents, inference, RAG, post-training, diffusion.' },
	{ month: '5–6', title: 'Research', body: 'Paper circles, reproduction, benchmark or mini-project.' },
	{ month: '7–8', title: 'Lead', body: 'Host big sessions, recruit juniors, partner with a chapter.' },
	{ month: '9', title: 'Showcase', body: 'Present outcomes, demos, notes, and contributions.' },
];

export const TRACKS = [
	{ icon: Sigma, title: 'AI Foundations', body: 'Linear algebra, probability, optimization, PyTorch' },
	{ icon: Brain, title: 'Model Internals', body: 'Transformers, attention, MoE, KV cache, inference' },
	{ icon: Target, title: 'Post-training', body: 'SFT, preference learning, RLHF, RL, evaluation' },
	{ icon: Bot, title: 'Agent Systems', body: 'Tool use, context, harnesses, MCP, safety' },
	{ icon: Wand2, title: 'Generative AI', body: 'Diffusion, score models, multimodal, video' },
	{ icon: Database, title: 'Retrieval & Data', body: 'Embeddings, RAG, data pipelines, evals' },
	{ icon: Server, title: 'Systems for AI', body: 'Distributed training, serving, quantization, GPUs' },
	{ icon: ScrollText, title: 'Research Practice', body: 'Paper reading, reproduction, ablations, benchmarks' },
];

export const LAB_FORMATS = [
	{ title: 'Paper reading circle', body: 'Read a paper end-to-end: problem, method, equations, limitations.' },
	{ title: 'Reproduction lab', body: 'Rebuild a small result: training loop, component, eval, or demo.' },
	{ title: 'Model evaluation lab', body: 'Compare models on a local benchmark or real campus use-case.' },
	{ title: 'Open-source sprint', body: 'Improve docs, fix issues, add examples, build adapters, run evals.' },
	{ title: 'Campus AI product lab', body: 'Build useful tools: search, tutor, notes, lab assistant, helpdesk.' },
	{ title: 'Research note publishing', body: 'Publish concise technical notes that juniors can reuse.' },
];

export const LOOP = [
	{ icon: NotebookPen, label: 'Read' },
	{ icon: Repeat, label: 'Reproduce' },
	{ icon: Lightbulb, label: 'Explain' },
];

export const SIGNATURE_EVENTS = [
	{ icon: Sigma, title: 'First-Principles Saturdays', body: 'A monthly deep dive into one concept, paper, or model family.' },
	{ icon: Moon, title: 'Build Nights', body: '2-hour focused sessions where you ship notebooks or mini demos.' },
	{ icon: FileCode2, title: 'Paper-to-Code', body: 'Turn a paper into diagrams, pseudocode, and a small implementation.' },
	{ icon: Boxes, title: 'Open Model Clinics', body: 'Try new models, compare tradeoffs, document setup, report results.' },
	{ icon: Users, title: 'Faculty + Industry Dialogues', body: 'Researchers, practitioners, founders, and alumni — high-signal talks.' },
	{ icon: Trophy, title: 'Annual AI Showcase', body: 'Chapter demos, research posters, open-source wins, and awards.' },
];

export const OUTPUTS = [
	{ icon: ScrollText, title: 'Research notes', body: 'Paper breakdowns, concept & literature maps' },
	{ icon: Repeat, title: 'Reproductions', body: 'Notebooks that repeat a known result' },
	{ icon: GitPullRequest, title: 'Open-source PRs', body: 'Docs, tests, adapters, bug fixes, examples' },
	{ icon: Wrench, title: 'Mini-products', body: 'Small AI tools for campus or local problems' },
	{ icon: MonitorPlay, title: 'Tech talks', body: 'Student-led deep dives and recorded explainers' },
	{ icon: BarChart3, title: 'Benchmarks', body: 'Comparing models, datasets, methods, tools' },
	{ icon: Gauge, title: 'Demo days', body: 'Cross-college showcases and project reviews' },
	{ icon: PenLine, title: 'Tech writing', body: 'Blogs, explainers, READMEs, diagrams' },
];

export const SUPPORT = [
	{ icon: Package, title: 'Chapter starter kit', body: 'Charter, roles, formats, launch checklist, monthly plans.' },
	{ icon: Map, title: 'Technical curriculum', body: 'Tracks, workshop themes, paper lists, hands-on problems.' },
	{ icon: Microscope, title: 'Research sprints', body: 'Cross-college teams on a paper, benchmark, or dataset.' },
	{ icon: Hammer, title: 'Build challenges', body: 'Short problems that end in demos, repos, and useful tools.' },
	{ icon: Users, title: 'Mentor network', body: 'Practitioners, researchers, alumni, OSS contributors.' },
	{ icon: Presentation, title: 'Chapter showcases', body: 'Present your work to the wider AI Yatra community.' },
	{ icon: Mic, title: 'Speaker pipeline', body: 'Help finding and inviting speakers for your sessions.' },
	{ icon: Award, title: 'Recognition', body: 'Ambassador identity and certificates for meaningful work.' },
];

export const LADDER = [
	{ level: 1, title: 'Explorer', body: 'Attends, learns, and joins chapter activities.', icon: Compass },
	{ level: 2, title: 'Builder', body: 'Ships notebooks, demos, summaries, or tools.', icon: Hammer },
	{ level: 3, title: 'Research Contributor', body: 'Reads papers, reproduces results, publishes notes.', icon: Microscope },
	{ level: 4, title: 'Chapter Lead', body: 'Runs the monthly rhythm, grows the team, creates outcomes.', icon: Crown },
	{ level: 5, title: 'AI Yatra Fellow', body: 'Leads cross-college work and mentors other chapters.', icon: Sparkles },
];

export const COMMITMENT = [
	['8–10 hrs', 'per month'],
	['1', 'chapter activity / month'],
	['1', 'public output / month'],
	['1', 'successor trained'],
];

export const LAUNCH_PLAN = [
	{ days: 'Days 1–15', body: 'Apply, align with faculty, form a 3–6 member core team, write your charter.' },
	{ days: 'Days 16–30', body: 'Run orientation, pick tracks, publish the calendar, recruit founding members.' },
	{ days: 'Days 31–60', body: 'Host two learning circles and one hands-on lab. Publish notes and a repo.' },
	{ days: 'Days 61–90', body: 'Invite a speaker or run paper-to-code. Start a project or reproduction.' },
	{ days: 'Days 91–100', body: 'Publish a 100-day report, demo output, plan next quarter, add juniors.' },
];

export const FIT = [
	{ tone: 'yes', title: 'Good fit', body: 'Curious, reliable, willing to learn in public, comfortable organizing peers, open to feedback.' },
	{ tone: 'no', title: 'Not the goal', body: 'Certificate collecting, hype posting, attendance-only participation, or one-person control.' },
	{ tone: 'info', title: 'Minimum commitment', body: '8–10 hrs/month · one chapter activity/month · one public technical output/month.' },
	{ tone: 'info', title: 'What we look for', body: 'Initiative: notes, GitHub, projects, teaching, community work — or strong intent.' },
];

export const START_STEPS = [
	{ icon: Users, title: 'Form', body: 'Bring together 3–6 serious students.' },
	{ icon: Layers, title: 'Align', body: 'Meet faculty and get campus approval.' },
	{ icon: UserPlus, title: 'Apply', body: 'Submit your chapter proposal to AI Yatra.' },
	{ icon: Rocket, title: 'Launch', body: 'Run your first session. Publish the outcome.' },
];
