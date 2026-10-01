#!/usr/bin/env node
// GitHub Pages only knows about real files, so a client-side route like
// /ambassadors would come back as HTTP 404 (served from 404.html). That hurts
// search indexing and link previews. After the build, give every URL in the
// sitemap its own copy of index.html. Written as /contact.html rather than
// /contact/index.html: Pages serves /contact straight from contact.html with
// a 200, whereas a folder would first redirect to /contact/.

import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(process.argv[2] || '../../dist/apps/web');
const index = fs.readFileSync(path.join(OUT, 'index.html'));
const sitemap = fs.readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8');
const routes = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]).filter((r) => r !== '/');

for (const route of routes) {
	const file = path.join(OUT, `${route.replace(/\/+$/, '')}.html`);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, index);
	// A route that is also a folder (e.g. /blog with /blog/<post>) also gets
	// a folder index, in case Pages resolves the folder first.
	if (routes.some((r) => r !== route && r.startsWith(`${route}/`))) {
		fs.mkdirSync(path.join(OUT, route), { recursive: true });
		fs.writeFileSync(path.join(OUT, route, 'index.html'), index);
	}
}
console.log(`[static-routes] Wrote ${routes.length} route pages.`);
