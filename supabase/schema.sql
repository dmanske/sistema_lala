-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. CLIENTS
create table clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  birth_date date,
  phone text,
  whatsapp text,
  city text,
  notes text,
  photo_url text,
  status text check (status in ('ACTIVE', 'INACTIVE', 'ATTENTION')) default 'ACTIVE',
  credit_balance decimal(10, 2) default 0.00,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. PROFESSIONALS
create table professionals (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  color text,
  commission_percentage decimal(5, 2) default 0.00,
  status text check (status in ('ACTIVE', 'INACTIVE')) default 'ACTIVE',
  phone text,
  email text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. SERVICES
create table services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  duration_minutes integer not null,
  cost decimal(10, 2) default 0.00,
  price decimal(10, 2) not null,
  commission_percentage decimal(5, 2),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 4. PRODUCTS
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  cost decimal(10, 2) default 0.00,
  price decimal(10, 2) not null,
  min_stock integer default 0,
  current_stock integer default 0, -- Cache column, updated by triggers or logic
  commission_percentage decimal(5, 2),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 5. SUPPLIERS
create table suppliers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  cnpj text,
  email text,
  phone text,
  whatsapp text,
  address text,
  notes text,
  status text check (status in ('ACTIVE', 'INACTIVE')) default 'ACTIVE',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 6. PURCHASES
create table purchases (
  id uuid primary key default uuid_generate_v4(),
  supplier_id uuid references suppliers(id),
  date date not null,
  total_amount decimal(10, 2) default 0.00,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table purchase_items (
  id uuid primary key default uuid_generate_v4(),
  purchase_id uuid references purchases(id) on delete cascade,
  product_id uuid references products(id),
  quantity integer not null,
  unit_cost decimal(10, 2) not null
);

-- 7. APPOINTMENTS
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id),
  professional_id uuid references professionals(id),
  date date not null,
  start_time time not null,
  duration_minutes integer not null,
  status text check (status in ('PENDING', 'CONFIRMED', 'CANCELED', 'NO_SHOW', 'DONE')) default 'PENDING',
  notes text,
  total_value decimal(10, 2) default 0.00,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table appointment_services (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid references appointments(id) on delete cascade,
  service_id uuid references services(id),
  price decimal(10, 2) not null -- Price at the moment of appointment
);

-- 8. SALES (Checkout)
create table sales (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id),
  appointment_id uuid references appointments(id),
  total_amount decimal(10, 2) not null,
  status text check (status in ('DRAFT', 'PENDING_PAYMENT', 'PAID', 'CANCELED', 'REFUNDED')) default 'PAID',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table sale_items (
  id uuid primary key default uuid_generate_v4(),
  sale_id uuid references sales(id) on delete cascade,
  item_type text check (item_type in ('PRODUCT', 'SERVICE')),
  item_id uuid, -- Can be product_id or service_id
  quantity integer not null,
  unit_price decimal(10, 2) not null,
  total_price decimal(10, 2) not null
);

create table sale_payments (
  id uuid primary key default uuid_generate_v4(),
  sale_id uuid references sales(id) on delete cascade,
  method text check (method in ('PIX', 'CARD', 'CASH', 'TRANSFER', 'CREDIT', 'FIADO')),
  amount decimal(10, 2) not null,
  paid_at timestamp with time zone default now()
);

-- 9. PRODUCT MOVEMENTS (Source of Truth for Stock)
create table product_movements (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id),
  type text check (type in ('IN', 'OUT')),
  quantity integer not null,
  reason text,
  reference_id uuid, -- ID of purchase or sale
  reference_type text check (reference_type in ('PURCHASE', 'SALE', 'ADJUSTMENT')),
  created_at timestamp with time zone default now()
);

-- 10. CREDIT TRANSACTIONS (Client Balance)
create table credit_transactions (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id),
  type text check (type in ('CREDIT', 'DEBIT')),
  amount decimal(10, 2) not null,
  origin text, -- CASH, PIX, etc.
  notes text,
  created_at timestamp with time zone default now()
);

-- RLS POLICIES (Simple for now: allow anon/service_role public access or restrict?)
-- For this setup, we will enable RLS but create policies to allow access for now since auth logic isn't fully migrated.
-- To be safe, we will leave RLS disabled on tables initially or create permissive policies.
-- Let's Enable RLS but add a policy for "anon" if the user hasn't set up Auth users yet.
-- Actually, better to Enable RLS and allow public access for now to mirror localstorage behavior, 
-- then lock it down when Auth is ready.

alter table clients enable row level security;
create policy "Allow public access" on clients for all using (true);

alter table professionals enable row level security;
create policy "Allow public access" on professionals for all using (true);

alter table services enable row level security;
create policy "Allow public access" on services for all using (true);

alter table products enable row level security;
create policy "Allow public access" on products for all using (true);

alter table suppliers enable row level security;
create policy "Allow public access" on suppliers for all using (true);

alter table purchases enable row level security;
create policy "Allow public access" on purchases for all using (true);

alter table purchase_items enable row level security;
create policy "Allow public access" on purchase_items for all using (true);

alter table appointments enable row level security;
create policy "Allow public access" on appointments for all using (true);

alter table appointment_services enable row level security;
create policy "Allow public access" on appointment_services for all using (true);

alter table sales enable row level security;
create policy "Allow public access" on sales for all using (true);

alter table sale_items enable row level security;
create policy "Allow public access" on sale_items for all using (true);

alter table sale_payments enable row level security;
create policy "Allow public access" on sale_payments for all using (true);

alter table product_movements enable row level security;
create policy "Allow public access" on product_movements for all using (true);

alter table credit_transactions enable row level security;
create policy "Allow public access" on credit_transactions for all using (true);
