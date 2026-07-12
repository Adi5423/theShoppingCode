# 🚀 Hyperlocal Marketplace App

A modern, full-stack monorepo application for hyperlocal shopping. This project connects customers with local shopkeepers, providing real-time store inventory catalogs, custom pricing, order placement, and seamless order pickup/delivery pipelines.

---

## 📌 Project Goal

The primary goal of this application is to digitize and empower traditional local brick-and-mortar stores. By establishing a hyperlocal digital marketplace, the system:
- Enables **customers** to discover nearby shops, browse localized pricing, and place orders for quick pickup/delivery.
- Empowers **shopkeepers** to list custom pricing and descriptions on catalog items and manage inbound orders.
- Optimizes **local shopping** by bridging the convenience of digital search with the immediacy of physical local pickup.

---

## 🛠️ System Architecture & Tech Stack

The project is structured as a monorepo consisting of two primary components:

### 1. Backend ([/backend](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend))
*   **Runtime**: Node.js (v18+) with modern EcmaScript Modules (ESM) support.
*   **Language**: TypeScript.
*   **Framework**: Express.js.
*   **ORM**: Prisma client configured with a native PostgreSQL pool adapter.
*   **Database**: PostgreSQL (compatible with Neon serverless, local PostgreSQL, AWS RDS, etc.).
*   **Authentication**: Passwordless OTP flow with JWT (JSON Web Tokens).

### 2. Mobile Frontend ([/mobile](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/mobile))
*   **Framework**: React Native powered by Expo (SDK 57).
*   **Language**: TypeScript.
*   **Navigation**: React Navigation (`@react-navigation/native` & `@react-navigation/native-stack`).
*   **Bundler**: Metro Bundler.

---

## 📂 Codebase & Folder Directory Walkthrough

```text
hyperlocal-app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Database schema models (PostgreSQL)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts      # OTP Request/Verify and User Upsertion logic
│   │   │   ├── catalog.controller.ts   # Global product catalog search & registration
│   │   │   ├── discovery.controller.ts # Customer public item discovery with Progressive Radius Search
│   │   │   ├── inventory.controller.ts # Shopkeeper specific inventory catalog management
│   │   │   └── shop.controller.ts      # Shop registration and location metadata management
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts      # JWT Authenticated Route protection & req extension
│   │   ├── routes/
│   │   │   ├── auth.routes.ts          # Express auth endpoints
│   │   │   ├── catalog.routes.ts       # Express catalog endpoints
│   │   │   ├── discovery.routes.ts     # Express customer search discovery endpoints
│   │   │   ├── inventory.routes.ts     # Express shopkeeper inventory endpoints
│   │   │   └── shop.routes.ts          # Express shop registration endpoints
│   │   └── index.ts                    # Core Server setup, Prisma setup, Healthcheck, and router mounting
│   ├── .env.example                    # Template environment variables
│   ├── package.json                    # Backend dependencies and scripts
│   └── tsconfig.json                   # TypeScript compilation config
│
├── mobile/
│   ├── assets/                         # Graphic assets (Splash, Icon, etc.)
│   ├── App.tsx                         # React Native app entry component
│   ├── app.json                        # Expo configurations
│   ├── index.ts                        # Expo entry point script
│   ├── package.json                    # Mobile dependencies and scripts
│   └── tsconfig.json                   # TypeScript compilation config
│
└── .gitignore                          # Git ignore rules for the entire project workspace
```

### Key Files in Focus:
-   [backend/prisma/schema.prisma](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/prisma/schema.prisma): Database schema definition containing all primary enums and models.
-   [backend/src/index.ts](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/src/index.ts): Main application server setup using PostgreSQL connections pool and mounting api sub-routers.
-   [backend/src/controllers/auth.controller.ts](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/src/controllers/auth.controller.ts): Implements passwordless OTP login and verification with automatic user upsertion.
-   [backend/src/controllers/shop.controller.ts](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/src/controllers/shop.controller.ts): Handles store profile creation with latitude/longitude validation for geofencing.
-   [backend/src/controllers/catalog.controller.ts](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/src/controllers/catalog.controller.ts): Implements exact barcode matches (O(1)) and case-insensitive partial name searches for system-wide cataloging.
-   [backend/src/controllers/inventory.controller.ts](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/src/controllers/inventory.controller.ts): Allows shopkeepers to register items from the master catalog to their store inventory with local custom descriptions, stock level flags, and custom shop prices.
-   [backend/src/controllers/discovery.controller.ts](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/src/controllers/discovery.controller.ts): The geospatial search hub. Implements distance calculations and progressive radius searches.

