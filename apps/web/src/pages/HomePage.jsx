import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import {
	ArrowRight, ArrowUpRight, CalendarDays, MapPin, Users, Star, Sparkles,
	Quote, Compass, Ticket, Clock, Building2, Github, Linkedin, Mail,
	MessageCircle, Heart, Camera, BookOpen, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import CountUp from '@/components/CountUp';
import {
	MEETUP_URL, PAST_EVENTS_URL, EVENT_URL, AI_YATRA_LOGO, EVENTS,
	PAST_EVENTS, GROUP_STATS, COMMUNITY_FACES, HOST_PHOTO,
} from '@/data/site';

// Every section on this page uses the same `.wrap` shell (max 1480px +
// fluid 6vw gutters, OpenShut-style) so nothing feels narrow-centered in one
// place and full-bleed in another.

const testimonials = [
	{
		quote: 'I walked in knowing nothing about transformers and walked out having built attention from scratch. No gatekeeping, no jargon walls — just patient, brilliant teaching.',
		name: 'Priya S.',
		role: 'Data Analyst → ML Engineer',
		tone: 'bg-tone-blue',
	},
	{
		quote: 'The agentic AI workshop was the best Saturday I have spent in years. We built a coding agent on our own machines, no API keys, and it actually worked.',
		name: 'Rahul K.',
		role: 'Backend Engineer',
		tone: 'bg-tone-green',
	},
	{
		quote: 'As a student, most AI events felt out of reach. AIYatra is free, welcoming, and genuinely deep — the linear algebra session finally made the math click for me.',
		name: 'Sai Rishita M.',
		role: 'CS Undergraduate',
		tone: 'bg-tone-yellow',
	},
	{
		quote: 'You come for the sessions and stay for the people. I found my co-founder, my study group, and my confidence here. This community changes trajectories.',
		name: 'Kiran K.',
		role: 'Founder, AI Startup',
		tone: 'bg-tone-coral',
	},
	{
		quote: 'Every meetup ends with something running on my laptop. That hands-on rhythm is rare in India — AIYatra gets it exactly right.',
		name: 'Ananya R.',
		role: 'ML Practitioner',
		tone: 'bg-tone-violet',
	},
	{
		quote: 'The volunteers explain until it clicks. I asked the “dumb” questions about backprop and walked out finally understanding gradients.',
		name: 'Vikram J.',
		role: 'Transitioning into AI',
		tone: 'bg-tone-blue',
	},
];

const essentials = [
	{ icon: MapPin, label: 'Where', value: 'LSEG, International Tech Park, Madhapur, Hyderabad' },
	{ icon: CalendarDays, label: 'When', value: 'Saturdays · mornings, IST' },
	{ icon: Ticket, label: 'Cost', value: 'Free, always — learning should be' },
	{ icon: Building2, label: 'Bring', value: 'A laptop, Python 3.10+, and curiosity' },
];

function Logo() {
	// Local transparent mark (public/aiyatra-mark.png, cut from the brand
	// artwork) plus a typeset wordmark — crisp at any size, no white box,
	// and the ink text melts into the paper theme on every background.
	return (
		<span className="flex items-center gap-2.5">
			<img
				src={AI_YATRA_LOGO}
				alt=""
				aria-hidden="true"
				className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"
			/>
			<span className="flex flex-col leading-none">
				<span className="text-[22px] font-extrabold tracking-tight text-ink sm:text-2xl">
					AI Yatra
				</span>
				<span className="mt-1 hidden text-[10px] font-bold uppercase tracking-[0.22em] text-ink/55 sm:block">
					Research · Build · Transform
				</span>
			</span>
		</span>
	);
}

function Header() {
	return (
		<header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/95 backdrop-blur-sm">
			<div className="wrap flex h-[76px] items-center justify-between gap-5">
				<a href="#top" className="flex shrink-0 items-center" aria-label="AI Yatra home">
					<Logo />
				</a>
				<nav className="hidden items-center gap-7 text-sm font-medium text-ink md:flex">
					<a href="#events" className="transition-colors hover:text-tone-blue-deep">Events</a>
					<a href="#moments" className="transition-colors hover:text-tone-blue-deep">Moments</a>
					<a href="#method" className="transition-colors hover:text-tone-blue-deep">The Method</a>
					<a href="#voices" className="transition-colors hover:text-tone-blue-deep">Voices</a>
					<a href="#about" className="transition-colors hover:text-tone-blue-deep">About</a>
				</nav>
				<a
					href={MEETUP_URL}
					target="_blank"
					rel="noreferrer"
					className="active-press inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border-2 border-ink bg-tone-blue-deep px-4 text-sm font-semibold text-paper shadow-paper-sm transition-transform hover:-translate-y-0.5"
				>
					Join on Meetup <ArrowUpRight className="h-4 w-4" />
				</a>
			</div>
		</header>
	);
}

function HeroCard() {
	return (
		<div className="rounded-2xl border-2 border-ink bg-paper-soft p-6 shadow-paper sm:p-7">
			<div className="flex items-center justify-between gap-3">
				<span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-tone-blue-deep px-3 py-1 text-xs font-semibold text-paper">
					<Ticket className="h-3.5 w-3.5" /> Next meetup
				</span>
				<span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-tone-blue-deep">
					<span className="h-2 w-2 animate-pulse rounded-full bg-tone-coral" /> RSVP open
				</span>
			</div>

			<h3 className="mt-5 font-hand text-4xl font-bold leading-[1.05] sm:text-5xl">{EVENTS.agenticAi.shortTitle}</h3>
			<p className="mt-2 text-base font-medium text-ink-soft">{EVENTS.agenticAi.blurb}</p>

			<div className="mt-5 grid grid-cols-2 gap-3">
				<div className="rounded-xl border-2 border-ink bg-tone-blue p-3.5">
					<p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/60">
						<CalendarDays className="h-3.5 w-3.5" /> When
					</p>
					<p className="mt-1.5 text-sm font-bold leading-snug">Sat, Sep 5<br />9:00 AM IST</p>
				</div>
				<div className="rounded-xl border-2 border-ink bg-tone-green p-3.5">
					<p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/60">
						<Users className="h-3.5 w-3.5" /> Attending
					</p>
					<p className="mt-1.5 text-sm font-bold leading-snug">{EVENTS.agenticAi.attendees} learners<br />& counting</p>
				</div>
			</div>

			<ul className="mt-4 space-y-2">
				{[
					'The agent loop — the core inside Claude Code & Codex',
					'Tools, planning & self-repair in pure Python',
					'Guardrails & sandboxing — 100% offline',
				].map((t, i) => (
					<li key={i} className="flex items-start gap-2.5 text-sm font-medium text-ink/80">
						<span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-tone-yellow text-[11px] font-bold">
							{i + 1}
						</span>
						<span>{t}</span>
					</li>
				))}
			</ul>

			<a
				href={EVENT_URL}
				target="_blank"
				rel="noreferrer"
				className="active-press mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-ink bg-tone-blue-deep px-5 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
			>
				RSVP now <ArrowRight className="h-4 w-4" />
			</a>
		</div>
	);
}

function Hero() {
	return (
		<section id="top" className="relative overflow-hidden">
			<div className="wrap grid gap-12 pb-14 pt-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-[clamp(50px,6vw,110px)] lg:pb-16 lg:pt-[74px]">
				<div>
					<Reveal>
						<span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-tone-yellow px-4 py-1.5 text-sm font-semibold shadow-paper-sm">
							<Sparkles className="h-4 w-4" /> Democratizing AI Learning
						</span>
					</Reveal>
					<Reveal delay={0.08}>
						<h1 className="mt-6 font-hand text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-[5.2rem]">
							Research. Build.<br />
							<span className="text-tone-blue-deep underline decoration-tone-coral decoration-4 underline-offset-8">Transform.</span>
						</h1>
					</Reveal>
					<Reveal delay={0.16}>
						<p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
							AIYatra is Hyderabad's open AI community — a place where beginners and experts share knowledge,
							ship real projects, and master machine learning together. No paywalls, no prerequisites.
							Just curiosity and a laptop.
						</p>
					</Reveal>
					<Reveal delay={0.24}>
						<div className="mt-8 flex flex-wrap items-center gap-4">
							<a
								href={EVENT_URL}
								target="_blank"
								rel="noreferrer"
								className="active-press inline-flex h-12 items-center gap-2 rounded-xl border-2 border-ink bg-tone-blue-deep px-6 text-base font-semibold text-paper shadow-paper transition-transform hover:-translate-y-0.5"
							>
								RSVP to the next meetup <ArrowRight className="h-5 w-5" />
							</a>
							<a
								href="#events"
								className="active-press inline-flex h-12 items-center gap-2 rounded-xl border-2 border-ink bg-paper-soft px-6 text-base font-semibold text-ink shadow-paper transition-transform hover:-translate-y-0.5"
							>
								Explore past events
							</a>
						</div>
					</Reveal>
					<Reveal delay={0.32}>
						<div className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t-2 border-dashed border-ink/30 pt-6">
							{[
								{ value: GROUP_STATS.members, suffix: '', label: 'Community members' },
								{ value: GROUP_STATS.eventsHosted, suffix: '', label: 'Events hosted' },
								{ value: GROUP_STATS.rating, suffix: '★', label: `From ${GROUP_STATS.ratingsCount} ratings`, decimals: 1 },
							].map((s) => (
								<div key={s.label}>
									<p className="font-hand text-4xl font-bold">
										<CountUp value={s.value} decimals={s.decimals || 0} suffix={s.suffix} />
									</p>
									<p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">{s.label}</p>
								</div>
							))}
						</div>
					</Reveal>
				</div>
				<Reveal delay={0.2} y={32}>
					<HeroCard />
				</Reveal>
			</div>
		</section>
	);
}

function EventCard({ event, tone }) {
	return (
		<article className="hover-lift flex h-full flex-col overflow-hidden rounded-2xl border-2 border-ink bg-paper-soft shadow-paper-sm">
			<div className="relative aspect-[16/9] overflow-hidden border-b-2 border-ink bg-tone-blue/30">
				<img
					src={event.photo}
					alt={event.title}
					loading="lazy"
					className="h-full w-full object-cover"
				/>
				<span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border-2 border-ink ${tone} px-3 py-1 text-[11px] font-bold uppercase tracking-wide`}>
					{event.status === 'upcoming' ? <Ticket className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
					{event.status === 'upcoming' ? 'Upcoming' : 'Past event'}
				</span>
			</div>
			<div className="flex flex-1 flex-col p-6">
				<h3 className="font-hand text-3xl font-bold leading-tight">{event.shortTitle}</h3>
				<p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-ink/75">{event.blurb}</p>
				<div className="mt-5 space-y-1.5 border-t-2 border-dashed border-ink/30 pt-4 text-sm font-semibold">
					<p className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {event.date}</p>
					<p className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {event.attendees} {event.status === 'upcoming' ? 'going' : 'attended'}</p>
				</div>
				<a
					href={event.url}
					target="_blank"
					rel="noreferrer"
					className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold underline underline-offset-4 hover:text-tone-blue-deep"
				>
					{event.status === 'upcoming' ? 'RSVP on Meetup' : 'See the meetup'} <ArrowUpRight className="h-4 w-4" />
				</a>
			</div>
		</article>
	);
}

const cardTones = ['bg-tone-green', 'bg-tone-violet', 'bg-tone-blue', 'bg-tone-yellow', 'bg-tone-coral', 'bg-tone-violet'];

const PAST_PAGE_SIZE = 3;

function PastEventsCarousel() {
	const totalPages = Math.max(1, Math.ceil(PAST_EVENTS.length / PAST_PAGE_SIZE));
	const [page, setPage] = useState(0);
	const goPrev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
	const goNext = () => setPage((p) => (p + 1) % totalPages);
	const start = page * PAST_PAGE_SIZE;
	const visible = PAST_EVENTS.slice(start, start + PAST_PAGE_SIZE);

	return (
		<div className="mt-10">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<p className="text-sm font-bold uppercase tracking-[0.2em] text-ink/55">
					Past sessions · {page + 1} / {totalPages}
				</p>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={goPrev}
						aria-label="Show previous three past events"
						className="active-press inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-paper-soft shadow-paper-sm transition-transform hover:-translate-y-0.5"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
					<button
						type="button"
						onClick={goNext}
						aria-label="Show next three past events"
						className="active-press inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-paper-soft shadow-paper-sm transition-transform hover:-translate-y-0.5"
					>
						<ChevronRight className="h-5 w-5" />
					</button>
				</div>
			</div>

			<div className="mt-6 grid items-stretch gap-6 md:grid-cols-3">
				{visible.map((e) => {
					const absoluteIndex = PAST_EVENTS.findIndex((e2) => e2.id === e.id);
					return (
						<Reveal key={e.id} className="h-full" delay={(absoluteIndex % 3) * 0.08}>
							<EventCard event={e} tone={cardTones[absoluteIndex % cardTones.length]} />
						</Reveal>
					);
				})}
			</div>

			<div className="mt-6 flex items-center justify-center gap-2">
				{Array.from({ length: totalPages }).map((_, i) => (
					<button
						key={i}
						type="button"
						onClick={() => setPage(i)}
						aria-label={`Go to past events page ${i + 1}`}
						className={`h-2.5 rounded-full border-2 border-ink transition-all ${i === page ? 'w-8 bg-tone-yellow' : 'w-2.5 bg-paper-soft hover:bg-tone-blue'}`}
					/>
				))}
			</div>
		</div>
	);
}

function Events() {
	return (
		<section id="events" className="bg-tone-blue/30">
			<div className="wrap pb-16 pt-8">
				<PastEventsCarousel />

				<Reveal delay={0.1}>
					<div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-ink bg-paper-soft p-6">
						<div className="flex items-center gap-3">
							<span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-tone-yellow">
								<Compass className="h-5 w-5" />
							</span>
							<div>
								<p className="font-hand text-2xl font-bold leading-tight">The full archive lives on Meetup.</p>
								<p className="text-sm font-medium text-ink/70">Photos, discussions, ratings and RSVPs — straight from the source.</p>
							</div>
						</div>
						<a
							href={PAST_EVENTS_URL}
							target="_blank"
							rel="noreferrer"
							className="active-press inline-flex h-11 items-center gap-2 rounded-xl border-2 border-ink bg-paper px-5 text-sm font-bold shadow-paper-sm transition-transform hover:-translate-y-0.5"
						>
							View all on Meetup <ArrowUpRight className="h-4 w-4" />
						</a>
					</div>
				</Reveal>
			</div>
		</section>
	);
}

function Moments() {
	return (
		<section id="moments" className="border-y-2 border-ink bg-paper-soft">
			<div className="wrap py-20">
				<Reveal>
					<p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-tone-blue-deep">
						<Camera className="h-4 w-4" /> Moments from the yatra
					</p>
					<h2 className="mt-3 font-hand text-5xl font-bold leading-tight sm:text-6xl">
						Real rooms. Real laptops.<br />Real people.
					</h2>
					<p className="mt-4 max-w-2xl text-lg text-ink-soft">
						{PAST_EVENTS.length} hands-on sessions since {GROUP_STATS.city.split(',')[0]} — the numbers tell the story
						of rooms at {GROUP_STATS.venue} where {GROUP_STATS.members.toLocaleString()} members learn together.
					</p>
				</Reveal>

				<div className="mt-10 grid items-stretch gap-6 md:grid-cols-3">
					<Reveal className="flex">
						<div className="flex flex-1 flex-col rounded-2xl border-2 border-ink bg-tone-yellow p-6 shadow-paper-sm">
							<p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">
								<Users className="h-4 w-4" /> Biggest rooms so far
							</p>
							<ul className="mt-4 flex-1 space-y-3">
								{[...PAST_EVENTS].sort((a, b) => b.attendees - a.attendees).slice(0, 3).map((e, i) => (
									<li key={e.id} className="rounded-xl border-2 border-ink bg-paper-soft px-4 py-3">
										<p className="flex items-baseline justify-between gap-2">
											<span className="text-sm font-bold leading-tight">{e.shortTitle}</span>
											<span className="shrink-0 font-hand text-2xl font-bold">{e.attendees}</span>
										</p>
										<p className="mt-0.5 text-xs font-semibold text-ink/60">#{i + 1} by turnout · {e.date}</p>
									</li>
								))}
							</ul>
							<p className="mt-4 border-t-2 border-dashed border-ink/30 pt-3 text-xs font-semibold text-ink/60">
								Attendance as listed on Meetup at the time of publishing.
							</p>
						</div>
					</Reveal>
					<Reveal delay={0.08} className="flex">
						<div className="flex flex-1 flex-col rounded-2xl border-2 border-ink bg-paper p-6 shadow-paper-sm">
							<p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">
								<BookOpen className="h-4 w-4" /> Learning tracks
							</p>
							<ul className="mt-4 flex-1 space-y-3 text-sm font-medium leading-relaxed text-ink/80">
								<li className="rounded-xl border border-ink/50 bg-paper-soft px-4 py-3">
									<span className="font-bold text-ink">Foundations.</span> Transformer paper → code,
									linear algebra → attention, PyTorch tensors → training loop.
								</li>
								<li className="rounded-xl border border-ink/50 bg-paper-soft px-4 py-3">
									<span className="font-bold text-ink">Agents.</span> Goose end-to-end demo, DeepSeek-V3
									architecture, and the Sep 5 coding-agent build.
								</li>
								<li className="rounded-xl border border-ink/50 bg-paper-soft px-4 py-3">
									<span className="font-bold text-ink">Reading room.</span> A four-part evening series through
									the Hitchhiker's Guide to Agentic AI, Jun 30 – Jul 14.
								</li>
							</ul>
						</div>
					</Reveal>
					<Reveal delay={0.16} className="flex">
						<div className="flex flex-1 flex-col rounded-2xl border-2 border-ink bg-tone-green p-6 shadow-paper-sm">
							<p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">
								<CalendarDays className="h-4 w-4" /> What a Saturday looks like
							</p>
							<ol className="mt-4 flex-1 space-y-3">
								{[
									['9:00 — Doors & check-in', 'RSVP plus the event Google form at the LSEG gate, then laptops open.'],
									['Morning — Build, not slides', 'Live coding you follow along: tensors, attention, agent loops — running on your machine.'],
									['Close — Verify & network', 'Demos, Q&A, and the hallway track where study groups and teams form.'],
								].map(([title, body], i) => (
									<li key={title} className="flex items-start gap-3">
										<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper-soft text-xs font-bold">
											{i + 1}
										</span>
										<span>
											<span className="block text-sm font-bold leading-tight">{title}</span>
											<span className="mt-0.5 block text-sm font-medium leading-relaxed text-ink/75">{body}</span>
										</span>
									</li>
								))}
							</ol>
							<p className="mt-4 border-t-2 border-dashed border-ink/30 pt-3 text-xs font-semibold text-ink/60">
								Mornings IST · {GROUP_STATS.venue} · Free, always.
							</p>
						</div>
					</Reveal>
				</div>

				<Reveal delay={0.1}>
					<div className="mt-10 rounded-2xl border-2 border-ink bg-paper p-6 shadow-paper-sm sm:p-8">
						<p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/55">
							<Users className="h-4 w-4" /> Organizers
						</p>
						<p className="mt-2 font-hand text-3xl font-bold">The people who run the yatra</p>
						<p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-ink/70">
							A small volunteer crew plans the curriculum, hosts every Saturday session at LSEG Madhapur,
							reviews RSVPs, and mentors newcomers — so every meetup stays hands-on, free, and welcoming.
						</p>
						<div className="mt-6 grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
							<div className="flex flex-col rounded-xl border-2 border-ink bg-tone-yellow p-5">
								<div className="flex items-center gap-4">
									<img
										src={COMMUNITY_FACES[0].photo}
										alt={COMMUNITY_FACES[0].name}
										loading="lazy"
										className="h-16 w-16 shrink-0 rounded-full border-2 border-ink object-cover shadow-paper-sm"
									/>
									<div className="min-w-0">
										<p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">Super Organizer</p>
										<p className="mt-1 text-lg font-bold leading-tight">Khaja Moinuddin Mohammed</p>
									</div>
								</div>
								<p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-ink/75">
									Founder of the group. Sets the learning arc across sessions, hosts the Saturday meetups,
									and keeps the bar high on depth — from linear algebra to agentic coding harnesses.
								</p>
							</div>
							<div className="flex flex-col rounded-xl border-2 border-ink bg-tone-green p-5">
								<div className="flex items-center gap-4">
									<img
										src={COMMUNITY_FACES[1].photo}
										alt={COMMUNITY_FACES[1].name}
										loading="lazy"
										className="h-16 w-16 shrink-0 rounded-full border-2 border-ink object-cover shadow-paper-sm"
									/>
									<div className="min-w-0">
										<p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">Co-organizer & Host</p>
										<p className="mt-1 text-lg font-bold leading-tight">Azeez Syed</p>
									</div>
								</div>
								<p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-ink/75">
									Co-hosts sessions and keeps the room running — demos, hands-on labs, Q&A, and
									making sure no learner leaves stuck.
								</p>
							</div>
							<div className="flex flex-col rounded-xl border-2 border-ink bg-tone-blue p-5">
								<div className="flex items-center gap-4">
									<img
										src={HOST_PHOTO}
										alt="Jagadeeswara Reddy"
										loading="lazy"
										className="h-16 w-16 shrink-0 rounded-full border-2 border-ink object-cover shadow-paper-sm"
									/>
									<div className="min-w-0">
										<p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">Host & Educator</p>
										<p className="mt-1 text-lg font-bold leading-tight">Jagadeeswara Reddy</p>
									</div>
								</div>
								<p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-ink/75">
									Hosts sessions and leads talks on educational material — turning dense topics into
									clear, hands-on learning the community can actually use.
								</p>
							</div>
						</div>
						<a href={MEETUP_URL} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold underline underline-offset-4 hover:text-tone-blue-deep">
							Message the organizers on Meetup <ArrowUpRight className="h-4 w-4" />
						</a>
					</div>
				</Reveal>
			</div>
		</section>
	);
}

const methodSteps = [
	{
		n: '01',
		kicker: 'Research',
		title: 'Research',
		body: 'We read the papers, trace the math, and ask the naive questions out loud — so nobody has to pretend they already know.',
		tone: 'bg-tone-violet',
	},
	{
		n: '02',
		kicker: 'Build',
		title: 'Build',
		body: 'Laptops open, code on screen. Every session ships something real — a training loop, an agent harness, a working demo.',
		tone: 'bg-tone-green',
	},
	{
		n: '03',
		kicker: 'Transform',
		title: 'Transform',
		body: 'Skills become careers, side projects become products, and strangers become collaborators. That is the yatra — the journey.',
		tone: 'bg-tone-coral',
	},
];

function Method() {
	return (
		<section id="method" className="bg-ink text-paper">
			<div className="wrap py-20">
				<Reveal>
					<div className="max-w-2xl">
						<p className="text-xs font-bold uppercase tracking-[0.25em] text-tone-yellow">The AIYatra way</p>
						<h2 className="mt-3 font-hand text-5xl font-bold leading-tight sm:text-6xl">
							First you research.<br />
							Then you build.<br />
							Then you <span className="text-tone-yellow">transform.</span>
						</h2>
						<p className="mt-6 text-lg leading-relaxed text-paper/70">
							Yatra means journey. Ours takes you from curious onlooker to confident builder — through
							research, build, and transform, repeated every single meetup.
						</p>
					</div>
				</Reveal>

				<div className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
					{methodSteps.map((s, i) => (
						<Reveal key={s.n} delay={i * 0.08} className="flex">
							<article className="flex flex-1 flex-col rounded-2xl border-2 border-paper/20 bg-paper-soft p-6 text-ink shadow-paper-soft sm:p-7">
								<span className={`inline-flex w-fit items-center rounded-full border-2 border-ink ${s.tone} px-3 py-1 font-hand text-xl font-bold`}>
									{s.n} · {s.kicker}
								</span>
								<h3 className="mt-4 font-hand text-4xl font-bold leading-tight">{s.title}</h3>
								<p className="mt-3 flex-1 text-base leading-relaxed text-ink/80">{s.body}</p>
							</article>
						</Reveal>
					))}
				</div>

				<Reveal delay={0.1}>
					<div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
						{[
							{ value: GROUP_STATS.eventsHosted, suffix: '', label: 'Meetups hosted' },
							{ value: 2, suffix: 'hr', label: 'Per session' },
							{ value: 100, suffix: '%', label: 'Free, always' },
						].map((s) => (
							<div key={s.label} className="rounded-xl border-2 border-paper/25 bg-paper/5 px-3 py-4 text-center">
								<p className="font-hand text-3xl font-bold text-tone-yellow">
									<CountUp value={s.value} suffix={s.suffix || ''} />
								</p>
								<p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-paper/55">{s.label}</p>
							</div>
						))}
					</div>
				</Reveal>
			</div>
		</section>
	);
}

function Testimonials() {
	const row = [...testimonials, ...testimonials];
	return (
		<section id="voices" className="border-b-2 border-ink">
			<div className="wrap pb-10 pt-20">
				<Reveal>
					<div className="flex flex-wrap items-end justify-between gap-6">
						<div>
							<p className="text-xs font-bold uppercase tracking-[0.25em] text-tone-blue-deep">Community voices</p>
							<h2 className="mt-3 font-hand text-5xl font-bold leading-tight sm:text-6xl">
								Rated {GROUP_STATS.rating}★ by the people<br />who show up.
							</h2>
						</div>
						<div className="flex items-center gap-2 rounded-xl border-2 border-ink bg-tone-yellow px-4 py-2 shadow-paper-sm">
							<Star className="h-5 w-5 fill-ink text-ink" />
							<span className="text-sm font-bold">{GROUP_STATS.rating} · {GROUP_STATS.ratingsCount} ratings on Meetup</span>
						</div>
					</div>
				</Reveal>
			</div>

			{/* voices marquee — contained in the same .wrap so its edges align */}
			<div className="wrap pb-4">
				<div className="marquee-pause overflow-hidden rounded-2xl border-2 border-ink/20 bg-paper-soft py-8">
					<div className="marquee-track-reverse flex w-max gap-6 px-3">
						{row.map((t, i) => (
							<figure
								key={i}
								className={`flex w-[340px] shrink-0 flex-col rounded-2xl border-2 border-ink ${t.tone} p-6 shadow-paper-sm`}
							>
								<Quote className="h-7 w-7 text-ink/40" />
								<blockquote className="mt-3 flex-1 font-hand text-2xl font-medium leading-snug">
									“{t.quote}”
								</blockquote>
								<figcaption className="mt-5 border-t-2 border-dashed border-ink/30 pt-4">
									<p className="text-sm font-bold">{t.name}</p>
									<p className="text-xs font-semibold uppercase tracking-widest text-ink/60">{t.role}</p>
								</figcaption>
							</figure>
						))}
					</div>
				</div>
			</div>

			<div className="wrap py-10 text-center">
				<p className="font-hand text-xl text-ink-soft rotate-[-1deg]">
					every voice from the community — hover to pause the loop.
				</p>
			</div>
		</section>
	);
}

function About() {
	return (
		<section id="about" className="bg-tone-green/40">
			<div className="wrap grid gap-12 py-20 lg:grid-cols-2 lg:items-stretch lg:gap-[clamp(44px,6vw,96px)]">
				<Reveal className="flex">
					<div className="flex flex-1 flex-col justify-center">
						<p className="text-xs font-bold uppercase tracking-[0.25em] text-tone-blue-deep">About the community</p>
						<h2 className="mt-3 font-hand text-5xl font-bold leading-tight sm:text-6xl">
							An open door into AI,<br />in the heart of Hyderabad.
						</h2>
						<p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
							AIYatra is for anyone exploring AI applications, diving into <em>Artificial Intelligence: A Modern
							Approach</em>, building recommender systems, or mastering machine learning with Python. Beginner or
							expert — you get knowledge sharing, networking, and collaborative projects.
						</p>
						<p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
							Led by super organizer <strong className="text-ink">{GROUP_STATS.organizer}</strong> and a crew of
							passionate volunteers, we meet at {GROUP_STATS.venue}.
						</p>
					</div>
				</Reveal>
				<Reveal delay={0.15} className="flex">
					<div className="flex flex-1 flex-col rounded-2xl border-2 border-ink bg-paper-soft p-6 shadow-paper">
						<h3 className="font-hand text-3xl font-bold">The essentials</h3>
						<ul className="mt-5 flex flex-1 flex-col justify-between gap-3">
							{essentials.map((row) => (
								<li key={row.label} className="flex min-h-[68px] flex-1 items-center gap-4 rounded-xl border border-ink/50 bg-paper px-4 py-3">
									<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-ink bg-tone-yellow">
										<row.icon className="h-5 w-5" />
									</span>
									<div className="min-w-0">
										<p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/55">{row.label}</p>
										<p className="truncate text-sm font-semibold">{row.value}</p>
									</div>
								</li>
							))}
						</ul>
					</div>
				</Reveal>
			</div>
		</section>
	);
}

function FinalCta() {
	return (
		<section className="bg-ink text-paper">
			<div className="wrap-narrow flex flex-col items-center py-24 text-center">
				<Reveal className="flex flex-col items-center">
					<span className="inline-flex items-center gap-2 rounded-full border-2 border-paper/40 px-4 py-1.5 text-sm font-semibold text-tone-yellow">
						<Ticket className="h-4 w-4" /> Free forever · No prerequisites
					</span>
					<h2 className="mx-auto mt-8 max-w-3xl font-hand text-5xl font-bold leading-tight sm:text-7xl">
						Your AI journey starts<br />with a single <span className="text-tone-yellow">RSVP.</span>
					</h2>
					<p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-paper/70">
						Join {GROUP_STATS.members.toLocaleString()} learners democratizing AI — one meetup, one project, one breakthrough at a time.
					</p>
					<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
						<a
							href={MEETUP_URL}
							target="_blank"
							rel="noreferrer"
							className="active-press inline-flex h-12 items-center gap-2 rounded-xl border-2 border-paper bg-tone-yellow px-7 text-base font-bold text-ink transition-transform hover:-translate-y-0.5"
						>
							Join AIYatra on Meetup <ArrowRight className="h-5 w-5" />
						</a>
						<a
							href={EVENT_URL}
							target="_blank"
							rel="noreferrer"
							className="active-press inline-flex h-12 items-center gap-2 rounded-xl border-2 border-paper/50 px-7 text-base font-semibold text-paper transition-colors hover:border-paper"
						>
							RSVP: Agentic AI, Sep 5
						</a>
					</div>
				</Reveal>
			</div>
		</section>
	);
}

function FooterHeading({ children }) {
	return (
		<p className="text-[11px] font-bold uppercase tracking-[0.25em] text-tone-yellow">
			{children}
		</p>
	);
}

function Footer() {
	return (
		<footer className="bg-ink text-paper" style={{ borderTop: '5px solid hsl(var(--tone-yellow))' }}>
			<div className="wrap grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.9fr_1fr_0.9fr]">
				{/* Brand */}
				<div>
					<a href="#top" className="flex items-center gap-2.5" aria-label="AI Yatra home">
						<img src={AI_YATRA_LOGO} alt="" aria-hidden="true" className="h-14 w-14 shrink-0 object-contain" />
						<span className="flex flex-col leading-none">
							<span className="text-[22px] font-extrabold tracking-tight text-paper">AI Yatra</span>
							<span className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-paper/60">
								Research · Build · Transform
							</span>
						</span>
					</a>
					<p className="mt-5 font-hand text-2xl font-bold leading-snug text-paper">
						AI Yatra — Research. Build. Transform.
					</p>
					<p className="mt-2 max-w-sm text-sm leading-relaxed text-paper/70">
						Hyderabad's open AI community. We research, build, and transform — one hands-on Saturday
						at a time. Free, forever, and open to everyone.
					</p>
					<div className="mt-5 flex flex-wrap gap-3">
						<a
							href={MEETUP_URL}
							target="_blank"
							rel="noreferrer"
							className="active-press inline-flex h-10 items-center gap-2 rounded-xl border-2 border-paper bg-tone-yellow px-4 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5"
						>
							Join on Meetup <ArrowUpRight className="h-4 w-4" />
						</a>
						<a
							href={EVENT_URL}
							target="_blank"
							rel="noreferrer"
							className="active-press inline-flex h-10 items-center gap-2 rounded-xl border-2 border-paper/40 px-4 text-sm font-semibold text-paper transition-colors hover:border-paper"
						>
							Next: Sep 5
						</a>
					</div>
				</div>

				{/* Explore */}
				<div>
					<FooterHeading>Explore</FooterHeading>
					<ul className="mt-4 space-y-2.5 text-sm font-semibold">
						<li><a href="#events" className="text-paper/75 transition-colors hover:text-tone-yellow">Upcoming &amp; past events</a></li>
						<li><a href="#moments" className="text-paper/75 transition-colors hover:text-tone-yellow">Moments from the yatra</a></li>
						<li><a href="#voices" className="text-paper/75 transition-colors hover:text-tone-yellow">Community voices</a></li>
						<li><a href="#about" className="text-paper/75 transition-colors hover:text-tone-yellow">About the community</a></li>
						<li><a href={MEETUP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-paper/75 transition-colors hover:text-tone-yellow">Meetup chapter page <ArrowUpRight className="h-3.5 w-3.5" /></a></li>
					</ul>
				</div>

				{/* Show up */}
				<div>
					<FooterHeading>Show up</FooterHeading>
					<ul className="mt-4 space-y-3 text-sm">
						<li className="flex items-start gap-3 text-paper/75">
							<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-paper/25 bg-paper/10">
								<MapPin className="h-4 w-4 text-tone-yellow" />
							</span>
							<span className="leading-snug">{GROUP_STATS.venue}</span>
						</li>
						<li className="flex items-center gap-3 text-paper/75">
							<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-paper/25 bg-paper/10">
								<CalendarDays className="h-4 w-4 text-tone-yellow" />
							</span>
							<span>Saturdays · mornings, IST</span>
						</li>
						<li className="flex items-center gap-3 text-paper/75">
							<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-paper/25 bg-paper/10">
								<Ticket className="h-4 w-4 text-tone-yellow" />
							</span>
							<span>Free, always</span>
						</li>
					</ul>
				</div>

				{/* Follow */}
				<div>
					<FooterHeading>Follow the yatra</FooterHeading>
					<ul className="mt-4 space-y-3 text-sm font-semibold">
						<li>
							<a href="mailto:hello@aiyatra.com" className="inline-flex items-center gap-2 text-paper/75 transition-colors hover:text-tone-yellow">
								<Mail className="h-4 w-4" /> hello@aiyatra.com
							</a>
						</li>
						<li>
							<a href={MEETUP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-paper/75 transition-colors hover:text-tone-yellow">
								<MessageCircle className="h-4 w-4" /> Message us on Meetup
							</a>
						</li>
					</ul>
					<div className="mt-5 flex items-center gap-3">
						<a href={MEETUP_URL} target="_blank" rel="noreferrer" aria-label="Meetup" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-paper/30 text-paper/75 transition-colors hover:border-tone-yellow hover:text-tone-yellow">
							<Users className="h-5 w-5" />
						</a>
						<a href="https://github.com/aiyatra" target="_blank" rel="noreferrer" aria-label="GitHub" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-paper/30 text-paper/75 transition-colors hover:border-tone-yellow hover:text-tone-yellow">
							<Github className="h-5 w-5" />
						</a>
						<a href="https://www.linkedin.com/company/aiyatra" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-paper/30 text-paper/75 transition-colors hover:border-tone-yellow hover:text-tone-yellow">
							<Linkedin className="h-5 w-5" />
						</a>
						<a href="mailto:hello@aiyatra.com" aria-label="Email" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-paper/30 text-paper/75 transition-colors hover:border-tone-yellow hover:text-tone-yellow">
							<Mail className="h-5 w-5" />
						</a>
					</div>
				</div>
			</div>

			<div className="border-t border-paper/15">
				<div className="wrap flex flex-col items-center justify-between gap-2 py-5 text-xs sm:flex-row">
					<p className="inline-flex items-center gap-1.5 tracking-wide text-paper/60">
						Made with <Heart className="h-3.5 w-3.5 fill-tone-coral text-tone-coral" /> in Hyderabad
					</p>
					<p className="tracking-wide text-paper/60">© 2026 AIYatra · Research. Build. Transform.</p>
					<a href="#top" className="font-semibold text-paper/75 transition-colors hover:text-tone-yellow">
						Back to top
					</a>
				</div>
			</div>
		</footer>
	);
}

export default function HomePage() {
	return (
		<div className="grain min-h-screen bg-paper text-ink antialiased">
			<Helmet>
				<title>AIYatra — Democratizing AI Learning | Hyderabad AI Community</title>
				<meta
					name="description"
					content="AIYatra is Hyderabad's open AI community. Through research, build and transform — join 2,957 members at hands-on meetups on agentic AI, PyTorch, and machine learning. Free, forever."
				/>
			</Helmet>
			<Header />
			<main>
				<Hero />
				<Events />
				<Moments />
				<Method />
				<Testimonials />
				<About />
				<FinalCta />
			</main>
			<Footer />
		</div>
	);
}
