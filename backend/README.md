# Multi-Platform AI SaaS Backend

## Local run

1) Copy `.env.example` -> `.env`

Important envs:
- `MONGO_URI` or `MONGODB_URI`
- `REDIS_URL`
- `JWT_SECRET`
- `TOKEN_ENCRYPTION_KEY` (used to encrypt saved OAuth tokens)
- `CORS_ORIGIN` (comma-separated allowed origins; local default: `http://localhost:5173`)

2) Install deps

```bash
npm install
```

3) Start API

```bash
npm run dev
```

4) Start worker (separate terminal)

```bash
npm run worker
```

## Core API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

- `POST /api/ai/generate`
  - accepts: `topic|idea, niche, audience, tone, goal, priority, top_posts[]`
  - returns strict JSON with `idea_summary`, platform posts, `image_prompt`, `reel`

- `POST /api/posts/create` (auth)
  - runbook-compatible endpoint
  - flow: AI -> image -> save -> queue -> publish worker

- `GET /api/posts/mine` (auth)

- `POST /api/payments/order` (auth)
- `POST /api/payments/activate` (auth)

## Legacy publish endpoints

- `POST /api/publish/core`
- `GET /api/publish/platform-posts`
- `POST /api/publish/platform-posts/:id/schedule`
- `POST /api/publish/platform-posts/:id/publish`
- `POST /api/publish/platform-posts/:id/analytics`
- `GET /api/publish/analytics/top?limit=10`

## Docker

From repository root:

```bash
docker compose up --build
```

For Render deployment, use the project root [render.yaml](../render.yaml) and runbook in [DEPLOY.md](../DEPLOY.md).
