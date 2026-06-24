import crypto from "crypto";
import { createRedisConnection } from "../config/redis.js";

const redis = createRedisConnection();
const TTL_SECONDS = 600;
const PREFIX = "oauth:state:";

export async function createOAuthState({ userId, platform, codeVerifier, redirectAfter }) {
  const state = crypto.randomBytes(24).toString("hex");
  await redis.set(
    `${PREFIX}${state}`,
    JSON.stringify({ userId, platform, codeVerifier, redirectAfter, createdAt: Date.now() }),
    "EX",
    TTL_SECONDS
  );
  return state;
}

export async function consumeOAuthState(state) {
  const key = `${PREFIX}${state}`;
  const raw = await redis.get(key);
  if (!raw) return null;
  await redis.del(key);
  return JSON.parse(raw);
}
