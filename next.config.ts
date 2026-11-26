import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Hadith search reads its index and the chapter files (for snippets) at request time.
  outputFileTracingIncludes: {
    "/api/search/hadith": ["./src/data/hadith-search/**", "./src/data/hadith/**"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
