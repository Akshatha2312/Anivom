# ANIVOM REST API Documentation

## 1. API Overview

The **ANIVOM REST API** is a production-ready Node.js & Express 5 backend web service providing business logic, data persistence, payment processing, media uploads, security enforcement, and administrative capabilities for the ANIVOM customized T-shirt platform.

- **Backend Technology Stack**: Node.js (v20+), Express.js (^5.2.1), Mongoose (^9.10.1) & MongoDB Atlas.
- **Base API URL**: `/api/v1`
- **API Version**: `v1`
- **Authentication Approach**: JSON Web Tokens (JWT) are set in an HTTP-only cookie named `token`; clients send it with `credentials: 'include'`. The cookie always uses `httpOnly: true` and `path: '/'`. In production it uses `secure: true` and `sameSite: 'none'`; locally it uses `secure: false` and `sameSite: 'lax'`. The `protect` middleware also accepts a Bearer token. Administrative endpoints additionally use `authorize('admin')`.

---

## 2. Live API Information

- **Production API Base**: https://anivom.onrender.com/api/v1
- **API Health Check**: `GET https://anivom.onrender.com/api/v1/health`
- **Interactive OpenAPI 3.0 / Swagger UI**: https://anivom.onrender.com/api-docs

---

## 3. Authentication & Authorization

- **Public Endpoints**: Accessible by any client without authentication (e.g., browsing active catalog items, category lookups, active banners, active vector designs, user registration, and credential/OAuth login).
- **Protected Endpoints (Customer)**: Require an existing authenticated user and a valid JWT from the `token` cookie or an `Authorization: Bearer` header (`protect` middleware). The backend enforces document ownership (`document.user === req.user._id`) for sensitive resources including user cart, saved addresses, customized canvas layers, wishlist, and order histories.
- **Protected Admin Endpoints**: Require both valid user authentication (`protect`) and an administrative role check (`authorize('admin')`). Non-admin attempts return HTTP `403 Forbidden`.

---

## 4. Endpoints Registry (Exactly 83 Total Endpoints)

### Health Check (1 Endpoint)

#### `GET /api/v1/health`
- **Authentication**: None (Public)
- **Purpose**: System health status check.
- **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "ANIVOM API is running"
  }
  ```

---

### 1. Authentication (`/api/v1/auth`) — 6 Endpoints

#### `POST /api/v1/auth/register`
- **Authentication**: None (Public)
- **Purpose**: Registers a new customer account and generates a unique customer referral code.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecretPassword123"
  }
  ```
- **Success Response (201 Created)**: Sets the HTTP-only `token` cookie. The JSON response contains user data and no JWT.
  ```json
  {
    "status": "success",
    "message": "Customer registered successfully",
    "data": {
      "user": {
        "_id": "651a...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "customer",
        "referralCode": "ANIVOM8F2A1234",
        "createdAt": "2026-09-30T12:00:00.000Z"
      }
    }
  }
  ```

#### `POST /api/v1/auth/login`
- **Authentication**: None (Public)
- **Purpose**: Authenticates customer or admin credentials and sets a signed JWT in the HTTP-only `token` cookie. The JWT is not returned in the JSON response body.
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "SecretPassword123"
  }
  ```
- **Success Response (200 OK)**: Sets the HTTP-only `token` cookie; JSON contains user data only.
  ```json
  {
    "status": "success",
    "message": "Customer logged in successfully",
    "data": {
      "user": {
        "_id": "651a...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "customer",
        "referralCode": "ANIVOM8F2A1234",
        "createdAt": "2026-09-30T12:00:00.000Z"
      }
    }
  }
  ```

#### `POST /api/v1/auth/google`
- **Authentication**: None (Public)
- **Purpose**: Authenticates or registers users via a Google OAuth credential token.
- **Request Body**: `{ "credential": "GOOGLE_ID_TOKEN" }`
- **Success Response (200 OK)**: Returns the authenticated user profile and sets the HTTP-only `token` cookie; the JWT is not included in the JSON body.

#### `POST /api/v1/auth/logout`
- **Authentication**: None (Public)
- **Purpose**: Clears the authentication HTTP-Only cookie.
- **Success Response (200 OK)**: `{ "status": "success", "message": "Logged out successfully" }`

#### `GET /api/v1/auth/me`
- **Authentication**: Protected (JWT)
- **Purpose**: Fetches the profile object of the currently logged-in user.
- **Success Response (200 OK)**: `{ "status": "success", "data": { "user": { ... } } }`

#### `GET /api/v1/auth/users/admin`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Fetches all registered customer user profiles for admin directory management.

---

### 2. Products (`/api/v1/products`) — 8 Endpoints

#### `GET /api/v1/products`
- **Authentication**: None (Public)
- **Purpose**: Fetches active product listing with search, category, size, colour, price filters, and pagination.
- **Query Parameters**: `search`, `category` (category value/name), `size`, `colour`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`
- **Success Response (200 OK)**: List of product documents and pagination metadata.

