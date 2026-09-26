# ANIVOM — Backend API

The Express.js / Node.js REST API backend powering the **ANIVOM** customized T-shirt e-commerce platform. Built with MongoDB and Mongoose, it handles authentication, product management, customizer layer persistence, cart validation, Razorpay online payment verification, order processing, and administrative controls.

---

## 1. Backend Overview
The backend acts as the authoritative business logic and security layer for ANIVOM. It enforces Role-Based Access Control (RBAC), calculates order subtotals and discounts server-side, validates variant stock levels, verifies Razorpay payment signatures using HMAC-SHA256, and handles media uploads via Cloudinary.

---

## Interactive API Documentation

ANIVOM provides interactive OpenAPI 3.0 / Swagger UI documentation for testing and inspecting all REST API routes directly in the browser:

- **Production Swagger UI**: https://anivom.onrender.com/api-docs
- **Local Swagger UI**: `http://localhost:5000/api-docs`
- **Production API Base Path**: https://anivom.onrender.com/api/v1
- **Local API Base Path**: `http://localhost:5000/api/v1`

---

## 2. Responsibilities
- **Authentication & Security**: User registration, bcrypt password hashing, JWT HTTP-Only cookie issuance, Google OAuth token verification, and RBAC (`customer`/`admin`).
- **Catalog & Inventory**: Product CRUD, variant stock management (XS-XXXL), category/color/size lookups, and Mongoose compound index optimizations.
- **Customization Engine**: Processing layer JSON configurations from ANIVOM Studio and freezing design snapshots upon order creation.
- **Cart & Order Validation**: Recalculating subtotals server-side, validating coupon discount rules, creating Razorpay orders, verifying payment signatures, and executing atomic stock updates.
- **Order Lifecycle & Returns**: Order status advancement (`PLACED` to `DELIVERED`), order cancellations with automatic stock restoration, return processing, and Razorpay refunds.

---

## 3. Architecture
Organized into a modular architecture:
```
server/
├── src/
│   ├── app.js               # Express application initialization & middleware
│   ├── server.js            # Server entry point & listener
│   ├── config/              # Database (db.js) & Cloudinary configurations
│   ├── controllers/         # Business logic request controllers (18 controllers)
│   ├── middleware/          # Auth, RBAC, Rate-Limiters & Error Middleware
│   ├── models/              # Mongoose database schemas (15 models)
│   ├── routes/              # Express API route declarations (16 route modules)
│   ├── seed/                # Database seed scripts for products, designs, categories
│   ├── services/            # Service helpers
│   ├── utils/               # Utility helper functions
│   └── validators/          # Input validation helpers
├── package.json             # Dependencies & npm scripts
└── .env.example             # Environment variable template
```

---

## 4. Technology Stack
From `server/package.json`:
- **Node.js**: `v20+` runtime
- **Express.js**: `^5.2.1`
- **Mongoose / MongoDB**: `^9.10.1`
- **Bcryptjs**: `^3.0.3`
- **Jsonwebtoken**: `^9.0.3`
- **Helmet**: `^8.3.0`
- **Express Rate Limit**: `^8.7.0`
- **Cookie Parser**: `^1.4.7`
- **CORS**: `^2.8.6`
- **Google Auth Library**: `^11.1.0`
- **Razorpay SDK**: `^2.9.8`
- **Cloudinary SDK**: `^2.11.0`
- **Multer**: `^2.4.0`
- **Dotenv**: `^18.0.1`

---

## 5. Authentication and Authorization
- **Registration & Login**: Credentials hashed via Bcrypt (`bcryptjs`). Successful login issues a signed JWT stored in an HTTP-Only cookie.
- **Google OAuth**: Verifies Google ID tokens using `google-auth-library` and creates/links user accounts.
- **Role-Based Access Control (RBAC)**: Middleware `protect` verifies JWT signature; `authorize('admin')` restricts access to admin-only endpoints.
- **Document Ownership**: User-facing endpoints for address, cart, customization, and order retrieval explicitly verify `document.user === req.user._id`.

