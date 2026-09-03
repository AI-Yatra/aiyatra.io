// AIYatra — site-wide data & links.
// All events, dates, attendee counts and photos are the real live values
// pulled from https://www.meetup.com/aiyatra/ (group + /events/ pages).
// Photos are the real featuredEventPhoto values served from meetupstatic.

export const MEETUP_URL = 'https://www.meetup.com/aiyatra/';
export const EVENT_URL = 'https://www.meetup.com/aiyatra/events/316241516/';
export const PAST_EVENTS_URL = 'https://www.meetup.com/aiyatra/events/past/';
export const CONTACT_EMAIL = 'global.aiyatra@gmail.com';
export const LINKEDIN_URL = 'https://www.linkedin.com/company/aiyatra/';
export const GITHUB_URL = 'https://github.com/AI-Yatra';

// Local mark in public/. Prefixed with Vite's BASE_URL ("/" on the custom
// domain) so it resolves on every host.
// A plain "/aiyatra-mark.png" string would 404 under a subpath.
const BASE_URL = import.meta.env.BASE_URL || '/';

export const AI_YATRA_LOGO = `${BASE_URL}aiyatra-mark.png`;

export const GROUP_STATS = {
	members: 2957,
	eventsHosted: 14,
	rating: 4.6,
	ratingsCount: 90,
	venue: 'LSEG, International Tech Park, Madhapur, Hyderabad',
	city: 'Hyderabad, IN',
	organizer: 'Khaja Moinuddin Mohammed',
};

export const PHOTO = {
	// Real featured photos from the live Meetup group (highres meetupstatic)
	agenticAi: 'https://secure.meetupstatic.com/photos/event/3/c/0/a/highres_535815370.jpeg',
	pytorch: 'https://secure.meetupstatic.com/photos/event/1/0/a/b/highres_535684267.jpeg',
	linearAlgebra: 'https://secure.meetupstatic.com/photos/event/5/f/e/highres_535561534.jpeg',
	deepseek: 'https://secure.meetupstatic.com/photos/event/b/6/a/3/highres_535486755.jpeg',
	goose: 'https://secure.meetupstatic.com/photos/event/6/6/2/6/highres_535226150.jpeg',
	speculative: 'https://secure.meetupstatic.com/photos/event/3/5/0/c/highres_535213580.jpeg',
	hitchhiker: 'https://secure.meetupstatic.com/photos/event/d/f/6/2/highres_534957186.jpeg',
	transformer: 'https://secure.meetupstatic.com/photos/event/4/5/f/8/highres_534617912.jpeg',
	cover: 'https://secure.meetupstatic.com/photos/event/b/9/7/4/highres_535487476.jpeg',
	// Back-compat aliases used by older sections
	research: 'https://secure.meetupstatic.com/photos/event/1/0/a/b/highres_535684267.jpeg',
	build: 'https://secure.meetupstatic.com/photos/event/3/c/0/a/highres_535815370.jpeg',
	transform: 'https://secure.meetupstatic.com/photos/event/5/f/e/highres_535561534.jpeg',
};

