import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import {
	ArrowRight, ArrowUpRight, Download, Mail, CheckCircle2, XCircle, Info, Clock,
	Quote, Sparkles,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import { Header, Footer } from '@/components/SiteChrome';
import { NeuralField, Aurora, Tilt, SplitWords, useSpotlight } from '@/components/Fx';
import { SectionLabel, PrimaryButton, GhostButton } from '@/components/Kit';
import { MEETUP_URL, CONTACT_EMAIL, AMBASSADOR_CREST, DECKS, GROUP_STATS } from '@/data/site';
import {
	PILLARS, LEVEL_UPS, PRINCIPLES, DEEP_DIVES, CAMPUS_LAYERS, ROLE, BLUEPRINT,
	MONTHLY_RHYTHM, SQUAD, JOURNEY, TRACKS, LAB_FORMATS, LOOP, SIGNATURE_EVENTS,
	OUTPUTS, SUPPORT, LADDER, COMMITMENT, LAUNCH_PLAN, FIT, START_STEPS,
} from '@/data/ambassadors';

const PROPOSAL_MAIL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('AIYatra Chapter Proposal — Student Ambassador Program')}&body=${encodeURIComponent('College:\nDegree / Year (B.Tech / M.Sc):\nChapter lead name:\nCore team (3–6 names + roles):\nFaculty point of contact:\nTracks you want to start with:\nLinks (GitHub, notes, projects):\nWhy your campus needs this chapter:\n')}`;
const QUESTION_MAIL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('AIYatra Student Ambassador — Question')}`;

const SECTIONS = [
	['why', 'Why now'],
	['mission', 'Mission'],
	['role', 'Your role'],
	['blueprint', 'Blueprint'],
	['journey', 'Journey'],
	['tracks', 'Tracks'],
	['labs', 'Labs & events'],
	['recognition', 'Recognition'],
	['launch', '100 days'],
	['apply', 'Apply'],
];

/* ——— shared bits ——— */

function Heading({ n, label, title, accent, body, light = false, center = false }) {
	return (
		<Reveal from="up" className={center ? 'mx-auto text-center' : ''}>
			<SectionLabel n={n} light={light}>{label}</SectionLabel>
			<h2 className={`mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.04] sm:text-6xl ${center ? 'mx-auto' : ''} ${light ? 'text-white' : 'text-ink'}`}>
				{title}{' '}
				{accent && <span className={light ? 'bg-gradient-to-r from-white via-[hsl(199_89%_70%)] to-white bg-clip-text text-transparent' : 'text-gradient'}>{accent}</span>}
			</h2>
			{body && <p className={`mt-5 max-w-2xl text-lg leading-relaxed ${center ? 'mx-auto' : ''} ${light ? 'text-white/60' : 'text-ink/60'}`}>{body}</p>}
		</Reveal>
	);
}

