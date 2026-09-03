import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
	ArrowLeft, ShieldCheck, KeyRound, FilePlus2, FolderOpen, Eye,
	PencilLine, Save, LogOut, TriangleAlert, CircleCheck, Lock,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import { Header, Footer } from '@/components/SiteChrome';
import { CONTACT_EMAIL, ADMIN_EMAILS } from '@/data/site';

const GIS_SCRIPT = 'https://accounts.google.com/gsi/client';
const REPO = 'AI-Yatra/aiyatra.io';
const POSTS_PATH = 'apps/web/src/posts';
const API = 'https://api.github.com';

function slugify(title) {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/[\s_]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
		|| 'untitled-post';
}

function todayISO() {
	return new Date().toISOString().slice(0, 10);
}

function toMarkdown(f) {
	return [
		'---',
		`title: ${f.title}`,
		`date: ${f.date}`,
		`excerpt: ${f.excerpt}`,
		`cover: ${f.cover}`,
		`eventUrl: ${f.eventUrl}`,
		`attendees: ${f.attendees}`,
		'---',
		'',
		f.body.trim(),
		'',
	].join('\n');
}

function parseMarkdown(raw) {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!match) return null;
	const f = { title: '', date: todayISO(), excerpt: '', cover: '', eventUrl: '', attendees: '', body: '' };
	for (const line of match[1].split(/\r?\n/)) {
		const field = line.match(/^([A-Za-z]+):\s*(.*)$/);
		if (field && field[1] in f) f[field[1]] = field[2].trim();
	}
	f.body = match[2].trim();
	return f;
}

const EMPTY = { title: '', slug: '', date: todayISO(), excerpt: '', cover: '', eventUrl: '', attendees: '', body: '' };

async function gh(path, token, options = {}) {
	const res = await fetch(`${API}${path}`, {
		...options,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			...(options.headers || {}),
		},
	});
	if (!res.ok) {
		const err = new Error(`GitHub ${res.status}`);
		err.status = res.status;
		try { err.detail = await res.text(); } catch { err.detail = ''; }
		throw err;
	}
	return res.json();
}

function loadGis() {
	return new Promise((resolve, reject) => {
		if (window.google?.accounts?.id) return resolve(window.google);
		const tag = document.createElement('script');
		tag.src = GIS_SCRIPT;
		tag.async = true;
		tag.defer = true;
		tag.onload = () => (window.google?.accounts?.id ? resolve(window.google) : reject(new Error('GIS failed to load')));
		tag.onerror = () => reject(new Error('Could not load Google sign-in. Check your connection.'));
		document.head.appendChild(tag);
	});
}

