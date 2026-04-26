import type { NextConfig } from "next";

const allowedDevOrigins: string[] = [];
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (baseUrl) {
  try {
    allowedDevOrigins.push(new URL(baseUrl).host);
  } catch {
    // Ignore malformed URLs in local env values.
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins,
};

export default nextConfig;
