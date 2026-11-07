// Small DOM helpers shared by the blocks and the editor's interface.
import { ICONS } from './icons';

type Child = Node | string;

export function el<K extends string>(tag: K, attrs: Record<string, string> = {}, ...children: Child[]): HTMLElement {
	const node = document.createElement(tag);
	for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
	node.append(...children.filter((c) => c !== ''));
	return node;
}

/** An icon from the lucide set, as an SVG string. */
export function icon(name: string, size = 16) {
	const def = (ICONS as any)[name];
	if (!def) return '';
	const kids: any[] = Array.isArray(def[2]) ? def[2] : def;
	const body = kids.map(([tag, a]: any) => `<${tag} ${Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('');
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

let katexPromise: Promise<any> | null = null;
export async function renderMath(target: HTMLElement, latex: string, block: boolean) {
	if (!latex.trim()) { target.textContent = block ? 'Empty equation. Click to edit.' : 'x'; target.classList.add('is-empty'); return; }
	target.classList.remove('is-empty');
	katexPromise ||= import('katex');
	const katex = (await katexPromise).default;
	katex.render(latex, target, { displayMode: block, throwOnError: false, output: 'htmlAndMathml' });
}

let mermaidPromise: Promise<any> | null = null;
let mermaidCount = 0;
export async function renderMermaid(target: HTMLElement, code: string) {
	mermaidPromise ||= import('mermaid').then((m) => { m.default.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral' }); return m.default; });
	const mermaid = await mermaidPromise;
	try {
		const { svg } = await mermaid.render(`ay-mermaid-${++mermaidCount}`, code);
		target.innerHTML = svg;
		target.classList.remove('is-error');
	} catch (err: any) {
		target.textContent = `Diagram error: ${String(err?.message || err).split('\n')[0]}`;
		target.classList.add('is-error');
		document.getElementById(`day-mermaid-${mermaidCount}`)?.remove();
	}
}

// ------------------------------------------------------------- floating UI
export function place(node: HTMLElement, rect: { left: number; top: number; bottom: number; right?: number }) {
	node.style.position = 'fixed';
	node.style.visibility = 'hidden';
	node.hidden = false;
	const { width, height } = node.getBoundingClientRect();
	const left = Math.max(8, Math.min(rect.left, innerWidth - width - 8));
	const below = rect.bottom + 8;
	const top = below + height > innerHeight - 8 ? Math.max(8, rect.top - height - 8) : below;
	node.style.left = `${left}px`;
	node.style.top = `${top}px`;
	node.style.visibility = '';
}

interface FieldOptions {
	label: string;
	value?: string;
	placeholder?: string;
	multiline?: boolean;
	mathPreview?: boolean;
	saveLabel?: string;
	onSave(value: string): void;
	onRemove?(): void;
}

let openField: (() => void) | null = null;

/** A small popover with one input: link URLs, alt text, equations, embed URLs. */
export function editField(anchor: Element | { getBoundingClientRect(): DOMRect }, opts: FieldOptions) {
	openField?.();
	const input = el(opts.multiline ? 'textarea' : 'input', { class: 'ay-pop-input', placeholder: opts.placeholder || '', 'aria-label': opts.label, rows: '4' }) as HTMLInputElement;
	input.value = opts.value || '';
	const preview = opts.mathPreview ? el('div', { class: 'ay-pop-preview' }) : null;
	const save = el('button', { type: 'button', class: 'ay-btn ay-btn-primary' }, opts.saveLabel || 'Save');
	const cancel = el('button', { type: 'button', class: 'ay-btn' }, 'Cancel');
	const actions = el('div', { class: 'ay-pop-actions' });
	if (opts.onRemove) {
		const remove = el('button', { type: 'button', class: 'ay-btn ay-btn-danger' }, 'Remove');
		remove.addEventListener('click', () => { close(); opts.onRemove!(); });
		actions.append(remove);
	}
	actions.append(cancel, save);
	const pop = el('div', { class: 'ay-pop', role: 'dialog', 'aria-label': opts.label }, el('label', { class: 'ay-pop-label' }, opts.label), input, ...(preview ? [preview] : []), actions);
	document.body.append(pop);
	const outside = (e: Event) => { if (!pop.contains(e.target as Node)) close(); };
	function close() {
		pop.remove();
		document.removeEventListener('pointerdown', outside, true);
		openField = null;
	}
	openField = close;
	const commit = () => { const v = input.value.trim(); close(); opts.onSave(v); };
	save.addEventListener('click', commit);
	cancel.addEventListener('click', close);
	input.addEventListener('keydown', (e: KeyboardEvent) => {
		e.stopPropagation();
		if (e.key === 'Escape') { e.preventDefault(); close(); }
		if (e.key === 'Enter' && (!opts.multiline || e.metaKey || e.ctrlKey)) { e.preventDefault(); commit(); }
	});
	if (preview) {
		const update = () => renderMath(preview, input.value, true);
		input.addEventListener('input', update);
		update();
	}
	place(pop, anchor.getBoundingClientRect());
	setTimeout(() => { document.addEventListener('pointerdown', outside, true); input.focus(); input.select?.(); });
}

export function toast(message: string, kind: 'info' | 'error' = 'info') {
	let host = document.getElementById('ay-toasts');
	if (!host) { host = el('div', { id: 'ay-toasts', 'aria-live': 'polite' }); document.body.append(host); }
	const t = el('div', { class: `ay-toast ay-toast-${kind}` }, message);
	host.append(t);
	setTimeout(() => t.remove(), kind === 'error' ? 7000 : 3500);
}

export function pickFiles(accept: string, multiple = true): Promise<File[]> {
	return new Promise((resolve) => {
		const input = el('input', { type: 'file', accept }) as HTMLInputElement;
		input.multiple = multiple;
		input.addEventListener('change', () => resolve([...(input.files || [])]));
		input.click();
	});
}
