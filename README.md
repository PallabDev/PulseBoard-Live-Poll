# PulseBoard Live Poll

PulseBoard is a full-stack live polling platform for creating polls, sharing public join links, collecting anonymous or authenticated feedback, and reviewing real-time analytics.

## Features

- Email/password authentication with protected dashboard routes.
- Poll builder with rich text poll descriptions, multiple questions, 2-4 single-choice options, and mandatory/optional question settings.
- Anonymous or authenticated response modes.
- Public join links with expiry-aware voting.
- Final submit flow with frontend and backend mandatory question validation.
- Live vote and analytics updates using Socket.io.
- Creator-only analytics and participant summary pages.
- Result publishing after a poll has ended, with public result viewing on the same join link.
- Sanitized rich text storage/output, rate limiting, Helmet headers, env-based CORS, hashed refresh/reset/verification tokens, and atomic option vote increments.

## Project Structure

```text
backend/   Express, MongoDB/Mongoose, Socket.io, auth, poll APIs
frontend/  React, Vite, Tailwind, dashboard, builder, public poll, analytics
```

## Backend Setup

```bash
cd backend
npm install
cp sample.env .env
npm run dev
```

Required backend env vars:

```text
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pulseboard
JWT_ACCESS_SECRET=replace_me
JWT_REFRESH_SECRET=replace_me
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Optional email env vars:

```text
RESEND_API_KEY=
RESEND_FROM=
```

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend env:

```text
VITE_BACKEND_URL=http://localhost:3000
```

## Build

```bash
cd backend && npm run build
cd frontend && npm run build
```

## Deployment Notes

- Deploy backend and frontend from this single repository.
- Set `FRONTEND_URL` on the backend to the deployed frontend origin. Use a comma-separated list for multiple allowed origins.
- Set `VITE_BACKEND_URL` on the frontend to the deployed backend origin.
- Use strong JWT secrets in production.
- Use HTTPS in production so secure cookies work correctly.
- Configure MongoDB with persistent storage and backups.

## Known Production Checklist

- Add automated tests for auth, poll expiry, duplicate voting, mandatory validation, publish results, and analytics access.
- Add CI to run frontend and backend builds before merge.
- Review Helmet CSP settings after final deployment domains are known.
