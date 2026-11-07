# AIYatra Blog (`/blog`)

The blog at **aiyatra.io/blog**: an [Astro](https://astro.build) app started from
Astro's official blog theme and restyled to match the rest of aiyatra.io. It uses
the same Tailwind tokens (`apps/web/src/index.css` is imported directly), fonts,
header and footer, so moving between the React pages and the blog looks seamless.
**Decap CMS** at `/blog/admin` is the visual editor, with a review workflow for guest posts.

Writers' guide: [`HOW-TO-WRITE-A-GUEST-POST.md`](../../HOW-TO-WRITE-A-GUEST-POST.md) at the repo root,
published on the site at `/blog/guide` (same file, rendered by `src/pages/guide.astro`).

```
src/content/blog/*.md     posts (one Markdown file per post; filename = URL slug)
src/content.config.ts     post schema — keep in step with public/cms/config.yml
src/pages/                /blog, /blog/<slug>, /blog/write, /blog/admin, /blog/rss.xml
src/components/           Header/Footer (ports of apps/web/src/components/SiteChrome.jsx)
src/editor/               the writing experience: a TipTap editor plugged into Decap as custom widgets
src/styles/post-blocks.css  styles for callouts, embeds, cards etc., shared by the editor and the blog
public/cms/               Decap CMS config and interface styles
public/images/uploads/    images uploaded through the editor
cms-auth/                 GitHub sign-in relay for the editor (Cloudflare Worker)
```

## The editor

`/blog/admin` is still Decap CMS, which handles sign-in, drafts, media, PRs and publishing.
`src/editor` replaces its form with a full-page editor built on [TipTap](https://tiptap.dev):

- **Posts stay Markdown.** Standard content saves as plain Markdown. Blocks Markdown can't
  express (callouts, toggles, embeds, link cards, captioned images) save as small HTML blocks, defined
  in `src/editor/blocks.ts` and styled in `src/styles/post-blocks.css`. Equations are `$$…$$` and
  diagrams are ` ```mermaid ` fences.
- **Opening a post never changes it.** The file is only rewritten after someone edits the body.
- **Uploads go through Decap**, so images are committed with the post and land in the same PR.
- **To add a block:** define the node and its Markdown in `blocks.ts`, add it to `extensions.ts`, list
  it in `commands.ts`, and style it in `post-blocks.css`. If it outputs new HTML, check it renders on a real post.
- **Embeds are an allowlist** in `src/editor/embeds.ts`. An iframe from any other site is dropped by the visual editor.
- **Unknown HTML is kept** as a Custom HTML block (`src/editor/raw.ts`), so review `<script>` and similar in guest PRs.
- **Scheduling:** `getPosts()` hides posts dated in the future from production builds. The nightly deploy publishes them at 00:00 IST on their date.
- **Stock photos** come from the [Openverse](https://openverse.org) API with no key: anonymous use is limited to 20 searches a minute and 200 a day per visitor's address. A copy is saved in the repo when the host allows it; otherwise the post links to the original.
- **AI help** runs in the writer's browser with their own Anthropic API key (`src/editor/ai.ts`). The site holds no key and pays nothing.
- **Link cards** get their title and image from the `/unfurl` route on the sign-in relay. Without it they still
  work, showing the site's name and an editable title.

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

## Production sign-in (already set up)

Decap needs a small server to finish GitHub's OAuth handshake (GitHub Pages
can't run one). `cms-auth/` is that server, a Cloudflare Worker deployed at
**https://aiyatra-cms-auth.aiyatra.workers.dev** (`backend.base_url` in
`public/cms/config.yml`). It holds the client ID and secret of the
**AIYatra Blog CMS** OAuth App in the AI-Yatra GitHub org, whose callback URL is
`https://aiyatra-cms-auth.aiyatra.workers.dev/callback`.

To redeploy it or rotate its keys, always pass the config or worker name
explicitly. Run from `apps/blog/cms-auth`, wrangler's auto-setup would otherwise
pick up the Astro project in `apps/blog` and try to rewrite it.

```sh
npx wrangler deploy --config apps/blog/cms-auth/wrangler.toml
npx wrangler secret put GITHUB_CLIENT_ID --name aiyatra-cms-auth
npx wrangler secret put GITHUB_CLIENT_SECRET --name aiyatra-cms-auth
```

Redeploy the relay whenever `cms-auth/worker.js` changes (the `/unfurl` link preview route lives there too).

The repo must stay **public** and allow forking, because open authoring needs both.

## Lockfile note

npm on macOS drops two Linux/wasm-only entries (`@emnapi/core`, `@emnapi/runtime`)
from `package-lock.json` when it rewrites the file, and CI's `npm ci` then fails.
After running `npm install` on a Mac, check `git diff package-lock.json` for that
before committing.
