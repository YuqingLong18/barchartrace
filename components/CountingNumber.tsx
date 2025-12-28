'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useSpring, useMotionValue } from 'framer-motion';

interface CountingNumberProps {
    value: number;
}

export function CountingNumber({ value }: CountingNumberProps) {
    // Use a motion value to track the number state
    const numberMotionValue = useMotionValue(value);

    // Use a spring to animate updates to the motion value
    // Stiffness and damping control the "electricity meter" rolling feel.
    // We want it snappy but smooth.
    const springValue = useSpring(numberMotionValue, {
        stiffness: 50,
        damping: 15, // Critical damping-ish to avoid overshooting too much
        mass: 1
    });

    // Ref to the text element to updated it directly (perf optimization)
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        numberMotionValue.set(value);
    }, [value, numberMotionValue]);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            if (ref.current) {
                // Format logic duplicated here, or we can pass a formatter prop.
                // For now, let's keep it simple with standard compact notation.
                ref.current.textContent = new Intl.NumberFormat('en-US', {
                    notation: "compact",
                    maximumFractionDigits: 1
                }).format(latest);
            }
        });
    }, [springValue]);

    return <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }} />;
}
