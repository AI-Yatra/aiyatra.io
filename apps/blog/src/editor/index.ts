// The writing experience at /blog/admin, plugged into Decap CMS as custom
// widgets. Decap still handles sign-in, drafts, media, PRs and publishing.
import 'katex/dist/katex.min.css';
import '../styles/post-blocks.css';
import './editor.css';
import { mountBody } from './body';
import { el, editField, icon, pickFiles, toast } from './dom';
import { uploadFile, resolveAsset } from './upload';
import { openStockPicker } from './stock';
import { isUrl } from './embeds';

declare const CMS: any;
const { createClass, h } = window as any;

/** Tags this field's Decap wrapper so the stylesheet can lay out the canvas. */
function claim(root: HTMLElement, name: string) {
	const wrapper = root.parentElement!;
	wrapper.dataset.ayCanvas = name;
	wrapper.parentElement!.dataset.ayPane = '';
	return wrapper.parentElement!;
}

/** Wraps a plain DOM widget in the React class Decap expects. */
function widget(setup: (root: HTMLElement, self: any) => { sync?(value: any): void; destroy?(): void }, opts: { canvas?: boolean } = {}) {
	return createClass({
		componentDidMount(this: any) {
			if (opts.canvas !== false) claim(this.root, this.props.field.get('name'));
			this.api = setup(this.root, this);
		},
		componentDidUpdate(this: any, prev: any) { if (prev.value !== this.props.value) this.api.sync?.(this.props.value); },
		componentWillUnmount(this: any) { this.api.destroy?.(); },
		render(this: any) { return h('div', { ref: (n: HTMLElement) => { if (n) this.root = n; }, id: this.props.forID }); },
	});
}

function autoTextarea(root: HTMLElement, self: any, cls: string, multiline: boolean) {
	const box = el('textarea', { class: cls, rows: '1', placeholder: self.props.field.get('placeholder') || '', 'aria-label': self.props.field.get('label') }) as HTMLTextAreaElement;
	const fit = () => { box.style.height = 'auto'; box.style.height = `${box.scrollHeight}px`; };
	box.value = self.props.value || '';
	box.addEventListener('input', () => { self.props.onChange(multiline ? box.value : box.value.replace(/\n/g, ' ')); fit(); });
	box.addEventListener('keydown', (e) => {
		if (e.key !== 'Enter' || multiline) return;
		e.preventDefault();
		(document.querySelector('.ay-canvas .ProseMirror') as HTMLElement)?.focus();
	});
	root.append(box);
	new ResizeObserver(fit).observe(root);
	fit();
	return { sync(v: string) { if (document.activeElement !== box && (v || '') !== box.value) { box.value = v || ''; fit(); } } };
}

/** Fills another field on the canvas, as if the writer had typed it. */
function fillField(name: string, value: string) {
	const box = document.querySelector<HTMLTextAreaElement>(`[data-ay-canvas="${name}"] textarea`);
	if (!box) return;
	box.value = value;
	box.dispatchEvent(new Event('input', { bubbles: true }));
}

const TitleControl = widget((root, self) => autoTextarea(root, self, 'ay-title', false));
const LineControl = widget((root, self) => {
	if (self.props.field.get('name') === 'subtitle' && self.props.value) root.parentElement!.parentElement!.dataset.ayShowSubtitle = '';
	return autoTextarea(root, self, 'ay-line', false);
});

const BodyControl = widget((root, self) => {
	const pane = root.parentElement!.parentElement!;
	setupShell(pane);
	const body = mountBody(root, () => self.props);
	return { sync: body.sync, destroy() { body.destroy(); teardownShell(); } };
});

