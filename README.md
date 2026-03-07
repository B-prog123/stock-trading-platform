# Stock Trading Platform

## Project Structure

stock-trading-platform
- frontend
  - package.json
- backend
  - server.js
  - package.json
- README.md

## Local Development

1. Install root tool dependency (for running both services together):
`npm install`

2. Install frontend and backend dependencies:
`npm install --prefix frontend`
`npm install --prefix backend`

3. Create backend env file:
`Copy-Item backend/.env.example backend/.env`

4. Update `backend/.env` values (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `FRONTEND_URL`, `PORT`).

5. Run frontend:
`npm run dev --prefix frontend`

6. Run backend:
`npm run dev --prefix backend`

Frontend: `http://localhost:5173`
Backend health: `http://localhost:4000/api/health`

## Deploy

- Frontend: deploy to Vercel from this repo using:
  - Build command: `npm run build --prefix frontend`
  - Output directory: `frontend/dist`
  - Env var: `VITE_API_BASE_URL=https://<your-backend-domain>`

- Backend: deploy to Render/Railway from `backend` directory (or same repo service root set to `backend`).
