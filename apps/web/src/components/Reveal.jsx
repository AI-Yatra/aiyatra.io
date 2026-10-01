import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Where an element flows in from. `y` (legacy prop) still works for "up".
const OFFSETS = {
    up: (d) => ({ y: d }),
    down: (d) => ({ y: -d }),
    left: (d) => ({ x: -d }),
    right: (d) => ({ x: d }),
    zoom: () => ({ scale: 0.9 }),
};

const Reveal = ({ children, delay = 0, y = 24, from = 'up', distance, className = '', as = 'div', once = true, ...rest }) => {
    const reduceMotion = useReducedMotion();
    const MotionTag = motion[as] || motion.div;
    // `delay` is in seconds (framer-motion's unit), but callers often pass the
    // milliseconds they'd use with a CSS transition. No reveal waits 10s, so a
    // value that large is milliseconds — convert rather than hang the content.
    const delaySeconds = delay > 10 ? delay / 1000 : delay;
    const offset = reduceMotion ? {} : (OFFSETS[from] || OFFSETS.up)(distance ?? (from === 'up' ? Math.min(y, 24) : 40));

    return (
        <MotionTag
            className={className}
            initial={{ opacity: 0, ...offset }}
            whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            // Start ~150px before the element scrolls in, so a fast scroll never
            // lands on blank space waiting for an animation to begin.
            viewport={{ once, margin: '0px 0px 150px 0px' }}
            transition={{ duration: 0.55, delay: Math.min(delaySeconds, 0.25), ease: [0.22, 1, 0.36, 1] }}
            {...rest}
        >
            {children}
        </MotionTag>
    );
}

export default Reveal;

export { Reveal };
