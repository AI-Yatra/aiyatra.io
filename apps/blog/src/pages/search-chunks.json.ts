// Posts split by section, for "Ask by meaning". Each section links to its heading.
import { render } from 'astro:content';
import { createHash } from 'node:crypto';
import { getPosts } from '../lib/posts';

const clean = (md: string) => md
	.replace(/```[\s\S]*?```/g, ' ')
	.replace(/\$\$[\s\S]*?\$\$/g, ' ')
	.replace(/<[^>]+>/g, ' ')
	.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
	.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
	.replace(/^\|.*\|$/gm, (row) => row.replace(/[|:-]{3,}/g, ' ').replace(/\|/g, ' '))
	.replace(/[*_`#>]/g, ' ')
	.replace(/\s+/g, ' ')
	.trim();

export async function GET() {
	const chunks = [];
	for (const post of await getPosts()) {
		const { headings } = await render(post);
		const plain = (s: string) => clean(s).toLowerCase();
		const sections = (post.body || '').split(/^(?=##+ )/m);
		for (const section of sections) {
			const line = section.match(/^##+ (.*)$/m)?.[1] ?? '';
			const text = clean(section.replace(/^##+ .*$/m, '')).slice(0, 1200);
			if (text.length < 40) continue;
			const heading = line ? headings.find((h) => plain(h.text) === plain(line)) : null;
			const href = `/blog/${post.id}${heading ? `#${heading.slug}` : ''}`;
			const label = heading?.text || 'Introduction';
			chunks.push({ href, title: post.data.title, heading: label, text, hash: createHash('sha1').update(`${post.data.title}|${label}|${text}`).digest('hex').slice(0, 16) });
		}
	}
	return new Response(JSON.stringify(chunks), { headers: { 'Content-Type': 'application/json' } });
}
