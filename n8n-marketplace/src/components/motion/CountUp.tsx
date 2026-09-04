"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { useEntrance } from "@/components/motion/useEntrance";

interface CountUpProps {
  value: number;
  /** e.g. "+", "k", "%" appended after the number */
  suffix?: string;
  duration?: number;
  className?: string;
}

function format(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

/** Rolls a number from 0 → value the first time it scrolls into view. */
export default function CountUp({
  value,
  suffix = "",
  duration = 1.4,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const shouldAnimate = useEntrance();
  const [display, setDisplay] = useState(shouldAnimate ? 0 : value);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplay(value);
      return;
    }
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, duration, shouldAnimate]);

  return (
    <span ref={ref} className={className}>
      {format(display)}
      {suffix}
    </span>
  );
}
