import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().optional(),
  MONGO_URI: z.string().optional(),
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  JWT_SECRET: z.string().default("supersecret"),
  ADMIN_EMAIL: z.string().optional(),
  RUN_EMBEDDED_WORKER: z.coerce.boolean().default(true),
  RUN_SCHEDULER: z.coerce.boolean().default(true),
  RUN_ANALYTICS_CRON: z.coerce.boolean().default(true),

  HF_API_KEY: z.string().optional(),
  HF_TEXT_MODEL: z.string().default("mistralai/Mistral-7B-Instruct-v0.2"),
  HF_FALLBACK_TEXT_MODEL: z.string().optional(),
  HF_IMAGE_MODEL: z.string().default("stabilityai/stable-diffusion-xl-base-1.0"),

  META_API_VERSION: z.string().default("v22.0"),
  IG_USER_ID: z.string().optional(),
  IG_ACCESS_TOKEN: z.string().optional(),
  META_ACCESS_TOKEN: z.string().optional(),
  FB_PAGE_ID: z.string().optional(),
  FB_ACCESS_TOKEN: z.string().optional(),

  X_API_BASE: z.string().default("https://api.x.com/2"),
  X_BEARER_TOKEN: z.string().optional(),
  TWITTER_TOKEN: z.string().optional(),

  LINKEDIN_API_BASE: z.string().default("https://api.linkedin.com/v2"),
  LINKEDIN_ACCESS_TOKEN: z.string().optional(),
  LINKEDIN_TOKEN: z.string().optional(),
  LINKEDIN_AUTHOR_URN: z.string().optional(),
  LINKEDIN_URN: z.string().optional(),

  RAZORPAY_KEY: z.string().optional(),
  RAZORPAY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  ML_SERVICE_URL: z.string().default("http://127.0.0.1:8000")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

env.MONGODB_URI = env.MONGODB_URI || env.MONGO_URI;
if (!env.MONGODB_URI) {
  console.error("MONGODB_URI or MONGO_URI must be set");
  process.exit(1);
}

env.IG_ACCESS_TOKEN = env.IG_ACCESS_TOKEN || env.META_ACCESS_TOKEN;
env.X_BEARER_TOKEN = env.X_BEARER_TOKEN || env.TWITTER_TOKEN;
env.LINKEDIN_ACCESS_TOKEN = env.LINKEDIN_ACCESS_TOKEN || env.LINKEDIN_TOKEN;
env.LINKEDIN_AUTHOR_URN = env.LINKEDIN_AUTHOR_URN || env.LINKEDIN_URN;
