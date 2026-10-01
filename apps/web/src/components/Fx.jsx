import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring } from 'framer-motion';

/**
 * Drifting "neural network" of nodes + links, drawn on a canvas behind a
 * section. Nodes lean away from the pointer.
 *
 * Built to stay off the main thread's critical path: it only animates while
 * on screen and the tab is visible, draws at 1x (it's a soft background),
 * batches every link into a handful of strokes by opacity, and skips the
 * square root for pairs that are obviously too far apart.
 */
export function NeuralField({ className = '', density = 0.00008 }) {
	const ref = useRef(null);

	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return undefined;
		const ctx = canvas.getContext('2d', { alpha: true });
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const MAX = 130;
		const MAX2 = MAX * MAX;
		const BUCKETS = 4;
		let w = 0;
		let h = 0;
		let nodes = [];
		let frame = 0;
		let running = false;
		let inView = false;
		const pointer = { x: -9999, y: -9999 };

		const resize = () => {
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = w;
			canvas.height = h;
			const count = Math.max(24, Math.min(70, Math.round(w * h * density)));
			nodes = Array.from({ length: count }, () => ({
				x: Math.random() * w,
				y: Math.random() * h,
				vx: (Math.random() - 0.5) * 0.35,
				vy: (Math.random() - 0.5) * 0.35,
				r: Math.random() * 1.6 + 0.9,
			}));
		};

		const paths = Array.from({ length: BUCKETS }, () => []);
		const draw = () => {
			ctx.clearRect(0, 0, w, h);
			for (const b of paths) b.length = 0;
			const n = nodes.length;
			for (let i = 0; i < n; i++) {
				const a = nodes[i];
				for (let j = i + 1; j < n; j++) {
					const b = nodes[j];
					const dx = a.x - b.x;
					if (dx > MAX || dx < -MAX) continue;
					const dy = a.y - b.y;
					if (dy > MAX || dy < -MAX) continue;
					const d2 = dx * dx + dy * dy;
					if (d2 < MAX2) {
						const bucket = Math.min(BUCKETS - 1, Math.floor((Math.sqrt(d2) / MAX) * BUCKETS));
						paths[bucket].push(a.x, a.y, b.x, b.y);
					}
				}
			}
			ctx.lineWidth = 1;
			for (let k = 0; k < BUCKETS; k++) {
				const segs = paths[k];
				if (!segs.length) continue;
				ctx.strokeStyle = `rgba(37, 99, 235, ${(0.24 * (BUCKETS - k)) / BUCKETS})`;
				ctx.beginPath();
				for (let q = 0; q < segs.length; q += 4) {
					ctx.moveTo(segs[q], segs[q + 1]);
					ctx.lineTo(segs[q + 2], segs[q + 3]);
				}
				ctx.stroke();
			}
			ctx.fillStyle = 'rgba(37, 99, 235, 0.55)';
			ctx.beginPath();
			for (const p of nodes) {
				ctx.moveTo(p.x + p.r, p.y);
				ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
			}
			ctx.fill();
		};

		const step = () => {
			for (const p of nodes) {
				const dx = p.x - pointer.x;
				const dy = p.y - pointer.y;
				const d2 = dx * dx + dy * dy;
				if (d2 < 19600 && d2 > 0) {
					const d = Math.sqrt(d2);
					p.vx += (dx / d) * 0.05;
					p.vy += (dy / d) * 0.05;
				}
				p.vx *= 0.99;
				p.vy *= 0.99;
				if (p.vx * p.vx + p.vy * p.vy < 0.0144) {
					p.vx += (Math.random() - 0.5) * 0.04;
					p.vy += (Math.random() - 0.5) * 0.04;
				}
				p.x += p.vx;
				p.y += p.vy;
				if (p.x < -20) p.x = w + 20;
				else if (p.x > w + 20) p.x = -20;
				if (p.y < -20) p.y = h + 20;
				else if (p.y > h + 20) p.y = -20;
			}
			draw();
			frame = requestAnimationFrame(step);
		};

		const sync = () => {
			const should = inView && !document.hidden && !reduce;
			if (should && !running) {
				running = true;
				frame = requestAnimationFrame(step);
			} else if (!should && running) {
				running = false;
				cancelAnimationFrame(frame);
			}
		};

		const onMove = (e) => {
			if (!running) return;
			const rect = canvas.getBoundingClientRect();
			pointer.x = e.clientX - rect.left;
			pointer.y = e.clientY - rect.top;
		};

		resize();
		draw();
		const io = new IntersectionObserver(([entry]) => {
			inView = entry.isIntersecting;
			sync();
		}, { rootMargin: '100px' });
		io.observe(canvas);
		const ro = new ResizeObserver(() => { resize(); draw(); });
		ro.observe(canvas);
		window.addEventListener('pointermove', onMove, { passive: true });
		document.addEventListener('visibilitychange', sync);

		return () => {
			cancelAnimationFrame(frame);
			io.disconnect();
			ro.disconnect();
			window.removeEventListener('pointermove', onMove);
			document.removeEventListener('visibilitychange', sync);
		};
	}, [density]);

	return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none block h-full w-full ${className}`} />;
}

/** Soft drifting blue light behind a section (gradients, no blur filters). */
export function Aurora({ className = '' }) {
	return (
		<div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
			<div className="blob glow absolute -left-[18%] -top-[30%] h-[75vmax] w-[75vmax] [--glow:hsl(221_83%_53%/0.28)]" />
			<div className="blob glow absolute -right-[22%] top-0 h-[65vmax] w-[65vmax] [--glow:hsl(199_89%_60%/0.3)] [animation-delay:-6s]" />
			<div className="blob glow absolute -bottom-[40%] left-[18%] h-[60vmax] w-[60vmax] [--glow:hsl(213_100%_80%/0.45)] [animation-delay:-12s]" />
		</div>
	);
}

/** Thin blue bar across the top that tracks scroll progress. */
export function ScrollProgress() {
	const { scrollYProgress } = useScroll();
	const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
	return (
		<motion.div
			aria-hidden="true"
			style={{ scaleX }}
			className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-[hsl(221_83%_53%)] via-[hsl(199_89%_60%)] to-[hsl(221_83%_53%)]"
		/>
	);
}

/** Updates --mx/--my on hover so `.spotlight` cards glow under the pointer. */
export function useSpotlight() {
	return (e) => {
		const el = e.currentTarget;
		const rect = el.getBoundingClientRect();
		el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
		el.style.setProperty('--my', `${e.clientY - rect.top}px`);
	};
}

/** Live days/hours/minutes/seconds until `target` (ms since epoch). */
export function useCountdown(target) {
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, []);
	const diff = Math.max(0, target - now);
	return {
		done: diff === 0,
		days: Math.floor(diff / 86400000),
		hours: Math.floor((diff / 3600000) % 24),
		minutes: Math.floor((diff / 60000) % 60),
		seconds: Math.floor((diff / 1000) % 60),
	};
}

/** A soft blue light that trails the pointer across the whole page. */
export function CursorGlow() {
	const x = useMotionValue(-400);
	const y = useMotionValue(-400);
	const sx = useSpring(x, { stiffness: 140, damping: 22, mass: 0.4 });
	const sy = useSpring(y, { stiffness: 140, damping: 22, mass: 0.4 });

	useEffect(() => {
		if (!window.matchMedia('(pointer: fine)').matches) return undefined;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
		const onMove = (e) => { x.set(e.clientX - 200); y.set(e.clientY - 200); };
		window.addEventListener('pointermove', onMove);
		return () => window.removeEventListener('pointermove', onMove);
	}, [x, y]);

	return (
		<motion.div
			aria-hidden="true"
			style={{ x: sx, y: sy }}
			className="pointer-events-none fixed left-0 top-0 z-[1] hidden h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,hsl(199_89%_60%/0.16),transparent_65%)] [@media(pointer:fine)]:block"
		/>
	);
}

/** Card that tilts in 3D toward the pointer. */
export function Tilt({ children, className = '', max = 8 }) {
	const rx = useMotionValue(0);
	const ry = useMotionValue(0);
	const srx = useSpring(rx, { stiffness: 200, damping: 18 });
	const sry = useSpring(ry, { stiffness: 200, damping: 18 });
	const onMove = (e) => {
		const r = e.currentTarget.getBoundingClientRect();
		const px = (e.clientX - r.left) / r.width - 0.5;
		const py = (e.clientY - r.top) / r.height - 0.5;
		ry.set(px * max * 2);
		rx.set(-py * max * 2);
		e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
		e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
	};
	const onLeave = () => { rx.set(0); ry.set(0); };
	return (
		<motion.div
			onMouseMove={onMove}
			onMouseLeave={onLeave}
			style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

/** Headline whose words rise into place one after another. The parent
 *  watches the viewport: each word starts clipped out of view, so an
 *  observer on the word itself would never fire. */
export function SplitWords({ text, className = '', wordClassName = '', delay = 0, stagger = 0.06 }) {
	const reduce = useReducedMotion();
	const words = text.split(' ');
	const word = {
		hidden: { y: reduce ? 0 : '110%', opacity: reduce ? 1 : 0 },
		show: (i) => ({ y: '0%', opacity: 1, transition: { duration: 0.8, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] } }),
	};
	return (
		<motion.span className={className} aria-label={text} initial="hidden" whileInView="show" viewport={{ once: true }}>
			{words.map((w, i) => (
				<span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.08em] align-bottom">
					<motion.span custom={i} variants={word} className={`inline-block ${wordClassName}`}>
						{w}{i < words.length - 1 ? '\u00A0' : ''}
					</motion.span>
				</span>
			))}
		</motion.span>
	);
}
