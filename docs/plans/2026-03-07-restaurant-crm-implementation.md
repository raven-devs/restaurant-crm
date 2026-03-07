# Restaurant CRM Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-stack CRM for a cake ordering business with NestJS API, Telegram bot, and React web UI.

**Architecture:** Monorepo with NestJS backend (`src/`), React SPA (`web/`), and shared types (`shared/`). Supabase for database + auth. Telegram bot embedded as a NestJS module.

**Tech Stack:** NestJS 11, Supabase (PostgreSQL 17 + Auth + Realtime), nestjs-telegraf, React + Vite, shadcn/ui + Tailwind, @tanstack/react-query, react-hook-form, Sentry

**Design doc:** `docs/plans/2026-03-07-restaurant-crm-design.md`

---

## Phase 1: Foundation

### Task 1: Config module + environment variables

**Files:**

- Create: `src/config/config.module.ts`
- Create: `src/config/env.validation.ts`
- Modify: `src/app.module.ts`
- Modify: `package.json`

**Step 1: Install @nestjs/config and class-validator**

Run: `npm install @nestjs/config class-validator class-transformer`

**Step 2: Create env validation schema**

```typescript
// src/config/env.validation.ts
import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  SUPABASE_PROJECT_URL: string;

  @IsString()
  SUPABASE_URL: string;

  @IsNumber()
  PORT: number = 3000;

  @IsString()
  TELEGRAM_BOT_TOKEN: string;

  @IsString()
  TELEGRAM_CHAT_ID: string;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validated;
}
```

**Step 3: Create config module**

```typescript
// src/config/config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validate } from './env.validation.js';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
  ],
})
export class ConfigModule {}
```

**Step 4: Register in AppModule**

Import `ConfigModule` in `src/app.module.ts` imports array.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add config module with env validation"
```

---

### Task 2: Supabase client module

**Files:**

- Create: `src/supabase/supabase.module.ts`
- Create: `src/supabase/supabase.service.ts`
- Modify: `src/app.module.ts`
- Modify: `package.json`

**Step 1: Install @supabase/supabase-js**

Run: `npm install @supabase/supabase-js`

**Step 2: Create SupabaseService**

```typescript
// src/supabase/supabase.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.client = createClient(
      this.configService.getOrThrow<string>('SUPABASE_PROJECT_URL'),
      this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
```

Note: Add `SUPABASE_SERVICE_ROLE_KEY` to `.env` (get from Supabase dashboard > Settings > API > service_role key). This key bypasses RLS for server-side operations.

**Step 3: Create SupabaseModule (global)**

```typescript
// src/supabase/supabase.module.ts
import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service.js';

@Global()
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
```

**Step 4: Register in AppModule**

Import `SupabaseModule` in `src/app.module.ts`.

**Step 5: Test — verify app starts**

Run: `npm run start:dev`
Expected: App starts on port 3000 without errors.

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add Supabase client module"
```

---

### Task 3: Shared types and constants

**Files:**

- Create: `shared/types/index.ts`
- Create: `shared/types/order.ts`
- Create: `shared/types/reference.ts`
- Create: `shared/constants/order-statuses.ts`
- Modify: `tsconfig.json` (add path alias)

**Step 1: Configure tsconfig path alias**

Add to `tsconfig.json` compilerOptions:

```json
"paths": {
  "@shared/*": ["./shared/*"]
}
```

**Step 2: Create reference table types**

```typescript
// shared/types/reference.ts
export interface Client {
  id: string;
  name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface NomenclatureItem {
  id: string;
  name: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface OrgUnit {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  org_unit_id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesChannel {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface OrderStatus {
  id: string;
  name: string;
  previous_status_id: string | null;
  next_status_id: string | null;
  max_time_unconfirmed: string | null;
  max_time_in_status: string | null;
  escalation_action: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
```

**Step 3: Create order types**

```typescript
// shared/types/order.ts
import type {
  Client,
  NomenclatureItem,
  Employee,
  SalesChannel,
  OrderStatus,
} from './reference.js';

export interface Order {
  id: string;
  order_date: string;
  client_id: string;
  order_point: string | null;
  sales_channel_id: string;
  accepted_by_id: string | null;
  status_id: string;
  color: 'green' | 'red';
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  nomenclature_item_id: string;
  quantity: number;
  price_at_order: number;
  created_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status_id: string;
  entered_at: string;
  exited_at: string | null;
  changed_by_id: string | null;
}

export interface OrderWithRelations extends Order {
  client: Client;
  sales_channel: SalesChannel;
  accepted_by: Employee | null;
  status: OrderStatus;
  items: (OrderItem & { nomenclature_item: NomenclatureItem })[];
  status_history: (OrderStatusHistory & { status: OrderStatus })[];
}
```

