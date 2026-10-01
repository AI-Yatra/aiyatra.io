import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
	ArrowRight, ArrowUpRight, CheckCircle2, Github, Linkedin, Loader2, Mail, MapPin,
	MessageSquare, Send, Users, CalendarDays, GraduationCap, FlaskConical, AlertCircle,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import { Header, Footer } from '@/components/SiteChrome';
import { NeuralField, Aurora, useSpotlight } from '@/components/Fx';
import { SectionLabel } from '@/components/Kit';
import { CONTACT_EMAIL, MEETUP_URL, LINKEDIN_URL, GITHUB_URL, GROUP_STATS } from '@/data/site';

// The site is static (GitHub Pages), so messages are relayed by FormSubmit
// (formsubmit.co, free, no account). The first submission sends a one-time
// activation email to CONTACT_EMAIL; after that every message lands there.
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;
const MAX_QUERY = 2000;

const TOPICS = [
	{ icon: CalendarDays, label: 'Meetups' },
	{ icon: GraduationCap, label: 'Ambassadors' },
	{ icon: FlaskConical, label: 'Research Labs' },
	{ icon: Users, label: 'Speaking / partnering' },
	{ icon: MessageSquare, label: 'Something else' },
];

const CHANNELS = [
	{ icon: Mail, label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
	{ icon: Users, label: 'Meetup', value: 'meetup.com/aiyatra', href: MEETUP_URL },
	{ icon: Linkedin, label: 'LinkedIn', value: 'linkedin.com/company/aiyatra', href: LINKEDIN_URL },
	{ icon: Github, label: 'GitHub', value: 'github.com/AI-Yatra', href: GITHUB_URL },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v) {
	const e = {};
	if (!v.firstName.trim()) e.firstName = 'Please tell us your first name.';
	if (!v.lastName.trim()) e.lastName = 'Please tell us your last name.';
	if (!EMAIL_RE.test(v.email.trim())) e.email = 'That email doesn’t look right.';
	if (v.query.trim().length < 10) e.query = 'A little more detail helps us reply well (10+ characters).';
	return e;
}

function Field({ id, label, error, children, hint }) {
	return (
		<div>
			<label htmlFor={id} className="mb-1.5 flex items-center justify-between text-sm font-semibold text-ink">
				{label}
				{hint}
			</label>
			{children}
			<AnimatePresence>
				{error && (
					<motion.p
						id={`${id}-error`}
						initial={{ opacity: 0, y: -4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -4 }}
						className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-tone-blue-deep"
					>
						<AlertCircle className="h-3.5 w-3.5" /> {error}
					</motion.p>
				)}
			</AnimatePresence>
		</div>
	);
}

const inputCls = (bad) => `w-full rounded-2xl border bg-white px-4 py-3.5 text-[15px] text-ink placeholder:text-ink/35 outline-none transition-all duration-200 focus:border-tone-blue-deep focus:shadow-[0_0_0_4px_hsl(221_83%_53%/0.12)] ${bad ? 'border-tone-blue-deep/70 bg-tone-blue/30' : 'border-tone-blue-deep/15 hover:border-tone-blue-deep/35'}`;

function ContactForm() {
	const [values, setValues] = useState({ firstName: '', lastName: '', email: '', query: '', topic: TOPICS[0].label, honey: '' });
	const [touched, setTouched] = useState({});
	const [status, setStatus] = useState('idle'); // idle | sending | sent | error
	const errors = validate(values);
	const show = (k) => (touched[k] || status === 'tried') && errors[k];

	const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value.slice(0, k === 'query' ? MAX_QUERY : 200) }));
	const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

	const mailtoFallback = () => {
		const body = `${values.query}\n\n— ${values.firstName} ${values.lastName} (${values.email})`;
		window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`[${values.topic}] Message from ${values.firstName} ${values.lastName}`)}&body=${encodeURIComponent(body)}`;
	};

	const submit = async (e) => {
		e.preventDefault();
		if (Object.keys(errors).length) {
			setStatus('tried');
			setTouched({ firstName: true, lastName: true, email: true, query: true });
			return;
		}
		if (values.honey) { setStatus('sent'); return; } // bot
		setStatus('sending');
		try {
			const res = await fetch(FORM_ENDPOINT, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify({
					_subject: `AIYatra contact · ${values.topic} · ${values.firstName} ${values.lastName}`,
					_template: 'table',
					_captcha: 'false',
					_replyto: values.email.trim(),
					'First name': values.firstName.trim(),
					'Last name': values.lastName.trim(),
					Email: values.email.trim(),
					Topic: values.topic,
					Query: values.query.trim(),
				}),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok || String(data.success) === 'false') throw new Error(data.message || `HTTP ${res.status}`);
			setStatus('sent');
		} catch {
			setStatus('error');
		}
	};

	if (status === 'sent') {
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.96 }}
				animate={{ opacity: 1, scale: 1 }}
				className="flex min-h-[520px] flex-col items-center justify-center p-8 text-center sm:p-12"
				role="status"
			>
				<motion.span
					initial={{ scale: 0, rotate: -40 }}
					animate={{ scale: 1, rotate: 0 }}
					transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
					className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-tone-blue-deep to-[hsl(199_89%_60%)] text-white shadow-paper"
				>
					<span className="ping-soft absolute inset-0 rounded-full bg-tone-blue-deep/30" />
					<CheckCircle2 className="relative h-12 w-12" />
				</motion.span>
				<h3 className="mt-8 font-display text-3xl font-bold text-ink sm:text-4xl">Message sent, {values.firstName}.</h3>
				<p className="mt-3 max-w-sm text-ink/60">
					Thanks for reaching out. The AIYatra crew reads every message and will reply to <strong className="text-ink">{values.email}</strong>.
				</p>
				<button
					type="button"
					onClick={() => { setValues({ firstName: '', lastName: '', email: '', query: '', topic: TOPICS[0].label, honey: '' }); setTouched({}); setStatus('idle'); }}
					className="mt-8 inline-flex h-11 items-center gap-2 rounded-full border border-tone-blue-deep/20 bg-white px-5 text-sm font-semibold text-ink transition-colors hover:border-tone-blue-deep hover:text-tone-blue-deep"
				>
					Send another message
				</button>
			</motion.div>
		);
	}

	return (
		<form onSubmit={submit} noValidate className="p-6 sm:p-10">
			<p className="text-xs font-semibold uppercase tracking-[0.24em] text-tone-blue-deep">Send us a message</p>
			<h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">How can we help?</h2>

			<fieldset className="mt-7">
				<legend className="mb-2.5 text-sm font-semibold text-ink">What’s it about?</legend>
				<div className="flex flex-wrap gap-2">
					{TOPICS.map((t) => {
						const on = values.topic === t.label;
						return (
							<button
								key={t.label}
								type="button"
								aria-pressed={on}
								onClick={() => setValues((v) => ({ ...v, topic: t.label }))}
								className={`relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${on ? 'text-white' : 'bg-tone-blue/50 text-ink/70 hover:bg-tone-blue hover:text-tone-blue-deep'}`}
							>
								{on && <motion.span layoutId="topic-pill" className="absolute inset-0 rounded-full bg-tone-blue-deep" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
								<t.icon className="relative h-4 w-4" />
								<span className="relative">{t.label}</span>
							</button>
						);
					})}
				</div>
			</fieldset>

			<div className="mt-6 grid gap-5 sm:grid-cols-2">
				<Field id="firstName" label="First name" error={show('firstName')}>
					<input id="firstName" name="firstName" autoComplete="given-name" value={values.firstName} onChange={set('firstName')} onBlur={blur('firstName')} placeholder="Ada" aria-invalid={Boolean(show('firstName'))} aria-describedby={show('firstName') ? 'firstName-error' : undefined} className={inputCls(show('firstName'))} />
				</Field>
				<Field id="lastName" label="Last name" error={show('lastName')}>
					<input id="lastName" name="lastName" autoComplete="family-name" value={values.lastName} onChange={set('lastName')} onBlur={blur('lastName')} placeholder="Lovelace" aria-invalid={Boolean(show('lastName'))} aria-describedby={show('lastName') ? 'lastName-error' : undefined} className={inputCls(show('lastName'))} />
				</Field>
			</div>

			<div className="mt-5">
				<Field id="email" label="Email address" error={show('email')}>
					<input id="email" name="email" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={set('email')} onBlur={blur('email')} placeholder="you@example.com" aria-invalid={Boolean(show('email'))} aria-describedby={show('email') ? 'email-error' : undefined} className={inputCls(show('email'))} />
				</Field>
			</div>

			<div className="mt-5">
				<Field id="query" label="Your query" error={show('query')} hint={<span className="text-xs font-medium text-ink/40">{values.query.length}/{MAX_QUERY}</span>}>
					<textarea id="query" name="query" rows={6} value={values.query} onChange={set('query')} onBlur={blur('query')} placeholder="Tell us what you’d like to know, build, or bring to AIYatra…" aria-invalid={Boolean(show('query'))} aria-describedby={show('query') ? 'query-error' : undefined} className={`${inputCls(show('query'))} resize-y leading-relaxed`} />
				</Field>
			</div>

			{/* Honeypot: hidden from people, irresistible to bots. */}
			<input type="text" name="_honey" tabIndex={-1} autoComplete="off" value={values.honey} onChange={set('honey')} className="hidden" aria-hidden="true" />

			<AnimatePresence>
				{status === 'error' && (
					<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-5 overflow-hidden">
						<div className="flex flex-col gap-3 rounded-2xl bg-tone-blue/60 p-4 text-sm text-ink/80 sm:flex-row sm:items-center sm:justify-between">
							<span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0 text-tone-blue-deep" /> We couldn’t send that just now.</span>
							<button type="button" onClick={mailtoFallback} className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-tone-blue-deep hover:underline">
								Send it from your email app <ArrowUpRight className="h-4 w-4" />
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="mt-7 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-xs leading-relaxed text-ink/45">Your details are only used to reply to you.</p>
				<button
					type="submit"
					disabled={status === 'sending'}
					className="group relative inline-flex h-13 min-h-[52px] items-center justify-center gap-2 overflow-hidden rounded-full bg-tone-blue-deep px-8 text-[15px] font-semibold text-white shadow-[0_14px_34px_-12px_hsl(221_83%_53%/0.8)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-12px_hsl(221_83%_53%/0.9)] disabled:translate-y-0 disabled:opacity-80"
				>
					<span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
					{status === 'sending'
						? <><Loader2 className="relative h-4 w-4 animate-spin" /><span className="relative">Sending…</span></>
						: <><span className="relative">Send message</span><Send className="relative h-4 w-4 transition-transform group-hover:-rotate-12 group-hover:translate-x-0.5" /></>}
				</button>
			</div>
		</form>
	);
}

function ChannelCard({ c, i }) {
	const spot = useSpotlight();
	const external = !c.href.startsWith('mailto');
	return (
		<Reveal from="left" delay={0.2 + i * 0.07}>
			<a
				href={c.href}
				target={external ? '_blank' : undefined}
				rel="noreferrer"
				onMouseMove={spot}
				className="spotlight hover-lift group flex items-center gap-4 rounded-2xl border border-tone-blue-deep/10 bg-white/90 p-4 shadow-paper-sm"
			>
				<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-tone-blue-deep to-[hsl(199_89%_60%)] text-white transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
					<c.icon className="h-5 w-5" />
				</span>
				<span className="min-w-0 flex-1">
					<span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-tone-blue-deep">{c.label}</span>
					<span className="block truncate font-semibold text-ink">{c.value}</span>
				</span>
				<ArrowUpRight className="h-5 w-5 shrink-0 text-ink/30 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-tone-blue-deep" />
			</a>
		</Reveal>
	);
}

export default function ContactPage() {
	return (
		<div className="min-h-screen bg-white text-ink antialiased">
			<Helmet>
				<title>Contact Us — AIYatra</title>
				<meta
					name="description"
					content="Contact AIYatra: questions about Saturday meetups, the Student Ambassador Program, AIYatra Research Labs, speaking or partnering. Write to global.aiyatra@gmail.com or send us a message."
				/>
			</Helmet>
			<Header />
			<main id="main">
				<section id="top" className="relative overflow-hidden">
					<Aurora />
					<div aria-hidden="true" className="bg-grid mask-fade-y absolute inset-0" />
					<div aria-hidden="true" className="absolute inset-0 opacity-70"><NeuralField density={0.00006} /></div>

					<div className="wrap relative grid gap-12 pb-24 pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:pt-20">
						<div className="lg:pt-6">
							<Reveal from="down">
								<SectionLabel>Contact us</SectionLabel>
							</Reveal>
							<Reveal from="left" delay={0.08}>
								<h1 className="mt-6 font-display text-5xl font-bold leading-[1] text-ink sm:text-6xl xl:text-7xl">
									Let’s talk <span className="text-gradient">AI.</span>
								</h1>
							</Reveal>
							<Reveal from="left" delay={0.16}>
								<p className="mt-6 max-w-md text-lg leading-relaxed text-ink/60">
									Questions about a Saturday session, starting a campus chapter, joining a research
									track, speaking, or partnering with us. Drop a note and a real human from the crew writes back.
								</p>
							</Reveal>

							<div className="mt-9 space-y-3">
								{CHANNELS.map((c, i) => <ChannelCard key={c.label} c={c} i={i} />)}
							</div>

							<Reveal from="up" delay={0.5}>
								<div className="mt-6 flex items-start gap-3 rounded-2xl bg-tone-blue/50 p-4 text-sm text-ink/70">
									<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-tone-blue-deep" />
									<span>Or meet us in person at a Saturday session in <strong className="text-ink">{GROUP_STATS.venue}</strong>. RSVP on Meetup for the venue.</span>
								</div>
							</Reveal>
						</div>

						<Reveal from="right" delay={0.15}>
							<div className="relative">
								<div aria-hidden="true" className="glow absolute -inset-10 [--glow:hsl(221_83%_53%/0.25)]" />
								<div className="relative overflow-hidden rounded-[32px] border border-white bg-white/95 shadow-paper ring-1 ring-tone-blue-deep/10">
									<div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-tone-blue-deep via-[hsl(199_89%_60%)] to-tone-blue-deep" />
									<ContactForm />
								</div>
							</div>
						</Reveal>
					</div>
				</section>

				<section className="bg-paper-soft py-20">
					<div className="wrap grid gap-5 md:grid-cols-3">
						{[
							{ icon: CalendarDays, title: 'Coming to a meetup?', body: 'RSVP on Meetup and fill the event’s Google Form. Both are needed for venue entry.', href: '/#meetups', cta: 'Next session' },
							{ icon: GraduationCap, title: 'Starting a chapter?', body: 'Read the program, form a 3–6 person core team, then send your chapter proposal.', href: '/ambassadors', cta: 'Ambassador program' },
							{ icon: FlaskConical, title: 'Suggesting a paper?', body: 'Labs tracks take arXiv papers that map to SLMs, agents, transformer layers or new architectures.', href: '/labs', cta: 'Research Labs' },
						].map((q, i) => (
							<Reveal key={q.title} from={['left', 'up', 'right'][i]} delay={i * 0.08} className="flex">
								<Link to={q.href} className="hover-lift group flex flex-1 flex-col rounded-[24px] border border-tone-blue-deep/10 bg-white p-6">
									<q.icon className="h-7 w-7 text-tone-blue-deep" />
									<p className="mt-5 font-display text-xl font-bold text-ink">{q.title}</p>
									<p className="mt-2 flex-1 text-sm leading-relaxed text-ink/60">{q.body}</p>
									<span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-tone-blue-deep">{q.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
								</Link>
							</Reveal>
						))}
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}
