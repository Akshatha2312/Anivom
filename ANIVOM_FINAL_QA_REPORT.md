# ANIVOM FINAL QA REPORT

Test date/time: 2026-09-29 04:31:20 +05:30  
Customer URL: http://localhost:5173  
Admin URL: http://localhost:5174  
Backend URL: http://localhost:5000  
Browser: VS Code integrated Chromium 150 / Electron 43 on Windows  
Playwright version: Not exposed by the integrated browser automation tool

## 1. Summary

| Measure | Result |
|---|---:|
| Customer direct URL cases | 22 (includes aliases and `/register?ref=...`) |
| Product detail types opened | 7 of 7 active products |
| Footer destinations clicked | 9 of 9 |
| Responsive samples | 25 (5 pages × 5 viewport sizes) |
| API request/status observations | 49+ focused cases, including guest/customer/admin-role checks |
| Customer workflows | 13 targeted workflows; end-to-end paid order not attempted |
| PASS | 10 feature groups, plus health/routes/security/data checks |
| FAIL | 3: admin frontend origin, mobile overflow, Google OAuth origin |
| BLOCKED | 8 major workflows/checks; details below |
| NOT APPLICABLE | Destructive CRUD, real payment completion, new-account creation |

The customer frontend and backend are reachable. The requested admin origin returns the customer app, so admin UI testing could not proceed. Customer route smoke tests, key workflows, API authorization, cart/checkout reconciliation, and responsive samples were exercised in the live browser. No application code or configuration was changed. A temporary wishlist item and cart line were added for persistence/quantity checks and both were removed; the existing cart and wishlist counts were restored to their observed starting values. No order, address, support message, account, or saved design was created or changed.

## 2. Route Results

The customer routing map is defined in `client/src/App.jsx`. `/register` is an additional special entry handled during app startup. Every listed URL returned HTTP 200 and rendered nonblank content. Authentication-gated routes showed their signed-out UI until a demo login was used.

| Route | Page | Load | Functionality | UI / Console / Network | Responsive | Status |
|---|---|---|---|---|---|---|
| `/` | Home | 200 | Homepage rendered | No blank page; first-visit modal is present | Sampled | PASS |
| `/home` | Home alias | 200 | Correct component | No blank page | Route smoke | PASS |
| `/catalog` | Catalog | 200 | Search, filters, sort, reset tested | Catalog loaded 46 variants | Sampled | PASS |
| `/products` | Catalog alias | 200 | Correct component | No blank page | Route smoke | PASS |
| `/shop` | Catalog alias | 200 | Correct component | No blank page | Route smoke | PASS |
| `/studio` | Studio | 200 | Editor and auth gate tested | Artwork, text, upload validation rendered | Sampled | PASS |
| `/cart` | Cart | 200 | Quantity, persistence, cleanup tested | Totals matched server | Sampled | PASS |
| `/bag` | Cart alias | 200 | Correct component | No blank page | Route smoke | PASS |
| `/checkout` | Checkout | 200 | Summary, address list, invalid coupon tested | Real payment/order not attempted | Sampled | PASS / PAYMENT BLOCKED |
| `/login` | Authentication | 200 | Invalid and valid customer login tested | Google OAuth has origin failure | Sampled | PASS / OAUTH FAIL |
| `/register?ref=QA-CHECK` | Registration | 200 | Required, email, mismatch, duplicate checks | Duplicate rejected; test referral value cleared | Route smoke | PASS |
| `/account` | Account | 200 | Addresses and account summary read-only | Existing addresses/orders displayed | Sampled | PASS |
| `/orders` | Orders | 200 | Two existing orders; details and cancel prompt opened | Cancel was dismissed; no order changed | Sampled | PASS |
| `/creations` | My Creations | 200 | Two saved designs displayed | Did not save/delete a real creation | Sampled | PASS |
| `/wishlist` | Wishlist | 200 | Add, refresh persistence, remove cleanup tested | Restored to initial count | Sampled | PASS |
| `/referrals` | Referral Atelier | 200 | Referral code/link/stats rendered | Link used real code; no invalid values | Sampled | PASS |
| `/referral` | Referral alias | 200 | Correct component | No blank page | Route smoke | PASS |
| `/product` | Product detail | 200 | Missing ID handled with not-found state | No raw values | Route smoke | PASS |
| `/product?id=...` | Product detail | 200 | All 7 active product types opened from catalog | Titles correct; 3–5 images each, none broken | Route/UI | PASS |
| `/faq` | FAQs | 200 | Page rendered | Footer present | Sampled | PASS |
| `/shipping` | Shipping | 200 | Page rendered | Footer present | Sampled | PASS |
| `/returns` | Returns | 200 | Page rendered | Footer present | Sampled | PASS |
| `/contact` | Contact | 200 | Form visible; no message submitted | Footer present | Sampled | PASS / SUBMIT BLOCKED |
| `http://localhost:5174/` | Expected admin entry | 200 | Admin login/modules unavailable | Customer homepage and customer navigation rendered | Not applicable | FAIL - HIGH |

