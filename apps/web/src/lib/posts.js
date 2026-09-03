import posts from '@/generated/posts.json';

export function getAllPosts() {
	return posts;
}

export function getPost(slug) {
	return posts.find((p) => p.slug === slug) || null;
}

export function getRelated(post, count = 3) {
	const others = posts.filter((p) => p.slug !== post.slug);
	const sameCover = others.filter((p) => p.cover === post.cover);
	const rest = others.filter((p) => p.cover !== post.cover);
	return [...sameCover, ...rest].slice(0, count);
}

export function getPrevNext(post) {
	const i = posts.findIndex((p) => p.slug === post.slug);
	return {
		prev: i > 0 ? posts[i - 1] : null,
		next: i < posts.length - 1 ? posts[i + 1] : null,
	};
}
