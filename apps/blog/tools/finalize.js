#!/usr/bin/env node
// After `astro build`: the blog index is written to /blog/index.html, which
// GitHub Pages only serves at /blog/. Copy it to /blog.html as well so the
// bare /blog URL (the one the nav links to) answers with a 200.

import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(process.argv[2] || '../../dist/apps/web');
fs.copyFileSync(path.join(OUT, 'blog', 'index.html'), path.join(OUT, 'blog.html'));
console.log('[blog] Wrote blog.html');

// The in-browser search model loads its runtime from a pinned CDN URL, but the
// bundler also copies the 27 MB file here. Nothing references the copy.
const assets = path.join(OUT, 'blog', '_astro');
for (const file of fs.readdirSync(assets)) {
	if (/^ort-wasm.*\.wasm$/.test(file)) fs.rmSync(path.join(assets, file));
}
