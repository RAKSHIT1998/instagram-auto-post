import crypto from "crypto";
import axios from "axios";
import { env } from "../../config/env.js";

const AUTHORIZE_URL = "https://twitter.com/i/oauth2/authorize";
const TOKEN_URL = "https://api.x.com/2/oauth2/token";
const SCOPES = "tweet.read tweet.write users.read offline.access";

function base64url(buf) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generatePKCE() {
  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(crypto.createHash("sha256").update(codeVerifier).digest());
  return { codeVerifier, codeChallenge };
}

export function buildAuthorizeUrl({ codeChallenge, state }) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: env.X_CLIENT_ID,
    redirect_uri: env.X_OAUTH_REDIRECT_URI,
    scope: SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256"
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

function basicAuthHeader() {
  return Buffer.from(`${env.X_CLIENT_ID}:${env.X_CLIENT_SECRET}`).toString("base64");
}

export async function exchangeCodeForToken({ code, codeVerifier }) {
  const { data } = await axios.post(
    TOKEN_URL,
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: env.X_OAUTH_REDIRECT_URI,
      code_verifier: codeVerifier
    }),
    {
      headers: {
        Authorization: `Basic ${basicAuthHeader()}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: 30000
    }
  );

  return data;
}

export async function refreshAccessToken(refreshToken) {
  const { data } = await axios.post(
    TOKEN_URL,
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken
    }),
    {
      headers: {
        Authorization: `Basic ${basicAuthHeader()}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: 30000
    }
  );

  return data;
}
