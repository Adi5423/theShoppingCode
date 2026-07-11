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

### 1. Backend (`/backend`)
*   **Runtime**: Node.js (v18+) with modern EcmaScript Modules (ESM) support.
*   **Language**: TypeScript.
*   **Framework**: Express.js.
*   **ORM**: Prisma client configured with a native PostgreSQL pool adapter.
*   **Database**: PostgreSQL (compatible with Neon serverless, local PostgreSQL, AWS RDS, etc.).
*   **Authentication**: Passwordless OTP flow with JWT (JSON Web Tokens).

### 2. Mobile Frontend (`/mobile`)
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
│   │   │   └── auth.controller.ts # OTP Request/Verify and User Upsertion logic
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts # JWT Authenticated Route protection
│   │   ├── routes/
│   │   │   └── auth.routes.ts     # Express router endpoints
│   │   └── index.ts               # Core Server setup, Prisma setup, Healthcheck
│   ├── .env.example               # Template environment variables
│   ├── package.json               # Backend dependencies and scripts
│   └── tsconfig.json              # TypeScript compilation config
│
├── mobile/
│   ├── assets/                    # Graphic assets (Splash, Icon, etc.)
│   ├── App.tsx                    # React Native app entry component
│   ├── app.json                   # Expo configurations
│   ├── package.json               # Mobile dependencies and scripts
│   └── tsconfig.json              # TypeScript compilation config
│
└── .gitignore                     # Git ignore rules for the entire project workspace
```

### Key Files in Focus:
-   [`backend/prisma/schema.prisma`](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/prisma/schema.prisma): Contains definition of database models:
    -   `User`: Customers, Shopkeepers, and Administrators.
    -   `Shop`: Location-tagged outlets managed by shopkeepers.
    -   `CatalogItem`: Centralized items database (supports Open Food Facts attributes like barcode, brand, and variant).
    -   `Inventory`: Cross-reference connecting a `Shop` to a `CatalogItem` with specific pricing, stock status, and custom shopkeeper description notes.
    -   `Order` & `OrderItem`: Customer order history lock-in (locks item prices at checkout time).
-   [`backend/src/index.ts`](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/src/index.ts): Express entrypoint setting up middlewares (CORS, JSON parser) and initializing the connection pool to PostgreSQL via `pg`. Includes a `/health` endpoint to monitor server and database health.
-   [`backend/src/controllers/auth.controller.ts`](file:///run/media/liveuser/Workspace/shoppingg/hyperlocal-app/backend/src/controllers/auth.controller.ts): Implements OTP login. In development mode, OTP `123456` bypasses authentication to automatically upsert (create or fetch) the user records and issues a JWT token valid for 30 days.

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

## 🚀 Current Features

1.  **Database Modeling (Prisma & Postgres)**: Fully configured schema backing hyperlocal multi-vendor structures, inventory systems, custom descriptions, and transaction locking order parameters.
2.  **Passwordless Auth Core**: Working OTP request and OTP verification flows returning signed JSON Web Tokens.
3.  **Development OTP Bypass**: Hardcoded developer OTP hook (`123456`) to facilitate fast client side testing.
4.  **Health Check Endpoint**: Built-in endpoint (`/health`) verifying system runtime integrity and database connection pooling status.
