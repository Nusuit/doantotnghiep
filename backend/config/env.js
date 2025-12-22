const { z } = require("zod");

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .optional()
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  CORS_ORIGIN: z.string().optional().default("http://localhost:3000"),

  MAPBOX_ACCESS_TOKEN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

function loadEnv(raw = process.env) {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid environment variables: ${msg}`);
  }
  return parsed.data;
}

module.exports = {
  loadEnv,
};
