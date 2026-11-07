// Reading tools on a post page: table of contents highlight, heading links, sharing,
// read-aloud, view counts, reactions and learning-path progress.
import { STATS_URL } from '../lib/site';

const slug = location.pathname.replace(/\.html$/, '').replace(/\/$/, '').split('/').pop() || '';
const store = {
	get(key: string, area: Storage = localStorage) { try { return area.getItem(key); } catch { return null; } },
	set(key: string, value: string, area: Storage = localStorage) { try { area.setItem(key, value); } catch { /* it just won't persist */ } },
};

// ---------- table of contents
const links = new Map([...document.querySelectorAll<HTMLAnchorElement>('[data-toc]')].map((a) => [a.dataset.toc, a]));
if (links.size) {
	const io = new IntersectionObserver((entries) => {
		for (const e of entries) {
			if (!e.isIntersecting) continue;
			links.forEach((a) => a.classList.remove('is-current'));
			links.get(e.target.id)?.classList.add('is-current');
		}
	}, { rootMargin: '-100px 0px -70% 0px' });
	document.querySelectorAll('.blog-body h2[id], .blog-body h3[id]').forEach((h) => io.observe(h));
}

// ---------- heading links
document.querySelectorAll<HTMLElement>('.blog-body h2[id], .blog-body h3[id]').forEach((h) => {
	const a = document.createElement('a');
	a.href = `#${h.id}`;
	a.className = 'heading-link';
	a.textContent = '#';
	a.setAttribute('aria-label', `Link to section: ${h.textContent}`);
	a.dataset.pagefindIgnore = '';
	h.prepend(a);
});

// ---------- copy link
document.querySelectorAll<HTMLButtonElement>('[data-copy-link]').forEach((b) => b.addEventListener('click', async () => {
	await navigator.clipboard.writeText(b.dataset.copyLink!);
	const label = b.querySelector('[data-copy-label]');
	label?.classList.remove('hidden');
	setTimeout(() => label?.classList.add('hidden'), 1500);
}));

// ---------- listen, with the browser's own voices
const listen = document.getElementById('listen') as HTMLButtonElement | null;
if (listen && 'speechSynthesis' in window) {
	listen.hidden = false;
	const label = listen.querySelector('[data-listen-label]')!;
	const synth = window.speechSynthesis;
	let state: 'idle' | 'playing' | 'paused' = 'idle';
	const setState = (next: typeof state) => {
		state = next;
		listen.setAttribute('aria-pressed', String(next === 'playing'));
		label.textContent = next === 'playing' ? 'Pause' : next === 'paused' ? 'Resume' : 'Listen to this post';
	};
	// Read one block at a time: long single utterances get cut off in some browsers.
	const blocks = () => [...document.querySelectorAll<HTMLElement>('.blog-body h2, .blog-body h3, .blog-body p, .blog-body li, .blog-body blockquote')]
		.filter((n) => !n.closest('pre, table, figure, .post-card') && !n.querySelector('p, li'))
		.map((n) => (n.cloneNode(true) as HTMLElement))
		.map((n) => { n.querySelectorAll('.heading-link, .katex, code').forEach((x) => x.remove()); return n.textContent?.trim() || ''; })
		.filter(Boolean);
	listen.addEventListener('click', () => {
		if (state === 'playing') { synth.pause(); setState('paused'); return; }
		if (state === 'paused') { synth.resume(); setState('playing'); return; }
		synth.cancel();
		const queue = blocks();
		setState('playing');
		const speakNext = () => {
			const text = queue.shift();
			if (!text) { setState('idle'); return; }
			const u = new SpeechSynthesisUtterance(text);
			u.onend = speakNext;
			u.onerror = () => setState('idle');
			synth.speak(u);
		};
		speakNext();
	});
	window.addEventListener('pagehide', () => synth.cancel());
}

// ---------- views and reactions
const reactions = document.getElementById('reactions');
const reacted = (kind: string) => store.get(`ay-react:${slug}:${kind}`) === '1';
function paint(data: { views?: number; reactions?: Record<string, number> }) {
	const views = document.querySelector<HTMLElement>('[data-view-count]');
	if (views && data.views) {
		views.classList.remove('hidden');
		views.classList.add('inline-flex');
		views.querySelector('span')!.textContent = `${data.views.toLocaleString()} ${data.views === 1 ? 'view' : 'views'}`;
	}
	reactions?.querySelectorAll<HTMLElement>('[data-react]').forEach((b) => {
		const n = data.reactions?.[b.dataset.react!] ?? 0;
		b.querySelector('[data-n]')!.textContent = n ? String(n) : '';
		b.setAttribute('aria-pressed', String(reacted(b.dataset.react!)));
	});
}
const post = (path: string, body: object) => fetch(`${STATS_URL}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
(async () => {
	try {
		const seen = store.get(`ay-view:${slug}`, sessionStorage);
		const res = seen ? await fetch(`${STATS_URL}?slug=${encodeURIComponent(slug)}`) : await post('view', { slug });
		if (!res.ok) return;
		store.set(`ay-view:${slug}`, '1', sessionStorage);
		const data = await res.json();
		paint(data);
		if (reactions) reactions.hidden = false;
	} catch { /* counts are a nicety: the post reads the same without them */ }
})();
reactions?.querySelectorAll<HTMLButtonElement>('[data-react]').forEach((b) => b.addEventListener('click', async () => {
	const kind = b.dataset.react!;
	if (reacted(kind)) return;
	store.set(`ay-react:${slug}:${kind}`, '1');
	b.setAttribute('aria-pressed', 'true');
	try {
		const res = await post('react', { slug, kind });
		if (res.ok) paint(await res.json());
	} catch { /* the button stays pressed for this reader */ }
}));

// ---------- learning-path progress: reaching the end of a post counts as read
const end = document.querySelector('.blog-body > :last-child');
if (end && document.querySelector('[aria-label^="Learning path"]')) {
	const io = new IntersectionObserver(([e]) => {
		if (!e.isIntersecting) return;
		io.disconnect();
		store.set(`ay-read:${slug}`, '1');
	});
	io.observe(end);
}
