import SocialConnection from "../models/SocialConnection.js";
import { decryptSecret } from "../utils/crypto.js";

function safelyDecrypt(value) {
  if (!value) return undefined;
  try {
    return decryptSecret(value);
  } catch {
    return undefined;
  }
}

function buildCredentials(connection) {
  if (!connection || connection.status !== "connected") return null;

  const accessToken = safelyDecrypt(connection.encryptedAccessToken) || connection.accessToken;
  const refreshToken = safelyDecrypt(connection.encryptedRefreshToken);

  return {
    platform: connection.platform,
    accountLabel: connection.accountLabel,
    accessToken,
    refreshToken,
    tokenExpiresAt: connection.tokenExpiresAt,
    scopes: connection.scopes || [],
    providerAccountId: connection.providerAccountId,
    metadata: connection.metadata || {}
  };
}

export async function getUserPlatformCredentials(userId, platform) {
  const connection = await SocialConnection.findOne({
    userId,
    platform,
    status: "connected"
  }).lean();

  return buildCredentials(connection);
}

export async function getConnectedPlatforms(userId) {
  const docs = await SocialConnection.find({
    userId,
    status: "connected"
  })
    .select("platform")
    .lean();

  return docs.map((d) => d.platform);
}