Admin is implemented as an internal tab workspace, not as separate URL routes. `admin/src/App.jsx` defines Dashboard, Products, Orders, Customers, Categories, Sizes, Colours, Designs, Coupons, Support Inbox, and Banners. The requested admin origin did not serve this app, preventing all UI module tests.

## 3. Customer Features

| Feature | Result | Evidence / limitation |
|---|---|---|
| Home | PASS | Home and category sections rendered; database banner endpoint returned one record. CTA-to-destination check later blocked by browser CDP timeout. |
| Registration | PASS | Required fields and malformed email rejected; mismatched password produced inline error; existing email returned 400. No account was created. |
| Login | PASS | Invalid password returned 401 with inline error; existing demo login returned 200 and rendered account navigation. |
| Google Login | FAIL / BLOCKED | Button rendered; Google Identity Services returned 403, “origin is not allowed for the given client ID.” No OAuth completion was faked. |
| Shop | PASS | 7 active products and 46 available colour/variant cards observed. |
| Search | PASS | Partial valid search produced a suggestion and 6 matching cards; no-match query showed empty state; clear restored 46 cards. |
| Filters and sort | PASS | Polo category returned 6 cards; XS + Black returned 1; price sort changed; reset restored catalog. |
| Product Details | PASS | All 7 products opened; names matched, image galleries rendered, no broken images or `undefined`/`null`/`NaN`. |
| Wishlist | PASS | Existing two entries loaded; a Polo variant was added, survived refresh, then was removed; starting count restored. |
| Cart | PASS | Existing 3 lines / 4 units matched server; temporary Polo line added, quantity incremented/decremented, survived refresh, then removed. Baseline restored. |
| Studio | PASS / BLOCKED | Editor, product, colours/sizes, 10 artwork designs, text layer editing/deletion, and login gate tested. No design saved. Empty/unsupported/oversized upload checks did not upload a file. |
| My Creations | PASS | Two existing creations and their layer summaries rendered; no home-page misroute. Destructive controls not used. |
| Addresses | PASS / BLOCKED | Two existing addresses rendered on Account/Checkout; no record changed. Add/edit/default/ownership workflows were not performed. |
| Checkout | PASS / BLOCKED | Address selection, server checkout summary, invalid coupon, totals and item snapshots tested. No order created. |
| Coupons | PASS | Invalid coupon returned 404 and inline “Invalid or expired coupon code”; no coupon data changed. |
| Payment | BLOCKED | Razorpay SDK subresource was blocked; order creation/payment UI were not attempted to avoid creating a pending order. |
| Orders | PASS / BLOCKED | Two existing orders and detail view rendered. Cancel confirmation opened and was dismissed. No real cancellation or refund. |
| Referrals | PASS | API/UI returned actual code-backed link; URL contained no `undefined`, `null`, or `NaN`; one existing referral/history entry displayed. No new account registered. |
| Support | PASS / BLOCKED | Contact page and fields rendered; API missing-required-fields probe returned 400. No support message was submitted; rate limiting not tested. |
| Logout | PASS | Logout returned 200; account navigation/bag badge cleared; protected customer APIs returned 401. |

