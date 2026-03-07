# Restaurant CRM - Cake Ordering - Design Document

## Overview

A CRM system for a cake/confectionery business to manage orders end-to-end. Orders flow through a 5-stage workflow (New -> Accepted -> In Production -> Ready -> Closed) with management via both a Telegram bot and a web interface.

## Architecture: Monorepo

Single repository with shared TypeScript types between backend and frontend.

```
restaurant-crm/
   src/                          NestJS backend
      main.ts
      app.module.ts
      config/                    @nestjs/config setup
      supabase/                  Supabase client module (shared)
      auth/                      Supabase Auth integration
      orders/                    Order CRUD + workflow logic
         orders.module.ts
         orders.controller.ts
         orders.service.ts
         dto/
         entities/
      clients/                   Clients reference table
      nomenclature/              Nomenclature items
      employees/                 Employees reference
      org-structure/             Org units
      sales-channels/            Sales channels
      order-statuses/            Status definitions + workflow rules
      reports/                   Report/registry queries
      telegram/                  Telegraf bot module
   web/                          React SPA (Vite)
      src/
         pages/                  Orders, References, Reports
         components/             Shared UI components
         api/                    API client layer
         auth/                   Supabase Auth client-side
      index.html
      vite.config.ts
   shared/                       Shared TypeScript types
      types/                     Entity types, DTOs, enums
      constants/                 Status names, workflow rules
   package.json                  Root (NestJS deps)
   web/package.json              Frontend deps
```

## Tech Stack

```
Layer              Technology                  Purpose
-------------------------------------------------------------
Backend            NestJS 11 + TypeScript      REST API + business logic
Database           Supabase (PostgreSQL 17)    Data storage + Auth + Realtime
Auth               Supabase Auth               Email/password, role-based
Telegram Bot       nestjs-telegraf              Order creation + status management
Frontend           React (Vite) + TypeScript    SPA for web users
UI Components      shadcn/ui + Tailwind CSS    Design system
API Client         @tanstack/react-query        Data fetching + caching
Forms              react-hook-form              Form state + validation
Shared Types       shared/ directory            TypeScript types between FE/BE
Error Monitoring   Sentry                       Production error tracking
```

## Database Schema

All tables use uuid primary keys, timestamptz for created_at/updated_at, and have RLS enabled.

### clients

- id: uuid PK
- name: text NOT NULL
- phone: text NOT NULL

### nomenclature_items

- id: uuid PK
- name: text NOT NULL
- price: numeric(10,2) NOT NULL (UAH)

### org_units

- id: uuid PK
- name: text NOT NULL

### employees

- id: uuid PK
- name: text NOT NULL
- org_unit_id: uuid FK -> org_units(id)
- user_id: uuid FK -> auth.users(id) (links to Supabase Auth)

### sales_channels

- id: uuid PK
- name: text NOT NULL

### order_statuses

- id: uuid PK
- name: text NOT NULL (New, Accepted, In Production, Ready, Closed)
- previous_status_id: uuid FK -> order_statuses(id) NULLABLE
- next_status_id: uuid FK -> order_statuses(id) NULLABLE
- max_time_unconfirmed: interval NULLABLE
- max_time_in_status: interval NULLABLE
- escalation_action: text NULLABLE
- sort_order: int NOT NULL

### orders

- id: uuid PK
- order_date: timestamptz NOT NULL
- client_id: uuid FK -> clients(id)
- order_point: text (auto-filled from org unit)
- sales_channel_id: uuid FK -> sales_channels(id)
- accepted_by_id: uuid FK -> employees(id) NULLABLE
- status_id: uuid FK -> order_statuses(id)
- color: text DEFAULT 'green' (green/red based on status progression)

### order_items (junction table)

- id: uuid PK
- order_id: uuid FK -> orders(id) ON DELETE CASCADE
- nomenclature_item_id: uuid FK -> nomenclature_items(id)
- quantity: int NOT NULL DEFAULT 1
- price_at_order: numeric(10,2) NOT NULL (snapshot price at time of order)

