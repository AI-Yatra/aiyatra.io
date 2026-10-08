import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Dev only: the blog (apps/blog) runs on its own Astro dev server and is
// proxied in at /blog. Its pages load scripts from root paths (/src/...,
// /@vite/client, /@fs/...) that this server uses for the React app too, so
// those are rewritten under /blog/__dev in everything the blog sends back,
// and the prefix is stripped again on the way to Astro.
const BLOG_DEV_SERVER = 'http://127.0.0.1:4321';
const BLOG_DEV_PREFIX = '/blog/__dev';
const DEV_ROOT_PATHS = /(["'`(])\/(@vite|@id|@fs|src|node_modules)\//g;

function proxyBlog(proxy) {
	proxy.on('proxyRes', (proxyRes, req, res) => {
		const chunks = [];
		proxyRes.on('data', (chunk) => chunks.push(chunk));
		proxyRes.on('end', () => {
			const headers = { ...proxyRes.headers };
			let body = Buffer.concat(chunks);
			if (/javascript|html|css/.test(headers['content-type'] || '')) {
				body = Buffer.from(body.toString('utf8').replace(DEV_ROOT_PATHS, `$1${BLOG_DEV_PREFIX}/$2/`));
				delete headers['content-length'];
			}
			res.writeHead(proxyRes.statusCode, headers);
			res.end(body);
		});
	});
}

// Built to dist/apps/web and published to the gh-pages branch (GitHub Pages,
// custom domain aiyatra.io) by .github/workflows/deploy.yml.
export default defineConfig({
	base: '/',
	plugins: [react()],
	server: {
		port: 3000,
		// /blog is the Astro blog app (apps/blog, `astro dev` on :4321). Proxy it
		// so the whole site — React pages and blog — runs on one localhost URL.
		proxy: {
			'/blog': {
				target: BLOG_DEV_SERVER,
				selfHandleResponse: true,
				headers: { 'accept-encoding': 'identity' },
				rewrite: (url) => (url.startsWith(BLOG_DEV_PREFIX) ? url.slice(BLOG_DEV_PREFIX.length) : url),
				configure: proxyBlog,
			},
		},
	},
	// Lets a temporary Cloudflare quick tunnel (cloudflared) serve the preview build.
	preview: {
		allowedHosts: ['.trycloudflare.com'],
	},
	resolve: {
		extensions: ['.jsx', '.js', '.json'],
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	build: {
		rollupOptions: {
			output: {
				// Long-lived vendor chunks: page code changes daily (event
				// sync), these don't — returning visitors keep them cached.
				manualChunks: {
					react: ['react', 'react-dom', 'react-router-dom'],
					motion: ['framer-motion'],
				},
			},
		},
	},
});
