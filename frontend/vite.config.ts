import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Assumes the GitHub repository is named "GWLB".
export default defineConfig({
    plugins: [react()],
    base: process.env.GITHUB_ACTIONS ? "/gwlb/" : "/",
});
