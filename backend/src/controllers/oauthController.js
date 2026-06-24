import { env } from "../config/env.js";
import SocialConnection from "../models/SocialConnection.js";
import { encryptSecret } from "../utils/crypto.js";
import { createOAuthState, consumeOAuthState } from "../services/oauthState.js";
import { generatePKCE, buildAuthorizeUrl, exchangeCodeForToken } from "../services/oauth/twitterOAuth.js";

export async function startTwitterOAuth(req, res, next) {
  try {
    if (!env.X_CLIENT_ID || !env.X_CLIENT_SECRET || !env.X_OAUTH_REDIRECT_URI) {
      return res.status(503).json({ message: "X OAuth is not configured on this server" });
    }

    const { codeVerifier, codeChallenge } = generatePKCE();
    const state = await createOAuthState({
      userId: req.user.sub,
      platform: "twitter",
      codeVerifier
    });

    const authorizeUrl = buildAuthorizeUrl({ codeChallenge, state });
    res.json({ authorizeUrl });
  } catch (error) {
    next(error);
  }
}

export async function twitterOAuthCallback(req, res) {
  const { code, state, error: providerError } = req.query;
  const redirectBase = env.APP_BASE_URL.replace(/\/+$/, "");

  if (providerError) {
    return res.redirect(`${redirectBase}/?oauth_error=${encodeURIComponent(String(providerError))}`);
  }

  try {
    if (!code || !state) {
      throw new Error("Missing code or state");
    }

    const stateData = await consumeOAuthState(state);
    if (!stateData || stateData.platform !== "twitter") {
      throw new Error("Invalid or expired OAuth state");
    }

    const tokenResponse = await exchangeCodeForToken({
      code: String(code),
      codeVerifier: stateData.codeVerifier
    });

    await SocialConnection.findOneAndUpdate(
      { userId: stateData.userId, platform: "twitter" },
      {
        $set: {
          status: "connected",
          accountLabel: "twitter-account",
          encryptedAccessToken: encryptSecret(tokenResponse.access_token),
          encryptedRefreshToken: tokenResponse.refresh_token ? encryptSecret(tokenResponse.refresh_token) : undefined,
          tokenExpiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
          scopes: (tokenResponse.scope || "").split(" ").filter(Boolean),
          lastValidatedAt: new Date(),
          metadata: { authMethod: "oauth2_pkce" }
        },
        $unset: { accessToken: "" }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.redirect(`${redirectBase}/?onboarding=twitter_connected`);
  } catch (error) {
    res.redirect(`${redirectBase}/?oauth_error=${encodeURIComponent(error.message)}`);
  }
}
