import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowDown, ArrowUpRight, Asterisk, Smile, Pause, Play } from 'lucide-react';
import { Aurora } from '@/components/Fx';
import { MEETUP_URL } from '@/data/site';

/*
 * The home page's opening screen: the promise on the left, a Saturday
 * meetup on the right — a speaker at the board, people around the table
 * listening and coding.
 *
 * The scene is one illustration (public/illustrations/meetup-scene.webp) on a
 * near-white ground. mix-blend-multiply drops that ground into whatever is
 * behind it (the aurora and grid), and a soft edge mask fades the borders,
 * so it sits in the page instead of on it. The notes around it are live text.
 *
 * It sits in normal page flow: nothing pins or covers it while scrolling.
 */

const EASE = [0.22, 1, 0.36, 1];

function rise(reduce, delay, from = 24) {
	if (reduce) return {};
	return {
		initial: { opacity: 0, y: from },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.9, delay, ease: EASE },
	};
}

function bob(reduce, paused, { y = 8, duration = 6, delay = 0 } = {}) {
	if (reduce || paused) return { animate: { y: 0 }, transition: { duration: 0.4 } };
	return { animate: { y: [0, -y, 0] }, transition: { duration, delay, repeat: Infinity, ease: 'easeInOut' } };
}

const SCENE_MASK = 'linear-gradient(to bottom, transparent, #000 7%, #000 90%, transparent), linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)';

function MeetupScene({ paused, reduce }) {
	return (
		<div className="relative mx-auto w-full max-w-[640px]">
			{/* The illustration itself */}
			<motion.div className="relative mix-blend-multiply" {...rise(reduce, 0.25, 30)}>
				<motion.img
					src="/illustrations/meetup-scene.webp"
					alt="An AIYatra meetup: a speaker explains a chart on the board while people around a table listen and code on their laptops"
					width="1100"
					height="1030"
					decoding="async"
					fetchpriority="high"
					draggable="false"
					className="h-auto w-full select-none"
					style={{ WebkitMaskImage: SCENE_MASK, maskImage: SCENE_MASK, WebkitMaskComposite: 'source-in', maskComposite: 'intersect' }}
					{...bob(reduce, paused, { y: 6, duration: 9 })}
				/>
			</motion.div>

			{/* "Big ideas start with a hello." — written on the page, top left */}
			<motion.div
				aria-hidden="true"
				className="absolute left-[-9%] top-[3%] z-10 hidden sm:block"
				style={{ rotate: -7 }}
				{...(reduce ? {} : { initial: { opacity: 0, x: -16 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.9, delay: 1.1, ease: EASE } })}
			>
				<motion.div {...bob(reduce, paused, { y: 5, duration: 7, delay: 0.4 })} className="flex items-start gap-3 font-display text-[clamp(1.25rem,2.1vw,1.85rem)] font-bold leading-[1.15] tracking-[-0.03em] text-[hsl(221_45%_42%)]">
					<ArrowUpRight className="mt-3 h-10 w-10 shrink-0 stroke-[1.25]" />
					<span>Big ideas start<br />with a hello.</span>
				</motion.div>
			</motion.div>

			{/* Spinning asterisk, top right */}
			<svg aria-hidden="true" viewBox="0 0 100 100" className="absolute right-[-9%] top-[0%] z-10 hidden h-[9%] w-[9%] text-tone-blue-deep/75 sm:block">
				<g className={reduce || paused ? '' : 'spin-slow'} style={{ transformOrigin: '50% 50%' }}>
					{[0, 30, 60, 90, 120, 150].map((a) => (
						<line key={a} x1="50" y1="8" x2="50" y2="92" stroke="currentColor" strokeWidth="4" strokeLinecap="round" transform={`rotate(${a} 50 50)`} />
					))}
				</g>
			</svg>

			{/* "A seat for your curiosity" note, bottom right */}
			<motion.div
				className="absolute bottom-[9%] right-[-4%] z-10"
				style={{ rotate: -3 }}
				{...(reduce ? {} : { initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.7, delay: 1.4, ease: EASE } })}
			>
				<motion.div
					{...bob(reduce, paused, { y: 8, duration: 5.5, delay: 0.7 })}
					className="flex items-center gap-3 whitespace-nowrap rounded-full bg-white px-5 py-3 font-display text-[15px] font-semibold text-ink shadow-[0_18px_40px_-16px_hsl(221_83%_45%/0.45)] ring-1 ring-tone-blue-deep/10 sm:px-6 sm:py-4 sm:text-lg"
				>
					<Asterisk className="h-5 w-5 text-ink sm:h-6 sm:w-6" strokeWidth={2} />
					A seat for your curiosity
				</motion.div>
			</motion.div>
		</div>
	);
}

