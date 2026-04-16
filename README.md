# Referrly

Referrly is a full-stack referral management platform built with React, Node.js, PostgreSQL, and Prisma. It supports three roles:

- `SEEKER`: search referrers, create requests, upload resumes, track statuses
- `REFERRER`: review incoming requests, accept/reject, mark referred
- `ADMIN`: see platform-wide user and request counts from the dashboard

## What’s Included

- JWT auth with bcrypt password hashing
- Role-based protected routes on frontend and backend
- Profile management for name, email, role, company, skills, and experience
- Referral request workflow: `REQUESTED -> ACCEPTED -> REFERRED` and `REJECTED`
- Database-backed notifications triggered on request creation and status updates
- Referrer search by company, skills, and keyword
- Status filtering for seeker and referrer request views
- Resume upload with local storage fallback at `backend/uploads/resumes`
- Seed data for seekers, referrers, admin, sample requests, and notifications

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL
- Database: PostgreSQL

## Project Structure

```text
backend/
  prisma/
    schema.prisma
    seed.ts
  src/
    config/
    controllers/
    middleware/
    routes/
    services/
    utils/

frontend/
  src/
    components/
    context/
    pages/
    services/
    types/
    utils/
```

## Environment Variables

### Backend: `backend/.env`

```env
DATABASE_URL="postgresql://referrly_user:referrly_password@localhost:5432/referrly_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
JWT_EXPIRY="7d"
PORT=5000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880
```

### Frontend: `frontend/.env.local`

```env
VITE_API_URL="http://localhost:5000/api"
```

## Local Setup

### 1. Install dependencies

```bash
npm run setup
```

### 2. Start PostgreSQL

Create a database that matches `DATABASE_URL`. If you want to use Docker, you can also start the included compose stack:

```bash
docker-compose up -d postgres
```

### 3. Prepare the database

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Start the app

Use two terminals:

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

Frontend runs at `http://localhost:3000` and backend runs at `http://localhost:5000`.

## Demo Accounts

- Seeker: `seeker1@example.com` / `password123`
- Seeker: `seeker2@example.com` / `password123`
- Referrer: `referrer1@google.com` / `password123`
- Referrer: `referrer2@microsoft.com` / `password123`
- Admin: `admin@referrly.com` / `password123`

## API Surface

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/me`

### Requests

- `POST /api/requests`
- `GET /api/requests/mine`
- `GET /api/requests/incoming`
- `PATCH /api/requests/:id/status`

### Notifications and Search

- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `GET /api/referrers`
- `GET /api/referrers/:id`
- `GET /api/dashboard`

## Build Verification

The project has been verified with:

```bash
cd backend && npm run build
cd ../frontend && npm run build
```

## Render Deployment

This repo now includes a root [render.yaml](/c:/Users/rajes/Downloads/Referrly/render.yaml:1) blueprint for:

- `referrly-db`: Render PostgreSQL
- `referrly-api`: Node/Express backend
- `referrly-web`: Vite frontend static site

### Recommended Render flow

1. Push this repo to GitHub.
2. In Render, create a new Blueprint and select the GitHub repo.
3. Render will detect `render.yaml` and prepare all three services.
4. Set these manual env values before the first deploy:

- Backend `CORS_ORIGIN`: your frontend Render URL, for example `https://referrly-web.onrender.com`
- Frontend `VITE_API_URL`: your backend API URL, for example `https://referrly-api.onrender.com/api`

### Database setup note

This project currently uses `prisma db push` and seed data locally. Before first production use, run the backend service shell or a one-off job with:

```bash
npm run db:push
npm run db:seed
```

If you want, we can convert this to proper Prisma migrations next so Render deploys are fully automatic.

## Notes

- Resume uploads are stored locally by default and served from `/uploads/...`
- Prisma schema changes are handled with `prisma db push` in this skeleton
- There are no automated tests in the repository yet, so build verification is the primary check
