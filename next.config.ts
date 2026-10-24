import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    agentUpgrade: "security",
  },
  async headers() {
    return [
      // Nenhuma página pode ser embutida em outro site; só os arquivos do sistema (PDF do contrato) podem
      // aparecer dentro de uma página do próprio sistema.
      { source: "/:path((?!api/arquivos).*)", headers: [{ key: "X-Frame-Options", value: "DENY" }, ...securityHeaders] },
      { source: "/api/arquivos/:path*", headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }, ...securityHeaders] },
    ];
  },
};

export default nextConfig;
