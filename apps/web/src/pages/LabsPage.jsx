import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
	ArrowRight, ArrowUpRight, FlaskConical, Cpu, Wrench, Layers, Network,
	FileText, Sparkles, Mail, BookOpen, MessagesSquare,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import { Header, Footer } from '@/components/SiteChrome';
import { CONTACT_EMAIL } from '@/data/site';
import { LABS_CATEGORIES, LABS_TOTAL_PAPERS, arxivUrl, alphaxivUrl } from '@/data/labs';

const CATEGORY_ICONS = {
	'small-language-models': Cpu,
	'agent-harnesses': Wrench,
	'transformer-layers': Layers,
	'new-architectures': Network,
};

function TrackTile({ category }) {
	const Icon = CATEGORY_ICONS[category.id] || FlaskConical;
	return (
		<a
			href={`#${category.id}`}
			className="hover-lift group flex h-full flex-col rounded-2xl border-2 border-ink bg-paper-soft p-6 shadow-paper-sm"
		>
			<div className="flex items-center justify-between gap-3">
				<span className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ink ${category.tone}`}>
					<Icon className="h-6 w-6" />
				</span>
				<span className="rounded-full border-2 border-ink bg-paper px-3 py-1 font-hand text-lg font-bold">
					{category.index}
				</span>
			</div>
			<h3 className="mt-4 font-hand text-3xl font-bold leading-tight">
				{category.title}
			</h3>
			<p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-ink/75">
				{category.blurb}
			</p>
			<p className="mt-4 inline-flex items-center gap-1.5 border-t-2 border-dashed border-ink/30 pt-4 text-sm font-bold">
				<FileText className="h-4 w-4" />
				{category.papers.length} papers
				<span className="ml-auto inline-flex items-center gap-1 text-tone-blue-deep transition-transform group-hover:translate-x-1">
					Jump in <ArrowRight className="h-4 w-4" />
				</span>
			</p>
		</a>
	);
}

function PaperCard({ paper }) {
	return (
		<article className="hover-lift flex h-full flex-col rounded-2xl border-2 border-ink bg-paper p-5 shadow-paper-sm">
			<div className="flex flex-wrap items-center gap-2">
				<span className="rounded-full border border-ink/60 bg-paper-soft px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-ink/70">
					arXiv:{paper.arxivId}
				</span>
				<span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/50">
					{paper.year}
				</span>
			</div>
			<h4 className="mt-3 text-base font-bold leading-snug">{paper.title}</h4>
			<p className="mt-1 text-xs font-semibold uppercase tracking-widest text-ink/55">
				{paper.authors}
			</p>
			<p className="mt-2.5 flex-1 text-sm font-medium leading-relaxed text-ink/75">
				{paper.summary}
			</p>
			<div className="mt-3 flex flex-wrap gap-1.5">
				{paper.tags.map((t) => (
					<span
						key={t}
						className="rounded-full border border-ink/40 bg-paper-soft px-2 py-0.5 text-[11px] font-semibold text-ink/70"
					>
						{t}
					</span>
				))}
			</div>
			<div className="mt-4 flex flex-wrap gap-2 border-t-2 border-dashed border-ink/25 pt-4">
				<a
					href={arxivUrl(paper.arxivId)}
					target="_blank"
					rel="noreferrer"
					className="active-press inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-ink bg-tone-blue px-3 text-xs font-bold transition-transform hover:-translate-y-0.5"
				>
					Read on arXiv <ArrowUpRight className="h-3.5 w-3.5" />
				</a>
				<a
					href={alphaxivUrl(paper.arxivId)}
					target="_blank"
					rel="noreferrer"
					className="active-press inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-ink bg-tone-yellow px-3 text-xs font-bold transition-transform hover:-translate-y-0.5"
				>
					Discuss on AlphaXiv <MessagesSquare className="h-3.5 w-3.5" />
				</a>
			</div>
		</article>
	);
}

function TrackSection({ category }) {
	const Icon = CATEGORY_ICONS[category.id] || FlaskConical;
	return (
		<section id={category.id} className="scroll-mt-24 border-t-2 border-ink/15">
			<div className="wrap py-16">
				<Reveal>
					<div className="flex flex-col gap-6 rounded-2xl border-2 border-ink bg-paper-soft p-6 shadow-paper sm:p-8 lg:flex-row lg:items-center">
						<span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-ink ${category.tone}`}>
							<Icon className="h-8 w-8" />
						</span>
						<div className="min-w-0 flex-1">
							<p className="text-[11px] font-bold uppercase tracking-[0.25em] text-ink/55">
								Track {category.index} · {category.papers.length} papers
							</p>
							<h2 className="mt-1 font-hand text-4xl font-bold leading-tight sm:text-5xl">
								{category.title}
							</h2>
							<p className="mt-2 max-w-3xl text-base font-medium leading-relaxed text-ink/75">
								{category.blurb}
							</p>
						</div>
					</div>
				</Reveal>

				<Reveal delay={0.06}>
					<div className="mt-6 rounded-2xl border-2 border-dashed border-ink/50 bg-paper p-5 sm:p-6">
						<p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-tone-blue-deep">
							<BookOpen className="h-4 w-4" /> What this track asks
						</p>
						<ul className="mt-3 grid gap-2.5 md:grid-cols-3">
							{category.focus.map((q, i) => (
								<li key={q} className="rounded-xl border border-ink/40 bg-paper-soft px-4 py-3 text-sm font-semibold leading-snug">
									<span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink bg-tone-yellow text-[10px] font-bold">
										{i + 1}
									</span>
									{q}
								</li>
							))}
						</ul>
					</div>
				</Reveal>

				<div className="mt-8 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
					{category.papers.map((p, i) => (
						<Reveal key={p.arxivId} delay={(i % 3) * 0.06} className="flex">
							<PaperCard paper={p} />
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}

export default function LabsPage() {
	return (
		<div className="grain min-h-screen bg-paper text-ink antialiased">
			<Helmet>
				<title>AI Yatra Labs — Research Tracks & Papers</title>
				<meta
					name="description"
					content="AI Yatra Labs: curated arXiv and AlphaXiv reading lists across small language models, agent harnesses, transformer layers, and new architectures. Free, open research for the Hyderabad AI community."
				/>
			</Helmet>
			<Header />
			<main>
				{/* Hero */}
				<section id="top" className="relative overflow-hidden">
					<div className="wrap grid gap-12 pb-14 pt-14 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-[clamp(50px,6vw,110px)] lg:pb-16 lg:pt-[74px]">
						<div>
							<Reveal>
								<span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-tone-violet px-4 py-1.5 text-sm font-semibold shadow-paper-sm">
									<FlaskConical className="h-4 w-4" /> AI Yatra Labs · research wing
								</span>
							</Reveal>
							<Reveal delay={0.08}>
								<h1 className="mt-6 font-hand text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
									Read the papers.<br />
									<span className="text-tone-blue-deep underline decoration-tone-coral decoration-4 underline-offset-8">Build the future.</span>
								</h1>
							</Reveal>
							<Reveal delay={0.16}>
								<p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
									Labs is where AIYatra goes deep — four focused research tracks with
									hand-picked papers from <strong className="text-ink">arXiv</strong> and{' '}
									<strong className="text-ink">AlphaXiv</strong> only. No generic filler:
									every paper maps directly to something we study, reimplement, or
									debate on Saturdays.
								</p>
							</Reveal>
							<Reveal delay={0.24}>
								<div className="mt-8 flex flex-wrap items-center gap-4">
									<a
										href="#tracks"
										className="active-press inline-flex h-12 items-center gap-2 rounded-xl border-2 border-ink bg-tone-blue-deep px-6 text-base font-semibold text-paper shadow-paper transition-transform hover:-translate-y-0.5"
									>
										Browse the four tracks <ArrowRight className="h-5 w-5" />
									</a>
									<Link
										to="/#events"
										className="active-press inline-flex h-12 items-center gap-2 rounded-xl border-2 border-ink bg-paper-soft px-6 text-base font-semibold text-ink shadow-paper transition-transform hover:-translate-y-0.5"
									>
										See it live on Saturdays
									</Link>
								</div>
							</Reveal>
							<Reveal delay={0.3}>
								<div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t-2 border-dashed border-ink/30 pt-6">
									{[
										{ value: '4', label: 'Research tracks' },
										{ value: String(LABS_TOTAL_PAPERS), label: 'Curated papers' },
										{ value: '2', label: 'Sources: arXiv + AlphaXiv' },
									].map((s) => (
										<div key={s.label}>
											<p className="font-hand text-4xl font-bold">{s.value}</p>
											<p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">{s.label}</p>
										</div>
									))}
								</div>
							</Reveal>
						</div>
						<Reveal delay={0.15}>
							<div className="rounded-2xl border-2 border-ink bg-paper-soft p-6 shadow-paper sm:p-7">
								<p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">
									<Sparkles className="h-4 w-4" /> How to use this page
								</p>
								<ol className="mt-4 space-y-3">
									{[
										['Pick a track', 'Each tile below is one Labs research direction — start with the one closest to your curiosity.'],
										['Read on arXiv, discuss on AlphaXiv', 'Every card links the canonical paper and its open discussion thread.'],
										['Bring it to Saturday', 'We reimplement one paper per meetup arc — come with questions, leave with running code.'],
									].map(([title, body], i) => (
										<li key={title} className="flex items-start gap-3 rounded-xl border-2 border-ink bg-paper px-4 py-3">
											<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-tone-yellow text-xs font-bold">
												{i + 1}
											</span>
											<span>
												<span className="block text-sm font-bold leading-tight">{title}</span>
												<span className="mt-0.5 block text-sm font-medium leading-relaxed text-ink/75">{body}</span>
											</span>
										</li>
									))}
								</ol>
							</div>
						</Reveal>
					</div>
				</section>

				{/* Track tiles */}
				<section id="tracks" className="scroll-mt-24 border-y-2 border-ink bg-paper-soft">
					<div className="wrap py-20">
						<Reveal>
							<p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-tone-blue-deep">
								<FlaskConical className="h-4 w-4" /> The four tracks
							</p>
							<h2 className="mt-3 max-w-2xl font-hand text-5xl font-bold leading-tight sm:text-6xl">
								Four tiles.<br />One lab.
							</h2>
							<p className="mt-4 max-w-2xl text-lg text-ink-soft">
								Each tile opens a curated shelf of papers. Pick one and go deep —
								everything is free, open, and linked to its source.
							</p>
						</Reveal>
						<div className="mt-10 grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
							{LABS_CATEGORIES.map((c, i) => (
								<Reveal key={c.id} delay={(i % 4) * 0.07} className="flex">
									<TrackTile category={c} />
								</Reveal>
							))}
						</div>
					</div>
				</section>

				{/* Per-track shelves */}
				<div className="bg-tone-blue/20">
					{LABS_CATEGORIES.map((c) => (
						<TrackSection key={c.id} category={c} />
					))}
				</div>

				{/* Sourcing note */}
				<section className="border-t-2 border-ink bg-paper-soft">
					<div className="wrap py-16">
						<Reveal>
							<div className="rounded-2xl border-2 border-ink bg-paper p-6 shadow-paper-sm sm:p-8">
								<p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/55">
									<FileText className="h-4 w-4" /> Sourcing policy
								</p>
								<p className="mt-2 font-hand text-3xl font-bold leading-tight">
									arXiv + AlphaXiv. Nothing else.
								</p>
								<p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-ink/75">
									Every paper on this page links to its canonical arXiv abstract page
									and the matching AlphaXiv discussion page for the same arXiv ID.
									No blog summaries, no generic roundups — if a paper does not map
									directly to one of the four tracks, it does not make the shelf.
									Spotted a track-relevant paper we missed? Write to us and we will review it.
								</p>
								<div className="mt-5 flex flex-wrap gap-3">
									<a
										href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('AI Yatra Labs — paper suggestion')}`}
										className="active-press inline-flex h-11 items-center gap-2 rounded-xl border-2 border-ink bg-tone-blue-deep px-5 text-sm font-semibold text-paper shadow-paper-sm transition-transform hover:-translate-y-0.5"
									>
										<Mail className="h-4 w-4" /> Suggest a paper
									</a>
									<a
										href="#tracks"
										className="active-press inline-flex h-11 items-center gap-2 rounded-xl border-2 border-ink bg-paper-soft px-5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
									>
										Back to the tracks
									</a>
								</div>
							</div>
						</Reveal>
					</div>
				</section>

				{/* Closing CTA */}
				<section className="bg-ink text-paper">
					<div className="wrap-narrow flex flex-col items-center py-24 text-center">
						<Reveal className="flex flex-col items-center">
							<span className="inline-flex items-center gap-2 rounded-full border-2 border-paper/40 px-4 py-1.5 text-sm font-semibold text-tone-yellow">
								<FlaskConical className="h-4 w-4" /> Research → build → transform
							</span>
							<h2 className="mx-auto mt-8 max-w-3xl font-hand text-5xl font-bold leading-tight sm:text-7xl">
								Papers are better<br />with <span className="text-tone-yellow">running code.</span>
							</h2>
							<p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-paper/70">
								Join a Saturday session where we turn one of these papers into
								something running on your laptop.
							</p>
							<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
								<Link
									to="/#events"
									className="active-press inline-flex h-12 items-center gap-2 rounded-xl border-2 border-paper bg-tone-yellow px-7 text-base font-bold text-ink transition-transform hover:-translate-y-0.5"
								>
									Find the next build session <ArrowRight className="h-5 w-5" />
								</Link>
							</div>
						</Reveal>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}
