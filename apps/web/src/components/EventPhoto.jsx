import React from 'react';
import { photoProps } from '@/data/site';

/*
 * An event poster shown whole — never cropped, never zoomed.
 *
 * Meetup posters carry text right to the edges, so cropping them (object-cover)
 * cuts off titles and dates. Here the poster is always `object-contain`, so
 * every edge stays visible whatever shape a future poster has. If its shape
 * doesn't match the frame, the spare space is filled with a soft, blurred copy
 * of the same poster instead of empty bars.
 *
 * The frame defaults to 16:9, the shape Meetup event images are published in.
 */
export default function EventPhoto({ url, alt, sizes, eager = false, className = '' }) {
	const props = photoProps(url, sizes);
	return (
		<div className={`relative aspect-video overflow-hidden bg-tone-blue/40 ${className}`}>
			{/* Backdrop: only shows if the poster's shape differs from the frame. */}
			<img
				{...props}
				alt=""
				aria-hidden="true"
				loading={eager ? 'eager' : 'lazy'}
				decoding="async"
				className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl"
			/>
			<img
				{...props}
				alt={alt}
				loading={eager ? 'eager' : 'lazy'}
				decoding="async"
				width="1024"
				height="576"
				className="relative h-full w-full object-contain"
			/>
		</div>
	);
}
