# ANIVOM — Customer Frontend

The customer-facing React 19 single-page application for **ANIVOM**, a customized T-shirt e-commerce brand. This application enables customers to browse T-shirts, customize designs in an interactive canvas studio, manage personal shopping bags, complete secure payments via Razorpay, and track order statuses in real time.

---

## 1. Project Overview
The customer frontend provides an intuitive e-commerce interface paired with an interactive customization studio (**ANIVOM Studio**). Customers can explore catalog items, apply filters, customize garments with typography and vector designs, upload custom artwork, and manage account details including addresses, orders, wishlists, and referral rewards.

---

## 2. Main Features
- **User Authentication**: Account registration, credential login, Google OAuth integration, and session management via HTTP-Only cookies.
- **Product Catalog**: Multi-criteria filtering (Category, Size, Colour, Price Range Slider), search keyword debouncing, and sorting options.
- **Product Details**: High-resolution garment view mockups, variant selection, and live stock checking.
- **ANIVOM Studio**: Multi-layer canvas editor with text formatting, predefined vector design templates, image uploads, scale, rotation, and multi-view garment previews (Front, Back, Left, Right).
- **Shopping Bag & Checkout**: Server-validated cart items, coupon validation, delivery address management, and server-recalculated totals.
- **Razorpay Online Payment**: Checkout modal integration with server-side HMAC-SHA256 signature verification.
- **Order Tracking & Returns**: Live order progress timeline (`PLACED` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`), order cancellations, and return requests.
- **Profile, Wishlist & Referrals**: Personal address book, wishlist management, and customer referral code sharing.

---

## 3. Customer Journey
1. **Explore**: Customer browses products on the Home or Catalog page using category tabs, size tags, color swatches, or price sliders.
2. **Select & Customize**: Customer selects sizing/color and launches ANIVOM Studio to add custom typography, vector graphics, or uploaded images.
3. **Bag & Checkout**: Customer sends customized garment to Bag, enters delivery address, applies discount coupon, and proceeds to checkout.
4. **Payment & Verification**: Razorpay checkout processes payment; backend verifies HMAC signature, decrements variant stock, and clears bag.
5. **Order Tracking**: Customer monitors real-time status updates from the user account dashboard.

---

## 4. ANIVOM Studio
ANIVOM Studio (`Studio.jsx`) is the core customization engine:
- **Base Selection**: Choose garment style (Standard Crew Neck, Slim Fit, Oversized, Cropped, Polo, Sleeveless, V-Neck).
- **Color & Sizing**: Select garment color (mockup background updates dynamically) and size (XS-XXXL).
- **Multi-View Previews**: Toggle between **Front**, **Back**, **Left**, and **Right** garment views. Fallback modals advise if specific side views are unavailable for a particular garment.
- **Text Layers**: Add customizable text with font family, size, color, and alignment options.
- **Predefined Designs**: Select SVG artwork templates from the vector design library.
- **Uploaded Images**: Upload custom graphics (PNG/JPG/WEBP <= 5MB) via Cloudinary.
- **Transformations**: Drag-to-position, scale (0.5x to 3x), and rotate (-180° to 180°).
- **State Preservation**: Customization JSON layer state is attached to cart items and snapshotted into order records upon checkout.

---

## 5. Product Browsing
- **Catalog Filtering**: Instant multi-criteria filtering by category, size, color, and price range.
- **Search & Sort**: Debounced keyword search across names and descriptions, with sorting by price or creation date.
- **Performance Optimizations**: Module-level caching for categories/sizes/colors and image priority hint decoding (`fetchPriority="high"` on hero images).

---

## 6. Cart and Checkout
- **Server Validation**: Bag items reference `Product` and `Customization` models. Final subtotals, coupon discounts, and stock availability are recalculated server-side.
- **Delivery Address**: Add, edit, or set default delivery addresses.
- **Payment Verification**: Checkout integrates Razorpay payment modal; order state advances to `PAID` only after backend signature verification.

---

## 7. Authentication
- Supports traditional email/password registration and login alongside Google OAuth 2.0 (`@react-oauth/google` / Google Identity Services).
- Session tokens are stored in `httpOnly`, `sameSite`, and `secure` HTTP cookies for protection against XSS.

---

## 8. Wishlist and Referrals
- **Wishlist**: Save favorite products to account wishlist for quick access.
- **Referrals**: Every customer receives a unique auto-generated referral code (`ANIVOM...`) to share for rewards.

---

## 9. Orders and Tracking
- **Order History**: View past orders with item snapshots, shipping addresses, and payment IDs.
- **Live Status Timeline**: Visual progress tracking (`PLACED`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`).
- **Cancellations & Returns**: Cancel pending orders or request returns for delivered orders.

