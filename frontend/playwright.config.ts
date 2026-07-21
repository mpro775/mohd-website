import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  use: { baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3001", trace: "retain-on-failure", ...devices["Desktop Chrome"] },
  reporter: process.env.CI ? "github" : "list",
});
