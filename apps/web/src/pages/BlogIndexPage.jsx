import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
	ArrowRight, ArrowUpRight, CalendarDays, Users, BookOpen, Sparkles,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import { Header, Footer } from '@/components/SiteChrome';
import { getAllPosts } from '@/lib/posts';

const cardTones = ['bg-tone-green', 'bg-tone-violet', 'bg-tone-blue', 'bg-tone-yellow', 'bg-tone-coral'];

function PostCard({ post, tone }) {
	return (
		<article className="hover-lift flex h-full flex-col overflow-hidden rounded-2xl border-2 border-ink bg-paper-soft shadow-paper-sm">
			<Link to={`/blog/${post.slug}`} className="relative block aspect-[16/9] overflow-hidden border-b-2 border-ink bg-tone-blue/30">
				<img src={post.cover} alt={post.title} loading="lazy" className="h-full w-full object-cover" />
				<span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border-2 border-ink ${tone} px-3 py-1 text-[11px] font-bold uppercase tracking-wide`}>
					<BookOpen className="h-3.5 w-3.5" /> Story
				</span>
			</Link>
			<div className="flex flex-1 flex-col p-6">
				<h3 className="font-hand text-3xl font-bold leading-tight">
					<Link to={`/blog/${post.slug}`} className="transition-colors hover:text-tone-blue-deep">
						{post.title}
					</Link>
				</h3>
				<p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-ink/75">{post.excerpt}</p>
				<div className="mt-5 space-y-1.5 border-t-2 border-dashed border-ink/30 pt-4 text-sm font-semibold">
					<p className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {post.date}</p>
					<p className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {post.attendees} attended</p>
				</div>
				<Link to={`/blog/${post.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold underline underline-offset-4 hover:text-tone-blue-deep">
					Read the recap <ArrowRight className="h-4 w-4" />
				</Link>
			</div>
		</article>
	);
}

export default function BlogIndexPage() {
	const posts = getAllPosts();
	return (
		<div className="grain min-h-screen bg-paper text-ink antialiased">
			<Helmet>
				<title>Blog — AIYatra</title>
				<meta
					name="description"
					content="Session recaps and field notes from every AIYatra meetup — PyTorch, transformers, DeepSeek-V3, agentic AI and more. Written from the room, free forever."
				/>
			</Helmet>
			<Header />
			<main>
				<section id="top" className="relative overflow-hidden">
					<div className="wrap pb-10 pt-14 lg:pb-12 lg:pt-[74px]">
						<Reveal>
							<span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-tone-yellow px-4 py-1.5 text-sm font-semibold shadow-paper-sm">
								<Sparkles className="h-4 w-4" /> Blog · {posts.length} stories and counting
							</span>
						</Reveal>
						<Reveal delay={0.08}>
							<h1 className="mt-6 max-w-3xl font-hand text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
								Written from<br />the <span className="text-tone-blue-deep underline decoration-tone-coral decoration-4 underline-offset-8">room.</span>
							</h1>
						</Reveal>
						<Reveal delay={0.16}>
							<p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
								Every AIYatra session, recapped — what we covered, what we built, and what
								stuck. If you missed a Saturday, start here.
							</p>
						</Reveal>
					</div>
				</section>

				<section className="border-t-2 border-ink bg-tone-blue/30">
					<div className="wrap py-16">
						<div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
							{posts.map((post, i) => (
								<Reveal key={post.slug} className="h-full" delay={(i % 3) * 0.08}>
									<PostCard post={post} tone={cardTones[i % cardTones.length]} />
								</Reveal>
							))}
						</div>

						<Reveal delay={0.1}>
							<div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-ink bg-paper-soft p-6">
								<div>
									<p className="font-hand text-2xl font-bold leading-tight">The full archive lives on Meetup.</p>
									<p className="text-sm font-medium text-ink/70">Photos, discussions, ratings and RSVPs — straight from the source.</p>
								</div>
								<a
									href="https://www.meetup.com/aiyatra/events/past/"
									target="_blank"
									rel="noreferrer"
									className="active-press inline-flex h-11 items-center gap-2 rounded-xl border-2 border-ink bg-paper px-5 text-sm font-bold shadow-paper-sm transition-transform hover:-translate-y-0.5"
								>
									View all on Meetup <ArrowUpRight className="h-4 w-4" />
								</a>
							</div>
						</Reveal>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}
