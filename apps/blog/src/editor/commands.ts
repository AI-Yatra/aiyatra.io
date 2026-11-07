// Everything the writer can insert or apply. The toolbar, the "/" menu and the
// "+" button all read from this one list.
import type { Editor } from '@tiptap/core';
import { editField, pickFiles, toast } from './dom';
import { isImageUrl, isUrl, toEmbed } from './embeds';

export interface EditorActions {
	insertFiles(files: File[], pos?: number): Promise<void>;
	insertUrl(url: string, pos?: number): Promise<void>;
	stockPhoto(): void;
	ai(): void;
}

export interface Command {
	id: string;
	label: string;
	hint: string;
	icon: string;
	group: string;
	keywords?: string;
	run(editor: Editor, actions: EditorActions, anchor: Element | { getBoundingClientRect(): DOMRect }): void;
}

const callout = (type: string) => (e: Editor) => e.chain().focus().insertContent({ type: 'callout', attrs: { type }, content: [{ type: 'paragraph' }] }).run();

function askUrl(label: string, placeholder: string, then: (url: string) => void, anchor: any) {
	editField(anchor, { label, placeholder, saveLabel: 'Add', onSave: (v) => {
		if (!v) return;
		if (!isUrl(v)) { toast('That doesn’t look like a full web address. It should start with https://', 'error'); return; }
		then(v);
	} });
}