---

## 🗄️ Database Schema & Data Models

The Prisma schema is optimized for multi-tenant shops, item catalog preservation, and order transaction isolation. Refer to [schema.prisma](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/prisma/schema.prisma) for exact types:

### Enums
-   `Role`: `CUSTOMER`, `SHOPKEEPER`, `ADMIN` (Role-based access controls).
-   `StockStatus`: `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK` (Inventory tracking).
-   `OrderStatus`: `PENDING`, `ACCEPTED`, `READY_FOR_PICKUP`, `COMPLETED`, `CANCELLED` (Order state pipeline).

### Models & Relations
1.  **User**: Represents any actor in the marketplace.
    -   Has a one-to-one relation with `Shop` (if the role is `SHOPKEEPER`).
    -   Has a one-to-many relation with `Order` (as a customer).
2.  **Shop**: Stores shopkeeper profiles, including location markers.
    -   Geolocated using Float attributes (`lat`, `lng`).
    -   Has a one-to-many relation with `Inventory` items.
    -   Has a one-to-many relation with `Order` records received by the shop.
3.  **CatalogItem**: A standardized directory of products.
    -   Supports attributes like barcode, brand, variant (e.g. weight, volume), and image links.
4.  **Inventory**: Relates a product to a specific store's pricing/stock catalog.
    -   Key attributes: `price`, `customDescription` (shopkeeper notes), and `status`.
    -   Enforces a composite unique key `[shopId, itemId]` to prevent duplicate catalog items inside the same shop.
5.  **Order**: Tracks transactional purchase header logs.
    -   Links customers and shops with total amounts and status tracking.
6.  **OrderItem**: Individual order line items.
    -   **Important Design Choice**: Captures a snapshot of the item's `price` at checkout time to lock in historical prices.

---

## 📡 API Reference

All requests must supply JSON payloads inside the request body if they use `POST` or `PUT` methods.

### Authentication Endpoints

| Route | Method | Authorization | Description / Payload |
| :--- | :--- | :--- | :--- |
| `/api/auth/request-otp` | `POST` | Public | Initiates OTP flow. Payload: `{ "phone": "string" }` |
| `/api/auth/verify-otp` | `POST` | Public | Verifies OTP and logs in. Payload: `{ "phone": "string", "otp": "string", "name"?: "string", "role"?: "Role" }`. Returns JWT and user payload. |

### Shop Management Endpoints

| Route | Method | Authorization | Description / Payload |
| :--- | :--- | :--- | :--- |
| `/api/shops` | `POST` | Verified JWT (Shopkeeper Only) | Registers a new shop. Payload: `{ "name": "string", "address": "string", "lat": number/float, "lng": number/float }` |

### Catalog Endpoints

| Route | Method | Authorization | Description / Payload |
| :--- | :--- | :--- | :--- |
| `/api/catalog/search` | `GET` | Verified JWT | Searches the master catalog. Query parameters: `barcode` (exact match) OR `query` (fuzzy matching). |
| `/api/catalog` | `POST` | Verified JWT | Adds an item to the global master catalog database. Payload: `{ "barcode"?: "string", "name": "string", "brand"?: "string", "variant"?: "string", "category"?: "string", "imageUrl"?: "string" }` |

### Inventory Endpoints

| Route | Method | Authorization | Description / Payload |
| :--- | :--- | :--- | :--- |
| `/api/inventory` | `POST` | Verified JWT (Shopkeeper Only) | Creates or updates (upserts) a shop's localized product. Payload: `{ "catalogItemId": "string", "price": number/float, "customDescription"?: "string", "status"?: "StockStatus" }` |

### Customer Discovery Endpoints

| Route | Method | Authorization | Description / Payload |
| :--- | :--- | :--- | :--- |
| `/api/discovery/search` | `GET` | Public | Hyperlocal item locator. Query parameters: `query` (name pattern), `customerLat` (float), `customerLng` (float). Returns items sorted by distance. |

