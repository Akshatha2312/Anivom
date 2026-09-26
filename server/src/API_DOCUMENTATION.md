# ANIVOM REST API Documentation

Base URL: `/api/v1`

---

## 1. Authentication (`/api/v1/auth`)

### `POST /api/v1/auth/register`
- **Authentication**: None (Public)
- **Role Requirement**: None
- **Purpose**: Registers a new customer account.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecretPassword123"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "message": "Customer account registered successfully.",
    "token": "eyJhbGciOi...",
    "data": {
      "user": {
        "_id": "651a...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "customer",
        "referralCode": "ANIVOM8F2A"
      }
    }
  }
  ```
- **Error Responses**: 400 Bad Request (Missing required fields, duplicate email).

### `POST /api/v1/auth/login`
- **Authentication**: None (Public)
- **Role Requirement**: None
- **Purpose**: Authenticates customer or admin credentials and issues JWT token in HTTP-Only cookie and JSON body.
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "SecretPassword123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Log in successful.",
    "token": "eyJhbGciOi...",
    "data": {
      "user": {
        "_id": "651a...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "customer"
      }
    }
  }
  ```
- **Error Responses**: 401 Unauthorized (Invalid email or password).

### `POST /api/v1/auth/google`
- **Authentication**: None (Public)
- **Role Requirement**: None
- **Purpose**: Authenticates or registers users via Google OAuth credential token.
- **Request Body**: `{ "credential": "GOOGLE_ID_TOKEN" }`
- **Success Response (200 OK / 201 Created)**: Returns user profile and sets JWT cookie.

### `POST /api/v1/auth/logout`
- **Authentication**: None
- **Role Requirement**: None
- **Purpose**: Clears the authentication HTTP-Only cookie.
- **Success Response (200 OK)**: `{ "status": "success", "message": "Logged out successfully" }`

### `GET /api/v1/auth/me`
- **Authentication**: Protected (JWT)
- **Role Requirement**: None
- **Purpose**: Fetches profile of currently logged-in user.
- **Success Response (200 OK)**: User profile object.

---

## 2. Products (`/api/v1/products`)

