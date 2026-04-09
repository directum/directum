import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const port = process.env.PORT ? Number(process.env.PORT) : 8080;

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port,
  },
  preview: {
    host: "::",
    port,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));