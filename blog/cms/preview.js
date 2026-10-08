// Live preview for Decap CMS: renders a post the way /blog/<slug> shows it.
// Styles come from preview.css (loaded inside the preview iframe).
/* global CMS, h */
(function () {
	CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
	CMS.registerPreviewStyle('/blog/cms/preview.css');

	var fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

	function formatDate(value) {
		if (!value) return '';
		var d = value instanceof Date ? value : new Date(value);
		return isNaN(d) ? String(value) : fmt.format(d);
	}

	function initials(name) {
		return String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join('');
	}

	function PostPreview(props) {
		var entry = props.entry;
		var get = function (k) { return entry.getIn(['data', k]); };
		var title = get('title') || 'Untitled post';
		var category = get('category') || 'Guest post';
		var author = get('author') || 'Your name';
		var cover = get('cover');
		var coverSrc = cover ? props.getAsset(cover) : null;
		var avatar = get('authorAvatar');
		var avatarSrc = avatar ? props.getAsset(avatar) : null;
		var tags = (get('tags') && get('tags').toJS ? get('tags').toJS() : []).filter(Boolean);
		var attendees = get('attendees');

		return h('div', { className: 'pv' },
			h('header', { className: 'pv-head' },
				h('span', { className: 'pv-pill' }, category),
				h('h1', { className: 'pv-title' }, title),
				h('p', { className: 'pv-meta' },
					author, ' · ', formatDate(get('date')),
					attendees ? ' · ' + attendees + ' attended' : ''
				),
				get('excerpt') ? h('p', { className: 'pv-excerpt' }, get('excerpt')) : null
			),
			h('div', { className: 'pv-band' },
				coverSrc ? h('img', { className: 'pv-cover', src: coverSrc.toString(), alt: get('coverAlt') || '' }) : null,
				h('article', { className: 'blog-body pv-article' }, props.widgetFor('body')),
				tags.length ? h('p', { className: 'pv-tags' }, tags.map(function (t) { return h('span', { key: t }, '#' + t); })) : null,
				category !== 'Session recap'
					? h('div', { className: 'pv-author' },
						avatarSrc ? h('img', { src: avatarSrc.toString(), alt: '' }) : h('span', { className: 'pv-initials' }, initials(author)),
						h('div', null,
							h('p', { className: 'pv-label' }, 'Written by'),
							h('p', { className: 'pv-name' }, author),
							get('authorRole') ? h('p', { className: 'pv-role' }, get('authorRole')) : null
						)
					)
					: null
			)
		);
	}

	CMS.registerPreviewTemplate('blog', PostPreview);
})();
