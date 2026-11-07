# How to write a guest post for the AIYatra blog

Anyone can write for the [AIYatra blog](https://aiyatra.io/blog). This guide walks you through the whole journey, from your first draft to seeing your post live on aiyatra.io, and shows you how to use every option in the editor so your post looks right the first time.

It takes 10–15 minutes to read. Reading it before you start will save you (and your reviewer) a round of fixes.

Quick links:

- Start writing: [aiyatra.io/blog/admin](https://aiyatra.io/blog/admin)
- The short version of this guide: [aiyatra.io/blog/write](https://aiyatra.io/blog/write)
- Questions: [global.aiyatra@gmail.com](mailto:global.aiyatra@gmail.com)

## The process at a glance

| Step | What you do | What happens |
| --- | --- | --- |
| 1. Sign in | Open the editor and sign in with GitHub | The editor makes your own private copy of the site (a "fork") to hold your drafts |
| 2. Write | Fill in the post details and write the body | Your work is saved as a draft that only you and the AIYatra team can see |
| 3. Submit | Set the status to **In review** | A pull request opens for the AIYatra team |
| 4. Revise | Read the reviewer's comments, edit, save | Your pull request updates by itself |
| 5. Published | Nothing. The team publishes it | Your post appears on aiyatra.io/blog a few minutes later |

Reviews usually happen within a week. Nothing you write is public until a reviewer publishes it.

## Before you start

### What you need

- A free [GitHub account](https://github.com/signup). It is how we keep track of your draft, the review comments and your changes. You never need to touch code or Git.
- A desktop or laptop browser. The editor works on a phone, but writing there is painful.
- Your post, or at least an outline. You can write directly in the editor or paste from Google Docs, Word or a Markdown file.

### What makes a good post

- **Original:** a project you built, a paper you broke down, a lesson from a session, a tutorial.
- **Hands-on:** code, numbers, diagrams and what went wrong are all welcome.
- **Focused:** roughly 800–2,500 words. Clear beats long.
- **Credited:** use only images you made or have the right to share, and link to your sources.
- **Not promotional:** mentioning your own work is fine when it helps the reader.
- **Kind and inclusive:** the AIYatra community is open to everyone.

## Step 1: Open the editor and sign in

1. Go to [aiyatra.io/blog/admin](https://aiyatra.io/blog/admin) and click **Login with GitHub**.
2. A GitHub window asks you to authorize **AIYatra Blog CMS**. Click **Authorize**. This only lets the editor save your drafts. It cannot see your private repositories.
3. The first time, the editor asks to create your own copy of the site (a **fork**). Click **Fork the repo**. This is where your drafts live until they are published.
4. You land on the **Contents** page with the list of blog posts. Click **+ Blog post** to start.

> If the sign-in window opens and closes without logging you in, allow pop-ups for aiyatra.io and try again.

## Step 2: Fill in the post details

The pill at the bottom of the page switches between three views:

- **Write** is the page itself: your cover image, title, subtitle and post. It already looks like the published post.
- **Preview** hides the editing tools so you can read the post as readers will.
- **Post details** slides in a panel from the right with your summary, category, tags, name and search-engine settings, so you can still see your post. If you try to save with a required detail missing, the panel opens by itself.

Here is what goes in each field:

| Field | Required? | What to put in it | Avoid |
| --- | --- | --- | --- |
| **Cover image** (Write) | Recommended | Drag an image onto **Add cover**, or use **Stock photo** or **Cover from URL**. A wide image works best (16:9, ideally 1600 × 900 px) | Images with lots of small text, or images you don't have the right to use |
| **Cover image description** (Write) | Yes, if you add a cover | Appears under the cover. Describe the image for people who can't see it, e.g. "Five students pair-programming around a table" | "image", "cover", or leaving it empty |
| **Title** (Write) | Yes | A clear, specific title, e.g. "Fine-tuning Gemma on a single GPU with LoRA" | Clickbait, ALL CAPS, a trailing full stop |
| **Cover credit** (Write) | If the image isn't yours | Who took the photo. Stock photos fill this in for you | |
| **Subtitle** (Write) | No | Click **Add subtitle**. One line under the title that adds detail | Repeating the title |
| **Post** (Write) | Yes | The body of your post. See the next step | |
| **Post URL** | Automatic | Follows your title. Edit it for a shorter address, e.g. `fine-tuning-gemma`. It can't change after your first save | Very long addresses |
| **Short summary** | Yes | One or two plain sentences (under ~200 characters) saying what the reader will learn. Shown on blog cards, in Google results and in link previews | Markdown, links, or repeating the title |
| **Category** | Yes | **Guest post** (already selected). Pick **Tutorial** or **Research notes** if your post is clearly one of those | **Session recap**, which is reserved for the AIYatra team |
| **Your name** | Yes | Your name as you want it shown on the post | Usernames or handles |
| **Co-authors** | No | Names of anyone who wrote this with you. Press Enter after each | |
| **About you** | No | One line, e.g. "ML engineer at Acme · AIYatra Student Ambassador" | A full biography. Keep it to one or two lines |
| **Your link** | No | One full URL to your LinkedIn, GitHub or website, starting with `https://` | A link without `https://` (the editor will refuse it) |
| **Your photo** | No | A square photo of you, at least 200 × 200 px. Upload it or click **Insert from URL** | Logos, group photos, or very large files |
| **Publish date** | Yes | Already set to today. Pick a future date to schedule the post: once approved, it goes live at midnight IST on that date | Dates in the past |
| **Tags** | Recommended | 3–6 short topics. Press Enter after each one, e.g. `RAG`, `embeddings`, `PyTorch` | Long phrases, or more than 6 tags |
| **Series** | No | For multi-part posts, use the exact same name on each part. Readers get a list linking every part | |
| **Show a table of contents** | No | Turn it on for long tutorials. It lists your headings at the top of the post | |
| **SEO title** and **SEO description** | No | Replace the title and summary in search results and link previews | Keyword stuffing |
| **Originally published at** | Only if it ran elsewhere first | The original URL, so search engines credit it | |
| **Meetup event link** | **Leave empty** | Only for AIYatra session recaps | Pasting the AIYatra Meetup page here. It adds a "The Meetup event" link to your post |
| **Attendees** | **Leave empty** | Only for AIYatra session recaps | Any number |

> **Check your Post URL before you first save.** The post's web address (for example `aiyatra.io/blog/fine-tuning-gemma-with-lora`) is fixed at your first save and doesn't change if you edit the title later.

## Step 3: Write the body

Click below the title and start typing. What you see is how the post will look on aiyatra.io, so you can fix anything as you go.

### Four ways to add things

- **Press `/`** on any line to search every block: headings, images, tables, code, callouts, embeds, equations and diagrams. Keep typing to filter, for example `/table`, then press Enter.
- **Use the toolbar** at the top. It stays visible as you scroll.
- **Click the +** that appears beside any empty line.
- **Select text** to get a small menu for bold, italic, links, highlight and more.
- **Drag and drop or paste.** See *Images, files and links* below.

### Writing shortcuts

Type these at the start of a line, followed by a space:

| Type | You get |
| --- | --- |
| `##` / `###` | Heading / sub-heading |
| `-` | Bulleted list |
| `1.` | Numbered list |
| `[ ]` | Checklist |
| `>` | Quote |
| ` ``` ` | Code block |

Also: ⌘S (Ctrl+S) saves your draft, ⌘F (Ctrl+F) finds and replaces text, `---` makes a divider, `**bold**` and `*italic*` format as you type, ⌘K (Ctrl+K on Windows) adds a link, and `:` followed by a word searches emoji, for example `:rocket`. Click the keyboard icon in the toolbar for the full list.

To reorder your post, hover over any block and drag the handle that appears to its left.

### Headings

Headings give your post its structure and its table of contents. They are the most common thing guest posts get wrong.

- **Use Heading 2 for your main sections** (e.g. "Why it matters", "How it works", "Results").
- **Use Heading 3 for sub-sections** inside a Heading 2.
- **Don't use bold text as a heading.** It looks like a heading in your draft but loses the structure on the site.
- **Don't skip levels.** A Heading 3 always sits under a Heading 2.

The post title is already the page's main heading, so the editor doesn't offer Heading 1.

### Images, files and links

**Drag them anywhere on the page, or paste them.**

- **Images:** large photos are resized and converted to WebP automatically. Hover over an image to change its size or add **Alt text**: one sentence describing what it shows. Screen readers read it aloud. Add a caption underneath if it helps. Use images only if you made them or have the right to share them, and credit the source in the caption.
- **Stock photos:** click the stock photo icon in the toolbar or type `/stock` to search free, openly licensed photos from Openverse. The photographer's credit is added for you. Keep it there: the licence requires it.
- **Video, audio and other files** (PDF, slides, notebooks): up to 10 MB each. For anything longer, upload it to YouTube and paste the link instead.
- **Links:** paste a link on an empty line and it becomes a rich block. YouTube, Vimeo, Loom, Spotify, X, CodePen, CodeSandbox, StackBlitz, Figma, GitHub Gist, Hugging Face Spaces and Google Slides embed directly. Other sites become a link card. Inside a sentence, a pasted link stays a normal link. To link some words, select them and paste the URL.
- **Markdown or text files:** drop a `.md` or `.txt` file to add its contents to your post.

Link descriptive words ("the EmbeddingGemma model card"), not "click here".

### Code blocks

Type `/code` or ` ``` `, then pick the language from the menu on the block to switch on syntax colouring.

**Only code goes in code blocks.** Don't use screenshots of code either. Readers can't copy them, and search engines can't read them.

### Tables

Type `/table`. Press Tab to move between cells. While your cursor is in a table, a second row under the toolbar adds and removes rows and columns, and aligns a column left, centre or right.

### Callouts, toggles, equations and diagrams

- **Callouts** (`/note`, `/tip`, `/warning`, `/important`) highlight side information. Click the icon on a callout to change its type.
- **Toggle sections** (`/toggle`) hide long content such as full logs until the reader expands them. In the editor they stay open so you can edit them.
- **Equations** (`/equation`, `/inline equation`) use LaTeX. Click one to edit it.
- **Diagrams** (`/diagram`) use [Mermaid](https://mermaid.js.org/intro/) and draw as you type.

### AI writing help (optional)

Select some text and click the sparkle icon, or type `/ai`, to improve, shorten, expand, simplify or fix the grammar of your text, or to continue writing. You always see the suggestion first and choose whether to use it.

This uses your own [Anthropic API key](https://platform.claude.com/settings/keys), and any usage is billed to your Anthropic account. Your key is saved only in your browser and sent only to Anthropic, so don't use this on a shared computer. You are responsible for checking everything the AI writes.

### Pasting from Google Docs, Word, Notion or an AI assistant

Just paste. Headings, lists, links and tables carry over, and Markdown is converted automatically. Afterwards, check that section titles became real headings, and delete any extra empty lines.

If you used an AI assistant to help you write, check every fact, number and link yourself. You are the author, and your name is on the post.

### Prefer writing in Markdown?

Click the **Edit as Markdown** icon on the right of the toolbar to work on the raw text, then click it again to go back. See the cheat sheet near the end of this guide. Any HTML of your own is kept and shows as a **Custom HTML** block in the visual view. You can also add one with `/html`. Reviewers check custom HTML closely, so only use it when no built-in block does the job.

## Step 4: Save

- Click **Save** at the top whenever you want to keep your progress. Your draft is stored in your fork, and you can close the browser and come back later.
- To find your drafts again, open [aiyatra.io/blog/admin](https://aiyatra.io/blog/admin) and go to the **Workflow** tab.
- If you want to concentrate, the toolbar also has **focus mode**, an **outline** of your headings and a **dark mode**. Word count and reading time sit at the bottom right.

## Step 5: Submit for review

When your post is finished and you have gone through the checklist below:

1. Click **Save**.
2. Open the status menu at the top of the editor (it reads **Status: Draft**) and choose **In review**.

This opens a **pull request** on GitHub for the AIYatra team. You don't need to do anything on GitHub yourself. You can still keep editing while it is in review. Every save updates the same pull request.

## Step 6: Get feedback and revise

- A reviewer reads your post and leaves comments on the pull request. **GitHub emails you** when they do, so check the email address on your GitHub account.
- Click the link in the email to read the comments. You can reply there if something is unclear.
- To make changes, open [aiyatra.io/blog/admin](https://aiyatra.io/blog/admin), go to the **Workflow** tab, open your post, edit it, and click **Save**. The pull request updates by itself and the reviewer is notified.
- When you've addressed everything, reply on the pull request ("Done, thanks!") so the reviewer knows it's ready for another look.

## Step 7: Published

When the reviewer approves your post, they publish it. Your post appears on [aiyatra.io/blog](https://aiyatra.io/blog) a few minutes later, with your name, photo and link. Share it! Tag AIYatra on [LinkedIn](https://www.linkedin.com/company/aiyatra/) so we can share it too.

Need a change after it's live? Open the post in the editor, make the edit, and submit it again. It goes through the same quick review.

## Checklist before you submit

- [ ] The title is clear, and the **Post URL** was checked before the first save
- [ ] The **Short summary** is one or two plain sentences
- [ ] **Category** is Guest post (or Tutorial or Research notes)
- [ ] Your name is filled in. **Your link** starts with `https://`
- [ ] The cover image is wide (16:9), and its description is filled in
- [ ] **Meetup event link** and **Attendees** are empty
- [ ] Sections use **Heading 2**, sub-sections **Heading 3**. No Heading 1, no bold-as-heading
- [ ] Code is in **Code Blocks** with a language picked. No tables or prose in code blocks
- [ ] No stray `##`, `**` or `|` symbols in the post
- [ ] Every image has alt text and you have the right to use it
- [ ] All links work and use `https://`
- [ ] You read the whole post once more from top to bottom

## Common mistakes and how to fix them

| You see this | Why | Fix |
| --- | --- | --- |
| `## Heading` or `**bold**` appearing as text | The symbols were added to a line that already had text, so no formatting was triggered | Delete the symbols, then select the text and use the toolbar |
| A dark box full of `\|` characters | A table was put inside a code block | Delete the code block and add the table with `/table`, or paste it on a normal line |
| Section titles look like normal bold text | Bold was used instead of a heading | Select the line and click **H2** in the toolbar |
| A "The Meetup event" link under the title | **Meetup event link** is filled in | Empty that field |
| Code without colours | The Code Block has no language | Pick a language from the menu on the block |
| Big gaps between paragraphs | Extra empty lines from pasting | Delete the empty lines |
| The cover is cropped badly | The image isn't 16:9 | Use a wide image, ideally 1600 × 900 px |

## Markdown cheat sheet

Only needed if you use **Edit as Markdown**.

```markdown
## Section heading
### Sub-section heading

Plain paragraph. **Bold**, *italic*, `inline code`, [a link](https://example.com).

- Bullet item
- Another item

1. First step
2. Second step

> A quote from a person or paper.

![Alt text describing the image](https://example.com/image.jpg)

| Column | Column |
| --- | --- |
| Cell | Cell |
```

For a code block, put three backticks and the language name on a line, then your code, then three backticks on a line of their own:

````markdown
```python
print("Hello, AIYatra")
```
````

## Frequently asked questions

**Can I write together with a co-author?**
Yes. Add them under **Co-authors** in **Post details**. One of you submits the post.

**Can I delete a draft?**
Yes. Open it in the editor and choose **Delete unpublished entry** from the menu at the top.

**Can I change the web address of my post?**
Yes, until your first save, using **Post URL** in **Post details**. After that, mention it on your pull request and the reviewer will change it.

**My post was published elsewhere first. Can I submit it?**
Yes, if you own it. Paste the original address in **Originally published at** in **Post details**, so search engines credit the original.

**Who owns my post?**
You keep the credit. Your name, photo and link appear on the post.

## For reviewers (AIYatra team)

1. New submissions appear in [aiyatra.io/blog/admin](https://aiyatra.io/blog/admin) under the **Workflow** tab in the **In review** column, and as pull requests on [GitHub](https://github.com/AI-Yatra/aiyatra.io/pulls).
2. Open the post in the editor to read it as readers will see it. Use the checklist above.
   **Check custom HTML closely.** It runs on the live site, so look at any `Custom HTML` block and any `<script>` or `<iframe>` in the pull request's *Files changed* tab.
3. Leave feedback as comments on the pull request (GitHub → *Files changed* lets you comment on specific lines). The author is emailed automatically.
4. When it's ready, move the card to **Ready** and click **Publish** (or merge the pull request). The site deploys by itself and the post is live within a few minutes.
5. Small fixes such as formatting, typos or the date can be made directly in the editor before publishing. Leave a note on the pull request saying what you changed.
