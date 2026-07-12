# TransitOps ERP

TransitOps is a full-stack, enterprise-grade Transport Operations Platform designed for fleet management, dispatching, driver safety tracking, and financial analytics. It features a complete Role-Based Access Control (RBAC) system with tailored views for Admins, Fleet Managers, Dispatchers, Safety Officers, and Financial Analysts.

---

## 🏗️ Architecture Overview

The system is split into a decoupled frontend and backend architecture:

### Frontend (`/frontend`)
- **Framework**: React 19 + Vite
- **Language**: JavaScript
- **State Management**: TanStack Query (Server State) + React Context (Auth State)
- **Routing**: React Router DOM (with Lazy Loading / Code Splitting)
- **UI Library**: Material UI (MUI) - customized with a premium Dark Theme matching the design system
- **Charts**: Recharts
- **Forms & Validation**: React Hook Form + Zod
- **API Client**: Axios (with JWT interceptors)

### Backend (`/backend`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens) with `bcrypt` password hashing
- **API Documentation**: OpenAPI 3.0 via Swagger UI (`swagger-jsdoc` & `swagger-ui-express`)

---

## 🔐 Role-Based Access Control (RBAC)

The application scopes both API endpoints and frontend navigation based on the authenticated user's role:

| Role | Access Scope |
|---|---|
| **Admin** | Unrestricted access to all modules, system settings, and user management. |
| **Fleet Manager** | Vehicles, Drivers, Trips, Maintenance, Fuel & Expenses, Reports. |
| **Dispatcher** | Dashboard, Vehicles, Drivers, Trips (Dispatch/Start/Complete lifecycle). |
| **Safety Officer** | Dashboard, Vehicles, Drivers (Safety Scores), Maintenance. |
| **Financial Analyst** | Dashboard, Vehicles, Fuel Logs, Expenses, Reports. |

---

## 🧩 Core Modules

The system is organized into the following feature modules:

1. **Authentication**: Secure Login, Password Reset, JWT auto-refresh, and RBAC Route Guards.
2. **Dashboard**: High-level KPIs, Fleet Status Pie Charts, Expense Trend Bar Charts, and Trip Trend Line Charts.
3. **Drivers**: Driver registry, license expiry tracking, and safety score management.
4. **Trips**: Complete state machine (Draft → Dispatched → Started → Completed / Cancelled).
5. **Vehicles**: Fleet registry, capacity tracking, and status monitoring (Available / In Shop).
6. **Maintenance**: Service request tracking and scheduling.
7. **Fuel & Expenses**: Operational cost tracking and fuel log management.
8. **Reports & Analytics**: Data aggregation and export functionality.
9. **Notifications**: System-generated alerts triggered by core ERP events.
10. **System Settings**: Centralized configuration module.

---

## 🎨 UI/UX Design System

The frontend implements a strict, cohesive Dark Theme:
- **Backgrounds**: Charcoal (`#0d0d0d`) and Dark Paper (`#1a1a2e`) for reduced eye strain.
- **Accents**: Orange (`#e67e22`) primary actions and Blue (`#3498db`) secondary elements.
- **Status Colors**: Consistent visual language using Green (Success), Blue (Info), Orange (Warning), and Red (Error) chips.
- **Components**: Fully customized MUI tokens featuring rounded corners (`10px-14px`), soft shadows, and clean typography (`Inter`/`Roboto`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Running locally or via Docker)

### 1. Database Setup
Ensure PostgreSQL is running and update the `.env` file in the `/backend` directory with your connection string:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/transitops?schema=public"
JWT_SECRET="your-secret-key"
```

### 2. Backend Installation
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```
The API will be available at `http://localhost:5000` (or your configured port).
Swagger API documentation can be viewed at `http://localhost:5000/api/docs`.

### 3. Frontend Installation
```bash
cd frontend
npm install
npm run dev
```
The React application will be available at `http://localhost:5173`.

---

## 📖 API Documentation

The REST API is fully documented using Swagger OpenAPI 3.0. 
Start the backend server and navigate to `/api/docs` in your browser to view the interactive documentation, schemas, and test endpoints directly.

---

*TransitOps © 2026 · Smart Transport Operations Platform*