function IconCard({ icon: Icon, title, body, i = 0, light = false }) {
	const spot = useSpotlight();
	return (
		<Reveal from={['left', 'up', 'right'][i % 3]} delay={(i % 4) * 0.07} className="flex">
			<div
				onMouseMove={spot}
				className={`spotlight group flex flex-1 flex-col rounded-[22px] p-6 transition-all duration-300 hover:-translate-y-1.5 ${light ? 'bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/[0.09]' : 'border border-tone-blue-deep/10 bg-white shadow-paper-sm hover:shadow-paper'}`}
			>
				<span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 ${light ? 'bg-white/10 text-[hsl(199_89%_70%)]' : 'bg-gradient-to-br from-tone-blue-deep to-[hsl(199_89%_60%)] text-white shadow-[0_10px_24px_-10px_hsl(221_83%_53%/0.8)]'}`}>
					<Icon className="h-6 w-6" />
				</span>
				<h3 className={`mt-5 font-display text-xl font-bold leading-snug ${light ? 'text-white' : 'text-ink'}`}>{title}</h3>
				<p className={`mt-2 text-sm leading-relaxed ${light ? 'text-white/55' : 'text-ink/60'}`}>{body}</p>
			</div>
		</Reveal>
	);
}

/* ——— sticky in-page navigation ——— */

function SectionNav() {
	const [active, setActive] = useState(SECTIONS[0][0]);
	useEffect(() => {
		const els = SECTIONS.map(([id]) => document.getElementById(id)).filter(Boolean);
		const io = new IntersectionObserver((entries) => {
			entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
		}, { rootMargin: '-45% 0px -50% 0px' });
		els.forEach((el) => io.observe(el));
		return () => io.disconnect();
	}, []);
	return (
		<div className="sticky top-[72px] z-40 border-y border-tone-blue-deep/10 bg-white/95">
			<nav aria-label="Program sections" className="wrap flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{SECTIONS.map(([id, label]) => (
					<a
						key={id}
						href={`#${id}`}
						className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${active === id ? 'text-white' : 'text-ink/60 hover:text-tone-blue-deep'}`}
					>
						{active === id && <motion.span layoutId="amb-nav" className="absolute inset-0 rounded-full bg-tone-blue-deep" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
						<span className="relative">{label}</span>
					</a>
				))}
			</nav>
		</div>
	);
}

/* ——— Hero ——— */

function Hero() {
	return (
		<section id="top" className="relative overflow-hidden">
			<Aurora />
			<div aria-hidden="true" className="bg-grid mask-fade-y absolute inset-0" />
			<div aria-hidden="true" className="absolute inset-0"><NeuralField /></div>
			<div className="wrap relative grid items-center gap-14 pb-20 pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:pt-20">
				<div>
					<Reveal from="down">
						<span className="inline-flex items-center gap-2 rounded-full border border-tone-blue-deep/15 bg-white/80 py-1.5 pl-1.5 pr-4 text-sm font-medium text-ink/75">
							<span className="whitespace-nowrap rounded-full bg-tone-blue-deep px-2.5 py-0.5 text-xs font-semibold text-white">Now open</span>
							<span className="whitespace-nowrap"><span className="hidden sm:inline">AIYatra </span>Student Ambassador Program</span>
						</span>
					</Reveal>
					<h1 className="mt-7 font-display text-[2.9rem] font-bold leading-[1] text-ink sm:text-6xl xl:text-[4.6rem]">
						<SplitWords text="Turn your campus into an" />{' '}
						<SplitWords text="AI research & builder chapter." wordClassName="text-gradient" delay={0.3} />
					</h1>
					<Reveal from="left" delay={0.5}>
						<p className="mt-7 max-w-xl text-lg leading-relaxed text-ink/65 sm:text-xl">
							For <strong className="font-semibold text-ink">B.Tech & M.Sc students</strong> ready to do more than attend AI events:
							start chapters, run labs, read papers, build tools, and lead.
						</p>
					</Reveal>
					<Reveal from="up" delay={0.6}>
						<div className="mt-8 flex flex-wrap gap-3">
							{PILLARS.map((p, i) => (
								<motion.span
									key={p.label}
									initial={{ opacity: 0, scale: 0.6 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 0.8 + i * 0.1, type: 'spring', stiffness: 260, damping: 18 }}
									className="inline-flex items-center gap-2 rounded-2xl border border-tone-blue-deep/10 bg-white px-4 py-2.5 text-sm font-bold uppercase tracking-[0.16em] text-ink shadow-paper-sm"
								>
									<p.icon className="h-4 w-4 text-tone-blue-deep" /> {p.label}
								</motion.span>
							))}
						</div>
					</Reveal>
					<Reveal from="up" delay={0.75}>
						<div className="mt-9 flex flex-wrap gap-3">
							<PrimaryButton href={PROPOSAL_MAIL}>Start your chapter <ArrowRight className="h-4 w-4" /></PrimaryButton>
							<GhostButton href={DECKS.ambassador} download><Download className="h-4 w-4" /> Program deck</GhostButton>
						</div>
					</Reveal>
				</div>

				<Reveal from="right" delay={0.2}>
					<div className="relative mx-auto aspect-square w-full max-w-[480px]">
						<div aria-hidden="true" className="spin-slow absolute inset-0 rounded-full border-2 border-dashed border-tone-blue-deep/20" />
						<div aria-hidden="true" className="spin-slower absolute inset-[8%] rounded-full border border-tone-blue-deep/15">
							<span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-tone-blue-deep shadow-[0_0_24px_hsl(221_83%_53%)]" />
							<span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[hsl(199_89%_60%)]" />
							<span className="absolute left-[-6px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-tone-blue-deep/60" />
						</div>
						<Tilt className="absolute inset-[17%]" max={10}>
							<div className="h-full w-full overflow-hidden rounded-full bg-white p-3 shadow-paper">
								<img src={AMBASSADOR_CREST} alt="AIYatra Student Ambassador Program crest" className="h-full w-full rounded-full object-cover" />
							</div>
						</Tilt>
						{[
							{ label: 'B.Tech & M.Sc', cls: 'left-[-4%] top-[14%]' },
							{ label: '9-month journey', cls: 'right-[-6%] top-[26%]' },
							{ label: '8–10 hrs / month', cls: 'bottom-[12%] left-[-2%]' },
							{ label: 'Free, always', cls: 'bottom-[20%] right-[-4%]' },
						].map((b, i) => (
							<motion.span
								key={b.label}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.9 + i * 0.12 }}
								className={`absolute ${b.cls}`}
							>
								<span className="float-soft inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-paper-sm" style={{ animationDelay: `${i * -1.4}s` }}>
									<span className="h-2 w-2 rounded-full bg-tone-blue-deep" /> {b.label}
								</span>
							</motion.span>
						))}
					</div>
				</Reveal>
			</div>
		</section>
	);
}

/* ——— 01 · Why now ——— */

function WhyNow() {
	const stats = [
		[GROUP_STATS.members.toLocaleString(), 'Community', 'members on the AIYatra Meetup'],
		[`${GROUP_STATS.eventsHosted}+`, 'Momentum', 'events across modern AI'],
		['3.5 hr', 'Depth', 'first-principles deep dives'],
		['280+', 'Pull', 'attendees at recent sessions'],
	];
	return (
		<section id="why" className="relative scroll-mt-32 py-24 sm:py-32">
			<div className="wrap">
				<Heading n="01" label="Why now" title="AI is moving fast. Your campus needs" accent="builders, not spectators." />
				<div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{stats.map(([v, k, d], i) => (
						<Reveal key={k} from="up" delay={i * 0.08}>
							<div className="hover-lift rounded-[22px] border border-tone-blue-deep/10 bg-gradient-to-br from-white to-paper-soft p-6">
								<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-tone-blue-deep">{k}</p>
								<p className="mt-3 font-display text-5xl font-bold text-ink">{v}</p>
								<p className="mt-1 text-sm text-ink/55">{d}</p>
							</div>
						</Reveal>
					))}
				</div>
				<Reveal from="up"><p className="mt-16 text-xs font-semibold uppercase tracking-[0.24em] text-ink/45">The opportunity · level up</p></Reveal>
				<div className="mt-5 grid gap-5 lg:grid-cols-3">
					{LEVEL_UPS.map((l, i) => (
						<Reveal key={l.from} from={['left', 'up', 'right'][i]} delay={i * 0.1} className="flex">
							<div className="group relative flex flex-1 flex-col overflow-hidden rounded-[24px] bg-ink p-7 text-white shadow-paper">
								<div aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 glow [--glow:hsl(221_83%_53%/0.55)] transition-transform duration-700 group-hover:scale-150" />
								<p className="relative text-sm font-medium uppercase tracking-[0.18em] text-white/45 line-through decoration-[hsl(199_89%_60%)] decoration-2">From {l.from}</p>
								<p className="relative mt-2 flex items-center gap-3 font-display text-3xl font-bold">
									<ArrowRight className="h-7 w-7 text-[hsl(199_89%_70%)] transition-transform duration-500 group-hover:translate-x-2" /> {l.to}
								</p>
								<p className="relative mt-4 text-sm leading-relaxed text-white/60">{l.body}</p>
							</div>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}

/* ——— 02 · Mission + technical DNA ——— */

function Mission() {
	return (
		<section id="mission" className="relative scroll-mt-32 overflow-hidden bg-paper-soft py-24 sm:py-32">
			<div aria-hidden="true" className="bg-grid mask-fade-y absolute inset-0 opacity-60" />
			<div className="wrap relative">
				<Heading n="02" label="What this is" title="Not a certificate." accent="A mission." body="An operating system for serious student AI work: real output, repeatable rituals, real leadership." />
				<div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{PRINCIPLES.map((p, i) => <IconCard key={p.title} {...p} i={i} />)}
				</div>

				<Reveal from="zoom">
					<div className="relative mt-14 overflow-hidden rounded-[32px] bg-gradient-to-br from-tone-blue-deep via-[hsl(224_76%_40%)] to-ink p-8 text-white shadow-paper sm:p-12">
						<Quote aria-hidden="true" className="absolute right-8 top-8 h-24 w-24 text-white/10" />
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">The monthly test</p>
						<p className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-5xl">“Did your chapter create something useful?”</p>
						<p className="mt-5 max-w-2xl text-white/70">A research note, notebook, lab, open-source PR, model eval, demo, talk, or workshop others can reuse.</p>
					</div>
				</Reveal>

				<div className="mt-20 grid gap-10 lg:grid-cols-2 lg:gap-16">
					<Reveal from="left">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-tone-blue-deep">Our technical DNA · deep dives we’ve run</p>
						<h3 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Built on real AI depth.</h3>
						<p className="mt-3 text-ink/60">Ambassadors bring AIYatra’s deep-dive meetups to campus as chapters, circles, and hands-on labs.</p>
						<ul className="mt-7 divide-y divide-tone-blue-deep/10 overflow-hidden rounded-[22px] border border-tone-blue-deep/10 bg-white">
							{DEEP_DIVES.map(([t, tag], i) => (
								<motion.li
									key={t}
									initial={{ opacity: 0, x: -30 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: true }}
									transition={{ delay: i * 0.06 }}
									className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-tone-blue/40"
								>
									<span className="font-semibold text-ink">{t}</span>
									<span className="shrink-0 rounded-full bg-tone-blue px-3 py-1 text-xs font-semibold text-tone-blue-deep">{tag}</span>
								</motion.li>
							))}
						</ul>
					</Reveal>
					<Reveal from="right" delay={0.1}>
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-tone-blue-deep">What ambassadors add on campus</p>
						<div className="mt-7 space-y-4">
							{CAMPUS_LAYERS.map((c, i) => (
								<motion.div
									key={c.title}
									initial={{ opacity: 0, x: 40 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: true }}
									transition={{ delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1], duration: 0.7 }}
									className="hover-lift flex items-center gap-5 rounded-[22px] border border-tone-blue-deep/10 bg-white p-5"
									style={{ marginLeft: `${i * 4}%` }}
								>
									<span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ink font-display text-2xl font-bold text-white">{i + 1}</span>
									<span>
										<span className="block font-display text-lg font-bold text-ink">{c.title}</span>
										<span className="block text-sm text-ink/60">{c.body}</span>
									</span>
								</motion.div>
							))}
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}

/* ——— 03 · The role + squad ——— */

function Role() {
	return (
		<section id="role" className="relative scroll-mt-32 py-24 sm:py-32">
			<div className="wrap">
				<Heading n="03" label="The role" title="You, the" accent="Ambassador." body="Chapter founder · technical curator · peer teacher · community operator. A leadership role, not a badge." />
				<div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{ROLE.map((r, i) => <IconCard key={r.title} {...r} i={i} />)}
				</div>

				<div className="mt-24 grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
					<Reveal from="left">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-tone-blue-deep">Leadership squad</p>
						<h3 className="mt-3 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">Lead as a <span className="text-gradient">squad.</span></h3>
						<p className="mt-4 max-w-md text-lg text-ink/60">One ambassador shouldn’t carry a whole chapter. Strong chapters share ownership across six roles.</p>
					</Reveal>
					<SquadOrbit />
				</div>
			</div>
		</section>
	);
}

function SquadOrbit() {
	return (
		<>
			{/* Orbit on large screens */}
			<div className="relative mx-auto hidden aspect-square w-full max-w-[600px] lg:block">
				<svg aria-hidden="true" viewBox="0 0 600 600" className="absolute inset-0 h-full w-full">
					<circle cx="300" cy="300" r="215" fill="none" stroke="hsl(221 83% 53% / 0.18)" strokeWidth="1.5" className="flow-line" />
					{SQUAD.map((_, i) => {
						const a = (i / SQUAD.length) * Math.PI * 2 - Math.PI / 2;
						return <line key={i} x1="300" y1="300" x2={300 + Math.cos(a) * 215} y2={300 + Math.sin(a) * 215} stroke="hsl(221 83% 53% / 0.15)" strokeWidth="1.5" className="flow-line" />;
					})}
				</svg>
				<div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-gradient-to-br from-tone-blue-deep to-ink text-center text-white shadow-paper">
					<span className="ping-soft absolute inset-0 rounded-full bg-tone-blue-deep/30" />
					<span className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Your</span>
					<span className="relative font-display text-xl font-bold">Chapter</span>
				</div>
				{SQUAD.map((s, i) => {
					const a = (i / SQUAD.length) * Math.PI * 2 - Math.PI / 2;
					const left = 50 + Math.cos(a) * 35.8;
					const top = 50 + Math.sin(a) * 35.8;
					return (
						<motion.div
							key={s.title}
							style={{ left: `${left}%`, top: `${top}%` }}
							initial={{ opacity: 0, scale: 0.6 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true, margin: '0px 0px 120px 0px' }}
							transition={{ delay: 0.05 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
							className="group absolute -ml-[88px] -mt-[70px] w-44"
						>
							<div className="rounded-2xl border border-tone-blue-deep/10 bg-white p-3.5 text-center shadow-paper-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-paper">
								<span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-tone-blue text-tone-blue-deep transition-colors group-hover:bg-tone-blue-deep group-hover:text-white"><s.icon className="h-5 w-5" /></span>
								<p className="mt-2 font-display text-sm font-bold text-ink">{s.title}</p>
								<p className="mt-1 text-[11px] leading-snug text-ink/55">{s.body}</p>
							</div>
						</motion.div>
					);
				})}
			</div>
			{/* Grid on small screens */}
			<div className="grid gap-4 sm:grid-cols-2 lg:hidden">
				{SQUAD.map((s, i) => <IconCard key={s.title} {...s} i={i} />)}
			</div>
		</>
	);
}

/* ——— 04 · Blueprint ——— */

function Blueprint() {
	return (
		<section id="blueprint" className="relative scroll-mt-32 overflow-hidden bg-ink py-24 text-white sm:py-32">
			<div aria-hidden="true" className="absolute inset-0 opacity-50"><NeuralField density={0.00006} /></div>
			<div aria-hidden="true" className="pointer-events-none absolute -left-40 top-1/4 h-[500px] w-[500px] glow [--glow:hsl(221_83%_53%/0.45)]" />
			<div className="wrap relative">
				<Heading light n="04" label="Chapter blueprint" title="A simple operating model that works" accent="in any college." body="Start small, stay consistent, publish, scale." />
				<div className="relative mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
					<div aria-hidden="true" className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-[hsl(199_89%_60%/0.6)] to-transparent lg:block" />
					{BLUEPRINT.map((b, i) => (
						<Reveal key={b.title} from="up" delay={i * 0.1}>
							<div className="relative">
								<span className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white font-display text-2xl font-bold text-tone-blue-deep shadow-[0_0_0_8px_hsl(224_64%_14%)]">{String(i + 1).padStart(2, '0')}</span>
								<p className="mt-5 font-display text-xl font-bold">{b.title}</p>
								<p className="mt-1 text-sm text-white/55">{b.body}</p>
							</div>
						</Reveal>
					))}
				</div>

				<Reveal from="up"><p className="mt-20 text-xs font-semibold uppercase tracking-[0.24em] text-[hsl(199_89%_70%)]">Recommended monthly rhythm</p></Reveal>
				<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{MONTHLY_RHYTHM.map((w, i) => (
						<Reveal key={w.week} from={i < 2 ? 'left' : 'right'} delay={i * 0.08} className="flex">
							<Tilt className="flex flex-1" max={6}>
								<div className="spotlight flex flex-1 flex-col rounded-[24px] bg-white/[0.06] p-6 ring-1 ring-white/10">
									<div className="flex items-center justify-between">
										<span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-tone-blue-deep">{w.week}</span>
										<w.icon className="h-6 w-6 text-[hsl(199_89%_70%)]" />
									</div>
									<p className="mt-6 font-display text-2xl font-bold">{w.title}</p>
									<p className="mt-2 text-sm leading-relaxed text-white/60">{w.body}</p>
								</div>
							</Tilt>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}

/* ——— 05 · 9-month journey (scroll-linked) ——— */

function Journey() {
	const ref = useRef(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] });
	const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
	const height = useTransform(progress, [0, 1], ['0%', '100%']);
	return (
		<section id="journey" className="relative scroll-mt-32 py-24 sm:py-32">
			<div className="wrap grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
				<div className="lg:sticky lg:top-44 lg:self-start">
					<Heading n="05" label="9-month journey" title="From learner to" accent="chapter leader." body="Designed to fit one academic year." />
					<Reveal from="up" delay={0.1}>
						<div className="mt-8 flex items-start gap-3 rounded-2xl bg-tone-blue/60 p-5">
							<Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-tone-blue-deep" />
							<p className="text-sm font-medium leading-relaxed text-ink/80"><strong className="text-ink">The finish line:</strong> you can launch, operate, and hand over a serious AI chapter.</p>
						</div>
					</Reveal>
				</div>
				<ol ref={ref} className="relative">
					<span aria-hidden="true" className="absolute bottom-0 left-[31px] top-0 w-[3px] rounded-full bg-tone-blue" />
					<motion.span aria-hidden="true" style={{ height }} className="absolute left-[31px] top-0 w-[3px] rounded-full bg-gradient-to-b from-tone-blue-deep to-[hsl(199_89%_60%)]" />
					{JOURNEY.map((j, i) => (
						<Reveal as="li" key={j.title} from="right" delay={0.05} className="relative flex gap-6 pb-10 last:pb-0">
							<span className="relative z-10 flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-white text-center shadow-paper-sm ring-1 ring-tone-blue-deep/15">
								<span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink/45">Month</span>
								<span className="font-display text-lg font-bold leading-none text-tone-blue-deep">{j.month}</span>
							</span>
							<div className="hover-lift flex-1 rounded-[22px] border border-tone-blue-deep/10 bg-white p-6">
								<p className="font-display text-2xl font-bold text-ink">{j.title}</p>
								<p className="mt-1.5 text-ink/60">{j.body}</p>
								{i === JOURNEY.length - 1 && <span className="mt-3 inline-flex rounded-full bg-tone-blue-deep px-3 py-1 text-xs font-semibold text-white">Annual AI Showcase</span>}
							</div>
						</Reveal>
					))}
				</ol>
			</div>
		</section>
	);
}

/* ——— 06 · Tracks ——— */

function Tracks() {
	return (
		<section id="tracks" className="relative scroll-mt-32 overflow-hidden bg-paper-soft py-24 sm:py-32">
			<Aurora className="opacity-50" />
			<div className="wrap relative">
				<Heading n="06" label="Tracks" title="Pick your" accent="tracks." body="Breadth across modern AI. Depth through implementation and reading." />
				<div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{TRACKS.map((t, i) => (
						<Reveal key={t.title} from="zoom" delay={i * 0.05} className="flex">
							<Tilt className="flex flex-1" max={7}>
								<div className="spotlight group flex flex-1 flex-col rounded-[22px] border border-tone-blue-deep/10 bg-white/90 p-6 shadow-paper-sm">
									<div className="flex items-center justify-between">
										<t.icon className="h-7 w-7 text-tone-blue-deep transition-transform duration-500 group-hover:scale-125" />
										<span className="font-display text-sm font-bold text-tone-blue-deep/30">{String(i + 1).padStart(2, '0')}</span>
									</div>
									<p className="mt-6 font-display text-xl font-bold text-ink">{t.title}</p>
									<p className="mt-1.5 text-sm text-ink/60">{t.body}</p>
								</div>
							</Tilt>
						</Reveal>
					))}
				</div>
				<Reveal from="up"><p className="mt-8 text-center text-sm text-ink/55">Chapters choose tracks based on student maturity, faculty strength, and available compute.</p></Reveal>
			</div>
		</section>
	);
}

/* ——— 07 · Circles, labs, signature events, outputs, support ——— */

function LabsAndEvents() {
	return (
		<section id="labs" className="relative scroll-mt-32 py-24 sm:py-32">
			<div className="wrap">
				<div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
					<Heading n="07" label="Circles & labs" title="Read. Reproduce." accent="Explain." body="You don’t just consume AI content. You test it, rebuild it, and teach it. Accessible, honest, output-driven." />
					<Reveal from="right" delay={0.1}>
						<div className="flex items-center gap-2 sm:gap-3">
							{LOOP.map((l, i) => (
								<React.Fragment key={l.label}>
									<div className="flex flex-col items-center gap-2">
										<span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-tone-blue-deep to-[hsl(199_89%_60%)] text-white shadow-paper">
											<span className="ping-soft absolute inset-0 rounded-full bg-tone-blue-deep/25" style={{ animationDelay: `${i * 0.6}s` }} />
											<l.icon className="relative h-6 w-6" />
										</span>
										<span className="text-xs font-bold uppercase tracking-[0.18em] text-ink">{l.label}</span>
									</div>
									{i < LOOP.length - 1 && <ArrowRight className="mb-6 h-5 w-5 text-tone-blue-deep/50" />}
								</React.Fragment>
							))}
						</div>
					</Reveal>
				</div>
				<div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{LAB_FORMATS.map((f, i) => (
						<Reveal key={f.title} from={['left', 'up', 'right'][i % 3]} delay={(i % 3) * 0.07}>
							<div className="hover-lift flex h-full gap-4 rounded-[22px] border border-tone-blue-deep/10 bg-white p-6">
								<span className="font-display text-3xl font-bold text-tone-blue-deep/25">{i + 1}</span>
								<span>
									<span className="block font-display text-lg font-bold text-ink">{f.title}</span>
									<span className="mt-1 block text-sm leading-relaxed text-ink/60">{f.body}</span>
								</span>
							</div>
						</Reveal>
					))}
				</div>

				<div className="mt-24">
					<Heading label="Signature activities" title="Make your chapter the most useful" accent="AI room in college." />
					<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{SIGNATURE_EVENTS.map((e, i) => <IconCard key={e.title} {...e} i={i} />)}
					</div>
				</div>
			</div>
		</section>
	);
}

function OutputsAndSupport() {
	return (
		<section className="relative overflow-hidden bg-ink py-24 text-white sm:py-32">
			<div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 h-[520px] w-[520px] glow [--glow:hsl(221_83%_53%/0.45)]" />
			<div className="wrap relative">
				<Heading light label="How we measure" title="Output" accent="> attendance." body="Attendance matters, but what your chapter builds and leaves behind is the real signal." />
				<div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{OUTPUTS.map((o, i) => <IconCard key={o.title} {...o} i={i} light />)}
				</div>
				<Reveal from="up">
					<p className="mt-8 rounded-2xl bg-white/[0.06] p-5 text-center text-white/75 ring-1 ring-white/10"><strong className="text-white">Portfolio goal:</strong> by year-end, your chapter has a public body of work that proves learning happened.</p>
				</Reveal>

				<div className="mt-24 grid items-start gap-12 lg:grid-cols-[0.75fr_1.25fr]">
					<div className="lg:sticky lg:top-44">
						<Heading light label="Your support system" title="You’re" accent="never alone." body="AIYatra is your network, technical backbone, and amplifier." />
						<Reveal from="up" delay={0.1}>
							<div className="mt-8 rounded-[24px] bg-white p-6 text-ink">
								<p className="font-display text-2xl font-bold">You lead locally.</p>
								<p className="font-display text-2xl font-bold text-tone-blue-deep">We back you all the way.</p>
								<p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink/50">Kits · curriculum · mentors · stage</p>
							</div>
						</Reveal>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						{SUPPORT.map((s, i) => <IconCard key={s.title} {...s} i={i} light />)}
					</div>
				</div>
			</div>
		</section>
	);
}

/* ——— 08 · Recognition ladder ——— */

function Recognition() {
	return (
		<section id="recognition" className="relative scroll-mt-32 py-24 sm:py-32">
			<div className="wrap">
				<Heading n="08" label="Recognition ladder" title="Level up" accent="your journey." body="Recognition is earned through contribution, leadership, and continuity. Every badge means real work." />
				<div className="mt-16 grid items-end gap-4 md:grid-cols-5">
					{LADDER.map((l, i) => (
						<motion.div
							key={l.title}
							initial={{ opacity: 0, y: 80 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-60px' }}
							transition={{ delay: i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
							className="flex"
						>
							<div
								className={`group relative flex w-full flex-col justify-end overflow-hidden rounded-[24px] p-6 transition-transform duration-300 hover:-translate-y-2 md:min-h-[var(--h)] ${i === LADDER.length - 1 ? 'bg-gradient-to-br from-tone-blue-deep to-ink text-white shadow-paper' : 'border border-tone-blue-deep/10 bg-gradient-to-b from-tone-blue/40 to-white text-ink'}`}
								style={{ '--h': `${220 + i * 60}px` }}
							>
								<l.icon className={`h-8 w-8 ${i === LADDER.length - 1 ? 'text-[hsl(199_89%_70%)]' : 'text-tone-blue-deep'}`} />
								<p className={`mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] ${i === LADDER.length - 1 ? 'text-white/60' : 'text-tone-blue-deep'}`}>Level {l.level}</p>
								<p className="mt-1 font-display text-2xl font-bold leading-tight">{l.title}</p>
								<p className={`mt-2 text-sm leading-relaxed ${i === LADDER.length - 1 ? 'text-white/70' : 'text-ink/60'}`}>{l.body}</p>
							</div>
						</motion.div>
					))}
				</div>
				<Reveal from="up" delay={0.1}>
					<div className="mt-10 rounded-[28px] border border-tone-blue-deep/10 bg-paper-soft p-6 sm:p-8">
						<p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-tone-blue-deep"><Clock className="h-4 w-4" /> Your commitment</p>
						<div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{COMMITMENT.map(([v, d]) => (
								<div key={d} className="rounded-2xl bg-white p-5 ring-1 ring-tone-blue-deep/10">
									<p className="font-display text-4xl font-bold text-ink">{v}</p>
									<p className="mt-1 text-sm text-ink/55">{d}</p>
								</div>
							))}
						</div>
					</div>
				</Reveal>
			</div>
		</section>
	);
}

/* ——— 09 · 100-day plan ——— */

function LaunchPlan() {
	return (
		<section id="launch" className="relative scroll-mt-32 overflow-hidden bg-paper-soft py-24 sm:py-32">
			<div aria-hidden="true" className="bg-grid mask-fade-y absolute inset-0 opacity-60" />
			<div className="wrap relative">
				<Heading n="09" label="100-day launch plan" title="Your first" accent="100 days." body="From idea to an active chapter in one semester." />
				<div className="relative mt-16">
					<div aria-hidden="true" className="absolute left-0 right-0 top-[22px] hidden h-1 overflow-hidden rounded-full bg-tone-blue lg:block">
						<motion.div
							initial={{ scaleX: 0 }}
							whileInView={{ scaleX: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
							className="h-full origin-left bg-gradient-to-r from-tone-blue-deep to-[hsl(199_89%_60%)]"
						/>
					</div>
					<div className="grid gap-5 lg:grid-cols-5">
						{LAUNCH_PLAN.map((p, i) => (
							<Reveal key={p.days} from="up" delay={0.2 + i * 0.15}>
								<span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-tone-blue-deep font-display font-bold text-white shadow-[0_0_0_6px_hsl(214_100%_98%)]">{i + 1}</span>
								<div className="hover-lift mt-5 rounded-[22px] border border-tone-blue-deep/10 bg-white p-5">
									<p className="font-display text-lg font-bold text-tone-blue-deep">{p.days}</p>
									<p className="mt-2 text-sm leading-relaxed text-ink/65">{p.body}</p>
								</div>
							</Reveal>
						))}
					</div>
				</div>
				<Reveal from="zoom" delay={0.2}>
					<p className="mx-auto mt-14 max-w-3xl rounded-full bg-white px-6 py-4 text-center text-sm font-medium text-ink/70 shadow-paper-sm sm:text-base">
						<strong className="text-tone-blue-deep">Launch principle:</strong> small enough to execute · serious enough to matter · public enough to inspire.
					</p>
				</Reveal>
			</div>
		</section>
	);
}

/* ——— 10 · Who should apply + start your chapter ——— */

const FIT_STYLE = {
	yes: { icon: CheckCircle2, cls: 'bg-tone-blue-deep text-white', iconCls: 'text-white', body: 'text-white/80' },
	no: { icon: XCircle, cls: 'border border-tone-blue-deep/15 bg-white text-ink', iconCls: 'text-ink/40', body: 'text-ink/60' },
	info: { icon: Info, cls: 'border border-tone-blue-deep/10 bg-tone-blue/40 text-ink', iconCls: 'text-tone-blue-deep', body: 'text-ink/65' },
};

function Apply() {
	return (
		<section id="apply" className="relative scroll-mt-32 overflow-hidden py-24 sm:py-32">
			<div className="wrap">
				<Heading n="10" label="Who should apply" title="Is this" accent="you?" body="You don’t need to be an AI expert. You need curiosity, consistency, and the will to build with others." />
				<div className="mt-12 grid gap-4 md:grid-cols-2">
					{FIT.map((f, i) => {
						const s = FIT_STYLE[f.tone];
						return (
							<Reveal key={f.title} from={i % 2 ? 'right' : 'left'} delay={i * 0.06}>
								<div className={`flex h-full gap-4 rounded-[24px] p-6 ${s.cls}`}>
									<s.icon className={`h-7 w-7 shrink-0 ${s.iconCls}`} />
									<span>
										<span className="block font-display text-xl font-bold">{f.title}</span>
										<span className={`mt-1.5 block leading-relaxed ${s.body}`}>{f.body}</span>
									</span>
								</div>
							</Reveal>
						);
					})}
				</div>
			</div>

			<div className="wrap mt-24">
				<Reveal from="zoom">
					<div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-tone-blue-deep via-[hsl(224_76%_40%)] to-ink px-6 py-14 text-white shadow-paper sm:px-12 sm:py-20">
						<div aria-hidden="true" className="absolute inset-0 opacity-50"><NeuralField density={0.00012} /></div>
						<div className="relative text-center">
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Call to action</p>
							<h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] sm:text-6xl">Start your chapter.</h2>
							<p className="mx-auto mt-4 max-w-xl text-lg text-white/70">The chapter your college deserves is four steps away.</p>
						</div>
						<div className="relative mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{START_STEPS.map((s, i) => (
								<motion.div
									key={s.title}
									initial={{ opacity: 0, y: 40, rotate: i % 2 ? 3 : -3 }}
									whileInView={{ opacity: 1, y: 0, rotate: 0 }}
									viewport={{ once: true }}
									transition={{ delay: 0.2 + i * 0.12, type: 'spring', stiffness: 120, damping: 16 }}
									className="rounded-[22px] bg-white/[0.08] p-6 ring-1 ring-white/15"
								>
									<div className="flex items-center justify-between">
										<span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-tone-blue-deep"><s.icon className="h-5 w-5" /></span>
										<span className="font-display text-4xl font-bold text-white/15">{i + 1}</span>
									</div>
									<p className="mt-5 font-display text-2xl font-bold">{s.title}</p>
									<p className="mt-1 text-sm text-white/65">{s.body}</p>
								</motion.div>
							))}
						</div>
						<div className="relative mt-12 flex flex-wrap items-center justify-center gap-3">
							<a href={PROPOSAL_MAIL} className="active-press inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-tone-blue-deep transition-transform hover:-translate-y-0.5">
								<Mail className="h-4 w-4" /> Submit chapter proposal
							</a>
							<GhostButton light href={DECKS.ambassador} download><Download className="h-4 w-4" /> Program deck</GhostButton>
							<GhostButton light href={MEETUP_URL} target="_blank" rel="noreferrer">Attend a Saturday first <ArrowUpRight className="h-4 w-4" /></GhostButton>
						</div>
						<p className="relative mt-6 text-center text-sm text-white/55">
							Questions? <a href={QUESTION_MAIL} className="font-semibold text-white underline underline-offset-4">{CONTACT_EMAIL}</a>
						</p>
					</div>
				</Reveal>
			</div>
		</section>
	);
}

export default function AmbassadorsPage() {
	return (
		<div className="min-h-screen bg-white text-ink antialiased">
			<Helmet>
				<title>Student Ambassador Program — AIYatra</title>
				<meta
					name="description"
					content="AIYatra Student Ambassador Program: turn your campus into an AI research and builder chapter. For B.Tech and M.Sc students: a 9-month journey of paper circles, hands-on labs, open-source work and leadership, with kits, curriculum and mentors. Free."
				/>
			</Helmet>
			<Header />
			<main id="main">
				<Hero />
				<SectionNav />
				<WhyNow />
				<Mission />
				<Role />
				<Blueprint />
				<Journey />
				<Tracks />
				<LabsAndEvents />
				<OutputsAndSupport />
				<Recognition />
				<LaunchPlan />
				<Apply />
			</main>
			<Footer />
		</div>
	);
}