### order_status_history (time tracking for reports)

- id: uuid PK
- order_id: uuid FK -> orders(id) ON DELETE CASCADE
- status_id: uuid FK -> order_statuses(id)
- entered_at: timestamptz NOT NULL
- exited_at: timestamptz NULLABLE
- changed_by_id: uuid FK -> employees(id) NULLABLE

## API Endpoints

All routes under /api prefix.

### Auth

- POST /api/auth/login (Supabase email/password)
- POST /api/auth/logout
- GET /api/auth/me (current user + employee info)

### Orders

- GET /api/orders (list with filters: status, date range, client)
- GET /api/orders/:id (single order with items + status history)
- POST /api/orders (create new order)
- PATCH /api/orders/:id (update order details)
- PATCH /api/orders/:id/status (workflow transition to next status)

### Order Items

- POST /api/orders/:id/items
- PATCH /api/orders/:id/items/:itemId
- DELETE /api/orders/:id/items/:itemId

### Reference Tables (CRUD pattern for each)

- GET/POST/PATCH/DELETE /api/clients
- GET/POST/PATCH/DELETE /api/nomenclature
- GET/POST/PATCH/DELETE /api/employees
- GET/POST/PATCH/DELETE /api/org-units
- GET/POST/PATCH/DELETE /api/sales-channels
- GET/POST/PATCH/DELETE /api/order-statuses

### Reports

- GET /api/reports/orders (order registry with time-per-stage, filters: date range, status, client, channel)

## Telegram Bot

Built into NestJS as a module using nestjs-telegraf.

### Commands

- /start - Register / link to employee account
- /neworder - Start order creation wizard (step-by-step conversation)
- /orders - List active orders with inline status buttons
- /help - Available commands

### Order Creation Flow (wizard)

1. Bot asks: "Client name or phone?" -> search or create client
2. Bot asks: "What to order?" -> nomenclature items as inline buttons + quantity
3. Bot asks: "Sales channel?" -> inline buttons
4. Bot confirms: "Order summary. Create?" -> Yes / Edit / Cancel

### Status Transitions via inline keyboard buttons

- [Accept] [Reject] for New orders (admin)
- [Start Production] for Accepted orders (confectioner)
- [Mark Ready] for In Production orders (admin)
- [Close] for Ready orders (delivery)

### Notifications

- New order created -> notify workshop admin group chat
- Status changes -> notify relevant people
- Order exceeds max_time_in_status -> escalation notification (red color)

## Web UI (React SPA)

### Pages

- /login - Supabase Auth login form
- /orders - Order list table with filters and color indicators
- /orders/new - Create order form (react-hook-form)
- /orders/:id - Order detail + status history + action buttons
- /references/clients - Clients CRUD table
- /references/nomenclature - Nomenclature CRUD table
- /references/employees - Employees CRUD table
- /references/org-units - Org structure CRUD table
- /references/sales-channels - Sales channels CRUD table
- /references/order-statuses - Order statuses config table
- /reports - Order registry with time-per-stage columns

### Layout

- Sidebar navigation: Orders, References (expandable), Reports
- Top bar: user info + logout
- Role-based visibility: admin sees everything, confectioner sees orders only

### Real-time Updates

- Supabase Realtime subscriptions on orders table for live status updates in the UI

## Order Color Logic

Status-based:

- Green: order is progressing normally (each status transition resets to green)
- Red: order is stuck (exceeded max_time_in_status defined in order_statuses table)

## Key Design Decisions

1. price_at_order in order_items preserves the price at time of ordering (prices can change later)
2. order_status_history tracks entry/exit timestamps per status, powering time-per-stage reports
3. employees.user_id links to Supabase Auth for login
4. Status transitions enforced server-side (can only advance to next_status)
5. Telegram bot and Web UI share the same service layer (OrdersService)
6. Supabase Realtime for live order updates in the web UI
