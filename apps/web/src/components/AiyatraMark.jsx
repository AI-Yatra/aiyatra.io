import React from 'react';
import { AI_YATRA_LOGO } from '@/data/site';

/**
 * The AIYatra logo used as a mark in place of generic icons. The source asset
 * is a white square, so mix-blend-multiply makes the white melt into whatever
 * surface the mark sits on (cream paper or the dark ink sections).
 */
function AiyatraMark({ className = '', imgClassName = '' }) {
	return (
		<span
			className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
		>
			<img
				src={AI_YATRA_LOGO}
				alt=""
				aria-hidden="true"
				className={`h-full w-full object-cover mix-blend-multiply ${imgClassName}`}
				loading="lazy"
			/>
		</span>
	);
}

export default AiyatraMark;
export { AiyatraMark };
