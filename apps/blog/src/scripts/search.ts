// Two kinds of search. "Search words" uses the Pagefind index built with the site.
// "Ask by meaning" runs an embedding model in the reader's browser, and only after
// they choose to download it. It points to sections of real posts and never writes
// an answer of its own, so it can't put words in the authors' mouths.
const dialog = document.getElementById('search-dialog') as HTMLDialogElement;
const input = document.getElementById('search-input') as HTMLInputElement;
const note = document.getElementById('search-note')!;
const results = document.getElementById('search-results')!;
const enable = document.getElementById('search-enable') as HTMLButtonElement;
const tabs = dialog.querySelectorAll<HTMLButtonElement>('[data-mode]');
let mode: 'keyword' | 'ask' = 'keyword';
let request = 0;

interface Row { href: string; title: string; context?: string; excerptHtml?: string; excerpt?: string }

function show(rows: Row[]) {
	results.replaceChildren(...rows.map((r) => {
		const a = document.createElement('a');
		a.href = r.href;
		const title = document.createElement('strong');
		title.textContent = r.title;
		a.append(title);
		if (r.context) {
			const small = document.createElement('small');
			small.textContent = r.context;
			a.append(small);
		}
		const p = document.createElement('p');
		// Pagefind builds this from indexed text, escaped, adding only <mark>.
		if (r.excerptHtml) p.innerHTML = r.excerptHtml; else p.textContent = r.excerpt || '';
		a.append(p);
		const li = document.createElement('li');
		li.append(a);
		return li;
	}));
}

let pagefind: Promise<any> | null = null;
async function keywordSearch(query: string, mine: number) {
	pagefind ||= import(/* @vite-ignore */ `${'/blog/pagefind/pagefind.js'}`);
	let api;
	try {
		api = await pagefind;
	} catch {
		pagefind = null;
		note.textContent = 'Search is available on the published site.';
		return;
	}
	const found = await api.search(query);
	const data = await Promise.all(found.results.slice(0, 10).map((r: any) => r.data()));
	if (mine !== request) return;
	note.textContent = found.results.length ? `${found.results.length} ${found.results.length === 1 ? 'post' : 'posts'} found` : 'No posts match that. Try different words, or Ask by meaning.';
	show(data.map((d: any) => ({ href: d.url.replace(/\.html$/, ''), title: d.meta.title || d.url, excerptHtml: d.excerpt })));
}

// ------------------------------------------------------------ ask by meaning
const CONSENT_KEY = 'ay-blog-semantic-on';
let worker: Worker | null = null;
let ready = false;
const consented = () => { try { return localStorage.getItem(CONSENT_KEY) === '1'; } catch { return false; } };

function startWorker() {
	if (worker) return;
	worker = new Worker(new URL('./semantic-worker.ts', import.meta.url), { type: 'module' });
	worker.onmessage = ({ data }) => {
		if (data.type === 'status') { if (mode === 'ask') note.textContent = data.text; }
		else if (data.type === 'ready') {
			ready = true;
			if (mode === 'ask') { note.textContent = 'Ready. Describe what you want to learn, in your own words.'; input.disabled = false; input.focus(); if (input.value.trim()) run(); }
		} else if (data.type === 'results' && data.id === request && mode === 'ask') {
			note.textContent = data.rows.length ? 'The closest sections from our posts:' : 'Nothing close to that yet.';
			show(data.rows);
		} else if (data.type === 'error') {
			worker?.terminate();
			worker = null;
			ready = false;
			input.disabled = false;
			if (mode === 'ask') { note.textContent = 'Ask by meaning couldn’t start on this device. Search words still works.'; enable.hidden = false; }
		}
	};
	worker.postMessage({ type: 'load', chunksUrl: '/blog/search-chunks.json' });
}

function askView() {
	results.replaceChildren();
	if (ready) { note.textContent = 'Describe what you want to learn, in your own words.'; enable.hidden = true; return; }
	if (consented()) { enable.hidden = true; input.disabled = true; note.textContent = 'Starting…'; startWorker(); return; }
	enable.hidden = false;
	input.disabled = true;
	note.textContent = 'This finds posts by meaning, like “how do I fine-tune on one GPU?”. It runs entirely on your device, so what you type stays with you. The first time, it downloads about 30 MB from Hugging Face and jsDelivr.';
}

enable.addEventListener('click', () => {
	try { localStorage.setItem(CONSENT_KEY, '1'); } catch { /* it just asks again next time */ }
	enable.hidden = true;
	note.textContent = 'Downloading the model…';
	startWorker();
});

function run() {
	const query = input.value.trim();
	const mine = ++request;
	if (!query) { results.replaceChildren(); note.textContent = mode === 'ask' ? 'Describe what you want to learn, in your own words.' : ''; return; }
	if (mode === 'keyword') keywordSearch(query, mine);
	else if (ready) { note.textContent = 'Searching…'; worker?.postMessage({ type: 'query', id: mine, query }); }
}

// In a search box, Esc only clears the text. Here it should close the dialog too.
input.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); dialog.close(); } });

let timer = 0;
input.addEventListener('input', () => { clearTimeout(timer); timer = window.setTimeout(run, mode === 'ask' ? 500 : 150); });

tabs.forEach((tab) => tab.addEventListener('click', () => {
	mode = tab.dataset.mode as typeof mode;
	tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
	request++;
	input.disabled = false;
	enable.hidden = true;
	input.placeholder = mode === 'ask' ? 'How do I fine-tune a model on one GPU?' : 'Search every post…';
	if (mode === 'ask') askView(); else { note.textContent = ''; results.replaceChildren(); run(); input.focus(); }
}));

function open() {
	if (!dialog.open) dialog.showModal();
	input.focus();
	input.select();
}
document.querySelectorAll('[data-open-search]').forEach((b) => b.addEventListener('click', open));
dialog.querySelector('[data-close-search]')!.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
window.addEventListener('keydown', (e) => {
	if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
});
