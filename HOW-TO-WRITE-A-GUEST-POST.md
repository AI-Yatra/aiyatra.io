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

The editor has two halves: the form on the left and a **live preview** on the right that shows your post exactly as it will appear on aiyatra.io. Keep an eye on the preview as you go.

Fill in the fields from top to bottom:

| Field | Required? | What to put in it | Avoid |
| --- | --- | --- | --- |
| **Title** | Yes | A clear, specific title, e.g. "Fine-tuning Gemma on a single GPU with LoRA" | Clickbait, ALL CAPS, a trailing full stop |
| **Short summary** | Yes | One or two plain sentences (under ~200 characters) saying what the reader will learn. Shown on blog cards, in Google results and in link previews | Markdown, links, or repeating the title |
| **Category** | Yes | **Guest post** (already selected). Pick **Tutorial** or **Research notes** if your post is clearly one of those | **Session recap**, which is reserved for the AIYatra team |
| **Your name** | Yes | Your name as you want it shown on the post | Usernames or handles |
| **About you** | No | One line, e.g. "ML engineer at Acme · AIYatra Student Ambassador" | A full biography. Keep it to one or two lines |
| **Your link** | No | One full URL to your LinkedIn, GitHub or website, starting with `https://` | A link without `https://` (the editor will refuse it) |
| **Your photo** | No | A square photo of you, at least 200 × 200 px. Upload it or click **Insert from URL** | Logos, group photos, or very large files |
| **Publish date** | Yes | Today's date. The reviewer may change it to the actual publish day | Dates in the future or the past |
| **Cover image** | Recommended | A wide image (16:9, ideally 1600 × 900 px, JPG or WebP, under 500 KB) | Images with lots of small text, or images you don't have the right to use |
| **Cover image description** | Yes, if you add a cover | Describe the image for people who can't see it, e.g. "Five students pair-programming around a table" | "image", "cover", or leaving it empty |
| **Tags** | Recommended | 3–6 short topics separated by commas, e.g. `RAG, embeddings, PyTorch` | Long phrases, or more than 6 tags |
| **Meetup event link** | **Leave empty** | Only for AIYatra session recaps | Pasting the AIYatra Meetup page here. It adds a "The Meetup event" link to your post |
| **Attendees** | **Leave empty** | Only for AIYatra session recaps | Any number |
| **Post** | Yes | The body of your post. See the next step | |

> **Choose your title before you first save.** The post's web address (for example `aiyatra.io/blog/fine-tuning-gemma-with-lora`) is created from the title when you first save, and it does not change if you edit the title later.

## Step 3: Write the body

### Rich Text or Markdown: pick one mode

The **Post** box has two writing modes. You switch between them with the **toggle switch** in the top-right corner of the box, between the words **Rich Text** and **Markdown**. Click the switch itself; clicking the words does nothing.

- **Rich Text** (the default) works like Google Docs: select text and use the toolbar buttons. Best for most people.
- **Markdown** shows the raw text with symbols like `##` and `**`. Use it if you already write Markdown, and **always use it for tables**.

You can switch back and forth without losing anything. One rule matters:

> **Never type Markdown symbols in Rich Text mode.** If you type `## My heading` or `| a | b |` in Rich Text mode, those symbols appear literally on the published page. If you see `##`, `**` or `|` in the preview, switch to Markdown mode and fix it there, or remove the symbols and use the toolbar instead.

### The toolbar

| Button | Use it for | Tips |
| --- | --- | --- |
| **B** (Bold) | Key terms and short emphasis | Don't bold whole paragraphs, and **never use bold as a heading** |
| *I* (Italic) | Titles of papers or books, light emphasis | |
| ~~S~~ (Strikethrough) | Rarely needed | |
| `<>` (Code) | Inline code: function names, file names, commands such as `pip install` | For more than one line, use a Code Block (below) |
| Link | Turning selected text into a link | Link descriptive words ("the EmbeddingGemma model card"), not "click here". Always use full `https://` URLs |
| **H** (Headings) | Section titles | See *Headings* below |
| Quote | Quoting a person, a paper or a question | Not for notes or warnings you wrote yourself |
| Bulleted List | Items in no particular order | Keep items parallel and short |
| Numbered List | Steps in order | |
| **+** (Add Component) | Inserting a **Code Block** or an **Image** | See below |

### Headings

Headings give your post its structure and its table of contents. They are the most common thing guest posts get wrong.

- **Use Heading 2 for your main sections** (e.g. "Why it matters", "How it works", "Results").
- **Use Heading 3 for sub-sections** inside a Heading 2.
- **Never use Heading 1.** The post title is already the Heading 1 of the page.
- **Don't use bold text as a heading.** It looks like a heading in your draft but loses the heading style and structure on the site.
- **Don't skip levels.** A Heading 3 always sits under a Heading 2.

To make a heading in Rich Text mode: put the cursor on the line, click **H**, and pick **Heading 2** or **Heading 3**.

### Code blocks

For anything longer than a single line of code:

1. Click **+** (Add Component) and choose **Code Block**.
2. Pick the language (for example Python or Bash). This switches on syntax colouring.
3. Paste your code inside the block.

**Only code goes in code blocks.** Tables, lists or normal text inside a code block show up as a dark box of raw characters.

