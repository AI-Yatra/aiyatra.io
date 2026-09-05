import React from 'react';
import { Link } from 'react-router-dom';
import {
	ArrowUpRight, CalendarDays, MapPin, Users, Github, Linkedin, Mail,
	MessageCircle, Heart, Ticket,
} from 'lucide-react';
import {
	MEETUP_URL, EVENT_URL, AI_YATRA_LOGO, GROUP_STATS,
	CONTACT_EMAIL, LINKEDIN_URL, GITHUB_URL,
} from '@/data/site';

export const NAV_LINKS = [
	{ to: '/#events', label: 'Gatherings' },
	{ to: '/#moments', label: 'Field Notes' },
	{ to: '/#method', label: 'The Yatra Way' },
	{ to: '/#voices', label: 'Kind Words' },
	{ to: '/#about', label: 'The Movement' },
	{ to: '/ambassadors', label: 'Ambassadors' },
	{ to: '/labs', label: 'Labs' },
	{ to: '/blog', label: 'Blog' },
];

function Logo() {
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

export function Header() {
	return (
		<header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/95 backdrop-blur-sm">
			<div className="wrap flex h-[76px] items-center justify-between gap-5">
				<Link to="/#top" className="flex shrink-0 items-center" aria-label="AI Yatra home">
					<Logo />
				</Link>
				<nav className="hidden items-center gap-6 text-sm font-medium text-ink md:flex lg:gap-7">
					{NAV_LINKS.map((l) => (
						<Link key={l.label} to={l.to} className="whitespace-nowrap transition-colors hover:text-tone-blue-deep">
							{l.label}
						</Link>
					))}
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

function FooterHeading({ children }) {
	return (
		<p className="text-[11px] font-bold uppercase tracking-[0.25em] text-tone-yellow">
			{children}
		</p>
	);
}

export function Footer() {
	return (
		<footer className="bg-ink text-paper" style={{ borderTop: '5px solid hsl(var(--tone-yellow))' }}>
			<div className="wrap grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.9fr_1fr_0.9fr]">
				{/* Brand */}
				<div>
					<Link to="/#top" className="flex items-center gap-2.5" aria-label="AI Yatra home">
						<img src={AI_YATRA_LOGO} alt="" aria-hidden="true" className="h-14 w-14 shrink-0 object-contain" />
						<span className="flex flex-col leading-none">
							<span className="text-[22px] font-extrabold tracking-tight text-paper">AI Yatra</span>
							<span className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-paper/60">
								Research · Build · Transform
							</span>
						</span>
					</Link>
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
						<li><Link to="/ambassadors" className="text-tone-yellow transition-colors hover:text-paper">Ambassadors — new</Link></li>
						<li><Link to="/labs" className="text-tone-yellow transition-colors hover:text-paper">Labs — research tracks</Link></li>
						<li><Link to="/blog" className="text-paper/75 transition-colors hover:text-tone-yellow">Blog</Link></li>
						<li><Link to="/#events" className="text-paper/75 transition-colors hover:text-tone-yellow">Gatherings</Link></li>
						<li><Link to="/#moments" className="text-paper/75 transition-colors hover:text-tone-yellow">Field Notes</Link></li>
						<li><Link to="/#voices" className="text-paper/75 transition-colors hover:text-tone-yellow">Kind Words</Link></li>
						<li><Link to="/#about" className="text-paper/75 transition-colors hover:text-tone-yellow">Movement</Link></li>
						<li><a href={MEETUP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-paper/75 transition-colors hover:text-tone-yellow">Meetup <ArrowUpRight className="h-3.5 w-3.5" /></a></li>
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
					<FooterHeading>Follow</FooterHeading>
					<ul className="mt-4 space-y-3 text-sm font-semibold">
						<li>
							<a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 text-paper/75 transition-colors hover:text-tone-yellow">
								<Mail className="h-4 w-4" /> {CONTACT_EMAIL}
							</a>
						</li>
						<li>
							<a href={MEETUP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-paper/75 transition-colors hover:text-tone-yellow">
								<MessageCircle className="h-4 w-4" /> Meetup inbox
							</a>
						</li>
					</ul>
					<div className="mt-5 flex items-center gap-3">
						<a href={MEETUP_URL} target="_blank" rel="noreferrer" aria-label="Meetup" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-paper/30 text-paper/75 transition-colors hover:border-tone-yellow hover:text-tone-yellow">
							<Users className="h-5 w-5" />
						</a>
						<a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-paper/30 text-paper/75 transition-colors hover:border-tone-yellow hover:text-tone-yellow">
							<Github className="h-5 w-5" />
						</a>
						<a href={LINKEDIN_URL} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-paper/30 text-paper/75 transition-colors hover:border-tone-yellow hover:text-tone-yellow">
							<Linkedin className="h-5 w-5" />
						</a>
						<a href={`mailto:${CONTACT_EMAIL}`} aria-label="Email" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-paper/30 text-paper/75 transition-colors hover:border-tone-yellow hover:text-tone-yellow">
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
