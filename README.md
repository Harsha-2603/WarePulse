<div align="center">

# 🌌 WAREPULSE

### **Next-Gen Multi-Tenant Inventory & Supply Chain SaaS Platform**

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316194?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

*Enterprise-grade multitenancy, dynamic inventory lifecycles, and transaction-driven operational tracking.*

**[🌐 Experience Live Demo](https://ware-pulse.vercel.app/)** • **[🚀 View API Reference](#11-api-examples)** • **[📈 System Design](#5-architecture-section)**

</div>

---

## 📖 Table of Contents
1. [🌟 Hero & Overview](#1-hero-section)
2. [🖼️ Showcase Banner](#2-beautiful-project-banner)
3. [🔍 About WarePulse](#3-about-warepulse)
4. [⚡ Core Features](#4-core-features)
5. [🏗️ System Architecture](#5-architecture-section)
6. [🗄️ Database Design](#6-database-design)
7. [📁 Directory Structure](#7-folder-structure)
8. [🔐 Authentication & Tenant Isolation](#8-authentication--security)
9. [🔄 Inventory Lifecycle & Workflows](#9-inventory-workflow)
10. [📸 Application Showcase](#10-screenshots-section)
11. [🛰️ Secure API Specifications](#11-api-examples)
12. [⚙️ Installation & Developer Guide](#12-installation-guide)
13. [📄 Environment Configurations](#13-environment-variables)
14. [🚀 Production Deployment](#14-deployment)
15. [⚡ Performance Engineering](#15-performance-optimizations)
16. [🗺️ Strategic Roadmap](#16-future-roadmap)
17. [🤝 Contribution Protocols](#17-contributing-section)
18. [📜 License](#18-license-section)

---

## 1. Hero Section

WarePulse is a high-performance, **transaction-driven supply chain and inventory management platform** designed to bring absolute traceability and commercial rigor to mid-market retail and wholesale businesses.

Instead of simple spreadsheets or basic CRUD inventory cards, WarePulse structures inventory around a **rigorous double-entry operational model**. Every item is tracked from initial vendor purchase order, through multi-shop isolated stock balance adjustments, up to the final customer invoice receipt.

```
┌────────────────┐      ┌─────────────────┐      ┌──────────────┐
│  VENDOR INTAKE  │ ───> │ MULTI-TENANT DB │ ───> │ CUSTOMER OUT │
│ Purchase Order │      │  RLS Isolated   │      │ Invoice Sale │
└────────────────┘      └─────────────────┘      └──────────────┘
```

* **Zero-Trust Multi-Tenancy:** Dynamic sub-query tenant routing ensures complete isolation across hundreds of merchant shops under a single database cluster.
* **Transaction Rollback Controls:** Programmatic stock reduction and financial reconciliation run inside highly stable relational transaction boundaries to prevent mismatched totals or phantom orders.
* **Blazing Fast Analytics:** Native database caching, localized search filters, and query optimizations deliver real-time stock state rendering.

---

## 2. Beautiful Project Banner

<div align="center">

```
========================================================================================
||                                 [ SYSTEM BANNER ]                                  ||
||                                                                                    ||
||   +----------------------------------------------------------------------------+   ||
||   |                              WarePulse SaaS                                |   ||
||   |   [Shop Selected: Hyd-Warehouse-A]                             [User Profile]  |   ||
||   +----------------------------------------------------------------------------+   ||
||   |  [Dashboard]   [Inventory List]   [Vendor Orders]   [Customer Bills]       |   ||
||   +----------------------------------------------------------------------------+   ||
||   |  +-------------------+  +--------------------+  +-----------------------+  |   ||
||   |  | Stock Turnover    |  | Pending Deliveries |  | Real-time Alert Panel |  |   ||
||   |  | [||||||||||] 84%  |  | [12 Orders Ready]  |  | [Low Stock: 3 Products]  |   ||
||   |  +-------------------+  +--------------------+  +-----------------------+  |   ||
||   +----------------------------------------------------------------------------+   ||
========================================================================================
```
<!-- 
  NOTE: PLACEHOLDER FOR RECRUITER VISUAL SHOWCASE
  Later replace this section with high-res responsive mockups:
  - [Dashboard screenshot] -> (/assets/screenshots/dashboard_mockup.png)
  - [Inventory page screenshot] -> (/assets/screenshots/inventory_mockup.png)
  - [Orders page screenshot] -> (/assets/screenshots/orders_mockup.png)
  - [Reports page screenshot] -> (/assets/screenshots/reports_mockup.png)
-->
</div>

---

## 3. About WarePulse

In mid-sized commerce operations, stock inconsistencies result in severe capital leakages. Standard CRUD architectures allow arbitrary updates to inventory tables without leaving financial audit trails, causing stock levels to drift away from physical reality.

WarePulse solves this with **strict, double-entry transactional accounting**:
* **The Vendor-to-Sale Lifecycle:** Inventory is treated as a ledger. Stock *only* increases via verified purchase intake logs linked to vendors and *only* decreases via customer-confirmed checkout lists.
* **Absolute Financial Accountability:** Line subtotals, vendor taxes, and retail prices are calculated directly from verified database product records, rendering unauthorized price tampering completely impossible.
* **Engineered for SaaS Scale:** By implementing dynamic Supabase-driven JWT verification layers and database-level multi-tenant shop keys, WarePulse allows large multi-franchise owners to isolate and monitor multiple distinct shop locations under a single cohesive dashboard view.

---

## 4. Core Features

| Feature Component | Subsystem Capability | Architectural Implementation |
| :--- | :--- | :--- |
| **🔒 Zero-Trust Security** | Advanced multi-tenant isolation | Tenant shop mapping, route middleware validation, and Supabase Row-Level Security (RLS). |
| **📦 Dynamic Inventory** | Automated vendor-to-stock intake | Programmatic stock matching, automatic units of measure normalization (trim/symbol matching), and CSV bulk loaders. |
| **📈 Live Stock Auditing** | Prevent stock mismatch events | Transaction-safe, dual-phase programmatic rollback checks ensuring zero stock reduction when orders fail. |
| **💰 Ledger & Billing** | Secure transaction invoicing | Backend calculated pricing layers protecting against frontend price tampering. Supports payment status hooks. |
| **🏢 Vendor Integrations** | Multi-vendor master details | Relational mapping connecting vendor catalogues directly with inventory logs, purchase histories, and RLS gates. |
| **📋 Orders Pipeline** | Wholesale cart operations | Anti-duplicate submission locks (10-second checks), instant optimistic UI updates, and range-based pagination. |
| **📊 Real-time Reports** | Automated balance monitoring | Low-stock visual alert trackers, inventory cost calculations, and live performance skeletons. |
| **📱 Dynamic Design** | High-fidelity responsiveness | Premium, responsive React layout built on tailwind structures with animated CSS-pulse loading state grids. |

---

## 5. Architecture Section

WarePulse separates concerns cleanly across a client-facing React web tier, an Express-based application backend controller layer, and a highly secure Supabase database backend.

### 🏢 System Topography

```mermaid
graph TD
    %% Frontend Tier
    subgraph Frontend ["Client Tier (React & Tailwind)"]
        UI["React SPA (Vite)"]
        Context["Global State Contexts (Auth, Inventory, Orders)"]
        API["Axios Service API Clients"]
    end

    %% Application Tier
    subgraph Backend ["Application Controller Tier (Node.js & Express)"]
        Router["Express Router Gates"]
        AuthMid["JWT Auth Middleware"]
        Controller["Business Logic Controllers (Order, CSV, Product)"]
        Service["Transaction Service Engine"]
    end

    %% Database Tier
    subgraph Database ["Supabase Storage & DB Cluster"]
        PG["PostgreSQL Server"]
        RLS["Row-Level Security (RLS) Filter Engine"]
        Cache["Product & Session Memory Caching"]
    end

    %% Connections
    UI --> Context
    Context --> API
    API -- "Secure HTTPS Requests + JWT Bearer" --> Router
    Router --> AuthMid
    AuthMid --> Controller
    Controller --> Service
    Service -- "Tenant Isolated Service-Role Direct Queries" --> PG
    PG --> RLS
    Service -.-> Cache
```

---

### 🔑 Authentication & Session Verification Flow

This diagram demonstrates how WarePulse isolates sessions, preventing JWT impersonation or tenant bypass.

```mermaid
sequenceDiagram
    autonumber
    actor Merchant as Merchant Client
    participant API as Express Router API
    participant JWT as Auth Middleware (JWT/Supabase)
    participant Service as Order & Billing Engine
    participant DB as Postgres Instance

    Merchant->>API: POST /api/orders (Payload + JWT Auth Header)
    activate API
    API->>JWT: Verify Bearer Token Integrity
    activate JWT
    Note over JWT: Decrypts claims, checks expiration,<br/>extracts merchant shop_id & user_id
    JWT-->>API: Valid Session (shop_id: 0x8F9A)
    deactivate JWT

    API->>Service: Dispatch createOrder(shop_id, customer_id, cartItems)
    activate Service
    
    Service->>DB: Query Product Cache & Stock Balances (shop_id filter)
    activate DB
    DB-->>Service: Return DB-Validated Product Selling Prices & Current Stocks
    deactivate DB

    Note over Service: Securely calculate totals locally<br/>and verify Stock Availability
    
    Service->>DB: Sequence Master-Detail SQL Write & Stock Decrement
    activate DB
    DB-->>Service: SQL Success Commit
    deactivate DB
    
    Service-->>API: Return Standard JSON Order Payload + Nested Items
    deactivate Service
    
    API-->>Merchant: Dispatch 201 Created (Instant UI State Synced)
    deactivate API
```

---

### 🔄 Multi-Stage Inventory Transaction Lifecycle

```mermaid
graph LR
    A["Merchant Initiates Order"] --> B{"Check Stock Levels"}
    B -- "Insufficient Stock" --> C["Abrupt Transaction Termination"]
    C --> D["Return 400 Bad Request (Zero DB Write)"]
    
    B -- "Stock Available" --> E["Create Sale Master Row (Draft Status)"]
    E --> F["Bulk Create Sale Items & Link to Order ID"]
    F --> G["Decrement Inventory Quantities (Postgres)"]
    
    G -- "SQL Failure / System Crash" --> H["Execute Service Programmatic Rollback"]
    H --> I["Restore Stock Counts & Delete Sale Master Row"]
    I --> J["Return 500 Internal Server Error"]
    
    G -- "All Writes Confirmed" --> K["Log Inventory Movement Record"]
    K --> L["Return 201 Success Payload to Client"]
```

---

## 6. Database Design

WarePulse utilizes a PostgreSQL database structure, enforcing relational constraints to guarantee commercial accounting consistency.

```
                  ┌──────────────────────┐
                  │        shops         │
                  └──────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌──────────────────────┐           ┌──────────────────────┐
│       products       │           │      customers       │
└──────────────────────┘           └──────────────────────┘
            │                                 │
            ├────────────────┐                │
            ▼                ▼                ▼
┌──────────────────────┐  ┌──────────────────────┐
│      inventory       │  │        sales         │
└──────────────────────┘  └──────────────────────┘
                             │
                             ▼
                          ┌──────────────────────┐
                          │     sales_items      │
                          └──────────────────────┘
```

### Table Specifications

#### 1. `shop`
* **Purpose:** Represents the core merchant tenant. All data is isolated by its unique tenant key.
* **Fields:** `id` (UUID, PK), `shop_name` (Text), `created_at` (Timestamp).

#### 2. `users`
* **Purpose:** Stores user profiles and assigns users to specific shops for multi-tenant isolation.
* **Fields:** `id` (UUID, PK), `auth_user_id` (UUID, FK to Supabase Auth), `shop_id` (UUID, FK to `shop`), `email` (Text), `role` (Text), `created_at` (Timestamp).

#### 3. `product`
* **Purpose:** Defines distinct product varieties, linking to custom vendors and standard measurement units.
* **Fields:** `id` (UUID, PK), `shop_id` (UUID, FK to `shop`), `unit_id` (UUID, FK to `unit`), `product_name` (Text), `sku` (Text), `selling_price` (Numeric), `created_at` (Timestamp).

#### 4. `inventory`
* **Purpose:** Tracks live quantities available for products in individual shop locations.
* **Fields:** `id` (UUID, PK), `shop_id` (UUID, FK to `shop`), `product_id` (UUID, FK to `product`), `quantity_available` (Numeric), `last_updated` (Timestamp).

#### 5. `customer`
* **Purpose:** Maintains client databases for invoice generation and specific wholesale profiles.
* **Fields:** `id` (UUID, PK), `shop_id` (UUID, FK to `shop`), `customer_name` (Text), `phone` (Text), `email` (Text), `created_at` (Timestamp).

#### 6. `sale` (Header Record)
* **Purpose:** The master record representing a customer checkout order.
* **Fields:** `id` (UUID, PK), `shop_id` (UUID, FK to `shop`), `customer_id` (UUID, FK to `customer`), `invoice_number` (Text, Unique), `total_amount` (Numeric), `payment_status` (Text), `delivery_date` (Date), `notes` (Text), `created_at` (Timestamp).

#### 7. `sale_item` (Line Item Details)
* **Purpose:** Represents individual line-items matching a parent order.
* **Fields:** `id` (UUID, PK), `sale_id` (UUID, FK to `sale` ON DELETE CASCADE), `product_id` (UUID, FK to `product`), `quantity` (Numeric), `price_per_unit` (Numeric), `tax_amount` (Numeric), `line_total` (Numeric).

#### 8. `vendor`
* **Purpose:** Catalogues external wholesale manufacturers and vendors supplying inventory.
* **Fields:** `id` (UUID, PK), `shop_id` (UUID, FK to `shop`), `vendor_name` (Text), `email` (Text), `phone` (Text).

---

## 7. Folder Structure

The repository is modularly split into standalone clean frontend and backend sub-architectures:

```
warepulse/
├── backend/
│   ├── DB/
│   │   ├── diagnostics.sql       # Local schema troubleshooting queries
│   │   ├── fix_rls.sql           # Database RLS recovery template
│   │   └── schema.sql            # Master production database DDL
│   ├── src/
│   │   ├── controllers/          # Business routers & endpoint logic handlers
│   │   │   ├── authController.js
│   │   │   ├── orderController.js
│   │   │   └── productController.js
│   │   ├── middleware/           # Route interceptors (Auth, Tenant mapping)
│   │   │   └── authMiddleware.js
│   │   ├── routes/               # Express endpoint path declarations
│   │   │   ├── authRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── productRoutes.js
│   │   ├── services/             # Core computational engines & DB rollbacks
│   │   │   ├── csvService.js
│   │   │   ├── orderService.js
│   │   │   └── productService.js
│   │   └── server.js             # Server orchestrator config
│   ├── .env                      # Local developer configuration env
│   ├── .gitignore                # DB directory & dependency exclusion rules
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/           # Reusable generic widgets & layouts
    │   ├── contexts/             # Global hooks and store abstractions
    │   │   ├── AuthContext.jsx
    │   │   ├── InventoryContext.jsx
    │   │   └── OrderContext.jsx
    │   ├── features/             # Context-aware pages & modals
    │   │   ├── inventory/
    │   │   │   ├── AddInventoryModal.jsx
    │   │   │   └── InventoryCard.jsx
    │   │   └── orders/
    │   │       ├── CreateOrderModal.jsx
    │   │       └── OrdersTable.jsx
    │   ├── pages/                # Parent route screens (Dashboard, Inventory, Orders)
    │   ├── services/             # API request wrappers
    │   └── utils/                # Date parsers & data normalizers
    └── vite.config.js
```

---

## 8. Authentication & Tenant Isolation

WarePulse uses a **zero-trust multi-tenant isolation scheme** to protect cross-merchant databases.

```
                    ┌────────────────────────────┐
                    │ Client HTTP Request + JWT  │
                    └────────────────────────────┘
                                   │
                                   ▼
                    ┌────────────────────────────┐
                    │  Express Auth Middleware   │
                    └────────────────────────────┘
                                   │
                     Decrypt JWT & Extract shop_id
                                   │
                                   ▼
                    ┌────────────────────────────┐
                    │  Tenant-Strict DB Query:   │
                    │  WHERE shop_id = $shop_id  │
                    └────────────────────────────┘
```

1. **Transient Multi-Client Isolation:**
   * During sign-in, authentication controllers initialize an isolated transient client (`authClient`) with disabled session persistency to isolate token generation.
   * The server's master administrative database connection remains clean and protected, ensuring RLS bypass parameters are never exposed or tampered with.
2. **Dynamic JWT Filtering Middleware:**
   * Front-end clients attach a valid authorization token (`Authorization: Bearer <JWT>`) with every server request.
   * `authMiddleware.js` intercepts, checks integrity, extracts the authenticated user's `shop_id` tenant identifier, and binds it securely to `req.user.shopId`.
3. **Database Tenant Enforcements:**
   * Backend services completely block direct query interfaces. All PostgreSQL commands query explicit `shop_id` equality matches.
   * Merged with Postgres RLS policies, merchants are securely locked within their own workspace limits. Shop A cannot list, fetch, or mutate Shop B's customers, products, or orders.

---

## 9. Inventory Workflow

The inventory workflow maintains a chronological timeline of balance adjustments to ensure a high-fidelity audit trail.

```
   [1. Intake Setup]          [2. Purchase Intake]         [3. Stock Balancing]
 ┌───────────────────┐       ┌────────────────────┐       ┌────────────────────┐
 │  Define Unit &    │ ───>  │ Verify Vendor      │ ───>  │ Auto-reconcile SKU │
 │  Register Product │       │  Purchase Invoice  │       │  Inbound Balances  │
 └───────────────────┘       └────────────────────┘       └────────────────────┘
                                                                     │
                                                                     ▼
   [6. Revenue Clear]          [5. Checkout Outbound]      [4. Cart Reservation]
 ┌───────────────────┐       ┌────────────────────┐       ┌────────────────────┐
 │  Trigger Ledger   │ <───  │ Verify DB Pricing  │ <───  │ Anti-Duplicate &   │
 │  Payment Success  │       │  & Deduct Balance  │       │  Validate Limits   │
 └───────────────────┘       └────────────────────┘       └────────────────────┘
```

1. **Product Initialization:** Products are registered alongside a clean symbol mapping (`kg`, `tons`).
2. **Vendor Purchase Intake:** Purchase bills verify inventory supply additions, logging direct vendor allocations.
3. **Double-Entry CSV Mapping:** Raw spreadsheet items are parsed. Unit symbols are automatically resolved to exact database IDs, filtering out invalid rows while staging the valid items for bulk imports.
4. **Checkout Reservation:** During checkout, backend engines check real-time stock levels, rejecting orders that exceed available balances.
5. **Programmatic Settlement:** Header sales are created first, followed by child details. If any step fails, stock changes are rolled back completely.

---

## 10. Screenshots Section

<div align="center">

### 🔐 Multi-Tenant Secure Sign In Page
<!-- 
  NOTE: PLACEHOLDER FOR USER SHOWCASE
  Later replace this comment with screenshot:
  ![Login Screen](/assets/screenshots/login_view.png)
-->
*Secure, token-backed login isolating session profiles instantly on load.*

---

### 📊 Real-Time Operations & Alerts Dashboard
<!-- 
  NOTE: PLACEHOLDER FOR USER SHOWCASE
  Later replace this comment with screenshot:
  ![Dashboard Screen](/assets/screenshots/dashboard_view.png)
-->
*Real-time alert panels, stock valuation analytics, and inventory health metrics.*

---

### 📦 Optimized Inventory Catalog Grid
<!-- 
  NOTE: PLACEHOLDER FOR USER SHOWCASE
  Later replace this comment with screenshot:
  ![Inventory Screen](/assets/screenshots/inventory_view.png)
-->
*Advanced unit normalization, CSV bulk loader gates, and dynamic low-stock tags.*

---

### 📋 Enterprise Orders Management Table
<!-- 
  NOTE: PLACEHOLDER FOR USER SHOWCASE
  Later replace this comment with screenshot:
  ![Orders Screen](/assets/screenshots/orders_view.png)
-->
*Range-based pagination lists, status trackers, and optimistic creation grids.*

</div>

---

## 11. API Examples

All endpoints require authentication headers. Use the secure bearer structure below for integration.

### 1. User Session Initialization
* **Endpoint:** `POST /api/auth/login`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "email": "manager@hyderabadwarehouse.com",
  "password": "your_secure_password"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Session initialized successfully.",
  "token": "your_jwt_secret_token",
  "user": {
    "id": "7b8c9d2e-4f5a-6b7c-8d9e-0f1a2b3c4d5e",
    "email": "manager@hyderabadwarehouse.com",
    "shopId": "d6b40587-aa22-4d35-ba5c-c4e2148add2c"
  }
}
```

---

### 2. CSV Product Bulk Import
* **Endpoint:** `POST /api/products/import`
* **Headers:** 
  * `Authorization: Bearer your_jwt_secret_token`
  * `Content-Type: application/json`
* **Request Body:**
```json
{
  "shop_id": "d6b40587-aa22-4d35-ba5c-c4e2148add2c",
  "products": [
    { "product_name": "Premium Basmati Rice", "sku": "RIC-BAS-001", "unit": "kg", "selling_price": 120, "quantity": 500 },
    { "product_name": "Organic Wheat Flour", "sku": "FLR-WHT-002", "unit": "bags_25kg", "selling_price": 850, "quantity": 120 }
  ]
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Bulk import completed successfully.",
  "importedCount": 2,
  "errors": []
}
```

---

### 3. Create Multi-Item Order (with Rollback Protection)
* **Endpoint:** `POST /api/orders`
* **Headers:** 
  * `Authorization: Bearer your_jwt_secret_token`
  * `Content-Type: application/json`
* **Request Body:**
```json
{
  "shop_id": "d6b40587-aa22-4d35-ba5c-c4e2148add2c",
  "customer_id": "acb204e0-0fd2-4751-9ec5-13c1dd5ac336",
  "delivery_date": "2026-06-05",
  "notes": "Deliver to Hyderabad warehouse bay 4",
  "items": [
    { "product_id": "6627c66c-67a9-4f84-9c5f-e8c656c4bea5", "quantity": 10 },
    { "product_id": "32201bdb-deba-487d-b09a-b2c46cdba006", "quantity": 5 }
  ]
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "orderId": "30630cf2-874d-47bc-9c83-d51ca515ae7c",
  "totalAmount": 10250.00,
  "paymentStatus": "pending",
  "invoiceNumber": "ORD-2026-0491"
}
```
* **Stock Exhaustion Failure (400 Bad Request):**
```json
{
  "success": false,
  "message": "Only 3 stock available for product ID: 6627c66c-67a9-4f84-9c5f-e8c656c4bea5. Operation cancelled."
}
```

---

## 12. Installation Guide

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)
* **PostgreSQL Database** (Or Supabase Account)

---

### Phase 1: Database Setup
1. Log in to your **Supabase Workspace** dashboard.
2. Select your project and navigate to the **SQL Editor**.
3. Copy the contents of `backend/DB/schema.sql` and run them to generate the necessary tables, indexes, and primary keys.
4. (Optional) Run `backend/DB/fix_rls.sql` if you need to reset default user row security controls.

---

### Phase 2: Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file using the safe templates below:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

---

### Phase 3: Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Set up the local environment file `.env.development`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the frontend local server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## 13. Environment Variables

To run the application securely in production, configure these variables in your hosting dashboard. **Do not commit real values to version control.**

### Backend Env (`backend/.env`)

```env
# 🛰️ Server Connection Settings
PORT=5000

# ⚡ Supabase Core API Connection
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# 🔒 Enterprise Keys (Keep Private!)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
```

### Frontend Env (`frontend/.env.production`)

```env
# 🛰️ Backend Route Endpoint
VITE_API_URL=https://your-backend-api.render.com/api

# ⚡ Client Public Access Credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 14. Deployment

WarePulse is optimized for high-availability cloud setups:

```
┌─────────────────┐       ┌────────────────────┐       ┌──────────────────┐
│   Vercel Edge   │ ───>  │ Render Web Service │ ───>  │  Supabase Cloud  │
│ Static Frontend │       │  Node/Express API  │       │  Postgres + RLS  │
└─────────────────┘       └────────────────────┘       └──────────────────┘
```

### 1. Frontend: Deploy to Vercel
* Connect your repository to Vercel.
* Set the root directory to `frontend`.
* Add `VITE_API_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` to the environment variables.
* Hit **Deploy**. Vercel will build and serve your React SPA globally via its edge networks.

### 2. Backend: Deploy to Render
* Create a new Web Service on Render and link your repository.
* Set the build command to `npm install` and the start command to `node src/server.js`.
* Set the base directory to `backend`.
* Configure your env values: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `JWT_SECRET`.

### 3. Production Security Checklist
* Ensure SSL is set to **Force** on all backend endpoints.
* Double-check that your `SUPABASE_SERVICE_ROLE_KEY` is never exposed to the frontend build assets.
* Verify that `.env` files are added to your `.gitignore` to prevent leaks.

---

## 15. Performance Engineering

WarePulse is built to handle scaling and high query volumes efficiently:

* **Relational Indexes:** Native indexes optimize multi-tenant lookups and database queries:
  * `idx_sale_shop_id` speeds up tenant filtering.
  * `idx_sale_item_sale_id` optimizes nested joins for line items.
  * `idx_sale_created_at` optimizes sorted, paginated lists.
* **Component Memoization:** React hooks (`useMemo`, `useCallback`) cache expensive array filters and callback functions, preventing redundant state updates.
* **Product Details Caching:** A temporary memory cache inside creation services stores product lookup values, reducing database queries for duplicate items in bulk payloads.
* **Range-Based Pagination:** Database queries fetch only the required chunk of data using PostgreSQL `.range()` parameters, reducing load times.
* **Memory Safety Safeguards:** Mount tracking refs (`isMountedRef`) wrap asynchronous states, preventing memory leak warnings on unmounted pages.

---

## 16. Future Roadmap

- [ ] **🤖 AI Supply Forecasting:** Dynamic predictive analytics to forecast demand based on historical turnover.
- [ ] **🏷️ Barcode Integration:** Mobile camera integrations to support quick physical barcode scanning.
- [ ] **📱 Native Mobile Clients:** Lightweight Android and iOS apps for warehouse floor staff.
- [ ] **📄 Automated PDF Billing:** Automatic generation of professional PDF invoices sent directly to customer emails.
- [ ] **🔔 Web Push Notifications:** Real-time push alerts when stock falls below safety levels.
- [ ] **💼 Granular RBAC Permissions:** Custom roles (e.g., Accountant, Warehouse Staff, Manager) with granular action permissions.

---

## 17. Contributing Section

We follow secure open-source guidelines to maintain software quality.

1. **Fork the Repository** to your own developer account.
2. **Create a Feature Branch** (`git checkout -b feature/amazing-improvement`).
3. **Commit Your Changes** with clear comments (`git commit -m "feat: integrate realtime barcode scanner"`).
4. **Push the Branch** (`git push origin feature/amazing-improvement`).
5. **Open a Pull Request** explaining your changes.

*Note: All code changes must pass linting and build checks before being merged.*

---

## 18. License Section

Distributed under the MIT License. See [LICENSE](LICENSE) for more details.

---

## 19. Professional Footer

<div align="center">

**WarePulse** is built with ❤️ using React, Node.js, and Supabase.

For custom licensing, white-label SaaS setups, or corporate deployments, contact [WarePulse Core Engineering](https://ware-pulse.vercel.app/).

**[🌐 Return to live website: ware-pulse.vercel.app](https://ware-pulse.vercel.app/)**

</div>
