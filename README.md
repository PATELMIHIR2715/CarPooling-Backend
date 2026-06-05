# Carpooling Backend

Node.js, Express, TypeScript, Prisma, PostgreSQL, Redis, and Socket.IO backend for a role-based carpooling platform. The API supports passenger trip search and booking, driver trip and document workflows, admin review tools, chat, ratings, waitlists, cron jobs, and email queue processing.

## Features

- JWT authentication with refresh tokens
- Role-based access for passengers, drivers, and admins
- Driver car registration and document upload through Cloudinary
- Trip creation, search, booking, waitlist, pickup OTP, and trip status flows
- Admin dashboards, users, documents, and trip management
- Real-time chat with Socket.IO
- Ratings and reviews after completed trips
- Prisma ORM with PostgreSQL
- Redis-backed restrictions and queue infrastructure
- Security middleware: Helmet, rate limiting, CORS allowlist, upload filtering, and JSON body limits

## Tech Stack

- Runtime: Node.js
- Framework: Express 5
- Language: TypeScript
- ORM: Prisma
- Database: PostgreSQL
- Cache/queues: Redis, Upstash Redis, BullMQ
- Realtime: Socket.IO
- Validation: Zod
- File storage: Cloudinary
- Email: Nodemailer

## Getting Started

### Prerequisites

- Node.js 22 or newer
- PostgreSQL database
- Redis or Upstash Redis
- Cloudinary account
- SMTP account for email delivery

### Installation

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=8000
NODE_ENV=development
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="change-me"
JWT_REFRESH_SECRET="change-me-too"
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

ORS_API_KEY=""
GEOAPIFY_API_KEY=""

UPSTASH_REDIS_URL=""
UPSTASH_REDIS_TOKEN=""

SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="Carpooling <no-reply@example.com>"
```

Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Start the development server:

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:8000
```

Health check:

```text
GET /health
```

## Scripts

```bash
npm run dev              # Start development server
npm run build            # Compile TypeScript
npm run start            # Run compiled server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Deploy Prisma migrations
npm run start:prod       # Generate, build, and start
```

## API Overview

All application routes are prefixed with `/api`.

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`

### Driver

- `POST /api/car/add-car`
- `GET /api/car/my-cars`
- `POST /api/car/documents`
- `GET /api/car/documents`
- `POST /api/trip`
- `GET /api/trip`
- `GET /api/trip/:tripId`
- `PUT /api/trip/:tripId/start`
- `POST /api/trip/:tripId/pickup/:bookingId`
- `POST /api/trip/:tripId/:bookingId/verify-otp`
- `GET /api/booking/:tripId`
- `PUT /api/booking/:bookingId/:status`

### Passenger

- `POST /api/passenger/get-trips`
- `POST /api/passenger/:tripId/book`
- `GET /api/passenger/bookings`
- `PUT /api/passenger/bookings/:bookingId/cancel`
- `POST /api/passenger/bookings/:tripId/waitlist`

### Admin

- `GET /api/admin/users`
- `GET /api/admin/users/:userId`
- `PUT /api/admin/users/:userId/restrict`
- `PUT /api/admin/users/:userId/unrestrict`
- `GET /api/admin/stats`
- `GET /api/admin/documents`
- `PUT /api/admin/documents/:documentId/:type/:status`
- `GET /api/admin/trips`

### Shared Modules

- `GET /api/location/search?q=city`
- `POST /api/location/route`
- `POST /api/rating/:tripId`
- `GET /api/chat/get-my-chats`
- `GET /api/chat/:chatId/messages`
- `POST /api/chat`

## Response Format

Successful responses use a standard wrapper:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Errors use:

```json
{
  "error": "Error message"
}
```

Validation errors may also include a `field` path.

## Security Notes

- Configure `CORS_ORIGIN` with the exact frontend origins allowed in production.
- Keep JWT secrets long, random, and different from each other.
- Never commit `.env` or generated secrets.
- Uploaded documents are limited to JPG, PNG, and PDF with a 5 MB max file size.
- Auth routes have stricter rate limits than general API routes.
- Refresh tokens are stored as HTTP-only cookies and persisted for server-side validation.

## Deployment

The repository includes `render.yaml` for Render deployments. Set all required environment variables in the deployment dashboard before starting the service. The production start flow runs Prisma generation, TypeScript build, migrations, and then starts the compiled server.

## Project Structure

```text
src/
  config/       App, database, Redis, Cloudinary, CORS, and upload config
  constants/    Route names, labels, messages, and shared types
  cron/         Scheduled trip, booking, and waitlist jobs
  filters/      Query filter definitions
  modules/      Feature modules and controllers
  socket/       Socket.IO setup and chat handlers
  utils/        Response, JWT, upload, email, and query helpers
  workers/      Background workers
prisma/
  schema.prisma Database schema
```
