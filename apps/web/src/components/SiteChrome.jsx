import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
	ArrowUpRight, CalendarDays, MapPin, Users, Github, Linkedin, Mail,
	Ticket, Megaphone, Menu, X, GraduationCap, FlaskConical, Heart,
} from 'lucide-react';
import {
	MEETUP_URL, AI_YATRA_LOGO, GROUP_STATS, CONTACT_EMAIL, LINKEDIN_URL, GITHUB_URL,
	formatDay, formatTime,
} from '@/data/site';
import { useEvents } from '@/lib/useEvents';
import { ScrollProgress, CursorGlow } from '@/components/Fx';

export const NAV_LINKS = [
	{ to: '/#meetups', label: 'Meetups' },
	{ to: '/ambassadors', label: 'Ambassadors' },
	{ to: '/labs', label: 'Research Labs' },
	{ to: '/#community', label: 'Community' },
	{ to: '/blog', label: 'Blog' },
	{ to: '/contact', label: 'Contact Us' },
];

function Logo({ dark = false }) {
	return (
		<span className="flex items-center gap-3">
			<span className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14">
				{/* Transparent mark, no tile: blue on light backgrounds, white on the dark footer. */}
				<img src={AI_YATRA_LOGO} alt="" aria-hidden="true" width="224" height="224" className={`h-full w-full object-contain ${dark ? 'brightness-0 invert' : ''}`} />
			</span>
			<span className="flex flex-col leading-none">
				<span className={`font-display text-[22px] font-bold ${dark ? 'text-white' : 'text-ink'}`}>
					AI Yatra
				</span>
				<span className={`mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.22em] sm:block ${dark ? 'text-white/60' : 'text-tone-blue-deep/80'}`}>
					Open-source AI community
				</span>
			</span>
		</span>
	);
}

export function AnnouncementBar() {
	const { next: ev, live } = useEvents();
	let message;
	if (!ev) message = 'The next Saturday session is being planned · follow AIYatra on Meetup to hear first';
	else if (live) message = `Happening now: ${ev.shortTitle} · until ${formatTime(ev.end)} IST`;
	else {
		message = `Next meetup: ${ev.shortTitle} · ${formatDay(ev.start)}, ${formatTime(ev.start)} IST`;
		if (ev.rsvpDeadline) message += ` · RSVP${ev.formUrl ? ' + Google Form' : ''} close ${formatDay(ev.rsvpDeadline)} EOD`;
		if (ev.formUrl) message += ' · both mandatory for venue entry';
	}
	const repeats = Array.from({ length: 4 });
	const pill = 'rounded-full bg-white/15 px-2.5 py-0.5 font-semibold hover:bg-white hover:text-tone-blue-deep';
	return (
		<div className="bg-gradient-to-r from-[hsl(224_76%_33%)] via-tone-blue-deep to-[hsl(224_76%_33%)] text-white" role="note" aria-label="Next meetup announcement">
			<div className="marquee-pause overflow-hidden py-2">
				<div className="marquee-track flex w-max items-center gap-10 pr-10">
					{[...repeats, ...repeats].map((_, i) => (
						<span key={i} aria-hidden={i > 0} className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-[12.5px] font-medium tracking-wide">
							<Megaphone className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
							<span>{message}</span>
							<a href={ev ? ev.url : MEETUP_URL} target="_blank" rel="noreferrer" className={`ml-1 ${pill}`} tabIndex={i === 0 ? 0 : -1}>
								{ev ? 'RSVP' : 'Meetup'}
							</a>
							{ev?.formUrl && (
								<a href={ev.formUrl} target="_blank" rel="noreferrer" className={pill} tabIndex={i === 0 ? 0 : -1}>
									Google Form
								</a>
							)}
						</span>
					))}
				</div>
			</div>
		</div>
	);
}

export function Header() {
	const [open, setOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const location = useLocation();

	useEffect(() => setOpen(false), [location.pathname, location.hash]);
	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 12);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<>
			<a href="#main" className="skip-link">Skip to content</a>
			<ScrollProgress />
			<CursorGlow />
			<AnnouncementBar />
			<header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-[0_10px_40px_-20px_hsl(221_83%_53%/0.35)]' : 'bg-white/0'}`}>
				<div className="wrap flex h-[72px] items-center justify-between gap-5">
					<Link to="/#top" className="flex shrink-0 items-center" aria-label="AI Yatra home">
						<Logo />
					</Link>
					<nav className="hidden items-center gap-1 rounded-full border border-tone-blue-deep/10 bg-white/70 p-1 text-sm font-medium text-ink/80 xl:flex">
						{NAV_LINKS.map((l) => (
							<Link key={l.label} to={l.to} className="whitespace-nowrap rounded-full px-4 py-2 transition-colors hover:bg-tone-blue hover:text-tone-blue-deep">
								{l.label}
							</Link>
						))}
					</nav>
					<div className="flex items-center gap-2">
						<a
							href={MEETUP_URL}
							target="_blank"
							rel="noreferrer"
							className="active-press group relative hidden h-11 shrink-0 items-center gap-2 overflow-hidden rounded-full bg-tone-blue-deep px-5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_hsl(221_83%_53%/0.8)] transition-transform hover:-translate-y-0.5 sm:inline-flex"
						>
							<span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
							Join free <ArrowUpRight className="h-4 w-4" />
						</a>
						<button
							type="button"
							onClick={() => setOpen((o) => !o)}
							aria-label={open ? 'Close menu' : 'Open menu'}
							aria-expanded={open}
							className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-tone-blue-deep/15 bg-white text-ink xl:hidden"
						>
							{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
						</button>
					</div>
				</div>
				<AnimatePresence>
					{open && (
						<motion.nav
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							className="glass overflow-hidden border-t border-tone-blue-deep/10 xl:hidden"
						>
							<div className="wrap flex flex-col gap-1 py-4">
								{NAV_LINKS.map((l, i) => (
									<motion.div key={l.label} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}>
										<Link to={l.to} className="block rounded-xl px-4 py-3 text-base font-semibold text-ink hover:bg-tone-blue">
											{l.label}
										</Link>
									</motion.div>
								))}
								<a href={MEETUP_URL} target="_blank" rel="noreferrer" className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-tone-blue-deep font-semibold text-white">
									Join free on Meetup <ArrowUpRight className="h-4 w-4" />
								</a>
							</div>
						</motion.nav>
					)}
				</AnimatePresence>
			</header>
		</>
	);
}

