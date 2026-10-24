import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "bcryptjs", "jsonwebtoken"],
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
