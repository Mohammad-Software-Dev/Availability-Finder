import { z } from "zod";

const envSchema = z.object({
  PORT: z.preprocess(
    (value) => value ?? "4000",
    z.coerce.number().int().positive(),
  ),
  FRONTEND_ORIGIN: z.url().default("http://localhost:5173"),
});

export function loadEnv(source: NodeJS.ProcessEnv = process.env) {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(`Invalid environment configuration: ${issue?.message ?? "Unknown error"}`);
  }

  return {
    port: parsed.data.PORT,
    frontendOrigin: parsed.data.FRONTEND_ORIGIN,
  };
}

export const env = loadEnv();