function FooterHeading({ children }) {
	return <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[hsl(199_89%_70%)]">{children}</p>;
}

const footerLink = 'text-white/70 transition-colors hover:text-white';

export function Footer() {
	return (
		<footer className="relative overflow-hidden bg-ink text-white">
			<div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[80%] -translate-x-1/2 glow [--glow:hsl(221_83%_53%/0.45)]" />
			<div className="wrap relative grid w-full gap-10 pb-8 pt-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
				<div>
					<Link to="/#top" aria-label="AI Yatra home"><Logo dark /></Link>
					<p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
						An open-source AI community from Hyderabad. Saturday meetups, a student ambassador
						network and an open research lab — free, forever, open to everyone.
					</p>
					<div className="mt-5 flex items-center gap-2.5">
						{[
							{ href: MEETUP_URL, label: 'Meetup', Icon: Users },
							{ href: GITHUB_URL, label: 'GitHub', Icon: Github },
							{ href: LINKEDIN_URL, label: 'LinkedIn', Icon: Linkedin },
							{ href: `mailto:${CONTACT_EMAIL}`, label: 'Email', Icon: Mail },
						].map(({ href, label, Icon }) => (
							<a key={label} href={href} target={href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer" aria-label={label} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition-all hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-ink">
								<Icon className="h-[18px] w-[18px]" />
							</a>
						))}
					</div>
				</div>

				<div>
					<FooterHeading>Three verticals</FooterHeading>
					<ul className="mt-4 space-y-3 text-sm font-medium">
						<li><Link to="/#meetups" className={`inline-flex items-center gap-2 ${footerLink}`}><CalendarDays className="h-4 w-4" /> Saturday Meetups</Link></li>
						<li><Link to="/ambassadors" className={`inline-flex items-center gap-2 ${footerLink}`}><GraduationCap className="h-4 w-4" /> Student Ambassadors</Link></li>
						<li><Link to="/labs" className={`inline-flex items-center gap-2 ${footerLink}`}><FlaskConical className="h-4 w-4" /> Research Labs</Link></li>
					</ul>
				</div>

				<div>
					<FooterHeading>Explore</FooterHeading>
					<ul className="mt-4 space-y-3 text-sm font-medium">
						<li><Link to="/blog" className={footerLink}>Blog & recaps</Link></li>
						<li><Link to="/#community" className={footerLink}>People & voices</Link></li>
						<li><Link to="/#faq" className={footerLink}>Quick answers</Link></li>
						<li><Link to="/contact" className={footerLink}>Contact us</Link></li>
						<li><a href={MEETUP_URL} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1 ${footerLink}`}>Meetup group <ArrowUpRight className="h-3.5 w-3.5" /></a></li>
					</ul>
				</div>

				<div>
					<FooterHeading>Show up</FooterHeading>
					<ul className="mt-4 space-y-3 text-sm text-white/70">
						<li className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(199_89%_70%)]" /> {GROUP_STATS.venue}</li>
						<li className="flex items-center gap-2.5"><CalendarDays className="h-4 w-4 shrink-0 text-[hsl(199_89%_70%)]" /> Every Saturday · mornings IST</li>
						<li className="flex items-center gap-2.5"><Ticket className="h-4 w-4 shrink-0 text-[hsl(199_89%_70%)]" /> Free, always</li>
						<li className="flex items-center gap-2.5"><Mail className="h-4 w-4 shrink-0 text-[hsl(199_89%_70%)]" /> <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white">{CONTACT_EMAIL}</a></li>
					</ul>
				</div>
			</div>

			<div className="wrap relative flex w-full flex-col items-center justify-between gap-2 border-t border-white/10 py-4 text-center text-xs text-white/50 sm:flex-row sm:text-left">
				<p className="inline-flex items-center gap-1.5">Made with <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" aria-label="love" /> in Hyderabad · open to the world</p>
				<p>© 2026 AIYatra · Research. Build. Transform.</p>
				<a href="#top" className="font-semibold text-white/70 hover:text-white">Back to top ↑</a>
			</div>
		</footer>
	);
}
