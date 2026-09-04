"use client";

import React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

type Props = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: React.ReactNode;
};

/** Small lift + settle on hover/press. No-op under reduced motion. */
export default function HoverLift({ children, className, ...rest }: Props) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
