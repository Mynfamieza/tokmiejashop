import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Product image uploads go through a Server Action (max 5 MB image).
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    // Product images are served from Supabase Storage. Add other hosts here
    // if you later host product photography elsewhere.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
  },
};

export default nextConfig;
