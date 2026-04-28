import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://gamesbrowse.online",
  trailingSlash: "always",
  adapter: cloudflare()
});