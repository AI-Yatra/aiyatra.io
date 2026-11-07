// Shows the draft as readers will see it. The layout mirrors src/pages/[slug].astro.
// Reviewers preview other people's drafts here while signed in, so everything from
// the Markdown is sanitized before it reaches the page.
import { lowlight } from './extensions';
import { el, icon, renderMath, renderMermaid } from './dom';
import { isAllowedFrame } from './embeds';

const REMOVE = 'script,style,object,embed,link,meta,base,form,svg,math,noscript,template,frame,frameset,applet';
const URL_ATTRS = ['href', 'src', 'poster', 'xlink:href', 'action', 'formaction'];
const SAFE_URL = /^(https?:|mailto:|\/|#|\.\/|blob:)/i;

/** Parses HTML into an inert document and strips anything that could run. */
export function sanitize(html: string): DocumentFragment {
	const doc = new DOMParser().parseFromString(html, 'text/html');
	doc.querySelectorAll(REMOVE).forEach((n) => n.remove());
	doc.querySelectorAll('iframe').forEach((f) => { if (!isAllowedFrame(f.getAttribute('src'))) f.remove(); });
	doc.querySelectorAll('*').forEach((node) => {
		for (const { name, value } of [...node.attributes]) {
			const lower = name.toLowerCase();
			if (lower.startsWith('on') || lower === 'srcdoc' || lower === 'style' && /url\(|expression/i.test(value)) node.removeAttribute(name);
			else if (URL_ATTRS.includes(lower) && !SAFE_URL.test(value.trim())) node.removeAttribute(name);
		}
	});
	const out = document.createDocumentFragment();
	out.append(...doc.body.childNodes);
	return out;
}

function hastToDom(node: any): Node {
	if (node.type === 'text') return document.createTextNode(node.value);
	const e = document.createElement(node.tagName || 'span');
	if (node.properties?.className) e.className = node.properties.className.join(' ');
	(node.children || []).forEach((c: any) => e.append(hastToDom(c)));
	return e;
}

function enhance(article: HTMLElement, resolve: (path: string, done: (url: string) => void) => void) {
	article.querySelectorAll<HTMLElement>('[data-math-inline],[data-math-block]').forEach((n) => {
		renderMath(n, n.dataset.latex || '', 'mathBlock' in n.dataset);
	});
	article.querySelectorAll<HTMLElement>('pre > code').forEach((code) => {
		const lang = (code.className.match(/language-([\w-]+)/) || [])[1];
		if (lang === 'mermaid') {
			const diagram = el('div', { class: 'mermaid-diagram' });
			const source = code.textContent || '';
			code.parentElement!.replaceWith(diagram);
			renderMermaid(diagram, source);
			return;
		}
		if (lang && lowlight.registered(lang)) {
			const tree = lowlight.highlight(lang, code.textContent || '');
			code.replaceChildren(...tree.children.map(hastToDom));
		}
	});
	article.querySelectorAll<HTMLElement>('[data-raw-html]').forEach((n) => {
		const code = el('code', {}, n.dataset.rawHtml || '');
		n.replaceWith(el('div', { class: 'ay-raw' }, el('span', { class: 'ay-raw-label' }, 'Custom HTML: shown as code here, and runs on the published post'), code));
	});
	article.querySelectorAll('[data-raw-inline]').forEach((n) => n.remove());
	article.querySelectorAll<HTMLElement>('img[src],video[src],audio[src]').forEach((m) => {
		const src = m.getAttribute('src');
		if (src) resolve(src, (url) => m.setAttribute('src', url));
	});
	// A link in a preview shouldn't navigate away from an unsaved draft.
	article.querySelectorAll('a[href]').forEach((a) => { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); });
}

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
function formatDate(value: unknown) {
	const d = value instanceof Date ? value : new Date(String(value || ''));
	return Number.isNaN(d.valueOf()) ? '' : dateFormat.format(d);
}
const list = (v: any): string[] => (v?.toJS ? v.toJS() : Array.isArray(v) ? v : []).filter(Boolean);
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

export interface PreviewInput {
	html: string;
	words: number;
	data: any;
	resolve(path: string, done: (url: string) => void): void;
}

export function openPreview({ html, words, data, resolve }: PreviewInput) {
	const get = (k: string) => data?.get?.(k);
	const title = get('title') || 'Untitled post';
	const author = get('author') || 'Your name';
	const coAuthors = list(get('coAuthors'));
	const tags = list(get('tags'));
	const cover = get('cover');
	const category = get('category') || 'Guest post';
	const isRecap = category === 'Session recap';

	const article = el('article', { class: 'ay-canvas blog-body ay-pv-article' });
	article.append(sanitize(html));
	if (!article.textContent?.trim() && !article.querySelector('img,iframe,video')) article.append(el('p', { class: 'ay-pv-empty' }, 'Your post is empty so far.'));
	enhance(article, resolve);

	const band = el('div', { class: 'ay-pv-band' });
	if (cover) {
		const img = el('img', { class: 'ay-pv-cover', alt: get('coverAlt') || title }) as HTMLImageElement;
		resolve(cover, (url) => { img.src = url; });
		band.append(img);
		if (get('coverCredit')) band.append(el('p', { class: 'post-cover-credit' }, get('coverCredit')));
	}
	band.append(article);
	if (tags.length) band.append(el('p', { class: 'ay-pv-tags' }, ...tags.map((t) => el('span', {}, `#${t}`))));
	if (!isRecap) {
		const photo = get('authorAvatar');
		const avatar = photo ? el('img', { alt: '' }) as HTMLImageElement : el('span', { class: 'ay-pv-initials' }, initials(author));
		if (photo) resolve(photo, (url) => { (avatar as HTMLImageElement).src = url; });
		const text = el('div', {}, el('p', { class: 'ay-pv-label' }, 'Written by'), el('p', { class: 'ay-pv-name' }, author));
		if (get('authorRole')) text.append(el('p', { class: 'ay-pv-role' }, get('authorRole')));
		band.append(el('div', { class: 'ay-pv-author' }, avatar, text));
	}

	const meta = [[author, ...coAuthors].join(' & '), formatDate(get('date')), `${Math.max(1, Math.round(words / 220))} min read`].filter(Boolean).join(' · ');
	const head = el('header', { class: 'ay-pv-head' }, el('span', { class: 'ay-pv-pill' }, category), el('h1', { class: 'ay-pv-title' }, title));
	if (get('subtitle')) head.append(el('p', { class: 'ay-pv-subtitle' }, get('subtitle')));
	head.append(el('p', { class: 'ay-pv-meta' }, meta));

	const page = el('div', { class: 'ay-pv-page' }, head, band);
	const size = (name: string, label: string, iconName: string) => {
		const b = el('button', { type: 'button', 'data-size': name, 'aria-pressed': String(name === 'desktop') });
		b.innerHTML = `${icon(iconName, 15)}<span>${label}</span>`;
		b.addEventListener('click', () => {
			page.dataset.size = name;
			sizes.querySelectorAll('button').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
		});
		return b;
	};
	const sizes = el('div', { class: 'ay-pv-sizes', role: 'group', 'aria-label': 'Preview size' }, size('desktop', 'Desktop', 'Monitor'), size('phone', 'Phone', 'Smartphone'));
	const close = el('button', { type: 'button', class: 'ay-btn ay-btn-primary' });
	close.innerHTML = `${icon('PenLine', 15)}<span>Back to editing</span>`;
	const bar = el('div', { class: 'ay-pv-bar' }, el('strong', {}, 'Preview'), el('span', { class: 'ay-pv-hint' }, 'This is how readers will see your post. Nothing has been published.'), sizes, close);
	const dialog = el('dialog', { class: 'ay-preview', 'aria-label': 'Post preview' }, bar, el('div', { class: 'ay-pv-scroll' }, page)) as HTMLDialogElement;
	close.addEventListener('click', () => dialog.close());
	dialog.addEventListener('close', () => dialog.remove());
	document.body.append(dialog);
	dialog.showModal();
	close.focus();
}
