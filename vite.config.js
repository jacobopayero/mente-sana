import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// La base se puede ajustar por entorno:
//  - Hosting en la raíz (Vercel/Netlify):  VITE_BASE no definido  -> "/"
//  - GitHub Pages (subcarpeta del repo):   VITE_BASE=/mente-sana/
// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE || "/",
  plugins: [react()],
});
