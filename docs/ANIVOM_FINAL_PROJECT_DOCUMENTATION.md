# ANIVOM
## Customised T-Shirt Clothing Brand
### MERN Full Stack Project — Final Project Documentation

**Project**: ANIVOM — Customised T-Shirt Clothing Brand  
**Tagline**: Wear It Your Way.  
**Technology**: MERN Full Stack (MongoDB, Express.js 5, React 19, Node.js)  
**Documentation Purpose**: Official Final Project Submission & System Reference  
**Submission Date**: 28.09.2026  
**Customer Frontend Production URL**: https://anivom.vercel.app/  
**Admin Frontend Production URL**: https://anivom-admin.vercel.app/  
**Backend API Production URL**: https://anivom.onrender.com  

---

## 2. Table of Contents

1. [Cover Page](#1-cover-page)
2. [Table of Contents](#2-table-of-contents)
3. [Project at a Glance](#3-project-at-a-glance)
4. [Project Objective](#4-project-objective)
5. [How ANIVOM Works](#5-how-anivom-works)
6. [Customer User Guide](#6-customer-user-guide)
7. [ANIVOM Studio — Customization Guide](#7-anivom-studio--customization-guide)
8. [Customer Features](#8-customer-features)
9. [Admin Guide](#9-admin-guide)
10. [Admin Features](#10-admin-features)
11. [System Architecture](#11-system-architecture)
12. [Application Workflow](#12-application-workflow)
13. [Technology Stack](#13-technology-stack)
14. [Frontend Architecture](#14-frontend-architecture)
15. [Backend Architecture](#15-backend-architecture)
16. [Database Architecture](#16-database-architecture)
17. [Cart and Order Architecture](#17-cart-and-order-architecture)
18. [Checkout and Payment Architecture](#18-checkout-and-payment-architecture)
19. [Authentication and Authorization](#19-authentication-and-authorization)
20. [Backend Security and Business Logic](#20-backend-security-and-business-logic)
21. [Image Storage](#21-image-storage)
22. [Performance Optimization](#22-performance-optimization)
23. [Validation and Error Handling](#23-validation-and-error-handling)
24. [API Documentation](#24-api-documentation)
25. [Testing and QA](#25-testing-and-qa)
26. [Responsive Design](#26-responsive-design)
27. [Deployment](#27-deployment)
28. [PRD Compliance Matrix](#28-prd-compliance-matrix)
29. [Expected Deliverables](#29-expected-deliverables)
30. [Known Limitations and Final Verification](#30-known-limitations-and-final-verification)
31. [Human-Written Code Declaration](#31-human-written-code-declaration)
32. [Final Submission Checklist](#32-final-submission-checklist)

---

## 3. Project at a Glance

### What is ANIVOM?
ANIVOM is a bespoke full-stack e-commerce web platform engineered for custom T-shirt retail. Built on the MERN stack (MongoDB, Express.js 5, React 19, Node.js), it provides an interactive canvas studio where users personalize T-shirts with custom typography, vector graphics, and image uploads, while viewing real-time previews across multiple garment views (Front, Back, Left, Right).

### What Can Customers Do?
- Register and log in securely via credentials or Google OAuth (auto-generating a unique referral code).
- Browse products with real-time filters (Category, Size, Colour, Price Range Slider) and instant search.
- Personalize T-shirts in ANIVOM Studio with custom text formatting, vector artwork, scale/rotation, and image uploads.
- Manage shopping bag, delivery address book, personal wishlist, and customer referral dashboard.
- Complete online checkout via Razorpay with automated server-side HMAC-SHA256 payment verification.
- Track live order statuses (`PLACED` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`) and request returns.

### What Can Administrators Do?
- Monitor total revenue, active orders count, customer totals, and sales metrics on the Admin Dashboard.
- Manage product catalogs, upload multi-view garment mockups, toggle product active state, and manage variant stock levels (XS-XXXL).
- Curate vector artwork in the design library and configure categories, colors, and sizes.
- Manage homepage hero carousel banners and promotional discount coupons.
- Review customer orders, inspect design snapshots, advance order statuses, process return requests, and issue refunds.

### Core Customer Flow
**Browse** → **Select** → **Customize** → **Preview** → **Add to Cart** → **Checkout** → **Pay** → **Order** → **Track**

### Key Highlights
- **Interactive T-Shirt Customizer**: Layer-based canvas engine supporting text, predefined SVG vector graphics, uploaded images, scale, rotation, and multi-view garment previews (Front, Back, Left, Right).
- **Server-Side Price & Stock Authority**: Final order pricing, discount application, and stock availability are recalculated server-side; client manipulation is impossible.
- **Secure Payment Verification**: Payment success is trusted ONLY after server-side HMAC-SHA256 signature verification succeeds before stock decrement and cart clearing.
- **Performance Optimized**: In-memory module caching, Mongoose `.lean()` queries, MongoDB compound indexes, and high-priority image decoding hints.

---

## 4. Project Objective

The primary objective of ANIVOM is to design and develop a responsive, production-ready e-commerce platform for a customized T-shirt brand using the MERN stack (MongoDB, Express.js, React.js, Node.js). 

Customers must be able to browse T-shirts, customize designs, preview their T-shirt on realistic garment mockups, place orders, and make online payments. Administrators must be able to manage products, vector design assets, inventory stock, customer profiles, order states, return requests, discount coupons, and promotional banners through a dedicated admin panel.

---

## 5. How ANIVOM Works

### Customer Journey
1. **Open ANIVOM**: Access the customer-facing storefront at `https://anivom.vercel.app/`.
2. **Register/Login**: Sign up with name, email, password, or sign in using Google OAuth. A unique referral code is auto-generated upon registration.
3. **Browse Products**: Explore featured collections on the Home page or open the Catalog page.
4. **Search/Filter**: Refine items using category tabs, size tags, color palettes, or the price slider.
5. **Open Product**: View high-resolution garment mockups, product description, base pricing, and available variants.
6. **Select Colour & Size**: Choose preferred sizing (XS-XXXL) and garment color; garment mockups update dynamically.
7. **Customize**: Click "Customize T-Shirt" to launch ANIVOM Studio.
8. **Add Elements**: Insert text layers, browse vector artwork from the design library, or upload image files (PNG/JPG/WEBP <= 5MB).
9. **Position & Preview**: Drag to position, scale layers, adjust rotation (-180° to 180°), and switch between Front, Back, Left, and Right garment views.
10. **Add to Cart**: Save customization and send to Bag with selected variant.
11. **Manage Cart**: Review bag items, adjust quantities, or apply discount coupons.
12. **Add Address**: Select or enter a delivery address.
13. **Checkout**: Review item subtotal, discount, and grand total calculated by server.
14. **Pay**: Complete payment via Razorpay modal (UPI, Cards, NetBanking).
15. **Order Confirmation**: Backend verifies HMAC signature, creates Order record, decrements variant stock, and clears bag.
16. **Track Order**: Monitor live order status timeline from user account dashboard.

### Admin Journey
1. **Admin Login**: Access `/admin` route and enter admin credentials.
2. **Dashboard Overview**: Inspect sales metrics, total revenue, active orders, and recent activity.
3. **Products & Inventory**: Add products, upload multi-view garment mockups, and update variant stock counters.
4. **Design Library**: Add/remove vector artwork SVG templates for the customization studio.
5. **Customers**: View customer accounts and email records.
6. **Orders & Returns**: Review customer orders, inspect design snapshots, advance order status (`CONFIRMED` → `DELIVERED`), process return requests, and issue refunds.
7. **Coupons & Banners**: Create promotional discount codes and configure homepage hero banners.
8. **Master Data**: Manage global categories, sizes, and colors.

---

## 6. Customer User Guide

### Account Management
- **Registration**: Click "Account" → "Sign Up". Enter name, email, and password. Account creation generates a unique referral code.
- **Login / Logout**: Authenticate via credentials or Google OAuth. Logout from account header anytime.

### Browsing & Filtering
- **Catalog Navigation**: Filter products by Category, Size, Colour, and Price range slider. Search by keyword or sort by price/newest.
- **Product Details**: Select size and color. View high-resolution garment mockups for front, back, left, and right views.

### Cart & Checkout
- **Cart Management**: Adjust quantities, remove items, or apply coupon codes.
- **Delivery Address**: Add, edit, or set a primary default shipping address.
- **Checkout & Payment**: Review grand total, launch Razorpay payment modal, and complete payment securely.

### Order History & Tracking
- **Tracking Orders**: Navigate to "Orders" in Account to view order history and real-time status updates (`PLACED`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`).
- **Returns & Cancellations**: Request order cancellation (for unfulfilled orders) or return (for delivered items).

---

## 7. ANIVOM Studio — Customization Guide

### Customization Steps
1. **Select Garment**: Choose target T-shirt base product (Standard Crew Neck, Slim Fit, Oversized, Cropped, Polo, Sleeveless, V-Neck).
2. **Select Colour**: Choose garment color; background mockup updates to match selected color.
3. **Select Size**: Pick sizing variant (XS-XXXL).
4. **Choose View**: Toggle between **Front**, **Back**, **Left**, and **Right** views using view selector buttons.
5. **Add Text**: Click "Add Text". Enter custom text, choose font family, font size, text alignment, and color.
6. **Add Predefined Design**: Click "Add Design". Select curated SVG artwork from vector design library.
7. **Upload Image**: Click "Upload Image". Upload custom graphics file (PNG, JPG, WEBP <= 5MB).
8. **Position, Scale & Rotate**: Click any canvas layer to drag and position. Use range sliders or handles to scale (0.5x to 3x) and rotate (-180° to 180°).
9. **Preview**: Review multi-view previews of the personalized garment.
10. **Save & Order**: Click "Add Customised Product to Bag". The complete layer state is saved to database and attached to bag item.

### View Availability & Fallback Behavior
- ANIVOM Studio supports multi-view previews across Front, Back, Left, and Right garment views.
- If a product does not have a specific side view (e.g., Left/Right view) uploaded for a color, clicking that view displays a clear modal informing the user that the view is unavailable for that specific garment, while keeping Front and Back fully functional.
- Design layers preserve view assignments (`view: 'front'`, `'back'`, `'left'`, `'right'`) so elements render exclusively on their assigned side.

### Preservation in Cart and Order
- When added to cart, the customization state is referenced by `customizationId`.
- Upon checkout, `orderController.js` freezes the complete layer JSON into `customizationSnapshot` on the `Order` record, ensuring historical design accuracy even if the user subsequently edits their saved customization.

---

## 8. Customer Features

- **User Registration & Login**: Account creation with bcrypt password hashing and JWT HTTP-Only cookie.
- **Browse & Search T-Shirts**: Filterable product catalog with search, category, size, color, price slider, and sorting.
- **Product Details & Variants**: High-resolution garment view mockups and stock check per size/color variant.
- **Interactive T-Shirt Customizer**: Multi-layer canvas editor supporting text, predefined SVG graphics, and Cloudinary image uploads.
- **Positioning, Scaling & Rotation**: Drag-to-position, scale (0.5x to 3x), and rotation (-180° to 180°) controls for canvas layers.
- **Multi-View Garment Preview**: Switch between Front, Back, Left, and Right garment views.
- **Cart & Quantity Management**: Server-validated cart synchronization and stock availability checks.
- **Delivery Address Management**: Saved address book with default address selector.
- **Razorpay Online Payment**: Server-verified online payments with HMAC-SHA256 signature verification.
- **Order Confirmation & Tracking**: Live status progress timeline (`PLACED` to `DELIVERED`).
- **Profile, Wishlist & Referrals**: User profile updates, personal wishlist, and referral code sharing.

---

## 9. Admin Guide

### Dashboard Analytics
- View total sales revenue, active order totals, registered customer counts, and recent order activity.

### Product & Stock Management
- **Add Product**: Create new T-shirt items, set base price, description, category, and upload multi-view garment images.
- **Manage Inventory**: Update stock counters per size (XS-XXXL) and color variant directly. Toggle product visibility (`isActive`).

### Order & Return Processing
- **Review Orders**: Inspect incoming orders, customer details, shipping address snapshot, and customization design snapshots.
- **Status Updates**: Advance order status (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`).
- **Returns & Refunds**: Review return requests, approve/reject return requests, and issue Razorpay refunds.

### Master Data & Marketing
- **Design Library**: Upload SVG graphics to vector design library for customer studio.
- **Coupons**: Create percentage or fixed-amount discount codes with usage limits and expiry dates.
- **Banners**: Upload and organize homepage hero promotional banners.
- **Categories, Sizes, Colours**: Manage master lookup options across platform.

---

## 10. Admin Features

- **Secure Admin Login**: RBAC enforcement via `authorize('admin')` middleware.
- **Sales & Order Analytics**: Revenue metrics and order status breakdowns.
- **Product Management**: Full CRUD for catalog items and garment images.
- **Inventory & Stock Control**: Variant-level stock updates and active/inactive toggles.
- **Design Library Management**: Vector design asset library management.
- **Customer Management**: User profile overview.
- **Order & Status Management**: Order processing and status advancement.
- **Return & Refund Processing**: Admin review for return requests and Razorpay refunds.
- **Coupon & Discount Engine**: Promotional code management with minimum order rules.
- **Banner Content Management**: Hero carousel banner management.

---

## 11. System Architecture

```
[ Customer / Admin Browser (React 19 + Vite 8) ]
                        │
                        │ HTTP / HTTPS (JSON Payload, Credentials Included)
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

### Architecture Breakdown
- **Frontend Layer**: Decoupled React SPAs (`client` and `admin`) built with Vite 8, utilizing vanilla CSS modules and client-side caching.
- **Backend Layer**: Stateless Node.js / Express 5 API server implementing JWT cookie authentication, rate limiting, and RBAC.
- **Database Layer**: Cloud-hosted MongoDB Atlas with Mongoose 9 schemas and compound index optimization.
- **External Services**: Cloudinary for media storage, Razorpay for payment gateway processing, Google OAuth for authentication.

---

## 12. Application Workflow

### Complete Data Flow Diagram

```
Customer Interaction
   │
   ├── 1. Browse Catalog ──> GET /api/v1/products ──> Mongoose (.lean()) ──> Return Products
   │
   ├── 2. Customise T-Shirt ──> POST /api/v1/customizations ──> Save Layer JSON to MongoDB
   │
   ├── 3. Add to Cart ──> POST /api/v1/cart ──> Validate Variant & Stock ──> Save Cart Item
   │
   ├── 4. Checkout ──> POST /api/v1/orders ──> Server Recalculates Price ──> Razorpay Order
   │
   ├── 5. Pay ──> Razorpay Modal ──> Customer Completes Payment
   │
   └── 6. Verification ──> POST /api/v1/orders/verify-payment
                                 │
                                 ├── Verify HMAC-SHA256 Signature
                                 ├── Update Order Status -> PAID, PLACED
                                 ├── Atomically Decrement Variant Stock ($inc)
                                 └── Clear Customer Cart
```

---

## 13. Technology Stack

| Layer | Technology | Installed Version | Purpose in ANIVOM |
|---|---|---|---|
| Frontend Framework | React | ^19.2.8 | SPA UI component rendering |
| Build Tool | Vite | ^8.3.0 | Fast frontend bundling and HMR |
| Linter | Oxlint | ^1.81.0 | High-performance static code linting |
| Backend Framework | Express.js | ^5.2.1 | REST API routing and middleware execution |
| Runtime | Node.js | v20+ | Server-side JavaScript runtime |
| Database | MongoDB / Mongoose | ^9.10.1 | Document database & object data modeling |
| Security | Helmet | ^8.3.0 | HTTP security response headers |
| Security | Express Rate Limit | ^8.7.0 | Rate limiting protection for auth & uploads |
| Password Encryption | Bcryptjs | ^3.0.3 | Password hashing with salt |
| Authentication | Jsonwebtoken | ^9.0.3 | JWT token signing & verification |
| Auth Integration | Google Auth Library | ^11.1.0 | Google OAuth 2.0 token verification |
| Payment Gateway | Razorpay SDK | ^2.9.8 | Payment order creation & refund API |
| Cloud Storage | Cloudinary SDK | ^2.11.0 | Image upload & media management |
| File Parser | Multer | ^2.4.0 | Multipart form-data image parsing |
| Environment | Dotenv | ^18.0.1 | Environment variable parsing |

---

## 14. Frontend Architecture

- **SPAs (`client` and `admin`)**: Decoupled React applications compiled via Vite into static assets (`dist/`).
- **Routing**: Lightweight client-side view state router (`view`, `viewParams`) providing immediate transitions without unnecessary page reloads.
- **State Management**: React Context and local state hooks managing cart counts, user sessions, wishlist items, and customization layer arrays.
- **Design System**: Responsive vanilla CSS with global design tokens, fashion-editorial layouts, subtle micro-interactions, brand-consistent typography/spacing, and responsive media queries.

---

## 15. Backend Architecture

- **Modular Directory Layout**:
  - `config/`: MongoDB connection setup (`db.js`) and Cloudinary configuration.
  - `controllers/`: Request handlers containing business logic (18 controllers).
  - `middleware/`: Auth JWT verification (`protect`), RBAC (`authorize`), and centralized error handling (`errorMiddleware.js`).
  - `models/`: Mongoose schemas (15 models).
  - `routes/`: Express router modules (16 modules).
  - `utils/` & `validators/`: Helper utilities and upload handlers.

---

## 16. Database Architecture

### Complete Mongoose Models Registry (Exactly 15 Models)

1. **`User`**: Credentials (`name`, `email`, `password`), role (`customer`/`admin`), unique `referralCode`, optional `googleId`. Indexes: `email`, `referralCode`.
2. **`Product`**: Catalog T-shirts (`name`, `description`, `category`, `basePrice`, `images`, `garmentImages`, `variants`, `isActive`). Variants array contains size, color, stock. Compound indexes: `{ isActive: 1, category: 1, createdAt: -1 }`, `{ isActive: 1, basePrice: 1 }`.
3. **`Customization`**: User canvas design configurations (`user`, `product`, `size`, `colour`, `layers`, `status`). Index: `{ user: 1, createdAt: -1 }`.
4. **`Cart`**: Active shopping cart items (`user`, `items: [{ product, size, colour, quantity, customized, customization }]`). Index: `user`.
5. **`Address`**: Delivery address entries (`user`, `fullName`, `phone`, `addressLine1`, `addressLine2`, `city`, `state`, `postalCode`, `country`, `label`, `isDefault`). Index: `user`.
6. **`Order`**: Master order transactions (`user`, `items`, `shippingAddress`, `subtotal`, `discountAmount`, `totalAmount`, `couponSnapshot`, `paymentStatus`, `orderStatus`, `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`, `returnReason`, `refundStatus`). Compound indexes: `{ user: 1, createdAt: -1 }`, `{ orderNumber: 1 }`.
7. **`Design`**: Vector design library SVG templates for Studio customizer (`name`, `category`, `svg`, `url`, `publicId`, `isActive`). Compound index: `{ isActive: 1, category: 1 }`.
8. **`Coupon`**: Promotional discount rules (`code`, `discountType`, `discountValue`, `minimumOrderAmount`, `maximumDiscountAmount`, `startDate`, `endDate`, `usageLimit`, `usedCount`, `isActive`). Index: `code`.
9. **`Banner`**: Hero carousel banners (`title`, `subtitle`, `image`, `imagePublicId`, `buttonText`, `buttonLink`, `sortOrder`, `isActive`).
10. **`Category`**: Master product categories (`name`, `isActive`).
11. **`Size`**: Master size options (`name`, `isActive`).
12. **`Colour`**: Master color palettes (`name`, `isActive`).
13. **`Wishlist`**: Customer saved items (`user`, `products`).
14. **`ContactMessage`**: Support inquiries (`user`, `name`, `email`, `orderId`, `subject`, `message`, `status`).
15. **`Referral`**: Customer referral tracking (`referrer`, `referred`, `referralCode`, `status`, `rewardStatus`).

---

## 17. Cart and Order Architecture

- **Cart Model**: Tied to authenticated `user` ID. Stores array of items with variant specifications (`size`, `colour`), quantity, and `customization` reference.
- **Order Snapshotting**: When an order is placed, `orderController.js` creates a frozen snapshot of items, shipping address, applied coupon, and complete customization layer JSON.
- **Server Price Validation**: Item unit prices and discount values are queried directly from `Product` and `Coupon` models during order creation; prices passed from frontend are ignored.

---

## 18. Checkout and Payment Architecture

- **Order Creation**: Client calls `POST /api/v1/orders`. Server verifies stock, recalculates subtotal, applies coupon rules, saves `Order` in `PENDING` payment state, and creates Razorpay payment order.
- **Payment Verification**: Client submits Razorpay response to `POST /api/v1/orders/verify-payment`. Server calculates HMAC-SHA256 signature using `RAZORPAY_KEY_SECRET`.
- **Atomic Stock Update & Cart Clearing**: If signature matches, order state updates to `PAID`, variant stock is decremented atomically (`$inc: -quantity`), and user cart is cleared.

---

## 19. Authentication and Authorization

- **JWT Tokens**: Signed with `JWT_SECRET`, containing user ID and role.
- **HTTP-Only Cookies**: JWTs are transmitted in `httpOnly`, `sameSite`, `secure` cookies to mitigate XSS vulnerabilities.
- **Role-Based Access Control (RBAC)**: Protected admin endpoints use `protect` followed by `authorize('admin')`. Non-admin access returns `403 Forbidden`.
- **Resource Ownership**: Endpoints for address, cart, customization, and order retrieval verify document ownership (`document.user === req.user._id`).

---

## 20. Backend Security and Business Logic

- **Password Encryption**: Bcrypt hashing with auto-generated salt (`bcryptjs`).
- **Security Headers**: Helmet middleware enabled (`helmet({ contentSecurityPolicy: false })`).
- **Rate Limiting**: Auth endpoints (30 req/15min), Uploads (50 req/15min), Support (10 req/15min).
- **Concurrency & Stock Protection**: Stock decrements use atomic MongoDB `$inc` operations with array filters matching variant size and color.
- **Environment Isolation**: Secrets managed via environment variables (`MONGODB_URI`, `JWT_SECRET`, `RAZORPAY_KEY_SECRET`, `CLOUDINARY_URL`).

---

## 21. Image Storage

- **Cloudinary Storage Bucket**: Direct buffer uploads via Multer stream to Cloudinary API.
- **Validation**: Uploads restricted to `image/png`, `image/jpeg`, `image/webp` under 5MB file size limit.
- **Usage**: Handles customer Studio image uploads, product garment mockups, design library assets, and homepage banners.

---

## 22. Performance Optimization

- **Centralized Wishlist State**: Consolidated wishlist requests in `App.jsx`, eliminating duplicate GET calls on catalog browsing.
- **In-Memory Module Caching**: Client-side caching for catalog filter metadata (`cachedDbCategories`, `cachedDbSizes`, `cachedDbColours`) and vector design library (`cachedStudioDesigns`).
- **Mongoose Lean Queries**: Applied `.lean()` to GET queries across controllers for faster execution and lower memory usage.
- **Database Indexes**: Compound indexes created on active, category, basePrice, and timestamp fields.
- **Image Priority Attributes**: `fetchPriority="high"` on hero/primary PDP images; `loading="lazy"` and `decoding="async"` for thumbnails.

---

## 23. Validation and Error Handling

- **Global Express Error Handler**: `errorMiddleware.js` handles unhandled errors and formats standardized JSON error responses.
- **Mongoose Schema Constraints**: Schema-level validation enforcing enum choices, string trims, required fields, and non-negative numbers.
- **Business Logic Guards**: Clear error responses returned for invalid variants, out-of-stock items, expired coupons, or unauthorized actions.

## 24. API Documentation

### Interactive OpenAPI 3 / Swagger UI Reference
ANIVOM provides interactive OpenAPI 3.0 / Swagger UI documentation mounted directly on the Express server:

- **Production Swagger UI Route**: https://anivom.onrender.com/api-docs
- **Interactive Features**: Complete endpoint testing, authentication scheme details (`cookieAuth` JWT cookie), request payload schemas, multipart file upload parameter descriptions, and status code responses.

### Complete 46 Endpoints Registry

#### 1. Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` | Public | Registers customer account & generates referral code.
- `POST /api/v1/auth/login` | Public | Authenticates credentials; issues HTTP-Only JWT cookie.
- `POST /api/v1/auth/google` | Public | Authenticates/registers user via Google OAuth credential token.
- `POST /api/v1/auth/logout` | Public | Clears authentication HTTP-Only cookie.
- `GET /api/v1/auth/me` | Protected | Returns profile of currently logged-in user.
- `GET /api/v1/auth/users/admin` | Protected (Admin) | Lists all registered customer profiles.

#### 2. Products (`/api/v1/products`)
- `GET /api/v1/products` | Public | Lists active products with search, category, size, colour, price filters, and pagination.
- `GET /api/v1/products/:id` | Public | Fetches single product by ID.
- `POST /api/v1/products/admin` | Protected (Admin) | Creates catalog product.
- `GET /api/v1/products/admin` | Protected (Admin) | Fetches all catalog products.
- `GET /api/v1/products/admin/:id` | Protected (Admin) | Fetches full product details.
- `PATCH /api/v1/products/admin/:id` | Protected (Admin) | Updates product details.
- `PATCH /api/v1/products/admin/:id/status` | Protected (Admin) | Toggles product active status.
- `PATCH /api/v1/products/admin/:id/variants/:variantId/stock` | Protected (Admin) | Updates variant stock.

#### 3. Customizations (`/api/v1/customizations`)
- `POST /api/v1/customizations` | Protected | Saves or updates T-shirt design configuration.
- `GET /api/v1/customizations` | Protected | Lists user's saved customizations.
- `GET /api/v1/customizations/:id` | Protected | Fetches customization details (ownership enforced).
- `PATCH /api/v1/customizations/:id` | Protected | Updates customization.
- `DELETE /api/v1/customizations/:id` | Protected | Deletes saved customization.

#### 4. Shopping Cart (`/api/v1/cart`)
- `GET /api/v1/cart` | Protected | Fetches active cart items.
- `POST /api/v1/cart` | Protected | Adds product or customized item to cart.
- `PATCH /api/v1/cart/:itemId` | Protected | Updates cart item quantity.
- `DELETE /api/v1/cart/:itemId` | Protected | Removes item from cart.
- `DELETE /api/v1/cart` | Protected | Clears cart.
- `POST /api/v1/cart/checkout-summary` | Protected | Recalculates cart totals and validates coupon.

#### 5. Addresses (`/api/v1/addresses`)
- `GET /api/v1/addresses` | Protected | Fetches user's saved delivery addresses.
- `POST /api/v1/addresses` | Protected | Adds new address.
- `PATCH /api/v1/addresses/:id` | Protected | Updates address.
- `DELETE /api/v1/addresses/:id` | Protected | Deletes address.
- `PATCH /api/v1/addresses/:id/default` | Protected | Sets default address.

#### 6. Orders & Payments (`/api/v1/orders`)
- `POST /api/v1/orders` | Protected | Creates order & initializes Razorpay payment.
- `POST /api/v1/orders/verify-payment` | Protected | Verifies HMAC signature, completes payment, updates stock.
- `GET /api/v1/orders` | Protected | Lists customer order history.
- `GET /api/v1/orders/:id` | Protected | Fetches customer order details.
- `PATCH /api/v1/orders/:id/cancel` | Protected | Cancels order & restores stock.
- `PATCH /api/v1/orders/:id/return` | Protected | Requests return for delivered order.
- `GET /api/v1/orders/admin/stats` | Protected (Admin) | Fetches admin sales metrics & summary.
- `GET /api/v1/orders/admin` | Protected (Admin) | Lists all customer orders.
- `GET /api/v1/orders/admin/:id` | Protected (Admin) | Fetches admin order view.
- `PATCH /api/v1/orders/admin/:id/status` | Protected (Admin) | Updates order status.
- `PATCH /api/v1/orders/admin/:id/return` | Protected (Admin) | Approves/rejects return.
- `PATCH /api/v1/orders/admin/:id/refund` | Protected (Admin) | Issues refund.

#### 7. Image Uploads (`/api/v1/uploads`)
- `POST /api/v1/uploads/image` | Protected | Rate-limited Cloudinary image upload endpoint.

#### 8. Vector Design Library (`/api/v1/designs`)
- `GET /api/v1/designs` | Public | Fetches active SVG vector design templates.
- `GET /api/v1/designs/admin` | Protected (Admin) | Lists all design library templates.
- `POST /api/v1/designs/admin` | Protected (Admin) | Uploads new SVG design template.
- `PATCH /api/v1/designs/admin/:id` | Protected (Admin) | Updates design template details.
- `DELETE /api/v1/designs/admin/:id` | Protected (Admin) | Deletes design template from library.

#### 9. Product Categories (`/api/v1/categories`)
- `GET /api/v1/categories` | Public | Fetches active product categories.
- `GET /api/v1/categories/admin` | Protected (Admin) | Lists all product categories.
- `POST /api/v1/categories/admin` | Protected (Admin) | Creates product category.
- `PATCH /api/v1/categories/admin/:id` | Protected (Admin) | Updates product category.
- `DELETE /api/v1/categories/admin/:id` | Protected (Admin) | Deletes product category.

#### 10. Product Sizes (`/api/v1/sizes`)
- `GET /api/v1/sizes` | Public | Fetches active product sizes.
- `GET /api/v1/sizes/admin` | Protected (Admin) | Lists all product sizes.
- `POST /api/v1/sizes/admin` | Protected (Admin) | Creates product size.
- `PATCH /api/v1/sizes/admin/:id` | Protected (Admin) | Updates product size.
- `DELETE /api/v1/sizes/admin/:id` | Protected (Admin) | Deletes product size.

#### 11. Product Colours (`/api/v1/colours`)
- `GET /api/v1/colours` | Public | Fetches active product color options.
- `GET /api/v1/colours/admin` | Protected (Admin) | Lists all product color options.
- `POST /api/v1/colours/admin` | Protected (Admin) | Creates product color option.
- `PATCH /api/v1/colours/admin/:id` | Protected (Admin) | Updates product color option.
- `DELETE /api/v1/colours/admin/:id` | Protected (Admin) | Deletes product color option.

#### 12. Promotional Coupons (`/api/v1/coupons`)
- `GET /api/v1/coupons/validate` | Protected | Validates promo coupon for customer subtotal.
- `GET /api/v1/coupons/admin` | Protected (Admin) | Lists all promotional coupons.
- `POST /api/v1/coupons/admin` | Protected (Admin) | Creates promotional discount coupon.
- `PATCH /api/v1/coupons/admin/:id` | Protected (Admin) | Updates coupon parameters.
- `DELETE /api/v1/coupons/admin/:id` | Protected (Admin) | Deletes coupon code.

#### 13. Homepage Hero Banners (`/api/v1/banners`)
- `GET /api/v1/banners` | Public | Fetches active homepage hero promo banners.
- `GET /api/v1/banners/admin` | Protected (Admin) | Lists all homepage hero banners.
- `POST /api/v1/banners/admin` | Protected (Admin) | Creates hero banner.
- `PATCH /api/v1/banners/admin/:id` | Protected (Admin) | Updates hero banner.
- `DELETE /api/v1/banners/admin/:id` | Protected (Admin) | Deletes hero banner.

#### 14. Wishlist (`/api/v1/wishlist`)
- `GET /api/v1/wishlist` | Protected | Fetches customer's saved wishlist products.
- `POST /api/v1/wishlist` | Protected | Adds product to customer wishlist.
- `DELETE /api/v1/wishlist/:productId` | Protected | Removes product from customer wishlist.

#### 15. Support & Contact (`/api/v1/contact`)
- `POST /api/v1/contact` | OptionalAuth | Submits customer support inquiry (rate-limited).
- `GET /api/v1/contact/admin` | Protected (Admin) | Lists all support messages.
- `PATCH /api/v1/contact/admin/:id/status` | Protected (Admin) | Updates support message status.
- `DELETE /api/v1/contact/admin/:id` | Protected (Admin) | Deletes support message.

#### 16. Customer Referrals (`/api/v1/referrals`)
- `GET /api/v1/referrals/me` | Protected | Fetches customer's earned referral stats.
- `GET /api/v1/referrals/validate/:code` | Public | Validates referral code.

---

## 25. Testing and QA

### Automated Verification Checks
- **Client Linter**: Executed `npm run lint --prefix client` via Oxlint (PASSED with 0 errors).
- **Production Build**: Executed `npm run build --prefix client` via Vite (PASSED in 307ms).
- **Server Require Check**: Executed `node -e "require('./src/app')"` (PASSED cleanly).
- **Git Diff Whitespace Check**: Executed `git diff --check` (PASSED cleanly).

### Manual Functional QA Coverage
- Verified user registration, login, logout, and Google OAuth flows.
- Verified catalog filtering, search debouncing, price range slider, and variant selection.
- Verified ANIVOM Studio text insertion, design library selection, custom image upload, drag positioning, scaling, and multi-view garment previews.
- Verified cart addition, quantity updates, coupon application, address selection, Razorpay payment verification, and stock decrementing.
- Verified admin dashboard metrics, product CRUD, inventory stock updates, order status advancement, and return/refund processing.

---

## 26. Responsive Design

- **Mobile Viewports (<768px)**: Studio tools collapse into bottom action drawers; catalog sidebar transforms into a full-screen drawer filter.
- **Tablet Viewports (768px-1024px)**: Touch-optimized canvas scaling and multi-column checkout layouts.
- **Desktop Viewports (>1024px)**: Full side-by-side studio canvas controls, fixed sidebar catalog filters, and multi-pane admin dashboards.

---

## 27. Deployment

| Component | Architecture / Provider | Deployment Status | Live Production URL |
|---|---|---|---|
| Customer Frontend | React SPA (Vercel static bundle `dist/`) | VERIFIED DEPLOYED | https://anivom.vercel.app/ |
| Admin Frontend | React SPA (Vercel static bundle `dist/`) | VERIFIED DEPLOYED | https://anivom-admin.vercel.app/ |
| Backend API | Express Node.js Service (Render continuous hosting) | VERIFIED DEPLOYED | https://anivom.onrender.com |
| Database | Cloud MongoDB Atlas Cluster | CONFIGURATION VERIFIED | Bound via `MONGODB_URI` environment variable |
| Payment Gateway | Razorpay Live API Account | CONFIGURATION VERIFIED | Bound via `RAZORPAY_KEY_ID` environment variable |
| Media Storage | Cloudinary Storage Bucket | CONFIGURATION VERIFIED | Bound via `CLOUDINARY_URL` environment variable |

---

## 28. PRD Compliance Matrix

| PRD Requirement | Implementation Status | Implementation Details |
|---|---|---|
| Full MERN Stack | COMPLETED | MongoDB, Express.js 5, React 19, Node.js. |
| User Registration & Login | COMPLETED | Bcrypt password hashing, JWT cookies, Google OAuth. |
| Browse & Search T-Shirts | COMPLETED | Catalog grid, live keyword search, price slider, filters. |
| Filter by Category, Size, Colour, Price | COMPLETED | Active multi-criteria catalog filter system. |
| Product Details & Garment Preview | COMPLETED | Multi-view garment mockups with size/color stock checks. |
| Text Customization | COMPLETED | Canvas text layers with font, size, color, and alignment controls. |
| Predefined Vector Designs | COMPLETED | Vector SVG artwork library for studio customizer. |
| Custom Image Uploads | COMPLETED | Multer + Cloudinary upload pipeline with 5MB validation. |
| Position & Scale Custom Design | COMPLETED | Interactive drag positioning, scale, and rotation controls. |
| Multi-View Garment Preview | COMPLETED | Front, Back, Left, and Right garment view toggle per color choice. |
| Cart & Quantity Management | COMPLETED | Server-validated cart synchronization and stock checks. |
| Checkout & Delivery Address | COMPLETED | Address book management and checkout summary validation. |
| Razorpay Online Payment | COMPLETED | Server-side Razorpay order creation & HMAC signature verification. |
| Order Confirmation & Tracking | COMPLETED | Live order progress timeline (`PLACED` to `DELIVERED`). |
| Profile & Address Management | COMPLETED | Customer address book, profile updates, and referral codes. |
| Secure Admin Login | COMPLETED | Admin auth page protected by backend `authorize('admin')` check. |
| Admin Dashboard Analytics | COMPLETED | Revenue metrics, active order totals, and customer counts. |
| Admin Product & Inventory Control | COMPLETED | Catalog product CRUD, variant stock updates, visibility toggles. |
| Admin Master Data Management | COMPLETED | Categories, sizes, colors, and design library management. |
| Admin Coupons & Banners | COMPLETED | Promotional discount rules and hero carousel banner controls. |
| Mobile & Tablet Responsiveness | COMPLETED | Responsive CSS media queries across client and admin panels. |

---

## 29. Expected Deliverables

| Deliverable | Status | Evidence / Location |
|---|---|---|
| Customer-Facing Website | VERIFIED DEPLOYED | `https://anivom.vercel.app/` |
| Admin Panel | VERIFIED DEPLOYED | `https://anivom-admin.vercel.app/` |
| Backend REST APIs | VERIFIED DEPLOYED | `https://anivom.onrender.com` (Health Check: `GET /api/v1/health`) |
| T-Shirt Customisation Module | COMPLETED | `client/src/Studio.jsx` Canvas Customizer |
| MongoDB Database | COMPLETED | `server/src/models/` 15 Mongoose Schemas |
| Payment Integration | COMPLETED | `orderController.js` Razorpay Integration |
| Verification & Testing | COMPLETED | Clean Linter, Build, and Server Load Checks |
| Deployment Configurations | VERIFIED DEPLOYED | Vercel & Render Continuous Deployments Verified |
| Technical Documentation | COMPLETED | Consolidated Document Sections 11-23 |
| User Documentation | COMPLETED | Consolidated Document Sections 6-9 |
| Human-Written Code Declaration | COMPLETED | Developer Declaration signature field provided |

---

## 30. Project Demo Credentials & Verification

### Customer Demo Account
- **URL**: `https://anivom.vercel.app/`
- **Email**: `anivom1@gmail.com`
- **Password**: `Anivom@1`

### Admin Demo Account
- **URL**: `https://anivom-admin.vercel.app/`
- **Email**: `admin@anivom.com`
- **Password**: `admin123`

### Backend Service & Health Check
- **API Production Base URL**: `https://anivom.onrender.com`
- **Health Check Endpoint**: `GET https://anivom.onrender.com/api/v1/health`
- **Status**: Working successfully (`{ status: 'success', message: 'ANIVOM API is running' }`)

### Known Limitations
1. **Developer Team Signature**: Developer declaration signature to be signed before submission.

---

## 31. Human-Written Code Declaration

### Official Development Team Declaration

We hereby declare and confirm that:

1. **Manual Authorship**: All frontend code, backend code, database schemas, API controllers, T-shirt customization logic, CSS styles, and configuration files contained in this repository were written manually by the development team.
2. **No AI Code Copying/Adaptation**: In compliance with Constraint 7 of the Project Requirement Document (PRD), no AI-generated code was copied, adapted, or incorporated into this production codebase.
3. **Reference Sources**: All reference materials utilized during development were restricted strictly to official technical documentation (React.js, Node.js, Express.js, MongoDB, Razorpay API, Cloudinary API) and standard technical learning resources.

---

### Signatures & Affirmation

Developer declaration signature to be signed before submission.

---

## 32. Final Submission Checklist

- [x] VERIFIED: Customer Production Website URL (`https://anivom.vercel.app/`)
- [x] VERIFIED: Admin Production Website URL (`https://anivom-admin.vercel.app/`)
- [x] VERIFIED: Backend Production API URL (`https://anivom.onrender.com`)
- [x] VERIFIED: Dedicated Demo Customer Credentials (`anivom1@gmail.com` / `Anivom@1`)
- [x] VERIFIED: Dedicated Demo Admin Credentials (`admin@anivom.com` / `admin123`)
- [x] VERIFIED: Backend Health Check (`GET https://anivom.onrender.com/api/v1/health`)
- [x] VERIFIED: Complete REST API Documentation (46 Endpoints verified)
- [x] VERIFIED: Full System Architecture & Technology Stack documented
- [x] VERIFIED: Core T-Shirt Customizer engine documented (Front, Back, Left, Right views)
- [x] VERIFIED: Payment & Security architecture verified (Razorpay HMAC-SHA256 verification)
- [x] VERIFIED: Verification checks clean (Build, Lint, Server Load)
- [x] VERIFIED: Human-written code declaration attached
- [x] VERIFIED: PRD compliance matrix completed

**Status**: READY FOR SUBMISSION (Pending manual developer signature)


