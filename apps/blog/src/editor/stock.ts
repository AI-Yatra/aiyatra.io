// Free stock photos from Openverse (openly licensed images, no API key needed).
// The license and credit come with each result and are saved with the image.
import { el, toast } from './dom';
import { uploadFile } from './upload';

export interface StockPick { src: string; alt: string; credit: string }

const API = 'https://api.openverse.org/v1/images/';

function creditFor(item: any) {
	const license = item.license === 'cc0' ? 'CC0' : item.license === 'pdm' ? 'Public Domain' : `CC ${String(item.license).toUpperCase()} ${item.license_version || ''}`.trim();
	const title = item.title ? `“${item.title}”` : 'Photo';
	return `${title}${item.creator ? ` by ${item.creator}` : ''}, ${license}, via Openverse`;
}

/** Keeps a copy in the repo when the host allows it, so the image can't vanish later. */
async function localCopy(item: any, props: any): Promise<string> {
	try {
		const res = await fetch(item.url, { signal: AbortSignal.timeout(10000) });
		if (!res.ok) throw new Error(String(res.status));
		const blob = await res.blob();
		if (!blob.type.startsWith('image/')) throw new Error(blob.type);
		const name = (item.title || 'stock-photo').slice(0, 40);
		const path = await uploadFile(new File([blob], `${name}.${blob.type.split('/')[1] || 'jpg'}`, { type: blob.type }), props);
		if (path) return path;
	} catch { /* many hosts block this, so link to the original instead */ }
	return item.url;
}

export function openStockPicker(props: any, onPick: (pick: StockPick) => void) {
	const input = el('input', { class: 'ay-pop-input', placeholder: 'Search free photos, e.g. robotics lab', 'aria-label': 'Search photos' }) as HTMLInputElement;
	const grid = el('div', { class: 'ay-stock-grid' });
	const note = el('p', { class: 'ay-stock-note', 'aria-live': 'polite' }, 'Openly licensed images from Openverse. The credit is added for you.');
	const close = el('button', { type: 'button', class: 'ay-btn' }, 'Close');
	const dialog = el('dialog', { class: 'ay-help ay-stock' }, el('h2', {}, 'Stock photos'), input, note, grid, el('div', { class: 'ay-pop-actions' }, close)) as HTMLDialogElement;
	close.addEventListener('click', () => dialog.close());
	dialog.addEventListener('close', () => dialog.remove());

	let request = 0;
	const run = async () => {
		const query = input.value.trim();
		if (!query) return;
		const mine = ++request;
		note.textContent = 'Searching…';
		grid.replaceChildren();
		try {
			const url = `${API}?q=${encodeURIComponent(query)}&page_size=18&license_type=commercial&mature=false`;
			const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
			if (mine !== request) return;
			if (res.status === 429) { note.textContent = 'Too many searches for now. Please wait a minute and try again.'; return; }
			if (!res.ok) throw new Error(String(res.status));
			const { results } = await res.json();
			note.textContent = results.length ? 'Click a photo to use it.' : 'No photos found. Try a different search.';
			for (const item of results) {
				const b = el('button', { type: 'button', title: creditFor(item) });
				b.append(el('img', { src: item.thumbnail, alt: item.title || '', loading: 'lazy' }));
				b.addEventListener('click', async () => {
					note.textContent = 'Adding the photo…';
					const src = await localCopy(item, props);
					dialog.close();
					onPick({ src, alt: item.title || '', credit: creditFor(item) });
				});
				grid.append(b);
			}
		} catch {
			if (mine === request) { note.textContent = ''; toast('The photo search is unavailable right now. Please try again shortly.', 'error'); }
		}
	};
	let timer = 0;
	input.addEventListener('input', () => { clearTimeout(timer); timer = window.setTimeout(run, 500); });
	input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(timer); run(); } });
	document.body.append(dialog);
	dialog.showModal();
	input.focus();
}
