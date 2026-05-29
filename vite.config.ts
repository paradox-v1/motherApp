import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  // On GitHub Pages the app is served from /<repo-name>/. The deploy workflow
  // sets VITE_BASE to that path; locally it stays at the root "/".
  base: process.env.VITE_BASE ?? "/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Mother's Cakes",
        short_name: "Cakes",
        description: "Track cake orders, recipes, costs, and profit.",
        theme_color: "#b45309",
        background_color: "#fffaf3",
        display: "standalone",
        orientation: "portrait",
        // Relative so the installed app works whether hosted at the domain
        // root or under a /<repo>/ subpath (GitHub Pages).
        start_url: ".",
        scope: ".",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
