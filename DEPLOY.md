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

## 4) Fill environment variables

### backend (ai-social-backend)

Required:

- MONGO_URI
- REDIS_URL
- JWT_SECRET
- ADMIN_EMAIL
- CORS_ORIGIN = https://<ai-social-frontend-service>.onrender.com
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

If charging users:

- RAZORPAY_KEY
- RAZORPAY_SECRET
- RAZORPAY_WEBHOOK_SECRET

### worker (ai-social-worker)

Set the same core runtime + integration variables used by backend:

- MONGO_URI
- REDIS_URL
- JWT_SECRET
- ML_SERVICE_URL
- HF_API_KEY (if used)
- IG_USER_ID, META_ACCESS_TOKEN, FB_PAGE_ID
- TWITTER_TOKEN
- LINKEDIN_TOKEN, LINKEDIN_URN

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

## 7) Connect custom domain

Render service -> Settings -> Custom Domains -> add domain.
SSL is auto-enabled.