// Every session on https://www.meetup.com/aiyatra/events/ — newest last in source,
// exported newest-first for display. `photo` = real meetupstatic cover.
export const ALL_EVENTS = [
	{
		id: '316241516',
		title: 'Harnessing Agentic AI: Build Tools That Build Code',
		shortTitle: 'Harnessing Agentic AI',
		date: 'Sat, Sep 5 · 9:00 AM IST',
		attendees: 319,
		status: 'upcoming',
		url: 'https://www.meetup.com/aiyatra/events/316241516/',
		photo: 'https://secure.meetupstatic.com/photos/event/3/c/0/a/highres_535815370.jpeg',
		blurb:
			'Build the loop, the tools and the guardrails — and make your own coding agent that reads, plans, edits, tests and repairs its way to a verified pull request. 100% offline, zero API keys.',
	},
	{
		id: '316136710',
		title: 'Pytorch Session #1 - PyTorch Foundations',
		shortTitle: 'PyTorch Foundations',
		date: 'Sat, Aug 22 · 10:00 AM IST',
		attendees: 146,
		status: 'past',
		url: 'https://www.meetup.com/aiyatra/events/316136710/',
		photo: 'https://secure.meetupstatic.com/photos/event/1/0/a/b/highres_535684267.jpeg',
		blurb:
			'Tensors, autograd and the training loop — the foundations every AI engineer stands on. Rebuilt nn.Linear from scratch.',
	},
	{
		id: '316031457',
		title: 'Linear Algebra for AI Engineers: From Vectors to Transformers',
		shortTitle: 'Linear Algebra → Transformers',
		date: 'Sat, Aug 15 · 10:00 AM IST',
		attendees: 207,
		status: 'past',
		url: 'https://www.meetup.com/aiyatra/events/316031457/',
		photo: 'https://secure.meetupstatic.com/photos/event/5/f/e/highres_535561534.jpeg',
		blurb:
			'Vectors to attention: embeddings, Q/K/V projections, LoRA and SVD — the math beneath the models, by hand.',
	},
	{
		id: '315949835',
		title: 'Building Deepseek v3 from scratch',
		shortTitle: 'DeepSeek v3 from Scratch',
		date: 'Sat, Aug 8 · 10:00 AM IST',
		attendees: 286,
		status: 'past',
		url: 'https://www.meetup.com/aiyatra/events/315949835/',
		photo: 'https://secure.meetupstatic.com/photos/event/b/6/a/3/highres_535486755.jpeg',
		blurb:
			'Multi-head latent attention, MoE load balancing and RoPE scaling — the DeepSeek-V3 paper, live-coded in PyTorch.',
	},
	{
		id: '315704127',
		title: 'Goose AI Agent - End to End Demo',
		shortTitle: 'Goose AI Agent Demo',
		date: 'Sat, Aug 1 · 10:00 AM IST',
		attendees: 142,
		status: 'past',
		url: 'https://www.meetup.com/aiyatra/events/315704127/',
		photo: 'https://secure.meetupstatic.com/photos/event/6/6/2/6/highres_535226150.jpeg',
		blurb:
			'Providers, context engineering, MCP extensions and recipes — a full end-to-end run of the open-source Goose agent.',
	},
	{
		id: '315688657',
		title: 'Speculative Decoding: Deconstructed — A 3-Hour Hands-On Lab',
		shortTitle: 'Speculative Decoding Lab',
		date: 'Sat, Jul 25 · 10:00 AM IST',
		attendees: 64,
		status: 'past',
		url: 'https://www.meetup.com/aiyatra/events/315688657/',
		photo: 'https://secure.meetupstatic.com/photos/event/3/5/0/c/highres_535213580.jpeg',
		blurb:
			'Draft-verify-accept in ~60 lines of PyTorch, then HF assisted generation + llama.cpp — 2–3× faster inference, proven lossless.',
	},
	{
		id: '315595570',
		title: 'The Hitchhiker’s Guide to Agentic AI - Book Reading Series Session #4',
		shortTitle: 'Agentic AI Reading #4',
		date: 'Mon, Jul 14 · 8:00 PM IST',
		attendees: 40,
		status: 'past',
		url: 'https://www.meetup.com/aiyatra/events/315595570/',
		photo: 'https://secure.meetupstatic.com/photos/event/d/f/6/2/highres_534957186.jpeg',
		blurb:
			'Book-reading series finale: agentic patterns, discussion and reading together — online, open to everyone.',
	},
	{
		id: '315542060',
		title: 'The Hitchhiker’s Guide to Agentic AI - Book Reading Series Session #3',
		shortTitle: 'Agentic AI Reading #3',
		date: 'Sat, Jul 5 · 10:00 AM IST',
		attendees: 16,
		status: 'past',
		url: 'https://www.meetup.com/aiyatra/events/315542060/',
		photo: 'https://secure.meetupstatic.com/photos/event/d/f/6/2/highres_534957186.jpeg',
		blurb:
			'Session three of the Hitchhiker’s Guide series — agents, tools and workflows, read and debated together.',
	},
	{
		id: '315492739',
		title: 'The Hitchhiker’s Guide to Agentic AI - Book Reading Series Session #2',
		shortTitle: 'Agentic AI Reading #2',
		date: 'Wed, Jul 2 · 8:30 PM IST',
		attendees: 35,
		status: 'past',
		url: 'https://www.meetup.com/aiyatra/events/315492739/',
		photo: 'https://secure.meetupstatic.com/photos/event/d/f/6/2/highres_534957186.jpeg',
		blurb:
			'Session two of the reading series — continuing the guided tour through agentic AI, online in the evening.',
	},
	{
		id: '315451083',
		title: 'The Hitchhiker’s Guide to Agentic AI - Book Reading Series Session #1',
		shortTitle: 'Agentic AI Reading #1',
		date: 'Mon, Jun 30 · 8:30 PM IST',
		attendees: 25,
		status: 'past',
		url: 'https://www.meetup.com/aiyatra/events/315451083/',
		photo: 'https://secure.meetupstatic.com/photos/event/d/f/6/2/highres_534957186.jpeg',
		blurb:
			'Where the reading journey began — session one of the Hitchhiker’s Guide to Agentic AI, online and free.',
	},
	{
		id: '315145175',
		title: 'Master the Transformer Architecture - Paper to Source Code',
		shortTitle: 'Transformer, Paper → Code',
		date: 'Sat, Jun 20 · 9:00 AM IST',
		attendees: 56,
		status: 'past',
		url: 'https://www.meetup.com/aiyatra/events/315145175/',
		photo: 'https://secure.meetupstatic.com/photos/event/4/5/f/8/highres_534617912.jpeg',
		blurb:
			'From “Attention Is All You Need” to running source code — the transformer, line by line, from paper to PyTorch.',
	},
];

