// Shared with the React app: links, Meetup data and formatters come straight
// from apps/web/src/data/site.js so the two never drift apart.
export {
	MEETUP_URL, PAST_EVENTS_URL, CONTACT_EMAIL, LINKEDIN_URL, GITHUB_URL, GROUP_STATS,
	upcomingEvents, formatDay, formatTime,
} from '../../../web/src/data/site.js';

export const LOGO = '/aiyatra-logo-224.png';
export const SITE_URL = 'https://aiyatra.io';
export const BLOG_BASE = '/blog';
export const EDITOR_URL = '/blog/admin';
export const NEW_POST_URL = '/blog/admin#/collections/blog/new';
export const REPO_URL = 'https://github.com/AI-Yatra/aiyatra.io';
export const GUIDE_URL = '/blog/guide';
export const GUIDE_SOURCE_URL = `${REPO_URL}/blob/main/HOW-TO-WRITE-A-GUEST-POST.md`;

// Same order as the React header (apps/web/src/components/SiteChrome.jsx).
export const NAV_LINKS = [
	{ href: '/#meetups', label: 'Meetups' },
	{ href: '/ambassadors', label: 'Ambassadors' },
	{ href: '/labs', label: 'Research Labs' },
	{ href: '/#community', label: 'Community' },
	{ href: '/blog', label: 'Blog' },
	{ href: '/contact', label: 'Contact Us' },
];

/**
 * Responsive, lightweight versions of a Meetup event photo (mirrors
 * photoProps in apps/web/src/data/site.js). Any other image passes through.
 */
export function photoProps(url: string | undefined, sizes = '(min-width: 640px) 360px, 82vw') {
	const m = url && url.match(/highres_(\d+)\.(?:jpe?g|png)/i);
	if (!m) return { src: url };
	const base = `https://secure-content.meetupstatic.com/images/classic-events/${m[1]}`;
	return {
		src: `${base}/676x380.webp`,
		srcset: `${base}/400x225.webp 400w, ${base}/676x380.webp 676w, ${base}/1024x576.webp 1024w`,
		sizes,
	};
}