Don't use screenshots of code. Readers can't copy them, and search engines can't read them.

### Images inside the post

1. Click **+** (Add Component) and choose **Image**.
2. Upload an image or click **Insert from URL**.
3. Fill in the **Alt text**: one sentence describing what the image shows. Screen readers read it aloud, and it appears if the image fails to load.

Keep images under about 500 KB (JPG or WebP for photos, PNG for diagrams). Use images only if you made them or have the right to share them, and credit the source in a line below the image.

### Tables

The editor has no table button, so tables are written in **Markdown mode**:

1. Switch the **Post** box to **Markdown** with the toggle switch.
2. Leave an empty line before and after the table, and write it like this:

```markdown
| Model | Parameters | Licence |
| --- | --- | --- |
| EmbeddingGemma 2 | 270M–740M | Apache 2.0 |
| BGE-M3 | 568M | MIT |
```

3. Check the preview on the right. You should see a proper table with a shaded header row.

The first row is the header, and the `| --- |` row underneath it is required. Every row needs the same number of `|` columns. **Don't put a table inside a code block**, or it shows as raw text. After adding a table you can switch back to Rich Text, but edit the table itself only in Markdown mode.

### Pasting from Google Docs, Word or an AI assistant

- **From Google Docs or Word:** paste into **Rich Text** mode. Afterwards, check that your section titles became real headings (headings pasted as bold or large text need re-applying with the **H** button), and delete any extra empty lines.
- **From a Markdown file, Notion, ChatGPT or similar:** switch to **Markdown** mode first, then paste. Pasting Markdown into Rich Text mode makes all the `#`, `*` and `|` symbols appear literally.
- If you used an AI assistant to help you write, check every fact, number and link yourself. You are the author, and your name is on the post.

## Step 4: Preview and save

- The **preview** on the right updates as you type and uses the site's real styling. If something looks wrong there, it will look wrong on the site.
- Click **Save** at the top whenever you want to keep your progress. Your draft is stored in your fork, and you can close the browser and come back later.
- To find your drafts again, open [aiyatra.io/blog/admin](https://aiyatra.io/blog/admin) and go to the **Workflow** tab.

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

- [ ] The title is clear and was set before the first save
- [ ] The **Short summary** is one or two plain sentences
- [ ] **Category** is Guest post (or Tutorial or Research notes)
- [ ] Your name is filled in. **Your link** starts with `https://`
- [ ] The cover image is wide (16:9), and its description is filled in
- [ ] **Meetup event link** and **Attendees** are empty
- [ ] Sections use **Heading 2**, sub-sections **Heading 3**. No Heading 1, no bold-as-heading
- [ ] Code is in **Code Blocks** with a language picked. No tables or prose in code blocks
- [ ] Tables were written in **Markdown** mode and look like tables in the preview
- [ ] No stray `##`, `**` or `|` symbols in the preview
- [ ] Every image has alt text and you have the right to use it
- [ ] All links work and use `https://`
- [ ] You read the whole post once more in the preview

## Common mistakes and how to fix them

| You see this in the preview | Why | Fix |
| --- | --- | --- |
| `## Heading` or `**bold**` appearing as text | Markdown was typed or pasted in Rich Text mode | Switch to Markdown mode and check the symbols, or delete them and use the toolbar |
| A dark box full of `\|` characters | A table was put inside a code block | Remove the code block and paste the table in Markdown mode |
| Section titles look like normal bold text | Bold was used instead of a heading | Select the line and choose **Heading 2** from the **H** button |
| A huge heading inside the post | Heading 1 was used | Change it to **Heading 2** |
| A "The Meetup event" link under the title | **Meetup event link** is filled in | Empty that field |
| Code without colours | The Code Block has no language | Open the block and pick a language |
| Big gaps between paragraphs | Extra empty lines from pasting | Delete the empty lines |
| The cover is cropped badly | The image isn't 16:9 | Use a wide image, ideally 1600 × 900 px |

## Markdown cheat sheet

Only needed if you write in Markdown mode.

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
Yes. Put both names in **Your name** (for example "Asha Rao & Vikram Iyer") and mention both in **About you**. One of you submits the post.

**Can I delete a draft?**
Yes. Open it in the editor and choose **Delete unpublished entry** from the menu at the top.

**Can I change the web address of my post?**
Not from the editor. If you need a different address, mention it on your pull request and the reviewer will change it.

**My post was published elsewhere first. Can I submit it?**
Yes, if you own it. Say where it first appeared at the end of the post, and mention it on the pull request.

**Who owns my post?**
You keep the credit. Your name, photo and link appear on the post.

## For reviewers (AIYatra team)

1. New submissions appear in [aiyatra.io/blog/admin](https://aiyatra.io/blog/admin) under the **Workflow** tab in the **In review** column, and as pull requests on [GitHub](https://github.com/AI-Yatra/aiyatra.io/pulls).
2. Open the post in the editor to read it with the live preview. Use the checklist above.
3. Leave feedback as comments on the pull request (GitHub → *Files changed* lets you comment on specific lines). The author is emailed automatically.
4. When it's ready, move the card to **Ready** and click **Publish** (or merge the pull request). The site deploys by itself and the post is live within a few minutes.
5. Small fixes such as formatting, typos or the date can be made directly in the editor before publishing. Leave a note on the pull request saying what you changed.
