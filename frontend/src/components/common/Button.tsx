import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import StarBorder from "./StarBorder";
const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_4px_16px_-4px_rgba(55,211,153,0.3)]",
  secondary: "border border-border bg-card text-foreground hover:border-primary/50 hover:shadow-[0_4px_16px_-4px_rgba(55,211,153,0.1)]",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-muted/30",
  danger: "bg-red-500 text-white hover:bg-red-600 hover:shadow-[0_4px_16px_-4px_rgba(255,107,107,0.3)]",
  terminal: "relative overflow-hidden border border-primary/30 bg-[#071019] font-mono text-primary hover:bg-primary/10 hover:border-primary/50 hover:shadow-[0_4px_16px_-4px_rgba(55,211,153,0.15)]",
  glow: "relative bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow",
};

const sizes = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const containerClasses = cn(
    "inline-flex items-center justify-center rounded-md transition-all duration-200 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    className
  );
  const innerClasses = cn(
    "w-full h-full font-semibold rounded-[inherit]",
    variants[variant],
    sizes[size]
  );

  return (
    <StarBorder
      as="button"
      className={containerClasses}
      innerClassName={innerClasses}
      {...props}
    />
  );
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function LinkButton({
  href,
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: LinkButtonProps) {
  const containerClasses = cn(
    "inline-flex items-center justify-center rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    className
  );
  const innerClasses = cn(
    "w-full h-full font-semibold rounded-[inherit]",
    variants[variant],
    sizes[size]
  );

  return (
    <StarBorder
      as={Link}
      href={href}
      className={containerClasses}
      innerClassName={innerClasses}
      {...props}
    >
      {children}
    </StarBorder>
  );
}
