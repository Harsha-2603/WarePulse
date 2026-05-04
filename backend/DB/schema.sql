-- =========================
-- EXTENSIONS
-- =========================
create extension if not exists pgcrypto;

-- =========================
-- ENUM-LIKE CHECKS
-- =========================
-- Using text columns with checks keeps it flexible and simple for Supabase.

-- =========================
-- SHOP (tenant / business)
-- =========================
create table if not exists shop (
  id uuid primary key default gen_random_uuid(),
  gst_number varchar(15) not null unique,
  shop_name varchar(150) not null,
  shop_type varchar(50) not null,
  phone varchar(15),
  email varchar(100),
  address_line1 varchar(200),
  address_line2 varchar(200),
  city varchar(50),
  state varchar(50),
  pincode varchar(10),
  country varchar(50) default 'India',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- USERS (app users / staff)
-- One shop can have many users.
-- If you use Supabase Auth, auth_user_id should match auth.users.id
-- =========================
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  shop_id uuid not null references shop(id) on delete cascade,
  full_name varchar(120) not null,
  email varchar(100) not null,
  phone varchar(15),
  role varchar(30) not null default 'staff',
  status varchar(20) not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_role_check check (role in ('owner','admin','manager','staff')),
  constraint users_status_check check (status in ('active','inactive','blocked'))
);

create index if not exists idx_users_shop_id on users(shop_id);
create index if not exists idx_users_email on users(email);

-- =========================
-- CATEGORY
-- =========================
create table if not exists category (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shop(id) on delete cascade,
  category_name varchar(100) not null,
  description varchar(255),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, category_name)
);

create index if not exists idx_category_shop_id on category(shop_id);

-- =========================
-- UNIT
-- Master unit table, shared across shops.
-- Example: kg, g, box, packet, litre
-- =========================
create table if not exists unit (
  id uuid primary key default gen_random_uuid(),
  unit_name varchar(50) not null unique,
  symbol varchar(20),
  created_at timestamptz not null default now()
);

-- =========================
-- PRODUCT
-- =========================
create table if not exists product (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shop(id) on delete cascade,
  unit_id uuid references unit(id) on delete restrict,
  product_name varchar(150) not null,
  vendor_name varchar(150),
  purchase_price numeric(12,2) not null default 0,
  selling_price numeric(12,2) not null default 0,
  low_stock_level numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, product_name)
);

create index if not exists idx_product_shop_id on product(shop_id);

-- =========================
-- INVENTORY
-- One row per product per shop.
-- Current stock is derived from purchases/sales/logs, but this table stores the live balance.
-- =========================
create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shop(id) on delete cascade,
  product_id uuid not null references product(id) on delete cascade,
  quantity_available numeric(12,2) not null default 0,
  reserved_quantity numeric(12,2) not null default 0,
  last_updated timestamptz not null default now(),
  unique (shop_id, product_id)
);

create index if not exists idx_inventory_shop_id on inventory(shop_id);
create index if not exists idx_inventory_product_id on inventory(product_id);

-- =========================
-- VENDOR
-- Proper master table, removes redundancy from vendor_payment
-- =========================
create table if not exists vendor (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shop(id) on delete cascade,
  vendor_name varchar(150) not null,
  gst_number varchar(15),
  phone varchar(15),
  email varchar(100),
  bank_account_number varchar(30),
  bank_ifsc_code varchar(20),
  bank_branch_name varchar(80),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, vendor_name),
  unique (shop_id, gst_number)
);

create index if not exists idx_vendor_shop_id on vendor(shop_id);

-- Migration/Cleanup: Drop unused address columns if they existed previously
alter table vendor drop column if exists address_line1;
alter table vendor drop column if exists address_line2;
alter table vendor drop column if exists city;
alter table vendor drop column if exists state;
alter table vendor drop column if exists pincode;

-- =========================
-- CUSTOMER
-- =========================
create table if not exists customer (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shop(id) on delete cascade,
  customer_name varchar(150) not null,
  phone varchar(15),
  email varchar(100),
  address varchar(250),
  customer_gst_number varchar(15),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, customer_name),
  unique (shop_id, phone),
  unique (shop_id, email),
  unique (shop_id, customer_gst_number)
);

create index if not exists idx_customer_shop_id on customer(shop_id);

-- =========================
-- PURCHASE
-- =========================
create table if not exists purchase (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shop(id) on delete cascade,
  vendor_id uuid NULL,
  purchase_date date not null default current_date,
  payment_due_date date,
  invoice_number varchar(80),
  subtotal numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  payment_status varchar(20) not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchase_payment_status_check check (payment_status in ('pending','partial','paid','failed','cancelled')),
  unique (shop_id, invoice_number)
);

create index if not exists idx_purchase_shop_id on purchase(shop_id);
create index if not exists idx_purchase_vendor_id on purchase(vendor_id);

