import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        sales: "index-sales.html",
        account: "account.html",
        dashboard: "dashboard.html",
        terms: "terms.html",
        privacy: "privacy.html",
      },
    },
  },
});
