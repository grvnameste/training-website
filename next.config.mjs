import { withNextVideo } from "next-video/process";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'kdiafdknsvbutdrkobwi.supabase.co', // 🔥 ADD THIS
      },
    ],
  },
};

export default withNextVideo(nextConfig);