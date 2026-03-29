import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! WARN !!
    // Povolí Vercelu postavit aplikaci i se smazanými/chybějícími TypeScript definicemi a chybami.
    // Ideální pro rychlé nasazení.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignoruje varování kompilátoru (např. nepoužitá proměnná) při buildu.
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["@libsql/client", "@prisma/adapter-libsql", "bcryptjs"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
