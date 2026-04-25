/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true"

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  output: isGithubPages ? "export" : undefined,
  trailingSlash: isGithubPages,
  basePath: isGithubPages ? "/web3_team13" : "",
  assetPrefix: isGithubPages ? "/web3_team13/" : "",
  images: {
    unoptimized: true,
  },
}

export default nextConfig
