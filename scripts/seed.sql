-- Seed data for Restaurant CRM demo
-- Run against a fresh Supabase project after applying all migrations.
--
-- Auth credentials:
--   admin@restaurant.local          / admin123
--   delivery1@restaurant.local      / delivery123
--   sales1@restaurant.local         / sales123
--   confectionery1@restaurant.local / confectionery123

BEGIN;

-- ============================================================
-- 1. Auth users
-- ============================================================

INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at,
  confirmation_token, recovery_token,
  email_change_token_new, email_change
) VALUES
  ('00000000-0000-0000-0000-000000000000', 'e0f82cf2-e9e8-40a8-afe7-dcf42686ddef', 'authenticated', 'authenticated',
   'admin@restaurant.local', crypt('admin123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '5e046f94-eb18-4e8b-91ca-ab2638e0fad4', 'authenticated', 'authenticated',
   'delivery1@restaurant.local', crypt('delivery123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '216d56dc-eb8e-4525-b3ae-21687f186617', 'authenticated', 'authenticated',
   'sales1@restaurant.local', crypt('sales123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'f980f9db-e4dd-4b39-be32-08712a66e677', 'authenticated', 'authenticated',
   'confectionery1@restaurant.local', crypt('confectionery123', gen_salt('bf')), now(), now(), now(), '', '', '', '');

INSERT INTO auth.identities (id, user_id, provider, identity_data, provider_id, last_sign_in_at, created_at, updated_at) VALUES
  ('e0f82cf2-e9e8-40a8-afe7-dcf42686ddef', 'e0f82cf2-e9e8-40a8-afe7-dcf42686ddef', 'email',
   jsonb_build_object('sub', 'e0f82cf2-e9e8-40a8-afe7-dcf42686ddef', 'email', 'admin@restaurant.local'),
   'e0f82cf2-e9e8-40a8-afe7-dcf42686ddef', now(), now(), now()),
  ('5e046f94-eb18-4e8b-91ca-ab2638e0fad4', '5e046f94-eb18-4e8b-91ca-ab2638e0fad4', 'email',
   jsonb_build_object('sub', '5e046f94-eb18-4e8b-91ca-ab2638e0fad4', 'email', 'delivery1@restaurant.local'),
   '5e046f94-eb18-4e8b-91ca-ab2638e0fad4', now(), now(), now()),
  ('216d56dc-eb8e-4525-b3ae-21687f186617', '216d56dc-eb8e-4525-b3ae-21687f186617', 'email',
   jsonb_build_object('sub', '216d56dc-eb8e-4525-b3ae-21687f186617', 'email', 'sales1@restaurant.local'),
   '216d56dc-eb8e-4525-b3ae-21687f186617', now(), now(), now()),
  ('f980f9db-e4dd-4b39-be32-08712a66e677', 'f980f9db-e4dd-4b39-be32-08712a66e677', 'email',
   jsonb_build_object('sub', 'f980f9db-e4dd-4b39-be32-08712a66e677', 'email', 'confectionery1@restaurant.local'),
   'f980f9db-e4dd-4b39-be32-08712a66e677', now(), now(), now());

-- ============================================================
-- 2. Org Structure
-- ============================================================

INSERT INTO org_units (id, name) VALUES
  ('eaade740-b2c8-460f-a7df-6a6ae853bbf4', 'Administration'),
  ('5fdc57e8-6efb-4c12-b3d5-46e67e64ba22', 'Sales Department'),
  ('e1002ed1-f915-48af-b3be-c2b268ecf348', 'Confectionery Workshop'),
  ('45230336-7042-4376-a8ea-24e648b1f771', 'Delivery Service');

-- ============================================================
-- 3. Employees (references auth.users + org_units)
-- ============================================================

INSERT INTO employees (id, name, user_id, org_unit_id) VALUES
  ('79feb656-38f6-4529-a871-a8401f6a4257', 'Liudmyla Sydorenko',  'e0f82cf2-e9e8-40a8-afe7-dcf42686ddef', 'eaade740-b2c8-460f-a7df-6a6ae853bbf4'),
  ('8482ed6d-7d8e-4c45-9b8e-41b303b06b2b', 'Artem Honcharenko',   '5e046f94-eb18-4e8b-91ca-ab2638e0fad4', '45230336-7042-4376-a8ea-24e648b1f771'),
  ('96341783-3e42-44a0-9082-abd22bd88106', 'Svitlana Ivanova',    '216d56dc-eb8e-4525-b3ae-21687f186617', '5fdc57e8-6efb-4c12-b3d5-46e67e64ba22'),
  ('89bed5ae-0488-492d-98f6-dc29d173c5fb', 'Hanna Petrenko',      'f980f9db-e4dd-4b39-be32-08712a66e677', 'e1002ed1-f915-48af-b3be-c2b268ecf348');

-- ============================================================
-- 4. Sales Channels
-- ============================================================

INSERT INTO sales_channels (id, name) VALUES
  ('826737a7-f157-49e2-b3ab-6d5866a23a12', 'Telegram'),
  ('eab54eb9-8cd2-40a2-b210-0af264308a83', 'Instagram'),
  ('e07f0778-5b12-462d-a6c6-e5ef669bcb83', 'Website'),
  ('c0f63249-632c-4cd2-8b7b-9dd083aa1d1f', 'Phone');

-- ============================================================
-- 5. Nomenclature
-- ============================================================

INSERT INTO nomenclature_items (id, name, price) VALUES
  ('9c4c09e3-d5bc-4ff3-828a-81d21e05ede4', 'Kyiv Cake',              950.00),
  ('2305fae1-d9ed-4c81-af38-dc4af3962ece', 'Esterhazy Cake',        1100.00),
  ('270535f9-1431-4a02-b0d1-142029f6d29b', 'Honey Cake (Medovik)',   780.00),
  ('3c622bab-76d5-4e02-8acf-82418c97e76f', 'Napoleon Cake',          850.00),
  ('b00375bd-7c60-4d62-ab55-8e6b37fa5956', 'Prague Cake',            920.00),
  ('ee237841-9636-4a11-84d6-7c664c39cedb', 'New York Cheesecake',    720.00),
  ('ae06cdad-46d5-4fb0-8a62-84f27337c560', 'Tiramisu',               650.00),
  ('8f1863fd-8c50-44d6-b502-97e06e9521ba', 'Macarons (12 pcs)',      480.00),
  ('b42a13e3-833e-49af-9197-74572ec3054b', 'Eclairs (6 pcs)',        360.00),
  ('001c27ea-2ee6-44f6-90eb-65da024a1fb8', 'Croissants (4 pcs)',     280.00);

-- ============================================================
-- 6. Clients
-- ============================================================

INSERT INTO clients (id, name, phone) VALUES
  ('84bcc618-1378-42cd-8fb1-2b2e726722c0', 'Olena Kovalenko',      '+380509876543'),
  ('888e9c02-3028-4f7d-9858-14424fbf2497', 'Andrii Melnyk',        '+380509876543'),
  ('c995cb14-da44-4615-8244-968b42d4ee0a', 'Dmytro Shevchenko',    '+380509876543'),
  ('b2c5eade-bcd3-4f71-bd01-173cc7ade087', 'Iryna Bondarenko',     '+380509876543'),
  ('f86e0df3-772c-4986-a7cb-a2ceb08e775d', 'Mariia Polishchuk',    '+380504364900'),
  ('97af16c8-7361-4374-84e8-22ca7f08c26a', 'Nataliia Tkachenko',   '+380503878553'),
  ('4c9e56ac-74c7-4e4a-ae88-e0bab260f978', 'Oksana Lysenko',       '+380502528533'),
  ('3916dc1f-ee4b-4464-a89e-35d26a3910b5', 'Oleksandr Rudenko',    '+380502556630'),
  ('b57a17c6-2232-480d-a7e6-41f11743149e', 'Pavlo Hrytsenko',      '+380501303996'),
  ('2e9fa661-93f7-4133-b67a-51c1398fd134', 'Serhii Kravchenko',    '+380503043058'),
  ('7678517c-bb7a-4d34-b1aa-6ee3930bd1fe', 'Taras Moroz',          '+380502924818'),
  ('2fb90c66-0686-4556-adde-370716f4fad0', 'Tetiana Marchenko',    '+380507244470'),
  ('d3f680e9-d193-417b-b6f3-4f718f350fdc', 'Viktor Savchenko',     '+380504559154'),
  ('1da06b81-250e-494c-a6d7-46f6aa4f8f59', 'Yuliia Ponomarenko',   '+380501651203');

-- ============================================================
-- 7. Order Statuses (linked list)
-- ============================================================

INSERT INTO order_statuses (id, name, previous_status_id, next_status_id, sort_order, max_time_unconfirmed, max_time_in_status, escalation_action) VALUES
  ('00000000-0000-0000-0000-000000000001', 'New',           NULL,                                       '00000000-0000-0000-0000-000000000002', 1, 10,   30,  'send_telegram_alert'),
  ('00000000-0000-0000-0000-000000000002', 'Accepted',      '00000000-0000-0000-0000-000000000001',      '00000000-0000-0000-0000-000000000003', 2, 15,   60,  'notify_manager'),
  ('00000000-0000-0000-0000-000000000003', 'In Production', '00000000-0000-0000-0000-000000000002',      '00000000-0000-0000-0000-000000000004', 3, NULL, 480, 'auto_escalate'),
  ('00000000-0000-0000-0000-000000000004', 'Ready',         '00000000-0000-0000-0000-000000000003',      '00000000-0000-0000-0000-000000000005', 4, NULL, 120, 'send_telegram_alert'),
  ('00000000-0000-0000-0000-000000000005', 'Closed',        '00000000-0000-0000-0000-000000000004',      NULL,                                   5, NULL, NULL, 'none');

COMMIT;
