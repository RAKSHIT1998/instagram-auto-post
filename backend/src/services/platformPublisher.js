import { publishToInstagram } from "./platforms/instagram.js";
import { publishToFacebook } from "./platforms/facebook.js";
import { publishToTwitter } from "./platforms/twitter.js";
import { publishToLinkedIn } from "./platforms/linkedin.js";
import { allowPlatformRequest } from "../utils/rateLimiter.js";
import { getUserPlatformCredentials } from "./platformCredentials.js";

export async function publishToPlatform(platform, payload, { userId } = {}) {
  if (!allowPlatformRequest(platform)) {
    throw new Error(`Rate limit reached for ${platform}`);
  }

  const credentials = userId ? await getUserPlatformCredentials(userId, platform) : null;

  if (userId && !credentials) {
    throw new Error(`No connected ${platform} credentials found for this user`);
  }

  if (userId && !credentials.accessToken) {
    throw new Error(`Missing ${platform} access token for this user`);
  }

  switch (platform) {
    case "instagram":
      return publishToInstagram({ ...payload, credentials });
    case "facebook":
      return publishToFacebook({ ...payload, credentials });
    case "twitter":
      return publishToTwitter({ ...payload, credentials });
    case "linkedin":
      return publishToLinkedIn({ ...payload, credentials });
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
