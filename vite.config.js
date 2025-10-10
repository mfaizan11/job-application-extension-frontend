import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// This is the multi-entry configuration required for a Chrome Extension (MV3)
export default defineConfig({
  plugins: [react()],

  // The public directory should be correctly resolved for assets like manifest.json
  // It is generally safer to let publicDir default to 'public'
  publicDir: "public",

  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,

    rollupOptions: {
      input: {
        // 1. Side Panel HTML (The main React UI)
        sidepanel: resolve(__dirname, "public/index.html"),

        // 2. Service Worker JS
        background: resolve(__dirname, "src/service-worker/background.js"),

        // 3. Content Script JS
        content: resolve(__dirname, "src/content-script/content.js"),
      },
      output: {
        // This logic ensures the Service Worker and Content Script files
        // land in the correct relative path for the manifest.json to find them.
        entryFileNames: (assetInfo) => {
          if (assetInfo.name === "background") {
            return "src/service-worker/background.js";
          }
          if (assetInfo.name === "content") {
            return "src/content-script/content.js";
          }
          // All other JS (including the sidepanel's main script) goes into assets
          return "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
