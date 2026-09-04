"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Whether scroll/mount entrance animations should play.
 *
 * Returns false during SSR and the first client render so the markup always
 * hydrates in its final, visible state (no opacity:0 baked into SSR HTML, no
 * hydration mismatch). After mount it flips to true only when the tab is
 * actually visible and the user hasn't asked for reduced motion — opening a
 * link in a background tab throttles requestAnimationFrame, which would
 * otherwise freeze framer-motion mid-transition and leave content invisible.
 */
export function useEntrance(): boolean {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduce) {
      setReady(false);
      return;
    }
    const sync = () => setReady(document.visibilityState === "visible");
    sync();
    if (document.visibilityState !== "visible") {
      document.addEventListener("visibilitychange", sync);
      return () => document.removeEventListener("visibilitychange", sync);
    }
  }, [reduce]);

  return ready;
}
