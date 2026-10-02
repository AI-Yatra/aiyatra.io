import React, { useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
	ArrowRight, ArrowUpRight, CalendarDays, MapPin, Users, Star,
	Quote, Ticket, Clock, Laptop, FlaskConical, GraduationCap, Download,
	ChevronLeft, ChevronRight, Award, MessagesSquare, Cpu,
	Wrench, Layers, Network, Globe, Github, Mail, Zap,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import Intro, { IntroSheet } from '@/components/Intro';
import { SectionLabel, PrimaryButton, GhostButton } from '@/components/Kit';
import CountUp from '@/components/CountUp';
import { Header, Footer } from '@/components/SiteChrome';
import { NeuralField, Aurora, Tilt, useSpotlight, useCountdown } from '@/components/Fx';
import {
	MEETUP_URL, PAST_EVENTS_URL, CALENDAR_FEED_URL, formatDay, formatTime, formatLongDay, eventPlace, googleCalendarUrl,
	GROUP_STATS, COMMUNITY_FACES, HOST_PHOTO, MONIKA_PHOTO, AMBASSADOR_CREST, DECKS,
	CONTACT_EMAIL, GITHUB_URL, AI_YATRA_LOGO, NEXT_EVENT, upcomingEvents, photoProps,
} from '@/data/site';
import { LABS_CATEGORIES, LABS_TOTAL_PAPERS } from '@/data/labs';
import { useEvents } from '@/lib/useEvents';

const APPLY_MAIL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('AIYatra Chapter Proposal — Student Ambassador Program')}`;

const VERTICALS = [
	{
		n: '01',
		icon: CalendarDays,
		title: 'AIYatra Meetups',
		tag: 'Every Saturday',
		blurb: 'Hands-on, in-person sessions in Hyderabad. Laptops open, code on screen. You leave with something running.',
		facts: [`${GROUP_STATS.eventsHosted} sessions`, `${GROUP_STATS.members.toLocaleString()} members`, 'Free'],
		to: '/#meetups',
		cta: NEXT_EVENT ? `Next: ${formatDay(NEXT_EVENT.start)}` : 'See upcoming sessions',
		from: 'left',
	},
	{
		n: '02',
		icon: GraduationCap,
		title: 'Student Ambassador Program',
		tag: 'Campus chapters',
		blurb: 'Turn your campus into an AI research & builder chapter. Run labs, read papers, build tools, and lead.',
		facts: ['B.Tech & M.Sc', '9-month journey', '8–10 hrs / month'],
		to: '/ambassadors',
		cta: 'Start your chapter',
		from: 'up',
	},
	{
		n: '03',
		icon: FlaskConical,
		title: 'AIYatra Research Labs',
		tag: `${LABS_CATEGORIES.length} tracks · ${LABS_TOTAL_PAPERS} papers`,
		blurb: 'Read the papers, reimplement them, publish in the open: SLMs, agent harnesses, transformer layers, new architectures.',
		facts: ['arXiv + AlphaXiv', 'Open source', 'Paper → code'],
		to: '/labs',
		cta: 'Enter the lab',
		from: 'right',
	},
];

const TOPICS = [
	'Transformers', 'PyTorch', 'Agentic AI', 'Diffusion Models', 'SFT → RL', 'DeepSeek-V3',
	'Small Language Models', 'Speculative Decoding', 'Linear Algebra', 'MCP', 'LoRA', 'GRPO',
	'Flow Matching', 'Mixture of Experts', 'RoPE', 'Structured Outputs',
];

const testimonials = [
	{ quote: 'I walked in knowing nothing about transformers and walked out having built attention from scratch. No gatekeeping, no jargon walls.', name: 'Priya S.', role: 'Data Analyst → ML Engineer' },
	{ quote: 'The agentic AI workshop was the best Saturday I have spent in years. We built a coding agent on our own machines, no API keys, and it actually worked.', name: 'Rahul K.', role: 'Backend Engineer' },
	{ quote: 'As a student, most AI events felt out of reach. AIYatra is free, welcoming, and genuinely deep. The linear algebra session finally made the math click.', name: 'Sai Rishita M.', role: 'CS Undergraduate' },
	{ quote: 'You come for the sessions and stay for the people. I found my co-founder, my study group, and my confidence here.', name: 'Kiran K.', role: 'Founder, AI Startup' },
	{ quote: 'Every meetup ends with something running on my laptop. That hands-on rhythm is rare. AIYatra gets it exactly right.', name: 'Ananya R.', role: 'ML Practitioner' },
	{ quote: 'The volunteers explain until it clicks. I asked the “dumb” questions about backprop and walked out finally understanding gradients.', name: 'Vikram J.', role: 'Transitioning into AI' },
];

const ORGANIZERS = [
	{ name: 'Khaja Moinuddin Mohammed', role: 'Founder · Super Organizer', photo: COMMUNITY_FACES[0].photo, body: 'Sets the learning arc across sessions and hosts the Saturday meetups, from linear algebra to agentic coding harnesses.' },
	{ name: 'Azeez Syed', role: 'Co-organizer & Host', photo: COMMUNITY_FACES[1].photo, body: 'Keeps the room running: demos, hands-on labs, Q&A, and making sure no learner leaves stuck.' },
	{ name: 'Jagadeeswara Reddy', role: 'Host & Educator', photo: HOST_PHOTO, body: 'Leads talks on educational material, turning dense topics into clear, hands-on learning.' },
	{ name: 'Monika Kusumanchi', role: 'Host · Researcher · AI Educator', photo: MONIKA_PHOTO, body: 'Hosts deep dives into the latest in AI and turns cutting-edge research into practical learning.', link: 'https://image-and-story.vercel.app/' },
];

const FAQ = [
	{ icon: CalendarDays, q: 'When?', a: NEXT_EVENT ? `Saturday mornings, IST. Next: ${NEXT_EVENT.date.replace(' · ', ', ')}.` : 'Saturday mornings, IST. The next date is announced on Meetup.' },
	{ icon: MapPin, q: 'Where?', a: 'Hyderabad. The exact venue is shared with everyone who RSVPs on Meetup.' },
	{ icon: Ticket, q: 'Cost?', a: 'Free, always. RSVP on Meetup + the Google Form are both mandatory for entry.' },
	{ icon: Laptop, q: 'What to bring?', a: 'A laptop with Python 3.10+, and curiosity. No prerequisites.' },
	{ icon: GraduationCap, q: 'I’m a student. Can I lead?', a: 'Yes. Join the Student Ambassador Program and bring AIYatra to your campus.' },
	{ icon: FlaskConical, q: 'Can I do research with you?', a: 'Yes. Pick a Labs track, read the shelf, and bring a reimplementation to Saturday.' },
];

const TRACK_ICONS = {
	'small-language-models': Cpu,
	'agent-harnesses': Wrench,
	'transformer-layers': Layers,
	'new-architectures': Network,
};

/* ——— small building blocks ——— */

function Digit({ value, label }) {
	const v = String(value).padStart(2, '0');
	return (
		<div className="flex flex-col items-center">
			<div className="relative h-12 w-14 overflow-hidden rounded-xl bg-white text-center shadow-[inset_0_0_0_1px_hsl(221_83%_53%/0.12)] sm:h-14 sm:w-16">
				<AnimatePresence initial={false}>
					<motion.span
						key={v}
						initial={{ y: '-100%', opacity: 0 }}
						animate={{ y: '0%', opacity: 1 }}
						exit={{ y: '100%', opacity: 0 }}
						transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
						className="absolute inset-0 flex items-center justify-center font-display text-2xl font-bold tabular-nums text-ink sm:text-3xl"
					>
						{v}
					</motion.span>
				</AnimatePresence>
			</div>
			<span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50">{label}</span>
		</div>
	);
}

function Countdown({ target }) {
	const t = useCountdown(target);
	return (
		<div className="flex items-start gap-2 sm:gap-3" aria-live="off">
			<Digit value={t.days} label="Days" />
			<Digit value={t.hours} label="Hrs" />
			<Digit value={t.minutes} label="Min" />
			<Digit value={t.seconds} label="Sec" />
		</div>
	);
}

/* ——— Hero ——— */

function RsvpNote({ ev }) {
	const rsvp = useCountdown(ev.rsvpDeadline || 0);
	if (!ev.formUrl && !ev.rsvpDeadline) return null;
	let text;
	if (ev.rsvpDeadline && rsvp.done) text = 'RSVP for this session has closed.';
	else if (ev.rsvpDeadline) {
		text = <span>RSVP{ev.formUrl ? ' + Google Form' : ''} close in <strong className="text-tone-blue-deep">{rsvp.days}d {rsvp.hours}h</strong> ({formatDay(ev.rsvpDeadline)} EOD).{ev.formUrl ? ' Both mandatory.' : ''}</span>;
	} else text = 'RSVP on Meetup and fill the Google Form. Both are mandatory for venue entry.';
	return (
		<div className="relative mt-5 flex items-center gap-3 rounded-2xl bg-tone-blue/70 px-4 py-3 text-sm font-medium text-ink/80">
			<Clock className="h-4 w-4 shrink-0 text-tone-blue-deep" />
			{text}
		</div>
	);
}

function NextMeetupCard() {
	const { next: ev, live } = useEvents();
	if (!ev) {
		return (
			<div className="glass relative overflow-hidden rounded-[28px] border border-white p-6 shadow-paper sm:p-7">
				<span className="inline-flex items-center gap-2 rounded-full bg-tone-blue-deep px-3 py-1 text-xs font-semibold text-white">Next Saturday session</span>
				<h3 className="mt-5 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">Announcing soon.</h3>
				<p className="mt-2 text-sm font-medium text-ink/60">New sessions go up on Meetup first. This page updates itself every night.</p>
				<div className="mt-6 grid gap-2.5 sm:grid-cols-2">
					<PrimaryButton href={MEETUP_URL} target="_blank" rel="noreferrer" className="w-full">Follow on Meetup <ArrowRight className="h-4 w-4" /></PrimaryButton>
					<GhostButton href={CALENDAR_FEED_URL} className="w-full"><CalendarDays className="h-4 w-4" /> Subscribe</GhostButton>
				</div>
			</div>
		);
	}
	return (
		<div className="glass relative overflow-hidden rounded-[28px] border border-white p-6 shadow-paper sm:p-7">
			<div aria-hidden="true" className="absolute -right-16 -top-16 h-48 w-48 glow [--glow:hsl(199_89%_60%/0.32)]" />
			<div className="relative flex items-center justify-between gap-3">
				<span className="inline-flex items-center gap-2 rounded-full bg-tone-blue-deep px-3 py-1 text-xs font-semibold text-white">
					<span className="relative flex h-2 w-2"><span className="ping-soft absolute inset-0 rounded-full bg-white" /><span className="relative h-2 w-2 rounded-full bg-white" /></span>
					{live ? 'Happening now' : 'Next meetup · live countdown'}
				</span>
				{ev.attendees > 0 && <span className="text-xs font-semibold text-tone-blue-deep">{ev.attendees}+ going</span>}
			</div>
			<h3 className="relative mt-5 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">{ev.shortTitle}</h3>
			<p className="relative mt-2 text-sm font-medium text-ink/60">{ev.date} · {eventPlace(ev)}</p>
			<div className="relative mt-5">
				{live
					? <p className="font-display text-2xl font-bold text-tone-blue-deep">Live until {formatTime(ev.end)} IST</p>
					: <Countdown target={ev.start} />}
			</div>
			<RsvpNote ev={ev} />
			<div className="relative mt-5 grid gap-2.5 sm:grid-cols-2">
				<PrimaryButton href={ev.url} target="_blank" rel="noreferrer" className="w-full">{live ? 'Event page' : 'RSVP now'} <ArrowRight className="h-4 w-4" /></PrimaryButton>
				{ev.formUrl
					? <GhostButton href={ev.formUrl} target="_blank" rel="noreferrer" className="w-full">Google Form <ArrowUpRight className="h-4 w-4" /></GhostButton>
					: <GhostButton href={googleCalendarUrl(ev)} target="_blank" rel="noreferrer" className="w-full"><CalendarDays className="h-4 w-4" /> Add to calendar</GhostButton>}
			</div>
		</div>
	);
}

function VerticalPortal({ v, i }) {
	const spot = useSpotlight();
	const Icon = v.icon;
	return (
		<Reveal from={v.from} delay={0.35 + i * 0.12} className={`flex ${i === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
			<Tilt className="flex flex-1" max={6}>
			<Link
				to={v.to}
				onMouseMove={spot}
				className="spotlight hover-lift group flex flex-1 flex-col rounded-[24px] border border-tone-blue-deep/10 bg-white/80 p-6 shadow-paper-sm"
			>
				<div className="flex items-center justify-between">
					<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-tone-blue-deep to-[hsl(199_89%_60%)] text-white shadow-[0_10px_24px_-8px_hsl(221_83%_53%/0.7)] transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
						<Icon className="h-6 w-6" />
					</span>
					<span className="font-display text-4xl font-bold text-tone-blue-deep/15">{v.n}</span>
				</div>
				<p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-tone-blue-deep">{v.tag}</p>
				<h3 className="mt-1.5 font-display text-2xl font-bold leading-tight text-ink">{v.title}</h3>
				<p className="mt-2 flex-1 text-sm leading-relaxed text-ink/65">{v.blurb}</p>
				<div className="mt-4 flex flex-wrap gap-1.5">
					{v.facts.map((f) => (
						<span key={f} className="rounded-full bg-tone-blue/70 px-2.5 py-1 text-[11px] font-semibold text-tone-blue-deep">{f}</span>
					))}
				</div>
				<span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-tone-blue-deep">
					{v.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
				</span>
			</Link>
			</Tilt>
		</Reveal>
	);
}