#### `GET /api/v1/products/:id`
- **Authentication**: None (Public)
- **Purpose**: Fetches a single active product document by ID with variant stock and garment mockups.

#### `POST /api/v1/products/admin`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Creates a new product catalog item with multi-view garment images and variant stock.

#### `GET /api/v1/products/admin`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Fetches all catalog products (including inactive items).

#### `GET /api/v1/products/admin/:id`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Fetches full product details for admin editor view.

#### `PATCH /api/v1/products/admin/:id`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Updates product catalog fields and variant details.

#### `PATCH /api/v1/products/admin/:id/status`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Toggles product active/inactive visibility (`isActive`).

#### `PATCH /api/v1/products/admin/:id/variants/:variantId/stock`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Updates stock counter directly for a specific size/colour variant.

---

### 3. T-Shirt Customizations (`/api/v1/customizations`) — 5 Endpoints

#### `POST /api/v1/customizations`
- **Authentication**: Protected (JWT)
- **Purpose**: Saves or updates a T-shirt canvas customization configuration (text layers, vector artwork, image uploads, scale, rotation, view orientation).
- **Request Body**: `product`, `size`, `colour`, `layers`, `status`
- **Success Response (201 Created / 200 OK)**: Customization configuration document.

#### `GET /api/v1/customizations`
- **Authentication**: Protected (JWT)
- **Purpose**: Lists all saved customizations owned by the authenticated user.

#### `GET /api/v1/customizations/:id`
- **Authentication**: Protected (JWT)
- **Purpose**: Fetches a specific customization configuration by ID (ownership enforced).

#### `PATCH /api/v1/customizations/:id`
- **Authentication**: Protected (JWT)
- **Purpose**: Updates an existing customization's canvas layer JSON or variant settings.

#### `DELETE /api/v1/customizations/:id`
- **Authentication**: Protected (JWT)
- **Purpose**: Deletes a saved customization owned by the current user.

---

### 4. Shopping Cart (`/api/v1/cart`) — 6 Endpoints

#### `GET /api/v1/cart`
- **Authentication**: Protected (JWT)
- **Purpose**: Fetches active items in the authenticated user's shopping bag.

#### `POST /api/v1/cart`
- **Authentication**: Protected (JWT)
- **Purpose**: Adds a standard product variant or customized garment item to cart after verifying variant stock availability.
- **Request Body**: `product`, `size`, `colour`, `quantity`, `customized`, `customization` (when customized)

#### `PATCH /api/v1/cart/:itemId`
- **Authentication**: Protected (JWT)
- **Purpose**: Updates item quantity in user cart.

#### `DELETE /api/v1/cart/:itemId`
- **Authentication**: Protected (JWT)
- **Purpose**: Removes a specific line item from cart.

#### `DELETE /api/v1/cart`
- **Authentication**: Protected (JWT)
- **Purpose**: Clears all items from user cart.

#### `POST /api/v1/cart/checkout-summary`
- **Authentication**: Protected (JWT)
- **Purpose**: Recalculates cart subtotals server-side and validates applied coupon discount code.

---

### 5. Delivery Addresses (`/api/v1/addresses`) — 5 Endpoints

#### `GET /api/v1/addresses`
- **Authentication**: Protected (JWT)
- **Purpose**: Fetches saved delivery address book entries for current user.

#### `POST /api/v1/addresses`
- **Authentication**: Protected (JWT)
- **Purpose**: Adds a new delivery address entry.

#### `PATCH /api/v1/addresses/:id`
- **Authentication**: Protected (JWT)
- **Purpose**: Updates an existing address record.

#### `DELETE /api/v1/addresses/:id`
- **Authentication**: Protected (JWT)
- **Purpose**: Deletes a delivery address record.

#### `PATCH /api/v1/addresses/:id/default`
- **Authentication**: Protected (JWT)
- **Purpose**: Sets a specific address as the primary default delivery address.

