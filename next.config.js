/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["firebasestorage.googleapis.com", "lh3.googleusercontent.com"],
  },
  // Ensure server-only code doesn't leak to the client
  experimental: {
    // Keep firebase-admin as an external package
    serverComponentsExternalPackages: ["firebase-admin"],
  },
  // Configure SWC for proper JSX transformation
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
  // Ensure we're using SWC
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // For Node.js environment (server)
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        http2: false,
      }

      // Handle node: scheme imports
      config.resolve.alias = {
        ...config.resolve.alias,
        "node:process": "process",
        "node:stream": "stream",
        "node:buffer": "buffer",
        "node:util": "util",
        "node:url": "url",
        "node:http": "http",
        "node:https": "https",
        "node:zlib": "zlib",
        "node:path": "path",
        "node:crypto": "crypto",
      }
    } else {
      // For browser environment (client)
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        http2: false,
      }
    }

    return config
  },
}

module.exports = nextConfig

