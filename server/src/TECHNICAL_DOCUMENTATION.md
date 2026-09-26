# ANIVOM Technical Documentation

## 1. Project Objective
To deliver a responsive, production-ready e-commerce platform for customized T-shirts using the MERN stack with complete security, server-side validation, and payment processing.

## 2. Architecture & Technology Stack
- **Frontend**: React 19, Vite 8, SPA router, custom vanilla CSS design system.
- **Backend**: Node.js, Express.js, JWT in HTTP-Only cookies, Helmet, Rate Limiter.
- **Database**: MongoDB Atlas, Mongoose schemas with compound indexes.
- **Integrations**: Razorpay Payment Gateway, Cloudinary Image Storage, Google OAuth.

## 3. Security Architecture
- Password hashing with `bcryptjs`.
- JWT authentication tokens stored in `httpOnly`, `sameSite`, and `secure` HTTP cookies.
- Middleware protection: `protect` verifies JWT signature, `authorize('admin')` enforces Role-Based Access Control (RBAC).
- Rate Limiting: 30 requests per 15 min for auth endpoints, 50 requests per 15 min for image uploads, 10 requests per 15 min for contact form.
- Server-side validation: Prices, discounts, and inventory stock are re-calculated exclusively on the backend during order creation.
- Payment Verification: Razorpay payment signatures are validated using `crypto.createHmac('sha256')`. Stock is atomically decremented (`$inc: -quantity`) only after successful verification.

## 4. T-Shirt Customization Engine (Studio)
- Interactive canvas rendering multi-layer custom garments (Text, Predefined SVG Designs, Uploaded Images).
- Full positioning, scaling, color picking, and front/back view previewing.
- Saved customizations store complete JSON layer state linked to the user profile and product ID.
- Customizations are snapshot into orders upon checkout to preserve historical design accuracy regardless of future profile edits.

## 5. Deployment & Configuration
- **Client Deployment**: Configured for Vercel / Netlify static hosting.
- **Server Deployment**: Configured for Render Node instance with environment variable bindings for `MONGODB_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CLOUDINARY_URL`, and `CLIENT_URL`.