function Hero() {
	return (
		<section id="start" className="relative overflow-hidden">
			<Aurora />
			<div aria-hidden="true" className="bg-grid mask-fade-y absolute inset-0" />

			<div className="wrap relative pb-20 pt-10 lg:pt-16">
				<div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
					<div>
						<Reveal from="down">
							<span className="inline-flex items-center gap-2 rounded-full border border-tone-blue-deep/15 bg-white/80 py-1.5 pl-1.5 pr-4 text-sm font-medium text-ink/75">
								<span className="whitespace-nowrap rounded-full bg-tone-blue-deep px-2.5 py-0.5 text-xs font-semibold text-white">Open source</span>
								<span className="whitespace-nowrap">Free AI community<span className="hidden sm:inline"> · Hyderabad → the world</span></span>
							</span>
						</Reveal>
						<Reveal from="left" delay={0.08}>
							<h1 className="mt-7 font-display text-[3.4rem] font-bold leading-[0.98] text-ink sm:text-7xl xl:text-[5.4rem]">
								Learn AI <span className="text-gradient">in the open.</span>
								<br />Build it <span className="relative inline-block">together.
									<svg aria-hidden="true" viewBox="0 0 300 20" className="absolute -bottom-2 left-0 h-3 w-full text-[hsl(199_89%_60%)]" preserveAspectRatio="none">
										<motion.path d="M2 14 C 80 2, 200 2, 298 12" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.8, ease: 'easeInOut' }} />
									</svg>
								</span>
							</h1>
						</Reveal>
						<Reveal from="left" delay={0.16}>
							<p className="mt-7 max-w-xl text-lg leading-relaxed text-ink/65 sm:text-xl">
								AIYatra is an open AI community built on three pillars: <strong className="font-semibold text-ink">Saturday meetups</strong>,
								a <strong className="font-semibold text-ink">student ambassador</strong> network, and an open <strong className="font-semibold text-ink">research lab</strong>.
								No paywalls, no prerequisites. Bring a laptop and curiosity.
							</p>
						</Reveal>
						<Reveal from="up" delay={0.24}>
							<div className="mt-9 flex flex-wrap items-center gap-3">
								<PrimaryButton href={MEETUP_URL} target="_blank" rel="noreferrer">Join the community <ArrowRight className="h-4 w-4" /></PrimaryButton>
								<GhostButton to="/#verticals">Explore the 3 pillars</GhostButton>
							</div>
						</Reveal>
						<Reveal from="up" delay={0.3}>
							<dl className="mt-11 grid max-w-xl grid-cols-3 gap-4">
								{[
									{ value: GROUP_STATS.members, label: 'Members' },
									{ value: GROUP_STATS.eventsHosted, label: 'Sessions hosted' },
									{ value: GROUP_STATS.rating, label: `★ · ${GROUP_STATS.ratingsCount} ratings`, decimals: 1 },
								].map((s) => (
									<div key={s.label} className="border-l-2 border-tone-blue-deep/20 pl-4">
										<dd className="font-display text-3xl font-bold text-ink sm:text-4xl"><CountUp value={s.value} decimals={s.decimals || 0} /></dd>
										<dt className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/50">{s.label}</dt>
									</div>
								))}
							</dl>
						</Reveal>
					</div>
					<Reveal from="right" delay={0.2}>
						<div className="float-soft" style={{ '--float-rot': '0deg' }}>
							<NextMeetupCard />
						</div>
					</Reveal>
				</div>

				<div id="verticals" className="mt-16 grid scroll-mt-28 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{VERTICALS.map((v, i) => <VerticalPortal key={v.n} v={v} i={i} />)}
				</div>
			</div>
		</section>
	);
}

