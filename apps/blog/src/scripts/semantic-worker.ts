// Runs in the background so the page stays responsive. Section vectors are kept in
// IndexedDB, so a returning reader only computes the sections that have changed.
import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;
const MODEL = 'Xenova/all-MiniLM-L6-v2';

interface Chunk { href: string; title: string; heading: string; text: string; hash: string }
let chunks: Chunk[] = [];
let vectors: Float32Array[] = [];
let embed: any;

function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open('ay-blog-semantic', 1);
		req.onupgradeneeded = () => req.result.createObjectStore('vectors');
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
const dbGet = (db: IDBDatabase, key: string) => new Promise<Float32Array | undefined>((resolve) => {
	const r = db.transaction('vectors').objectStore('vectors').get(key);
	r.onsuccess = () => resolve(r.result);
	r.onerror = () => resolve(undefined);
});
const dbPut = (db: IDBDatabase, key: string, value: Float32Array) => { db.transaction('vectors', 'readwrite').objectStore('vectors').put(value, key); };

async function toVector(text: string) {
	const out = await embed(text, { pooling: 'mean', normalize: true });
	return new Float32Array(out.data);
}

async function load(url: string) {
	chunks = await (await fetch(url)).json();
	let lastShown = 0;
	embed = await pipeline('feature-extraction', MODEL, {
		dtype: 'q8',
		progress_callback: (p: any) => {
			if (p.status !== 'progress' || !p.total) return;
			const pct = Math.round((p.loaded / p.total) * 100);
			if (pct !== lastShown && p.total > 1e6) { lastShown = pct; postMessage({ type: 'status', text: `Downloading the model… ${pct}%` }); }
		},
	});
	let db: IDBDatabase | null = null;
	try { db = await openDb(); } catch { /* it just recomputes next time */ }
	vectors = [];
	for (let i = 0; i < chunks.length; i++) {
		let v = db ? await dbGet(db, `${MODEL}:${chunks[i].hash}`) : undefined;
		if (!v) {
			postMessage({ type: 'status', text: `Reading the blog… ${Math.round((i / chunks.length) * 100)}%` });
			v = await toVector(`${chunks[i].title}. ${chunks[i].heading}. ${chunks[i].text}`);
			if (db) dbPut(db, `${MODEL}:${chunks[i].hash}`, v);
		}
		vectors.push(v);
	}
	postMessage({ type: 'ready' });
}

async function query(id: number, q: string) {
	const v = await toVector(q);
	const scored = chunks.map((c, i) => ({ c, score: vectors[i].reduce((sum, x, k) => sum + x * v[k], 0) })).sort((a, b) => b.score - a.score);
	const seen = new Map<string, number>();
	const rows = [];
	for (const { c, score } of scored) {
		if (score < 0.2) break;
		const n = seen.get(c.title) ?? 0;
		if (n >= 2) continue; // One long post shouldn't fill the list.
		seen.set(c.title, n + 1);
		rows.push({ href: c.href, title: c.title, context: c.heading, excerpt: `${c.text.slice(0, 170)}…` });
		if (rows.length === 6) break;
	}
	postMessage({ type: 'results', id, rows });
}

self.onmessage = async ({ data }) => {
	try {
		if (data.type === 'load') await load(data.chunksUrl);
		else if (data.type === 'query') await query(data.id, data.query);
	} catch (err) {
		console.error(err);
		postMessage({ type: 'error' });
	}
};
