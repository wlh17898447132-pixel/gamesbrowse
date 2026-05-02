import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://gamesbrowse.online",
  trailingSlash: "always",
  output: "static",
  compressHTML: true,
  build: {
    inlineStylesheets: "auto"
  },
  vite: {
    build: {
      cssMinify: true,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true
        }
      }
    }
  }
});