---

### 6. Orders & Payments (`/api/v1/orders`) — 12 Endpoints

#### `POST /api/v1/orders`
- **Authentication**: Protected (JWT)
- **Purpose**: Server recalculates the total, creates an Order with `paymentStatus: PENDING` and `orderStatus: PLACED`, freezes customization snapshots, and initializes a Razorpay payment order.
- **Request Body**: Required `addressId`; optional `couponCode`; optional `buyNowItem` for Buy Now instead of cart checkout. `buyNowItem` contains `productId`, `size`, `colour`, `quantity`, `customized`, and optional `customizationId`.
- **Success Response (201 Created)**: `data.order` is the created Order document. `data.razorpayOrder` contains the gateway checkout values:
  ```json
  {
    "success": true,
    "message": "Order created successfully.",
    "data": {
      "order": {
        "_id": "651a...",
        "paymentStatus": "PENDING",
        "orderStatus": "PLACED",
        "razorpayOrderId": "order_9A33XABC"
      },
      "razorpayOrder": {
        "id": "order_9A33XABC",
        "amount": 120000,
        "currency": "INR",
        "key": "rzp_test_..."
      }
    }
  }
  ```

#### `POST /api/v1/orders/verify-payment`
- **Authentication**: Protected (JWT)
- **Purpose**: Verifies the Razorpay HMAC-SHA256 signature. On success, sets `paymentStatus: PAID` and `orderStatus: CONFIRMED`, atomically decrements variant stock (`$inc: -quantity`), and clears the user cart for cart-based checkout.
- **Request Body**: All four fields are required: `orderId`, `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.

#### `GET /api/v1/orders`
- **Authentication**: Protected (JWT)
- **Purpose**: Fetches order history for current user.

#### `GET /api/v1/orders/:id`
- **Authentication**: Protected (JWT)
- **Purpose**: Fetches detailed view of a specific customer order.

#### `PATCH /api/v1/orders/:id/cancel`
- **Authentication**: Protected (JWT)
- **Purpose**: Cancels an unfulfilled order and automatically restores variant stock.

#### `PATCH /api/v1/orders/:id/return`
- **Authentication**: Protected (JWT)
- **Purpose**: Requests a return for a delivered order.

#### `GET /api/v1/orders/admin/stats`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Aggregates revenue totals, active order counts, customer stats, and recent orders for admin dashboard.

#### `GET /api/v1/orders/admin`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Lists all customer orders with filtering by order status.

#### `GET /api/v1/orders/admin/:id`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Fetches full admin dossier view of any customer order.

#### `PATCH /api/v1/orders/admin/:id/status`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Accepts target statuses `PLACED`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, and `FAILED`, subject to the current order's allowed transitions. Transitions are `PLACED` → `CONFIRMED`, `CANCELLED`, or `FAILED`; `CONFIRMED` → `PROCESSING`, `SHIPPED`, or `CANCELLED`; `PROCESSING` → `SHIPPED` or `CANCELLED`; and `SHIPPED` → `DELIVERED`. Delivered, cancelled, failed, and return-status orders cannot be updated through this endpoint.

#### `PATCH /api/v1/orders/admin/:id/return`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Approves or rejects customer return request.

#### `PATCH /api/v1/orders/admin/:id/refund`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Processes Razorpay API refund or manual refund record marking.

---

### 7. Image Uploads (`/api/v1/uploads`) — 1 Endpoint

#### `POST /api/v1/uploads/image`
- **Authentication**: Protected (JWT)
- **Rate Limit**: 50 requests per 15 minutes
- **Purpose**: Multer memory storage parses multipart image file (PNG/JPG/WEBP <= 5MB) and streams buffer to Cloudinary bucket.
- **Success Response (200 OK)**: Returns Cloudinary HTTPS URL and public asset ID.

---

### 8. Vector Design Library (`/api/v1/designs`) — 5 Endpoints

#### `GET /api/v1/designs`
- **Authentication**: None (Public)
- **Purpose**: Fetches active SVG vector design templates for the Studio customizer.

#### `GET /api/v1/designs/admin`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Lists all vector design templates in admin library.

#### `POST /api/v1/designs/admin`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Uploads a new SVG vector design template.

#### `PATCH /api/v1/designs/admin/:id`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Updates design template details or active state.

#### `DELETE /api/v1/designs/admin/:id`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Removes design template from vector library.

---

### 9. Product Categories (`/api/v1/categories`) — 5 Endpoints

- `GET /api/v1/categories` | Public | Fetches active product categories.
- `GET /api/v1/categories/admin` | Protected (Admin) | Lists all categories.
- `POST /api/v1/categories/admin` | Protected (Admin) | Creates new category.
- `PATCH /api/v1/categories/admin/:id` | Protected (Admin) | Updates category.
- `DELETE /api/v1/categories/admin/:id` | Protected (Admin) | Deletes category.

---

### 10. Product Sizes (`/api/v1/sizes`) — 5 Endpoints

- `GET /api/v1/sizes` | Public | Fetches active sizing options.
- `GET /api/v1/sizes/admin` | Protected (Admin) | Lists all size options.
- `POST /api/v1/sizes/admin` | Protected (Admin) | Creates size option.
- `PATCH /api/v1/sizes/admin/:id` | Protected (Admin) | Updates size option.
- `DELETE /api/v1/sizes/admin/:id` | Protected (Admin) | Deletes size option.

---

### 11. Product Colours (`/api/v1/colours`) — 5 Endpoints

- `GET /api/v1/colours` | Public | Fetches active colour palette options.
- `GET /api/v1/colours/admin` | Protected (Admin) | Lists all colour palette options.
- `POST /api/v1/colours/admin` | Protected (Admin) | Creates colour option.
- `PATCH /api/v1/colours/admin/:id` | Protected (Admin) | Updates colour option.
- `DELETE /api/v1/colours/admin/:id` | Protected (Admin) | Deletes colour option.

---

### 12. Promotional Coupons (`/api/v1/coupons`) — 5 Endpoints

#### `GET /api/v1/coupons/validate`
- **Authentication**: Protected (JWT)
- **Purpose**: Validates promotional coupon code for customer cart subtotal.

- `GET /api/v1/coupons/admin` | Protected (Admin) | Lists all coupons.
- `POST /api/v1/coupons/admin` | Protected (Admin) | Creates promotional discount coupon.
- `PATCH /api/v1/coupons/admin/:id` | Protected (Admin) | Updates coupon parameters.
- `DELETE /api/v1/coupons/admin/:id` | Protected (Admin) | Deletes coupon code.

---

### 13. Homepage Hero Banners (`/api/v1/banners`) — 5 Endpoints

- `GET /api/v1/banners` | Public | Fetches active homepage hero promo banners.
- `GET /api/v1/banners/admin` | Protected (Admin) | Lists all hero banners.
- `POST /api/v1/banners/admin` | Protected (Admin) | Creates hero banner.
- `PATCH /api/v1/banners/admin/:id` | Protected (Admin) | Updates hero banner.
- `DELETE /api/v1/banners/admin/:id` | Protected (Admin) | Deletes hero banner.

---

### 14. Wishlist (`/api/v1/wishlist`) — 3 Endpoints

- `GET /api/v1/wishlist` | Protected | Fetches customer's saved wishlist products.
- `POST /api/v1/wishlist` | Protected | Adds product to customer wishlist.
- `DELETE /api/v1/wishlist/:productId` | Protected | Removes product from wishlist.

---

### 15. Support & Contact (`/api/v1/contact`) — 4 Endpoints

- `POST /api/v1/contact` | Public / OptionalAuth | Submits customer support inquiry (rate limited: 10/15min).
- `GET /api/v1/contact/admin` | Protected (Admin) | Lists all customer support messages.
- `PATCH /api/v1/contact/admin/:id/status` | Protected (Admin) | Updates support message status.
- `DELETE /api/v1/contact/admin/:id` | Protected (Admin) | Deletes support message.

---

### 16. Customer Referrals (`/api/v1/referrals`) — 2 Endpoints

- `GET /api/v1/referrals/me` | Protected | Fetches customer's earned referral statistics.
- `GET /api/v1/referrals/validate/:code` | Public | Validates referral code string.

---

## 5. Error Response Architecture

Response envelopes depend on the handler. Validation and authorization failures returned directly by controllers commonly use `{ "status": "fail", "message": "..." }` or `{ "success": false, "message": "..." }`. Exceptions forwarded with `next(error)` are handled by the centralized Express error middleware (`errorMiddleware.js`) and use `{ "status": "error", "message": "..." }`.

### Example Error Payloads

#### Controller-handled 400 Bad Request
```json
{
  "status": "fail",
  "message": "Invalid product ID"
}
```

Some controllers use a `success: false` envelope:
```json
{
  "success": false,
  "message": "Invalid or expired coupon code."
}
```

#### Middleware-handled exception
```json
{
  "status": "error",
  "message": "Detailed error message explanation"
}
```

---

## 6. HTTP Status Code Guidance

The ANIVOM API strictly uses standard HTTP response status codes:
- **`200 OK`**: Successful query, record update, or action.
- **`201 Created`**: Successful document creation (e.g., account registration, order placement).
- **`400 Bad Request`**: Validation failure, missing parameters, out-of-stock items, or invalid state transition.
- **`401 Unauthorized`**: Authentication missing or expired JWT cookie token.
- **`403 Forbidden`**: Role authorization failure (e.g., customer attempting admin route).
- **`404 Not Found`**: Document ID or route not found.
- **`429 Too Many Requests`**: Rate limit exceeded for sensitive routes (Auth, Uploads, Contact).
- **`500 Internal Server Error`**: Unhandled exception (sanitized in production environments).

---

## 7. Payment API Flow (Razorpay Integration)

The backend handles online payment processing through a server-verified 5-step sequence:

```
[ Customer Client ]                     [ Express Backend ]                   [ Razorpay Gateway ]
         │                                       │                                     │
         ├── 1. POST /api/v1/orders ───────────► │                                     │
         │                                       ├── Validate Cart & Stock             │
         │                                       ├── Recalculate Total                 │
         │                                       ├── Create Order (PENDING)            │
         │                                       ├── Create Razorpay Order ──────────► │
         │ ◄── 2. Return data.order + data.razorpayOrder ─┤ ◄── Return razorpay_order_id ─┘
         │                                       │
         ├── 3. Customer Completes Checkout ──────────────────────────────────────────► │
         │ ◄── 4. Return Payment Signature ───────────────────────────────────────────┘
         │                                       │
         ├── 5. POST /api/v1/orders/verify-payment ─────► │
         │    (orderId, razorpay_order_id,        │
         │     razorpay_payment_id,               ├── Verify HMAC-SHA256 Signature
         │     razorpay_signature)                │
         │                                       ├── Set paymentStatus=PAID, orderStatus=CONFIRMED
         │                                       ├── Atomically Decrement Stock ($inc)
         │                                       └── Clear Customer Cart
         │ ◄── 6. Order Verified (paymentStatus=PAID, orderStatus=CONFIRMED) ──┤
