import Image from "next/image";
import type { Technology } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function TechnologyIcon({
  technology,
  className = "object-contain p-2",
  fallbackClassName = "font-mono text-xs font-bold",
}: {
  technology: Technology;
  className?: string;
  fallbackClassName?: string;
}) {
  const src = technology.iconMedia?.url ?? technology.icon;

  if (!src) {
    return (
      <span className={fallbackClassName}>
        {technology.name.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={technology.name}
      fill
      unoptimized
      className={className}
    />
  );
}