---

## 6. Database Models (Exactly 15 Models)
1. **`User`**: Account credentials, role, unique `referralCode`, optional `googleId`.
2. **`Product`**: Catalog T-shirts, base price, images, garment mockups, variant stock array.
3. **`Customization`**: Studio canvas design configurations & layer JSON arrays.
4. **`Cart`**: Active shopping cart items & customization references.
5. **`Address`**: Saved customer delivery address entries.
6. **`Order`**: Master order transactions, item snapshots, shipping snapshot, coupon snapshot, payment/order status.
7. **`Design`**: Vector design library SVG artwork templates.
8. **`Coupon`**: Promotional discount rules (percentage/fixed) and usage limits.
9. **`Banner`**: Homepage hero carousel banners.
10. **`Category`**: Master product category lookups.
11. **`Size`**: Master sizing options (XS-XXXL).
12. **`Colour`**: Master color palette lookups.
13. **`Wishlist`**: Customer saved products.
14. **`ContactMessage`**: Customer support inquiries.
15. **`Referral`**: Referral relationship and reward tracking.

---

## 7. REST API Endpoints Registry

The ANIVOM backend exposes **46 business/API endpoints, plus 1 public health-check endpoint** (`GET /api/v1/health`), bringing the total route count to 47 endpoints across 16 router modules.

### Base Path: `/api/v1`

#### Health Check (1 Endpoint)
- `GET /api/v1/health` | Public | Returns API status (`{ status: 'success', message: 'ANIVOM API is running' }`).

#### 1. Authentication (`/api/v1/auth`) — 6 Endpoints
- `POST /api/v1/auth/register` | Public | Registers customer account & generates referral code.
- `POST /api/v1/auth/login` | Public | Authenticates credentials; issues HTTP-Only JWT cookie.
- `POST /api/v1/auth/google` | Public | Authenticates/registers user via Google OAuth credential token.
- `POST /api/v1/auth/logout` | Public | Clears authentication HTTP-Only cookie.
- `GET /api/v1/auth/me` | Protected | Returns profile of currently logged-in user.
- `GET /api/v1/auth/users/admin` | Protected (Admin) | Lists all registered customer profiles.

#### 2. Products (`/api/v1/products`) — 8 Endpoints
- `GET /api/v1/products` | Public | Lists active products with search, category, size, colour, price filters, and pagination.
- `GET /api/v1/products/:id` | Public | Fetches single product by ID.
- `POST /api/v1/products/admin` | Protected (Admin) | Creates catalog product.
- `GET /api/v1/products/admin` | Protected (Admin) | Fetches all catalog products.
- `GET /api/v1/products/admin/:id` | Protected (Admin) | Fetches full product details.
- `PATCH /api/v1/products/admin/:id` | Protected (Admin) | Updates product details.
- `PATCH /api/v1/products/admin/:id/status` | Protected (Admin) | Toggles product active status.
- `PATCH /api/v1/products/admin/:id/variants/:variantId/stock` | Protected (Admin) | Updates variant stock.

#### 3. Customizations (`/api/v1/customizations`) — 5 Endpoints
- `POST /api/v1/customizations` | Protected | Saves or updates T-shirt design configuration.
- `GET /api/v1/customizations` | Protected | Lists user's saved customizations.
- `GET /api/v1/customizations/:id` | Protected | Fetches customization details (ownership enforced).
- `PATCH /api/v1/customizations/:id` | Protected | Updates customization.
- `DELETE /api/v1/customizations/:id` | Protected | Deletes saved customization.

#### 4. Shopping Cart (`/api/v1/cart`) — 6 Endpoints
- `GET /api/v1/cart` | Protected | Fetches active cart items.
- `POST /api/v1/cart` | Protected | Adds product or customized item to cart.
- `PATCH /api/v1/cart/:itemId` | Protected | Updates cart item quantity.
- `DELETE /api/v1/cart/:itemId` | Protected | Removes item from cart.
- `DELETE /api/v1/cart` | Protected | Clears cart.
- `POST /api/v1/cart/checkout-summary` | Protected | Recalculates cart totals and validates coupon.

