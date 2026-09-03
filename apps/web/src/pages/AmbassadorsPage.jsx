import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
	ArrowRight, ArrowUpRight, GraduationCap, Megaphone, Users, CalendarDays,
	BookOpen, Sparkles, BadgeCheck, Mail, MapPin, Compass, Camera, Heart,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import { Header, Footer } from '@/components/SiteChrome';
import { MEETUP_URL, CONTACT_EMAIL } from '@/data/site';
import { AMBASSADOR_CREST } from '@/data/site';

const duties = [
	{
		icon: Megaphone,
		tone: 'bg-tone-yellow',
		title: 'Carry the yatra to campus',
		body: 'Spread the word in your college — posters, classroom shout-outs, WhatsApp groups and tech clubs. You are the bridge between AIYatra and your campus.',
	},
	{
		icon: Users,
		tone: 'bg-tone-green',
		title: 'Bring your batch along',
		body: 'Rally classmates to Saturday meetups, help first-timers settle in, and keep the newcomer energy warm from RSVP to after-party notes.',
	},
	{
		icon: CalendarDays,
		tone: 'bg-tone-blue',
		title: 'Host campus mini-sessions',
		body: 'Run paper-readings, build nights and revision circles at your college with our curriculum kits — same research·build·transform rhythm, your turf.',
	},
	{
		icon: Camera,
		tone: 'bg-tone-coral',
		title: 'Document the journey',
		body: 'Capture photos, clips and field notes from meetups and campus sessions so the community story keeps growing online.',
	},
	{
		icon: BookOpen,
		tone: 'bg-tone-violet',
		title: 'Learn in the fast lane',
		body: 'Get first access to session material, prep calls with organizers, and guided tracks — transformers, PyTorch, agentic AI — before anyone else.',
	},
	{
		icon: Compass,
		tone: 'bg-tone-yellow',
		title: 'Feed the roadmap back',
		body: 'Tell us what students actually want: topics, timings, formats. Ambassador feedback directly shapes the upcoming meetup arc.',
	},
];

const perks = [
	{
		title: 'Official recognition',
		body: 'A signed Ambassador certificate plus a public profile on this page once you complete your first term.',
	},
	{
		title: 'Letters that count',
		body: 'Recommendation letters for internships and higher studies, earned through real shipped work — not attendance.',
	},
	{
		title: 'Direct mentor access',
		body: 'Monthly office hours with the organizers. Bring your projects, career questions, and wildest paper ideas.',
	},
	{
		title: 'Speaker lane',
		body: 'Ambassadors in good standing get priority slots to demo, lightning-talk, and eventually lead sessions.',
	},
];

const whoFits = [
	'Enrolled in any college or university — any year, any branch. Curiosity beats CGPA here.',
	'Attended at least one AIYatra meetup (or will attend the next one) — you should know the room you are inviting people into.',
	'Can give ~3 hours a week: one meetup plus campus outreach and a short weekly check-in.',
	'Comfortable talking to people — in classrooms, clubs, and group chats — and following through on what you promise.',
];

const steps = [
	{
		n: '01',
		title: 'Say hello',
		body: 'Email us with your name, college, year, and one paragraph on why you want to carry the yatra to your campus.',
	},
	{
		n: '02',
		title: 'Meet the crew',
		body: 'A short intro call with an organizer — we understand your campus scene and agree on your first 30-day plan.',
	},
	{
		n: '03',
		title: 'Run your first drive',
		body: 'Bring five classmates to a Saturday meetup and host one campus huddle. Do that and the crest is yours.',
	},
];