const CoverControl = widget((root, self) => {
	const pane = root.parentElement!.parentElement!;
	const box = el('div', { class: 'ay-cover' });
	root.append(box);
	const set = async (files: File[]) => {
		const file = files.find((f) => f.type.startsWith('image/'));
		if (!file) { if (files.length) toast('A cover has to be an image.', 'error'); return; }
		const path = await uploadFile(file, self.props);
		if (path) { self.props.onChange(path); paint(path); }
	};
	const useUrl = (anchor: Element) => editField(anchor, {
		label: 'Image address', placeholder: 'https://…/picture.jpg', saveLabel: 'Use image',
		onSave: (url) => {
			if (!url) return;
			if (!isUrl(url)) { toast('That doesn’t look like a full web address.', 'error'); return; }
			self.props.onChange(url);
			paint(url);
		},
	});
	const useStock = () => openStockPicker(self.props, ({ src, alt, credit }) => {
		self.props.onChange(src);
		paint(src);
		// Wait for the description and credit fields to appear with the cover.
		setTimeout(() => { fillField('coverAlt', alt); fillField('coverCredit', credit); });
	});
	const addSubtitle = () => {
		pane.dataset.ayShowSubtitle = '';
		paint(self.props.value || '');
		document.querySelector<HTMLTextAreaElement>('[data-ay-canvas="subtitle"] textarea')?.focus();
	};
	const button = (label: string, iconName: string, run: () => void) => {
		const b = el('button', { type: 'button', class: 'ay-chip' });
		b.innerHTML = `${icon(iconName, 15)}<span>${label}</span>`;
		b.addEventListener('click', run);
		return b;
	};
	const paint = (value: string) => {
		box.replaceChildren();
		if (value) pane.dataset.ayHasCover = ''; else delete pane.dataset.ayHasCover;
		box.classList.toggle('has-image', !!value);
		if (value) {
			const img = el('img', { alt: '' }) as HTMLImageElement;
			resolveAsset(() => self.props, value, (u) => { img.src = u; });
			box.append(img, el('div', { class: 'ay-cover-actions' },
				button('Change', 'ImageUp', async () => set(await pickFiles('image/*', false))),
				button('Stock photo', 'Images', useStock),
				button('Remove', 'Trash2', () => { self.props.onChange(''); fillField('coverCredit', ''); paint(''); })));
		} else {
			const url = button('Cover from URL', 'Link', () => useUrl(url));
			box.append(button('Add cover', 'Image', async () => set(await pickFiles('image/*', false))), button('Stock photo', 'Images', useStock), url);
		}
		const hasSubtitle = 'ayShowSubtitle' in pane.dataset || !!self.props.getEntry?.()?.getIn(['data', 'subtitle']);
		if (!hasSubtitle) box.append(button('Add subtitle', 'Type', addSubtitle));
	};
	box.addEventListener('dragover', (e) => { if (e.dataTransfer?.types.includes('Files')) { e.preventDefault(); box.classList.add('is-over'); } });
	box.addEventListener('dragleave', () => box.classList.remove('is-over'));
	box.addEventListener('drop', (e) => {
		e.preventDefault();
		box.classList.remove('is-over');
		set([...(e.dataTransfer?.files || [])]);
	});
	paint(self.props.value || '');
	return { sync(v: string) { paint(v || ''); } };
});

const TagsControl = widget((root, self) => {
	const toArray = (v: any): string[] => (v?.toJS ? v.toJS() : Array.isArray(v) ? v : []).filter(Boolean);
	let tags = toArray(self.props.value);
	const hash = self.props.field.get('hash') !== false;
	const input = el('input', { class: 'ay-tag-input', placeholder: self.props.field.get('placeholder') || 'Add a tag and press Enter', 'aria-label': self.props.field.get('label') }) as HTMLInputElement;
	const box = el('div', { class: 'ay-tags' });
	const paint = () => {
		box.replaceChildren(...tags.map((t, i) => {
			const chip = el('span', { class: 'ay-tag' }, hash ? `#${t}` : t);
			const x = el('button', { type: 'button', 'aria-label': `Remove tag ${t}` }, '×');
			x.addEventListener('click', () => { tags = tags.filter((_, n) => n !== i); commit(); });
			chip.append(x);
			return chip;
		}), input);
	};
	const commit = () => { self.props.onChange(tags); paint(); input.focus(); };
	const add = () => {
		const fresh = input.value.split(',').map((t) => t.trim().replace(hash ? /^#/ : /^$/, '')).filter((t) => t && !tags.includes(t));
		input.value = '';
		if (fresh.length) { tags = [...tags, ...fresh]; commit(); }
	};
	input.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
		if (e.key === 'Backspace' && !input.value && tags.length) { tags = tags.slice(0, -1); commit(); }
	});
	input.addEventListener('blur', add);
	root.append(box);
	paint();
	return { sync(v: any) { const next = toArray(v); if (next.join('\u0000') !== tags.join('\u0000')) { tags = next; paint(); } } };
}, { canvas: false });