#### 5. Delivery Addresses (`/api/v1/addresses`) — 5 Endpoints
- `GET /api/v1/addresses` | Protected | Fetches user's saved delivery addresses.
- `POST /api/v1/addresses` | Protected | Adds new address.
- `PATCH /api/v1/addresses/:id` | Protected | Updates address.
- `DELETE /api/v1/addresses/:id` | Protected | Deletes address.
- `PATCH /api/v1/addresses/:id/default` | Protected | Sets default address.

#### 6. Orders & Payments (`/api/v1/orders`) — 12 Endpoints
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

#### 7. Image Uploads (`/api/v1/uploads`) — 1 Endpoint
- `POST /api/v1/uploads/image` | Protected | Rate-limited Cloudinary image upload endpoint.

#### 8. Vector Design Library (`/api/v1/designs`) — 5 Endpoints
- `GET /api/v1/designs` | Public | Fetches active SVG vector design templates.
- `GET /api/v1/designs/admin` | Protected (Admin) | Lists all design library templates.
- `POST /api/v1/designs/admin` | Protected (Admin) | Uploads new SVG design template.
- `PATCH /api/v1/designs/admin/:id` | Protected (Admin) | Updates design template details.
- `DELETE /api/v1/designs/admin/:id` | Protected (Admin) | Deletes design template from library.

#### 9. Product Categories (`/api/v1/categories`) — 5 Endpoints
- `GET /api/v1/categories` | Public | Fetches active product categories.
- `GET /api/v1/categories/admin` | Protected (Admin) | Lists all product categories.
- `POST /api/v1/categories/admin` | Protected (Admin) | Creates product category.
- `PATCH /api/v1/categories/admin/:id` | Protected (Admin) | Updates product category.
- `DELETE /api/v1/categories/admin/:id` | Protected (Admin) | Deletes product category.

#### 10. Product Sizes (`/api/v1/sizes`) — 5 Endpoints
- `GET /api/v1/sizes` | Public | Fetches active product sizes.
- `GET /api/v1/sizes/admin` | Protected (Admin) | Lists all product sizes.
- `POST /api/v1/sizes/admin` | Protected (Admin) | Creates product size.
- `PATCH /api/v1/sizes/admin/:id` | Protected (Admin) | Updates product size.
- `DELETE /api/v1/sizes/admin/:id` | Protected (Admin) | Deletes product size.

#### 11. Product Colours (`/api/v1/colours`) — 5 Endpoints
- `GET /api/v1/colours` | Public | Fetches active product color options.
- `GET /api/v1/colours/admin` | Protected (Admin) | Lists all product color options.
- `POST /api/v1/colours/admin` | Protected (Admin) | Creates product color option.
- `PATCH /api/v1/colours/admin/:id` | Protected (Admin) | Updates product color option.
- `DELETE /api/v1/colours/admin/:id` | Protected (Admin) | Deletes product color option.

#### 12. Promotional Coupons (`/api/v1/coupons`) — 5 Endpoints
- `GET /api/v1/coupons/validate` | Protected | Validates promo coupon for customer subtotal.
- `GET /api/v1/coupons/admin` | Protected (Admin) | Lists all promotional coupons.
- `POST /api/v1/coupons/admin` | Protected (Admin) | Creates promotional discount coupon.
- `PATCH /api/v1/coupons/admin/:id` | Protected (Admin) | Updates coupon parameters.
- `DELETE /api/v1/coupons/admin/:id` | Protected (Admin) | Deletes coupon code.

