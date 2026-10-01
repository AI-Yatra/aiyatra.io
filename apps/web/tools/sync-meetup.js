#!/usr/bin/env node
// Pulls AIYatra's events and group stats from Meetup into src/data/meetup.json.
//
// Runs daily from .github/workflows/deploy.yml (00:00 IST) and before every
// build. Sources, in order of preference:
//   1. The public events page, which embeds Meetup's own Apollo cache as
//      JSON: upcoming events plus the ~10 most recent past ones, with titles,
//      times, RSVP counts, photos and group stats. (/events/past/
//      needs a login, so older history lives on in meetup.json itself.)
//   2. The public iCal feed, as a fallback for upcoming events if the page
//      markup ever changes.
// Events already in meetup.json are kept (the archive only grows). If Meetup
// can't be reached the existing file is left untouched, so a build never
// breaks because of a sync.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GROUP = 'aiyatra';
const BASE = `https://www.meetup.com/${GROUP}`;
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'meetup.json');
const UA = 'Mozilla/5.0 (compatible; AIYatraSiteSync/1.0; +https://aiyatra.io)';

async function get(url) {
	const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html,text/calendar,*/*' } });
	if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
	return res.text();
}

/* ——— helpers ——— */

function plainSummary(markdown = '') {
	const paragraphs = markdown
		.replace(/\r/g, '')
		.split(/\n{2,}/)
		.map((p) => p
			.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
			.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
			.replace(/[*_`#>]+/g, '')
			.replace(/\\([|\\])/g, '$1')
			.replace(/\s+/g, ' ')
			.trim())
		.filter((p) => p && !/mandatory|google form|forms\.gle|^note\b/i.test(p) && !/^[-•]/.test(p));
	const text = paragraphs.slice(0, 2).join(' ');
	if (text.length <= 280) return text;
	const cut = text.slice(0, 280);
	const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
	return end > 120 ? cut.slice(0, end + 1) : `${cut.replace(/\s+\S*$/, '')}…`;
}

function formUrl(markdown = '') {
	const m = markdown.match(/https?:\/\/(?:forms\.gle|docs\.google\.com\/forms)\/[^\s)\]]+/i);
	return m ? m[0].replace(/[.,]+$/, '') : null;
}

/* ——— source 1: the events pages' embedded Apollo state ——— */

function parseApollo(html) {
	const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
	if (!m) throw new Error('No __NEXT_DATA__ on page');
	const state = JSON.parse(m[1])?.props?.pageProps?.__APOLLO_STATE__;
	if (!state) throw new Error('No Apollo state on page');
	const deref = (v) => (v && v.__ref ? state[v.__ref] : v);

	const events = Object.entries(state)
		.filter(([k]) => k.startsWith('Event:'))
		.map(([, e]) => {
			const photo = deref(e.featuredEventPhoto) || deref(e.displayPhoto);
			return {
				id: String(e.id),
				title: e.title,
				url: e.eventUrl,
				start: e.dateTime,
				end: e.endTime || null,
				going: e.going?.totalCount ?? e['rsvps({"first":5})']?.totalCount ?? null,
				photo: photo?.highResUrl || null,
				online: Boolean(e.isOnline),
				status: e.status || 'ACTIVE',
				formUrl: formUrl(e.description),
				summary: plainSummary(e.description),
			};
		});

	const groupKey = Object.keys(state).find((k) => k.startsWith('Group:') && state[k].urlname === GROUP);
	const stats = groupKey ? state[groupKey].stats : null;
	const pastKey = groupKey && Object.keys(state[groupKey]).find((k) => k.startsWith('events(') && k.includes('"status":["PAST"]'));
	const group = stats ? {
		members: stats.memberCounts?.all ?? null,
		rating: stats.eventRatings?.average ?? null,
		ratingsCount: stats.eventRatings?.total ?? null,
		pastEvents: pastKey ? state[groupKey][pastKey]?.totalCount ?? null : null,
	} : null;

	return { events, group };
}

/* ——— source 2: iCal fallback (upcoming only) ——— */

function parseIcal(text) {
	const unfolded = text.replace(/\r?\n[ \t]/g, '');
	const blocks = unfolded.split('BEGIN:VEVENT').slice(1);
	const unescape = (s = '') => s.replace(/\\n/g, '\n').replace(/\\([,;\\])/g, '$1');
	const toIso = (v) => {
		const m = v.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?/);
		if (!m) return null;
		const [, y, mo, d, h, mi, s, z] = m;
		return `${y}-${mo}-${d}T${h}:${mi}:${s}${z ? 'Z' : '+05:30'}`;
	};
	return blocks.map((b) => {
		const field = (name) => {
			const m = b.match(new RegExp(`^${name}[^:\\n]*:(.*)$`, 'm'));
			return m ? m[1].trim() : '';
		};
		const id = (field('UID').match(/event_(\d+)/) || [])[1];
		const description = unescape(field('DESCRIPTION')).replace(/^AIYatra\n/, '');
		return id && {
			id,
			title: unescape(field('SUMMARY')),
			url: field('URL') || `${BASE}/events/${id}/`,
			start: toIso(field('DTSTART')),
			end: toIso(field('DTEND')),
			going: null,
			photo: null,
			online: false,
			status: 'ACTIVE',
			formUrl: formUrl(description),
			summary: plainSummary(description),
		};
	}).filter(Boolean);
}

/* ——— merge + write ——— */

function readExisting() {
	try {
		return JSON.parse(fs.readFileSync(OUT, 'utf8'));
	} catch {
		return { syncedAt: null, group: {}, events: [] };
	}
}

function mergeEvent(prev, next) {
	if (!prev) return next;
	const merged = { ...prev };
	for (const [k, v] of Object.entries(next)) {
		// Never let a thinner source (iCal) blank out richer data we already have.
		if (v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)) merged[k] = v;
	}
	return merged;
}

async function main() {
	const existing = readExisting();
	const found = [];
	let group = null;
	const errors = [];

	for (const page of [`${BASE}/events/`]) {
		try {
			const parsed = parseApollo(await get(page));
			found.push(...parsed.events);
			group = group || parsed.group;
		} catch (err) {
			errors.push(err.message);
		}
	}

	if (!found.some((e) => Date.parse(e.start) > Date.now())) {
		try {
			found.push(...parseIcal(await get(`${BASE}/events/ical/`)));
		} catch (err) {
			errors.push(err.message);
		}
	}

	if (!found.length && !group) {
		console.warn(`[sync-meetup] Meetup unreachable, keeping existing data.\n  ${errors.join('\n  ')}`);
		return;
	}
	if (errors.length) console.warn(`[sync-meetup] Partial sync:\n  ${errors.join('\n  ')}`);

	const byId = new Map(existing.events.map((e) => [e.id, e]));
	for (const e of found) byId.set(e.id, mergeEvent(byId.get(e.id), e));
	const events = [...byId.values()].sort((a, b) => Date.parse(b.start) - Date.parse(a.start));
	const nextGroup = { ...existing.group, ...(group || {}) };

	const changed = JSON.stringify({ events, group: nextGroup }) !== JSON.stringify({ events: existing.events, group: existing.group });
	if (!changed) {
		console.log(`[sync-meetup] No changes (${events.length} events).`);
		return;
	}
	const out = { syncedAt: new Date().toISOString(), source: `${BASE}/events/`, group: nextGroup, events };
	fs.writeFileSync(OUT, `${JSON.stringify(out, null, '\t')}\n`);
	const upcoming = events.filter((e) => e.status !== 'CANCELLED' && Date.parse(e.end || e.start) > Date.now());
	console.log(`[sync-meetup] Wrote ${events.length} events (${upcoming.length} upcoming), ${nextGroup.members ?? '?'} members.`);
}

main().catch((err) => {
	// A sync problem must never fail the build — the last good data still ships.
	console.warn(`[sync-meetup] ${err.stack || err}`);
});
