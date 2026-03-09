# Restaurant CRM

Order management system for a cake/confectionery business. Tracks orders through a five-stage workflow (New → Accepted → In Production → Ready → Closed) with a Telegram bot for field staff and a React web UI for back-office.

## Tech Stack

```
Layer            Technology
───────────────────────────────────────────────
Backend          NestJS 11, TypeScript
Database         Supabase (PostgreSQL 17)
Auth             Supabase Auth (email/password)
Frontend         React 19, Vite, Tailwind CSS 4, shadcn/ui (@base-ui/react)
i18n             react-i18next (frontend), custom (backend Telegram)
Bot              Telegram (nestjs-telegraf)
Monitoring       Sentry (@sentry/node + @sentry/react)
Notifications    sonner (frontend toasts), Telegram (backend alerts)
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

```bash
# Supabase
SUPABASE_PROJECT_URL=https://<project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<secret key from Supabase Dashboard → Settings → API Keys>

# Server
PORT=3000

# CORS (optional, defaults to http://localhost:5173)
CORS_ORIGIN=http://localhost:5173

# Telegram
TELEGRAM_BOT_TOKEN=<token from @BotFather>
TELEGRAM_CHAT_ID=<group chat ID, e.g. -5185308692>
TELEGRAM_LANG=en

# Sentry (optional)
SENTRY_DSN=<DSN from Sentry → Project → Settings → Client Keys>
```

5. Create `web/.env` for the frontend:

```bash
VITE_SENTRY_DSN=<DSN from Sentry → Project → Settings → Client Keys>
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

## CI/CD

GitHub Actions runs three parallel jobs on every push and pull request to `main`:

```
Job              Steps
───────────────────────────────────────────────────────────────
Formatting       prettier --check (src/ + web/src/)
Backend          eslint → tsc --noEmit → nest build → jest
Frontend         eslint → tsc -b → vite build
```

Workflow file: `.github/workflows/ci.yml`

## Deployment

```
Platform       Purpose                      Config
───────────────────────────────────────────────────────────────
Vercel         Frontend (static SPA)        vercel.json
Railway        Backend (NestJS + Telegram)  railway.json
```

Vercel rewrites `/api/*` requests to the Railway backend. Both platforms auto-deploy on merge to `main` via GitHub integration.

### 1. Deploy Backend to Railway

1. Go to [railway.app/new](https://railway.app/new) → **Deploy from GitHub repo**
2. Connect the `RavenDevs/restaurant-crm` repository
3. Railway auto-detects `railway.json` — no build settings to change
4. Add environment variables in **Settings → Variables**:

```
SUPABASE_PROJECT_URL=https://coueibyzoduppdwckdct.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from Supabase Dashboard → Settings → API Keys>
TELEGRAM_BOT_TOKEN=<from @BotFather>
TELEGRAM_CHAT_ID=<group chat ID>
TELEGRAM_LANG=en
PORT=3000
CORS_ORIGIN=https://<your-vercel-domain>.vercel.app
SENTRY_DSN=<optional>
```

5. Deploy. Railway assigns a public domain (e.g. `restaurant-crm-production-xxxx.up.railway.app`)
6. Copy the Railway domain — you need it for the Vercel setup

### 2. Deploy Frontend to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository**
2. Select the `RavenDevs/restaurant-crm` repository
3. Configure build settings:

```
Framework Preset    Vite
Root Directory      web
Build Command       cd web && npm install && npm run build
Output Directory    web/dist
```

4. Add environment variables:

```
VITE_SENTRY_DSN=<optional, from Sentry → Project → Settings → Client Keys>
```

5. Deploy. Vercel assigns a domain (e.g. `restaurant-crm-xxxx.vercel.app`)

### 3. Connect Frontend to Backend

1. Update `vercel.json` — replace `<RAILWAY_URL>` with the actual Railway domain:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://restaurant-crm-production-xxxx.up.railway.app/api/:path*"
    }
  ]
}
```

2. Update the Railway `CORS_ORIGIN` variable to match the Vercel domain
3. Commit and push — both platforms redeploy automatically

## API

All endpoints are prefixed with `/api`. All routes require authentication (Bearer token) unless marked as public.

```
Auth (public)
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me

Orders
  GET    /api/orders
  GET    /api/orders/:id
  POST   /api/orders
  DELETE /api/orders/:id
  PATCH  /api/orders/:id/status
  POST   /api/orders/:id/items
  PATCH  /api/orders/:id/items/:itemId
  DELETE /api/orders/:id/items/:itemId

Reports
  GET    /api/reports/orders

Settings
  GET    /api/app-settings
  PATCH  /api/app-settings

Reference Tables
  GET/POST/PATCH/DELETE  /api/clients
  GET/POST/PATCH/DELETE  /api/nomenclature
  GET/POST/PATCH/DELETE  /api/employees
  GET/POST/PATCH/DELETE  /api/org-structure
  GET/POST/PATCH/DELETE  /api/sales-channels
  GET/PATCH              /api/order-statuses
