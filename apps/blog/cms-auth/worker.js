// GitHub sign-in relay for Decap CMS at aiyatra.io/blog/admin.
//
// Decap runs entirely in the browser, but exchanging GitHub's OAuth code for
// a token needs the app's client secret, which can't ship to the browser.
// This Cloudflare Worker holds the secret and does that one exchange.
//
//   GET /auth      → redirects to GitHub's consent screen
//   GET /callback  → swaps the code for a token and hands it to Decap
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
