import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    slowTestThreshold: 5000,
    projects: [
      {
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          setupFiles: "./tests/unit/setup.ts",
        },
      },
      {
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
        },
      },
    ],
  },
});
