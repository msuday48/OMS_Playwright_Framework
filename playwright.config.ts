import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";

// 1. Use __dirname to guarantee robust path resolution
dotenv.config({
  path: path.resolve(__dirname, ".env")
});

// 2. Extract exactly url_local
const applicationUrl = process.env.url_local?.trim();

if (!applicationUrl) {
  throw new Error("url_local is missing in the project .env file.");
}

try {
  new URL(applicationUrl);
} catch {
  throw new Error(`Invalid URL configured in url_local: ${applicationUrl}`);
}

export default defineConfig({
  timeout: 60 * 1000, // CRITICAL FIX: Increased to 60 seconds
  testDir: "./tests",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  // OMS module specs mutate the shared .env job-tracking keys, so parallel
  // workers are unsafe for them; run everything serially.
  workers: 1,
  reporter: [
    ["list"],
    ["./utils/CustomReporter.ts"] 
  ],
  use: {
    baseURL: applicationUrl, // Centralized Base URL injection
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: false,         
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    permissions: ["geolocation"]
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /web[/\\]JobCreation\.spec\.ts/,
    },
    {
      name: "oms-jobs",
      testMatch: /web[/\\]JobCreation\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});