// Hand-written copy layered on top of the auto-synced Meetup data
// (src/data/meetup.json). Everything here is optional: an event that has no
// entry still shows up with its Meetup title and a summary taken from its
// Meetup description.
//
//   shortTitle    – a punchier title for cards
//   blurb         – one or two sentences for cards
//   rsvpDeadline  – ISO time the RSVP + Google Form close (shows a countdown)
//
// Keyed by Meetup event id (the number in the event URL).

export const EVENT_NOTES = {
	'316720553': {
		shortTitle: 'JEV: Fast System-1 AI',
		blurb: 'Fast, predictable, structured decisions without long reasoning chains — System-1 vs System-2, schema-driven outputs, classification, extraction, routing, validation, confidence scores, and a live end-to-end JEV build. Input → JEV → Schema + Prediction + Confidence → Decision.',
		rsvpDeadline: '2026-10-06T23:59:59+05:30',
	},
	'316525443': {
		shortTitle: 'Diffusion Models, First Principles',
		blurb: 'From noise to images, video, audio, text and omni-generation — DDPM, latent diffusion, DiT and flow matching, then a live from-scratch build on 6 GB VRAM.',
	},
	'316434319': {
		shortTitle: 'SFT → RL: Train to Think',
		blurb: 'SFT with LoRA, DPO and GRPO on a pretrained model — rewards, preferences and the hard question: better at the task, or just better at the reward?',
	},
	'316241516': {
		shortTitle: 'Harnessing Agentic AI',
		blurb: 'Build the loop, the tools and the guardrails — and make your own coding agent that reads, plans, edits, tests and repairs its way to a verified pull request. 100% offline, zero API keys.',
	},
	'316136710': {
		shortTitle: 'PyTorch Foundations',
		blurb: 'Tensors, autograd and the training loop — the foundations every AI engineer stands on. Rebuilt nn.Linear from scratch.',
	},
	'316031457': {
		shortTitle: 'Linear Algebra → Transformers',
		blurb: 'Vectors to attention: embeddings, Q/K/V projections, LoRA and SVD — the math beneath the models, by hand.',
	},
	'315949835': {
		shortTitle: 'DeepSeek v3 from Scratch',
		blurb: 'Multi-head latent attention, MoE load balancing and RoPE scaling — the DeepSeek-V3 paper, live-coded in PyTorch.',
	},
	'315704127': {
		shortTitle: 'Goose AI Agent Demo',
		blurb: 'Providers, context engineering, MCP extensions and recipes — a full end-to-end run of the open-source Goose agent.',
	},
	'315688657': {
		shortTitle: 'Speculative Decoding Lab',
		blurb: 'Draft-verify-accept in ~60 lines of PyTorch, then HF assisted generation + llama.cpp — 2–3× faster inference, proven lossless.',
	},
	'315595570': {
		shortTitle: 'Agentic AI Reading #4',
		blurb: 'Book-reading series finale: agentic patterns, discussion and reading together — online, open to everyone.',
	},
	'315542060': {
		shortTitle: 'Agentic AI Reading #3',
		blurb: 'Session three of the Hitchhiker’s Guide series — agents, tools and workflows, read and debated together.',
	},
	'315492739': {
		shortTitle: 'Agentic AI Reading #2',
		blurb: 'Session two of the reading series — continuing the guided tour through agentic AI, online in the evening.',
	},
	'315451083': {
		shortTitle: 'Agentic AI Reading #1',
		blurb: 'Where the reading journey began — session one of the Hitchhiker’s Guide to Agentic AI, online and free.',
	},
	'315145175': {
		shortTitle: 'Transformer, Paper → Code',
		blurb: 'From “Attention Is All You Need” to running source code — the transformer, line by line, from paper to PyTorch.',
	},
};
