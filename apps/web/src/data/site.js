// AIYatra — site-wide data & links.
// Events, RSVP counts, photos and group stats come from src/data/meetup.json,
// which tools/sync-meetup.js refreshes from https://www.meetup.com/aiyatra/
// every night at 00:00 IST (see .github/workflows/deploy.yml). Hand-written
// card copy lives in src/data/event-notes.js.

import MEETUP from './meetup.json';
import { EVENT_NOTES } from './event-notes';

export const MEETUP_URL = 'https://www.meetup.com/aiyatra/';
export const PAST_EVENTS_URL = 'https://www.meetup.com/aiyatra/events/past/';
// Subscribing to this keeps every new AIYatra session in your own calendar.
export const CALENDAR_FEED_URL = 'webcal://www.meetup.com/aiyatra/events/ical/';
export const CONTACT_EMAIL = 'global.aiyatra@gmail.com';
export const LINKEDIN_URL = 'https://www.linkedin.com/company/aiyatra/';
export const GITHUB_URL = 'https://github.com/AI-Yatra';
export const ADMIN_EMAILS = ['global.aiyatra@gmail.com'];

// Local mark in public/. Prefixed with Vite's BASE_URL ("/" on the custom
// domain) so it resolves on every host.
// A plain "/aiyatra-mark.png" string would 404 under a subpath.
const BASE_URL = import.meta.env.BASE_URL || '/';

// Small copy for on-page use; the full-size mark stays for favicons and link previews.
export const AI_YATRA_LOGO = `${BASE_URL}aiyatra-mark-160.png`;

/* ——— events ——— */

const IST = 'Asia/Kolkata';
const fmtDay = new Intl.DateTimeFormat('en-US', { timeZone: IST, weekday: 'short', month: 'short', day: 'numeric' });
const fmtTime = new Intl.DateTimeFormat('en-US', { timeZone: IST, hour: 'numeric', minute: '2-digit' });
const fmtLong = new Intl.DateTimeFormat('en-US', { timeZone: IST, weekday: 'long', month: 'long', day: 'numeric' });

export const formatDay = (ms) => fmtDay.format(ms);
export const formatTime = (ms) => fmtTime.format(ms);
export const formatLongDay = (ms) => fmtLong.format(ms);

function shorten(title) {
	if (title.length <= 34) return title;
	const head = title.split(/\s*(?::|—|–|\s-\s)\s*/)[0];
	return head.length >= 12 && head.length <= 44 ? head : `${title.slice(0, 40).replace(/\s+\S*$/, '')}…`;
}

function toEvent(raw) {
	const notes = EVENT_NOTES[raw.id] || {};
	const start = Date.parse(raw.start);
	// Meetup omits the end time on some older events; assume a 3-hour session.
	const end = raw.end ? Date.parse(raw.end) : start + 3 * 3600_000;
	const when = `${formatDay(start)} · ${formatTime(start)} – ${formatTime(end)} IST`;
	return {
		id: raw.id,
		title: raw.title,
		shortTitle: notes.shortTitle || shorten(raw.title),
		blurb: notes.blurb || raw.summary || '',
		url: raw.url,
		photo: raw.photo,
		attendees: raw.going ?? 0,
		online: raw.online,
		cancelled: raw.status === 'CANCELLED',
		formUrl: notes.formUrl || raw.formUrl || null,
		rsvpDeadline: notes.rsvpDeadline ? Date.parse(notes.rsvpDeadline) : null,
		start,
		end,
		date: when,
	};
}

// Newest first. Cancelled sessions are dropped everywhere.
export const ALL_EVENTS = MEETUP.events.map(toEvent).filter((e) => !e.cancelled).sort((a, b) => b.start - a.start);

// Status is decided by the clock, not by the last sync, so the moment a
// Saturday session ends the site moves on to the next one by itself.
export const isUpcoming = (e, now = Date.now()) => e.end > now;
export const upcomingEvents = (now = Date.now()) => ALL_EVENTS.filter((e) => isUpcoming(e, now)).sort((a, b) => a.start - b.start);
export const pastEvents = (now = Date.now()) => ALL_EVENTS.filter((e) => !isUpcoming(e, now));
export const nextEvent = (now = Date.now()) => upcomingEvents(now)[0] || null;

export const UPCOMING_EVENTS = upcomingEvents();
export const PAST_EVENTS = pastEvents();
export const NEXT_EVENT = nextEvent();
export const EVENT_URL = NEXT_EVENT?.url || MEETUP_URL;
export const GOOGLE_FORM_URL = NEXT_EVENT?.formUrl || null;
export const SYNCED_AT = MEETUP.syncedAt;

