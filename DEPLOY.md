# Live Deploy Runbook (Render)

## 1) Push this project to GitHub

From project root:

```bash
git init
git add .
git commit -m "feat: launch-ready ai social saas"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## 2) Provision managed infra

- MongoDB Atlas -> create cluster + connection string
- Upstash Redis -> create Redis database + connection string

## 3) Deploy on Render using blueprint

1. Render dashboard -> New -> Blueprint
2. Connect your GitHub repo
3. Select [render.yaml](render.yaml)
4. Create services

Services created:
- ai-social-backend (web)
- ai-social-worker (background worker)
- ai-social-ml (web)
- ai-social-frontend (static)

If you create services manually and forget to set `Root Directory=backend`, this repo now includes a root [package.json](package.json) that proxies backend install/start scripts as a safety fallback.

## 4) Fill environment variables

### backend (ai-social-backend)

Required:

- MONGO_URI
- REDIS_URL
- JWT_SECRET
- TOKEN_ENCRYPTION_KEY
- ADMIN_EMAIL
- CORS_ORIGIN = https://<ai-social-frontend-service>.onrender.com
- APP_BASE_URL = https://<ai-social-frontend-service>.onrender.com
- ML_SERVICE_URL = https://<ai-social-ml-service>.onrender.com

If using AI providers:

- HF_API_KEY
- HF_TEXT_MODEL (or keep default from render.yaml)
- HF_FALLBACK_TEXT_MODEL (or keep default)
- HF_IMAGE_MODEL (or keep default)

If publishing to social platforms:

- IG_USER_ID
- META_ACCESS_TOKEN
- FB_PAGE_ID
- TWITTER_TOKEN
- LINKEDIN_TOKEN
- LINKEDIN_URN

For real one-click "Connect with X" (instead of pasting a TWITTER_TOKEN manually), see [X (Twitter) OAuth setup](#x-twitter-oauth-setup) below:

- X_CLIENT_ID
- X_CLIENT_SECRET
- X_OAUTH_REDIRECT_URI = https://<ai-social-backend-service>.onrender.com/api/oauth/twitter/callback

If charging users:

- RAZORPAY_KEY
- RAZORPAY_SECRET
- RAZORPAY_WEBHOOK_SECRET

### worker (ai-social-worker)

Set the same core runtime + integration variables used by backend:

- MONGO_URI
- REDIS_URL
- JWT_SECRET
- TOKEN_ENCRYPTION_KEY
- ML_SERVICE_URL
- HF_API_KEY (if used)
- IG_USER_ID, META_ACCESS_TOKEN, FB_PAGE_ID
- TWITTER_TOKEN
- LINKEDIN_TOKEN, LINKEDIN_URN
- X_CLIENT_ID, X_CLIENT_SECRET (needed here too - the worker refreshes expired X tokens when publishing)

### X (Twitter) OAuth setup

Required for the "Connect with X" button (Onboarding) to work instead of manually pasting a token:

1. Create a project + app at [developer.x.com](https://developer.x.com)
2. In the app's "User authentication settings", enable OAuth 2.0, app type "Web App, Automated App or Bot"
3. Set the callback URL to exactly `https://<ai-social-backend-service>.onrender.com/api/oauth/twitter/callback` (must match `X_OAUTH_REDIRECT_URI` byte-for-byte, including scheme and trailing slash)
4. Request scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access` (the last one is required to receive a refresh token - without it, connected accounts disconnect after 2 hours)
5. Copy the Client ID and Client Secret into `X_CLIENT_ID`/`X_CLIENT_SECRET` on both the backend and worker Render services

Without these set, the "Connect with X" button returns a clear "not configured" error rather than failing silently - the app still runs and mock-publishes fine without them.

### frontend (ai-social-frontend)

- VITE_API_BASE = https://<ai-social-backend-service>.onrender.com

Note: backend base URL can include `/api` or not; frontend supports both.

## 5) Verify health checks

- Backend: `GET /health`
- ML: `GET /health`

Frontend SPA routing is already handled by a rewrite in [render.yaml](render.yaml), so direct refresh on paths like `/admin` works.

## 6) Verify auth and posting flow

1. Register:

`POST /api/auth/register`

```json
{
  "name": "Demo",
  "email": "demo@example.com",
  "password": "password123"
}
```

2. Create post:

`POST /api/posts/create` (Bearer token)

```json
{
  "topic": "fitness discipline",
  "niche": "fitness",
  "tone": "bold"
}
```

3. Check jobs + results:
- Worker logs should show queued/posted jobs
- `GET /api/posts/mine`

## 7) Turn on Autopilot (optional, fully autonomous posting)

Once at least one platform is connected:

`PUT /api/autopilot` (Bearer token)

```json
{
  "niche": "fitness",
  "tone": "bold",
  "cadence": "daily",
  "enabled": true
}
```

The worker checks every 15 minutes for due configs, invents a fresh topic via AI, and runs it through the same generate-and-publish pipeline as a manual post - no further input needed. `GET /api/autopilot` shows `lastRunAt`/`lastError`/`recentTopics`. `POST /api/autopilot/run-now` triggers an immediate run without waiting for the next cron tick.

## 8) Connect custom domain

Render service -> Settings -> Custom Domains -> add domain.
SSL is auto-enabled.
