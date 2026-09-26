import "server-only";
import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

type Env = z.infer<typeof envSchema>;

export const getEnv = (): Env => envSchema.parse(process.env);