// Convenience slices (back-compat with existing imports)
export const EVENTS = {
	agenticAi: ALL_EVENTS[0],
	pytorch: ALL_EVENTS[1],
	linearAlgebra: ALL_EVENTS[2],
	deepseek: ALL_EVENTS[3],
	goose: ALL_EVENTS[4],
};

export const UPCOMING_EVENTS = ALL_EVENTS.filter((e) => e.status === 'upcoming');
export const PAST_EVENTS = ALL_EVENTS.filter((e) => e.status === 'past');

// Real faces from the live group — organizer + recent attendees (meetupstatic avatars)
export const HOST_PHOTO = `${BASE_URL}jagadeeswara-reddy.jpg`;
export const AMBASSADOR_CREST = `${BASE_URL}ambassador-crest.jpg`;

export const COMMUNITY_FACES = [
	{
		name: 'Khaja Moinuddin Mohammed',
		role: 'Super Organizer',
		photo: 'https://secure.meetupstatic.com/photos/member/8/f/d/8/highres_325116824.jpeg',
	},
	{
		name: 'Azeez Syed',
		role: 'Co-organizer',
		photo: 'https://secure.meetupstatic.com/photos/member/c/2/6/4/highres_323989764.jpeg',
	},
	{
		name: 'AIYatra member',
		role: 'Meetup regular',
		photo: 'https://secure.meetupstatic.com/photos/member/1/3/b/b/highres_324665051.jpeg',
	},
	{
		name: 'AIYatra member',
		role: 'Meetup regular',
		photo: 'https://secure.meetupstatic.com/photos/member/5/b/3/f/highres_263543359.jpeg',
	},
	{
		name: 'AIYatra member',
		role: 'Meetup regular',
		photo: 'https://secure.meetupstatic.com/photos/member/3/8/0/8/highres_324554344.jpeg',
	},
	{
		name: 'AIYatra member',
		role: 'Meetup regular',
		photo: 'https://secure.meetupstatic.com/photos/member/6/8/3/8/highres_325946680.jpeg',
	},
];

// Gallery = the real event covers, newest first (deduplicated)
export const GALLERY = [
	ALL_EVENTS[0],
	ALL_EVENTS[1],
	ALL_EVENTS[2],
	ALL_EVENTS[3],
	ALL_EVENTS[4],
	ALL_EVENTS[5],
	ALL_EVENTS[10],
];
