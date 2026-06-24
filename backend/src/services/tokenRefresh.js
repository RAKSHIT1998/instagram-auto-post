import SocialConnection from "../models/SocialConnection.js";
import { encryptSecret } from "../utils/crypto.js";
import { refreshAccessToken as refreshTwitterToken } from "./oauth/twitterOAuth.js";

const REFRESHERS = {
  twitter: refreshTwitterToken
};

const EXPIRY_BUFFER_MS = 5 * 60 * 1000;

export async function ensureFreshCredentials(platform, credentials, userId) {
  const refresher = REFRESHERS[platform];
  if (!refresher) return credentials;
  if (!credentials.refreshToken) return credentials;
  if (!credentials.tokenExpiresAt) return credentials;

  const expiresAt = new Date(credentials.tokenExpiresAt).getTime();
  if (Date.now() < expiresAt - EXPIRY_BUFFER_MS) return credentials;

  const refreshed = await refresher(credentials.refreshToken);

  await SocialConnection.findOneAndUpdate(
    { userId, platform },
    {
      $set: {
        encryptedAccessToken: encryptSecret(refreshed.access_token),
        encryptedRefreshToken: encryptSecret(refreshed.refresh_token || credentials.refreshToken),
        tokenExpiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
        lastValidatedAt: new Date()
      }
    }
  );

  return {
    ...credentials,
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token || credentials.refreshToken
  };
}
