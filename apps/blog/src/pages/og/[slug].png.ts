// A branded preview card for each post, used when it has no cover of its own.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getPosts, formatDate, type Post } from '../../lib/posts';

const require = createRequire(import.meta.url);
const font = (file: string) => fs.readFileSync(require.resolve(file));
const fonts = [
	{ name: 'Space Grotesk', data: font('@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff'), weight: 700 as const, style: 'normal' as const },
	{ name: 'Inter', data: font('@fontsource/inter/files/inter-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
	{ name: 'Inter', data: font('@fontsource/inter/files/inter-latin-700-normal.woff'), weight: 700 as const, style: 'normal' as const },
];

export async function getStaticPaths() {
	return (await getPosts()).map((post) => ({ params: { slug: post.id }, props: { post } }));
}

const box = (style: object, children: unknown) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } });

export async function GET({ props }: { props: { post: Post } }) {
	const d = props.post.data;
	const size = d.title.length > 75 ? 58 : d.title.length > 45 ? 68 : 80;
	const svg = await satori(
		box({ width: 1200, height: 630, boxSizing: 'border-box', flexDirection: 'column', justifyContent: 'space-between', padding: 64, background: '#eef5ff', borderBottom: '20px solid #2563eb', color: '#0d193b', fontFamily: 'Inter' }, [
			box({ width: 1072, alignItems: 'center', justifyContent: 'space-between' }, [
				box({ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 38 }, 'AI Yatra'),
				box({ padding: '8px 22px', fontSize: 24, fontWeight: 700, background: '#ffffff', border: '3px solid #0d193b', borderRadius: 999 }, d.category),
			]),
			box({ width: 1072, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: size, lineHeight: 1.08, letterSpacing: -1.5 }, d.title),
			box({ width: 1072, alignItems: 'center', justifyContent: 'space-between', fontSize: 28, fontWeight: 500, color: '#33415f' }, [
				box({}, [d.author, ...d.coAuthors].join(' & ')),
				box({}, `${formatDate(d.date)} · aiyatra.io/blog`),
			]),
		]) as any,
		{ width: 1200, height: 630, fonts },
	);
	const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
	return new Response(png, { headers: { 'Content-Type': 'image/png' } });
}