### `GET /api/v1/products`
- **Authentication**: None (Public)
- **Purpose**: Fetches active product listing with search, category, size, colour, price filters, and pagination.
- **Query Parameters**: `search`, `category`, `size`, `colour`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`
- **Success Response (200 OK)**: List of products and pagination metadata.

### `GET /api/v1/products/:id`
- **Authentication**: None (Public)
- **Purpose**: Fetches a single active product by ID.
- **Success Response (200 OK)**: Product object with variants and garment image views.

### `POST /api/v1/products/admin`
- **Authentication**: Protected (JWT)
- **Role Requirement**: Admin
- **Purpose**: Creates a new product catalog item.

### `GET /api/v1/products/admin`
- **Authentication**: Protected (JWT)
- **Role Requirement**: Admin
- **Purpose**: Fetches all catalog products (including inactive items).

### `GET /api/v1/products/admin/:id`
- **Authentication**: Protected (JWT)
- **Role Requirement**: Admin
- **Purpose**: Fetches full product details for admin editor.

### `PATCH /api/v1/products/admin/:id`
- **Authentication**: Protected (JWT)
- **Role Requirement**: Admin
- **Purpose**: Updates product fields.

### `PATCH /api/v1/products/admin/:id/status`
- **Authentication**: Protected (JWT)
- **Role Requirement**: Admin
- **Purpose**: Toggles product active/inactive status.

### `PATCH /api/v1/products/admin/:id/variants/:variantId/stock`
- **Authentication**: Protected (JWT)
- **Role Requirement**: Admin
- **Purpose**: Direct stock update for a specific size/colour variant.

---

## 3. T-Shirt Customizations (`/api/v1/customizations`)

### `POST /api/v1/customizations`
- **Authentication**: Protected (JWT)
- **Purpose**: Saves or updates a T-shirt customization configuration (text layers, design layers, positions, scale, view).
- **Request Body**: `productId`, `size`, `colour`, `layers`, `status`
- **Success Response (201 Created / 200 OK)**: Customization object.

### `GET /api/v1/customizations`
- **Authentication**: Protected (JWT)
- **Purpose**: Fetches all saved customizations owned by the current user.

### `GET /api/v1/customizations/:id`
- **Authentication**: Protected (JWT)
- **Purpose**: Fetches a single customization configuration by ID (ownership enforced).

### `PATCH /api/v1/customizations/:id`
- **Authentication**: Protected (JWT)
- **Purpose**: Updates customization layers or options.

### `DELETE /api/v1/customizations/:id`
- **Authentication**: Protected (JWT)
- **Purpose**: Deletes a saved customization owned by the current user.

---

## 4. Shopping Cart (`/api/v1/cart`)

### `GET /api/v1/cart`
- **Authentication**: Protected (JWT)
- **Purpose**: Fetches items in the user's active shopping cart.

### `POST /api/v1/cart`
- **Authentication**: Protected (JWT)
- **Purpose**: Adds a product or customized item to cart with stock validation.
- **Request Body**: `productId`, `size`, `colour`, `quantity`, `customized`, `customizationId`

### `PATCH /api/v1/cart/:itemId`
- **Authentication**: Protected (JWT)
- **Purpose**: Updates item quantity in cart.

### `DELETE /api/v1/cart/:itemId`
- **Authentication**: Protected (JWT)
- **Purpose**: Removes a specific item from cart.

### `DELETE /api/v1/cart`
- **Authentication**: Protected (JWT)
- **Purpose**: Clears all items from user cart.

### `POST /api/v1/cart/checkout-summary`
- **Authentication**: Protected (JWT)
- **Purpose**: Validates cart contents, recalculates prices server-side, and validates applied coupon.

---

## 5. Delivery Addresses (`/api/v1/addresses`)

### `GET /api/v1/addresses`
- **Authentication**: Protected (JWT)
- **Purpose**: Fetches user's saved delivery addresses.

### `POST /api/v1/addresses`
- **Authentication**: Protected (JWT)
- **Purpose**: Adds a new delivery address.

### `PATCH /api/v1/addresses/:id`
- **Authentication**: Protected (JWT)
- **Purpose**: Updates an address.

### `DELETE /api/v1/addresses/:id`
- **Authentication**: Protected (JWT)
- **Purpose**: Deletes an address.

### `PATCH /api/v1/addresses/:id/default`
- **Authentication**: Protected (JWT)
- **Purpose**: Sets address as primary default.

---

## 6. Orders & Payments (`/api/v1/orders`)

### `POST /api/v1/orders`
- **Authentication**: Protected (JWT)
- **Purpose**: Validates cart, stock, address, coupon, creates Order record, and initializes Razorpay payment order.
- **Request Body**: `{ "addressId": "651a...", "couponCode": "WELCOME10" }`

### `POST /api/v1/orders/verify-payment`
- **Authentication**: Protected (JWT)
- **Purpose**: Performs HMAC-SHA256 signature verification for Razorpay payment, updates order to `PAID`, atomically decrements variant stock, and clears user cart.

### `GET /api/v1/orders`
- **Authentication**: Protected (JWT)
- **Purpose**: Fetches order history for current user.

### `GET /api/v1/orders/:id`
- **Authentication**: Protected (JWT)
- **Purpose**: Fetches specific order details for customer.

### `PATCH /api/v1/orders/:id/cancel`
- **Authentication**: Protected (JWT)
- **Purpose**: Cancels an unfulfilled order and restores variant stock.

### `PATCH /api/v1/orders/:id/return`
- **Authentication**: Protected (JWT)
- **Purpose**: Customer requests a return for a delivered order.

---

## 7. Image Uploads (`/api/v1/uploads`)

### `POST /api/v1/uploads/image`
- **Authentication**: Protected (JWT)
- **Rate Limit**: 50 uploads per 15 min
- **Purpose**: Validates file type (PNG/JPG/WEBP) and file size (<= 5MB) and uploads file to Cloudinary.
- **Success Response (200 OK)**: Returns Cloudinary HTTPS URL and public ID.

---

## 8. Admin Management Routes

### `GET /api/v1/orders/admin/stats`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Aggregates sales metrics, revenue, order count summary, and recent order activity.

### `GET /api/v1/orders/admin`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Lists all customer orders with filtering by order status.

### `GET /api/v1/orders/admin/:id`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Fetches detailed view of any order.

### `PATCH /api/v1/orders/admin/:id/status`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Updates order status (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).

### `PATCH /api/v1/orders/admin/:id/return`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Approves or rejects customer return request.

### `PATCH /api/v1/orders/admin/:id/refund`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Initiates Razorpay refund or manual refund marking.

### `GET /api/v1/auth/users/admin`
- **Authentication**: Protected (JWT) | **Role**: Admin
- **Purpose**: Fetches all registered customer profiles.

### Categories, Sizes, Colours, Designs, Coupons, Banners
- `GET/POST/PATCH/DELETE` endpoints under `/admin` routes for all master data entities protected by JWT authentication and admin role check middleware.