---

## 10. Frontend Architecture
- **Framework**: React 19 single-page application built with Vite 8.
- **Routing**: Lightweight client-side view state router (`view`, `viewParams`) offering instant view switching.
- **Design System**: Vanilla CSS with global design tokens, fashion-editorial layouts, subtle micro-interactions, and responsive media queries.

---

## 11. Technology Stack
From `client/package.json`:
- **Dependencies**:
  - `react`: `^19.2.8`
  - `react-dom`: `^19.2.8`
- **DevDependencies**:
  - `vite`: `^8.3.0`
  - `@vitejs/plugin-react`: `^6.1.1`
  - `oxlint`: `^1.81.0`
  - `@types/react`: `^19.2.18`
  - `@types/react-dom`: `^19.2.7`

---

## 12. Project Structure
```
client/
├── src/
│   ├── main.jsx                 # Client entry point
│   ├── App.jsx                  # Main application component & state router
│   ├── App.css                  # Global styles & navigation design
│   ├── Catalog.jsx              # Product catalog & filtering component
│   ├── ProductDetails.jsx       # Single product details & variant selector
│   ├── Studio.jsx               # T-Shirt customizer canvas component
│   ├── Cart.jsx                 # Shopping bag component
│   ├── Checkout.jsx             # Address selection & Razorpay checkout
│   ├── Orders.jsx               # Order history & status tracking
│   ├── Account.jsx              # Profile & address book manager
│   ├── AuthModal.jsx            # Auth modal (login, register, Google OAuth)
│   ├── Wishlist.jsx             # Saved wishlist products
│   ├── Referrals.jsx            # Customer referral rewards component
│   ├── Contact.jsx              # Customer support contact form
│   ├── config.js                # API base URL configuration
│   └── index.css                # CSS variables & typography tokens
├── index.html                   # HTML template
├── package.json                 # Frontend dependencies & scripts
├── .env.example                 # Environment variable template
└── vite.config.js               # Vite build configuration
```

---

## 13. Environment Variables
From `client/.env.example`:
- `VITE_API_URL`: Backend API base URL (Default: `http://localhost:5000`).
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID for customer sign-in.

---

## 14. Local Development Setup
1. Navigate into the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Access application at `http://localhost:5173`.

---

## 15. Available Scripts
From `client/package.json`:
- `npm run dev`: Starts local Vite development server.
- `npm run build`: Compiles production static assets to `dist/`.
- `npm run lint`: Executes static code analysis via Oxlint.
- `npm run preview`: Previews the compiled production build locally.

---

## 16. API Integration
The client communicates with the Express backend using `fetch` with `credentials: 'include'` for cross-origin cookie authorization. API calls reference `API_BASE_URL` imported from `src/config.js`.

---

## 17. Production Build
Build the application for production:
```bash
npm run build
```
Generates optimized HTML, CSS, and JS chunks in the `dist/` directory.

---

## 18. Deployment
- **Customer Frontend Production URL**: `https://anivom.vercel.app/`
- Configured for static SPA deployment on Vercel. SPA routing rewrites point to `index.html`.

---

## 19. Important Notes
- Final order prices and stock levels are enforced strictly by the backend server.
- Image uploads in Studio are rate-limited and filtered by file type (PNG/JPG/WEBP <= 5MB).