-- =========================
-- PURCHASE ITEMS
-- =========================
create table if not exists purchase_item (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references purchase(id) on delete cascade,
  product_id uuid not null references product(id) on delete restrict,
  quantity numeric(12,2) not null check (quantity > 0),
  price_per_unit numeric(12,2) not null default 0,
  tax_percentage numeric(5,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0
);

create index if not exists idx_purchase_item_purchase_id on purchase_item(purchase_id);
create index if not exists idx_purchase_item_product_id on purchase_item(product_id);

-- =========================
-- SALES / ORDERS
-- Use one sales table as the source of truth.
-- This replaces the older sale/sale_item draft cleanly.
-- =========================
create table if not exists sale (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shop(id) on delete cascade,
  customer_id uuid references customer(id) on delete set null,
  sale_date date not null default current_date,
  invoice_number varchar(80),
  delivery_date date,
  subtotal numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  sale_status varchar(20) not null default 'completed',
  payment_status varchar(20) not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sale_sale_status_check check (sale_status in ('draft','confirmed','completed','cancelled','returned')),
  constraint sale_payment_status_check check (payment_status in ('pending','partial','paid','failed','refunded')),
  unique (shop_id, invoice_number)
);

create index if not exists idx_sale_shop_id on sale(shop_id);
create index if not exists idx_sale_customer_id on sale(customer_id);

-- =========================
-- SALE ITEMS
-- =========================
create table if not exists sale_item (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sale(id) on delete cascade,
  unit varchar(50),
  product_id uuid not null references product(id) on delete restrict,
  quantity numeric(12,2) not null check (quantity > 0),
  price_per_unit numeric(12,2) not null default 0,
  tax_percentage numeric(5,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0,
  shop_id uuid not null references shop(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_sale_item_sale_id on sale_item(sale_id);
create index if not exists idx_sale_item_product_id on sale_item(product_id);

-- =========================
-- INVOICE
-- =========================
create table if not exists invoice (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shop(id) on delete cascade,
  sale_id uuid not null references sale(id) on delete cascade,
  invoice_number varchar(80) not null,
  invoice_date date not null default current_date,
  cgst_amount numeric(12,2) not null default 0,
  sgst_amount numeric(12,2) not null default 0,
  igst_amount numeric(12,2) not null default 0,
  total_invoice_amount numeric(12,2) not null default 0,
  payment_mode varchar(20),
  invoice_status varchar(20) not null default 'generated',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoice_status_check check (invoice_status in ('generated','sent','paid','partially_paid','cancelled')),
  constraint invoice_payment_mode_check
  check (
    payment_mode is null
    or payment_mode in (
      'cash',
      'upi',
      'bank_transfer',
      'card',
      'credit'
    )
  ),
  unique (shop_id, invoice_number),
  unique (sale_id)
);

create index if not exists idx_invoice_shop_id on invoice(shop_id);
create index if not exists idx_invoice_sale_id on invoice(sale_id);

-- =========================
-- PAYMENT
-- =========================
create table if not exists payment (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shop(id) on delete cascade,
  invoice_id uuid not null references invoice(id) on delete cascade,
  payment_date date not null default current_date,
  payment_mode varchar(20) not null,
  amount_paid numeric(12,2) not null check (amount_paid >= 0),
  reference_number varchar(100),
  payment_status varchar(20) not null default 'success',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_status_check check (payment_status in ('success','pending','failed','refunded')),
  constraint payment_mode_check
check (
  payment_mode in (
    'cash',
    'upi',
    'bank_transfer',
    'card',
    'credit'
  )
)
);

create index if not exists idx_payment_shop_id on payment(shop_id);
create index if not exists idx_payment_invoice_id on payment(invoice_id);

-- =========================
-- STOCK LOG
-- Audit trail for every stock movement.
-- reference_type helps track purchase, sale, adjustment, return, etc.
-- =========================
create table if not exists stock_log (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shop(id) on delete cascade,
  product_id uuid not null references product(id) on delete cascade,
  quantity_changed numeric(12,2) not null,
  reference_type varchar(30) not null,
  reference_id uuid,
  reason text,
  created_at timestamptz not null default now(),
  constraint stock_log_reference_type_check check (
    reference_type in ('purchase','sale','return','adjustment','damage','transfer','opening_balance')
  )
);

create index if not exists idx_stock_log_shop_id on stock_log(shop_id);
create index if not exists idx_stock_log_product_id on stock_log(product_id);

-- =========================
-- UPDATED_AT TRIGGER
-- =========================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_shop_updated_at on shop;
create trigger trg_shop_updated_at
before update on shop
for each row execute function set_updated_at();

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at
before update on users
for each row execute function set_updated_at();

drop trigger if exists trg_category_updated_at on category;
create trigger trg_category_updated_at
before update on category
for each row execute function set_updated_at();

drop trigger if exists trg_product_updated_at on product;
create trigger trg_product_updated_at
before update on product
for each row execute function set_updated_at();

drop trigger if exists trg_inventory_updated_at on inventory;
create trigger trg_inventory_updated_at
before update on inventory
for each row execute function set_updated_at();

drop trigger if exists trg_vendor_updated_at on vendor;
create trigger trg_vendor_updated_at
before update on vendor
for each row execute function set_updated_at();

drop trigger if exists trg_customer_updated_at on customer;
create trigger trg_customer_updated_at
before update on customer
for each row execute function set_updated_at();

drop trigger if exists trg_purchase_updated_at on purchase;
create trigger trg_purchase_updated_at
before update on purchase
for each row execute function set_updated_at();

drop trigger if exists trg_sale_updated_at on sale;
create trigger trg_sale_updated_at
before update on sale
for each row execute function set_updated_at();

drop trigger if exists trg_invoice_updated_at on invoice;
create trigger trg_invoice_updated_at
before update on invoice
for each row execute function set_updated_at();

drop trigger if exists trg_payment_updated_at on payment;
create trigger trg_payment_updated_at
before update on payment
for each row execute function set_updated_at();