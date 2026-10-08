import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Fields mirror the Decap CMS form in public/cms/config.yml — change both together.
export const CATEGORIES = ['Session recap', 'Guest post', 'Tutorial', 'Research notes', 'Community'] as const;

// Decap writes an emptied optional field as "" (or null); treat that as unset.
const blank = (v: unknown) => (v === '' || v === null ? undefined : v);
const optional = <T extends z.ZodTypeAny>(schema: T) => z.preprocess(blank, schema.optional());

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		excerpt: z.string(),
		cover: optional(z.string()),
		coverAlt: optional(z.string()),
		category: z.enum(CATEGORIES).default('Session recap'),
		tags: z.preprocess((v) => blank(v) ?? [], z.array(z.string())),
		author: z.string().default('AIYatra Team'),
		authorRole: optional(z.string()),
		authorAvatar: optional(z.string()),
		authorUrl: optional(z.string().url()),
		eventUrl: optional(z.string().url()),
		attendees: optional(z.coerce.number()),
	}),
});

// The guest-post guide lives at the repo root (HOW-TO-WRITE-A-GUEST-POST.md)
// so it reads well on GitHub too; /blog/guide renders that same file.
const guide = defineCollection({
	loader: glob({ base: '../..', pattern: 'HOW-TO-WRITE-A-GUEST-POST.md' }),
});

export const collections = { blog, guide };
