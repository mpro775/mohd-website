import type { NextConfig } from "next";
import path from "path";

const remotePatterns: NonNullable<
  NextConfig["images"]
>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "pub-14c8ad19cc8d4cd098ad127e8cb179b8.r2.dev",
    port: "",
    pathname: "/**",
  },
];

const configuredMediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL;

if (configuredMediaUrl) {
  const media = new URL(configuredMediaUrl);

  const alreadyConfigured = remotePatterns.some(
    (pattern) =>
      pattern.hostname === media.hostname &&
      pattern.protocol === media.protocol.replace(":", ""),
  );

  if (!alreadyConfigured) {
    remotePatterns.push({
      protocol: media.protocol.replace(":",
      "") as "http" | "https",
      hostname: media.hostname,
      port: media.port,
      pathname: `${media.pathname.replace(/\/$/, "")}/**`,
    });
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve("."),
  },

  images: {
    remotePatterns,
    qualities: [75],
  },
};

export default nextConfig;