"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
};

function seededValue(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function FloatingParticles({
  count = 20,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const particles: Particle[] = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: seededValue(i + 1) * 100,
      y: seededValue(i + 101) * 100,
      size: seededValue(i + 201) * 3 + 1,
      duration: seededValue(i + 301) * 8 + 6,
      delay: seededValue(i + 401) * 4,
    }));
  }, [count]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ""}`}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background:
              p.id % 3 === 0
                ? "rgba(55, 211, 153, 0.35)"
                : p.id % 3 === 1
                  ? "rgba(138, 180, 248, 0.25)"
                  : "rgba(247, 201, 72, 0.2)",
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, p.id % 2 === 0 ? 15 : -15, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
