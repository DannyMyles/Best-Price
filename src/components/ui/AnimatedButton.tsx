"use client";

import Link from "next/link";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "dark";
const MotionLink = motion.create(Link);

interface Props extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-lg shadow-brand/25 hover:bg-brand/90",
  secondary:
    "bg-surface text-ink border border-border hover:border-brand/40",
  ghost: "bg-transparent text-ink hover:bg-black/5",
  dark: "bg-panel-dark text-white hover:bg-panel-dark-2",
};

export function AnimatedButton({
  children,
  className,
  variant = "primary",
  ...props
}: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors cursor-pointer",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

interface LinkProps {
  href: string;
  variant?: Variant;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  target?: string;
  rel?: string;
}

export function AnimatedLinkButton({
  children,
  className,
  variant = "primary",
  ...props
}: LinkProps) {
  return (
    <MotionLink
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors cursor-pointer",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </MotionLink>
  );
}