```

## Order Workflow

```
New → Accepted → In Production → Ready → Closed
```

Each transition is enforced by the backend based on the order status linked list (previous/next status). Status history is tracked in `order_status_history` with timestamps for reporting. Transitioning to a new status resets the order color to green.

## Order Monitoring & Escalation

A background job (`@nestjs/schedule`, 60-second interval) monitors orders for time limit violations.

### Order Health

Each order has a color indicator shown in the orders list and detail pages:

- **Green (On track)** — the order is within the configured time limits for its current status
- **Red (Overdue)** — the order has exceeded either the unconfirmed or in-status time limit

When an order exceeds a time limit, its color flips from green to red. Once the order advances to the next status, color resets to green.

### Time Limits

Each order status can have two optional time limits (in minutes), configured via the Order Statuses reference page:

- **Max Unconfirmed (min)** — maximum time an order can stay in a status without being acknowledged by a responsible person. Used for statuses that require acceptance (e.g. New, Accepted).
- **Max In Status (min)** — maximum time an order can remain in a status before it is considered overdue. Used for statuses where active work is happening (e.g. In Production, Ready).

If either limit is exceeded, the order is marked as overdue (red).

### Escalation Actions

When a time limit is exceeded, the system can send an alert depending on the configured escalation action:

```
Action                          Behavior
─────────────────────────────────────────────────────────────────
Telegram Alert                  Sends a warning to the Telegram group
Telegram Manager Alert          Sends a manager-tagged alert (👔 prefix)
Telegram Escalation             Sends an escalation-flagged alert (🔺 prefix)
None                            No alert sent, order is still marked red
```

Alerts are sent once per status (on the green → red transition). The monitoring job does not automatically transition orders — it only flags and alerts. Status transitions remain manual (via web UI or Telegram bot).

### Default Configuration

```
Status            Max Unconfirmed   Max In Status   Escalation
─────────────────────────────────────────────────────────────────
New               10 min            30 min          Telegram Alert
Accepted          15 min            60 min          Telegram Manager Alert
In Production     —                 480 min         Telegram Escalation
Ready             —                 120 min         Telegram Alert
Closed            —                 —               None
```

### How It Works

```mathematica
Order Created (color = green)
   ↓
[Every 60 seconds the monitoring job runs]
   ↓
For each green order (not Closed):
   ├─ Calculate elapsed time in current status
   ├─ Compare against max_time_unconfirmed and max_time_in_status
   ├─ If within limits → stay green
   └─ If exceeded:
       ├─ Mark order as red (overdue)
       └─ Send Telegram alert (based on escalation action)
   ↓
Order Advanced to Next Status
   └─ Color resets to green
```

## Audit Logging

All backend mutations (POST, PATCH, PUT, DELETE) are automatically logged to Sentry via a global NestJS interceptor. Each successful mutation produces an info-level Sentry event with structured metadata.

Event format:

```
Title:    audit.{entity}.{action}
Level:    info
Extra:
  entity_type   Entity name from URL (e.g. orders, clients)
  action        create / update / delete (derived from HTTP method)
  entity_id     UUID from route params or response body
  user_id       Authenticated user's UUID
  user_email    Authenticated user's email
  path          Full request path (e.g. /api/orders)
  method        HTTP method
  timestamp     ISO 8601 timestamp
```

GET requests and failed mutations are not logged. The interceptor requires `SENTRY_DSN` to be configured.

## Telegram Bot

### Setup

1. Create a bot via [@BotFather](https://t.me/BotFather) (`/newbot`)
2. Copy the token to `.env` as `TELEGRAM_BOT_TOKEN`
3. Register commands with BotFather — send `/setcommands`, select your bot, then paste:

```
start - Welcome message
orders - List recent orders
neworder - Create a new order
help - Show available commands
```

4. Create a Telegram group for notifications:
   - Tap the compose icon → "New Group"
   - Add your bot as a member
   - Name it (e.g. "Restaurant CRM Orders")
5. Send any message in the group, then get the chat ID by calling:

```
https://api.telegram.org/bot<TOKEN>/getUpdates
```

Look for `"chat":{"id":-XXXXXXX}` and set that number as `TELEGRAM_CHAT_ID` in `.env`. If the response is empty, remove and re-add the bot, send another message, and try again.

### Commands

- `/start` — Welcome message
- `/orders` — List recent orders with status transition buttons
- `/neworder` — 4-step order creation wizard (client → items → channel → confirm)
- `/help` — Show available commands

Status transitions and new orders trigger group chat notifications.

## Localization

The app supports English (EN) and Ukrainian (UK) locales.

- **Frontend**: `react-i18next` with JSON translation files in `web/src/i18n/locales/`
- **Backend**: Custom i18n for Telegram bot messages in `src/i18n/`, selected via `TELEGRAM_LANG` env var (defaults to `en`)