export default function MeetupHero() {
	const reduce = useReducedMotion();
	const [paused, setPaused] = useState(false);

	return (
		<section id="top" aria-label="AI Yatra" className="relative -mt-[72px] overflow-hidden bg-white pt-[72px]">
			{/* Background fades to plain white at the bottom so the next section starts seamlessly. */}
			<div aria-hidden="true" className="absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_65%,transparent)]">
				<Aurora className="opacity-70" />
				<div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_45%,#000_15%,transparent_70%)]" />
			</div>

			<div className="wrap relative grid min-h-[calc(100svh-108px)] items-center gap-10 py-10 lg:grid-cols-[1fr_1.05fr] lg:gap-6 lg:py-8">
				{/* The promise */}
				<div className="relative z-10">
					<motion.p {...rise(reduce, 0.05, 12)} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-ink sm:text-xs">
						<span className="relative flex h-2 w-2"><span className="ping-soft absolute inset-0 rounded-full bg-tone-blue-deep" /><span className="relative h-2 w-2 rounded-full bg-tone-blue-deep" /></span>
						An open AI community
						<span className="text-ink/30">/</span>
						Hyderabad &amp; beyond
					</motion.p>

					<h1 className="mt-6 font-display text-[clamp(3.2rem,10.5vw,7.4rem)] font-bold leading-[0.92] tracking-[-0.05em] text-ink [font-size-adjust:none]">
						{['Learn AI.', 'Build with'].map((line, i) => (
							<span key={line} className="block overflow-hidden pb-[0.06em]">
								<motion.span className="block" {...(reduce ? {} : { initial: { y: '100%' }, animate: { y: '0%' }, transition: { duration: 1, delay: 0.12 + i * 0.1, ease: EASE } })}>
									{line}
								</motion.span>
							</span>
						))}
						<span className="block overflow-hidden pb-[0.12em]">
							<motion.span className="text-gradient block" {...(reduce ? {} : { initial: { y: '100%' }, animate: { y: '0%' }, transition: { duration: 1, delay: 0.32, ease: EASE } })}>
								your people.
							</motion.span>
						</span>
					</h1>

					<motion.p {...rise(reduce, 0.5)} className="mt-6 max-w-xl text-lg leading-relaxed text-ink/65 sm:text-xl">
						A place for students, builders and curious minds.
						Come for the meetups. Grow through campus chapters.
						Turn research into something real, together.
					</motion.p>

					<motion.div {...rise(reduce, 0.62)} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
						<a
							href={MEETUP_URL}
							target="_blank"
							rel="noreferrer"
							className="active-press group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-full bg-tone-blue-deep pl-7 pr-6 text-base font-semibold text-white shadow-[0_18px_40px_-14px_hsl(221_83%_53%/0.85)] transition-all hover:-translate-y-0.5 sm:h-[60px] sm:text-[17px]"
						>
							<span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
							<span className="relative">Find your next meetup</span>
							<ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
						</a>
						<a href="#verticals" className="group inline-flex items-center gap-2 border-b-2 border-ink/20 pb-1.5 text-base font-semibold text-ink transition-colors hover:border-tone-blue-deep hover:text-tone-blue-deep sm:text-[17px]">
							Find your place <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
						</a>
					</motion.div>

					<motion.div {...rise(reduce, 0.74)} className="mt-9 flex items-center gap-3 text-sm font-medium text-ink/55">
						<span className="flex -space-x-1.5">
							{[Asterisk, ArrowUpRight, Smile].map((Icon, i) => (
								<span key={i} className="flex h-8 w-8 items-center justify-center rounded-full bg-tone-blue text-tone-blue-deep ring-2 ring-white">
									<Icon className="h-4 w-4" />
								</span>
							))}
						</span>
						Free to join. Curiosity is all you need.
					</motion.div>
				</div>

				{/* The meetup */}
				<div className="relative">
					<motion.p {...rise(reduce, 0.9, 8)} className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-ink/45 lg:text-left lg:pl-[9%]">
						Good things happen together
					</motion.p>
					<MeetupScene paused={paused} reduce={reduce} />
					<div className="mt-3 flex items-center justify-between px-[2%] text-[11px] font-semibold uppercase tracking-[0.3em] text-ink/45">
						<span>Meet. Build. Belong.</span>
						{!reduce && (
							<button
								type="button"
								onClick={() => setPaused((p) => !p)}
								aria-pressed={paused}
								className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] normal-case tracking-normal text-ink/55 transition-colors hover:text-tone-blue-deep"
							>
								{paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
								{paused ? 'Play motion' : 'Pause motion'}
							</button>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
