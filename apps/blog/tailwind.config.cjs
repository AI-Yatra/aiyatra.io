// The AI Yatra palette, kept in step with apps/web/tailwind.config.js. The
// CSS variables themselves come from apps/web/src/index.css, which the blog
// imports as-is, so a colour change there reaches both apps.
/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,md,mdx,js,ts}'],
	theme: {
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				paper: 'hsl(var(--paper) / <alpha-value>)',
				'paper-soft': 'hsl(var(--paper-soft) / <alpha-value>)',
				ink: 'hsl(var(--ink) / <alpha-value>)',
				'ink-soft': 'hsl(var(--ink-soft) / <alpha-value>)',
				'tone-blue': 'hsl(var(--tone-blue) / <alpha-value>)',
				'tone-blue-deep': 'hsl(var(--tone-blue-deep) / <alpha-value>)',
				'tone-green': 'hsl(var(--tone-green) / <alpha-value>)',
				'tone-yellow': 'hsl(var(--tone-yellow) / <alpha-value>)',
				'tone-coral': 'hsl(var(--tone-coral) / <alpha-value>)',
				'tone-violet': 'hsl(var(--tone-violet) / <alpha-value>)',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
		},
	},
	plugins: [],
};
