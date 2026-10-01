import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Built to dist/apps/web and published to the gh-pages branch (GitHub Pages,
// custom domain aiyatra.io) by .github/workflows/deploy.yml.
export default defineConfig({
	base: '/',
	plugins: [react()],
	server: {
		port: 3000,
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