**Step 4: Create order status constants**

```typescript
// shared/constants/order-statuses.ts
export const ORDER_STATUS_NAMES = {
  NEW: 'New',
  ACCEPTED: 'Accepted',
  IN_PRODUCTION: 'In Production',
  READY: 'Ready',
  CLOSED: 'Closed',
} as const;

export type OrderStatusName =
  (typeof ORDER_STATUS_NAMES)[keyof typeof ORDER_STATUS_NAMES];
```

**Step 5: Create barrel export**

```typescript
// shared/types/index.ts
export * from './reference.js';
export * from './order.js';
```

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add shared types and constants"
```

---

## Phase 2: Database

### Task 4: Database migrations — reference tables

Use `/x-db-migrate` skill or `mcp__supabase__apply_migration` directly.

**Step 1: Create clients table**

```sql
CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on clients" ON clients FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
```

**Step 2: Create nomenclature_items table**

```sql
CREATE TABLE IF NOT EXISTS nomenclature_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE nomenclature_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on nomenclature_items" ON nomenclature_items FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
```

**Step 3: Create org_units table**

```sql
CREATE TABLE IF NOT EXISTS org_units (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE org_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on org_units" ON org_units FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
```

**Step 4: Create sales_channels table**

```sql
CREATE TABLE IF NOT EXISTS sales_channels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE sales_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on sales_channels" ON sales_channels FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
```

**Step 5: Create employees table**

```sql
CREATE TABLE IF NOT EXISTS employees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  org_unit_id uuid REFERENCES org_units(id),
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on employees" ON employees FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
```

**Step 6: Create order_statuses table**

```sql
CREATE TABLE IF NOT EXISTS order_statuses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  previous_status_id uuid REFERENCES order_statuses(id),
  next_status_id uuid REFERENCES order_statuses(id),
  max_time_unconfirmed interval,
  max_time_in_status interval,
  escalation_action text,
  sort_order int NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE order_statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on order_statuses" ON order_statuses FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
```

**Step 7: Verify tables exist**

Run: `mcp__supabase__list_tables` with project_id `coueibyzoduppdwckdct`

**Step 8: Commit (note in commit message)**

```bash
git commit --allow-empty -m "feat: create reference tables in Supabase (clients, nomenclature_items, org_units, sales_channels, employees, order_statuses)"
```

---

### Task 5: Database migrations — order tables

**Step 1: Create orders table**

```sql
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_date timestamptz NOT NULL DEFAULT now(),
  client_id uuid NOT NULL REFERENCES clients(id),
  order_point text,
  sales_channel_id uuid NOT NULL REFERENCES sales_channels(id),
  accepted_by_id uuid REFERENCES employees(id),
  status_id uuid NOT NULL REFERENCES order_statuses(id),
  color text NOT NULL DEFAULT 'green',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on orders" ON orders FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
```

**Step 2: Create order_items table**

```sql
CREATE TABLE IF NOT EXISTS order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  nomenclature_item_id uuid NOT NULL REFERENCES nomenclature_items(id),
  quantity int NOT NULL DEFAULT 1,
  price_at_order numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on order_items" ON order_items FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
```

**Step 3: Create order_status_history table**

```sql
CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status_id uuid NOT NULL REFERENCES order_statuses(id),
  entered_at timestamptz NOT NULL DEFAULT now(),
  exited_at timestamptz,
  changed_by_id uuid REFERENCES employees(id)
);
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on order_status_history" ON order_status_history FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
```

**Step 4: Verify all tables exist**

Run: `mcp__supabase__list_tables`

**Step 5: Commit**

```bash
git commit --allow-empty -m "feat: create order tables in Supabase (orders, order_items, order_status_history)"
```

---

### Task 6: Seed order statuses

**Step 1: Insert the 5 workflow statuses**

```sql
INSERT INTO order_statuses (id, name, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'New', 1),
  ('00000000-0000-0000-0000-000000000002', 'Accepted', 2),
  ('00000000-0000-0000-0000-000000000003', 'In Production', 3),
  ('00000000-0000-0000-0000-000000000004', 'Ready', 4),
  ('00000000-0000-0000-0000-000000000005', 'Closed', 5)
