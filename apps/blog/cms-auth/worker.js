// GitHub sign-in relay for Decap CMS at aiyatra.io/blog/admin.
//
// Decap runs entirely in the browser, but exchanging GitHub's OAuth code for
// a token needs the app's client secret, which can't ship to the browser.
// This Cloudflare Worker holds the secret and does that one exchange.
//
//   GET /auth      → redirects to GitHub's consent screen
//   GET /callback  → swaps the code for a token and hands it to Decap
//   GET /unfurl    → reads a page's title, description and image for the
//                    editor's link cards (browsers can't read other sites)
//   GET /stats, POST /stats/view, POST /stats/react → view counts and reactions
//
// Secrets (wrangler secret put …): GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET.
// Set ALLOWED_ORIGIN in wrangler.toml to the site that hosts the editor.

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname === '/auth') {
			const scope = url.searchParams.get('scope') || 'public_repo';
			const state = crypto.randomUUID();
			const authorize = new URL('https://github.com/login/oauth/authorize');
			authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
			authorize.searchParams.set('redirect_uri', `${url.origin}/callback`);
			authorize.searchParams.set('scope', scope);
			authorize.searchParams.set('state', state);
			return new Response(null, {
				status: 302,
				headers: {
					Location: authorize.href,
					'Set-Cookie': `decap_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
				},
			});
		}

		if (url.pathname === '/callback') {
			const cookie = request.headers.get('Cookie') || '';
			const expected = cookie.match(/(?:^|;\s*)decap_oauth_state=([^;]+)/)?.[1];
			if (!expected || expected !== url.searchParams.get('state')) {
				return reply(env, 'error', { message: 'Sign-in expired or was tampered with. Please try again.' });
			}
			const res = await fetch('https://github.com/login/oauth/access_token', {
				method: 'POST',
				headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': 'aiyatra-cms-auth' },
				body: JSON.stringify({
					client_id: env.GITHUB_CLIENT_ID,
					client_secret: env.GITHUB_CLIENT_SECRET,
					code: url.searchParams.get('code'),
					redirect_uri: `${url.origin}/callback`,
				}),
			});
			const data = await res.json();
			if (!data.access_token) {
				return reply(env, 'error', { message: data.error_description || 'GitHub did not return a token.' });
			}
			return reply(env, 'success', { token: data.access_token, provider: 'github' });
		}

		if (url.pathname === '/unfurl') return unfurl(request, env, url);
		if (url.pathname === '/stats' || url.pathname.startsWith('/stats/')) return stats(request, env, url);

		return new Response('AIYatra CMS sign-in relay', { status: 404 });
	},
};

// Decap's popup handshake: announce, wait for the editor window to answer,
// then post the result back to that window only.
function reply(env, status, content) {
	const origin = env.ALLOWED_ORIGIN || 'https://aiyatra.io';
	const message = `authorization:github:${status}:${JSON.stringify(content)}`;
	const html = `<!doctype html><meta charset="utf-8"><title>Signing in…</title>
<p style="font:16px system-ui;padding:24px">Signing you in… you can close this window if it stays open.</p>
<script>
(function () {
	var origin = ${JSON.stringify(origin)};
	window.addEventListener('message', function (e) {
		if (e.origin !== origin) return;
		window.opener.postMessage(${JSON.stringify(message)}, e.origin);
		setTimeout(function () { window.close(); }, 500);
	});
	window.opener && window.opener.postMessage('authorizing:github', origin);
})();
</script>`;
	return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Set-Cookie': 'decap_oauth_state=; Path=/; Max-Age=0' } });
}

const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// Link previews for the editor. Only the editor's own origin may ask, only
// public http(s) pages are read, and only text from their <head> comes back.
async function unfurl(request, env, url) {
	const origin = request.headers.get('Origin') || '';
	const allowed = origin === (env.ALLOWED_ORIGIN || 'https://aiyatra.io') || LOCAL_ORIGIN.test(origin);
	if (!allowed) return new Response('Forbidden', { status: 403 });
	const json = (body, status = 200) => new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin, Vary: 'Origin', 'Cache-Control': 'public, max-age=86400' },
	});

	let target;
	try {
		target = new URL(url.searchParams.get('url'));
	} catch {
		return json({ error: 'Not a URL' }, 400);
	}
	if (!/^https?:$/.test(target.protocol) || isPrivateHost(target.hostname)) return json({ error: 'Not allowed' }, 400);

	let page;
	try {
		page = await fetch(target, {
			headers: { 'User-Agent': 'AIYatraLinkPreview/1.0 (+https://aiyatra.io/blog)', Accept: 'text/html' },
			signal: AbortSignal.timeout(6000),
		});
	} catch {
		return json({ error: 'Could not reach the page' }, 502);
	}
	if (!page.ok || !(page.headers.get('Content-Type') || '').includes('text/html')) return json({ error: 'Not a readable page' }, 422);

	const meta = {};
	let docTitle = '';
	await new HTMLRewriter()
		.on('head meta', {
			element(el) {
				const key = el.getAttribute('property') || el.getAttribute('name');
				const content = el.getAttribute('content');
				if (key && content && !meta[key]) meta[key] = content;
			},
		})
		.on('head title', { text(t) { docTitle += t.text; } })
		.transform(page)
		.arrayBuffer();

	const image = safeUrl(meta['og:image'] || meta['twitter:image'], target);
	return json({
		title: (meta['og:title'] || meta['twitter:title'] || docTitle).trim().slice(0, 200),
		description: (meta['og:description'] || meta['twitter:description'] || meta.description || '').trim().slice(0, 300),
		image,
	});
}

function safeUrl(value, base) {
	try {
		const u = new URL(value, base);
		return u.protocol === 'https:' ? u.href : '';
	} catch {
		return '';
	}
}

function isPrivateHost(host) {
	return host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')
		|| /^\[?[0-9a-f:]+\]?$/i.test(host) || /^\d+\.\d+\.\d+\.\d+$/.test(host);
}

// View counts and reactions. Only counts are stored: no IP addresses, cookies or
// reader identifiers. Counts are for interest and can't be fully protected from
// someone determined to inflate them, so nothing should depend on them.
const REACTIONS = ['like', 'insight', 'love'];
const SLUG = /^[a-z0-9][a-z0-9-]{0,150}$/;

async function stats(request, env, url) {
	const origin = request.headers.get('Origin') || '';
	const allowed = origin === (env.ALLOWED_ORIGIN || 'https://aiyatra.io') || LOCAL_ORIGIN.test(origin);
	const headers = { 'Content-Type': 'application/json', Vary: 'Origin' };
	if (allowed) {
		headers['Access-Control-Allow-Origin'] = origin;
		headers['Access-Control-Allow-Headers'] = 'Content-Type';
		headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
	}
	const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });
	if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
	if (!env.DB) return json({ error: 'Not configured' }, 503);

	const read = async (slug) => {
		const { results } = await env.DB.prepare('SELECT kind, n FROM counters WHERE slug = ?').bind(slug).all();
		const out = { views: 0, reactions: {} };
		for (const { kind, n } of results) {
			if (kind === 'view') out.views = n; else out.reactions[kind] = n;
		}
		return json(out);
	};

	if (request.method === 'GET') {
		const slug = url.searchParams.get('slug') || '';
		return SLUG.test(slug) ? read(slug) : json({ error: 'Bad post' }, 400);
	}
	if (request.method !== 'POST' || !allowed) return json({ error: 'Not allowed' }, 403);

	if (env.STATS_LIMIT) {
		const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
		const { success } = await env.STATS_LIMIT.limit({ key: ip });
		if (!success) return json({ error: 'Slow down' }, 429);
	}
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Bad request' }, 400);
	}
	const slug = String(body?.slug || '');
	if (!SLUG.test(slug)) return json({ error: 'Bad post' }, 400);
	const kind = url.pathname === '/stats/view' ? 'view' : url.pathname === '/stats/react' ? String(body?.kind || '') : '';
	if (kind !== 'view' && !REACTIONS.includes(kind)) return json({ error: 'Bad request' }, 400);

	// The first count for a post checks that it exists, so made-up names can't fill the table.
	const known = await env.DB.prepare('SELECT 1 FROM counters WHERE slug = ? LIMIT 1').bind(slug).first();
	if (!known) {
		const site = env.ALLOWED_ORIGIN || 'https://aiyatra.io';
		const page = await fetch(`${site}/blog/${slug}`, { method: 'HEAD', signal: AbortSignal.timeout(5000) }).catch(() => null);
		if (!page?.ok) return json({ error: 'Unknown post' }, 404);
	}
	await env.DB.prepare('INSERT INTO counters (slug, kind, n) VALUES (?, ?, 1) ON CONFLICT (slug, kind) DO UPDATE SET n = n + 1').bind(slug, kind).run();
	return read(slug);
}
