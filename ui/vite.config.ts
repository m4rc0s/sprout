import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const isStorybook =
  process.env.STORYBOOK === "true" ||
  process.argv.some((arg) => typeof arg === "string" && arg.includes("storybook"));

export default defineConfig({
  server: {
    port: Number(process.env.PORT ?? 7422),
    host: "127.0.0.1",
    // Em desenvolvimento a API e o WebSocket vivem no servidor Bun.
    proxy: {
      "/api": "http://127.0.0.1:7421",
      "/ws": { target: "ws://127.0.0.1:7421", ws: true },
    },
  },
  resolve: { dedupe: ["react", "react-dom"] },
  plugins: [!isStorybook && reactRouter(), tsconfigPaths()].filter(Boolean),
});
