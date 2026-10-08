// @ts-check
import { defineConfig } from 'astro/config';

// The blog is its own Astro app that lives inside aiyatra.io at /blog.
// It builds straight into the main site's output folder (after the React app
// has built), so GitHub Pages serves one site: / from React, /blog from here.
// In development, the React dev server on :3000 proxies /blog to this server,
// so the whole site is browsed from one localhost URL.
export default defineConfig({
	site: 'https://aiyatra.io',
	base: '/blog',
	trailingSlash: 'ignore',
	devToolbar: { enabled: false },
	outDir: '../../dist/apps/web/blog',
	build: {
		// /blog/my-post.html is served by GitHub Pages at /blog/my-post with a
		// 200 — a folder would redirect to /blog/my-post/ first.
		format: 'file',
	},
	server: {
		host: '127.0.0.1',
		port: 4321,
	},
	vite: {
		// Pages are browsed through the React dev server's proxy on :3000;
		// hot reload talks to this server directly.
		server: { hmr: { host: '127.0.0.1', clientPort: 4321 } },
	},
	markdown: {
		shikiConfig: { theme: 'github-dark' },
	},
});