#### 13. Homepage Hero Banners (`/api/v1/banners`) — 5 Endpoints
- `GET /api/v1/banners` | Public | Fetches active homepage hero promo banners.
- `GET /api/v1/banners/admin` | Protected (Admin) | Lists all homepage hero banners.
- `POST /api/v1/banners/admin` | Protected (Admin) | Creates hero banner.
- `PATCH /api/v1/banners/admin/:id` | Protected (Admin) | Updates hero banner.
- `DELETE /api/v1/banners/admin/:id` | Protected (Admin) | Deletes hero banner.

#### 14. Wishlist (`/api/v1/wishlist`) — 3 Endpoints
- `GET /api/v1/wishlist` | Protected | Fetches customer's saved wishlist products.
- `POST /api/v1/wishlist` | Protected | Adds product to customer wishlist.
- `DELETE /api/v1/wishlist/:productId` | Protected | Removes product from customer wishlist.

#### 15. Support & Contact (`/api/v1/contact`) — 4 Endpoints
- `POST /api/v1/contact` | OptionalAuth | Submits customer support inquiry (rate-limited).
- `GET /api/v1/contact/admin` | Protected (Admin) | Lists all support messages.
- `PATCH /api/v1/contact/admin/:id/status` | Protected (Admin) | Updates support message status.
- `DELETE /api/v1/contact/admin/:id` | Protected (Admin) | Deletes support message.

#### 16. Customer Referrals (`/api/v1/referrals`) — 2 Endpoints
- `GET /api/v1/referrals/me` | Protected | Fetches customer's earned referral stats.
- `GET /api/v1/referrals/validate/:code` | Public | Validates referral code.

---

## 8. Cart and Order Logic
- **Server-Side Price Authority**: Prices are recalculated using database product records during order creation.
- **Stock Availability Check**: Verifies `variant.stock >= item.quantity` before order creation.
- **Atomic Stock Decrement**: Stock is decremented atomically (`$inc: -quantity`) using Mongoose array filters upon payment verification.
- **Order Snapshots**: Freezes shipping address, coupon details, and complete customization JSON into the order document.

---

## 9. Payment Flow (Razorpay)
1. **Initiation**: `POST /api/v1/orders` creates an `Order` document in `PENDING` payment status and calls `razorpay.orders.create()`.
2. **Checkout Modal**: Client presents Razorpay modal using the returned `razorpayOrderId`.
3. **Verification**: Client calls `POST /api/v1/orders/verify-payment` with `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
4. **HMAC Signature Check**: Server generates HMAC-SHA256 hash using `RAZORPAY_KEY_SECRET` and compares it against `razorpay_signature`.
5. **Fulfillment**: On match, order state updates to `PAID`, variant stock decrements atomically, and user cart is cleared.

---

## 10. Image Uploads
- Endpoint `POST /api/v1/uploads/image` uses Multer memory storage and streams buffers directly to Cloudinary.
- Strict MIME type filter (`image/png`, `image/jpeg`, `image/webp`) and 5MB size limit enforced. Rate limited to 50 requests per 15 minutes.

---

## 11. Security Controls
- **Helmet**: Sets secure HTTP response headers.
- **CORS**: Restricts origins to configured client URLs (`allowedOrigins`).
- **Rate Limiters**: Configured for Auth (`30/15min`), Uploads (`50/15min`), Support (`10/15min`).
- **Sanitization & Validation**: Schema validation and strict query parameters prevent injection.

---

## 12. Environment Variables
From `server/.env.example`:
- `PORT`: Server port (Default: `5000`).
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret key for signing JWT tokens.
- `CLIENT_URL`: Allowed frontend origin for CORS.
- `RAZORPAY_KEY_ID`: Razorpay API Key ID.
- `RAZORPAY_KEY_SECRET`: Razorpay Key Secret.
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID.

---

## 13. Local Development Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment template:
   ```bash
   cp .env.example .env
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
   Server listens at `http://localhost:5000`.

---

## 14. Production Deployment
- Configured for continuous deployment on **Render** (Node.js service environment).
- Production environment variables (`MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CLOUDINARY_URL`, `CLIENT_URL`) must be set in Render dashboard.
