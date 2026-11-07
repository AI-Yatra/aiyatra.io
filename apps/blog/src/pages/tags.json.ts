// The tags in use, so the editor can suggest them and writers reuse the same names.
import { getPosts, collectTags } from '../lib/posts';

export async function GET() {
	return new Response(JSON.stringify(collectTags(await getPosts()).map((t) => t.name)), { headers: { 'Content-Type': 'application/json' } });
}
