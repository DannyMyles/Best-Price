# PriceHub backend (Node.js + MariaDB)

The API behind the PriceHub storefront and admin dashboard: sign-in/out, products, prices,
categories, product photos, orders (with stock and tracking), reviews and homepage banners —
plus the read endpoints the storefront needs (list, search, filter, sort, paginate).

* **Node 22.9+**, Express 5, `mysql2`, `zod` (validation), `bcryptjs`, `helmet`, `cors`, `multer`
* **MariaDB 10.5+** (developed against 11.8)
* **Product photos live in the database** — loaded once from your `pricehub` folder (see [Images](#images))

```
backend/
  db/schema.sql            tables (idempotent)
  data/                    categories.json + prices.csv (your price list) for the first import
  scripts/                 migrate · create-admin · import-catalog · import-images · enrich-products
  src/                     app, config, routes/, services/, middleware/, lib/imageStore.js
  test/                    100+ integration tests (node:test) against a real MariaDB
```

## Quick start

```bash
cd backend
npm install
cp .env.example .env            # then edit DB_* / CORS_ORIGINS
```

Create the database and a least-privilege user once (as the MariaDB admin):

```sql
CREATE DATABASE pricehub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pricehub'@'localhost' IDENTIFIED BY 'a-long-random-password';
GRANT ALL PRIVILEGES ON pricehub.* TO 'pricehub'@'localhost';
```

```bash
npm run migrate                 # creates the tables (safe to re-run)
npm run create-admin -- --email you@example.com --name "Your Name"
                                # prints a generated password once, or pass --password '…' (min 10 chars)
npm run import-catalog -- --dry-run   # preview: 9 categories + 158 products with prices
npm run import-catalog                # create them (never overwrites existing rows)
npm run dev                     # http://127.0.0.1:4000   (npm start for production)
```

`GET http://127.0.0.1:4000/api/health` → `{"status":"ok","db":"up"}`

Forgot a password? `npm run create-admin -- --email you@example.com --reset` (revokes all sessions).

## Configuration (`.env`)

| Variable | Default | Notes |
|---|---|---|
| `PORT` / `HOST` | `4000` / `127.0.0.1` | bind `0.0.0.0` only behind a reverse proxy |
| `DATABASE_URL` **or** `DB_HOST/PORT/USER/PASSWORD/NAME` | `127.0.0.1:3306`, user/db `pricehub` | |
| `IMAGES_ROOT` | `~/Desktop/programming/pricehub` | only read by `import-catalog` / `import-images` to load the original library |
| `PUBLIC_URL` | `http://localhost:$PORT` | base of the absolute image URLs in responses |
| `CORS_ORIGINS` | `http://localhost:3000` | comma-separated browser origins (storefront + admin UI) |
| `SESSION_TTL_HOURS` | `12` | admin session lifetime |
| `COOKIE_SECURE` / `COOKIE_SAMESITE` | `true` in production / `lax` | use `SAMESITE=none` + HTTPS if the UI is on a different *site* |
| `TRUST_PROXY` | off | set (e.g. `1`) behind a proxy so rate limiting sees real IPs |
| `MAX_UPLOAD_MB` | `6` | per image |

The server refuses to start on invalid config and tells you what's wrong.

## Images

Photos are stored **in MariaDB** (`product_images`, `LONGBLOB`), not on disk.

* First load: `npm run import-images` reads each product's original folder
  (`<IMAGES_ROOT>/<NN_category>/<Item Name>/<Item Name> - 1.jpg, - 2.jpg …`, remembered in
  `products.image_dir`) and stores the files in numeric order. Products that already have photos are
  skipped, so re-running is safe; `--replace` reloads, `--dry-run` previews. (~135 MB for the current library.)
* Photos are served at `GET /images/p/<image id>`. Response URLs include `?v=<updated time>` so browsers
  can cache them forever and still see changes. Product lists only read metadata, never the blobs.
* **Upload** appends to the end of the gallery. The file type is verified from its bytes, not the
  filename/MIME. Max 30 images per product, `MAX_UPLOAD_MB` each. In responses `file` is the image id.
* **Reorder** takes every image id in the new order — the first becomes the primary image.
* **Delete an image** removes it and closes the gap. **Deleting a product deletes its photos.**
* MariaDB's `max_allowed_packet` must exceed your largest image (the default 16 MB is plenty).
* Back up the database and you've backed up the photos too.
* Not done: resizing/re-encoding uploads.

## API

All errors: `{ "error": { "code": "VALIDATION_ERROR", "message": "…", "details": [{ "path": "price", "message": "…" }] } }`
(`400 BAD_REQUEST`, `401 UNAUTHENTICATED / INVALID_CREDENTIALS`, `403 FORBIDDEN`, `404 NOT_FOUND`,
`409 DUPLICATE / CATEGORY_IN_USE / TOO_MANY_IMAGES`, `413 PAYLOAD_TOO_LARGE`, `415 UNSUPPORTED_MEDIA`,
`422 VALIDATION_ERROR`, `429 RATE_LIMITED`).

### Storefront (public, read-only — active products in active categories only)

| | |
|---|---|
| `GET /api/products` | `?q=&category=&brand=&minPrice=&maxPrice=&inStock=true&featured=true&sort=&page=&limit=` → `{ items, total, page, limit, totalPages }`. `sort`: `featured` (default) · `price-asc` · `price-desc` · `name` · `newest`. `limit` ≤ 200 (default 50). `q` = every word must match name/SKU/slug/brand/description/category. Items with no price sort last. |
| `GET /api/products/:slug` | one product |
| `GET /api/categories` | `{ items: [{ slug, name, shortName, description, icon, order, productCount }] }` |
| `GET /images/…` | photos |
| `GET /api/health` | liveness + DB check |

Product shape (compatible with the storefront's `Product` type):
`{ id, slug, sku, name, category, categoryName, brand, price, compareAtPrice, description, specs[], color, inStock, stockCount, badge, featured, featureRank, images: [absolute URLs, primary first] }`
— `price` is whole KES, `null` = price on request.

### Admin (cookie session required — everything under `/api/admin`)

| | |
|---|---|
| `POST /api/admin/auth/login` `{ email, password }` | sets the `ph_admin_session` cookie → `{ admin }` |
| `POST /api/admin/auth/logout` | revokes the session server-side (idempotent) |
| `GET /api/admin/auth/me` | current admin |
| `POST /api/admin/auth/change-password` `{ currentPassword, newPassword }` | signs out all *other* sessions |
| `GET /api/admin/products` | same filters as the storefront **plus** inactive products and `active=true\|false`; includes `active, imageDir, adminNotes, createdAt, updatedAt` |
| `POST /api/admin/products` | create → 201. Required: `name, sku, category` (slug). Optional: `slug` (default `slugify(name-sku)`), `brand, price, compareAtPrice, description, specs[{label,value}], color, inStock, stockCount, badge, featured, featureRank, active, adminNotes` |
| `GET /api/admin/products/:id` | one product |
| `PATCH /api/admin/products/:id` | partial update — **this is how prices change**: `{ "price": 79999 }` (only the fields you send change; `null` clears nullable ones) |
| `DELETE /api/admin/products/:id` | 204 (its photos are deleted too) |
| `GET /api/admin/categories` · `GET/PATCH/DELETE /api/admin/categories/:id` · `POST /api/admin/categories` | slug is immutable. `DELETE` on a category that has products → `409 CATEGORY_IN_USE`; retry with `?reassignTo=<slug>` to move them (atomic) |
| `GET /api/admin/products/:id/images` | `{ max, images: [{ file, position, size, url }] }` |
| `POST /api/admin/products/:id/images` | `multipart/form-data`: `images` (1–10 files) |
| `PUT /api/admin/products/:id/images/order` `{ files: [...] }` | must list every current file exactly once |
| `DELETE /api/admin/products/:id/images/:file` | returns the updated list |

```bash
# sign in (keeps the cookie), change a price, upload a photo
curl -c jar -H 'content-type: application/json' -d '{"email":"you@example.com","password":"…"}' localhost:4000/api/admin/auth/login
curl -b jar -X PATCH -H 'content-type: application/json' -d '{"price":79999}' localhost:4000/api/admin/products/12
curl -b jar -F 'images=@photo.jpg' localhost:4000/api/admin/products/12/images
```

From the browser use `fetch(url, { credentials: 'include' })` and add the UI's origin to `CORS_ORIGINS`.
`next/image` needs the API host in `next.config.ts` → `images.remotePatterns` (or `unoptimized`).

## Security notes

* **Sessions, not JWTs**: a random token in an `HttpOnly` cookie (`SameSite=Lax`, `Secure` in production,
  path-scoped to `/api/admin`); only its SHA-256 is stored, so logout/expiry/deactivation/password change
  take effect immediately and a DB leak doesn't leak live sessions. Passwords are bcrypt (cost 12).
* Login: identical error for unknown email vs wrong password (and equalised timing); **failed** attempts are
  rate-limited (10 / 15 min / IP → 429).
* CSRF: cookie auth plus an **Origin allow-list check** on every state-changing admin request.
  CORS only for `CORS_ORIGINS`. `helmet` headers. JSON bodies capped at 100 KB.
* All input validated with zod (strict types — `"1000"` is not accepted as a price); all SQL is
  parameterised, sort options are whitelisted, `LIKE` wildcards in searches are escaped.
* Uploads: real file type checked from magic bytes, size-capped, stored with a fixed MIME and served with `nosniff`;
  per-product row lock serialises uploads/reorders. Unknown failures return a generic 500 (details go to the log only).
* Deploy behind HTTPS (nginx/Caddy) and set `TRUST_PROXY`, `PUBLIC_URL`, `CORS_ORIGINS`.

## Tests

`npm test` — 100+ integration tests that boot the real app against a **throwaway MariaDB database** (auth, sessions, CSRF, rate limits, CRUD, search/filter/sort/paging, photo storage, concurrency). Point them at a database you can wipe:

```bash
TEST_DB_HOST=127.0.0.1 TEST_DB_PORT=3306 TEST_DB_USER=ph_test TEST_DB_PASSWORD=… TEST_DB_NAME=ph_test npm test
```

The database name **must end in `_test`** (the suite drops its tables). Never point it at production.

## Orders, reviews, banners

| | |
|---|---|
| `POST /api/orders` | public checkout. Only `sku` + `quantity` per item are trusted — prices and names come from the database; stock is decremented transactionally. `409 ITEM_UNAVAILABLE` if something sold out, `409 DUPLICATE` if the client-supplied `ref` (`PH-XXXX`) is taken. |
| `POST /api/orders/track` `{ ref, phone }` | public status lookup; a wrong ref and a wrong phone return the identical `404`. |
| `GET /api/reviews?sku=` · `POST /api/reviews` | approved reviews / submit one (held for approval) |
| `GET /api/banners` | active homepage slides, in order |
| `GET /api/admin/orders` · `PATCH /api/admin/orders/:id` | list (`status`, `paymentStatus`, `q`, `page`, `limit`) / set `{ status, paymentStatus }`. Cancelling restocks once and freezes the order. |
| `GET /api/admin/reviews` · `PATCH/DELETE /api/admin/reviews/:id` | moderate (`approved` filter, `{ approved }`) |
| `GET/POST /api/admin/banners` · `PATCH/DELETE /api/admin/banners/:id` · `PUT /api/admin/banners/order` `{ ids }` | manage slides |
| `GET /api/admin/stats` | dashboard numbers |
| `POST /api/admin/products/bulk` `{ items }` | create-or-update by SKU (CSV import) |

## Order alerts, admins, banner pictures

* **New-order email:** set `NOTIFY_EMAIL_TO` (comma-separated) plus `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASSWORD`
  (see `.env.example`). Every accepted order sends one email with the server-priced items, totals and customer details.
  Sending is fire-and-forget: an SMTP failure is logged and never affects checkout. With no SMTP config nothing is sent.
* **Admins:** `GET/POST /api/admin/admins`, `PATCH/DELETE /api/admin/admins/:id` (`{ active }`, `{ password }`, `{ name }`).
  Deactivating or resetting a password signs that admin out everywhere; you can't disable/delete yourself or the last active admin.
* **Banner pictures:** `POST /api/admin/banners/image` (multipart `image`) stores the picture in MariaDB and returns
  `{ url }` (served from `/images/b/:id`) to use as the banner's `image`.
* **Product details:** `npm run enrich-products` fills real descriptions and specs (`data/product-details.js`) for the
  imported catalogue. It never overwrites a description or specs you've edited (use `--force` to override).

## Running behind the Next.js storefront

The storefront forwards `/api/*` and `/images/*` to this server (`BACKEND_URL` in its `.env.local`), so the
browser only ever sees one origin. In that setup set `PUBLIC_URL` to the **storefront's** public URL,
`CORS_ORIGINS` to the same, and `TRUST_PROXY=1`. The storefront's `next.config.ts` needs no `remotePatterns`
for photos (they're unoptimised, same-origin URLs).
