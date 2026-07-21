import type { NextConfig } from "next";
import path from "path";

const configuredMediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL;
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];
if (configuredMediaUrl) {
  const media = new URL(configuredMediaUrl);
  remotePatterns.push({ protocol: media.protocol.replace(":", "") as "http" | "https", hostname: media.hostname, port: media.port, pathname: `${media.pathname.replace(/\/$/, "")}/**` });
}

const nextConfig: NextConfig = { turbopack: { root: path.resolve(".") }, images: { remotePatterns } };
export default nextConfig;
