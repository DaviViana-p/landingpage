/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    EMAIL: process.env.EMAIL,
    PASSWORD: process.env.PASSWORD,
  },
  images: {
    // Permite carregar imagens remotas, ajuste conforme necessário
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '145.223.75.113',
        port: '8080',
        pathname: '/geoserver/**',
      },
    ],
  },
  // Permite importar bibliotecas apenas no client-side (SSR false)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Permite requisições para o GeoServer durante o desenvolvimento local
  async rewrites() {
    return [
      {
        source: '/geoserver/:path*',
        destination: 'http://145.223.75.113:8080/geoserver/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
