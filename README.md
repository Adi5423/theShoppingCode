# Hyperlocal Marketplace Monorepo

A production-grade hyperlocal commerce application designed to digitize and connect local brick-and-mortar stores with customers. The platform supports real-time geolocated item search, on-demand catalog item resolution (self-learning barcode lookup), local price management, role-based navigation flow, and atomic transactional ordering.

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Monorepo Folder Walkthrough](#monorepo-folder-walkthrough)
3. [Database Design & Schema](#database-design--schema)
4. [Functional Implementation Guides](#functional-implementation-guides)
    - [1. JWT Authentication & Encryption](#1-jwt-authentication--encryption)
    - [2. Merchant Onboarding & Geofencing Configuration](#2-merchant-onboarding--geofencing-configuration)
    - [3. Barcode Resolution & Self-Learning Catalog](#3-barcode-resolution--self-learning-catalog)
    - [4. Multi-Tenant Inventory Customizations](#4-multi-tenant-inventory-customizations)
    - [5. Transactional Order Pipeline & Price Isolation](#5-transactional-order-pipeline--price-isolation)
    - [6. Customer Discovery API](#6-customer-discovery-api)
    - [7. Mobile Navigation Gatekeeper Flow](#7-mobile-navigation-gatekeeper-flow)
5. [API Reference Manual](#api-reference-manual)
6. [Local Environment Setup](#local-environment-setup)

---

## System Architecture

The project is structured as a TypeScript monorepo separated into a robust backend service and an Expo-based cross-platform mobile frontend.

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

### Key Technical Specs
* **Backend Runtime**: Node.js v18+ with ES Modules (`type: "module"`).
* **Database**: PostgreSQL paired with Prisma Client using a native PostgreSQL pool adapter (`@prisma/adapter-pg`).
* **Mobile Frontend**: Expo (SDK 57) using React Native, TypeScript, React Navigation v7, and Zustand for state persistence.
* **Security & Reliability**: Helmet headers, CORS policies, rate limiting protection, JWT-based authentication, and Bcrypt cryptography.

---

## Monorepo Folder Walkthrough

```text
hyperlocal-app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Database schema models (PostgreSQL)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts      # Hashed registration & Login credentials
│   │   │   ├── catalog.controller.ts   # Product catalog search & self-learning integration
│   │   │   ├── discovery.controller.ts # Customer public inventory locator
│   │   │   ├── inventory.controller.ts # Shopkeeper local product catalog and description builder
│   │   │   ├── order.controller.ts     # Atomic ordering with price capture
│   │   │   └── shop.controller.ts      # Store profile setup and hours management
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts      # JWT Validation & role verification middleware
│   │   │   └── error.middleware.ts     # Global request error boundaries
│   │   ├── routes/
│   │   │   ├── auth.routes.ts          # Express auth routing (Register/Login)
│   │   │   ├── catalog.routes.ts       # Global master product catalog endpoints
│   │   │   ├── discovery.routes.ts     # Unprotected customer search endpoints
│   │   │   ├── inventory.routes.ts     # Merchant stock inventory updates
│   │   │   ├── order.routes.ts         # Customer ordering endpoints
│   │   │   └── shop.routes.ts          # Shop profile retrieval & setup
│   │   └── index.ts                    # Server initialization, Pg pools, and routing
│   ├── .env.example                    # Sample environment variables
│   ├── package.json                    # Backend scripts & runtime modules
│   └── tsconfig.json                   # TypeScript build target configurations
│
├── mobile/
│   ├── assets/                         # Splash screen, logo, & static media assets
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   └── AuthScreen.tsx      # Unified Login/Register screen with theme toggle
│   │   │   ├── customer/               # Customer search, map discovery screens
│   │   │   └── shop/
│   │   │       ├── ShopSetupScreen.tsx # Multi-field shop setup wizard
│   │   │       └── ShopkeeperHome.tsx  # Camera-based barcode scanner & pricing page
│   │   ├── navigation/
│   │   │   └── AppNavigator.tsx        # Dynamic navigation router and gatekeeper
│   │   └── shared/
│   │       ├── api/
│   │       │   └── client.ts           # Axios request wrapper with JWT interpolation
│   │       ├── store/
│   │       │   ├── authStore.ts        # Zustand auth state mapped to SecureStore
│   │       │   └── themeStore.ts       # Zustand color schema store
│   │       └── theme.ts                # Light & Dark color schemas and spacing tokens
│   ├── App.tsx                         # React entry component mounting AppNavigator
│   ├── app.json                        # Expo app metadata configuration
│   ├── index.ts                        # Native entry script (registers App)
│   ├── package.json                    # Native frontend dependencies & scripts
│   └── tsconfig.json                   # TypeScript config for Expo compiler
└── .gitignore                          # Monorepo git exclusion directives
```

---

## Database Design & Schema

The data tier is managed via Prisma in [backend/prisma/schema.prisma](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/prisma/schema.prisma). The layout is designed to prevent duplicate configurations, lock in historical pricing snapshots, and enable geolocation indexes.

### Relational Mapping Model

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

### Key Architectural Choices:
1. **Composite Unique Constraint (`[shopId, itemId]`)**: Located on the `Inventory` model. This structural rule ensures that a shopkeeper can never create duplicate inventory rows for the same catalog product.
2. **Price Snapshot Pattern**: The `OrderItem` model copies the unit `price` of the item at the exact moment of order placement. This decouples completed transactions from subsequent price fluctuations made by shopkeepers.
3. **Double Precision Lat/Lng Coordinates**: Stores explicit coordinates using floating-point attributes (`latitude`, `longitude`) in the `Shop` model to allow exact distance calculations.

---

## Functional Implementation Guides

### 1. JWT Authentication & Encryption
Authentication is implemented in [auth.controller.ts](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/src/controllers/auth.controller.ts).
* **Indian Phone Validation**: Ensures all registering phone numbers match the standard `+91` code followed by exactly 10 digits (`/^\+91\d{10}$/`).
* **Password Encryption**: All password credentials are salted and hashed using `bcryptjs` with a cost factor of 10.
* **Token Issuance**: Generates cryptographically signed JWT tokens carrying user IDs and roles with a 30-day expiration window.
* **Development OTP Bypass**: To simplify testing, a developer-friendly OTP verification code (`123456`) is hardcoded in the register endpoint.

### 2. Merchant Onboarding & Geofencing Configuration
When users register under the `SHOPKEEPER` role, they transition through a step-by-step onboarding layout.
* **Fields Configured**: Enforces database capturing for payment information (UPI ID), business category (e.g. Grocery, Pharmacy), coordinates (latitude/longitude), and working hours (`openTime`, `closeTime`).
* **Upsert Optimization**: The setup endpoint uses Prisma's `upsert` mechanism. If the shopkeeper profile exists, the backend executes an update; otherwise, it handles creation.

### 3. Barcode Resolution & Self-Learning Catalog
The catalog engine in [catalog.controller.ts](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/src/controllers/catalog.controller.ts) includes a self-learning loop to prevent manual catalog creation bottlenecks.
1. The scanning terminal sends a barcode (EAN-13, EAN-8, UPC-A, UPC-E) to `/api/catalog/search`.
2. The controller attempts a rapid local look-up.
3. If missing, the controller fetches product details directly from the open-source **Open Food Facts API**.
4. The product title, brand name, variant size, categories, and product images are extracted and created as a new `CatalogItem` in the database.
5. Future scans immediately resolve locally without needing another external network roundtrip.

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

### 4. Multi-Tenant Inventory Customizations
Shopkeepers can import items from the global master catalog into their local store inventory.
* **Custom Description Override**: Merchants can supplement generic item descriptions with custom shopkeeper descriptions (e.g. "Includes extra 10% bonus gram weight inside!").
* **Stock Tracking**: Maintains an inventory availability status of `IN_STOCK`, `LOW_STOCK`, or `OUT_OF_STOCK` to alert customers before they place orders.

### 5. Transactional Order Pipeline & Price Isolation
To safeguard the system against data discrepancies during high-concurrency order placement:
* **Atomic Transactions**: Executed within a database `$transaction` wrapper in [order.controller.ts](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/src/controllers/order.controller.ts). If any step fails (e.g., database network disconnects, an item goes out of stock mid-operation), the entire order is rolled back cleanly.
* **Pre-Flight Validation**: Validates that all requested items are marked as `IN_STOCK` and belong to the correct merchant.
* **Price Freezing**: Isolates unit prices dynamically at checkout and locks them into the `OrderItem` schema.

### 6. Customer Discovery API
Allows public, non-authenticated shoppers to search local items.
* **Open Routing**: Endpoints are kept public under `/api/discovery/search` to maximize conversion rates.
* **Dynamic Mapping**: Resolves full product descriptions, current pricing, shop descriptions, and active store coordinates.

### 7. Mobile Navigation Gatekeeper Flow
The client navigation in [AppNavigator.tsx](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/mobile/src/navigation/AppNavigator.tsx) acts as a structural gatekeeper.
* **Dynamic Routing**:
  - Unauthenticated users are routed to the `AuthScreen` (supports login & registration mode).
  - Authenticated shopkeepers are wrapped in a `ShopkeeperRoot` component. This gatekeeper runs a pre-flight request to `/api/shop/me` to determine if a store profile exists.
  - If no store profile is configured, the router loads the `ShopSetupScreen` and blocks access to the barcode scanner. Once onboarding is complete, navigation updates to load the standard scanner dashboard.
  - Authenticated customers bypass the gatekeeper and load the customer dashboard screens.
* **Storage and Stores**: Uses **Zustand** stores (`authStore.ts` and `themeStore.ts`) to manage tokens, user roles, and UI theme states. Tokens and roles are securely persisted to device hardware via Expo's `SecureStore`.

---

## API Reference Manual

> [!NOTE]  
> All POST/PUT payloads require a request header configuration of `Content-Type: application/json`. JWT-protected routes expect the standard header `Authorization: Bearer <your_jwt_token>`.

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
* **Success Response (201)**:
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
* **Success Response (200)**:
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

---

### Shop Profile Routing

#### Get Current User's Shop
* **URL**: `/api/shop/me`
* **Method**: `GET`
* **Auth**: Verified JWT (Shopkeeper Only)
* **Success Response (200)**:
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

#### Setup/Update Shop Profile
* **URL**: `/api/shop/setup`
* **Method**: `POST`
* **Auth**: Verified JWT (Shopkeeper Only)
* **Payload**:
```json
{
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
* **Success Response (200)**: Returns the newly created or updated shop object payload.

---

### Catalog Routing

#### Search Master Catalog
* **URL**: `/api/catalog/search`
* **Method**: `GET`
* **Auth**: Verified JWT
* **Query Parameters**:
  - `barcode`: Enforces an exact barcode lookup (triggering Open Food Facts self-learning if missing).
  - `query`: Fuzzy query matches on product names (used for general search).
* **Success Response (200)**:
```json
{
  "items": [
    {
      "id": "e2d83ab9-d830-4e5c-9c76-568b63e9f4c3",
      "barcode": "8901491101830",
      "name": "Lays Magic Masala",
      "brand": "Lay's",
      "variant": "50g",
      "category": "Snacks",
      "imageUrl": "https://images.openfoodfacts.org/..."
    }
  ]
}
```

#### Add Global Catalog Item Manually
* **URL**: `/api/catalog`
* **Method**: `POST`
* **Auth**: Verified JWT
* **Payload**:
```json
{
  "barcode": "8901491101830",
  "name": "Lays Magic Masala",
  "brand": "Lay's",
  "variant": "50g",
  "category": "Snacks",
  "imageUrl": "https://..."
}
```
* **Success Response (201)**: Returns the newly created catalog item object.

---

### Inventory Routing

#### Upsert Local Inventory Item
* **URL**: `/api/inventory`
* **Method**: `POST`
* **Auth**: Verified JWT (Shopkeeper Only)
* **Payload**:
```json
{
  "catalogItemId": "e2d83ab9-d830-4e5c-9c76-568b63e9f4c3",
  "price": 20.00,
  "customDescription": "Fresh stock arrived today",
  "status": "IN_STOCK"
}
```
* **Success Response (200)**:
```json
{
  "inventory": {
    "id": "7616238b-d734-4bc7-95de-91ad34bfe9bc",
    "shopId": "8c59f2a0-43ef-4f19-86ad-042cde99a4e3",
    "itemId": "e2d83ab9-d830-4e5c-9c76-568b63e9f4c3",
    "price": 20.00,
    "customDescription": "Fresh stock arrived today",
    "status": "IN_STOCK",
    "updatedAt": "2026-07-18T16:00:00Z"
  }
}
```

---

### Customer Order Routing

#### Place Order
* **URL**: `/api/orders`
* **Method**: `POST`
* **Auth**: Verified JWT (Customer Only)
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
* **Success Response (201)**:
```json
{
  "message": "Order placed successfully",
  "order": {
    "id": "3bc246b0-c831-419b-a012-c284fe983f2a",
    "customerId": "119f18a2-9b2f-410a-b32c-63b018ea69cb",
    "shopId": "8c59f2a0-43ef-4f19-86ad-042cde99a4e3",
    "status": "PENDING",
    "totalAmount": 40.00,
    "createdAt": "2026-07-18T16:05:00Z",
    "items": [
      {
        "id": "9ac184bb-731c-439f-9c09-020ab20e03ca",
        "orderId": "3bc246b0-c831-419b-a012-c284fe983f2a",
        "inventoryId": "7616238b-d734-4bc7-95de-91ad34bfe9bc",
        "quantity": 2,
        "price": 20.00
      }
    ]
  }
}
```

---

### Discovery Routing

#### Hyperlocal Stock Lookup
* **URL**: `/api/discovery/search`
* **Method**: `GET`
* **Auth**: Public
* **Query Parameters**:
  - `query`: Text input matching item name details
* **Success Response (200)**:
```json
[
  {
    "inventoryId": "7616238b-d734-4bc7-95de-91ad34bfe9bc",
    "price": 20.00,
    "itemDetails": {
      "id": "e2d83ab9-d830-4e5c-9c76-568b63e9f4c3",
      "barcode": "8901491101830",
      "name": "Lays Magic Masala",
      "brand": "Lay's",
      "variant": "50g",
      "category": "Snacks",
      "imageUrl": "https://..."
    },
    "shopDetails": {
      "id": "8c59f2a0-43ef-4f19-86ad-042cde99a4e3",
      "name": "Aditya Mega Mart",
      "address": "123 Hazratganj, Lucknow, UP",
      "latitude": 26.8467,
      "longitude": 80.9462
    }
  }
]
```

---

## Local Environment Setup

Ensure you have **Node.js (v18.x or v20.x)** and a **PostgreSQL Database** instance ready.

### 1. Database & Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the environmental variables:
   ```bash
   cp .env.example .env
   ```
4. Configure your `.env` configuration credentials:
   ```ini
   DATABASE_URL="postgresql://username:password@localhost:5432/hyperlocal_db?sslmode=prefer"
   JWT_SECRET="development_secret_key"
   PORT=5000
   ```
5. Apply database migrations to synchronize your Postgres schema:
   ```bash
   npx prisma db push
   ```
6. Start the local Express server in watch mode:
   ```bash
   npm run dev
   ```
7. Verify server status:
   ```bash
   curl http://localhost:5000/health
   ```
   *Expected Response:* `{"status": "healthy", "database": "connected"}`

### 2. Native Mobile Setup

1. Open a new terminal instance and navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Start the local Metro bundler:
   ```bash
   npm run start
   ```
4. Launch on desired targets:
   - **Physical Device**: Open the **Expo Go** application on Android or iOS and scan the QR code printed in the terminal (ensure both development computer and phone are connected to the same Wi-Fi router).
   - **iOS Simulator**: Press `i` to launch on Xcode simulator.
   - **Android Emulator**: Press `a` to launch on Android Studio Virtual Device.
   - **Web Browser**: Press `w` to spin up a web preview.