export default function AdminPage() {
	const [user, setUser] = useState(null);
	const [gateError, setGateError] = useState('');
	const [gisReady, setGisReady] = useState(false);
	const [token, setToken] = useState(() => sessionStorage.getItem('aiyatra-gh-token') || '');
	const [tokenOk, setTokenOk] = useState(false);
	const [tokenError, setTokenError] = useState('');
	const [files, setFiles] = useState([]);
	const [mode, setMode] = useState('new');
	const [sha, setSha] = useState(null);
	const [form, setForm] = useState(EMPTY);
	const [preview, setPreview] = useState(false);
	const [previewHtml, setPreviewHtml] = useState('');
	const [saving, setSaving] = useState(false);
	const [result, setResult] = useState(null);
	const buttonRef = useRef(null);
	const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

	useEffect(() => {
		let cancelled = false;
		if (!clientId) return undefined;
		loadGis()
			.then((google) => {
				if (cancelled) return;
				google.accounts.id.initialize({
					client_id: clientId,
					callback: (response) => {
						try {
							const payload = JSON.parse(atob(response.credential.split('.')[1]));
							if (ADMIN_EMAILS.includes(payload.email)) {
								setUser({ email: payload.email, name: payload.name || payload.email });
								setGateError('');
							} else {
								setGateError(`Signed in as ${payload.email}, which is not on the allowlist. Only ${ADMIN_EMAILS.join(', ')} can use this editor.`);
							}
						} catch {
							setGateError('Could not verify the Google credential. Try again.');
						}
					},
				});
				if (buttonRef.current) {
					google.accounts.id.renderButton(buttonRef.current, { theme: 'filled_black', size: 'large', width: 280 });
				}
				setGisReady(true);
			})
			.catch((e) => setGateError(e.message));
		return () => { cancelled = true; };
	}, [clientId]);

	useEffect(() => {
		if (!preview) return;
		let cancelled = false;
		import('marked').then(({ marked }) => {
			if (!cancelled) setPreviewHtml(marked.parse(form.body || '', { breaks: true }));
		});
		return () => { cancelled = true; };
	}, [preview, form.body]);

	async function validateToken(value) {
		const v = (value ?? token).trim();
		setTokenError('');
		if (!v) {
			setTokenOk(false);
			return;
		}
		try {
			await gh(`/repos/${REPO}`, v);
			sessionStorage.setItem('aiyatra-gh-token', v);
			setToken(v);
			setTokenOk(true);
			const list = await gh(`/repos/${REPO}/contents/${POSTS_PATH}?ref=main`, v);
			setFiles(Array.isArray(list) ? list.filter((f) => f.name.endsWith('.md')).map((f) => f.name) : []);
		} catch (e) {
			setTokenOk(false);
			setTokenError(e.status === 401
				? 'Token rejected (401). Create a fine-grained token for AI-Yatra/aiyatra.io with Contents read/write and paste it again.'
				: `GitHub error (${e.status || 'network'}). Check the token scope and connection.`);
		}
	}

	async function loadFile(name) {
		setResult(null);
		try {
			const data = await gh(`/repos/${REPO}/contents/${POSTS_PATH}/${name}?ref=main`, token);
			const raw = atob(data.content.replace(/\n/g, ''));
			const parsed = parseMarkdown(decodeURIComponent(escape(raw)));
			if (!parsed) throw new Error('bad-format');
			setForm({ ...parsed, slug: name.replace(/\.md$/, '') });
			setSha(data.sha);
			setMode('existing');
		} catch {
			setResult({ ok: false, message: `Could not load ${name}. It may use a format this editor cannot parse.` });
		}
	}

	function startNew() {
		setMode('new');
		setSha(null);
		setForm(EMPTY);
		setResult(null);
		setPreview(false);
	}

	function set(field, value) {
		setForm((f) => {
			const next = { ...f, [field]: value };
			if (field === 'title' && mode === 'new') next.slug = slugify(value);
			return next;
		});
	}

	async function save() {
		setSaving(true);
		setResult(null);
		try {
			if (!form.title.trim() || !form.slug.trim() || !form.body.trim()) {
				throw new Error('Title, slug and body are required.');
			}
			if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
				throw new Error('Slug must be kebab-case (letters, numbers, dashes).');
			}
			const content = btoa(unescape(encodeURIComponent(toMarkdown(form))));
			const payload = {
				message: `Post: ${form.title}`,
				content,
				branch: 'main',
				...(sha && mode === 'existing' ? { sha } : {}),
			};
			const data = await gh(
				`/repos/${REPO}/contents/${POSTS_PATH}/${form.slug}.md`,
				token,
				{ method: 'PUT', body: JSON.stringify(payload) },
			);
			setSha(data.content?.sha || null);
			setResult({ ok: true, message: `Saved ${form.slug}.md — the site rebuilds in about a minute.` });
		} catch (e) {
			setResult({
				ok: false,
				message: e.status === 422
					? 'Conflict (422): the file changed on main since you loaded it. Reload it and save again.'
					: e.message || 'Save failed. Check the token and try again.',
			});
		} finally {
			setSaving(false);
		}
	}

	function signOut() {
		setUser(null);
		setToken('');
		setTokenOk(false);
		setFiles([]);
		sessionStorage.removeItem('aiyatra-gh-token');
		setForm(EMPTY);
		setSha(null);
		setMode('new');
		setResult(null);
	}

	return (
		<div className="grain min-h-screen bg-paper text-ink antialiased">
			<Helmet>
				<title>Admin — AIYatra</title>
				<meta name="robots" content="noindex" />
			</Helmet>
			<Header />
			<main>
				<section id="top" className="wrap py-14">
					<Reveal>
						<p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-tone-blue-deep">
							<Lock className="h-4 w-4" /> Restricted area
						</p>
						<h1 className="mt-3 font-hand text-5xl font-bold leading-tight sm:text-6xl">
							Blog editor.
						</h1>
						<p className="mt-4 max-w-2xl text-lg text-ink-soft">
							Sign in with Gmail, paste a GitHub token, and publish — posts commit straight
							to <span className="font-semibold">main</span> and go live on the next rebuild.
						</p>
					</Reveal>

					{/* Step 1 — Gmail gate */}
					<Reveal delay={0.06}>
						<div className="mt-8 rounded-2xl border-2 border-ink bg-paper-soft p-6 shadow-paper-sm sm:p-8">
							<p className="flex items-center gap-2 font-hand text-3xl font-bold">
								<ShieldCheck className="h-6 w-6" /> 1 · Prove it is you
							</p>
							{!clientId && (
								<p className="mt-3 flex items-start gap-2 rounded-xl border-2 border-ink bg-tone-coral p-4 text-sm font-semibold">
									<TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
									No Google client ID configured. Add VITE_GOOGLE_CLIENT_ID to apps/web/.env (and the
									Pages build secret) with an OAuth client that allows https://aiyatra.io and
									http://localhost:3000.
								</p>
							)}
							{clientId && !user && (
								<div className="mt-4">
									<div ref={buttonRef} />
									{!gisReady && <p className="mt-2 text-sm font-medium text-ink/60">Loading Google sign-in…</p>}
								</div>
							)}
							{user && (
								<p className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-tone-green px-4 py-2 text-sm font-bold">
									<CircleCheck className="h-5 w-5" /> Signed in as {user.email}
									<button type="button" onClick={signOut} className="ml-2 inline-flex items-center gap-1 underline underline-offset-4">
										<LogOut className="h-4 w-4" /> Sign out
									</button>
								</p>
							)}
							{gateError && (
								<p className="mt-4 flex items-start gap-2 rounded-xl border-2 border-ink bg-tone-coral p-4 text-sm font-semibold">
									<TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" /> {gateError}
								</p>
							)}
						</div>
					</Reveal>

					{/* Step 2 — token */}
					{user && (
						<Reveal delay={0.04}>
							<div className="mt-6 rounded-2xl border-2 border-ink bg-paper-soft p-6 shadow-paper-sm sm:p-8">
								<p className="flex items-center gap-2 font-hand text-3xl font-bold">
									<KeyRound className="h-6 w-6" /> 2 · GitHub token
								</p>
								<p className="mt-2 max-w-2xl text-sm font-medium text-ink/70">
									Fine-grained token for <span className="font-bold">AI-Yatra/aiyatra.io</span> with
									Contents read/write. It stays in this tab&apos;s session storage and is cleared on sign-out.
								</p>
								<div className="mt-4 flex flex-col gap-3 sm:flex-row">
									<input
										type="password"
										value={token}
										onChange={(e) => { setToken(e.target.value); setTokenOk(false); }}
										placeholder="github_pat_…"
										autoComplete="off"
										className="h-12 flex-1 rounded-xl border-2 border-ink bg-paper px-4 text-sm font-semibold placeholder:text-ink/40"
									/>
									<button
										type="button"
										onClick={() => validateToken()}
										className="active-press inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-ink bg-tone-yellow px-6 text-sm font-bold shadow-paper-sm transition-transform hover:-translate-y-0.5"
									>
										Validate & unlock
									</button>
								</div>
								{tokenError && (
									<p className="mt-3 flex items-start gap-2 rounded-xl border-2 border-ink bg-tone-coral p-4 text-sm font-semibold">
										<TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" /> {tokenError}
									</p>
								)}
								{tokenOk && (
									<p className="mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-tone-green px-4 py-2 text-sm font-bold">
										<CircleCheck className="h-5 w-5" /> Token works — editor unlocked.
									</p>
								)}
							</div>
						</Reveal>
					)}

					{/* Step 3 — editor */}
					{user && tokenOk && (
						<Reveal delay={0.04}>
							<div className="mt-6 rounded-2xl border-2 border-ink bg-paper p-6 shadow-paper sm:p-8">
								<div className="flex flex-wrap items-center justify-between gap-4">
									<p className="flex items-center gap-2 font-hand text-3xl font-bold">
										<PencilLine className="h-6 w-6" /> 3 · Write
									</p>
									<div className="flex flex-wrap items-center gap-2">
										<button
											type="button"
											onClick={startNew}
											className={`inline-flex h-10 items-center gap-1.5 rounded-xl border-2 border-ink px-4 text-sm font-bold ${mode === 'new' ? 'bg-ink text-paper' : 'bg-paper-soft'}`}
										>
											<FilePlus2 className="h-4 w-4" /> New post
										</button>
										<button
											type="button"
											onClick={() => setPreview((p) => !p)}
											className={`inline-flex h-10 items-center gap-1.5 rounded-xl border-2 border-ink px-4 text-sm font-bold ${preview ? 'bg-ink text-paper' : 'bg-paper-soft'}`}
										>
											<Eye className="h-4 w-4" /> {preview ? 'Hide preview' : 'Preview'}
										</button>
									</div>
								</div>

								{files.length > 0 && (
									<label className="mt-5 block">
										<span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">
											<FolderOpen className="h-4 w-4" /> Edit an existing post
										</span>
										<select
											value={mode === 'existing' ? `${form.slug}.md` : ''}
											onChange={(e) => { if (e.target.value) loadFile(e.target.value); }}
											className="mt-2 h-12 w-full rounded-xl border-2 border-ink bg-paper-soft px-4 text-sm font-semibold"
										>
											<option value="">Choose a post…</option>
											{files.map((f) => (
												<option key={f} value={f}>{f}</option>
											))}
										</select>
									</label>
								)}

								<div className="mt-5 grid gap-4 sm:grid-cols-2">
									<label className="block sm:col-span-2">
										<span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">Title</span>
										<input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Session recap title" className="mt-1.5 h-12 w-full rounded-xl border-2 border-ink bg-paper-soft px-4 text-sm font-semibold placeholder:text-ink/40" />
									</label>
									<label className="block">
										<span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">Slug</span>
										<input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="my-session-recap" className="mt-1.5 h-12 w-full rounded-xl border-2 border-ink bg-paper-soft px-4 text-sm font-semibold placeholder:text-ink/40" />
									</label>
									<label className="block">
										<span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">Date</span>
										<input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="mt-1.5 h-12 w-full rounded-xl border-2 border-ink bg-paper-soft px-4 text-sm font-semibold" />
									</label>
									<label className="block sm:col-span-2">
										<span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">Excerpt</span>
										<input value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} placeholder="One-line summary for cards and SEO" className="mt-1.5 h-12 w-full rounded-xl border-2 border-ink bg-paper-soft px-4 text-sm font-semibold placeholder:text-ink/40" />
									</label>
									<label className="block">
										<span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">Cover image URL</span>
										<input value={form.cover} onChange={(e) => set('cover', e.target.value)} placeholder="https://…" className="mt-1.5 h-12 w-full rounded-xl border-2 border-ink bg-paper-soft px-4 text-sm font-semibold placeholder:text-ink/40" />
									</label>
									<label className="block">
										<span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">Meetup event URL</span>
										<input value={form.eventUrl} onChange={(e) => set('eventUrl', e.target.value)} placeholder="https://www.meetup.com/aiyatra/events/…" className="mt-1.5 h-12 w-full rounded-xl border-2 border-ink bg-paper-soft px-4 text-sm font-semibold placeholder:text-ink/40" />
									</label>
									<label className="block">
										<span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">Attendees</span>
										<input type="number" min="0" value={form.attendees} onChange={(e) => set('attendees', e.target.value)} placeholder="0" className="mt-1.5 h-12 w-full rounded-xl border-2 border-ink bg-paper-soft px-4 text-sm font-semibold placeholder:text-ink/40" />
									</label>
								</div>

								<div className={`mt-4 grid gap-4 ${preview ? 'lg:grid-cols-2' : ''}`}>
									<label className="block">
										<span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">Body (markdown)</span>
										<textarea
											value={form.body}
											onChange={(e) => set('body', e.target.value)}
											rows={16}
											placeholder={'## What we covered\n\nStart writing…'}
											className="mt-1.5 w-full rounded-xl border-2 border-ink bg-paper-soft p-4 font-mono text-sm leading-relaxed placeholder:text-ink/40"
										/>
									</label>
									{preview && (
										<div>
											<span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/60">Preview</span>
											<div className="blog-body mt-1.5 min-h-[200px] rounded-xl border-2 border-ink bg-paper-soft p-4" dangerouslySetInnerHTML={{ __html: previewHtml }} />
										</div>
									)}
								</div>

								<div className="mt-5 flex flex-wrap items-center gap-3">
									<button
										type="button"
										onClick={save}
										disabled={saving}
										className="active-press inline-flex h-12 items-center gap-2 rounded-xl border-2 border-ink bg-tone-blue-deep px-7 text-base font-semibold text-paper shadow-paper-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
									>
										<Save className="h-5 w-5" /> {saving ? 'Saving…' : (mode === 'existing' ? 'Update post' : 'Publish post')}
									</button>
									<Link to="/blog" className="text-sm font-bold underline underline-offset-4 hover:text-tone-blue-deep">
										View the blog
									</Link>
								</div>
								{result && (
									<p className={`mt-4 flex items-start gap-2 rounded-xl border-2 border-ink p-4 text-sm font-semibold ${result.ok ? 'bg-tone-green' : 'bg-tone-coral'}`}>
										{result.ok ? <CircleCheck className="mt-0.5 h-5 w-5 shrink-0" /> : <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />}
										{result.message}
									</p>
								)}
							</div>
						</Reveal>
					)}

					<Reveal delay={0.04}>
						<p className="mt-8 max-w-2xl text-xs font-medium leading-relaxed text-ink/55">
							The Gmail button only unlocks this editor — it cannot publish on its own. Publishing
							needs your GitHub token, which never leaves this tab. Commits land on main and the
							site rebuilds automatically.
						</p>
					</Reveal>
				</section>
			</main>
			<Footer />
		</div>
	);
}
