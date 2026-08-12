import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  secondary:
    "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700",
  ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};

export function buttonClasses(variant: Variant = "primary", className?: string): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    className,
  );
}

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  variant?: Variant;
}

export function Button({ href, variant, className, children, ...props }: ButtonProps) {
  const cls = buttonClasses(variant, className);
  if (href) {
    return (
      <Link href={href} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a className={cls} {...props}>
      {children}
    </a>
  );
}