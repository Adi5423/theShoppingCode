# TheShoppingCode — Hyperlocal Marketplace Monorepo

[![Tech Stack](https://img.shields.io/badge/Stack-TypeScript%20%7C%20React%20Native%20%7C%20Node.js%20%7C%20Postgres-004437?style=for-the-badge)](#-tech-specs)
[![License: MIT](https://img.shields.io/badge/License-MIT-D5B38E?style=for-the-badge)](LICENSE)

A production-grade, dual-sided hyperlocal commerce ecosystem linking local merchants with customers in places like Lucknow. Empowering neighborhood storeowners with a mobile-first, camera-based barcode scanning inventory engine, and connecting shoppers to real-time maps to pinpoint local item availability.

---

## Table of Contents
1. [System Architecture](#-system-architecture)
2. [UI/UX & Design System](#-uiux--design-system)
3. [Monorepo Directory Walkthrough](#-monorepo-directory-walkthrough)
4. [Database Design & Schema](#-database-design--schema)
5. [Core Engine Implementations](#-core-engine-implementations)
6. [API Reference Directory](#-api-reference-directory)
7. [Local Environment Setup](#-local-environment-setup)

---

## Tech Specs

### Client Side
* **Framework**: React Native with **Expo SDK 57**
* **Theme & State**: Local Zustand Stores with hardware-backed persistent storage (`SecureStore`)
* **Navigation**: React Navigation v7 with dynamic Auth/Setup gatekeepers
* **Camera scanner**: Native `expo-camera` integration for high-frequency scan sweeps

### Backend Server
* **Engine**: Node.js v18+ running Express.js in Native ES Modules (`type: "module"`)
* **ORM**: Prisma Client utilizing native Pg pooling (`@prisma/adapter-pg`)
* **Database**: Serverless PostgreSQL (Neon)
* **Security & Audits**: Helmet HTTP headers, CORS configurations, express rate-limiting, BCrypt encryption, and JWT protection

---

## System Architecture

The application is engineered as a clean TypeScript monorepo splitting the backend services and the mobile frontend.

```mermaid
graph TD
    subgraph Client ["Mobile Client (Expo SDK 57)"]
        RN[React Native UI]
        Nav[AppNavigator - Navigation Gatekeeper]
        Store[Zustand Store + SecureStore]
    end

    subgraph Server ["Backend Service (Express.js)"]
        Auth[Auth Middleware]
        Route[Express Router]
        Ctrl[Controllers]
    end

    subgraph Data ["Data Layer"]
        Prisma[Prisma Client / Pg Adapter]
        DB[(PostgreSQL Database)]
        OFF[Open Food Facts API]
    end

    RN -->|HTTP Requests| Route
    Nav -->|Auth Checks /api/shop/me| Route
    Route --> Auth
    Auth --> Ctrl
    Ctrl --> Prisma
    Prisma --> DB
    Ctrl -.->|Self-learning barcode query| OFF
```

---

## 🎨 UI/UX & Design System

The app utilizes a premium **"Deep Forest & Warm Sand"** color palette, replacing generic templates with a high-end storefront feel:

* **Primary Tone**: Deep Forest Emerald (`#004437` Light / `#00C896` Dark contrast)
* **Accent Tone**: Warm Sand Gold (`#D5B38E`)
* **Base Backgrounds**: Off-White Warm Cream (`#FAF8F5`) for Light mode, Rich Charcoal Slate (`#0F1419` / `#1A2332`) for Dark mode.
* **Animations**: Native layout spring-interpolations, sweeping scan-lines, and micro-interactivity scales (`0.97` click compression).
* **Alert System**: Inline field-level warning banners + animated toast notification drops (no intrusive system alert popups).
* **Privacy Features**: Delayed password masking (character stays readable for `800ms` after typing before converting into `•`).

---

## Monorepo Directory Walkthrough

```text
hyperlocal-app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Database schemas (PostgreSQL)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts      # Authentication (Register, Login, OTP verification)
│   │   │   ├── catalog.controller.ts   # Barcode index lookup & self-learning triggers
│   │   │   ├── discovery.controller.ts # Geolocation discovery queries
│   │   │   ├── inventory.controller.ts # Merchant stock managers
│   │   │   ├── order.controller.ts     # Atomic checkout & receipt pipelines
│   │   │   └── shop.controller.ts      # Store profiles & hours managers
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts      # Role checkers & JWT validations
│   │   │   └── error.middleware.ts     # Error boundary sanitizers
│   │   ├── routes/
│   │   │   ├── auth.routes.ts          # Authentication router
│   │   │   ├── catalog.routes.ts       # Core catalog resolution router
│   │   │   ├── discovery.routes.ts     # Unprotected search paths
│   │   │   ├── health.routes.ts        # Ping/Warmup checks
│   │   │   ├── inventory.routes.ts     # Shop inventory controllers
│   │   │   ├── order.routes.ts         # Cart & order controllers
│   │   │   └── shop.routes.ts          # Merchant metadata settings
│   │   └── index.ts                    # Express app mount & PG adapters
│   ├── .env.example                    # Sample environment configurations
│   ├── package.json                    # Backend runtime metadata
│   └── tsconfig.json                   # Backend build configuration
│
├── mobile/
│   ├── assets/                         # Asset pack (Splash, icons, logos)
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   └── AuthScreen.tsx      # Login screen with inline alerts & smooth transitions
│   │   │   ├── customer/               # Shopper interface files
│   │   │   └── shop/
│   │   │       ├── ShopSetupScreen.tsx # Store creation steps
│   │   │       ├── ShopkeeperDashboard.tsx# Metric counts, theme toggle, open/close status
│   │   │       └── ShopkeeperHome.tsx  # Viewfinder scan, result imports
│   │   ├── navigation/
│   │   │   └── AppNavigator.tsx        # Navigation container & Gatekeeper
│   │   └── shared/
│   │       ├── api/
│   │       │   └── client.ts           # Axios instance, timeout handling, and server warmup
│   │       ├── components/
│   │       │   ├── Button.tsx          # Spring scale button
│   │       │   ├── InputField.tsx      # Secure input with error hooks
│   │       │   ├── StatusBar.tsx       # Auto-theme matching bar
│   │       │   └── Toast.tsx           # Global warning banner
│   │       ├── store/
│   │       │   ├── authStore.ts        # Zustand credentials to SecureStore
│   │       │   ├── themeStore.ts       # Dark theme config
│   │       │   └── toastStore.ts       # Global toast managers
│   │       └── theme.ts                # Base tokens and styling rules
│   ├── App.tsx                         # Client app mount root
│   ├── app.json                        # Expo build config
│   ├── index.ts                        # Client app entry
│   ├── package.json                    # Mobile client dependencies
│   └── tsconfig.json                   # Mobile client compiler setup
```

---

## Database Design & Schema

The Postgres data tier is modeled in [schema.prisma](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/prisma/schema.prisma) using explicit relational references to capture and secure checkout workflows:

```mermaid
erDiagram
    User ||--o| Shop : "owns"
    User ||--o{ Order : "places"
    Shop ||--o{ Inventory : "stocks"
    Shop ||--o{ Order : "receives"
    CatalogItem ||--o{ Inventory : "cataloged-in"
    Inventory ||--o{ OrderItem : "ordered-as"
    Order ||--|{ OrderItem : "contains"
    
    User {
        string id PK
        string phone UNIQUE
        string password
        string name
        Role role
    }

    Shop {
        string id PK
        string ownerId FK
        string name
        string category
        string address
        float latitude
        float longitude
        string upiId
        string openTime
        string closeTime
    }

    CatalogItem {
        string id PK
        string barcode UNIQUE
        string name
        string brand
        string variant
        string category
        string imageUrl
    }

    Inventory {
        string id PK
        string shopId FK
        string itemId FK
        float price
        string customDescription
        StockStatus status
    }

    Order {
        string id PK
        string customerId FK
        string shopId FK
        OrderStatus status
        float totalAmount
        dateTime createdAt
    }

    OrderItem {
        string id PK
        string orderId FK
        string inventoryId FK
        int quantity
        float price
    }
```

### Key Relational Safeguards
1. **Composite Unique Constraint (`[shopId, itemId]`)**: Located on `Inventory` to prevent duplicate catalog items inside a single merchant's stock.
2. **Price Snapshot Locking**: The `OrderItem` stores the transaction price at checkout (`price Float`). This isolates order history from updates a merchant may make to their inventory prices.
3. **Double Precision Geometry**: Explicit float models (`latitude`, `longitude`) allow fast distance computations.

---

## Core Engine Implementations

### 1. Unified Auth Gatekeeping
- Indian phone number pattern checks (`/^\+91\d{10}$/`).
- Hashed password verification via `bcryptjs` with salt round index `10`.
- Safe navigation guards: If an authenticated merchant logs in but hasn't created a shop profile, the gatekeeper intercepts navigation and routes them directly to `ShopSetupScreen` until onboarding is complete.

### 2. Barcode Lookup & Self-Learning Catalog
- Viewfinder checks local inventory barcodes (EAN-13, EAN-8, UPC-A, UPC-E).
- If database lacks reference, server pings the **Open Food Facts API**.
- Item specifications (Title, Brand, Pack variant, Category, Images) are parsed and registered as a new `CatalogItem`, ensuring immediate lookup on all future client scans.

```mermaid
sequenceDiagram
    participant Mobile as Mobile App (Camera Scan)
    participant Server as Express Server
    participant DB as Postgres Database
    participant OFF as Open Food Facts API

    Mobile->>Server: GET /api/catalog/search?barcode=123456
    Server->>DB: Check if catalog item exists
    alt Item Exists
        DB-->>Server: Return catalog item
        Server-->>Mobile: Return catalog item
    else Item Does Not Exist
        Server->>OFF: Fetch /api/v0/product/123456.json
        alt Product Found in OFF
            OFF-->>Server: Return OFF data
            Server->>DB: Save new CatalogItem
            DB-->>Server: Return saved item
            Server-->>Mobile: Return catalog item
        else Not Found Anywhere
            Server-->>Mobile: Return Empty Array (Not Found)
        end
    end
```

### 3. Transaction Isolation
- All checkout routines operate inside a database transaction (`$transaction`).
- Checks stock status (`IN_STOCK`) and validates merchant ownership before processing orders.
- Rolls back database updates completely if any step fails.

### 4. Cold-Start Mitigation
- To handle the Render Free Tier cold-start spin-up times, the client issues a silent `GET /api/health` request immediately on launch to trigger the container spin-up.
- Axios request timeout limits are optimized to `15` seconds with specialized toast warnings to notify users if the server container is currently waking.

---

## API Reference Directory

### Authentication Routing

#### Register Account
* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Auth**: Public
* **Payload**:
```json
{
  "phone": "+919876543210",
  "otp": "123456",
  "password": "securepassword123",
  "name": "Arjun Kumar",
  "role": "SHOPKEEPER"
}
```
* **Success (201)**:
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "2bc0832a-d9df-4a67-b50a-11db50175b9f",
    "role": "SHOPKEEPER",
    "name": "Arjun Kumar"
  }
}
```

#### Login Account
* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Auth**: Public
* **Payload**:
```json
{
  "phone": "+919876543210",
  "password": "securepassword123"
}
```
* **Success (200)**: Token & user metadata returned.

---

### Shop Profile Routing

#### Get Shop Metadata
* **URL**: `/api/shop/me`
* **Method**: `GET`
* **Auth**: JWT (Shopkeeper Role)
* **Success (200)**:
```json
{
  "id": "8c59f2a0-43ef-4f19-86ad-042cde99a4e3",
  "ownerId": "2bc0832a-d9df-4a67-b50a-11db50175b9f",
  "name": "Aditya Mega Mart",
  "category": "Grocery",
  "address": "123 Hazratganj, Lucknow, UP",
  "latitude": 26.8467,
  "longitude": 80.9462,
  "upiId": "aditya@okaxis",
  "openTime": "09:00",
  "closeTime": "21:00"
}
```

#### Onboard/Update Shop Profile
* **URL**: `/api/shop/setup`
* **Method**: `POST`
* **Auth**: JWT (Shopkeeper Role)
* **Payload**: Same keys as shop metadata schema.

---

### Catalog & Inventory Routing

#### Resolve Scan Target
* **URL**: `/api/catalog/search`
* **Method**: `GET`
* **Auth**: JWT
* **Query Params**:
  - `barcode`: EAN/UPC identifier string.
  - `query`: Fuzzy query matches on product names (used for general search).
* **Success (200)**: Catalog details array.

#### Add Catalog Item to Shop Inventory
* **URL**: `/api/inventory`
* **Method**: `POST`
* **Auth**: JWT (Shopkeeper Role)
* **Payload**:
```json
{
  "catalogItemId": "e2d83ab9-d830-4e5c-9c76-568b63e9f4c3",
  "price": 20.00,
  "customDescription": "Fresh stock arrived today",
  "status": "IN_STOCK"
}
```

---

### Order Discovery

#### Customer Checkout
* **URL**: `/api/orders`
* **Method**: `POST`
* **Auth**: JWT (Customer Role)
* **Payload**:
```json
{
  "shopId": "8c59f2a0-43ef-4f19-86ad-042cde99a4e3",
  "items": [
    {
      "inventoryId": "7616238b-d734-4bc7-95de-91ad34bfe9bc",
      "quantity": 2
    }
  ]
}
```

#### Public Stock Discovery Map search
* **URL**: `/api/discovery/search`
* **Method**: `GET`
* **Auth**: Public
* **Query Params**:
  - `query`: Matching item name details
* **Success (200)**: Geocoded inventory list with prices and shop locations.

---

## Local Environment Setup

### Prerequisites
- Node.js (v18.x or v20.x)
- Active PostgreSQL database connection

### 1. Database & Backend Configuration
1. Enter backend folder:
   ```bash
   cd backend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Copy environment sample:
   ```bash
   cp .env.example .env
   ```
4. Define parameters in `.env`:
   ```ini
   DATABASE_URL="postgresql://username:password@localhost:5432/hyperlocal_db?sslmode=prefer"
   JWT_SECRET="development_secret_key"
   PORT=5000
   ```
5. Deploy Prisma db schema:
   ```bash
   npx prisma db push
   ```
6. Run local server:
   ```bash
   npm run dev
   ```

### 2. Client Application setup
1. Enter mobile folder:
   ```bash
   cd mobile
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Run Local Metro server:
   ```bash
   npm run start
   ```
4. Launch emulator or Expo Go:
   - **Android Emulator**: Press `a`
   - **iOS Simulator**: Press `i`
   - **Expo Go (Physical Device)**: Scan QR code with your device camera