export const GROUP_STATS = {
	members: MEETUP.group?.members ?? 5000,
	// Meetup's own count at sync time, plus any session that has ended since.
	eventsHosted: Math.max(
		(MEETUP.group?.pastEvents ?? 0) + PAST_EVENTS.filter((e) => e.end > Date.parse(MEETUP.syncedAt || 0)).length,
		PAST_EVENTS.length,
	),
	rating: Math.round((MEETUP.group?.rating ?? 4.7) * 10) / 10,
	ratingsCount: MEETUP.group?.ratingsCount ?? 0,
	// City only — the exact venue is shared with RSVPs on Meetup.
	venue: 'Hyderabad',
	city: 'Hyderabad, IN',
	organizer: 'Khaja Moinuddin Mohammed',
};

/** Short "where" line for an event card. */
export function eventPlace(e) {
	if (!e) return '';
	if (e.online) return 'Online';
	return 'Hyderabad';
}

// Real faces from the live group — organizer + recent attendees (meetupstatic avatars)
export const HOST_PHOTO = `${BASE_URL}jagadeeswara-reddy-200.jpg`;
export const MONIKA_PHOTO = `${BASE_URL}monika-kusumanchi-200.jpg`;
export const AMBASSADOR_CREST = `${BASE_URL}ambassador-crest-680.jpg`;

// Downloadable pitch decks (built by presentations/build_decks_v2.py,
// copied to public/decks/ so they ship with the site).
export const DECKS = {
	journey: `${BASE_URL}decks/AIYatra-Journey-From-Start-Till-Now.pptx`,
	ambassador: `${BASE_URL}decks/AIYatra-Student-Ambassador-Program-2026.pptx`,
};

export const COMMUNITY_FACES = [
	{
		name: 'Khaja Moinuddin Mohammed',
		role: 'Super Organizer',
		photo: 'https://secure.meetupstatic.com/photos/member/8/f/d/8/member_325116824.jpeg',
	},
	{
		name: 'Azeez Syed',
		role: 'Co-organizer',
		photo: 'https://secure.meetupstatic.com/photos/member/c/2/6/4/member_323989764.jpeg',
	},
	{
		name: 'AIYatra member',
		role: 'Meetup regular',
		photo: 'https://secure.meetupstatic.com/photos/member/1/3/b/b/member_324665051.jpeg',
	},
	{
		name: 'AIYatra member',
		role: 'Meetup regular',
		photo: 'https://secure.meetupstatic.com/photos/member/5/b/3/f/member_263543359.jpeg',
	},
	{
		name: 'AIYatra member',
		role: 'Meetup regular',
		photo: 'https://secure.meetupstatic.com/photos/member/3/8/0/8/member_324554344.jpeg',
	},
	{
		name: 'AIYatra member',
		role: 'Meetup regular',
		photo: 'https://secure.meetupstatic.com/photos/member/6/8/3/8/member_325946680.jpeg',
	},
];

/** Pre-filled "add to Google Calendar" link for one event. */
export function googleCalendarUrl(e) {
	const stamp = (ms) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
	const params = new URLSearchParams({
		action: 'TEMPLATE',
		text: `AIYatra: ${e.title}`,
		dates: `${stamp(e.start)}/${stamp(e.end)}`,
		details: `RSVP on Meetup: ${e.url}${e.formUrl ? `\nMandatory Google Form: ${e.formUrl}` : ''}`,
		location: e.online ? 'Online' : GROUP_STATS.venue,
	});
	return `https://calendar.google.com/calendar/render?${params}`;
}

/**
 * Responsive, lightweight versions of a Meetup event photo. The synced URLs
 * point at full-size JPEGs (~230 KB); Meetup also serves resized WebP copies
 * (~25–100 KB), so let the browser pick the smallest one that looks sharp.
 */
export function photoProps(url, sizes = '(min-width: 640px) 360px, 82vw') {
	const m = url && url.match(/highres_(\d+)\.(?:jpe?g|png)/i);
	if (!m) return { src: url };
	const base = `https://secure-content.meetupstatic.com/images/classic-events/${m[1]}`;
	return {
		src: `${base}/676x380.webp`,
		srcSet: `${base}/400x225.webp 400w, ${base}/676x380.webp 676w, ${base}/1024x576.webp 1024w`,
		sizes,
	};
}