## 4. Admin Features

| Feature | Result | Evidence / limitation |
|---|---|---|
| Login | BLOCKED | `localhost:5174` serves the customer frontend; no admin login form. |
| Dashboard | BLOCKED | Admin frontend not served. |
| Users | BLOCKED | Admin frontend not served. Customer access to admin users API rejected. |
| Products | BLOCKED | Admin frontend not served. Customer access to admin products API rejected. |
| Categories | BLOCKED | Admin frontend not served. Customer access rejected. |
| Sizes | BLOCKED | Admin frontend not served. Customer access rejected. |
| Colours | BLOCKED | Admin frontend not served. Customer access rejected. |
| Designs | BLOCKED | Admin frontend not served. Customer access rejected. |
| Coupons | BLOCKED | Admin frontend not served. Customer access rejected. |
| Banners | BLOCKED | Admin frontend not served. Customer access rejected. |
| Orders | BLOCKED | Admin frontend not served. Customer access rejected. |
| Support | BLOCKED | Admin frontend not served. Customer access rejected. |
| Referrals | BLOCKED | No admin referral module is wired in the observed `admin/src/App.jsx` tabs. |
| Logout | BLOCKED | Admin UI session cannot be established at the specified origin. |

## 5. Security / RBAC

| Test | Result | Evidence |
|---|---|---|
| Guest access to `/auth/me`, cart, wishlist, addresses, orders, customizations, referrals | PASS | Protected endpoints returned 401. |
| Customer access to admin APIs | PASS | 11 admin endpoints (products, categories, sizes, colours, designs, coupons, banners, contact, users, orders, order stats) returned 403 with customer session. |
| Guest access to same admin APIs | PASS | Same endpoints returned 401 without a session. |
| Customer access to another customer's address/order | BLOCKED | Requires a second safe customer account/context; no ownership attempt was made. |
| Invalid product ID | PASS | Returned 404 “Product not found.” |
| Invalid price query | PASS | Returned 400 “Invalid minPrice value.” |
| Missing contact fields | PASS | Returned 400 with required-field validation. |
| Invalid referral code | PASS | Returned 404 and invalid-code message. |
| Invalid payment signature | BLOCKED | Safe invalid payload was rejected with 400 for missing required linkage; a real order/signature test would require creating an order. No paid state was altered. |
| Session isolation between customer/admin contexts | BLOCKED | Admin frontend was unavailable and the integrated tool did not expose explicit browser-context creation. Same-page customer refresh preserved the session; one separate automation page showed inconsistent `auth/me` state, so cross-context conclusions are withheld. |
| Expired/forged token | NOT TESTED | No token was extracted, logged, or tampered with. |

## 6. Responsive UI

CSS viewport widths were corrected for the integrated browser's 0.8 device scale factor. The sweep sampled Home, Catalog, Studio, signed-out Cart, and Contact.

| Viewport | Result |
|---|---|
| 1440×900 | PASS; no horizontal overflow in sampled pages. |
| 1152×720 | PASS; no horizontal overflow in sampled pages. |
| 768×1024 | PASS with one catalog control extending beyond the visible strip; category bar is horizontally scrollable. |
| 390×844 | FAIL - LOW; body-level horizontal overflow on Home, Catalog, Studio, Contact; signed-out Cart fit. Catalog category buttons extend outside the viewport within its horizontal strip. |
| 375×812 | FAIL - LOW; body-level horizontal overflow on Home, Catalog, Studio, Contact; signed-out Cart fit. At 375 CSS px, Contact body scroll width measured 380 px. Catalog category controls extend well past the visible strip and require horizontal scrolling. |

No broken images were found in the sampled pages or product galleries. Mobile menu state was observed, but the final CTA/menu destination check was blocked by the browser automation connection timeout.

## 7. Console Errors

