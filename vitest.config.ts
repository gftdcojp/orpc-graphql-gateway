import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    watch: false,
    reporters: ["dot"],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});