ON CONFLICT (id) DO NOTHING;
```

**Step 2: Link the workflow chain (previous/next)**

```sql
UPDATE order_statuses SET next_status_id = '00000000-0000-0000-0000-000000000002' WHERE id = '00000000-0000-0000-0000-000000000001';
UPDATE order_statuses SET previous_status_id = '00000000-0000-0000-0000-000000000001', next_status_id = '00000000-0000-0000-0000-000000000003' WHERE id = '00000000-0000-0000-0000-000000000002';
UPDATE order_statuses SET previous_status_id = '00000000-0000-0000-0000-000000000002', next_status_id = '00000000-0000-0000-0000-000000000004' WHERE id = '00000000-0000-0000-0000-000000000003';
UPDATE order_statuses SET previous_status_id = '00000000-0000-0000-0000-000000000003', next_status_id = '00000000-0000-0000-0000-000000000005' WHERE id = '00000000-0000-0000-0000-000000000004';
UPDATE order_statuses SET previous_status_id = '00000000-0000-0000-0000-000000000004' WHERE id = '00000000-0000-0000-0000-000000000005';
```

**Step 3: Verify**

Run: `mcp__supabase__execute_sql` with `SELECT id, name, sort_order, previous_status_id, next_status_id FROM order_statuses ORDER BY sort_order`

**Step 4: Add status UUIDs to shared constants**

Update `shared/constants/order-statuses.ts` with the known UUIDs for use in code.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: seed order statuses with workflow chain"
```

---

## Phase 3: Reference Table Modules (CRUD)

### Task 7: Clients module

**Files:**

- Create: `src/clients/clients.module.ts`
- Create: `src/clients/clients.controller.ts`
- Create: `src/clients/clients.service.ts`
- Create: `src/clients/dto/create-client.dto.ts`
- Create: `src/clients/dto/update-client.dto.ts`
- Test: `src/clients/clients.controller.spec.ts`
- Modify: `src/app.module.ts`

**Step 1: Write the failing test**

Test that `ClientsController` is defined and has CRUD methods.

**Step 2: Create DTOs**

```typescript
// src/clients/dto/create-client.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateClientDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() phone: string;
}
```

```typescript
// src/clients/dto/update-client.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto.js';

export class UpdateClientDto extends PartialType(CreateClientDto) {}
```

**Step 3: Create service (Supabase queries)**

```typescript
// src/clients/clients.service.ts
@Injectable()
export class ClientsService {
  constructor(private supabase: SupabaseService) {}

  async findAll() {
    /* select from clients */
  }
  async findOne(id: string) {
    /* select by id */
  }
  async create(dto: CreateClientDto) {
    /* insert */
  }
  async update(id: string, dto: UpdateClientDto) {
    /* update */
  }
  async remove(id: string) {
    /* delete */
  }
}
```

**Step 4: Create controller**

Standard REST: GET /, GET /:id, POST /, PATCH /:id, DELETE /:id

**Step 5: Create module, register in AppModule**

**Step 6: Run tests**

Run: `npm test`

**Step 7: Test endpoint manually**

Run: `npm run start:dev`, then `curl http://localhost:3000/api/clients`

**Step 8: Commit**

```bash
git add -A && git commit -m "feat: add clients CRUD module"
```

---

### Task 8: Nomenclature module

Same CRUD pattern as Task 7.

**Files:**

- Create: `src/nomenclature/nomenclature.module.ts`
- Create: `src/nomenclature/nomenclature.controller.ts`
- Create: `src/nomenclature/nomenclature.service.ts`
- Create: `src/nomenclature/dto/create-nomenclature-item.dto.ts`
- Create: `src/nomenclature/dto/update-nomenclature-item.dto.ts`
- Modify: `src/app.module.ts`

DTO has: name (string), price (number).

**Commit:** `feat: add nomenclature CRUD module`

---

### Task 9: Org structure module

Same CRUD pattern. DTO has: name (string).

**Files:** `src/org-structure/` — module, controller, service, DTOs
**Commit:** `feat: add org-structure CRUD module`

---

### Task 10: Sales channels module

Same CRUD pattern. DTO has: name (string).

**Files:** `src/sales-channels/` — module, controller, service, DTOs
**Commit:** `feat: add sales-channels CRUD module`

---

### Task 11: Employees module