function TopicStream() {
	const half = Math.ceil(TOPICS.length / 2);
	const rows = [TOPICS.slice(0, half), TOPICS.slice(half)];
	return (
		<section aria-label="Topics we cover" className="relative overflow-hidden border-y border-tone-blue-deep/10 bg-paper-soft py-6">
			<div className="mask-fade-x space-y-3">
				{rows.map((row, r) => (
					<div key={r} className={r === 0 ? 'marquee-track flex w-max gap-3' : 'marquee-track-reverse flex w-max gap-3'}>
						{[...row, ...row, ...row, ...row].map((t, i) => (
							<span key={i} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-tone-blue-deep/10 bg-white px-5 py-2.5 font-display text-base font-semibold text-ink/80">
								<Zap className="h-3.5 w-3.5 text-tone-blue-deep" /> {t}
							</span>
						))}
					</div>
				))}
			</div>
		</section>
	);
}

/* ——— 01 · Meetups ——— */

function PastEventsRail({ events }) {
	const railRef = useRef(null);
	const scrollBy = (dir) => {
		const el = railRef.current;
		if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
	};
	return (
		<div className="mt-16">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-tone-blue-deep">The archive</p>
					<h3 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">{events.length} sessions and counting</h3>
				</div>
				<div className="flex gap-2">
					<button type="button" onClick={() => scrollBy(-1)} aria-label="Scroll past events left" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-tone-blue-deep/15 bg-white text-ink transition-colors hover:bg-tone-blue-deep hover:text-white"><ChevronLeft className="h-5 w-5" /></button>
					<button type="button" onClick={() => scrollBy(1)} aria-label="Scroll past events right" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-tone-blue-deep/15 bg-white text-ink transition-colors hover:bg-tone-blue-deep hover:text-white"><ChevronRight className="h-5 w-5" /></button>
				</div>
			</div>
			<div ref={railRef} className="-mx-4 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{events.map((e, i) => (
					<div key={e.id} className="w-[82%] shrink-0 snap-start sm:w-[360px]">
						<a href={e.url} target="_blank" rel="noreferrer" className="hover-lift group block h-full overflow-hidden rounded-[22px] border border-tone-blue-deep/10 bg-white shadow-paper-sm">
							<div className="relative aspect-[16/10] overflow-hidden">
								<img {...photoProps(e.photo)} alt={e.title} loading={i < 3 ? 'eager' : 'lazy'} decoding="async" width="676" height="380" className="h-full w-full bg-tone-blue/50 object-cover transition-transform duration-700 group-hover:scale-110" />
								<div className="absolute inset-0 bg-gradient-to-t from-[hsl(224_64%_14%/0.75)] via-transparent to-transparent" />
								<span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-tone-blue-deep">
									<Users className="h-3.5 w-3.5" /> {e.attendees} attended
								</span>
							</div>
							<div className="p-5">
								<p className="text-xs font-semibold text-tone-blue-deep">{formatDay(e.start)}</p>
								<h4 className="mt-1 font-display text-xl font-bold leading-snug text-ink">{e.shortTitle}</h4>
								<p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/60">{e.blurb}</p>
							</div>
						</a>
					</div>
				))}
				<div className="w-[82%] shrink-0 snap-start sm:w-[300px]">
					<a href={PAST_EVENTS_URL} target="_blank" rel="noreferrer" className="group flex h-full min-h-[300px] flex-col items-center justify-center gap-3 rounded-[22px] border-2 border-dashed border-tone-blue-deep/25 bg-tone-blue/30 p-6 text-center transition-colors hover:bg-tone-blue">
						<span className="flex h-14 w-14 items-center justify-center rounded-full bg-tone-blue-deep text-white transition-transform group-hover:scale-110"><ArrowUpRight className="h-6 w-6" /></span>
						<span className="font-display text-xl font-bold text-ink">Full archive on Meetup</span>
						<span className="text-sm text-ink/60">Photos, ratings and discussions</span>
					</a>
				</div>
			</div>
		</div>
	);
}

