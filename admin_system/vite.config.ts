import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [react()],
    server: {
      port: 8081,
      proxy: {
        "/api": {
          target: isDev
            ? "http://localhost:8000"
            : "http://49.232.218.116:8000",
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@src": resolve(__dirname, "src"),
        "@https": resolve(__dirname, "src/https"),
        "@stores": resolve(__dirname, "src/stores"),
        "@pages": resolve(__dirname, "src/pages"),
        "@layouts": resolve(__dirname, "src/layouts"),
      },
    },
  };
});
