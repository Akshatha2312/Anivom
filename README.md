# ANIVOM
> **Wear It Your Way.**

A production-ready full-stack MERN (MongoDB Atlas, Express.js 5, React 19, Node.js v20+) e-commerce web platform engineered for custom T-shirt retail. ANIVOM couples a responsive customer-facing storefront with an interactive canvas customization studio (**ANIVOM Studio**) and a dedicated administrative workspace (**ANIVOM Admin**).

---

## 1. Project Overview

ANIVOM provides a complete end-to-end bespoke clothing experience. Customers can browse catalog T-shirts, customize garments using text formatting, vector SVG artwork, and image uploads, preview multi-angle mockups, and place orders via Razorpay online payment verification. Administrators manage store analytics, catalog items, variant-level stock counters (XS–XXL), vector artwork libraries, customer accounts, order fulfillment dossiers, discount coupons, and homepage hero banners.

---

## 2. Key Features

### Customer Application
- **Authentication**: Email/password registration (auto-generating a unique referral code) and Google OAuth 2.0 (`google-auth-library`), with session management via HTTP-Only cookies.
- **Product Catalog**: Multi-criteria search, category tabs, size tags, colour swatches, price range slider, and sorting.
- **Product Details (PDP)**: Interactive color swatches, size selector with real-time stock indicators, wishlist toggle, and multi-angle garment mockups.
- **ANIVOM Studio Customizer**: Interactive canvas editor supporting text typography, predefined SVG vector graphics, Cloudinary image uploads (PNG/JPG/WEBP <= 5MB), scale, rotation (-180° to 180°), and 4 garment views (**Front**, **Back**, **Left**, **Right**).
- **Wishlist**: Colour-aware saved items with dynamic image resolution and persistent account sync.
- **Shopping Bag & Buy Now**: Server-validated cart synchronization and isolated Buy Now checkout.
- **Checkout & Address Book**: Delivery address management (Add/Edit/Delete/Set Default), coupon validation, and server-calculated totals.
- **Razorpay Payments**: Checkout integration with server-side HMAC-SHA256 signature verification in Razorpay Test Mode.
- **Order Tracking**: Visual 5-stage timeline tracking (`PLACED` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`), order cancellations, and return requests.
- **Customer Referrals**: Earned referral rewards dashboard and shareable referral code (`ANIVOM...`).

### Admin Dashboard
- **Store Analytics**: Live revenue (₹24,332), active orders count (16), customer totals, catalog statistics, and low-stock alerts.
- **Product & Inventory Management**: Catalog CRUD, active visibility toggles (`isActive`), multi-angle mockup image uploaders, and direct variant stock counter edits (size $\times$ colour).
- **Design Library**: Vector SVG graphics library upload and category taxonomy manager.
- **Customer Directory**: Registered user table, roles (`CUSTOMER`/`ADMIN`), and search query.
- **Order Dossier & Status Lifecycle**: Inspect shipping address snapshots, customization JSON layers, and Razorpay transaction IDs; advance order status (`PLACED` → `DELIVERED`), process returns, and issue refunds.
- **Coupons & Banners**: Promotional discount code rules and homepage hero carousel banner editor.

---

## 3. Technology Stack & Architecture

- **Frontend Framework**: React 19 (`react` `^19.2.8`, `react-dom` `^19.2.8`)
- **Build Engine**: Vite 8 (`vite` `^8.3.0`)
- **Linter**: Oxlint (`oxlint` `^1.81.0`)
- **Backend Framework**: Express.js (`^5.2.1`)
- **Runtime**: Node.js (`v20+`)
- **Database**: MongoDB Atlas via Mongoose (`^9.10.1`)
- **Security**: Helmet (`^8.3.0`), Express Rate Limit (`^8.7.0`), Bcryptjs (`^3.0.3`), Jsonwebtoken (`^9.0.3`)
- **Payment Gateway**: Razorpay SDK (`^2.9.8`)
- **Media Storage**: Cloudinary SDK (`^2.11.0`) & Multer (`^2.4.0`)

```
[ Customer / Admin Browser (React 19 + Vite 8) ]
                        │
                        │ HTTP / HTTPS (JSON Payload, Cookie Credentials)
                        ▼
       [ Express.js 5 REST API Server (Node.js) ]
   ├── Security Layer (Helmet, CORS, Cookie-Parser, Rate-Limiters)
   ├── Auth & RBAC Middleware (protect, authorize('admin'))
   └── Controllers (Product, Cart, Customization, Order, Auth)
        │                       │                      │
        ▼                       ▼                      ▼
[ MongoDB Atlas ]      [ Razorpay Gateway ]   [ Cloudinary Storage ]
 (15 Mongoose Schemas  (Order Creation &      (Uploaded Custom &
  & Compound Indexes)   HMAC Verification)     Product Images)
```

---

## 4. Live Deployment URLs & API Documentation

- **Customer Storefront**: https://anivom.vercel.app/
- **Admin Workspace**: https://anivom-admin.vercel.app/
- **Backend Service API**: https://anivom.onrender.com
- **Health Check Endpoint**: `GET https://anivom.onrender.com/api/v1/health`
- **Interactive OpenAPI 3 / Swagger UI**: https://anivom.onrender.com/api-docs

The Express REST API exposes **47 total endpoints** (46 business endpoints + 1 health check endpoint). Full route schemas are documented in [`server/src/API_DOCUMENTATION.md`](file:///c:/Users/aksha/OneDrive/Desktop/Anivom/server/src/API_DOCUMENTATION.md).

---

## 5. Demo Credentials

Demo accounts are available for evaluation:

- **Customer Storefront**: `anivom1@gmail.com` / `Anivom@1`
- **Admin Workspace**: `admin@anivom.com` / `admin123`

---

## 6. Testing & QA Verification

The application successfully completed an automated real-browser QA audit comprising 23 Test Suites across 8 core functional modules (33 sub-tests with 200+ automated browser interactions), achieving a 100% PASS rate across both Customer and Admin deployments.

Automated verification checks:
- **Client Linter**: Oxlint `npm run lint --prefix client` (0 errors)
- **Production Builds**: Vite `npm run build --prefix client` & `npm run build --prefix admin` (Passed cleanly)
- **Server Load**: `node -e "require('./src/app')"` (Passed cleanly)
- **Git Diff Check**: `git diff --check` (Clean 0 errors)

---

## 7. Documentation Suite

- **Master Documentation**: [`docs/ANIVOM_FINAL_PROJECT_DOCUMENTATION.md`](file:///c:/Users/aksha/OneDrive/Desktop/Anivom/docs/ANIVOM_FINAL_PROJECT_DOCUMENTATION.md)
- **REST API Reference**: [`server/src/API_DOCUMENTATION.md`](file:///c:/Users/aksha/OneDrive/Desktop/Anivom/server/src/API_DOCUMENTATION.md)
- **Final PRD Report**: [`server/src/FINAL_PROJECT_REPORT.md`](file:///c:/Users/aksha/OneDrive/Desktop/Anivom/server/src/FINAL_PROJECT_REPORT.md)
- **Human-Written Code Declaration**: [`HUMAN_WRITTEN_CODE_DECLARATION.md`](file:///c:/Users/aksha/OneDrive/Desktop/Anivom/HUMAN_WRITTEN_CODE_DECLARATION.md)
- **Customer Manual**: [`client/README.md`](file:///c:/Users/aksha/OneDrive/Desktop/Anivom/client/README.md)
- **Admin Manual**: [`admin/README.md`](file:///c:/Users/aksha/OneDrive/Desktop/Anivom/admin/README.md)
- **Backend Manual**: [`server/README.md`](file:///c:/Users/aksha/OneDrive/Desktop/Anivom/server/README.md)

---

## 8. Local Development Setup

### 1. Backend Server Setup
```bash
cd server
npm install
cp .env.example .env
npm run dev
```
Server listens at `http://localhost:5000`.

### 2. Customer Frontend Setup
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
Storefront accessible at `http://localhost:5173`.

### 3. Admin Workspace Setup
```bash
cd admin
npm install
npm run dev
```
Admin panel accessible at `http://localhost:5173` (or next open port).

---

## 9. Repository Structure

```
Anivom/
├── docs/
│   └── ANIVOM_FINAL_PROJECT_DOCUMENTATION.md  # Single-source-of-truth master doc
├── client/                                    # Customer React 19 SPA
│   ├── src/                                   # Studio, Catalog, Cart, Checkout, Auth, Wishlist
│   └── README.md
├── admin/                                     # Admin React 19 SPA
│   ├── src/                                   # Dashboard, Products, Orders, Designs, Coupons, Banners
│   └── README.md
├── server/                                    # Express 5 REST API & Mongoose models
│   ├── src/
│   │   ├── controllers/                       # 18 business logic request controllers
│   │   ├── models/                            # 15 Mongoose schemas
│   │   ├── routes/                            # 16 Express router modules
│   │   └── API_DOCUMENTATION.md               # REST API reference
│   └── README.md
├── HUMAN_WRITTEN_CODE_DECLARATION.md          # Team declaration
└── README.md                                  # Repository landing page
```

---

## 10. Known Limitations

1. **Custom Image Processing**: Uploads in Studio support scaling, rotation, and positioning, but advanced background removal or vector masking are basic.
2. **PDF Invoices**: Orders render HTML receipt breakdowns rather than generating downloadable PDF files.
3. **Automated Emails**: Order status updates persist to MongoDB in real time, but transactional SMTP emails are disabled.
4. **Static Open Graph Meta**: Open Graph social tags are statically set in `index.html`.

---

## 11. Human-Written Code Declaration

In compliance with Constraint 7 of the Project Requirement Document (PRD), all application source code, schemas, controllers, customization canvas logic, CSS design systems, and configuration files were manually authored. Refer to [`HUMAN_WRITTEN_CODE_DECLARATION.md`](file:///c:/Users/aksha/OneDrive/Desktop/Anivom/HUMAN_WRITTEN_CODE_DECLARATION.md).
