# Restaurant CRM

Order management system for a cake/confectionery business. Tracks orders through a five-stage workflow (New → Accepted → In Production → Ready → Closed) with a Telegram bot for field staff and a React web UI for back-office.

## Tech Stack

```
Layer            Technology
───────────────────────────────────────────────
Backend          NestJS 11, TypeScript
Database         Supabase (PostgreSQL 17)
Auth             Supabase Auth (email/password)
Frontend         React 19, Vite, Tailwind CSS 4, shadcn/ui
Bot              Telegram (nestjs-telegraf)
Monitoring       Sentry (@sentry/node + @sentry/react)
```

## Project Structure

```
src/               NestJS backend
web/               React SPA (Vite)
shared/            Types + constants shared between backend and frontend
docs/plans/        Design and implementation docs
```

## Prerequisites

- Node.js 20+
- npm
- Supabase project (with Auth enabled)
- Telegram bot token (from @BotFather)

## Setup

1. Clone the repository

2. Install backend dependencies:

```bash
npm install --legacy-peer-deps
```

3. Install frontend dependencies:

```bash
cd web && npm install
```

4. Create `.env` in the project root:

```
SUPABASE_PROJECT_URL=https://<project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_URL=<supabase-url>
TELEGRAM_BOT_TOKEN=<bot-token>
TELEGRAM_CHAT_ID=<chat-id>
PORT=3000
SENTRY_DSN=<optional>
```

5. Create `web/.env` for the frontend:

```
VITE_SENTRY_DSN=<optional>
```

## Development

Start backend (port 3000):

```bash
npm run start:dev
```

Start frontend (port 5173):

```bash
cd web && npm run dev
```

The Vite dev server proxies `/api` requests to the backend.

## Build

```bash
npm run build          # Backend
cd web && npx vite build   # Frontend
```

## API

All endpoints are prefixed with `/api`.

```
Auth
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me

Orders
  GET    /api/orders
  GET    /api/orders/:id
  POST   /api/orders
  PATCH  /api/orders/:id/status
  POST   /api/orders/:id/items
  PATCH  /api/orders/:id/items/:itemId
  DELETE /api/orders/:id/items/:itemId

Reports
  GET    /api/reports/orders

Reference Tables
  GET/POST/PATCH/DELETE  /api/clients
  GET/POST/PATCH/DELETE  /api/nomenclature
  GET/POST/PATCH/DELETE  /api/employees
  GET/POST/PATCH/DELETE  /api/org-structure
  GET/POST/PATCH/DELETE  /api/sales-channels
  GET                    /api/order-statuses
```

## Order Workflow

```
New → Accepted → In Production → Ready → Closed
```

Each transition is enforced by the backend based on the order status linked list (previous/next status). Status history is tracked in `order_status_history` with timestamps for reporting.

## Telegram Bot

Commands:

- `/start` — Welcome message
- `/orders` — List recent orders with status transition buttons
- `/neworder` — 4-step order creation wizard (client → items → channel → confirm)
- `/help` — Show available commands

Status transitions and new orders trigger group chat notifications.
