# AIYatra Blog (`/blog`)

The blog at **aiyatra.io/blog**: an [Astro](https://astro.build) app started from
Astro's official blog theme and restyled to match the rest of aiyatra.io. It uses
the same Tailwind tokens (`apps/web/src/index.css` is imported directly), fonts,
header and footer, so moving between the React pages and the blog looks seamless.
**Decap CMS** at `/blog/admin` is the visual editor, with a review workflow for guest posts.

```
src/content/blog/*.md     posts (one Markdown file per post; filename = URL slug)
src/content.config.ts     post schema — keep in step with public/cms/config.yml
src/pages/                /blog, /blog/<slug>, /blog/write, /blog/admin, /blog/rss.xml
src/components/           Header/Footer (ports of apps/web/src/components/SiteChrome.jsx)
public/cms/               Decap CMS config, preview template and styles
public/images/uploads/    images uploaded through the editor
cms-auth/                 GitHub sign-in relay for the editor (Cloudflare Worker)
```

## Running it

From the repo root:

```sh
npm run dev     # React site + blog + local CMS → http://localhost:3000 (blog at /blog)
npm run build   # React site, then the blog into dist/apps/web/blog
```

In development the React dev server proxies `/blog` to `astro dev` (:4321), and
`decap-server` (:8081) lets `/blog/admin` read and write the files on disk with
no sign-in. Locally there's no review queue: "Publish" saves the Markdown file straight away.

## The guest-post workflow (production)

`publish_mode: editorial_workflow` + `open_authoring: true` on the GitHub backend:

1. **Anyone** opens `/blog/write` → *Start writing* and signs in with GitHub. Without
   write access to `AI-Yatra/aiyatra.io`, Decap forks the repo for them and keeps
   their draft there.
2. They set the status to **In review**, which opens a **pull request** against `main`.
3. **You review**: in `/blog/admin` → *Workflow* (or on the PR in GitHub). Leave
   comments or request changes on the PR; GitHub emails the author.
4. **They revise** in the editor and save. The same PR updates.
5. **You approve**: move the card to **Ready** and click **Publish** (or merge the PR).
   The push to `main` runs `.github/workflows/deploy.yml` and the post is live in a few minutes.

Maintainers with write access skip the fork; their drafts are branches in the repo.

## One-time setup for production sign-in

Decap needs a small server to finish GitHub's OAuth handshake (GitHub Pages
can't run one). `cms-auth/` is a ready-made Cloudflare Worker (free tier):

1. **Deploy the worker**: `cd apps/blog/cms-auth && npx wrangler deploy`. Note its
   URL, e.g. `https://aiyatra-cms-auth.<you>.workers.dev`.
2. **Create a GitHub OAuth App** (GitHub → Settings → Developer settings → OAuth Apps,
   ideally under the AI-Yatra org):
   - Homepage URL: `https://aiyatra.io/blog`
   - Authorization callback URL: `https://aiyatra-cms-auth.<you>.workers.dev/callback`
3. **Give the worker the app's keys**:
   `npx wrangler secret put GITHUB_CLIENT_ID` and `npx wrangler secret put GITHUB_CLIENT_SECRET`.
4. **Point Decap at it**: set `backend.base_url` in `public/cms/config.yml` to the worker URL.
5. Make sure the repo is **public** and allows forking. Open authoring needs both.
