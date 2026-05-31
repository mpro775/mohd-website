import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "border border-border bg-card text-foreground hover:border-primary/50",
  ghost: "text-muted-foreground hover:text-foreground",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      className={cn("inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition disabled:opacity-60", variants[variant], className)}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  children,
  className,
  variant = "primary",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode; variant?: keyof typeof variants }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition", variants[variant], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
