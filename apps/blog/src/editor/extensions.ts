// The editor's schema and behaviour.
import { Extension, type Editor } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import { TableRow } from '@tiptap/extension-table';
import { PostTable, PostCell, PostHeader } from './table';
import { RawHtml, RawInline } from './raw';
import { FindReplace } from './find';
import { BulletList, TaskList, TaskItem } from '@tiptap/extension-list';
import { Placeholder, CharacterCount } from '@tiptap/extensions';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Typography from '@tiptap/extension-typography';
import Suggestion from '@tiptap/suggestion';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
import { Markdown } from 'tiptap-markdown';
import { createLowlight, common } from 'lowlight';
import { PostImage, Callout, Details, DetailsSummary, Embed, LinkCard, InlineMath, BlockMath, type BlockContext } from './blocks';
import { el, icon, place, renderMermaid, toast } from './dom';
import { filterCommands, EMOJI, type EditorActions, type Command } from './commands';

const lowlight = createLowlight(common);
const LANGUAGES = ['plaintext', 'python', 'javascript', 'typescript', 'bash', 'json', 'yaml', 'html', 'css', 'sql', 'java', 'go', 'rust', 'cpp', 'c', 'csharp', 'php', 'ruby', 'kotlin', 'swift', 'markdown', 'diff', 'mermaid'];

// Code block with a language picker, a copy button and a live diagram preview.
const CodeBlock = CodeBlockLowlight.extend({
	addNodeView() {
		return ({ node, editor, getPos }) => {
			let current = node;
			const code = el('code');
			const pre = el('pre', {}, code);
			const select = el('select', { 'aria-label': 'Code language' }) as HTMLSelectElement;
			for (const l of LANGUAGES) select.append(el('option', { value: l }, l));
			select.addEventListener('change', () => {
				editor.view.dispatch(editor.state.tr.setNodeMarkup((getPos as () => number)(), undefined, { language: select.value }));
			});
			const copy = el('button', { type: 'button', title: 'Copy code' });
			copy.innerHTML = icon('Copy', 14);
			copy.addEventListener('click', async () => { await navigator.clipboard.writeText(current.textContent); toast('Code copied'); });
			const bar = el('div', { class: 'ay-code-bar', contenteditable: 'false' }, select, copy);
			const diagram = el('div', { class: 'ay-diagram', contenteditable: 'false' });
			const dom = el('div', { class: 'ay-code' }, bar, pre, diagram);
			let timer = 0;
			const paint = () => {
				const lang = current.attrs.language || 'plaintext';
				if (!LANGUAGES.includes(lang)) select.append(el('option', { value: lang }, lang));
				select.value = lang;
				const isDiagram = lang === 'mermaid';
				dom.classList.toggle('is-diagram', isDiagram);
				diagram.hidden = !isDiagram;
				clearTimeout(timer);
				if (isDiagram) timer = window.setTimeout(() => renderMermaid(diagram, current.textContent), 300);
			};
			paint();
			return {
				dom, contentDOM: code,
				update(next) { if (next.type !== current.type) return false; const changed = next.textContent !== current.textContent || next.attrs.language !== current.attrs.language; current = next; if (changed) paint(); return true; },
				stopEvent: (e) => bar.contains(e.target as Node),
				ignoreMutation: (m) => !code.contains(m.target as Node),
			};
		};
	},
});

// Headings below the post title only. A stray "# " in old Markdown becomes a section heading.
const PostHeading = Heading.extend({
	parseHTML() { return [...(this.parent?.() || []), { tag: 'h1', attrs: { level: 2 } }]; },
});

// Bulleted lists and checklists both start with "- ", so Markdown would merge two
// neighbours into one list. An HTML comment between them keeps them apart.
const dashList = (list: any) => list.extend({
	addStorage() {
		return {
			...this.parent?.(),
			markdown: {
				serialize(state: any, node: any, parent: any, index: number) {
					const before = index > 0 ? parent.child(index - 1).type.name : '';
					if (before === 'bulletList' || before === 'taskList') state.write('<!-- -->\n\n');
					state.renderList(node, '  ', () => '- ');
				},
			},
		};
	},
});

// Pasted Markdown can mix "- item" and "- [ ] item" in one list. The editor needs
// those as separate lists, or plain items turn into empty checkboxes.
const MixedListFix = Extension.create({
	name: 'mixedListFix',
	addStorage: () => ({
		markdown: {
			parse: {
				updateDOM(root: HTMLElement) {
					for (const list of [...root.querySelectorAll('ul.contains-task-list')]) {
						const items = [...list.children];
						if (items.every((li) => li.classList.contains('task-list-item'))) continue;
						let run: HTMLElement | null = null;
						let runIsTask = false;
						for (const li of items) {
							const isTask = li.classList.contains('task-list-item');
							if (!run || isTask !== runIsTask) {
								run = document.createElement('ul');
								if (isTask) { run.className = 'contains-task-list'; run.dataset.type = 'taskList'; }
								runIsTask = isTask;
								list.before(run);
							}
							run.append(li);
						}
						list.remove();
					}
				},
			},
		},
	}),
});

interface MenuItem { key: string; html: string; onPick(): void }

