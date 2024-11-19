/** @type {import('next').NextConfig} */
const nextConfig = {
   output: "standalone",
   images: {
      remotePatterns: [{ hostname: 'localhost' }, { hostname: 'randomuser.me' }],
   },
   typescript: {
      ignoreBuildErrors: true,
   },
    experimental: {
  turbo: {
     resolveAlias: {
       canvas: './empty-module.ts',
     },
   },
 },
}

export default nextConfig
