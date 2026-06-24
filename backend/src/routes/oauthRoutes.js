import { Router } from "express";
import { startTwitterOAuth, twitterOAuthCallback } from "../controllers/oauthController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// NOTE: /callback is intentionally public (no requireAuth) - it is reached via an
// external browser redirect from the OAuth provider, which carries no Authorization header.
router.get("/twitter/start", requireAuth, startTwitterOAuth);
router.get("/twitter/callback", twitterOAuthCallback);

export default router;
