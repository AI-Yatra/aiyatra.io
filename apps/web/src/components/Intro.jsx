import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Aurora } from '@/components/Fx';
import { GROUP_STATS } from '@/data/site';

/*
 * The home page's opening screen.
 *
 *   AI YATRA sits on top with model names circling it; a small neural network
 *   lives underneath — prompt words feed in on the left, signals pulse
 *   through, "Research · Build · Transform" comes out on the right.
 *
 *   On scroll the wordmark stays put while the neurons wink out one by one,
 *   and the rest of the page rises over the screen. The pin is a single
 *   screen long, so the content arrives as quickly as a normal scroll.
 *
 * One requestAnimationFrame loop (only while on screen) draws the canvas and
 * moves the model names through refs, so React never re-renders mid-scroll.
 */

const MODELS = ['ChatGPT', 'Claude', 'Gemini', 'Kimi', 'DeepSeek', 'Llama', 'Qwen', 'Mistral', 'Grok', 'Gemma', 'Phi', 'GLM'];
const INPUTS = ['How', 'do I', 'build', 'AI?'];
const OUTPUTS = ['Research', 'Build', 'Transform'];
const LAYERS = [INPUTS.length, 6, 8, 6, OUTPUTS.length];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => 1 - Math.pow(1 - clamp(t), 3);
const span = (p, a, b) => clamp((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;

function layout(w, h, word) {
	const mobile = w < 768;
	// The network fills the space between the wordmark and the scroll cue.
	// `word.visibleBottom` is the bottom of what's actually on screen: at the
	// very top of the page the announcement bar pushes this scene down a bit.
	const top = word.bottom + (mobile ? 48 : 64);
	const bottom = word.visibleBottom - (mobile ? 104 : 116);
	const cy = (top + bottom) / 2;
	const half = Math.max(40, (bottom - top) / 2);
	const x0 = mobile ? w * 0.24 : w * 0.3;
	const x1 = mobile ? w * 0.76 : w * 0.7;
	const neurons = LAYERS.map((n, l) => {
		const x = x0 + ((x1 - x0) * l) / (LAYERS.length - 1);
		const spread = half * (0.45 + 0.55 * (n / 8));
		return Array.from({ length: n }, (_, i) => ({
			x,
			y: cy + (n === 1 ? 0 : (i / (n - 1) - 0.5) * 2 * spread),
			l,
			i,
			phase: Math.random() * Math.PI * 2,
			speed: 1.2 + Math.random() * 1.8,
			// When this neuron winks out during the scroll.
			gone: Math.random() * 0.34,
		}));
	});
	const edges = [];
	for (let l = 0; l < LAYERS.length - 1; l++) {
		for (const a of neurons[l]) {
			for (const b of neurons[l + 1]) edges.push({ a, b, l, off: Math.random(), speed: 0.35 + Math.random() * 0.45 });
		}
	}
	return {
		mobile,
		neurons,
		edges,
		r: mobile ? 4 : 6,
		ring: { cx: word.cx, cy: word.cy - word.height * 0.04, rx: Math.min(w * 0.47, word.width * 0.58), ry: word.height * (mobile ? 0.6 : 0.5) },
	};
}

const LETTER_FILL = 'bg-gradient-to-b from-[hsl(224_64%_16%)] via-[hsl(221_83%_50%)] to-[hsl(199_89%_62%)] bg-clip-text text-transparent';

function Wordmark({ reduce }) {
	let i = -1;
	return (
		<span className="flex flex-col items-center md:flex-row md:gap-[0.2em]">
			{[['A', 'I'], ['Y', 'A', 'T', 'R', 'A']].map((word) => (
				<span key={word.join('')} className="flex">
					{word.map((ch) => {
						i += 1;
						return (
							<span key={i} className="inline-block overflow-hidden pb-[0.04em]">
								<motion.span
									initial={reduce ? false : { y: '70%', opacity: 0 }}
									animate={{ y: '0%', opacity: 1 }}
									transition={{ delay: 0.15 + i * 0.06, duration: 1, ease: [0.22, 1, 0.36, 1] }}
									className={`inline-block ${LETTER_FILL}`}
								>
									{ch}
								</motion.span>
							</span>
						);
					})}
				</span>
			))}
		</span>
	);
}

export default function Intro() {
	const ref = useRef(null);
	const canvasRef = useRef(null);
	const wordBoxRef = useRef(null);
	const cueRef = useRef(null);
	const chipRefs = useRef([]);
	const reduce = useReducedMotion();
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

	// Gentle pointer tilt for the wordmark.
	const px = useMotionValue(0);
	const py = useMotionValue(0);
	const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [7, -7]), { stiffness: 90, damping: 18 });
	const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [-5, 5]), { stiffness: 90, damping: 18 });
	const echoX = useTransform(px, (v) => v * -22);
	const echoY = useTransform(py, (v) => v * -14);
	useEffect(() => {
		if (reduce || !window.matchMedia('(pointer: fine)').matches) return undefined;
		const onMove = (e) => {
			px.set(e.clientX / window.innerWidth - 0.5);
			py.set(e.clientY / window.innerHeight - 0.5);
		};
		window.addEventListener('pointermove', onMove, { passive: true });
		return () => window.removeEventListener('pointermove', onMove);
	}, [px, py, reduce]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return undefined;
		const ctx = canvas.getContext('2d');
		let w = 0;
		let h = 0;
		let L = null;
		let frame = 0;
		let running = false;
		let inView = true;
		let smooth = scrollYProgress.get();
		const born = performance.now();

		const measureWord = () => {
			const box = wordBoxRef.current.getBoundingClientRect();
			const host = canvas.getBoundingClientRect();
			return {
				cx: box.left - host.left + box.width / 2,
				cy: box.top - host.top + box.height / 2,
				bottom: box.bottom - host.top,
				visibleBottom: Math.min(host.height, window.innerHeight - host.top),
				width: box.width,
				height: box.height,
			};
		};

		const resize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			L = layout(w, h, measureWord());
		};

		const dot = (x, y, r, color) => {
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(x, y, r, 0, Math.PI * 2);
			ctx.fill();
		};

		const render = (p, time, age) => {
			ctx.clearRect(0, 0, w, h);
			const { neurons, edges, r } = L;
			// Forms on load (layer by layer), winks out on scroll (neuron by neuron).
			const born_ = (l) => (reduce ? 1 : ease((age - 0.5 - l * 0.18) / 0.5));
			const alive = (n) => born_(n.l) * (1 - ease(span(p, n.gone, n.gone + 0.14)));
			const thinking = reduce ? 0.6 : ease((age - 1.6) / 0.8);

			ctx.lineWidth = 1;
			for (const e of edges) {
				const grow = reduce ? 1 : ease((age - 0.62 - (e.l + 1) * 0.18) / 0.5);
				const k = Math.min(alive(e.a), alive(e.b));
				if (grow <= 0 || k <= 0.01) continue;
				ctx.strokeStyle = `rgba(37, 99, 235, ${0.16 * k})`;
				ctx.beginPath();
				ctx.moveTo(e.a.x, e.a.y);
				ctx.lineTo(lerp(e.a.x, e.b.x, grow), lerp(e.a.y, e.b.y, grow));
				ctx.stroke();
			}

			if (thinking > 0) {
				for (const e of edges) {
					const k = Math.min(alive(e.a), alive(e.b));
					if (k <= 0.02) continue;
					const t = (time * e.speed + e.off) % 1;
					const a = thinking * k * Math.sin(t * Math.PI);
					const x = lerp(e.a.x, e.b.x, t);
					const y = lerp(e.a.y, e.b.y, t);
					dot(x, y, 4, `rgba(56, 189, 248, ${a * 0.3})`);
					dot(x, y, 1.6, `rgba(37, 99, 235, ${a * 0.95})`);
				}
			}

			for (const layer of neurons) {
				for (const n of layer) {
					const s = alive(n);
					const out = ease(span(p, n.gone, n.gone + 0.14));
					// A winking-out neuron leaves a small rising spark.
					if (out > 0 && out < 1) dot(n.x, n.y - out * 26, 2.2 * (1 - out), `rgba(37, 99, 235, ${0.8 * (1 - out)})`);
					if (s <= 0.01) continue;
					const act = thinking * (0.5 + 0.5 * Math.sin(time * n.speed + n.phase));
					dot(n.x, n.y, r * (2.3 + act * 1.4) * s, `rgba(37, 99, 235, ${0.08 * s + act * 0.15 * s})`);
					dot(n.x, n.y, r * s, '#ffffff');
					ctx.strokeStyle = `rgba(37, 99, 235, ${0.85 * s})`;
					ctx.lineWidth = 1.6;
					ctx.beginPath();
					ctx.arc(n.x, n.y, r * s, 0, Math.PI * 2);
					ctx.stroke();
					ctx.lineWidth = 1;
					dot(n.x, n.y, r * 0.45 * s, `rgba(37, 99, 235, ${0.35 + act * 0.65})`);
				}
			}

			// Input words on the left, output words on the right.
			ctx.font = `600 ${L.mobile ? 12 : 15}px "Space Grotesk", Inter, sans-serif`;
			ctx.textBaseline = 'middle';
			ctx.textAlign = 'right';
			neurons[0].forEach((n, i) => {
				const a = alive(n) * (reduce ? 1 : ease((age - 0.4 - i * 0.1) / 0.4));
				ctx.fillStyle = `rgba(13, 27, 62, ${0.75 * a})`;
				ctx.fillText(INPUTS[i], n.x - r - (L.mobile ? 8 : 14), n.y);
			});
			ctx.textAlign = 'left';
			const last = neurons[neurons.length - 1];
			last.forEach((n, i) => {
				const a = alive(n) * (reduce ? 1 : ease((age - 1.9 - i * 0.25) / 0.5));
				ctx.fillStyle = `rgba(37, 99, 235, ${a})`;
				ctx.fillText(OUTPUTS[i], n.x + r + (L.mobile ? 8 : 14), n.y);
			});
		};

		const updateDom = (p, time, age) => {
			// Model names circling the wordmark: far side behind it, near side in front.
			const { ring } = L;
			MODELS.forEach((_, i) => {
				const el = chipRefs.current[i];
				if (!el) return;
				const enter = reduce ? 1 : ease((age - 0.9 - i * 0.08) / 0.7);
				const ang = (i / MODELS.length) * Math.PI * 2 + time * 0.09;
				const depth = Math.sin(ang);
				const half = (el.offsetWidth || 80) / 2 + 8;
				const x = clamp(ring.cx + Math.cos(ang) * ring.rx, half, w - half);
				const y = ring.cy + depth * ring.ry;
				const scale = 0.8 + 0.24 * (depth + 1) / 2;
				el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
				el.style.opacity = String(enter * (0.25 + 0.75 * (depth + 1) / 2));
				el.style.zIndex = depth > 0 ? '4' : '2';
			});
			if (cueRef.current) cueRef.current.style.opacity = String(1 - ease(span(p, 0, 0.12)));
		};

		const tick = (now) => {
			const target = scrollYProgress.get();
			smooth += (target - smooth) * 0.2;
			if (Math.abs(target - smooth) < 0.0004) smooth = target;
			const age = (now - born) / 1000;
			const time = reduce ? 0 : now / 1000;
			render(smooth, time, age);
			updateDom(smooth, time, age);
			if (running) frame = requestAnimationFrame(tick);
		};

		const sync = () => {
			const should = inView && !document.hidden;
			if (should && !running) {
				running = true;
				frame = requestAnimationFrame(tick);
			} else if (!should && running) {
				running = false;
				cancelAnimationFrame(frame);
			}
		};

		resize();
		tick(performance.now());
		sync();
		const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); });
		io.observe(ref.current);
		const ro = new ResizeObserver(() => { resize(); });
		ro.observe(canvas);
		ro.observe(wordBoxRef.current);
		document.fonts?.ready.then(() => resize());
		document.addEventListener('visibilitychange', sync);
		return () => {
			running = false;
			cancelAnimationFrame(frame);
			io.disconnect();
			ro.disconnect();
			document.removeEventListener('visibilitychange', sync);
		};
	}, [scrollYProgress, reduce]);

	return (
		<section id="top" ref={ref} aria-label="AI Yatra" className="relative -mt-[72px] h-[200svh]">
			<div className="sticky top-0 h-[100svh] overflow-hidden bg-white">
				<Aurora />
				<div aria-hidden="true" className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" />

				<canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 z-[1] h-full w-full" />

				{/* Model names (z 2 = behind the wordmark, z 4 = in front) */}
				<div aria-hidden="true" className="pointer-events-none absolute inset-0">
					{MODELS.map((m, i) => (
						<span
							key={m}
							ref={(el) => { chipRefs.current[i] = el; }}
							className="absolute left-0 top-0 whitespace-nowrap rounded-full bg-white px-3 py-1 font-display text-xs font-semibold text-ink opacity-0 shadow-paper-sm ring-1 ring-tone-blue-deep/15 will-change-transform sm:px-3.5 sm:py-1.5 sm:text-sm"
						>
							<span className="mr-1.5 inline-block h-1.5 w-1.5 -translate-y-px rounded-full bg-tone-blue-deep align-middle" />{m}
						</span>
					))}
				</div>

				{/* The wordmark — stays put while the page scrolls over it */}
				<div className="absolute inset-x-0 top-[15svh] z-[3] flex justify-center [perspective:1200px] md:top-[13svh]">
					<motion.div
						ref={wordBoxRef}
						style={{ rotateX, rotateY }}
						className="relative select-none font-display text-[31vw] font-bold leading-[0.82] tracking-[-0.05em] [font-size-adjust:none] md:text-[min(24vw,38svh)]"
					>
						<span className="sr-only">AI Yatra</span>
						<span aria-hidden="true" className="relative block">
							<motion.span
								style={{ x: echoX, y: echoY }}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 1.2, duration: 1.2 }}
								className="pointer-events-none absolute inset-0 flex translate-x-[1.2%] translate-y-[2.5%] flex-col items-center justify-center text-transparent [-webkit-text-stroke:1.5px_hsl(221_83%_53%/0.22)] md:flex-row md:gap-[0.2em]"
							>
								<span>AI</span><span>YATRA</span>
							</motion.span>
							<Wordmark reduce={reduce} />
						</span>
					</motion.div>
				</div>

				{/* Scroll cue */}
				<div ref={cueRef} className="absolute inset-x-0 bottom-0 z-[5] pb-[calc(max(1.25rem,env(safe-area-inset-bottom))+36px)] sm:pb-[calc(2rem+36px)]">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.8 }}
						className="wrap flex items-end justify-between text-[11px] font-semibold uppercase tracking-[0.24em] text-ink/50"
					>
						<span className="hidden sm:block">{GROUP_STATS.members.toLocaleString()} members</span>
						<span className="mx-auto flex flex-col items-center gap-2 sm:mx-0">
							<span className="relative flex h-10 w-6 justify-center rounded-full border-2 border-tone-blue-deep/40">
								<motion.span
									animate={reduce ? undefined : { y: [4, 18, 4], opacity: [1, 0.2, 1] }}
									transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
									className="mt-1 h-2 w-1 rounded-full bg-tone-blue-deep"
								/>
							</span>
							<span className="hidden sm:inline">Research · Build · Transform</span>
						</span>
						<span className="hidden sm:block">Every Saturday · Free</span>
					</motion.div>
				</div>
			</div>
		</section>
	);
}

/** Wraps the page content so it rises over the pinned <Intro> as one sheet. */
export function IntroSheet({ children }) {
	return (
		<div className="relative z-10 -mt-[100svh] rounded-t-[36px] bg-white shadow-[0_-40px_100px_-30px_hsl(221_83%_53%/0.45)] [overflow:clip] sm:rounded-t-[56px]">
			<div aria-hidden="true" className="absolute inset-x-0 top-0 z-20 flex justify-center pt-3">
				<span className="h-1.5 w-14 rounded-full bg-tone-blue-deep/20" />
			</div>
			{children}
		</div>
	);
}
