
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
    plugins: [react()],

    base: process.env.GITHUB_ACTIONS ? "/gwlb/" : "/",

    build: {
        rollupOptions: {
            input: {
                main: resolve(rootDir, "index.html"),
                squads: resolve(rootDir, "src/index.html"),
                roster: resolve(rootDir, "src/roster.html"),
            },
        },
    },
});