Same CRUD pattern. DTO has: name (string), org_unit_id (uuid), user_id (uuid, optional).

**Files:** `src/employees/` — module, controller, service, DTOs
**Commit:** `feat: add employees CRUD module`

---

### Task 12: Order statuses module

Same CRUD pattern. DTO has: name, previous_status_id, next_status_id, max_time_unconfirmed, max_time_in_status, escalation_action, sort_order.

**Files:** `src/order-statuses/` — module, controller, service, DTOs
**Commit:** `feat: add order-statuses CRUD module`

---

## Phase 4: Orders Module (Core Domain)

### Task 13: Orders service — create and list

**Files:**

- Create: `src/orders/orders.module.ts`
- Create: `src/orders/orders.controller.ts`
- Create: `src/orders/orders.service.ts`
- Create: `src/orders/dto/create-order.dto.ts`
- Create: `src/orders/dto/update-order.dto.ts`
- Create: `src/orders/dto/create-order-item.dto.ts`
- Test: `src/orders/orders.service.spec.ts`
- Modify: `src/app.module.ts`

**Step 1: Write failing test — createOrder creates order + items + initial status history**

**Step 2: Implement CreateOrderDto**

```typescript
export class CreateOrderDto {
  @IsString() client_id: string;
  @IsString() sales_channel_id: string;
  @IsOptional() @IsString() order_point?: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

export class CreateOrderItemDto {
  @IsString() nomenclature_item_id: string;
  @IsNumber() quantity: number;
}
```

**Step 3: Implement OrdersService.create()**

Logic:

1. Look up nomenclature item prices
2. Insert into `orders` with status = 'New' (first status UUID)
3. Insert into `order_items` with `price_at_order` from lookup
4. Insert into `order_status_history` (entered_at = now, status = New)
5. Return the created order

**Step 4: Implement OrdersService.findAll() with filters**

Query params: status_id, client_id, date_from, date_to. Join with client, status, sales_channel.

**Step 5: Implement OrdersService.findOne(id)**

Return order with items (joined with nomenclature_item) and status_history (joined with status).

