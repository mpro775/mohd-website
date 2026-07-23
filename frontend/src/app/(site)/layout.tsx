import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import SplashCursor from "@/components/common/SplashCursor";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SplashCursor 
        DENSITY_DISSIPATION={4}
        PRESSURE={0.6}
        CURL={5}
        SPLAT_RADIUS={0.18}
        COLOR_UPDATE_SPEED={6}
        SHADING={false}
        COLOR="#10B981"
      />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
