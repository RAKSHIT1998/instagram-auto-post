import crypto from "crypto";
import { env } from "../config/env.js";

const ALGO = "aes-256-gcm";

function getKey() {
  const source = env.TOKEN_ENCRYPTION_KEY || env.JWT_SECRET;
  return crypto.createHash("sha256").update(source).digest();
}

export function encryptSecret(value) {
  if (!value) return undefined;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptSecret(payload) {
  if (!payload) return undefined;

  const [ivB64, authTagB64, dataB64] = payload.split(":");
  if (!ivB64 || !authTagB64 || !dataB64) {
    throw new Error("Invalid encrypted payload format");
  }

  const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}