export default function AmbassadorsPage() {
	return (
		<div className="grain min-h-screen bg-paper text-ink antialiased">
			<Helmet>
				<title>Student Ambassador Program — AIYatra</title>
				<meta
					name="description"
					content="Become an AIYatra Student Ambassador: carry the yatra to your campus, host mini-sessions, earn recognition, mentorship and speaker slots. Free, open to every college student."
				/>
			</Helmet>
			<Header />
			<main>
				{/* Hero */}
				<section id="top" className="relative overflow-hidden">
					<div className="wrap grid gap-12 pb-14 pt-14 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-[clamp(50px,6vw,110px)] lg:pb-16 lg:pt-[74px]">
						<div>
							<Reveal>
								<span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-tone-blue px-4 py-1.5 text-sm font-semibold shadow-paper-sm">
									<GraduationCap className="h-4 w-4" /> New chapter · Student Ambassador Program
								</span>
							</Reveal>
							<Reveal delay={0.08}>
								<h1 className="mt-6 font-hand text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
									Carry the yatra<br />
									to <span className="text-tone-blue-deep underline decoration-tone-coral decoration-4 underline-offset-8">your campus.</span>
								</h1>
							</Reveal>
							<Reveal delay={0.16}>
								<p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
									AIYatra Student Ambassadors are the face of the movement in their colleges —
									rallying classmates to Saturday meetups, hosting campus mini-sessions, and turning
									dense AI topics into hands-on learning their batch can actually use.
								</p>
							</Reveal>
							<Reveal delay={0.24}>
								<div className="mt-8 flex flex-wrap items-center gap-4">
									<a
										href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('AIYatra Student Ambassador — Application')}`}
										className="active-press inline-flex h-12 items-center gap-2 rounded-xl border-2 border-ink bg-tone-blue-deep px-6 text-base font-semibold text-paper shadow-paper transition-transform hover:-translate-y-0.5"
									>
										Apply by email <ArrowRight className="h-5 w-5" />
									</a>
									<Link
										to="/#events"
										className="active-press inline-flex h-12 items-center gap-2 rounded-xl border-2 border-ink bg-paper-soft px-6 text-base font-semibold text-ink shadow-paper transition-transform hover:-translate-y-0.5"
									>
										Attend a meetup first
									</Link>
								</div>
							</Reveal>
						</div>
						<Reveal delay={0.15}>
							<div className="overflow-hidden rounded-2xl border-2 border-ink bg-paper-soft shadow-paper">
								<img
									src={AMBASSADOR_CREST}
									alt="AIYatra Student Ambassador Program crest"
									className="h-auto w-full object-cover"
								/>
							</div>
						</Reveal>
					</div>
				</section>

				{/* What ambassadors do */}
				<section className="border-y-2 border-ink bg-paper-soft">
					<div className="wrap py-20">
						<Reveal>
							<p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-tone-blue-deep">
								<Sparkles className="h-4 w-4" /> The mandate
							</p>
							<h2 className="mt-3 max-w-2xl font-hand text-5xl font-bold leading-tight sm:text-6xl">
								Six duties.<br />One movement.
							</h2>
							<p className="mt-4 max-w-2xl text-lg text-ink-soft">
								A term runs one semester. Hit these six notes and you renew with honors —
								and a letter that actually says something.
							</p>
						</Reveal>
						<div className="mt-10 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
							{duties.map((d, i) => (
								<Reveal key={d.title} delay={(i % 3) * 0.08} className="flex">
									<article className="flex flex-1 flex-col rounded-2xl border-2 border-ink bg-paper p-6 shadow-paper-sm">
										<span className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ink ${d.tone}`}>
											<d.icon className="h-6 w-6" />
										</span>
										<h3 className="mt-4 font-hand text-3xl font-bold leading-tight">{d.title}</h3>
										<p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-ink/75">{d.body}</p>
									</article>
								</Reveal>
							))}
						</div>
					</div>
				</section>

				{/* Perks */}
				<section className="bg-ink text-paper">
					<div className="wrap py-20">
						<Reveal>
							<div className="max-w-2xl">
								<p className="text-xs font-bold uppercase tracking-[0.25em] text-tone-yellow">What you get</p>
								<h2 className="mt-3 font-hand text-5xl font-bold leading-tight sm:text-6xl">
									Ambassadorship<br />pays in <span className="text-tone-yellow">proof of work.</span>
								</h2>
								<p className="mt-6 text-lg leading-relaxed text-paper/70">
									No stipends, no swag-bribes — everything here compounds into skills,
									relationships, and receipts future employers can verify.
								</p>
							</div>
						</Reveal>
						<div className="mt-12 grid items-stretch gap-6 md:grid-cols-2">
							{perks.map((p, i) => (
								<Reveal key={p.title} delay={(i % 2) * 0.08} className="flex">
									<article className="flex flex-1 items-start gap-4 rounded-2xl border-2 border-paper/20 bg-paper-soft p-6 text-ink shadow-paper-soft">
										<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-tone-yellow">
											<BadgeCheck className="h-5 w-5" />
										</span>
										<div>
											<h3 className="font-hand text-3xl font-bold leading-tight">{p.title}</h3>
											<p className="mt-2 text-sm font-medium leading-relaxed text-ink/75">{p.body}</p>
										</div>
									</article>
								</Reveal>
							))}
						</div>
					</div>
				</section>

				{/* Who fits + how to apply */}
				<section className="bg-tone-green/40">
					<div className="wrap grid gap-12 py-20 lg:grid-cols-2 lg:items-start lg:gap-[clamp(44px,6vw,96px)]">
						<Reveal className="flex">
							<div className="flex flex-1 flex-col rounded-2xl border-2 border-ink bg-paper-soft p-6 shadow-paper sm:p-8">
								<p className="text-xs font-bold uppercase tracking-[0.25em] text-tone-blue-deep">Who fits</p>
								<h2 className="mt-3 font-hand text-4xl font-bold leading-tight sm:text-5xl">
									Built for students<br />who show up.
								</h2>
								<ul className="mt-6 flex-1 space-y-4">
									{whoFits.map((w, i) => (
										<li key={i} className="flex items-start gap-3 text-sm font-medium leading-relaxed text-ink/80">
											<span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-tone-green text-xs font-bold">
												{i + 1}
											</span>
											<span>{w}</span>
										</li>
									))}
								</ul>
							</div>
						</Reveal>
						<Reveal delay={0.12} className="flex">
							<div className="flex flex-1 flex-col rounded-2xl border-2 border-ink bg-paper p-6 shadow-paper sm:p-8">
								<p className="text-xs font-bold uppercase tracking-[0.25em] text-tone-blue-deep">How to apply</p>
								<h2 className="mt-3 font-hand text-4xl font-bold leading-tight sm:text-5xl">
									Three steps<br />to the crest.
								</h2>
								<div className="mt-6 flex-1 space-y-5">
									{steps.map((s) => (
										<div key={s.n} className="rounded-xl border-2 border-ink bg-paper-soft p-5">
											<p className="inline-flex items-center rounded-full border-2 border-ink bg-tone-blue px-3 py-0.5 font-hand text-lg font-bold">
												{s.n}
											</p>
											<h3 className="mt-2 text-lg font-bold">{s.title}</h3>
											<p className="mt-1 text-sm font-medium leading-relaxed text-ink/75">{s.body}</p>
										</div>
									))}
								</div>
								<a
									href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('AIYatra Student Ambassador — Application')}&body=${encodeURIComponent('Name:\nCollege:\nYear / Branch:\nWhy I want to be an ambassador:\n')}`}
									className="active-press mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-ink bg-tone-blue-deep px-6 text-base font-semibold text-paper shadow-paper-sm transition-transform hover:-translate-y-0.5"
								>
									<Mail className="h-5 w-5" /> Apply at {CONTACT_EMAIL}
								</a>
								<p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-ink/60">
									<MapPin className="h-3.5 w-3.5" /> Open to every college · Free, always
								</p>
							</div>
						</Reveal>
					</div>
				</section>

				{/* Closing CTA */}
				<section className="bg-ink text-paper">
					<div className="wrap-narrow flex flex-col items-center py-24 text-center">
						<Reveal className="flex flex-col items-center">
							<span className="inline-flex items-center gap-2 rounded-full border-2 border-paper/40 px-4 py-1.5 text-sm font-semibold text-tone-yellow">
								<GraduationCap className="h-4 w-4" /> One campus at a time
							</span>
							<h2 className="mx-auto mt-8 max-w-3xl font-hand text-5xl font-bold leading-tight sm:text-7xl">
								Your campus is<br />the next <span className="text-tone-yellow">yatra.</span>
							</h2>
							<p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-paper/70">
								Write to us today — or come experience a Saturday first, then decide.
							</p>
							<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
								<a
									href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('AIYatra Student Ambassador — Application')}`}
									className="active-press inline-flex h-12 items-center gap-2 rounded-xl border-2 border-paper bg-tone-yellow px-7 text-base font-bold text-ink transition-transform hover:-translate-y-0.5"
								>
									Become an ambassador <ArrowRight className="h-5 w-5" />
								</a>
								<a
									href={MEETUP_URL}
									target="_blank"
									rel="noreferrer"
									className="active-press inline-flex h-12 items-center gap-2 rounded-xl border-2 border-paper/50 px-7 text-base font-semibold text-paper transition-colors hover:border-paper"
								>
									Join on Meetup <ArrowUpRight className="h-5 w-5" />
								</a>
							</div>
						</Reveal>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}
