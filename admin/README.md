# ANIVOM Admin Workspace

An administrative single-page web application (React 19, Vite 8) for managing the **ANIVOM** customized T-shirt e-commerce platform. The admin panel provides operational tools for tracking overall business metrics, managing catalog items and variant inventory, curating studio vector designs, processing customer orders, reviewing customization layer snapshots, managing discount coupons, and controlling marketing hero banners.

---

## Live Deployment

- **Admin Workspace**: https://anivom-admin.vercel.app/
- **Backend Service API**: https://anivom.onrender.com/
- **Interactive Swagger UI**: https://anivom.onrender.com/api-docs

---

## Admin Responsibilities

The ANIVOM Admin Workspace empowers store administrators to:
- Monitor store performance analytics (total revenue, active orders, customer metrics, sales status breakdowns).
- Perform full CRUD operations on product catalog items, base prices, descriptions, categories, and multi-view garment images.
- Adjust inventory stock counters per size (`XS`–`XXL`) and colour variant directly.
- Curate vector graphics and SVG design templates made available to customers in the ANIVOM Studio customizer.
- Oversee customer accounts, roles (`customer` / `admin`), and registration dates.
- Manage order fulfillment lifecycles (`PLACED` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`), inspect customization design layers, review customer shipping snapshots, and process return/refund requests.
- Manage promotional discount coupons (percentage or fixed discounts, minimum order constraints, usage limits, expiry dates).
- Configure hero carousel marketing banners for the customer storefront homepage.
- Manage master lookup entities (categories, sizes, colours).

---

## Authentication & Authorization

- **Admin Authentication**: Access to the admin application is restricted to authenticated user accounts possessing administrative privileges (`role === 'admin'`).
- **Session Management**: Authentication tokens (JWTs) are issued upon valid login and transmitted securely via HTTP-Only, SameSite cookies (`credentials: 'include'`).
- **Route Protection**: The application checks session state against `GET /api/v1/auth/me`. Non-admin accounts or unauthenticated visitors are automatically intercepted and presented with the Admin Sign-In interface (`Login.jsx`).
- **Logout**: Clicking the **Sign Out** button invokes `POST /api/v1/auth/logout`, clearing cookie tokens and terminating the active session.

---

## Dashboard

The main dashboard (`Dashboard.jsx`) presents high-level store metrics fetched from `GET /api/v1/orders/admin/stats`:
- **Revenue Overview**: Total sales revenue generated across all completed orders.
- **Active Orders**: Total count of customer orders requiring fulfillment or in progress.
- **Customer Volume**: Registered customer account totals.
- **Catalog Statistics**: Total active products count and stock alerts for low-inventory variants.
- **Order Status Breakdown**: Visual distribution of orders across current status lifecycle stages.
- **Recent Activity Table**: Summary list of recent order placements with order IDs, customer names, date, status badges, and quick links to inspect details.

---

## Product Management

The Products section (`Products.jsx` & `ProductFormModal.jsx`) provides catalog control:
- **Products Catalog**: Tabular overview displaying product name, category, base price, total variants count, active/inactive visibility toggle, and stock status.
- **Product Creation & Editing**: Create or update T-shirts with title, detailed description, base price, and category mapping.
- **Garment Images & Views**: Upload and manage high-resolution garment mockups for multi-angle previews (**Front**, **Back**, **Left**, **Right** views).
- **Variant & Inventory Management**: Define size (`XS`, `S`, `M`, `L`, `XL`, `XXL`) and colour options per product. Direct stock adjustment allows editing stock counts per individual variant.
- **Availability Controls**: Toggle product active/inactive state (`isActive`) to publish or hide products from the customer storefront instantly.

---

## Design Library

The Design Library workspace (`Designs.jsx`) manages SVG vector graphics used in the customer customization tool (ANIVOM Studio):
- **Artwork Collection**: Upload, preview, and organize vector graphics SVG templates.
- **Category Taxonomy**: Filter and group designs into categories (e.g., *ANIVOM Originals*, *Tamil*, *Typography*, *Minimal*, *Street*, *Geometric*).
- **Studio Availability**: Toggle design active status to instantly control which vector assets appear in the ANIVOM Studio customizer drawer.

---

## Customer Management

The Customer Directory (`Customers.jsx`) provides an overview of registered users fetched from `GET /api/v1/auth/users/admin`:
- **User Records**: Lists registered user names, email addresses, assigned roles (`CUSTOMER` or `ADMIN`), and registration timestamps.
- **Account Search**: Search users by name or email query.

---

## Order Management

The Orders section (`Orders.jsx` & `OrderDetailModal.jsx`) provides order fulfillment and dossier inspection:
- **Order List**: Filterable overview of all customer orders by status (`PLACED`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **Order Dossier**: Detailed modal view for inspecting an individual order, including:
  - **Customer Details**: Name, email, and user account reference.
  - **Shipping Snapshot**: Frozen delivery address snapshot at time of checkout (recipient name, phone number, address lines, city, state, postal code).
  - **Product & Variant Breakdown**: Purchased item names, selected sizing, colour swatches, unit price, and quantities.
  - **Customization Snapshot**: Visual layers and JSON configurations attached to customized products (text strings, fonts, colors, scale, SVG graphics, view orientation).
  - **Payment Metadata**: Total item subtotal, applied coupon discounts, final order total, payment status, and Razorpay Order/Payment transaction IDs (`razorpayOrderId`, `razorpayPaymentId`).
- **Status Lifecycle Transitions**: Advance orders through fulfillment stages:
  $$\text{PLACED} \longrightarrow \text{CONFIRMED} \longrightarrow \text{PROCESSING} \longrightarrow \text{SHIPPED} \longrightarrow \text{DELIVERED}$$
- **Returns & Refunds**: Review customer return requests and trigger Razorpay payment refunds or record refund states.

---

## Coupons

The Coupons manager (`Coupons.jsx`) controls promotional discount codes:
- **Coupon Parameters**: Configure coupon code string, discount type (percentage vs. fixed amount), discount value, minimum order purchase threshold, maximum discount cap, usage limits, and expiration dates.
- **Validation**: Active coupons are validated server-side during customer cart checkout.

---

## Homepage Banners

The Banners manager (`Banners.jsx`) controls hero promotional banners on the customer storefront homepage:
- **Banner Content**: Set headline title, subtitle, image asset URL, call-to-action button text, target link, and sort display order.
- **Active State**: Toggle banner visibility to publish or unpublish promotions.

---

## Admin Project Structure

```
admin/
├── src/
│   ├── main.jsx                 # Application entry point
│   ├── App.jsx                  # Main workspace layout, navigation & active view router
│   ├── App.css                  # Admin global styles, sidebar layout & component themes
│   ├── Dashboard.jsx            # Revenue metrics & summary dashboard
│   ├── Products.jsx             # Product catalog table & visibility toggles
│   ├── ProductFormModal.jsx     # Product CRUD modal & variant stock editor
│   ├── Designs.jsx              # Vector design library manager
│   ├── Orders.jsx               # Customer orders table & status filters
│   ├── OrderDetailModal.jsx     # Order dossier, design layer viewer & fulfillment actions
│   ├── Customers.jsx            # Registered customer user directory
│   ├── Coupons.jsx              # Discount coupon manager
│   ├── Banners.jsx              # Homepage hero carousel banner manager
│   ├── Categories.jsx           # Category master data lookup manager
│   ├── Colours.jsx              # Colour palette master data lookup manager
│   ├── Sizes.jsx                # Size options master data lookup manager
│   ├── SupportInbox.jsx         # Customer support inquiry messages manager
│   ├── Login.jsx                # Admin authentication form
│   ├── StatusBadge.jsx          # Standardized order status pill component
│   └── config.js                # API base URL configuration helper
├── index.html                   # HTML template
├── package.json                 # Project dependencies & npm scripts
└── vite.config.js               # Vite compilation configuration
```

---

## Technology

- **Frontend Framework**: React 19 (`react` `^19.2.8`, `react-dom` `^19.2.8`)
- **Build Engine**: Vite 8 (`vite` `^8.3.0`, `@vitejs/plugin-react` `^6.1.1`)
- **Linter**: Oxlint (`oxlint` `^1.81.0`)
- **Styling**: Vanilla CSS custom design system with CSS custom properties and responsive flex/grid layouts.

---

## Environment Configuration

The application references environment variables via Vite's `import.meta.env`:

- `VITE_API_URL`: (Optional) Specifies the backend REST API base URL. Defaults to `http://localhost:5000` during local development if omitted.

*No secret keys or credentials are stored or exposed in the admin client codebase.*

---

## Local Development

### Installation
From the project root, navigate into the `admin/` directory and install dependencies:
```bash
cd admin
npm install
```

### Start Development Server
Start the local Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173` (or the next available port).

### Code Linting
Run Oxlint static analysis across project files:
```bash
npm run lint
```

### Production Build
Compile static production assets:
```bash
npm run build
```

---

## Production Build

Running `npm run build` uses Vite to compile static assets into the `dist/` directory. The production deployment is hosted on **Vercel** (`https://anivom-admin.vercel.app/`) with single-page application rewrite rules routing requests to `index.html`.

---

## API Integration

The admin application communicates with the backend Express REST API (`https://anivom.onrender.com/api/v1`) using standard `fetch` re-usable calls with `credentials: 'include'` to pass HTTP-Only authentication cookies across origins. API routes include:
- `POST /api/v1/auth/login` & `GET /api/v1/auth/me`
- `GET/POST/PATCH /api/v1/products/admin*`
- `GET/POST/PATCH/DELETE /api/v1/designs/admin*`
- `GET/PATCH /api/v1/orders/admin*`
- `GET/POST/PATCH/DELETE /api/v1/coupons/admin*`
- `GET/POST/PATCH/DELETE /api/v1/banners/admin*`
- Master lookup routes under `/api/v1/categories`, `/api/v1/sizes`, and `/api/v1/colours`.

---

## Security Notes

- **Role Enforcement**: Every administrative request is verified server-side by backend authorization middleware (`protect` + `authorize('admin')`). Non-admin token requests are rejected with `403 Forbidden` regardless of client state.
- **Credential Protection**: Admin passwords and secret tokens are never stored in client code or environment variables. All authentication state relies on server-managed HTTP-Only cookies.

---

## Testing

The admin workspace was subjected to automated real-browser QA testing in this environment:
- Verified admin authentication and non-admin access rejection.
- Verified dashboard analytics loading (revenue metrics, order totals, low stock alerts).
- Verified product catalog grid views, stock editing, and active status toggling.
- Verified vector design library additions and category filtering.
- Verified customer list rendering.
- Verified order status advancement (`PLACED` → `CONFIRMED`), shipping snapshot display, and customization snapshot inspection.
- Verified coupon and banner management views.

---

## Demo Credentials

Demo login credentials for evaluation and testing are provided separately in submission documentation. Evaluators should sign in using an authorized admin account to inspect workspace functionality.

---

## Notes for Evaluators

The ANIVOM Admin Workspace demonstrates complete operational control over a MERN full-stack e-commerce system:
- **Variant-Level Inventory Control**: Demonstrates real-time management of multi-dimensional variant stock (`size` $\times$ `colour`).
- **Customization Snapshot Auditing**: Allows administrators to inspect exact canvas layer JSON configurations and vector graphics created by customers before order fulfillment.
- **Server-Governed Workflow**: All state changes, status transitions, stock updates, and promo validations are enforced server-side.
