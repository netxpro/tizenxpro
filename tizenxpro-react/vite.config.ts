import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "./www", 
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})


