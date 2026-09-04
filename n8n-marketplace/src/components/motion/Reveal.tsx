"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { useEntrance } from "@/components/motion/useEntrance";

type RevealProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: React.ReactNode;
  /** seconds to delay the entrance */
  delay?: number;
  /** px to travel on the y axis */
  y?: number;
};

/**
 * Fades + rises its children into view once. Renders a plain div (no transform)
 * when the user prefers reduced motion or the tab loaded in the background.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 12,
  className,
  ...rest
}: RevealProps) {
  const animate = useEntrance();

  if (!animate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
