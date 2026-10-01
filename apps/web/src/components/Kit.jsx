import React from 'react';
import { Link } from 'react-router-dom';

export function SectionLabel({ n, children, light = false }) {
	return (
		<p className={`inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] ${light ? 'text-[hsl(199_89%_70%)]' : 'text-tone-blue-deep'}`}>
			{n && <span className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 font-display text-[12px] tracking-normal ${light ? 'bg-white/10 text-white' : 'bg-tone-blue text-tone-blue-deep'}`}>{n}</span>}
			{children}
		</p>
	);
}

export function PrimaryButton({ href, to, children, className = '', ...rest }) {
	const cls = `active-press group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-tone-blue-deep px-6 text-[15px] font-semibold text-white shadow-[0_14px_34px_-12px_hsl(221_83%_53%/0.8)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-12px_hsl(221_83%_53%/0.9)] ${className}`;
	const inner = (
		<>
			<span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
			<span className="relative inline-flex items-center gap-2">{children}</span>
		</>
	);
	if (to) return <Link to={to} className={cls} {...rest}>{inner}</Link>;
	return <a href={href} className={cls} {...rest}>{inner}</a>;
}

export function GhostButton({ href, to, children, className = '', light = false, ...rest }) {
	const cls = `active-press inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-[15px] font-semibold transition-all hover:-translate-y-0.5 ${light ? 'border-white/25 text-white hover:border-white hover:bg-white hover:text-ink' : 'border-tone-blue-deep/20 bg-white text-ink hover:border-tone-blue-deep hover:text-tone-blue-deep'} ${className}`;
	if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
	return <a href={href} className={cls} {...rest}>{children}</a>;
}