**Step 6: Create controller with GET /, GET /:id, POST /**

**Step 7: Run tests, verify manually**

**Step 8: Commit**

```bash
git add -A && git commit -m "feat: add orders module with create and list"
```

---

### Task 14: Order status transitions

**Files:**

- Create: `src/orders/dto/transition-order-status.dto.ts`
- Modify: `src/orders/orders.service.ts`
- Modify: `src/orders/orders.controller.ts`
- Test: `src/orders/orders.service.spec.ts`

**Step 1: Write failing test — transitionStatus enforces workflow**

Test: transitioning from New to Accepted succeeds. Transitioning from New to Ready fails.

**Step 2: Implement OrdersService.transitionStatus(orderId, employeeId)**

Logic:

1. Get current order with status
2. Look up `next_status_id` from current status
3. If no next status, throw (already at final status)
4. Update `order_status_history`: set `exited_at = now()` on current entry
5. Insert new `order_status_history` entry (entered_at = now)
6. Update `orders.status_id` to next status
7. Update `orders.color` to 'green' (reset on transition)
8. Set `orders.accepted_by_id` if transitioning to Accepted

**Step 3: Add PATCH /api/orders/:id/status endpoint**

**Step 4: Run tests**

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add order status transition workflow"
```

---

### Task 15: Order items management

**Files:**

- Modify: `src/orders/orders.service.ts`
- Modify: `src/orders/orders.controller.ts`

**Step 1: Implement addItem, updateItem, removeItem**

**Step 2: Add POST/PATCH/DELETE /api/orders/:id/items endpoints**

**Step 3: Test manually**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add order items CRUD endpoints"
```

---

## Phase 5: Auth Module

### Task 16: Supabase Auth integration

**Files:**

- Create: `src/auth/auth.module.ts`
- Create: `src/auth/auth.controller.ts`
- Create: `src/auth/auth.service.ts`
- Create: `src/auth/auth.guard.ts`
- Create: `src/auth/dto/login.dto.ts`
- Modify: `src/app.module.ts`

**Step 1: Install Supabase Auth dependencies (already installed with @supabase/supabase-js)**

**Step 2: Create AuthService**

Methods:

- `login(email, password)` — call `supabase.auth.signInWithPassword()`
- `logout(token)` — call `supabase.auth.admin.signOut()`
- `getUser(token)` — call `supabase.auth.getUser(token)`, then look up employee by user_id

**Step 3: Create AuthGuard**

Extract Bearer token from Authorization header, call `supabase.auth.getUser(token)`, attach user to request.

**Step 4: Create AuthController**

- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me (guarded)

**Step 5: Apply AuthGuard globally or per-controller as needed**

**Step 6: Test login flow manually**

Create a test user in Supabase dashboard, then test `POST /api/auth/login`.

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add auth module with Supabase Auth"
```

---

## Phase 6: Reports Module

### Task 17: Order reports with time-per-stage

**Files:**

- Create: `src/reports/reports.module.ts`
- Create: `src/reports/reports.controller.ts`
- Create: `src/reports/reports.service.ts`
- Modify: `src/app.module.ts`

**Step 1: Implement ReportsService.getOrderReport()**

SQL query that joins orders with order_status_history and computes:

- Time since creation: `now() - orders.created_at`
- Time per stage: from `order_status_history` entries (exited_at - entered_at per status)

Filters: date_from, date_to, status_id, client_id, sales_channel_id.

**Step 2: Create controller GET /api/reports/orders**

**Step 3: Test with sample data**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add reports module with time-per-stage"
```

---

## Phase 7: Telegram Bot

### Task 18: Telegram bot setup

**Files:**

- Create: `src/telegram/telegram.module.ts`
- Create: `src/telegram/telegram.update.ts`
- Create: `src/telegram/telegram.service.ts`
- Modify: `src/app.module.ts`
- Modify: `package.json`

**Step 1: Install nestjs-telegraf**

Run: `npm install nestjs-telegraf telegraf`

**Step 2: Create TelegramModule**

Register TelegrafModule.forRootAsync() with bot token from ConfigService.

**Step 3: Create TelegramUpdate (handler class)**

Implement: @Start(), @Help(), @Command('orders'), @Command('neworder')

**Step 4: Create TelegramService**

Methods for: sending notifications, formatting order messages, creating inline keyboards.

**Step 5: Test — send /start to the bot**

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add Telegram bot module with basic commands"
```

---

### Task 19: Telegram order creation wizard

**Files:**

- Create: `src/telegram/scenes/new-order.scene.ts`
- Modify: `src/telegram/telegram.module.ts`
- Modify: `src/telegram/telegram.update.ts`

**Step 1: Implement scene wizard**

Steps: select client -> select items -> select channel -> confirm -> create order via OrdersService.

**Step 2: Register scene in TelegramModule**

**Step 3: Test the full flow in Telegram**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add Telegram order creation wizard"
```

---

### Task 20: Telegram status transitions + notifications

**Files:**

- Modify: `src/telegram/telegram.update.ts`
- Modify: `src/telegram/telegram.service.ts`

**Step 1: Add inline keyboard buttons for status transitions**

When listing orders, show action buttons based on current status.

**Step 2: Handle callback queries for status transitions**

Call OrdersService.transitionStatus() on button press.

**Step 3: Add notification on order creation and status change**

Send message to TELEGRAM_CHAT_ID group when orders are created/transitioned.

**Step 4: Test full workflow in Telegram**

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add Telegram status transitions and notifications"
```

---

## Phase 8: React Frontend

### Task 21: Scaffold React SPA with Vite

**Files:**

- Create: `web/` directory (Vite + React + TypeScript)
- Create: `web/package.json`
- Create: `web/vite.config.ts`
- Create: `web/tsconfig.json`
- Create: `web/index.html`
- Create: `web/src/main.tsx`
- Create: `web/src/App.tsx`

**Step 1: Scaffold Vite project**

Run: `cd web && npm create vite@latest . -- --template react-ts`

**Step 2: Install dependencies**

Run: `npm install @tanstack/react-query react-hook-form @supabase/supabase-js react-router-dom`

**Step 3: Set up shadcn/ui + Tailwind**

Run: `npx shadcn@latest init`

**Step 4: Configure Vite proxy for API**

In `vite.config.ts`, proxy `/api` to `http://localhost:3000`.

**Step 5: Configure path alias for @shared**

Add `@shared` alias in vite.config.ts pointing to `../shared`.

**Step 6: Verify — app starts**

Run: `npm run dev`

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: scaffold React SPA with Vite, shadcn/ui, and TanStack Query"
```

---

### Task 22: Auth pages + layout

**Files:**

- Create: `web/src/auth/AuthContext.tsx`
- Create: `web/src/auth/LoginPage.tsx`
- Create: `web/src/auth/ProtectedRoute.tsx`
- Create: `web/src/layout/AppLayout.tsx`
- Create: `web/src/layout/Sidebar.tsx`
- Modify: `web/src/App.tsx`

**Step 1: Create AuthContext with Supabase client**

**Step 2: Create LoginPage with react-hook-form**

**Step 3: Create ProtectedRoute wrapper**

**Step 4: Create AppLayout with sidebar (Orders, References, Reports) + top bar**

**Step 5: Set up react-router-dom routes**

**Step 6: Test login flow**

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add auth pages and app layout"
```

---

### Task 23: Reference table pages

**Files:**

- Create: `web/src/api/` — typed API client functions
- Create: `web/src/pages/references/ClientsPage.tsx`
- Create: `web/src/pages/references/NomenclaturePage.tsx`
- Create: `web/src/pages/references/EmployeesPage.tsx`
- Create: `web/src/pages/references/OrgUnitsPage.tsx`
- Create: `web/src/pages/references/SalesChannelsPage.tsx`
- Create: `web/src/pages/references/OrderStatusesPage.tsx`

**Step 1: Create reusable DataTable component (shadcn/ui Table)**

**Step 2: Create API client functions using fetch**

**Step 3: Create TanStack Query hooks (useQuery, useMutation) for each entity**

**Step 4: Implement CRUD pages — each with: table view, create modal (react-hook-form), edit modal, delete confirmation**

**Step 5: Test all 6 reference pages**

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add reference table pages with CRUD"
```

---

### Task 24: Orders pages

**Files:**

- Create: `web/src/pages/orders/OrdersListPage.tsx`
- Create: `web/src/pages/orders/OrderDetailPage.tsx`
- Create: `web/src/pages/orders/CreateOrderPage.tsx`
- Create: `web/src/api/orders.ts`
- Create: `web/src/hooks/useOrders.ts`

**Step 1: Create OrdersListPage**

Table with columns: date, client, items summary, status (badge), color (dot), actions.
Filters: status, date range, client search.

**Step 2: Create CreateOrderPage**

Multi-step form (react-hook-form): select client, add items with quantities, select channel, review + submit.

**Step 3: Create OrderDetailPage**

Show order details, items table, status history timeline, action buttons for status transitions.

**Step 4: Add Supabase Realtime subscription for live updates**

**Step 5: Test full order lifecycle in web UI**

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add orders pages with create, list, and detail views"
```

---

### Task 25: Reports page

**Files:**

- Create: `web/src/pages/reports/ReportsPage.tsx`
- Create: `web/src/api/reports.ts`

**Step 1: Create ReportsPage**

Table with all order fields + time since creation + time per stage columns.
Filters: date range, status, client, sales channel.
Export to CSV button (optional, nice to have).

**Step 2: Test with sample data**

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add reports page with time-per-stage"
```

---

## Phase 9: Sentry Integration

### Task 26: Add Sentry to NestJS and React

**Step 1: Use `/sentry-sdk-setup` skill for NestJS backend**

**Step 2: Use `/sentry-sdk-setup` skill for React frontend**

**Step 3: Verify errors appear in Sentry dashboard**

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add Sentry error monitoring"
```

---

## Phase 10: Global Middleware + Polish

### Task 27: Global validation pipe + API prefix

**Files:**

- Modify: `src/main.ts`

**Step 1: Add global ValidationPipe**

```typescript
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
```

**Step 2: Set global API prefix**

```typescript
app.setGlobalPrefix('api');
```

**Step 3: Enable CORS for Vite dev server**

```typescript
app.enableCors({ origin: 'http://localhost:5173' });
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add global validation, API prefix, and CORS"
```

---

## Execution Order Summary

```
Phase   Tasks      Description
───────────────────────────────────────────────────────
1       1-3        Foundation (config, Supabase, shared types)
2       4-6        Database migrations + seed data
3       7-12       Reference table CRUD modules (6 modules)
4       13-15      Orders module (create, list, transitions, items)
5       16         Auth module (Supabase Auth)
6       17         Reports module
7       18-20      Telegram bot (setup, wizard, notifications)
8       21-25      React frontend (scaffold, auth, refs, orders, reports)
9       26         Sentry integration
10      27         Global middleware + polish
```

Total: 27 tasks across 10 phases. Each task is independently committable.
