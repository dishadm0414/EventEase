# EventEase — Workshop Registration System

A MERN-stack app for creating technical workshops, registering participants, preventing duplicate registrations, enforcing seat limits, and viewing attendee lists.

## Requirements

- Node.js 18+
- MongoDB local instance or MongoDB Atlas database

## Project structure

- `client/` — React + Vite frontend
- `server/` — Express + Mongoose REST API

## Run locally

### 1. Configure MongoDB and backend

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and update `MONGO_URI` if needed:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/eventease
```

Start MongoDB, then run:

```bash
npm run dev
```

The API listens on `http://localhost:5000`.

### 2. Start the frontend

In a separate terminal:

```bash
cd client
npm install
npm run dev
```

Open the Vite URL printed in the terminal (typically `http://localhost:5173`).

If your API runs at a different URL, create `client/.env` with:

```env
VITE_API_URL=http://localhost:5000/api
```

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API health check |
| GET | `/api/workshops` | List workshops |
| POST | `/api/workshops` | Create a workshop |
| POST | `/api/registrations` | Register a participant |
| GET | `/api/workshops/:id/attendees` | List workshop attendees |

### Create workshop example

```json
{
  "title": "Intro to React",
  "description": "Build your first React interface.",
  "date": "2026-12-15T10:00:00.000Z",
  "venue": "Innovation Lab",
  "capacity": 25
}
```

### Register participant example

```json
{
  "workshopId": "YOUR_WORKSHOP_OBJECT_ID",
  "name": "Alex Morgan",
  "usn": "1BM22CS001",
  "email": "alex@bmsce.ac.in"
}
```

Duplicate registrations return HTTP `409`. A workshop at capacity also rejects new registrations. The registration schema uses a compound unique index on workshop and normalized email; the server ensures that index is built at startup.

## Important notes

This is a starter implementation for a recruitment assignment, not a production-hardened deployment. Add organizer authentication/authorization before exposing workshop creation or attendee data publicly. For strict consistency across crashes and simultaneous writes, use MongoDB transactions or a reservation model that atomically maintains registration records and seat counts. Configure CORS for your deployed frontend origin.
