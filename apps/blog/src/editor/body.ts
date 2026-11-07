// The post body: toolbar, canvas, drag-and-drop, Markdown source view and status bar.
import { Editor } from '@tiptap/core';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { createExtensions } from './extensions';
import { el, icon, editField, toast } from './dom';
import { commandById, type EditorActions } from './commands';
import { uploadFile, resolveAsset, kindOf } from './upload';
import { toEmbed, isImageUrl, isUrl } from './embeds';
import { hostOf } from './blocks';
import { fetchLinkPreview } from './unfurl';
import { alignColumn, columnAlignment } from './table';
import { openFind, closeFind } from './find';
import { openStockPicker } from './stock';
import { openAi } from './ai';
import { openPreview } from './preview';

interface Tool { icon: string; title: string; run(btn: HTMLElement): void; active?(): boolean; }

export function mountBody(root: HTMLElement, getProps: () => any) {
	let lastEmitted: string = getProps().value || '';
	let sourceMode = false;
	let timer = 0;

	const emit = () => {
		clearTimeout(timer);
		timer = 0;
		const md = sourceMode ? source.value : editor.storage.markdown.getMarkdown();
		if (md !== lastEmitted) { lastEmitted = md; getProps().onChange(md); }
	};

	const actions: EditorActions = {
		async insertFiles(files, pos) {
			for (const file of files) {
				if (/\.(md|markdown|txt)$/i.test(file.name)) {
					const text = await file.text();
					if (pos != null) editor.chain().focus().insertContentAt(pos, text).run(); else editor.chain().focus().insertContent(text).run();
					continue;
				}
				const path = await uploadFile(file, getProps());
				if (!path) continue;
				const kind = kindOf(file);
				const node = kind === 'image' ? { type: 'image', attrs: { src: path, alt: '' } }
					: kind === 'file' ? { type: 'linkCard', attrs: { url: path, title: file.name, file: true } }
					: { type: 'embed', attrs: { src: path, provider: kind } };
				if (pos != null) editor.chain().focus().insertContentAt(pos, node).run(); else editor.chain().focus().insertContent(node).run();
			}
			if (files.some((f) => kindOf(f) === 'image')) toast('Image added. It’s saved with your draft.');
		},
		stockPhoto: () => {},
		ai: () => {},
		async insertUrl(url, pos) {
			const put = (node: any) => (pos != null ? editor.chain().focus().insertContentAt(pos, node).run() : editor.chain().focus().insertContent(node).run());
			if (isImageUrl(url)) { put({ type: 'image', attrs: { src: url } }); return; }
			const embed = toEmbed(url);
			if (embed) { put({ type: 'embed', attrs: embed }); return; }
			put({ type: 'linkCard', attrs: { url, title: hostOf(url) } });
			// Fill in the title and image when the preview arrives, without moving the writer's caret.
			const meta = await fetchLinkPreview(url);
			if (!meta) return;
			editor.state.doc.descendants((node, at) => {
				if (node.type.name === 'linkCard' && node.attrs.url === url && node.attrs.title === hostOf(url)) {
					editor.view.dispatch(editor.state.tr.setNodeMarkup(at, undefined, { ...node.attrs, ...meta }));
					return false;
				}
				return true;
			});
		},
	};

	const stockPhoto = () => openStockPicker(getProps(), ({ src, alt, credit }) => {
		editor.chain().focus().insertContent({ type: 'image', attrs: { src, alt, caption: credit } }).run();
	});
	const ai = () => openAi(editor);
	actions.stockPhoto = stockPhoto;
	actions.ai = ai;

	// ------------------------------------------------------------ structure
	const toolbar = el('div', { class: 'ay-toolbar', role: 'toolbar', 'aria-label': 'Formatting' });
	const mount = el('div', { class: 'ay-canvas blog-body' });
	const source = el('textarea', { class: 'ay-source', spellcheck: 'false', 'aria-label': 'Post as Markdown' }) as HTMLTextAreaElement;
	source.hidden = true;
	const words = el('span');
	const status = el('div', { class: 'ay-status' }, words);
	const bubble = el('div', { class: 'ay-bubble', role: 'toolbar', 'aria-label': 'Text formatting' });
	const tableBar = el('div', { class: 'ay-table-row', role: 'toolbar', 'aria-label': 'Table' });
	tableBar.hidden = true;
	const outline = el('nav', { class: 'ay-outline', 'aria-label': 'Post outline' });
	outline.hidden = true;
	const dropHint = el('div', { class: 'ay-drop-hint' }, 'Drop to add to your post');
	const plus = el('button', { type: 'button', class: 'ay-plus', title: 'Add a block', 'aria-label': 'Add a block' });
	plus.innerHTML = icon('Plus', 16);
	plus.hidden = true;
	plus.addEventListener('mousedown', (e) => e.preventDefault());
	plus.addEventListener('click', () => editor.chain().focus().insertContent('/').run());
	bubble.hidden = true;
	root.append(toolbar, mount, source, status, outline);
	document.body.append(dropHint, bubble, plus);

	const editor: Editor = new Editor({
		element: mount,
		content: lastEmitted,
		extensions: [
			...createExtensions({ resolve: (path, done) => resolveAsset(getProps, path, done) }, {
				insertFiles: (f, p) => actions.insertFiles(f, p),
				insertUrl: (u, p) => actions.insertUrl(u, p),
				stockPhoto: () => actions.stockPhoto(),
				ai: () => actions.ai(),
			}),
		],
		editorProps: {
			attributes: { 'aria-label': 'Post content', spellcheck: 'true' },
			// Typing with an image or embed selected starts a new paragraph after it,
			// instead of replacing the block.
			handleTextInput(view, _from, _to, text) {
				const { selection, schema, tr } = view.state;
				if (!(selection instanceof NodeSelection) || !selection.node.isBlock) return false;
				const after = selection.to;
				tr.insert(after, schema.nodes.paragraph.create(null, schema.text(text)));
				view.dispatch(tr.setSelection(TextSelection.create(tr.doc, after + 1 + text.length)).scrollIntoView());
				return true;
			},
			handleDrop(view, event, _slice, moved) {
				if (moved) return false;
				const dt = (event as DragEvent).dataTransfer;
				if (!dt) return false;
				const pos = view.posAtCoords({ left: (event as DragEvent).clientX, top: (event as DragEvent).clientY })?.pos;
				if (dt.files?.length) { event.preventDefault(); actions.insertFiles([...dt.files], pos); return true; }
				const dropped = droppedUrl(dt);
				if (dropped) { event.preventDefault(); actions.insertUrl(dropped, pos); return true; }
				return false;
			},
			handlePaste(view, event) {
				const data = event.clipboardData;
				if (!data) return false;
				const files = [...(data.files || [])];
				if (files.length && !data.getData('text/html')) { actions.insertFiles(files); return true; }
				if (files.length && files.every((f) => f.type.startsWith('image/')) && !data.getData('text/plain')) { actions.insertFiles(files); return true; }
				const text = data.getData('text/plain').trim();
				if (!isUrl(text)) return false;
				if (editor.isActive('codeBlock')) return false;
				if (!view.state.selection.empty) { editor.chain().focus().extendMarkRange('link').setLink({ href: text }).run(); return true; }
				// A bare link on an empty line becomes a rich block. Mid-sentence it stays a link.
				const { $from } = view.state.selection;
				if ($from.parent.content.size === 0 && $from.parent.type.name === 'paragraph') { actions.insertUrl(text); return true; }
				return false;
			},
		},
		onUpdate() { if (timer) clearTimeout(timer); timer = window.setTimeout(emit, 150); refresh(); placeBubble(); },
		onSelectionUpdate() { refreshTools(); placeBubble(); },
		onFocus() { placeBubble(); },
		onBlur() { if (timer) emit(); bubble.hidden = true; plus.hidden = true; },
	});

	// The formatting menu floats above selected text.
	function placeBubble() {
		const { state, view } = editor;
		const { selection } = state;
		const { $from } = selection;
		const emptyLine = selection.empty && view.hasFocus() && editor.isEditable && $from.parent.type.name === 'paragraph' && $from.parent.content.size === 0;
		plus.hidden = !emptyLine;
		if (emptyLine) {
			const at = view.coordsAtPos($from.pos);
			plus.style.left = `${at.left - 56}px`;
			plus.style.top = `${at.top - 2}px`;
		}
		const show = !selection.empty && view.hasFocus() && !editor.isActive('codeBlock')
			&& !(selection instanceof NodeSelection) && !('$anchorCell' in selection);
		if (!show) { bubble.hidden = true; return; }
		const a = view.coordsAtPos(selection.from);
		const b = view.coordsAtPos(selection.to);
		bubble.hidden = false;
		const { width, height } = bubble.getBoundingClientRect();
		const middle = (Math.min(a.left, b.left) + Math.max(a.right, b.right)) / 2;
		const above = Math.min(a.top, b.top) - height - 8;
		bubble.style.left = `${Math.max(8, Math.min(middle - width / 2, innerWidth - width - 8))}px`;
		bubble.style.top = `${above > 72 ? above : Math.max(a.bottom, b.bottom) + 8}px`;
	}
	const onScroll = () => { if (!bubble.hidden || !plus.hidden) placeBubble(); };
	window.addEventListener('scroll', onScroll, true);

	// Save buttons live outside the editor, so write pending text before they act on it.
	const flush = () => { if (timer) emit(); };
	document.addEventListener('pointerdown', flush, true);
	source.addEventListener('input', () => { if (timer) clearTimeout(timer); timer = window.setTimeout(emit, 150); refresh(); });

	// ---------------------------------------------------------------- tools
	const buttons: { btn: HTMLElement; tool: Tool }[] = [];
	const makeBtn = (tool: Tool) => {
		const btn = el('button', { type: 'button', title: tool.title, 'aria-label': tool.title });
		btn.innerHTML = icon(tool.icon);
		btn.addEventListener('mousedown', (e) => e.preventDefault());
		btn.addEventListener('click', () => tool.run(btn));
		buttons.push({ btn, tool });
		return btn;
	};
	const cmd = (id: string, title?: string): Tool => {
		const c = commandById(id);
		return { icon: c.icon, title: title || c.label, run: (b) => c.run(editor, actions, b) };
	};
	const mark = (name: string, iconName: string, title: string, toggle: () => void): Tool => ({ icon: iconName, title, run: toggle, active: () => editor.isActive(name) });
	const editLink = (btn: Element) => {
		const previous = editor.getAttributes('link').href || '';
		editField(btn, {
			label: 'Link address', value: previous, placeholder: 'https://…', saveLabel: 'Apply',
			onRemove: previous ? () => editor.chain().focus().extendMarkRange('link').unsetLink().run() : undefined,
			onSave: (href) => {
				if (!href) { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
				const full = /^(https?:|mailto:|\/|#)/.test(href) ? href : `https://${href}`;
				if (editor.state.selection.empty && !previous) editor.chain().focus().insertContent({ type: 'text', text: full, marks: [{ type: 'link', attrs: { href: full } }] }).run();
				else editor.chain().focus().extendMarkRange('link').setLink({ href: full }).run();
			},
		});
	};
	const inline = {
		bold: () => mark('bold', 'Bold', 'Bold (⌘B)', () => editor.chain().focus().toggleBold().run()),
		italic: () => mark('italic', 'Italic', 'Italic (⌘I)', () => editor.chain().focus().toggleItalic().run()),
		underline: () => mark('underline', 'Underline', 'Underline (⌘U)', () => editor.chain().focus().toggleUnderline().run()),
		strike: () => mark('strike', 'Strikethrough', 'Strikethrough', () => editor.chain().focus().toggleStrike().run()),
		code: () => mark('code', 'Code', 'Inline code (⌘E)', () => editor.chain().focus().toggleCode().run()),
		highlight: () => mark('highlight', 'Highlighter', 'Highlight', () => editor.chain().focus().toggleHighlight().run()),
		sub: () => mark('subscript', 'Subscript', 'Subscript', () => editor.chain().focus().toggleSubscript().run()),
		sup: () => mark('superscript', 'Superscript', 'Superscript', () => editor.chain().focus().toggleSuperscript().run()),
		link: (): Tool => ({ icon: 'Link', title: 'Link (⌘K)', run: editLink, active: () => editor.isActive('link') }),
	};
	const heading = (level: 2 | 3 | 4): Tool => ({ ...cmd(`h${level}`), active: () => editor.isActive('heading', { level }) });
	const active = (id: string, name: string): Tool => ({ ...cmd(id), active: () => editor.isActive(name) });
	const sep = () => el('span', { class: 'ay-sep', 'aria-hidden': 'true' });

	const undo = makeBtn({ icon: 'Undo2', title: 'Undo (⌘Z)', run: () => editor.chain().focus().undo().run() });
	const redo = makeBtn({ icon: 'Redo2', title: 'Redo (⇧⌘Z)', run: () => editor.chain().focus().redo().run() });
	const editing = el('div', { class: 'ay-tool-group' },
		undo, redo, sep(),
		makeBtn(heading(2)), makeBtn(heading(3)), sep(),
		makeBtn(inline.bold()), makeBtn(inline.italic()), makeBtn(inline.strike()), makeBtn(inline.highlight()), makeBtn(inline.code()), makeBtn(inline.link()), sep(),
		makeBtn(active('ul', 'bulletList')), makeBtn(active('ol', 'orderedList')), makeBtn(active('task', 'taskList')), makeBtn(active('quote', 'blockquote')), sep(),
		makeBtn(cmd('image')), makeBtn(cmd('stock')), makeBtn(cmd('embed')), makeBtn(active('code', 'codeBlock')), makeBtn(cmd('table')), makeBtn(cmd('note', 'Callout')),
	);
	const all = el('button', { type: 'button', class: 'ay-more', title: 'Browse every block' });
	all.innerHTML = `${icon('Plus')}<span>More</span>`;
	all.addEventListener('click', () => {
		editor.chain().focus().insertContent('/').run();
	});

	const sourceBtn = makeBtn({ icon: 'FileCode2', title: 'Edit as Markdown', run: () => setSource(!sourceMode), active: () => sourceMode });
	const outlineBtn = makeBtn({ icon: 'ListTree', title: 'Outline', run: () => { outline.hidden = !outline.hidden; refreshTools(); }, active: () => !outline.hidden });
	const focusBtn = makeBtn({ icon: 'Maximize2', title: 'Focus mode (hide the toolbar until you need it)', run: () => { document.body.classList.toggle('ay-focus'); refreshTools(); }, active: () => document.body.classList.contains('ay-focus') });
	const themeBtn = makeBtn({ icon: 'Moon', title: 'Dark or light writing mode', run: () => setTheme(document.documentElement.dataset.ayTheme === 'dark' ? 'light' : 'dark'), active: () => document.documentElement.dataset.ayTheme === 'dark' });
	const helpBtn = makeBtn({ icon: 'Keyboard', title: 'Shortcuts and tips', run: showHelp });
	const aiBtn = makeBtn({ icon: 'Sparkles', title: 'AI writing help', run: ai });
	aiBtn.classList.add('ay-ai-btn');
	const findBtn = makeBtn({ icon: 'Search', title: 'Find and replace (⌘F)', run: () => openFind(editor, root) });
	toolbar.append(editing, all, el('span', { class: 'ay-spacer' }), aiBtn, findBtn, sourceBtn, outlineBtn, focusBtn, themeBtn, helpBtn, tableBar);

	bubble.append(makeBtn(inline.bold()), makeBtn(inline.italic()), makeBtn(inline.underline()), makeBtn(inline.strike()), makeBtn(inline.highlight()), makeBtn(inline.code()), makeBtn(inline.link()), sep(), makeBtn(inline.sub()), makeBtn(inline.sup()), sep(), makeBtn(heading(2)), makeBtn(heading(3)), makeBtn(active('quote', 'blockquote')), sep(), makeBtn({ icon: 'Sparkles', title: 'AI writing help', run: ai }));
	const tableTool = (iconName: string, title: string, run: () => void) => {
		const btn = makeBtn({ icon: iconName, title, run });
		btn.append(el('span', {}, title));
		return btn;
	};
	tableBar.append(
		tableTool('BetweenHorizontalStart', 'Add column before', () => editor.chain().focus().addColumnBefore().run()),
		tableTool('BetweenHorizontalEnd', 'Add column after', () => editor.chain().focus().addColumnAfter().run()),
		tableTool('Columns2', 'Delete column', () => editor.chain().focus().deleteColumn().run()), sep(),
		tableTool('BetweenVerticalStart', 'Add row above', () => editor.chain().focus().addRowBefore().run()),
		tableTool('BetweenVerticalEnd', 'Add row below', () => editor.chain().focus().addRowAfter().run()),
		tableTool('Rows2', 'Delete row', () => editor.chain().focus().deleteRow().run()), sep(),
		makeBtn({ icon: 'AlignLeft', title: 'Align column left', run: () => alignColumn(editor, null), active: () => editor.isActive('table') && !columnAlignment(editor) }),
		makeBtn({ icon: 'AlignCenter', title: 'Align column centre', run: () => alignColumn(editor, 'center'), active: () => editor.isActive('table') && columnAlignment(editor) === 'center' }),
		makeBtn({ icon: 'AlignRight', title: 'Align column right', run: () => alignColumn(editor, 'right'), active: () => editor.isActive('table') && columnAlignment(editor) === 'right' }), sep(),
		tableTool('PanelTop', 'Toggle header row', () => editor.chain().focus().toggleHeaderRow().run()),
		tableTool('Trash2', 'Delete table', () => editor.chain().focus().deleteTable().run()),
	);

	const refreshTools = () => {
		for (const { btn, tool } of buttons) btn.classList.toggle('is-on', !!tool.active?.());
		(undo as HTMLButtonElement).disabled = sourceMode || !editor.can().undo();
		(redo as HTMLButtonElement).disabled = sourceMode || !editor.can().redo();
		tableBar.hidden = sourceMode || !editor.isActive('table');
		themeBtn.innerHTML = icon(document.documentElement.dataset.ayTheme === 'dark' ? 'Sun' : 'Moon');
	};

	const refresh = () => {
		const text = sourceMode ? source.value : editor.getText({ blockSeparator: ' ' });
		const count = text.split(/\s+/).filter(Boolean).length;
		words.textContent = `${count.toLocaleString()} ${count === 1 ? 'word' : 'words'} · ${Math.max(1, Math.round(count / 220))} min read`;
		if (!outline.hidden || !sourceMode) renderOutline();
		refreshTools();
	};

	const renderOutline = () => {
		const rows: HTMLElement[] = [];
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name !== 'heading') return true;
			const a = el('button', { type: 'button', class: `ay-outline-${node.attrs.level}` }, node.textContent || 'Untitled');
			a.addEventListener('click', () => {
				(editor.view.nodeDOM(pos) as HTMLElement)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
				editor.chain().focus(pos + 1).run();
			});
			rows.push(a);
			return false;
		});
		outline.replaceChildren(el('p', {}, 'Outline'), ...(rows.length ? rows : [el('small', {}, 'Your headings will appear here.')]));
	};

	function setSource(on: boolean) {
		flush();
		sourceMode = on;
		if (on) { source.value = lastEmitted = editor.storage.markdown.getMarkdown() || lastEmitted; autosize(); }
		else { editor.commands.setContent(source.value, { emitUpdate: false }); lastEmitted = source.value; }
		source.hidden = !on;
		mount.hidden = on;
		editing.classList.toggle('is-disabled', on);
		all.toggleAttribute('disabled', on);
		refresh();
	}
	const autosize = () => { source.style.height = 'auto'; source.style.height = `${source.scrollHeight + 4}px`; };
	source.addEventListener('input', autosize);

	function setTheme(theme: string) {
		document.documentElement.dataset.ayTheme = theme;
		try { localStorage.setItem('ay-editor-theme', theme); } catch { /* the choice just won't persist */ }
		window.dispatchEvent(new Event('ay-theme'));
		refreshTools();
	}

	function showHelp() {
		const rows = [['⌘B / ⌘I / ⌘U', 'Bold, italic, underline'], ['⌘K', 'Add or edit a link'], ['⌘E', 'Inline code'], ['⌘F', 'Find and replace'], ['⌘S', 'Save your draft'], ['/', 'Insert any block'], [':fire', 'Search emoji'], ['## + space', 'Heading'], ['- + space', 'Bulleted list'], ['1. + space', 'Numbered list'], ['[ ] + space', 'Checklist'], ['> + space', 'Quote'], ['``` + space', 'Code block'], ['---', 'Divider']];
		const table = el('dl', {}, ...rows.flatMap(([k, v]) => [el('dt', {}, el('kbd', {}, k)), el('dd', {}, v)]));
		const close = el('button', { type: 'button', class: 'ay-btn ay-btn-primary' }, 'Got it');
		const guide = el('a', { href: '/blog/guide', target: '_blank', rel: 'noopener', class: 'ay-btn' }, 'Writing guide ↗');
		const dialog = el('dialog', { class: 'ay-help' }, el('h2', {}, 'Shortcuts and tips'),
			el('p', {}, 'Drag in images, videos, files or links. Paste a link on an empty line to embed it. Drag the handle left of any block to move it.'),
			table, el('div', { class: 'ay-pop-actions' }, guide, close)) as HTMLDialogElement;
		close.addEventListener('click', () => dialog.close());
		dialog.addEventListener('close', () => dialog.remove());
		document.body.append(dialog);
		dialog.showModal();
	}

	// ---------------------------------------------------- whole-page dropping
	// Dropping anywhere on the page works, not only on the text itself.
	let depth = 0;
	const hasPayload = (e: DragEvent) => !!e.dataTransfer && [...e.dataTransfer.types].some((t) => t === 'Files' || t === 'text/uri-list');
	const onEnter = (e: DragEvent) => { if (hasPayload(e)) { depth++; dropHint.classList.add('is-on'); } };
	const onLeave = (e: DragEvent) => { if (hasPayload(e) && --depth <= 0) { depth = 0; dropHint.classList.remove('is-on'); } };
	const onOver = (e: DragEvent) => { if (hasPayload(e)) e.preventDefault(); };
	const onDrop = (e: DragEvent) => {
		depth = 0;
		dropHint.classList.remove('is-on');
		if (!hasPayload(e) || mount.contains(e.target as Node) || (e.target as Element).closest?.('.ay-cover, .ay-drawer')) return;
		if (!root.isConnected || sourceMode) return;
		e.preventDefault();
		const end = editor.state.doc.content.size;
		if (e.dataTransfer!.files.length) actions.insertFiles([...e.dataTransfer!.files], end);
		else { const url = droppedUrl(e.dataTransfer!); if (url) actions.insertUrl(url, end); }
	};
	window.addEventListener('dragenter', onEnter);
	window.addEventListener('dragleave', onLeave);
	window.addEventListener('dragover', onOver);
	window.addEventListener('drop', onDrop);

	// Keyboard: ⌘K for links, wherever the caret is.
	mount.addEventListener('keydown', (e) => {
		if (!(e.metaKey || e.ctrlKey)) return;
		const key = e.key.toLowerCase();
		if (key === 'k') { e.preventDefault(); editLink(toolbar); }
	});

	// ⌘F finds in the post. ⌘S saves, using Decap's Save button so its checks still run.
	const onSaveKey = (e: KeyboardEvent) => {
		if (!(e.metaKey || e.ctrlKey)) return;
		const key = e.key.toLowerCase();
		if (key === 'f' && !sourceMode && !document.querySelector('dialog[open]')) { e.preventDefault(); openFind(editor, root); return; }
		if (key !== 's') return;
		e.preventDefault();
		flush();
		const save = [...document.querySelectorAll<HTMLButtonElement>('[class*="ToolbarSectionMain"] button')].find((b) => /^save$/i.test(b.textContent?.trim() || ''));
		save?.click();
	};
	window.addEventListener('keydown', onSaveKey, true);


	let theme = '';
	try { theme = localStorage.getItem('ay-editor-theme') || ''; } catch { /* default theme */ }
	if (theme) document.documentElement.dataset.ayTheme = theme;
	refresh();

	return {
		/** Opens the reader's view of the current draft. */
		preview(data: unknown) {
			flush();
			const markdown = sourceMode ? source.value : editor.storage.markdown.getMarkdown();
			const text = sourceMode ? source.value : editor.getText({ blockSeparator: ' ' });
			openPreview({
				html: editor.storage.markdown.parser.md.render(markdown),
				words: text.split(/\s+/).filter(Boolean).length,
				data,
				resolve: (path, done) => resolveAsset(getProps, path, done),
			});
		},
		/** The value changed from outside, such as Decap restoring a saved draft. */
		sync(value: string) {
			if ((value || '') === lastEmitted) return;
			lastEmitted = value || '';
			if (sourceMode) { source.value = lastEmitted; autosize(); } else editor.commands.setContent(lastEmitted, { emitUpdate: false });
			refresh();
		},
		destroy() {
			flush();
			document.removeEventListener('pointerdown', flush, true);
			window.removeEventListener('scroll', onScroll, true);
			bubble.remove();
			plus.remove();
			closeFind();
			window.removeEventListener('keydown', onSaveKey, true);
			window.removeEventListener('dragenter', onEnter);
			window.removeEventListener('dragleave', onLeave);
			window.removeEventListener('dragover', onOver);
			window.removeEventListener('drop', onDrop);
			dropHint.remove();
			document.body.classList.remove('ay-focus');
			delete document.documentElement.dataset.ayTheme;
			editor.destroy();
		},
	};
}

function droppedUrl(dt: DataTransfer) {
	const uri = dt.getData('text/uri-list').split('\n').find((l) => l && !l.startsWith('#'));
	const text = (uri || dt.getData('text/plain') || '').trim();
	if (isUrl(text)) return text;
	// An image dragged from another page often arrives only as HTML.
	return new DOMParser().parseFromString(dt.getData('text/html') || '', 'text/html').querySelector('img')?.src || '';
}