function EventSpotlight({ ev, live, recent }) {
	if (!ev) {
		return (
			<article className="relative flex flex-1 flex-col justify-center overflow-hidden rounded-[28px] bg-ink p-8 text-white shadow-paper sm:p-10">
				<div aria-hidden="true" className="absolute inset-0 opacity-50"><NeuralField density={0.00008} /></div>
				<span className="relative inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-tone-blue-deep"><Ticket className="h-3.5 w-3.5" /> Next session</span>
				<h3 className="relative mt-6 font-display text-4xl font-bold leading-tight">The next Saturday is being planned.</h3>
				<p className="relative mt-3 max-w-xl text-white/70">
					New sessions are announced on Meetup first and appear here automatically the same night.
					{recent && <> Last up: <strong className="text-white">{recent.shortTitle}</strong> with {recent.attendees} builders.</>}
				</p>
				<div className="relative mt-8 flex flex-wrap gap-3">
					<a href={MEETUP_URL} target="_blank" rel="noreferrer" className="active-press inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-tone-blue-deep transition-transform hover:-translate-y-0.5">Join on Meetup <ArrowRight className="h-4 w-4" /></a>
					<GhostButton light href={CALENDAR_FEED_URL}><CalendarDays className="h-4 w-4" /> Subscribe to calendar</GhostButton>
				</div>
			</article>
		);
	}
	const facts = [
		[CalendarDays, formatLongDay(ev.start), `${formatTime(ev.start)} – ${formatTime(ev.end)} IST`],
		[MapPin, eventPlace(ev), ev.online ? 'Join from anywhere' : 'Venue shared with RSVPs'],
		[Users, ev.attendees > 0 ? `${ev.attendees}+ going` : 'RSVP open', ev.rsvpDeadline ? `RSVP closes ${formatDay(ev.rsvpDeadline)}` : 'Free, always'],
	];
	return (
		<article className="group relative flex flex-1 flex-col overflow-hidden rounded-[28px] bg-ink text-white shadow-paper">
			{ev.photo && (
				<div className="relative aspect-[16/8] overflow-hidden">
					<img {...photoProps(ev.photo, '(min-width: 1024px) 60vw, 100vw')} alt={ev.title} decoding="async" width="1024" height="576" className="h-full w-full bg-white/10 object-cover transition-transform [transition-duration:1200ms] group-hover:scale-105" />
					<div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
					<span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-tone-blue-deep">
						<Ticket className="h-3.5 w-3.5" /> {live ? 'Happening now' : `Upcoming · ${formatDay(ev.start)}`}
					</span>
				</div>
			)}
			<div className="relative flex flex-1 flex-col p-6 sm:p-8">
				<h3 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{ev.title}</h3>
				{ev.blurb && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">{ev.blurb}</p>}
				<div className="mt-6 grid gap-3 sm:grid-cols-3">
					{facts.map(([Icon, a, b]) => (
						<div key={a} className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
							<Icon className="h-5 w-5 text-[hsl(199_89%_70%)]" />
							<p className="mt-2 text-sm font-semibold">{a}</p>
							<p className="text-xs text-white/55">{b}</p>
						</div>
					))}
				</div>
				<div className="mt-6 flex flex-wrap gap-3">
					<a href={ev.url} target="_blank" rel="noreferrer" className="active-press inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-tone-blue-deep transition-transform hover:-translate-y-0.5">RSVP on Meetup <ArrowRight className="h-4 w-4" /></a>
					{ev.formUrl && <GhostButton light href={ev.formUrl} target="_blank" rel="noreferrer">Mandatory Google Form <ArrowUpRight className="h-4 w-4" /></GhostButton>}
					<GhostButton light href={googleCalendarUrl(ev)} target="_blank" rel="noreferrer"><CalendarDays className="h-4 w-4" /> Add to calendar</GhostButton>
				</div>
			</div>
		</article>
	);
}

function Meetups() {
	const saturday = [
		['9:00', 'Doors & check-in', 'RSVP + Google Form verified at the gate, laptops open.'],
		['9:30', 'Build, not slides', 'Live coding you follow along on your own machine.'],
		['11:30', 'Verify & demo', 'Run it, break it, fix it. Q&A with the hosts.'],
		['12:30', 'Hallway track', 'Study groups, collaborators and co-founders form here.'],
	];
	const { next: ev, live, past } = useEvents();
	const top = [...past].sort((a, b) => b.attendees - a.attendees).slice(0, 3);
	return (
		<section id="meetups" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
			<div aria-hidden="true" className="absolute right-[-20%] top-20 h-[600px] w-[600px] glow [--glow:hsl(213_100%_86%/0.9)]" />
			<div className="wrap relative">
				<div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
					<Reveal from="left">
						<SectionLabel n="01">Pillar one · AIYatra Meetups</SectionLabel>
						<h2 className="mt-5 max-w-3xl font-display text-5xl font-bold leading-[1.02] text-ink sm:text-6xl">
							Every Saturday, <span className="text-gradient">a room full of builders.</span>
						</h2>
						<p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/60">
							Free, in-person, hands-on. We take one idea, a paper, a model or a tool, and build it
							together from first principles until it runs on your laptop.
						</p>
					</Reveal>
					<Reveal from="right" delay={0.1}>
						<div className="flex flex-wrap gap-3">
							<PrimaryButton href={ev ? ev.url : MEETUP_URL} target="_blank" rel="noreferrer">{ev ? `RSVP for ${formatDay(ev.start)}` : 'Join on Meetup'} <ArrowRight className="h-4 w-4" /></PrimaryButton>
							<GhostButton href={CALENDAR_FEED_URL}><CalendarDays className="h-4 w-4" /> Subscribe to calendar</GhostButton>
						</div>
					</Reveal>
				</div>

				<div className="mt-14 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
					<Reveal from="left" className="flex">
						<EventSpotlight ev={ev} live={live} recent={past[0]} />
					</Reveal>

					<div className="flex flex-col gap-6">
						<Reveal from="right" delay={0.1}>
							<div className="rounded-[28px] border border-tone-blue-deep/10 bg-white p-6 shadow-paper-sm sm:p-7">
								<p className="text-xs font-semibold uppercase tracking-[0.22em] text-tone-blue-deep">A Saturday at AIYatra</p>
								<ol className="relative mt-5 space-y-5">
									<span aria-hidden="true" className="absolute bottom-2 left-[27px] top-2 w-px bg-gradient-to-b from-tone-blue-deep via-[hsl(199_89%_60%)] to-transparent" />
									{saturday.map(([time, title, body], i) => (
										<Reveal as="li" key={title} from="right" delay={0.15 + i * 0.08} className="relative flex gap-4">
											<span className="relative z-10 flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-2xl bg-tone-blue font-display text-sm font-bold text-tone-blue-deep">{time}</span>
											<span className="pt-1">
												<span className="block font-semibold text-ink">{title}</span>
												<span className="mt-0.5 block text-sm leading-relaxed text-ink/60">{body}</span>
											</span>
										</Reveal>
									))}
								</ol>
							</div>
						</Reveal>
						<Reveal from="up" delay={0.2}>
							<div className="rounded-[28px] bg-gradient-to-br from-tone-blue-deep to-[hsl(224_76%_33%)] p-6 text-white shadow-paper sm:p-7">
								<p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Biggest rooms so far</p>
								<ul className="mt-4 space-y-3">
									{top.map((e) => (
										<li key={e.id} className="flex items-center justify-between gap-4">
											<span className="text-sm font-medium text-white/85">{e.shortTitle}</span>
											<span className="font-display text-2xl font-bold">{e.attendees}</span>
										</li>
									))}
								</ul>
							</div>
						</Reveal>
					</div>
				</div>

				<PastEventsRail events={past} />
			</div>
		</section>
	);
}

/* ——— 02 · Ambassadors ——— */

function Ambassadors() {
	const perks = [
		{ icon: Users, title: 'Lead as a squad', body: 'A 3–6 member core team with a faculty mentor. Chapter, technical, research, community and project leads.' },
		{ icon: CalendarDays, title: 'A monthly rhythm', body: 'Concept circle, hands-on lab, guest session, then ship & publish. Every month.' },
		{ icon: Award, title: 'Recognition ladder', body: 'Explorer → Builder → Research Contributor → Chapter Lead → AIYatra Fellow.' },
		{ icon: MessagesSquare, title: 'Never alone', body: 'Starter kit, curriculum, research sprints, mentors, speaker pipeline and a stage.' },
	];
	const steps = [
		['Form', 'Bring together 3–6 serious students.'],
		['Align', 'Meet faculty and get campus approval.'],
		['Apply', 'Submit your chapter proposal to AIYatra.'],
		['Launch', 'Run your first session. Publish the outcome.'],
	];
	return (
		<section id="ambassadors" className="relative scroll-mt-20 overflow-hidden bg-paper-soft py-24 sm:py-32">
			<div aria-hidden="true" className="bg-grid mask-fade-y absolute inset-0 opacity-60" />
			<div className="wrap relative grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
				<Reveal from="left" className="order-2 lg:order-1">
					<div className="relative mx-auto aspect-square w-full max-w-[460px]">
						<div aria-hidden="true" className="spin-slow absolute inset-0 rounded-full border-2 border-dashed border-tone-blue-deep/20" />
						<div aria-hidden="true" className="spin-slower absolute inset-[9%] rounded-full border border-tone-blue-deep/15">
							<span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-tone-blue-deep shadow-[0_0_20px_hsl(221_83%_53%)]" />
							<span className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[hsl(199_89%_60%)]" />
						</div>
						<div className="absolute inset-[18%] overflow-hidden rounded-full bg-white p-3 shadow-paper">
							<img src={AMBASSADOR_CREST} alt="AIYatra Student Ambassador Program crest" loading="lazy" decoding="async" width="400" height="400" className="h-full w-full rounded-full object-cover" />
						</div>
						{[
							{ label: 'Learn', cls: 'left-0 top-[12%]', from: 'left' },
							{ label: 'Build', cls: 'right-0 top-[22%]', from: 'right' },
							{ label: 'Research', cls: 'bottom-[10%] left-[4%]', from: 'up' },
							{ label: 'Lead', cls: 'bottom-[18%] right-[2%]', from: 'right' },
						].map((b, i) => (
							<Reveal key={b.label} from={b.from} delay={0.3 + i * 0.1} className={`absolute ${b.cls}`}>
								<span className="float-soft inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-paper-sm" style={{ animationDelay: `${i * -1.5}s` }}>
									<span className="h-2 w-2 rounded-full bg-tone-blue-deep" /> {b.label}
								</span>
							</Reveal>
						))}
					</div>
				</Reveal>

				<div className="order-1 lg:order-2">
					<Reveal from="right">
						<SectionLabel n="02">Pillar two · Student Ambassador Program</SectionLabel>
						<h2 className="mt-5 font-display text-5xl font-bold leading-[1.02] text-ink sm:text-6xl">
							Turn your campus into an <span className="text-gradient">AI builder chapter.</span>
						</h2>
						<p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/60">
							For B.Tech & M.Sc students ready to do more than attend AI events. Not a certificate, a mission:
							a 9-month journey from learner to chapter leader, judged on output, not attendance.
						</p>
					</Reveal>
					<div className="mt-9 grid gap-4 sm:grid-cols-2">
						{perks.map((p, i) => (
							<Reveal key={p.title} from={i % 2 ? 'right' : 'up'} delay={0.1 + i * 0.07}>
								<div className="hover-lift flex h-full gap-4 rounded-2xl border border-tone-blue-deep/10 bg-white p-5">
									<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tone-blue text-tone-blue-deep"><p.icon className="h-5 w-5" /></span>
									<span>
										<span className="block font-semibold text-ink">{p.title}</span>
										<span className="mt-1 block text-sm leading-relaxed text-ink/60">{p.body}</span>
									</span>
								</div>
							</Reveal>
						))}
					</div>
					<Reveal from="up" delay={0.2}>
						<ol className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
							{steps.map(([t, b], i) => (
								<li key={t} className="relative rounded-2xl bg-white/70 p-4 ring-1 ring-tone-blue-deep/10">
									<span className="font-display text-sm font-bold text-tone-blue-deep">Step {i + 1}</span>
									<span className="mt-1 block font-semibold text-ink">{t}</span>
									<span className="mt-1 block text-sm leading-relaxed text-ink/60">{b}</span>
								</li>
							))}
						</ol>
					</Reveal>
					<Reveal from="up" delay={0.3}>
						<div className="mt-9 flex flex-wrap gap-3">
							<PrimaryButton href={APPLY_MAIL}>Submit chapter proposal <Mail className="h-4 w-4" /></PrimaryButton>
							<GhostButton to="/ambassadors">Program details <ArrowRight className="h-4 w-4" /></GhostButton>
							<GhostButton href={DECKS.ambassador} download><Download className="h-4 w-4" /> Deck</GhostButton>
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}

/* ——— 03 · Labs ——— */

function Labs() {
	const spot = useSpotlight();
	const featured = LABS_CATEGORIES.flatMap((c) => c.papers.slice(0, 3).map((p) => ({ ...p, track: c.short || c.title })));
	return (
		<section id="labs" className="relative scroll-mt-20 overflow-hidden bg-ink py-24 text-white sm:py-32">
			<div aria-hidden="true" className="absolute inset-0 opacity-60"><NeuralField density={0.00006} /></div>
			<div aria-hidden="true" className="pointer-events-none absolute -left-40 top-1/3 h-[500px] w-[500px] glow [--glow:hsl(221_83%_53%/0.45)]" />
			<div aria-hidden="true" className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] glow [--glow:hsl(199_89%_60%/0.32)]" />
			<div className="wrap relative">
				<div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
					<Reveal from="down">
						<SectionLabel n="03" light>Pillar three · AIYatra Research Labs</SectionLabel>
						<h2 className="mt-5 max-w-3xl font-display text-5xl font-bold leading-[1.02] sm:text-6xl">
							Read the papers. <span className="bg-gradient-to-r from-white via-[hsl(199_89%_70%)] to-white bg-clip-text text-transparent">Build the future.</span>
						</h2>
						<p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/60">
							Four open research tracks, each with a curated shelf of {LABS_TOTAL_PAPERS} arXiv papers. We study them,
							reimplement them on Saturdays, and publish the code in the open.
						</p>
					</Reveal>
					<Reveal from="right" delay={0.1}>
						<div className="flex flex-wrap gap-3">
							<Link to="/labs" className="active-press inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-tone-blue-deep transition-transform hover:-translate-y-0.5">Enter the lab <ArrowRight className="h-4 w-4" /></Link>
							<GhostButton light href={GITHUB_URL} target="_blank" rel="noreferrer"><Github className="h-4 w-4" /> GitHub</GhostButton>
						</div>
					</Reveal>
				</div>

				<div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
					{LABS_CATEGORIES.map((c, i) => {
						const Icon = TRACK_ICONS[c.id] || FlaskConical;
						return (
							<Reveal key={c.id} from={['left', 'up', 'down', 'right'][i % 4]} delay={i * 0.08} className="flex">
								<Link
									to={`/labs#${c.id}`}
									onMouseMove={spot}
									className="spotlight group flex flex-1 flex-col rounded-[24px] bg-white/[0.05] p-6 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.09] hover:ring-white/25"
								>
									<div className="flex items-center justify-between">
										<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[hsl(199_89%_70%)] transition-transform duration-500 group-hover:scale-110 group-hover:bg-white group-hover:text-tone-blue-deep"><Icon className="h-6 w-6" /></span>
										<span className="font-display text-3xl font-bold text-white/15">{c.index}</span>
									</div>
									<h3 className="mt-5 font-display text-2xl font-bold leading-tight">{c.title}</h3>
									<p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-white/55">{c.blurb}</p>
									<span className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm font-semibold">
										<span className="text-white/70">{c.papers.length} papers</span>
										<span className="inline-flex items-center gap-1 text-[hsl(199_89%_70%)]">Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
									</span>
								</Link>
							</Reveal>
						);
					})}
				</div>

				<Reveal from="up" delay={0.1}>
					<p className="mt-16 text-xs font-semibold uppercase tracking-[0.24em] text-white/45">On the shelf right now</p>
				</Reveal>
			</div>
			<div className="marquee-pause mask-fade-x relative mt-5 overflow-hidden">
				<div className="marquee-track marquee-slow flex w-max gap-4 px-2">
					{[...featured, ...featured].map((p, i) => (
						<a key={i} href={`https://arxiv.org/abs/${p.arxivId}`} target="_blank" rel="noreferrer" tabIndex={i < featured.length ? 0 : -1} className="w-[320px] shrink-0 rounded-2xl bg-white/[0.05] p-5 ring-1 ring-white/10 transition-colors hover:bg-white/10">
							<span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(199_89%_70%)]">{p.track} · {p.year}</span>
							<span className="mt-2 line-clamp-2 block font-semibold leading-snug">{p.title}</span>
							<span className="mt-2 block text-xs text-white/45">arXiv:{p.arxivId}</span>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}

/* ——— Community ——— */

function Community() {
	const half = Math.ceil(testimonials.length / 2);
	const rows = [testimonials.slice(0, half), testimonials.slice(half)];
	return (
		<section id="community" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
			<div className="wrap">
				<div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
					<Reveal from="left">
						<SectionLabel>The people</SectionLabel>
						<h2 className="mt-5 max-w-3xl font-display text-5xl font-bold leading-[1.02] text-ink sm:text-6xl">
							Run by volunteers. <span className="text-gradient">Owned by everyone.</span>
						</h2>
					</Reveal>
					<Reveal from="right" delay={0.1}>
						<div className="inline-flex items-center gap-3 rounded-full bg-tone-blue px-5 py-3">
							<span className="flex">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-4 w-4 fill-tone-blue-deep text-tone-blue-deep" />)}</span>
							<span className="text-sm font-semibold text-ink">{GROUP_STATS.rating} from {GROUP_STATS.ratingsCount} ratings on Meetup</span>
						</div>
					</Reveal>
				</div>

				<div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
					{ORGANIZERS.map((o, i) => (
						<Reveal key={o.name} from={i < 2 ? 'left' : 'right'} delay={i * 0.08} className="flex">
							<div className="hover-lift group flex flex-1 flex-col rounded-[24px] border border-tone-blue-deep/10 bg-white p-6 shadow-paper-sm">
								<div className="relative h-20 w-20">
									<span aria-hidden="true" className="absolute -inset-1 rounded-full bg-gradient-to-br from-tone-blue-deep to-[hsl(199_89%_60%)] opacity-0 blur transition-opacity duration-500 group-hover:opacity-70" />
									<img src={o.photo} alt={o.name} loading="lazy" decoding="async" width="80" height="80" className="relative h-20 w-20 rounded-full object-cover ring-4 ring-white" />
								</div>
								<p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-tone-blue-deep">{o.role}</p>
								<p className="mt-1 font-display text-xl font-bold text-ink">{o.name}</p>
								<p className="mt-2 flex-1 text-sm leading-relaxed text-ink/60">{o.body}</p>
								{o.link && (
									<a href={o.link} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-tone-blue-deep hover:underline">My app <ArrowUpRight className="h-4 w-4" /></a>
								)}
							</div>
						</Reveal>
					))}
				</div>
			</div>

			<div className="mask-fade-x mt-16 space-y-5">
				{rows.map((row, r) => (
					<div key={r} className="marquee-pause overflow-hidden">
						<div className={`${r === 0 ? 'marquee-track' : 'marquee-track-reverse'} marquee-slow flex w-max gap-5 px-2`}>
							{[...row, ...row, ...row, ...row].map((t, i) => (
								<figure key={i} className="flex w-[360px] shrink-0 flex-col rounded-[24px] border border-tone-blue-deep/10 bg-gradient-to-br from-white to-paper-soft p-6">
									<Quote className="h-6 w-6 text-tone-blue-deep/40" />
									<blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-ink/80">“{t.quote}”</blockquote>
									<figcaption className="mt-4 flex items-center gap-3 border-t border-tone-blue-deep/10 pt-4">
										<span className="flex h-9 w-9 items-center justify-center rounded-full bg-tone-blue font-display text-sm font-bold text-tone-blue-deep">{t.name[0]}</span>
										<span>
											<span className="block text-sm font-semibold text-ink">{t.name}</span>
											<span className="block text-xs text-ink/50">{t.role}</span>
										</span>
									</figcaption>
								</figure>
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

/* ——— Quick answers ——— */

function QuickAnswers() {
	return (
		<section id="faq" className="scroll-mt-20 bg-paper-soft py-24 sm:py-28">
			<div className="wrap">
				<Reveal from="zoom" className="text-center">
					<SectionLabel>Quick answers</SectionLabel>
					<h2 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">Everything you need, in one glance.</h2>
				</Reveal>
				<div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{FAQ.map((f, i) => (
						<Reveal key={f.q} from={['left', 'up', 'right'][i % 3]} delay={(i % 3) * 0.08} className="flex">
							<div className="hover-lift flex flex-1 gap-4 rounded-2xl border border-tone-blue-deep/10 bg-white p-6">
								<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-tone-blue-deep to-[hsl(199_89%_60%)] text-white"><f.icon className="h-5 w-5" /></span>
								<span>
									<span className="block font-display text-lg font-bold text-ink">{f.q}</span>
									<span className="mt-1 block text-sm leading-relaxed text-ink/60">{f.a}</span>
								</span>
							</div>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}

function FinalCta() {
	return (
		<section className="relative overflow-hidden py-24 sm:py-32">
			<Aurora />
			<div className="wrap-narrow relative">
				<Reveal from="zoom">
					<div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-tone-blue-deep via-[hsl(224_76%_40%)] to-ink px-6 py-16 text-center text-white shadow-paper sm:px-12 sm:py-20">
						<div aria-hidden="true" className="absolute inset-0 opacity-50"><NeuralField density={0.00012} /></div>
						<img src={AI_YATRA_LOGO} alt="" aria-hidden="true" className="relative mx-auto h-20 w-20 rounded-3xl bg-white object-contain p-3" />
						<h2 className="relative mx-auto mt-8 max-w-3xl font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
							Your AI journey starts with a single RSVP.
						</h2>
						<p className="relative mx-auto mt-5 max-w-xl text-lg text-white/70">
							Join {GROUP_STATS.members.toLocaleString()} learners building AI in the open. One Saturday, one project, one breakthrough at a time.
						</p>
						<div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
							<a href={MEETUP_URL} target="_blank" rel="noreferrer" className="active-press inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-tone-blue-deep transition-transform hover:-translate-y-0.5">Join on Meetup <ArrowRight className="h-4 w-4" /></a>
							<GhostButton light to="/ambassadors"><GraduationCap className="h-4 w-4" /> Ambassadors</GhostButton>
							<GhostButton light to="/labs"><FlaskConical className="h-4 w-4" /> Labs</GhostButton>
							<GhostButton light href={DECKS.journey} download><Globe className="h-4 w-4" /> Our story</GhostButton>
						</div>
					</div>
				</Reveal>
			</div>
		</section>
	);
}

function eventJsonLd(events) {
	return JSON.stringify({
		'@context': 'https://schema.org',
		'@graph': events.map((e) => ({
			'@type': 'Event',
			name: e.title,
			description: e.blurb || e.title,
			startDate: new Date(e.start).toISOString(),
			endDate: new Date(e.end).toISOString(),
			eventStatus: 'https://schema.org/EventScheduled',
			eventAttendanceMode: e.online ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
			location: e.online
				? { '@type': 'VirtualLocation', url: e.url }
				: { '@type': 'Place', name: GROUP_STATS.venue, address: GROUP_STATS.venue },
			image: e.photo ? [e.photo] : undefined,
			url: e.url,
			isAccessibleForFree: true,
			offers: { '@type': 'Offer', price: 0, priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: e.url },
			organizer: { '@type': 'Organization', name: 'AIYatra', url: 'https://aiyatra.io/' },
		})),
	});
}

export default function HomePage() {
	const upcoming = upcomingEvents();
	return (
		<div className="min-h-screen bg-white text-ink antialiased">
			<Helmet>
				<title>AIYatra — Open-Source AI Community | Meetups, Student Ambassadors & Research Labs</title>
				<meta
					name="description"
					content="AIYatra is an open-source AI community from Hyderabad with three pillars: free hands-on meetups every Saturday, a Student Ambassador Program for every campus, and AIYatra Research Labs. Join 5,052 members. Free, forever."
				/>
				{upcoming.length > 0 && <script type="application/ld+json">{eventJsonLd(upcoming)}</script>}
			</Helmet>
			<Header />
			<main id="main">
				<Intro />
				<IntroSheet>
				<Hero />
				<TopicStream />
				<Meetups />
				<Ambassadors />
				<Labs />
				<Community />
				<QuickAnswers />
				<FinalCta />
				</IntroSheet>
			</main>
			<Footer />
		</div>
	);
}
