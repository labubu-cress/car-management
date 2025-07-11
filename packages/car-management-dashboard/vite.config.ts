import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { version } from '../../package.json';

const buildTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      'import.meta.env.APP_VERSION': JSON.stringify(version),
      'import.meta.env.BUILD_TIME': JSON.stringify(buildTime),
    },
    plugins: [react(), vanillaExtractPlugin()],
    base: env.VITE_BASE_URL || "/dashboard/",
    optimizeDeps: {
      exclude: ["@jsquash/resize", "@jsquash/jpeg", "@jsquash/png", "@jsquash/webp"]
    },
    server: {
      port: 3001,
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  };
});
