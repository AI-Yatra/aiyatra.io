import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import {
	ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Users, BookOpen,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import { Header, Footer } from '@/components/SiteChrome';
import { getPost, getRelated, getPrevNext, getAllPosts } from '@/lib/posts';

function NotFound() {
	return (
		<div className="grain min-h-screen bg-paper text-ink antialiased">
			<Helmet>
				<title>Chronicle not found — AIYatra</title>
			</Helmet>
			<Header />
			<main>
				<section className="wrap py-24 text-center">
					<p className="font-hand text-6xl font-bold">No such chronicle.</p>
					<p className="mx-auto mt-4 max-w-md text-lg text-ink-soft">
						That story does not exist — but {getAllPosts().length} real ones do.
					</p>
					<Link
						to="/blog"
						className="active-press mt-8 inline-flex h-12 items-center gap-2 rounded-xl border-2 border-ink bg-tone-blue-deep px-6 text-base font-semibold text-paper shadow-paper transition-transform hover:-translate-y-0.5"
					>
						<ArrowLeft className="h-5 w-5" /> Back to Chronicles
					</Link>
				</section>
			</main>
			<Footer />
		</div>
	);
}

export default function BlogPostPage() {
	const { slug } = useParams();
	const post = getPost(slug);
	if (!post) return <NotFound />;

	const related = getRelated(post);
	const { prev, next } = getPrevNext(post);

	return (
		<div className="grain min-h-screen bg-paper text-ink antialiased">
			<Helmet>
				<title>{`${post.title} — AIYatra Chronicles`}</title>
				<meta name="description" content={post.excerpt} />
			</Helmet>
			<Header />
			<main>
				<section id="top" className="relative overflow-hidden">
					<div className="wrap pb-10 pt-14 lg:pt-[74px]">
						<Reveal>
							<Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-bold underline underline-offset-4 hover:text-tone-blue-deep">
								<ArrowLeft className="h-4 w-4" /> All chronicles
							</Link>
						</Reveal>
						<Reveal delay={0.08}>
							<h1 className="mt-5 max-w-4xl font-hand text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
								{post.title}
							</h1>
						</Reveal>
						<Reveal delay={0.14}>
							<div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-ink/70">
								<span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {post.date}</span>
								<span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> {post.attendees} attended</span>
								<a href={post.eventUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold underline underline-offset-4 hover:text-tone-blue-deep">
									The Meetup event <ArrowUpRight className="h-4 w-4" />
								</a>
							</div>
						</Reveal>
					</div>
				</section>

				<section className="border-t-2 border-ink bg-paper-soft">
					<div className="wrap py-14">
						<Reveal>
							<div className="overflow-hidden rounded-2xl border-2 border-ink shadow-paper">
								<img src={post.cover} alt={post.title} className="aspect-[21/9] w-full object-cover" />
							</div>
						</Reveal>
						<Reveal delay={0.08}>
							<article className="blog-body mx-auto mt-10 max-w-3xl rounded-2xl border-2 border-ink bg-paper p-6 shadow-paper-sm sm:p-10">
								<div dangerouslySetInnerHTML={{ __html: post.html }} />
							</article>
						</Reveal>

						<div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
							{prev ? (
								<Link to={`/blog/${prev.slug}`} className="active-press group rounded-xl border-2 border-ink bg-paper-soft p-5 shadow-paper-sm transition-transform hover:-translate-y-0.5">
									<p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/55"><ArrowLeft className="h-3.5 w-3.5" /> Newer</p>
									<p className="mt-2 font-hand text-2xl font-bold leading-tight group-hover:text-tone-blue-deep">{prev.title}</p>
								</Link>
							) : <span />}
							{next ? (
								<Link to={`/blog/${next.slug}`} className="active-press group rounded-xl border-2 border-ink bg-paper-soft p-5 text-right shadow-paper-sm transition-transform hover:-translate-y-0.5">
									<p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/55">Older <ArrowRight className="h-3.5 w-3.5" /></p>
									<p className="mt-2 font-hand text-2xl font-bold leading-tight group-hover:text-tone-blue-deep">{next.title}</p>
								</Link>
							) : <span />}
						</div>
					</div>
				</section>

				{related.length > 0 && (
					<section className="border-t-2 border-ink bg-tone-blue/30">
						<div className="wrap py-16">
							<Reveal>
								<p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-tone-blue-deep">
									<BookOpen className="h-4 w-4" /> Keep reading
								</p>
								<h2 className="mt-3 font-hand text-4xl font-bold leading-tight sm:text-5xl">
									More chronicles.
								</h2>
							</Reveal>
							<div className="mt-8 grid items-stretch gap-6 md:grid-cols-3">
								{related.map((r) => (
									<Reveal key={r.slug} className="h-full">
										<Link to={`/blog/${r.slug}`} className="hover-lift flex h-full flex-col overflow-hidden rounded-2xl border-2 border-ink bg-paper-soft shadow-paper-sm">
											<div className="aspect-[16/9] overflow-hidden border-b-2 border-ink">
												<img src={r.cover} alt={r.title} loading="lazy" className="h-full w-full object-cover" />
											</div>
											<div className="flex flex-1 flex-col p-5">
												<p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/55">{r.date} · {r.attendees} attended</p>
												<p className="mt-1.5 font-hand text-2xl font-bold leading-tight">{r.title}</p>
											</div>
										</Link>
									</Reveal>
								))}
							</div>
						</div>
					</section>
				)}
			</main>
			<Footer />
		</div>
	);
}