// The post's address. It follows the title until the writer edits it, and can't
// change after the first save because Decap uses it as the file name.
const SlugControl = widget((root, self) => {
	const isNew = !!self.props.getEntry?.()?.get('newRecord');
	const toSlug = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g, '').trim().replace(/[\s-]+/g, '-').slice(0, 80);
	const prefix = el('span', {}, 'aiyatra.io/blog/');
	const input = el('input', { 'aria-label': 'Post URL', placeholder: 'your-post-title', spellcheck: 'false' }) as HTMLInputElement;
	root.append(el('div', { class: 'ay-slug' }, prefix, input));
	if (!isNew) {
		input.value = self.props.value || self.props.getEntry?.()?.get('slug') || '';
		input.disabled = true;
		return {};
	}
	let edited = !!self.props.value;
	input.value = self.props.value || '';
	const follow = (e: Event) => {
		const t = e.target as HTMLElement;
		if (edited || !t.classList?.contains('ay-title')) return;
		const slug = toSlug((t as HTMLTextAreaElement).value);
		input.value = slug;
		self.props.onChange(slug);
	};
	document.addEventListener('input', follow, true);
	input.addEventListener('input', () => {
		edited = !!input.value;
		const slug = input.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
		input.value = slug;
		self.props.onChange(slug);
	});
	input.addEventListener('blur', () => { input.value = toSlug(input.value); self.props.onChange(input.value); });
	return { destroy() { document.removeEventListener('input', follow, true); } };
}, { canvas: false });

// ---------------------------------------------------------------- the shell
// Writing gets the whole page. Everything else lives in a drawer that slides in
// from the right, so the post stays visible while filling in the details.
let shell: HTMLElement | null = null;
let observer: MutationObserver | null = null;

function setupShell(pane: HTMLElement) {
	document.body.classList.add('ay-editing');
	// Decap's page has fixed colours and a minimum width. Marking the panels that
	// wrap the form lets the stylesheet adapt them for dark mode and phones.
	for (let n: HTMLElement | null = pane; n && n !== document.body; n = n.parentElement) n.classList.add('ay-surface');

	const body = el('div', { class: 'ay-drawer-body' });
	const close = el('button', { type: 'button', class: 'ay-drawer-close', 'aria-label': 'Close post details' });
	close.innerHTML = icon('X', 18);
	close.addEventListener('click', () => view('write'));
	const drawer = el('aside', { class: 'ay-drawer', 'aria-label': 'Post details' }, el('header', {}, el('h2', {}, 'Post details'), close), body);
	// The field list is fixed once Decap has rendered it, so these can safely move.
	for (const child of [...pane.children] as HTMLElement[]) if (!child.dataset.ayCanvas) body.append(child);
	pane.append(drawer);

	const view = (name: 'write' | 'details' | 'preview') => {
		pane.dataset.ayView = name;
		document.body.dataset.ayView = name;
		tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.view === name)));
		window.dispatchEvent(new CustomEvent('ay-preview', { detail: name === 'preview' }));
	};
	const tab = (name: 'write' | 'details' | 'preview', label: string, iconName: string) => {
		const b = el('button', { type: 'button', role: 'tab', 'data-view': name });
		b.innerHTML = `${icon(iconName, 15)}<span>${label}</span>`;
		b.addEventListener('click', () => view(name === 'details' && pane.dataset.ayView === 'details' ? 'write' : name));
		return b;
	};
	const tabs = [tab('write', 'Write', 'PenLine'), tab('preview', 'Preview', 'Eye'), tab('details', 'Post details', 'SlidersHorizontal')];
	shell = el('div', { id: 'ay-tabs', role: 'tablist', 'aria-label': 'Editor view' }, ...tabs);
	document.body.append(shell);
	view('write');

	// A required field that's empty somewhere hidden would otherwise fail silently.
	observer = new MutationObserver((records) => {
		for (const r of records) for (const n of r.addedNodes) {
			if (!(n instanceof HTMLUListElement) || n.closest('.ay-canvas')) continue;
			const owner = (n.closest('[data-ay-canvas]') || (n.closest('.ay-drawer-body') && [...body.children].find((c) => c.contains(n)))) as HTMLElement | null;
			if (!owner) continue;
			const target = owner.dataset.ayCanvas ? 'write' : 'details';
			if (pane.dataset.ayView !== target) {
				view(target);
				toast(target === 'details' ? 'A few post details still need filling in.' : 'Your post needs a title and some content.', 'error');
			}
			owner.scrollIntoView({ block: 'center' });
			return;
		}
	});
	observer.observe(pane, { childList: true, subtree: true });
}

function teardownShell() {
	observer?.disconnect();
	shell?.remove();
	shell = null;
	document.body.classList.remove('ay-editing');
	delete document.body.dataset.ayView;
}

const blank = () => h('div', {});
CMS.registerWidget('ay-title', TitleControl, blank);
CMS.registerWidget('ay-line', LineControl, blank);
CMS.registerWidget('ay-cover', CoverControl, blank);
CMS.registerWidget('ay-body', BodyControl, blank);
CMS.registerWidget('ay-tags', TagsControl, blank);
CMS.registerWidget('ay-slug', SlugControl, blank);
CMS.init();
