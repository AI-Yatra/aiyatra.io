#!/usr/bin/env node

// Build-time: turns apps/web/src/posts/*.md into src/generated/posts.json
// (frontmatter + marked-rendered sanitized HTML), and refreshes
// public/sitemap.xml + public/llms.txt with the blog URLs.
// Mirrors tools/generate-llms.js: plain fs + regex, no extra deps
// beyond `marked`. Non-fatal by design (called with `|| true`).

import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, 'src', 'posts');
const OUT_DIR = path.join(ROOT, 'src', 'generated');
const OUT_FILE = path.join(OUT_DIR, 'posts.json');
const SITE_URL = 'https://aiyatra.io';

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
const FIELD_RE = /^([A-Za-z]+):\s*(.*)$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseFrontmatter(raw, file) {
	const match = raw.match(FRONTMATTER_RE);
	if (!match) throw new Error(`${file}: missing --- frontmatter block`);
	const meta = {};
	for (const line of match[1].split(/\r?\n/)) {
		if (!line.trim()) continue;
		const field = line.match(FIELD_RE);
		if (!field) throw new Error(`${file}: bad frontmatter line: ${line}`);
		meta[field[1]] = field[2].trim();
	}
	for (const key of ['title', 'date', 'excerpt', 'cover', 'eventUrl', 'attendees']) {
		if (!meta[key]) throw new Error(`${file}: frontmatter missing "${key}"`);
	}
	return { meta, body: match[2].trim() };
}

function sanitize(html) {
	return html
		.replace(/<script[\s\S]*?<\/script>/gi, '')
		.replace(/\son\w+="[^"]*"/gi, '')
		.replace(/\son\w+='[^']*'/gi, '')
		.replace(/href="javascript:[^"]*"/gi, 'href="#"');
}

function excerptOf(meta, html) {
	const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
	return meta.excerpt || text.slice(0, 160);
}

function main() {
	if (!fs.existsSync(POSTS_DIR)) {
		console.error('No src/posts directory — skipping posts generation.');
		return;
	}
	const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')).sort();
	if (files.length === 0) {
		console.error('No posts found in src/posts.');
		return;
	}

	const posts = files.map((file) => {
		const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
		const slug = file.replace(/\.md$/, '');
		if (!SLUG_RE.test(slug)) throw new Error(`${file}: slug must be kebab-case`);
		const { meta, body } = parseFrontmatter(raw, file);
		if (Number.isNaN(Date.parse(meta.date))) throw new Error(`${file}: bad date "${meta.date}"`);
		const html = sanitize(marked.parse(body, { breaks: true }));
		return {
			slug,
			title: meta.title,
			date: meta.date,
			excerpt: excerptOf(meta, html),
			cover: meta.cover,
			eventUrl: meta.eventUrl,
			attendees: Number(meta.attendees),
			html,
		};
	});

	posts.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

	fs.mkdirSync(OUT_DIR, { recursive: true });
	fs.writeFileSync(OUT_FILE, `${JSON.stringify(posts, null, 2)}\n`, 'utf8');
	console.log(`Wrote ${posts.length} posts to src/generated/posts.json`);

	const today = new Date().toISOString().slice(0, 10);
	const urls = [
		{ loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1' },
		{ loc: `${SITE_URL}/ambassadors`, changefreq: 'weekly', priority: '0.9' },
		{ loc: `${SITE_URL}/labs`, changefreq: 'weekly', priority: '0.9' },
		{ loc: `${SITE_URL}/blog`, changefreq: 'daily', priority: '0.9' },
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
		'- [AIYatra — Democratizing AI Learning | Hyderabad AI Community](/): AIYatra is Hyderabad’s open AI community — free hands-on meetups on agentic AI, PyTorch, and machine learning.',
		'- [Student Ambassador Program — AIYatra](/ambassadors): Carry the AI Yatra to your campus as a student ambassador.',
		'- [AI Yatra Labs — AIYatra](/labs): Curated arXiv and AlphaXiv reading lists across small language models, agent harnesses, transformer layers, and new architectures.',
		'- [Blog — AIYatra](/blog): Session recaps and field notes from every AIYatra meetup.',
		...posts.map((p) => `- [${p.title}](/blog/${p.slug}): ${p.excerpt}`),
		'',
	].join('\n');
	fs.writeFileSync(path.join(ROOT, 'public', 'llms.txt'), llms, 'utf8');
	console.log('Refreshed sitemap.xml and llms.txt with blog URLs.');
}

try {
	main();
} catch (error) {
	console.error(`generate-posts failed: ${error.message}`);
	process.exit(1);
}
