import { publishToInstagram } from "./platforms/instagram.js";
import { publishToFacebook } from "./platforms/facebook.js";
import { publishToTwitter } from "./platforms/twitter.js";
import { publishToLinkedIn } from "./platforms/linkedin.js";
import { allowPlatformRequest } from "../utils/rateLimiter.js";

export async function publishToPlatform(platform, payload) {
  if (!allowPlatformRequest(platform)) {
    throw new Error(`Rate limit reached for ${platform}`);
  }

  switch (platform) {
    case "instagram":
      return publishToInstagram(payload);
    case "facebook":
      return publishToFacebook(payload);
    case "twitter":
      return publishToTwitter(payload);
    case "linkedin":
      return publishToLinkedIn(payload);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
