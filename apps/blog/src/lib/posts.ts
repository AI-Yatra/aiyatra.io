import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** Newest first. */
export async function getPosts(): Promise<Post[]> {
	const posts = await getCollection('blog');
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
