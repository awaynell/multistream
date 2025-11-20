import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Базовый путь для работы под /multistream
  // Nginx удаляет префикс перед передачей, но basePath нужен для генерации правильных ссылок
  basePath: process.env.NODE_ENV === "production" ? "/multistream" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/multistream" : "",
};

export default nextConfig;
