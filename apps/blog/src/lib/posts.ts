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

/** A readable URL part for a tag or an author's name. */
export function toSlug(text: string) {
	return text.toLowerCase().normalize('NFKD').replace(/\+/g, ' plus').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'x';
}

export interface TagInfo { name: string; slug: string; count: number; posts: Post[] }

/** Every tag in use, most-used first. */
export function collectTags(posts: Post[]): TagInfo[] {
	const tags = new Map<string, TagInfo>();
	for (const post of posts) {
		for (const name of post.data.tags) {
			const slug = toSlug(name);
			const tag = tags.get(slug) ?? { name, slug, count: 0, posts: [] };
			tag.count += 1;
			tag.posts.push(post);
			tags.set(slug, tag);
		}
	}
	return [...tags.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export interface AuthorInfo { name: string; slug: string; role?: string; url?: string; avatar?: string; posts: Post[]; topics: string[] }

/** Everyone who has written here, including co-authors, most posts first. */
export function collectAuthors(posts: Post[]): AuthorInfo[] {
	const authors = new Map<string, AuthorInfo>();
	const add = (name: string, post: Post, lead: boolean) => {
		const slug = toSlug(name);
		const a = authors.get(slug) ?? { name, slug, posts: [], topics: [] };
		a.posts.push(post);
		if (lead) {
			a.role ||= post.data.authorRole;
			a.url ||= post.data.authorUrl;
			a.avatar ||= post.data.authorAvatar;
		}
		authors.set(slug, a);
	};
	for (const post of posts) {
		add(post.data.author, post, true);
		post.data.coAuthors.forEach((name) => add(name, post, false));
	}
	for (const a of authors.values()) {
		a.topics = collectTags(a.posts).slice(0, 4).map((t) => t.name);
	}
	return [...authors.values()].sort((a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name));
}
