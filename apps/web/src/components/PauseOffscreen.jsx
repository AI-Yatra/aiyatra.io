import { useEffect } from 'react';

// Every infinitely looping CSS animation on the site.
const LOOPING = '.marquee-track, .marquee-track-reverse, .float-soft, .spin-slow, .spin-slower, .ping-soft, .blob, .flow-line, .text-gradient';

/**
 * Pauses looping CSS animations while they're off screen, so the browser only
 * spends frames on what you can see. Watches the DOM for elements added later
 * (lazy pages, route changes) and picks them up automatically.
 */
export default function PauseOffscreen() {
	useEffect(() => {
		const io = new IntersectionObserver((entries) => {
			for (const e of entries) e.target.classList.toggle('is-offscreen', !e.isIntersecting);
		}, { rootMargin: '200px' });
		const seen = new WeakSet();
		const scan = () => {
			document.querySelectorAll(LOOPING).forEach((el) => {
				if (seen.has(el)) return;
				seen.add(el);
				io.observe(el);
			});
		};
		scan();
		let queued = false;
		const mo = new MutationObserver(() => {
			if (queued) return;
			queued = true;
			requestAnimationFrame(() => { queued = false; scan(); });
		});
		mo.observe(document.body, { childList: true, subtree: true });
		return () => { io.disconnect(); mo.disconnect(); };
	}, []);
	return null;
}
