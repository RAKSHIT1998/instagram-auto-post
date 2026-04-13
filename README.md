# AI Social SaaS Monorepo

## Structure

- backend/ (API, auth, queue, platform publishing)
- worker/ (dedicated worker container)
- ml-service/ (learning API)
- frontend/ (minimal React dashboard)
- docker-compose.yml

## Launch

1. Copy backend env

```bash
cp backend/.env.example backend/.env
```

2. Start full stack

```bash
docker compose up --build
```

3. Services

- Backend: http://localhost:5000/health
- ML: http://localhost:8000/health
- Frontend: http://localhost:5173

## Local env notes

- Backend CORS is controlled by `CORS_ORIGIN` (default local value: `http://localhost:5173`).
- Frontend API base is configured through `VITE_API_BASE` in [frontend/.env.example](frontend/.env.example).
- Frontend accepts either:
	- `http://localhost:5000`
	- `http://localhost:5000/api`

## Production notes

- Put backend + worker on Render (web + background worker)
- Use MongoDB Atlas and Upstash Redis
- Set `RUN_EMBEDDED_WORKER=false` for web service
- Keep worker running `node src/worker.js` 24x7
- Set backend `CORS_ORIGIN=https://<your-frontend>.onrender.com`
- Set frontend `VITE_API_BASE=https://<your-backend>.onrender.com`

For full Render setup, follow [DEPLOY.md](DEPLOY.md).
