import { describe, expect, it } from "vitest";
import { loadEnv } from "./env.js";

describe("loadEnv", () => {
  it("returns parsed config for valid values", () => {
    expect(
      loadEnv({
        PORT: "5000",
        FRONTEND_ORIGIN: "http://localhost:5173",
      } as NodeJS.ProcessEnv),
    ).toEqual({
      port: 5000,
      frontendOrigin: "http://localhost:5173",
    });
  });

  it("throws for invalid environment values", () => {
    expect(() =>
      loadEnv({
        PORT: "0",
        FRONTEND_ORIGIN: "not-a-url",
      } as NodeJS.ProcessEnv),
    ).toThrow("Invalid environment configuration");
  });
});
