import type { Config } from "@react-router/dev/config";

export default {
  // Ferramenta local: SPA estática servida pelo servidor Bun (server/index.ts).
  ssr: false,
  appDirectory: "app",
} satisfies Config;
