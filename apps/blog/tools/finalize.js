#!/usr/bin/env node
// After `astro build`: the blog index is written to /blog/index.html, which
// GitHub Pages only serves at /blog/. Copy it to /blog.html as well so the
// bare /blog URL (the one the nav links to) answers with a 200.

import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(process.argv[2] || '../../dist/apps/web');
fs.copyFileSync(path.join(OUT, 'blog', 'index.html'), path.join(OUT, 'blog.html'));
console.log('[blog] Wrote blog.html');
