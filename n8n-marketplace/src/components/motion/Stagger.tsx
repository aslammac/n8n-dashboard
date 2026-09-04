"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { useEntrance } from "@/components/motion/useEntrance";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

type Props = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: React.ReactNode;
};

/** Wrap a list; each <StaggerItem> child animates in sequence when scrolled into view. */
export function Stagger({ children, className, ...rest }: Props) {
  const animate = useEntrance();
  if (!animate) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-8%" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, ...rest }: Props) {
  const animate = useEntrance();
  if (!animate) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={item} {...rest}>
      {children}
    </motion.div>
  );
}
