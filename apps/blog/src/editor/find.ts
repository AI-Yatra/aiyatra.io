// Find and replace across the post (⌘F).
import { Extension, type Editor } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { el, icon } from './dom';

const key = new PluginKey('findReplace');
interface Hit { from: number; to: number }

function search(doc: any, query: string): Hit[] {
	if (!query) return [];
	const hits: Hit[] = [];
	const needle = query.toLowerCase();
	doc.descendants((node: any, pos: number) => {
		if (!node.isTextblock) return true;
		// Walk the block's text with an offset map, since atoms take up positions.
		let text = '';
		const map: number[] = [];
		node.forEach((child: any, offset: number) => {
			if (child.isText) for (let i = 0; i < child.text.length; i++) { text += child.text[i]; map.push(pos + 1 + offset + i); }
			else { text += '￼'; map.push(pos + 1 + offset); }
		});
		const hay = text.toLowerCase();
		for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + needle.length)) {
			hits.push({ from: map[i], to: map[i + needle.length - 1] + 1 });
		}
		return false;
	});
	return hits;
}

export const FindReplace = Extension.create({
	name: 'findReplace',
	addProseMirrorPlugins() {
		return [new Plugin({
			key,
			state: {
				init: () => ({ query: '', current: 0, deco: DecorationSet.empty, hits: [] as Hit[] }),
				apply(tr, prev) {
					const meta = tr.getMeta(key);
					if (!meta && !tr.docChanged) return prev;
					const query = meta?.query ?? prev.query;
					const hits = search(tr.doc, query);
					const current = hits.length ? Math.min(meta?.current ?? prev.current, hits.length - 1) : 0;
					const deco = DecorationSet.create(tr.doc, hits.map((h, i) => Decoration.inline(h.from, h.to, { class: i === current ? 'ay-hit is-current' : 'ay-hit' })));
					return { query, current, deco, hits };
				},
			},
			props: { decorations(state) { return key.getState(state)?.deco; } },
		})];
	},
});

let panel: HTMLElement | null = null;

export function openFind(editor: Editor, anchor: HTMLElement) {
	if (panel) { (panel.querySelector('input') as HTMLInputElement).select(); return; }
	const find = el('input', { placeholder: 'Find', 'aria-label': 'Find' }) as HTMLInputElement;
	const replace = el('input', { placeholder: 'Replace with', 'aria-label': 'Replace with' }) as HTMLInputElement;
	const count = el('span', { class: 'ay-find-count', 'aria-live': 'polite' }, '0 of 0');
	const state = () => key.getState(editor.state);
	const set = (meta: { query?: string; current?: number }) => editor.view.dispatch(editor.state.tr.setMeta(key, meta));
	const reveal = () => {
		const { hits, current } = state();
		count.textContent = hits.length ? `${current + 1} of ${hits.length}` : '0 of 0';
		const hit = hits[current];
		if (hit) (editor.view.domAtPos(hit.from).node as HTMLElement).parentElement?.scrollIntoView({ block: 'center' });
	};
	const step = (by: number) => {
		const { hits, current } = state();
		if (!hits.length) return;
		set({ current: (current + by + hits.length) % hits.length });
		reveal();
	};
	const button = (iconName: string, label: string, run: () => void) => {
		const b = el('button', { type: 'button', title: label, 'aria-label': label });
		b.innerHTML = icon(iconName, 15);
		b.addEventListener('click', run);
		return b;
	};
	const text = (label: string, run: () => void) => {
		const b = el('button', { type: 'button', class: 'ay-btn' }, label);
		b.addEventListener('click', run);
		return b;
	};
	const close = () => {
		set({ query: '' });
		panel?.remove();
		panel = null;
		editor.commands.focus();
	};
	const replaceOne = () => {
		const { hits, current } = state();
		const hit = hits[current];
		if (!hit) return;
		editor.view.dispatch(replace.value ? editor.state.tr.insertText(replace.value, hit.from, hit.to) : editor.state.tr.delete(hit.from, hit.to));
		reveal();
	};
	const replaceAll = () => {
		const { hits } = state();
		if (!hits.length) return;
		const tr = editor.state.tr;
		for (const hit of [...hits].reverse()) {
			if (replace.value) tr.insertText(replace.value, hit.from, hit.to); else tr.delete(hit.from, hit.to);
		}
		editor.view.dispatch(tr.setSelection(TextSelection.create(tr.doc, Math.min(tr.selection.from, tr.doc.content.size))));
		reveal();
	};
	find.addEventListener('input', () => { set({ query: find.value, current: 0 }); reveal(); });
	const keys = (e: KeyboardEvent) => {
		if (e.key === 'Escape') { e.preventDefault(); close(); }
		if (e.key === 'Enter') { e.preventDefault(); if (e.target === replace) replaceOne(); else step(e.shiftKey ? -1 : 1); }
	};
	find.addEventListener('keydown', keys);
	replace.addEventListener('keydown', keys);
	panel = el('div', { class: 'ay-find', role: 'search' },
		el('div', { class: 'ay-find-row' }, find, count, button('ChevronUp', 'Previous match', () => step(-1)), button('ChevronDown', 'Next match', () => step(1)), button('X', 'Close', close)),
		el('div', { class: 'ay-find-row' }, replace, text('Replace', replaceOne), text('All', replaceAll)));
	anchor.append(panel);
	const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ');
	if (selected && selected.length < 80) { find.value = selected; set({ query: selected, current: 0 }); reveal(); }
	find.focus();
	find.select();
}

export function closeFind() { panel?.remove(); panel = null; }
