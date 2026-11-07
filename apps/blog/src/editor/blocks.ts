// The post's custom blocks. Each one saves as plain Markdown or a small HTML
// block, so posts stay readable in a GitHub PR diff and the blog renders them
// with the styles in src/styles/post-blocks.css.
import { Node, mergeAttributes } from '@tiptap/core';
import { isAllowedFrame } from './embeds';
import { icon, el, renderMath, editField } from './dom';

export interface BlockContext {
	/** Calls back with a displayable URL for a saved path (drafts live in memory, not on the site). */
	resolve(path: string, done: (url: string) => void): void;
}

export const attr = (s: unknown) => String(s ?? '').replace(/\s*\n\s*/g, ' ').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const safeHref = (s: string | null | undefined) => (s && /^(https?:\/\/|\/)/i.test(s) ? s : '');

// ------------------------------------------------------------------ image
export const PostImage = Node.create<{ ctx: BlockContext }>({
	name: 'image',
	group: 'block',
	atom: true,
	draggable: true,
	selectable: true,
	addOptions: () => ({ ctx: { resolve: (p, done) => done(p) } }),
	addAttributes: () => ({
		src: { default: null },
		alt: { default: '' },
		title: { default: null },
		caption: { default: '' },
		size: { default: '' },
	}),
	parseHTML: () => [
		{
			tag: 'figure.post-figure',
			getAttrs: (node) => {
				const img = (node as HTMLElement).querySelector('img');
				if (!img) return false;
				return { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '', caption: (node as HTMLElement).querySelector('figcaption')?.textContent || '', size: (node as HTMLElement).dataset.size || '' };
			},
		},
		{ tag: 'img[src]', getAttrs: (node) => ({ src: (node as HTMLElement).getAttribute('src'), alt: (node as HTMLElement).getAttribute('alt') || '', title: (node as HTMLElement).getAttribute('title') }) },
	],
	renderHTML: ({ node }) => ['img', { src: node.attrs.src, alt: node.attrs.alt }],
	addStorage: () => ({
		markdown: {
			serialize(state: any, node: any) {
				const { src, alt, title, caption, size } = node.attrs;
				if (caption || size) {
					state.write(`<figure class="post-figure"${size ? ` data-size="${attr(size)}"` : ''}><img src="${attr(src)}" alt="${attr(alt)}" />${caption ? `<figcaption>${attr(caption)}</figcaption>` : ''}</figure>`);
				} else {
					const safeSrc = String(src || '').replace(/[()\s]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`);
					state.write(`![${state.esc(alt || '')}](${safeSrc}${title ? ` "${String(title).replace(/"/g, '\\"')}"` : ''})`);
				}
				state.closeBlock(node);
			},
			parse: {},
		},
	}),
	addNodeView() {
		const { ctx } = this.options;
		return ({ node, editor, getPos }) => {
			let current = node;
			const set = (attrs: Record<string, unknown>) => {
				const pos = (getPos as () => number)();
				editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, undefined, { ...current.attrs, ...attrs }));
			};
			const img = el('img', { draggable: 'false' }) as HTMLImageElement;
			const caption = el('input', { class: 'ay-img-caption', placeholder: 'Add a caption (optional)', 'aria-label': 'Image caption' }) as HTMLInputElement;
			const sizes = el('div', { class: 'ay-img-tools', contenteditable: 'false' });
			const sizeBtn = (value: string, label: string) => {
				const b = el('button', { type: 'button', 'data-size': value, title: `${label} size` }, label);
				b.addEventListener('click', () => set({ size: value }));
				return b;
			};
			const altBtn = el('button', { type: 'button', title: 'Describe the image for screen readers and search engines' }, 'Alt text');
			altBtn.addEventListener('click', () => editField(altBtn, { label: 'Describe what the image shows', value: current.attrs.alt, onSave: (alt) => set({ alt }) }));
			const del = el('button', { type: 'button', title: 'Remove image', 'aria-label': 'Remove image' });
			del.innerHTML = icon('Trash2');
			del.addEventListener('click', () => { const pos = (getPos as () => number)(); editor.chain().deleteRange({ from: pos, to: pos + current.nodeSize }).focus().run(); });
			sizes.append(sizeBtn('small', 'S'), sizeBtn('', 'M'), sizeBtn('wide', 'L'), altBtn, del);
			const dom = el('figure', { class: 'ay-image post-figure' }, sizes, img, caption);
			caption.addEventListener('change', () => set({ caption: caption.value.trim() }));
			caption.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); caption.blur(); editor.commands.focus(); } });
			const paint = () => {
				const { src, alt, caption: text, size } = current.attrs;
				ctx.resolve(src, (url) => { if (img.getAttribute('src') !== url) img.src = url; });
				img.alt = alt || '';
				if (document.activeElement !== caption) caption.value = text || '';
				if (size) dom.dataset.size = size; else delete dom.dataset.size;
				sizes.querySelectorAll('[data-size]').forEach((b) => b.classList.toggle('is-on', (b as HTMLElement).dataset.size === (size || '')));
				altBtn.classList.toggle('is-missing', !alt);
			};
			paint();
			return {
				dom,
				update(next) { if (next.type !== current.type) return false; current = next; paint(); return true; },
				stopEvent: (e) => !!(e.target as HTMLElement).closest?.('input,button'),
				ignoreMutation: () => true,
			};
		};
	},
});

// ---------------------------------------------------------------- callout
export const CALLOUTS: Record<string, { label: string; icon: string }> = {
	info: { label: 'Note', icon: 'Info' },
	tip: { label: 'Tip', icon: 'Lightbulb' },
	warning: { label: 'Warning', icon: 'TriangleAlert' },
	danger: { label: 'Important', icon: 'OctagonAlert' },
};

export const Callout = Node.create({
	name: 'callout',
	group: 'block',
	content: 'block+',
	defining: true,
	addAttributes: () => ({ type: { default: 'info', parseHTML: (e) => (e as HTMLElement).dataset.callout || 'info' } }),
	parseHTML: () => [{ tag: 'div.post-callout' }],
	renderHTML: ({ node }) => ['div', { class: 'post-callout', 'data-callout': node.attrs.type }, 0],
	addStorage: () => ({
		markdown: {
			serialize(state: any, node: any) {
				state.write(`<div class="post-callout" data-callout="${attr(node.attrs.type)}">\n\n`);
				state.renderContent(node);
				state.write('</div>');
				state.closeBlock(node);
			},
			parse: {},
		},
	}),
	addNodeView() {
		return ({ node, editor, getPos }) => {
			let current = node;
			const contentDOM = el('div', { class: 'post-callout-body' });
			const pick = el('button', { type: 'button', class: 'ay-callout-pick', contenteditable: 'false', title: 'Change callout type' });
			const dom = el('div', { class: 'post-callout' }, pick, contentDOM);
			const paint = () => {
				dom.dataset.callout = current.attrs.type;
				pick.innerHTML = icon(CALLOUTS[current.attrs.type]?.icon || 'Info');
			};
			pick.addEventListener('click', () => {
				const types = Object.keys(CALLOUTS);
				const type = types[(types.indexOf(current.attrs.type) + 1) % types.length];
				editor.view.dispatch(editor.state.tr.setNodeMarkup((getPos as () => number)(), undefined, { type }));
			});
			paint();
			return {
				dom, contentDOM,
				update(next) { if (next.type !== current.type) return false; current = next; paint(); return true; },
				stopEvent: (e) => pick.contains(e.target as Element),
				ignoreMutation: (m) => !contentDOM.contains(m.target as Element),
			};
		};
	},
});

// ---------------------------------------------------------------- toggle
export const DetailsSummary = Node.create({
	name: 'detailsSummary',
	content: 'text*',
	marks: '',
	defining: true,
	isolating: true,
	parseHTML: () => [{ tag: 'summary' }],
	renderHTML: () => ['summary', 0],
	addStorage: () => ({ markdown: { serialize() { /* written by the parent */ }, parse: {} } }),
	addKeyboardShortcuts() {
		const inSummary = () => this.editor.state.selection.$from.parent.type.name === 'detailsSummary';
		return {
			// Enter moves from the title into the hidden content.
			Enter: () => inSummary() && this.editor.commands.setTextSelection(this.editor.state.selection.$from.after() + 1),
			// Backspace in an empty title removes the whole toggle.
			Backspace: () => {
				const { $from, empty } = this.editor.state.selection;
				if (!inSummary() || !empty || $from.parent.content.size > 0) return false;
				return this.editor.commands.deleteRange({ from: $from.before($from.depth - 1), to: $from.after($from.depth - 1) });
			},
		};
	},
});

export const Details = Node.create({
	name: 'details',
	group: 'block',
	content: 'detailsSummary block+',
	defining: true,
	parseHTML: () => [{ tag: 'details' }],
	renderHTML: () => ['details', { open: 'true' }, 0],
	// A real <details> traps the caret, so the editor shows it as an always-open box.
	addNodeView: () => () => {
		const dom = el('div', { class: 'ay-details' });
		return { dom, contentDOM: dom };
	},
	addStorage: () => ({
		markdown: {
			serialize(state: any, node: any) {
				state.write(`<details>\n<summary>${attr(node.firstChild.textContent)}</summary>\n\n`);
				node.forEach((child: any, _: number, i: number) => { if (i > 0) state.render(child, node, i); });
				state.write('</details>');
				state.closeBlock(node);
			},
			parse: {},
		},
	}),
});

// ------------------------------------------------------------------ embed
export const Embed = Node.create({
	name: 'embed',
	group: 'block',
	atom: true,
	draggable: true,
	addAttributes: () => ({ src: { default: null }, provider: { default: 'embed' }, ratio: { default: '' } }),
	parseHTML: () => [{
		tag: 'div.post-embed',
		getAttrs: (node) => {
			const e = node as HTMLElement;
			const media = e.querySelector('iframe,video,audio');
			if (!media) return false;
			const src = media.getAttribute('src');
			if (media.tagName === 'IFRAME' ? !isAllowedFrame(src) : !safeHref(src)) return false;
			return { src, provider: e.dataset.provider || media.tagName.toLowerCase(), ratio: e.dataset.ratio || '' };
		},
	}],
	renderHTML: ({ node }) => ['div', { class: 'post-embed', 'data-provider': node.attrs.provider }, frame(node.attrs)],
	addStorage: () => ({
		markdown: {
			serialize(state: any, node: any) {
				const { src, provider, ratio } = node.attrs;
				const data = `data-provider="${attr(provider)}"${ratio ? ` data-ratio="${attr(ratio)}"` : ''}`;
				const inner = provider === 'video' ? `<video src="${attr(src)}" controls preload="metadata"></video>`
					: provider === 'audio' ? `<audio src="${attr(src)}" controls preload="metadata"></audio>`
					: `<iframe src="${attr(src)}" title="${attr(provider)} embed" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
				state.write(`<div class="post-embed" ${data}>${inner}</div>`);
				state.closeBlock(node);
			},
			parse: {},
		},
	}),
	addOptions: () => ({ ctx: null as BlockContext | null }),
	addNodeView() {
		const { ctx } = this.options;
		return ({ node }) => {
			const [tag, attrs] = frame(node.attrs);
			const media = el(tag, attrs as Record<string, string>) as HTMLIFrameElement;
			if (tag !== 'iframe' && ctx) { media.removeAttribute('src'); ctx.resolve(node.attrs.src, (u) => { media.src = u; }); }
			const dom = el('div', { class: 'post-embed ay-embed', 'data-provider': node.attrs.provider }, media);
			if (node.attrs.ratio) dom.dataset.ratio = node.attrs.ratio;
			// An iframe swallows clicks, so a shield keeps the block selectable until it is selected.
			dom.append(el('div', { class: 'ay-embed-shield', title: 'Click to select. Click again to interact.' }));
			return { dom, ignoreMutation: () => true };
		};
	},
});

function frame(a: Record<string, string>): [string, Record<string, string>] {
	if (a.provider === 'video' || a.provider === 'audio') return [a.provider, { src: a.src, controls: 'true', preload: 'metadata' }];
	return ['iframe', { src: a.src, title: `${a.provider} embed`, loading: 'lazy', allowfullscreen: 'true', referrerpolicy: 'strict-origin-when-cross-origin' }];
}

// -------------------------------------------------------------- link card
export const LinkCard = Node.create({
	name: 'linkCard',
	group: 'block',
	atom: true,
	draggable: true,
	addAttributes: () => ({ url: { default: '' }, title: { default: '' }, description: { default: '' }, image: { default: '' }, file: { default: false } }),
	parseHTML: () => [{
		tag: 'div.post-card',
		getAttrs: (node) => {
			const e = node as HTMLElement;
			const a = e.querySelector('a');
			const url = safeHref(a?.getAttribute('href'));
			if (!url) return false;
			return {
				url,
				title: e.querySelector('strong')?.textContent || '',
				description: e.querySelector('.post-card-desc')?.textContent || '',
				image: e.querySelector('img')?.getAttribute('src') || '',
				file: a!.hasAttribute('download'),
			};
		},
	}],
	renderHTML: ({ node }) => ['div', { class: 'post-card' }, ['a', mergeAttributes({ href: node.attrs.url }), node.attrs.title || node.attrs.url]],
	addStorage: () => ({
		markdown: {
			serialize(state: any, node: any) {
				const { url, title, description, image, file } = node.attrs;
				const img = image ? `<img src="${attr(image)}" alt="" loading="lazy" />` : '';
				const desc = description ? `<span class="post-card-desc">${attr(description)}</span>` : '';
				const target = file ? ' download' : ' target="_blank" rel="noopener"';
				state.write(`<div class="post-card"><a href="${attr(url)}"${target}>${img}<span class="post-card-text"><strong>${attr(title || hostOf(url))}</strong>${desc}<span class="post-card-host">${attr(hostOf(url))}</span></span></a></div>`);
				state.closeBlock(node);
			},
			parse: {},
		},
	}),
	addNodeView() {
		return ({ node, editor, getPos }) => {
			let current = node;
			const dom = el('div', { class: 'post-card ay-card' });
			const paint = () => {
				const { url, title, description, image, file } = current.attrs;
				dom.replaceChildren();
				const text = el('span', { class: 'post-card-text' },
					el('strong', {}, title || hostOf(url)),
					description ? el('span', { class: 'post-card-desc' }, description) : '',
					el('span', { class: 'post-card-host' }, file ? `Attachment · ${hostOf(url)}` : hostOf(url)));
				const a = el('a', { href: url, draggable: 'false' });
				if (image) a.append(el('img', { src: image, alt: '' }));
				a.append(text);
				a.addEventListener('click', (e) => e.preventDefault());
				const edit = el('button', { type: 'button', class: 'ay-card-edit', title: 'Edit the card title' }, 'Edit');
				edit.addEventListener('click', () => editField(edit, {
					label: 'Card title', value: current.attrs.title,
					onSave: (value) => editor.view.dispatch(editor.state.tr.setNodeMarkup((getPos as () => number)(), undefined, { ...current.attrs, title: value })),
				}));
				dom.append(a, edit);
			};
			paint();
			return {
				dom,
				update(next) { if (next.type !== current.type) return false; current = next; paint(); return true; },
				stopEvent: (e) => !!(e.target as HTMLElement).closest?.('button'),
				ignoreMutation: () => true,
			};
		};
	},
});

export function hostOf(url: string) {
	try { return new URL(url, location.origin).hostname.replace(/^www\./, ''); } catch { return url; }
}

// ------------------------------------------------------------------- math
// Saved as $$…$$: inline on one line, or a block with the $$ on their own lines.
// A single $ stays plain text so prices like "$5 and $10" never turn into math.
function mathNodeView(block: boolean) {
	return ({ node, editor, getPos }: any) => {
		let current = node;
		const dom = el(block ? 'div' : 'span', { class: block ? 'ay-math ay-math-block' : 'ay-math' });
		const paint = () => renderMath(dom, current.attrs.latex, block);
		dom.addEventListener('click', () => {
			if (!editor.isEditable) return;
			editField(dom, {
				label: 'LaTeX', value: current.attrs.latex, multiline: true, mathPreview: block,
				onSave: (latex: string) => editor.view.dispatch(editor.state.tr.setNodeMarkup(getPos(), undefined, { latex })),
			});
		});
		paint();
		return {
			dom,
			update(next: any) { if (next.type !== current.type) return false; current = next; paint(); return true; },
			ignoreMutation: () => true,
		};
	};
}

export const InlineMath = Node.create({
	name: 'inlineMath',
	group: 'inline',
	inline: true,
	atom: true,
	addAttributes: () => ({ latex: { default: '' } }),
	parseHTML: () => [{ tag: 'span[data-math-inline]', getAttrs: (e) => ({ latex: (e as HTMLElement).dataset.latex || '' }) }],
	renderHTML: ({ node }) => ['span', { 'data-math-inline': '', 'data-latex': node.attrs.latex }],
	addStorage: () => ({
		markdown: {
			serialize(state: any, node: any) { state.write(`$$${node.attrs.latex}$$`); },
			parse: {
				setup(md: any) {
					md.inline.ruler.before('escape', 'ay_math_inline', (s: any, silent: boolean) => {
						if (s.src.slice(s.pos, s.pos + 2) !== '$$') return false;
						const end = s.src.indexOf('$$', s.pos + 2);
						if (end < 0) return false;
						const latex = s.src.slice(s.pos + 2, end);
						if (!latex.trim() || latex.includes('\n')) return false;
						if (!silent) {
							const t = s.push('html_inline', '', 0);
							t.content = `<span data-math-inline data-latex="${attr(latex)}"></span>`;
						}
						s.pos = end + 2;
						return true;
					});
				},
			},
		},
	}),
	addNodeView: () => mathNodeView(false),
});

export const BlockMath = Node.create({
	name: 'blockMath',
	group: 'block',
	atom: true,
	draggable: true,
	addAttributes: () => ({ latex: { default: '' } }),
	parseHTML: () => [{ tag: 'div[data-math-block]', getAttrs: (e) => ({ latex: (e as HTMLElement).dataset.latex || '' }) }],
	renderHTML: ({ node }) => ['div', { 'data-math-block': '', 'data-latex': node.attrs.latex }],
	addStorage: () => ({
		markdown: {
			serialize(state: any, node: any) {
				state.write(`$$\n${node.attrs.latex}\n$$`);
				state.closeBlock(node);
			},
			parse: {
				setup(md: any) {
					md.block.ruler.before('fence', 'ay_math_block', (s: any, start: number, endLine: number, silent: boolean) => {
						const line = (n: number) => s.src.slice(s.bMarks[n] + s.tShift[n], s.eMarks[n]).trim();
						if (line(start) !== '$$') return false;
						let next = start + 1;
						while (next < endLine && line(next) !== '$$') next++;
						if (next >= endLine) return false;
						if (silent) return true;
						const latex = s.getLines(start + 1, next, s.tShift[start], false);
						const t = s.push('html_block', '', 0);
						t.map = [start, next + 1];
						// attr() folds newlines; keep the author's line breaks.
						t.content = `<div data-math-block data-latex="${String(latex).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '&#10;')}"></div>\n`;
						s.line = next + 1;
						return true;
					}, { alt: ['paragraph', 'reference', 'blockquote', 'list'] });
				},
			},
		},
	}),
	addNodeView: () => mathNodeView(true),
});
