import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

if (process.argv.includes("dev")) {
  await initOpenNextCloudflareForDev()
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  }
}

export default nextConfig
