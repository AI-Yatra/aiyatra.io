// Turns a pasted or dropped URL into something the post can show inline.
// Only these hosts become iframes, and the blog renders exactly what is saved,
// so this list is also the allowlist for iframes the editor will load.

export interface Embed { provider: string; src: string; ratio?: string }

const match = (url: URL, hosts: string[]) => hosts.includes(url.hostname.replace(/^www\./, ''));

export function toEmbed(raw: string): Embed | null {
	let url: URL;
	try { url = new URL(raw.trim()); } catch { return null; }
	if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
	const parts = url.pathname.split('/').filter(Boolean);

	if (match(url, ['youtube.com', 'm.youtube.com', 'youtu.be', 'youtube-nocookie.com'])) {
		const id = url.hostname === 'youtu.be' ? parts[0]
			: url.searchParams.get('v') || (['embed', 'shorts', 'live'].includes(parts[0]) ? parts[1] : null);
		return id && /^[\w-]{6,}$/.test(id) ? { provider: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}` } : null;
	}
	if (match(url, ['vimeo.com', 'player.vimeo.com'])) {
		const id = parts.find((p) => /^\d+$/.test(p));
		return id ? { provider: 'vimeo', src: `https://player.vimeo.com/video/${id}` } : null;
	}
	if (match(url, ['loom.com']) && (parts[0] === 'share' || parts[0] === 'embed') && parts[1]) {
		return { provider: 'loom', src: `https://www.loom.com/embed/${parts[1]}` };
	}
	if (match(url, ['open.spotify.com'])) {
		const path = parts[0] === 'embed' ? parts.slice(1) : parts;
		return path.length >= 2 ? { provider: 'spotify', src: `https://open.spotify.com/embed/${path.join('/')}`, ratio: 'audio' } : null;
	}
	if (match(url, ['codepen.io']) && (parts[1] === 'pen' || parts[1] === 'embed') && parts[2]) {
		return { provider: 'codepen', src: `https://codepen.io/${parts[0]}/embed/${parts[2]}?default-tab=result` };
	}
	if (match(url, ['codesandbox.io']) && (parts[0] === 's' || parts[0] === 'embed') && parts[1]) {
		return { provider: 'codesandbox', src: `https://codesandbox.io/embed/${parts[1]}` };
	}
	if (match(url, ['stackblitz.com']) && parts.length >= 2) {
		const u = new URL(url.href); u.searchParams.set('embed', '1');
		return { provider: 'stackblitz', src: u.href };
	}
	if (match(url, ['figma.com'])) {
		if (url.pathname.startsWith('/embed')) return { provider: 'figma', src: url.href };
		return parts.length >= 2 ? { provider: 'figma', src: `https://www.figma.com/embed?embed_host=aiyatra&url=${encodeURIComponent(url.href)}` } : null;
	}
	if (match(url, ['gist.github.com']) && parts.length >= 2) {
		return { provider: 'gist', src: `https://gist.github.com/${parts[0]}/${parts[1].replace(/\.pibb$/, '')}.pibb`, ratio: 'tall' };
	}
	if (match(url, ['twitter.com', 'x.com', 'platform.twitter.com'])) {
		const id = parts[1] === 'status' ? parts[2] : url.searchParams.get('id');
		return id && /^\d+$/.test(id) ? { provider: 'x', src: `https://platform.twitter.com/embed/Tweet.html?id=${id}`, ratio: 'tall' } : null;
	}
	if (match(url, ['huggingface.co']) && parts[0] === 'spaces' && parts.length >= 3) {
		return { provider: 'huggingface', src: `https://${parts[1]}-${parts[2]}.hf.space`.toLowerCase(), ratio: 'tall' };
	}
	if (url.hostname.endsWith('.hf.space')) return { provider: 'huggingface', src: url.origin, ratio: 'tall' };
	if (match(url, ['docs.google.com']) && parts[0] === 'presentation' && parts[2]) {
		return { provider: 'slides', src: `https://docs.google.com/presentation/d/${parts[2] === 'e' ? `e/${parts[3]}` : parts[2]}/embed` };
	}
	return null;
}

/** True when an iframe src found in saved Markdown is one this editor would have produced. */
export function isAllowedFrame(src: string | null) {
	return !!src && toEmbed(src) !== null;
}

export const isImageUrl = (s: string) => /^https?:\/\/\S+\.(png|jpe?g|webp|gif|svg|avif)(\?\S*)?$/i.test(s.trim());
export const isUrl = (s: string) => /^https?:\/\/[^\s]+$/i.test(s.trim());
