import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // GOLEMIO_KEY bez prefixu VITE_ – zůstane jen na serveru, nedostane se do bundlu
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [tailwindcss(), react()],
    server: {
      proxy: {
        "/api/golemio": {
          target: "https://api.golemio.cz",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/golemio/, ""),
          headers: { "X-Access-Token": env.GOLEMIO_KEY ?? "" },
        },
      },
    },
  };
});
