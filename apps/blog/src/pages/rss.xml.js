import rss from '@astrojs/rss';
import { getPosts } from '../lib/posts';

export async function GET(context) {
	const posts = await getPosts();
	return rss({
		title: 'AIYatra Blog',
		description: 'Session recaps, tutorials and guest posts from the AIYatra open-source AI community.',
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.excerpt,
			pubDate: post.data.date,
			categories: [post.data.category, ...post.data.tags],
			link: `/blog/${post.id}`,
		})),
	});
}