---

## ⚡ Setup Guide: Running on a New System

Ensure you have the following prerequisites installed on your system:
-   **Node.js** (v18.x or v20.x recommended)
-   **PostgreSQL Database** (or a serverless Neon database connection string)
-   **Expo Go App** (installed on your physical iOS/Android phone to test the frontend, or configured simulator setups in Android Studio / Xcode)

---

### Step 1: Clone the Codebase
Navigate into the root of the project folder:
```bash
cd hyperlocal-app
```

---

### Step 2: Database and Backend Setup

1.  **Navigate to the backend folder**:
    ```bash
    cd backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**:
    Copy the sample environment file to create a `.env` configuration:
    ```bash
    cp .env.example .env
    ```
    Open `.env` in your editor and configure your credentials:
    ```ini
    DATABASE_URL="postgresql://username:password@localhost:5432/hyperlocal_db?sslmode=prefer"
    JWT_SECRET="your_secure_development_jwt_secret"
    PORT=5000
    ```

4.  **Database Migration & Schema Push**:
    Synchronize the database schema with your PostgreSQL instance:
    ```bash
    npx prisma db push
    ```
    *(Optional)* To generate or update the Prisma client manually:
    ```bash
    npx prisma generate
    ```

5.  **Start the Backend Development Server**:
    ```bash
    npm run dev
    ```
    The server will startup on port `5000`. You should see `[🚀 Server Matrix Engaged]: Running seamlessly on port 5000`.

6.  **Verify Backend Health**:
    In another terminal, run:
    ```bash
    curl http://localhost:5000/health
    ```
    You should receive a `200 OK` response with:
    ```json
    {
      "status": "healthy",
      "database": "connected"
    }
    ```

---

### Step 3: Frontend Setup (Mobile App)

1.  **Navigate to the mobile folder**:
    Open a new terminal session and run:
    ```bash
    cd mobile
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the Expo Development Server (Metro)**:
    ```bash
    npm run start
    ```

4.  **Run the application**:
    -   **On Physical Phone**: Scan the QR code displayed in the terminal using the **Expo Go** app (Android) or the native Camera app (iOS). Ensure your phone and development machine are connected to the same Wi-Fi network.
    -   **On iOS Simulator**: Press `i` in the terminal prompt (requires macOS with Xcode command line tools).
    -   **On Android Emulator**: Press `a` in the terminal prompt (requires Android Studio running an active Virtual Device).
    -   **On Web Browser**: Press `w` to spin up a web preview.

---

## 🌟 Core Backend Implementation Features

### 🔐 Role-Based Security Pipeline
Authentication routes issue cryptographically signed JWT tokens carrying user IDs and roles. The [auth.middleware.ts](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/src/middleware/auth.middleware.ts) middleware intercepts request headers to unpack the token. Controller-level validators then enforce access boundaries based on roles:
-   `SHOPKEEPER`: Authorized to create store endpoints and upsert inventory listings.
-   `CUSTOMER` / Public: Restricted to browsing the catalog and running discovery scans.

### 📍 Progressive Radius Geospatial Search
In [discovery.controller.ts](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/src/controllers/discovery.controller.ts), the application performs distance scans via the Haversine equation:
$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
To avoid an "Empty Application" feeling when a customer opens the app in a sparsely populated region, the algorithm runs a **Progressive Radius expansion**:
1.  Filters results within a **5 km** radius.
2.  If less than **2 shops** match, the radius expands to **15 km**.
3.  Expands dynamically up to **30 km** and **50 km** thresholds until matching merchants are identified.

### 📝 Shopkeeper Custom Descriptions
The database supports generic items globally but allows shopkeepers to append localized, store-specific custom descriptions or usage warnings directly onto item rows mapping to their stores in the `Inventory` model. This allows shopkeepers to override generic attributes with store-specific details (e.g. "Slightly damaged packaging but product is perfectly fresh").

### 🔒 Purchase Price Isolation
To prevent disputes or accounting discrepancies resulting from post-purchase price changes, the `OrderItem` schema records a copy of the item's unit price at the time of order placement. If a shopkeeper alters their inventory pricing in the future, all historical order structures remain correct and unaltered.