- No uncaught JavaScript/page errors were observed during the direct-route sweep.
- Google Identity Services emitted a warning that configured button width `100%` is invalid, then logged an origin-not-allowed error; the button still rendered, but OAuth was unavailable. Component: `client/src/AuthModal.jsx`. Severity: MEDIUM for the broken OAuth option; LOW for the width warning.
- The browser emitted `Unrecognized feature: web-share` and `local-network-access` warnings from third-party content. No customer-page crash resulted. Severity: LOW / external.
- Expected 401/403/400/404 console entries corresponded to signed-out protection, customer-vs-admin RBAC, duplicate registration, invalid coupon, and deliberately invalid API inputs; these are not unexpected failures.
- Razorpay external-resource failure is listed under Network Errors.

## 8. Network Errors

| Request | Result | Classification |
|---|---|---|
| `https://checkout-static-next.razorpay.com/build/undefined` | Browser reported `net::ERR_BLOCKED_BY_ORB` while loading the Razorpay SDK dependency. | BLOCKED / external payment integration; payment initialization not verified. |
| Google Identity Services button request | 403 from Google; browser console reports the configured origin is not allowed for the client ID. | OAuth configuration failure; no simulated success. |
| Superseded local page navigations during a serial viewport sweep | `net::ERR_ABORTED` as each new navigation replaced the previous one. | Test-runner navigation artifact; excluded from application failure count. |
| Invalid API test requests | Expected 400/401/403/404 responses. | Negative-test outcomes, not unexpected network failures. |

No local frontend/backend health or product-data request returned an unexpected 5xx during completed checks. API docs redirected from `/api-docs` to its trailing-slash path.

## 9. Data Mismatches

- Catalog/API: 7 active products; catalog displayed 46 available product-colour variants. Product variants had positive stock. No duplicate product names were observed in the returned set.
- Cart/API/Checkout: 3 lines, 4 units; subtotal ₹5,196, free shipping ₹0, total ₹5,196. UI and server checkout summary matched. Customized line displayed its two-layer snapshot.
- Orders: 2 existing orders rendered, including one pending and one paid/confirmed; amounts were consistent with item quantities and prices. No raw object values or placeholders appeared.
- Wishlist: 2 existing entries before the reversible check; a temporary entry persisted after refresh and was removed; baseline restored.
- Referrals: invitation link used the API-provided referral code and had no invalid placeholder token.
- Admin aggregate counts could not be cross-checked because admin UI/login was unavailable.
- Initial snapshots briefly showed catalog loading/zero variants and wishlist loading; settled states loaded correctly. These transient states were not classified as failures.

## 10. Broken Links

None found among the 9 clicked customer footer links: Catalog, ANIVOM Studio, Bag, My Creations, Referral Atelier, FAQs, Shipping & Delivery, Returns & Refunds, and Contact Us. Each opened its expected route with nonblank content. Footer credit `with love, akshu` was present.

## 11. UI Issues

1. LOW: Mobile horizontal overflow. At 375 CSS px, the footer container extends 5 px beyond the viewport; sampled Home, Catalog, Studio, and Contact pages show body-level horizontal scrolling. Likely owning surface: `.anivom-footer-container` in `client/src/App.css`.
2. LOW: Catalog category strip places several category controls outside the visible viewport. The strip has horizontal scrolling, but the final visible controls require a horizontal gesture. Owning surface: `.anivom-category-nav` in `client/src/Catalog.css`.
3. LOW: Google Identity Services rejects button width `100%`; the value is set in `client/src/AuthModal.jsx`.
4. External Razorpay subresource failed as described above; no broken product/gallery images were found.

## 12. Functional Issues

1. HIGH: `http://localhost:5174/` renders the customer storefront instead of the admin application. Expected: admin login/workspace. Actual: customer navigation/home; `.admin-login-wrapper` and admin sidebar are absent. Reproduction: open the specified admin URL directly. Affected app entry: `admin/src/App.jsx`; the running service at that port appears to be serving the wrong frontend. All admin UI journeys are blocked.
2. MEDIUM: Google login cannot complete because Google returns 403 for the current origin/client-ID combination. Expected: OAuth UI proceeds to Google sign-in; actual: button renders but Identity Services reports the origin is not allowed. Reproduction: open `/login` and observe the Google button/network response. No success was faked.
3. LOW: Responsive horizontal overflow described in UI Issues.
4. No customer cart, checkout-summary, referral, product-detail, wishlist-persistence, or footer-link functional mismatch was found in the tested slice.

