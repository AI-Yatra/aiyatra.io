import { useEffect, useState } from 'react';
import { nextEvent, pastEvents } from '@/data/site';

/** Current time, refreshed every `interval` ms. */
export function useNow(interval = 60_000) {
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), interval);
		return () => clearInterval(id);
	}, [interval]);
	return now;
}

/**
 * The next (or currently running) session and the archive, recomputed every
 * minute — a page left open on Saturday rolls over to the following event by
 * itself once the session ends.
 */
export function useEvents() {
	const now = useNow();
	const next = nextEvent(now);
	return { now, next, live: Boolean(next && next.start <= now), past: pastEvents(now) };
}
