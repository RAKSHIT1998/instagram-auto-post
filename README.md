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

## Production notes

- Put backend + worker on Render (web + background worker)
- Use MongoDB Atlas and Upstash Redis
- Set `RUN_EMBEDDED_WORKER=false` for web service
- Keep worker running `node src/worker.js` 24x7
