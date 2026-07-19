# TheShoppingCode — Hyperlocal Marketplace Monorepo

[![Tech Stack](https://img.shields.io/badge/Stack-TypeScript%20%7C%20React%20Native%20%7C%20Node.js%20%7C%20Postgres-004437?style=for-the-badge)](#tech-specs)
[![License: MIT](https://img.shields.io/badge/License-MIT-D5B38E?style=for-the-badge)](LICENSE)

A production-grade, dual-sided hyperlocal commerce ecosystem linking local merchants with customers in cities like Lucknow. The platform empowers neighborhood store owners with a mobile-first, camera-based barcode scanning inventory engine, and connects shoppers to a real-time discovery engine to pinpoint local item availability and execute instant pickup orders.

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [UI/UX & Design System](#uiux--design-system)
3. [Monorepo Directory Walkthrough](#monorepo-directory-walkthrough)
4. [Database Design & Schema](#database-design--schema)
5. [Core Engine Implementations](#core-engine-implementations)
6. [API Reference Directory](#api-reference-directory)
7. [Future Roadmap](#future-roadmap)
8. [Local Environment Setup](#local-environment-setup)

---

## Tech Specs

### Client Side
* **Framework**: React Native with **Expo SDK 57**
* **Theme & State**: Local Zustand Stores with hardware-backed persistent storage (`SecureStore`)
* **Navigation**: React Navigation v7 with dynamic Auth/Setup gatekeepers
* **Real-time Comms**: Native Socket.IO client integration for live updates
* **Scanner**: Native `expo-camera` integration for high-frequency scan sweeps

### Backend Server
* **Engine**: Node.js v18+ running Express.js in Native ES Modules (`type: "module"`)
* **ORM**: Prisma Client utilizing native Pg pooling (`@prisma/adapter-pg`)
* **Database**: Serverless PostgreSQL (Neon)
* **Real-time Server**: Socket.IO integrated with the HTTP server
* **Security & Audits**: Helmet HTTP headers, CORS configurations, express rate-limiting, BCrypt encryption, and JWT protection

---

## System Architecture

The application is engineered as a clean TypeScript monorepo splitting the backend services and the mobile frontend, connected via REST APIs and WebSockets.

```mermaid
graph TD
    subgraph Client ["Mobile Client (Expo SDK 57)"]
        RN[React Native UI]
        Nav[AppNavigator - Navigation Gatekeeper]
        Store[Zustand Store + SecureStore]
        SocketClient[Socket.IO Client]
    end

    subgraph Server ["Backend Service (Express.js)"]
        Auth[Auth Middleware]
        Route[Express Router]
        Ctrl[Controllers]
        SocketServer[Socket.IO Server]
    end

    subgraph Data ["Data Layer"]
        Prisma[Prisma Client / Pg Adapter]
        DB[(PostgreSQL Database)]
        OFF[Open Food Facts API]
    end

    RN -->|HTTP Requests| Route
    SocketClient <-->|Real-time Events| SocketServer
    Nav -->|Auth Checks /api/shop/me| Route
    Route --> Auth
    Auth --> Ctrl
    Ctrl --> Prisma
    Prisma --> DB
    Ctrl -.->|Self-learning barcode query| OFF
```

---

## UI/UX & Design System

The application utilizes a premium "Deep Forest & Warm Sand" color palette, engineered to deliver a high-end, responsive storefront experience:

* **Primary Tone**: Deep Forest Emerald (`#004437` Light / `#00C896` Dark contrast)
* **Accent Tone**: Warm Sand Gold (`#D5B38E`)
* **Base Backgrounds**: Off-White Warm Cream (`#FAF8F5`) for Light mode, Rich Charcoal Slate (`#0F1419` / `#1A2332`) for Dark mode.
* **Animations**: Native layout spring-interpolations, sweeping scan-lines, and micro-interactivity scales (`0.97` click compression).
* **Feedback Systems**: 
  * Animated toast notification drops that provide real-time interactive alerts.
  * A dedicated Notification Center modal to review historical application alerts.
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
│   │   │   ├── auth.controller.ts      # Authentication 
│   │   │   ├── catalog.controller.ts   # Barcode index lookup
│   │   │   ├── customer.controller.ts  # Discovery feed & search
│   │   │   ├── inventory.controller.ts # Merchant stock managers
│   │   │   ├── order.controller.ts     # Checkout pipelines & stock adjustments
│   │   │   └── shop.controller.ts      # Store profiles
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts      # JWT validations
│   │   ├── routes/                     # Express routers
│   │   ├── index.ts                    # Express app mount & adapters
│   │   └── socket.ts                   # Socket.IO configuration
│   └── package.json                    # Backend runtime metadata
│
├── mobile/
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── customer/               # Shopper interface files (Cart, Orders, Discover)
│   │   │   └── shop/                   # Merchant interface files (Scanner, Orders)
│   │   ├── navigation/                 # AppNavigator & Tabs
│   │   └── shared/
│   │       ├── api/
│   │       ├── components/             # Reusable UI (Button, InputField, Toast)
│   │       ├── store/                  # Zustand state (Cart, Auth, Theme, Toast, Socket)
│   │       └── theme.ts                # Base tokens and styling rules
│   └── package.json                    # Mobile client dependencies
```

---

## Database Design & Schema

The Postgres data tier is modeled in `schema.prisma` utilizing robust relational constraints to maintain data integrity during live transactions.

### Key Relational Features
1. **Composite Unique Constraint (`[shopId, itemId]`)**: Prevents duplicate catalog items inside a single merchant's stock.
2. **Automated Inventory Tracking**: Order completion triggers dynamic deduction of the `stockQuantity` from the merchant's inventory.
3. **Price Snapshot Locking**: The `OrderItem` stores the transaction price at checkout. This isolates order history from retroactive price updates.
4. **Action Auditing**: A dedicated `Notification` model logs system alerts linked directly to users for the Notification Center.

---

## Core Engine Implementations

### 1. Real-Time Order Synchronization (Socket.IO)
- **Instant Dispatch**: Customer checkouts instantly emit `new_order` events to the respective merchant's application, appending the order to their queue dynamically.
- **Live Status Tracking**: Merchant actions (Accepting, marking Ready for Pickup, or Completing) instantly emit `order_updated` events to the specific customer, updating their UI without refresh intervals.

### 2. Barcode Lookup & Self-Learning Catalog
- Viewfinder verifies local inventory barcodes (EAN-13, EAN-8, UPC-A, UPC-E).
- If the database lacks reference, the server queries the Open Food Facts API.
- Specifications (Title, Brand, Pack variant, Category, Images) are parsed and registered as a new `CatalogItem`, ensuring immediate O(1) lookup on future scans.

### 3. Dynamic Discovery Feed
- The Customer application features a real-time Discovery feed powered by the backend.
- It aggregates live inventory from nearby merchants, presenting randomized available items that users can instantly add to their cart directly from the feed.
- The interface utilizes double-tap tab gestures to trigger instant refreshes.

### 4. Transaction Isolation
- All checkout routines operate inside a database transaction (`$transaction`).
- Validates stock quantities and merchant ownership before processing orders, rolling back entirely if limits are exceeded.

---

## API Reference Directory

### Authentication
* `POST /api/auth/register`: Public endpoint for user onboarding with bcrypt hashing.
* `POST /api/auth/login`: Validates credentials and returns JWT session token.

### Shop Profile
* `GET /api/shop/me`: Retrieves authenticated shop metadata (hours, UPI, location).
* `POST /api/shop/setup`: Upserts store configuration details.

### Catalog & Discovery
* `GET /api/catalog/search`: Resolves EAN/UPC identifier strings.
* `GET /api/customer/discover`: Aggregates a shuffled feed of live products for the customer home page.
* `GET /api/customer/search-shops`: Executes fuzzy queries on product names mapping to store availability.

### Inventory & Orders
* `POST /api/inventory`: Binds a Catalog Item to a merchant's active stock.
* `POST /api/orders`: Executes customer checkout, reserves stock, and triggers websocket events.
* `PATCH /api/orders/:id/status`: Advances order pipeline (PENDING -> ACCEPTED -> READY -> COMPLETED) and deducts inventory.

---

## Future Roadmap

As the Hyperlocal architecture continues to scale, immediate roadmap priorities include:
1. **Dynamic Geolocation Routing**: Implementing PostGIS for accurate radius-based store filtering and dynamic distance calculations.
2. **Push Notifications**: Transitioning from Socket-only local toasts to native Push Notifications via Expo Application Services (EAS) for background state awareness.
3. **Payment Gateway Integration**: Supporting live UPI intent deep-linking to execute payments securely before order confirmation.
4. **Advanced Variants Engine**: Supporting complex matrix inventory (e.g., Color/Size variations for retail goods outside of grocery).

---

## Local Environment Setup

### Prerequisites
- Node.js (v18.x or v20.x)
- Active PostgreSQL database connection

### 1. Database & Backend Configuration
1. Enter backend folder: `cd backend`
2. Install Node dependencies: `npm install`
3. Copy environment sample: `cp .env.example .env`
4. Define parameters in `.env`:
   ```ini
   DATABASE_URL="postgresql://username:password@localhost:5432/hyperlocal_db"
   JWT_SECRET="development_secret_key"
   PORT=5000
   ```
5. Deploy Prisma db schema: `npx prisma db push`
6. Run local server: `npm run dev`

### 2. Client Application Setup
1. Enter mobile folder: `cd mobile`
2. Install packages: `npm install`
3. Run Local Metro server: `npm run start`
4. Launch emulator or Expo Go:
   - **Android Emulator**: Press `a`
   - **iOS Simulator**: Press `i`
   - **Expo Go**: Scan QR code with your device camera
