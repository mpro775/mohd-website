import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mohd Developer Portfolio",
    short_name: "Mohd.dev",
    description: "موقع شخصي تقني لمبرمج Full-Stack.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0f14",
    theme_color: "#37d399",
  };
}