export const COMMANDS: Command[] = [
	{ id: 'p', label: 'Text', hint: 'Plain paragraph', icon: 'Pilcrow', group: 'Basics', keywords: 'paragraph body', run: (e) => e.chain().focus().setParagraph().run() },
	{ id: 'h2', label: 'Heading', hint: 'Section title', icon: 'Heading2', group: 'Basics', keywords: 'h2 title section', run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
	{ id: 'h3', label: 'Subheading', hint: 'Sub-section title', icon: 'Heading3', group: 'Basics', keywords: 'h3', run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
	{ id: 'h4', label: 'Small heading', hint: 'Minor title', icon: 'Heading4', group: 'Basics', keywords: 'h4', run: (e) => e.chain().focus().toggleHeading({ level: 4 }).run() },
	{ id: 'ul', label: 'Bulleted list', hint: 'A simple list', icon: 'List', group: 'Basics', keywords: 'unordered bullet', run: (e) => e.chain().focus().toggleBulletList().run() },
	{ id: 'ol', label: 'Numbered list', hint: 'Steps in order', icon: 'ListOrdered', group: 'Basics', keywords: 'ordered number', run: (e) => e.chain().focus().toggleOrderedList().run() },
	{ id: 'task', label: 'Checklist', hint: 'Tick-box items', icon: 'ListChecks', group: 'Basics', keywords: 'todo task checkbox', run: (e) => e.chain().focus().toggleTaskList().run() },
	{ id: 'quote', label: 'Quote', hint: 'Highlight a quotation', icon: 'Quote', group: 'Basics', keywords: 'blockquote', run: (e) => e.chain().focus().toggleBlockquote().run() },
	{ id: 'hr', label: 'Divider', hint: 'A line between sections', icon: 'Minus', group: 'Basics', keywords: 'hr rule separator', run: (e) => e.chain().focus().setHorizontalRule().run() },

	{ id: 'image', label: 'Image', hint: 'Upload from your device', icon: 'Image', group: 'Media', keywords: 'photo picture upload', run: async (e, a) => { const f = await pickFiles('image/*'); e.commands.focus(); await a.insertFiles(f); } },
	{ id: 'imageurl', label: 'Image from URL', hint: 'Paste an image address', icon: 'ImageUp', group: 'Media', keywords: 'photo link', run: (e, a, anchor) => askUrl('Image address', 'https://…/picture.png', (url) => { if (isImageUrl(url)) e.chain().focus().insertContent({ type: 'image', attrs: { src: url } }).run(); else a.insertUrl(url); }, anchor) },
	{ id: 'stock', label: 'Stock photo', hint: 'Search free, openly licensed photos', icon: 'Images', group: 'Media', keywords: 'unsplash picture image search free openverse', run: (_e, a) => a.stockPhoto() },
	{ id: 'video', label: 'Video or audio file', hint: 'Upload a file up to 10 MB', icon: 'Clapperboard', group: 'Media', keywords: 'mp4 mp3 upload', run: async (e, a) => { const f = await pickFiles('video/*,audio/*'); e.commands.focus(); await a.insertFiles(f); } },
	{ id: 'file', label: 'File attachment', hint: 'PDF, slides, notebook…', icon: 'Paperclip', group: 'Media', keywords: 'pdf download attach', run: async (e, a) => { const f = await pickFiles('*/*'); e.commands.focus(); await a.insertFiles(f); } },
	{ id: 'embed', label: 'Embed a link', hint: 'YouTube, X, CodePen, Figma, Gist…', icon: 'Youtube', group: 'Media', keywords: 'youtube vimeo loom spotify codepen codesandbox stackblitz figma gist twitter x huggingface slides iframe', run: (e, a, anchor) => askUrl('Paste a link to embed', 'https://youtube.com/watch?v=…', (url) => { if (!toEmbed(url)) toast('That site can’t be embedded, so it was added as a link card.'); a.insertUrl(url); }, anchor) },
	{ id: 'card', label: 'Link card', hint: 'A link with title and image', icon: 'SquareArrowOutUpRight', group: 'Media', keywords: 'bookmark preview unfurl', run: (e, a, anchor) => askUrl('Paste a link', 'https://…', (url) => a.insertUrl(url), anchor) },

	{ id: 'code', label: 'Code block', hint: 'Syntax-highlighted code', icon: 'SquareCode', group: 'Rich blocks', keywords: 'snippet program', run: (e) => e.chain().focus().toggleCodeBlock().run() },
	{ id: 'table', label: 'Table', hint: 'Rows and columns', icon: 'Table', group: 'Rich blocks', keywords: 'grid', run: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
	{ id: 'note', label: 'Callout: note', hint: 'Side information', icon: 'Info', group: 'Rich blocks', keywords: 'info aside', run: callout('info') },
	{ id: 'tip', label: 'Callout: tip', hint: 'A helpful suggestion', icon: 'Lightbulb', group: 'Rich blocks', keywords: 'hint', run: callout('tip') },
	{ id: 'warn', label: 'Callout: warning', hint: 'Something to watch for', icon: 'TriangleAlert', group: 'Rich blocks', keywords: 'caution', run: callout('warning') },
	{ id: 'danger', label: 'Callout: important', hint: 'Must not be missed', icon: 'OctagonAlert', group: 'Rich blocks', keywords: 'danger error', run: callout('danger') },
	{ id: 'details', label: 'Toggle section', hint: 'Content readers can expand', icon: 'ChevronsUpDown', group: 'Rich blocks', keywords: 'details collapse accordion spoiler', run: (e) => e.chain().focus().insertContent({ type: 'details', content: [{ type: 'detailsSummary', content: [{ type: 'text', text: 'Click to expand' }] }, { type: 'paragraph' }] }).run() },
	{ id: 'math', label: 'Equation', hint: 'A LaTeX block', icon: 'Sigma', group: 'Rich blocks', keywords: 'latex katex formula', run: (e) => e.chain().focus().insertContent({ type: 'blockMath', attrs: { latex: 'E = mc^2' } }).run() },
	{ id: 'imath', label: 'Inline equation', hint: 'LaTeX inside a sentence', icon: 'Radical', group: 'Rich blocks', keywords: 'latex katex formula', run: (e) => e.chain().focus().insertContent({ type: 'inlineMath', attrs: { latex: 'x^2' } }).run() },
	{ id: 'mermaid', label: 'Diagram', hint: 'Flowcharts with Mermaid', icon: 'Workflow', group: 'Rich blocks', keywords: 'mermaid flowchart sequence chart', run: (e) => e.chain().focus().insertContent({ type: 'codeBlock', attrs: { language: 'mermaid' }, content: [{ type: 'text', text: 'flowchart LR\n  A[Idea] --> B[Draft]\n  B --> C[Review]\n  C --> D[Published]' }] }).run() },
	{ id: 'html', label: 'Custom HTML', hint: 'Add raw HTML to the post', icon: 'CodeXml', group: 'Rich blocks', keywords: 'raw source', run: (e) => e.chain().focus().insertContent({ type: 'rawHtml', attrs: { html: '<div>\n\n</div>' } }).run() },
	{ id: 'ai', label: 'AI writing help', hint: 'Rewrite, shorten or continue your text', icon: 'Sparkles', group: 'Rich blocks', keywords: 'claude assistant generate improve grammar', run: (_e, a) => a.ai() },
];

export const commandById = (id: string) => COMMANDS.find((c) => c.id === id)!;

export function filterCommands(query: string) {
	const q = query.toLowerCase().trim();
	if (!q) return COMMANDS;
	return COMMANDS.filter((c) => `${c.label} ${c.keywords || ''}`.toLowerCase().includes(q));
}

export const EMOJI: [string, string][] = Object.entries({
	smile: '😄', grin: '😁', joy: '😂', wink: '😉', thinking: '🤔', cool: '😎', party: '🥳', mindblown: '🤯', eyes: '👀', wave: '👋', thumbsup: '👍', thumbsdown: '👎', clap: '👏', pray: '🙏', muscle: '💪', ok: '👌', point: '👉',
	heart: '❤️', blueheart: '💙', fire: '🔥', sparkles: '✨', star: '⭐', rocket: '🚀', tada: '🎉', trophy: '🏆', medal: '🏅', target: '🎯', bulb: '💡', brain: '🧠', robot: '🤖', zap: '⚡', warning: '⚠️', check: '✅', cross: '❌', question: '❓', exclamation: '❗',
	computer: '💻', keyboard: '⌨️', gear: '⚙️', tools: '🛠️', wrench: '🔧', bug: '🐛', lock: '🔒', key: '🔑', link: '🔗', pin: '📌', memo: '📝', book: '📖', books: '📚', graph: '📈', chart: '📊', calendar: '📅', clock: '⏰', mail: '📧', globe: '🌍', india: '🇮🇳', microscope: '🔬', telescope: '🔭', test: '🧪', dna: '🧬', teacher: '🧑‍🏫', student: '🧑‍🎓', coffee: '☕', seedling: '🌱', tree: '🌳', sun: '☀️', moon: '🌙', hundred: '💯',
}) as [string, string][];
