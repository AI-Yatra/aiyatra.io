// Asks the sign-in relay for a page's title, description and image. Browsers
// can't read other sites directly. If the relay can't help, the card keeps the
// site's name and the writer can type a title by hand.
const ENDPOINT = 'https://aiyatra-cms-auth.aiyatra.workers.dev/unfurl';

export async function fetchLinkPreview(url: string): Promise<{ title?: string; description?: string; image?: string } | null> {
	try {
		const res = await fetch(`${ENDPOINT}?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(8000) });
		if (!res.ok) return null;
		const { title, description, image } = await res.json();
		if (!title) return null;
		return { title, description: description || '', image: image || '' };
	} catch {
		return null;
	}
}
