// Keeps any HTML the editor doesn't understand, so switching from the Markdown
// view back to the visual view never loses it. It shows as an editable code chip.
import { Node } from '@tiptap/core';
import { attr } from './blocks';
import { isAllowedFrame } from './embeds';
import { el, icon, editField } from './dom';

const KNOWN_INLINE = /^<\/?(strong|em|b|i|u|s|del|code|mark|sub|sup|a|br)\b/i;
const OWN_CLOSES = /^<div class="post-callout"|^<details\b/;
const OWN_WHOLE = /^<!-- -->$|^<figure class="post-figure"|^<div class="post-card"|^<div data-math-block/;

/** Is this HTML block one the editor's own blocks will parse? */
function isOwn(content: string) {
	const html = content.trim();
	if (OWN_WHOLE.test(html)) return true;
	if (html.startsWith('<div class="post-embed"')) {
		const frame = html.match(/<iframe[^>]*\ssrc="([^"]*)"/);
		return !frame || isAllowedFrame(frame[1]);
	}
	return false;
}

export const RawHtml = Node.create({
	name: 'rawHtml',
	group: 'block',
	atom: true,
	draggable: true,
	addAttributes: () => ({ html: { default: '', parseHTML: (e) => (e as HTMLElement).dataset.rawHtml || '' } }),
	parseHTML: () => [{ tag: 'div[data-raw-html]' }],
	renderHTML: ({ node }) => ['div', { 'data-raw-html': node.attrs.html }],
	addStorage: () => ({
		markdown: {
			serialize(state: any, node: any) {
				state.write(node.attrs.html.trim());
				state.closeBlock(node);
			},
			parse: {
				setup(md: any) {
					md.renderer.rules.html_block = (tokens: any[], idx: number) => {
						const content: string = tokens[idx].content;
						// Pair closing tags with the opening tags of the editor's own blocks.
						const open: string[] = [];
						let owned = false;
						for (let i = 0; i <= idx; i++) {
							if (tokens[i].type !== 'html_block') continue;
							const html = tokens[i].content.trim();
							const isOpen = OWN_CLOSES.test(html);
							const isClose = /^<\/(div|details)>$/.test(html);
							if (isOpen) open.push(html.startsWith('<details') ? 'details' : 'div');
							const closes = isClose && open[open.length - 1] === html.slice(2, -1);
							if (i === idx) owned = isOpen || closes || isOwn(html);
							if (closes) open.pop();
						}
						return owned ? content : `<div data-raw-html="${attr2(content)}"></div>\n`;
					};
				},
			},
		},
	}),
	addNodeView() {
		return ({ node, editor, getPos }) => {
			let current = node;
			const code = el('code');
			const dom = el('div', { class: 'ay-raw', title: 'Click to edit this HTML' });
			dom.innerHTML = `<span class="ay-raw-label">${icon('CodeXml', 14)} Custom HTML</span>`;
			dom.append(code);
			const paint = () => { code.textContent = current.attrs.html.trim() || 'Empty. Click to add HTML.'; };
			dom.addEventListener('click', () => {
				if (!editor.isEditable) return;
				editField(dom, {
					label: 'HTML', value: current.attrs.html, multiline: true,
					onSave: (html) => editor.view.dispatch(editor.state.tr.setNodeMarkup((getPos as () => number)(), undefined, { html })),
				});
			});
			paint();
			return {
				dom,
				update(next) { if (next.type !== current.type) return false; current = next; paint(); return true; },
				ignoreMutation: () => true,
			};
		};
	},
});

export const RawInline = Node.create({
	name: 'rawInline',
	group: 'inline',
	inline: true,
	atom: true,
	addAttributes: () => ({ html: { default: '', parseHTML: (e) => (e as HTMLElement).dataset.rawInline || '' } }),
	parseHTML: () => [{ tag: 'span[data-raw-inline]' }],
	renderHTML: ({ node }) => ['span', { 'data-raw-inline': node.attrs.html }, node.attrs.html],
	addStorage: () => ({
		markdown: {
			serialize(state: any, node: any) { state.write(node.attrs.html); },
			parse: {
				setup(md: any) {
					md.renderer.rules.html_inline = (tokens: any[], idx: number) => {
						const html: string = tokens[idx].content;
						if (KNOWN_INLINE.test(html) || html.startsWith('<span data-math-inline')) return html;
						return `<span data-raw-inline="${attr2(html)}"></span>`;
					};
				},
			},
		},
	}),
	addNodeView: () => ({ node }) => ({ dom: el('code', { class: 'ay-raw-inline', title: 'Custom HTML' }, node.attrs.html) }),
});

/** Escapes for an attribute while keeping line breaks. */
function attr2(s: string) {
	return attr(s.replace(/\n/g, '\u0001')).replace(/\u0001/g, '&#10;');
}