/** A keyboard-driven list that floats at the caret, used by "/" and ":". */
function floatingList() {
	const box = el('div', { class: 'ay-menu', role: 'listbox' });
	box.hidden = true;
	let items: MenuItem[] = [];
	let active = 0;
	const paint = () => {
		box.replaceChildren();
		items.forEach((item, i) => {
			const b = el('button', { type: 'button', role: 'option', class: `ay-menu-item${i === active ? ' is-active' : ''}` });
			b.innerHTML = item.html;
			b.addEventListener('mousedown', (e) => { e.preventDefault(); item.onPick(); });
			box.append(b);
		});
		box.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' });
	};
	return {
		box,
		set(next: MenuItem[], rect: DOMRect | null) {
			items = next; active = 0; paint();
			if (!next.length) { box.hidden = true; return; }
			if (rect) place(box, rect);
		},
		key(e: KeyboardEvent) {
			if (e.key === 'ArrowDown') { active = (active + 1) % Math.max(items.length, 1); paint(); return true; }
			if (e.key === 'ArrowUp') { active = (active - 1 + items.length) % Math.max(items.length, 1); paint(); return true; }
			if (e.key === 'Enter' || e.key === 'Tab') { if (items[active]) { items[active].onPick(); return true; } return false; }
			if (e.key === 'Escape') { box.hidden = true; return true; }
			return false;
		},
	};
}

function suggestion(editor: Editor, opts: { allowSpaces?: boolean; char: string; name: string; items(q: string): any[]; toItem(item: any, pick: () => void): MenuItem; run(item: any, range: any): void }) {
	return Suggestion({
		editor,
		pluginKey: new PluginKey(opts.name),
		char: opts.char,
		allowSpaces: opts.allowSpaces,
		allow: ({ state, range }) => !state.doc.resolve(range.from).parent.type.spec.code,
		items: ({ query }) => opts.items(query),
		command: ({ range, props }) => opts.run(props, range),
		render: () => {
			const list = floatingList();
			const fill = (p: any) => list.set(p.items.map((it: any) => opts.toItem(it, () => p.command(it))), p.clientRect?.());
			return {
				onStart(p) { document.body.append(list.box); fill(p); },
				onUpdate(p) { fill(p); },
				onKeyDown({ event }) { return list.box.hidden ? false : list.key(event); },
				onExit() { list.box.remove(); },
			};
		},
	});
}

function menuRow(c: Command) {
	return `<span class="ay-menu-icon">${icon(c.icon, 18)}</span><span class="ay-menu-text"><strong>${c.label}</strong><small>${c.hint}</small></span>`;
}

export function createExtensions(ctx: BlockContext, actions: EditorActions) {
	const SlashCommands = Extension.create({
		name: 'slashCommands',
		addProseMirrorPlugins() {
			const editor = this.editor;
			return [suggestion(editor, {
				char: '/', name: 'slashCommands', allowSpaces: true,
				items: filterCommands,
				toItem: (c: Command, pick) => ({ key: c.id, html: menuRow(c), onPick: pick }),
				run: (c: Command, range) => {
					editor.chain().focus().deleteRange(range).run();
					const { from } = editor.state.selection;
					const at = editor.view.coordsAtPos(from);
					c.run(editor, actions, { getBoundingClientRect: () => new DOMRect(at.left, at.top, 0, at.bottom - at.top) });
				},
			})];
		},
	});

	const Emoji = Extension.create({
		name: 'emojiPicker',
		addProseMirrorPlugins() {
			const editor = this.editor;
			return [suggestion(editor, {
				char: ':', name: 'emojiPicker',
				items: (q) => (q ? EMOJI.filter(([n]) => n.includes(q.toLowerCase())).slice(0, 8) : []),
				toItem: ([name, glyph]: [string, string], pick) => ({ key: name, html: `<span class="ay-menu-icon">${glyph}</span><span class="ay-menu-text"><strong>${name}</strong></span>`, onPick: pick }),
				run: ([, glyph]: [string, string], range) => editor.chain().focus().insertContentAt(range, glyph).run(),
			})];
		},
	});

	return [
		StarterKit.configure({
			heading: false,
			codeBlock: false,
			bulletList: false,
			link: { openOnClick: false, autolink: true, linkOnPaste: true, HTMLAttributes: { rel: null, target: null, class: null } },
			dropcursor: { color: 'hsl(221 83% 53%)', width: 3 },
		}),
		PostHeading.configure({ levels: [2, 3, 4] }),
		CodeBlock.configure({ lowlight, defaultLanguage: 'plaintext', enableTabIndentation: true, tabSize: 4 }),
		PostTable.configure({ resizable: false }), TableRow, PostHeader, PostCell,
		dashList(BulletList), dashList(TaskList), TaskItem.configure({ nested: true }), MixedListFix,
		Highlight, Subscript, Superscript, Typography,
		PostImage.configure({ ctx }), Embed.configure({ ctx }), LinkCard, Callout, Details, DetailsSummary, InlineMath, BlockMath, RawHtml, RawInline, FindReplace,
		CharacterCount,
		Placeholder.configure({
			includeChildren: true,
			placeholder: ({ node, pos, editor }) => {
				if (node.type.name === 'detailsSummary') return 'Toggle title';
				if (node.type.name === 'heading') return `Heading ${node.attrs.level}`;
				return editor.isEmpty && pos === 0 ? 'Start writing, or press / for images, tables, code, embeds and more…' : 'Press / for commands';
			},
		}),
		GlobalDragHandle.configure({ dragHandleWidth: 22, scrollTreshold: 80 }),
		SlashCommands, Emoji,
		Markdown.configure({ html: true, tightLists: true, bulletListMarker: '-', linkify: false, breaks: false, transformPastedText: true, transformCopiedText: false }),
	];
}
