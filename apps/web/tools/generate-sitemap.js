#!/usr/bin/env node

// Build-time: refreshes public/sitemap.xml + public/llms.txt with every page
// of the site, including each blog post. Posts are Markdown files owned by the
// Astro blog app (apps/blog/src/content/blog/*.md); only their frontmatter is
// read here. Non-fatal by design (called with `|| true`).

import fs from 'fs';
import path from 'path';
import { parse as parseYaml } from 'yaml';

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, '..', 'blog', 'src', 'content', 'blog');
const SITE_URL = 'https://aiyatra.io';

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;

function readPost(file) {
	const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
	const match = raw.match(FRONTMATTER_RE);
	if (!match) throw new Error(`${file}: missing --- frontmatter block`);
	const meta = parseYaml(match[1]) || {};
	const date = Date.parse(meta.date);
	if (Number.isNaN(date)) throw new Error(`${file}: bad date "${meta.date}"`);
	return { slug: file.replace(/\.md$/, ''), title: String(meta.title), excerpt: String(meta.excerpt || ''), date };
}

function main() {
	const files = fs.existsSync(POSTS_DIR) ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')) : [];
	const posts = files.map(readPost).sort((a, b) => b.date - a.date);

	const today = new Date().toISOString().slice(0, 10);
	const urls = [
		{ loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1' },
		{ loc: `${SITE_URL}/ambassadors`, changefreq: 'weekly', priority: '0.9' },
		{ loc: `${SITE_URL}/labs`, changefreq: 'weekly', priority: '0.9' },
		{ loc: `${SITE_URL}/blog`, changefreq: 'daily', priority: '0.9' },
		{ loc: `${SITE_URL}/blog/write`, changefreq: 'monthly', priority: '0.6' },
		{ loc: `${SITE_URL}/contact`, changefreq: 'monthly', priority: '0.6' },
		...posts.map((p) => ({ loc: `${SITE_URL}/blog/${p.slug}`, changefreq: 'monthly', priority: '0.7' })),
	];
	const sitemap = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls.flatMap((u) => [
			'  <url>',
			`    <loc>${u.loc}</loc>`,
			`    <lastmod>${today}</lastmod>`,
			`    <changefreq>${u.changefreq}</changefreq>`,
			`    <priority>${u.priority}</priority>`,
			'  </url>',
		]),
		'</urlset>',
		'',
	].join('\n');
	fs.writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), sitemap, 'utf8');

	const llms = [
		'## Pages',
		'- [AIYatra — Open-Source AI Community](/): Three pillars: free hands-on meetups every Saturday, the Student Ambassador Program, and AIYatra Research Labs.',
		'- [Student Ambassador Program — AIYatra](/ambassadors): Turn your campus into an AI research and builder chapter — a 9-month journey for B.Tech and M.Sc students.',
		'- [AI Yatra Labs — AIYatra](/labs): Curated arXiv and AlphaXiv reading lists across small language models, agent harnesses, transformer layers, and new architectures.',
		'- [Blog — AIYatra](/blog): Session recaps, tutorials and guest posts from the AIYatra community.',
		'- [Write for AIYatra — Blog](/blog/write): How to submit a guest post: write in the visual editor, get it reviewed, see it published.',
		'- [Contact Us — AIYatra](/contact): Send the AIYatra team a message, or write to global.aiyatra@gmail.com.',
		...posts.map((p) => `- [${p.title}](/blog/${p.slug}): ${p.excerpt}`),
		'',
	].join('\n');
	fs.writeFileSync(path.join(ROOT, 'public', 'llms.txt'), llms, 'utf8');
	console.log('Refreshed sitemap.xml and llms.txt with blog URLs.');
}

try {
	main();
} catch (error) {
	console.error(`generate-sitemap failed: ${error.message}`);
	process.exit(1);
}
