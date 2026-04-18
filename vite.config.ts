import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Related: https://github.com/remix-run/remix/issues/2835#issuecomment-1144947675
// Replace the host with Shopify's host to prevent issues
export default defineConfig({
  server: {
    port: Number(process.env.PORT || 3000),
    hmr: process.env.SHOPIFY_CLI_PARTNERS_TOKEN
      ? false
      : { protocol: "ws", host: "localhost", port: 64999 },
    fs: { allow: ["app", "node_modules"] },
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
    }),
    tsconfigPaths(),
  ],
  build: {
    assetsInlineLimit: 0,
  },
}) satisfies UserConfig;