```

---

## 8. Security Controls

- **Security Headers**: `helmet()` enabled to enforce security headers across API responses.
- **HTTP-Only Cookies**: JWTs are transmitted in `httpOnly`, `sameSite`, `secure` cookies to protect tokens against XSS.
- **Rate Limiting**: `express-rate-limit` guards against brute-force attacks on Auth (30 req/15min), Image Uploads (50 req/15min), and Support Submission (10 req/15min).
- **HMAC Signature Verification**: Payment notifications are accepted ONLY after calculating `crypto.createHmac('sha256')` with backend secret keys.

---

## 9. Testing & API Verification

The REST API implementation was verified through automated runtime checks:
- **Server Initialization Check**: Verified clean Express application loading (`require('./src/app')`).
- **Health Check**: Verified `GET /api/v1/health` status response (`{ status: 'success', message: 'ANIVOM API is running' }`).
- **Swagger Documentation UI**: Verified active OpenAPI 3 specification mounting at `/api-docs`.
- **End-to-End QA Testing**: Executed comprehensive automated browser testing against all customer and admin API endpoints, verifying authentication, catalog search, studio layer persistence, address management, coupon validation, Razorpay modal initialization, and order status transitions.

---

## 10. Environment Variable Configuration

The backend service relies on environment configuration variables. *Do not commit secret values to source control.*

```bash
PORT                     # Server listening port (Default: 5000)
NODE_ENV                 # Environment mode ('development' | 'production')
MONGODB_URI              # MongoDB Atlas cluster connection string
JWT_SECRET               # Secret key for JWT signature hashing
CLIENT_URL               # Frontend production origin for CORS policy
RAZORPAY_KEY_ID          # Razorpay merchant Key ID
RAZORPAY_KEY_SECRET      # Razorpay merchant secret key
CLOUDINARY_URL           # Cloudinary API bucket configuration string
GOOGLE_CLIENT_ID         # Google OAuth Client ID
```
