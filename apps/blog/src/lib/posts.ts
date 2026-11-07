import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

// Dates are midnight UTC. The nightly deploy runs at 00:00 IST (18:30 UTC the day
// before), so looking 6 hours ahead publishes a post at the start of its date in India.
const SCHEDULE_LEAD_MS = 6 * 60 * 60 * 1000;

/** Newest first. A post dated in the future stays hidden in production until its day. */
export async function getPosts(): Promise<Post[]> {
	const cutoff = Date.now() + SCHEDULE_LEAD_MS;
	const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || data.date.valueOf() <= cutoff);
	return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
export const formatDate = (d: Date) => fmt.format(d);
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export function readingTime(markdown = '') {
	const words = markdown.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 220));
}

/** Same category first, then the newest of the rest. */
export function related(post: Post, all: Post[], count = 3) {
	const others = all.filter((p) => p.id !== post.id);
	const same = others.filter((p) => p.data.category === post.data.category);
	const rest = others.filter((p) => p.data.category !== post.data.category);
	return [...same, ...rest].slice(0, count);
}

export function initials(name: string) {
	return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

export const CARD_TONES = ['bg-tone-green', 'bg-tone-violet', 'bg-tone-blue', 'bg-tone-yellow', 'bg-tone-coral'];