## 13. Security Issues

No customer-to-admin API authorization bypass was observed: guest calls returned 401 and authenticated customer calls returned 403 across the 11 tested admin endpoints. Customer routes remained protected after logout. Ownership checks between two customer accounts, expired-token handling, and admin-session isolation remain unverified; no claim of complete security assurance is made.

## 14. Blocked Tests

- Admin login and all admin modules: blocked because port 5174 serves the customer frontend, not the admin application.
- Google OAuth completion: blocked by Google 403 origin/client-ID rejection.
- Razorpay order initialization/payment UI/verification: blocked because the external Razorpay dependency request was blocked; creating a pending order solely for QA was avoided.
- Full order creation and paid journey: intentionally not performed to avoid creating a real pending order or changing inventory/payment records.
- Support form successful submission/rate limit: blocked by the no-unnecessary-record rule; only UI and missing-field API validation were checked.
- Address create/edit/default/delete and second-customer ownership: blocked to preserve existing customer records and because no second safe test account/context was available.
- Referral registration: blocked because successful registration would create a persistent user/referral record.
- Invalid payment signature against an existing order: blocked; only a malformed unauthenticated/missing-linkage request was tested, which returned 400 without changing order state.
- Browser home CTA/banner equality and final menu interaction: BLOCKED/TOOL ERROR after the integrated browser connection timed out at CDP setup. This is not attributed to ANIVOM.
- Playwright version and isolated browser-context creation: not exposed by the integrated browser tool.

## 15. Severity

| Severity | Finding |
|---|---|
| HIGH | Admin frontend unavailable at the requested admin URL; wrong app served. |
| MEDIUM | Google OAuth option unavailable for the current origin/client configuration. |
| LOW | Mobile footer/body horizontal overflow and catalog category strip visibility. |
| LOW | Google Identity Services button-width warning. |
| BLOCKED / UNCLASSIFIED | Razorpay SDK dependency blocked by the browser; payment path could not be validated. |

## 16. Final Status

PASS:
- Customer and backend start at requested URLs; health endpoint returns 200.
- 22 customer URL cases load directly; all 7 product detail types and 9 footer destinations were exercised.
- Customer invalid/valid login, logout, registration validation, catalog search/filters/sort, wishlist persistence, cart quantity/persistence, checkout summary/coupon rejection, Studio auth/upload validations, referral link, and order detail/cancel confirmation checks passed in the tested scope.
- Guest/customer authorization responses for protected customer and admin endpoints were appropriate.
- Customer cart/wishlist test data was restored; no order/address/user/support/design record was created or destroyed.

FAIL:
- Admin URL serves the customer frontend instead of the admin app (HIGH).
- Mobile body horizontal overflow at 390×844 and 375×812 on sampled pages (LOW).
- Google OAuth is rejected for the configured browser origin (MEDIUM).

BLOCKED:
- Admin UI journeys, real OAuth completion, Razorpay initialization/payment, paid order creation, support submission/rate limiting, address CRUD/ownership, referral registration, and isolated customer/admin browser contexts.
- Final Home CTA/banner equality/menu check due browser CDP tool timeout; classified as `BLOCKED/TOOL ERROR`, not an ANIVOM failure.

REQUIRES MANUAL TEST:
- Serve the actual admin Vite app on port 5174, then test admin login/RBAC modules and CRUD confirmation flows.
- Verify Google OAuth origins in the provider configuration and repeat browser login.
- Restore a valid accessible Razorpay SDK dependency and use a dedicated safe payment test order for end-to-end initialization/verification.
- Repeat responsive checks in a standard browser viewport and verify full customer-to-payment and separate-context session isolation.
