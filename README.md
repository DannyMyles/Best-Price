# PriceHub

A modern storefront for selling electronics in Kenya — laptops, phones, cameras,
TVs, audio and accessories. Built with Next.js 16 (App Router), React 19 and
Tailwind CSS v4, on top of a small Node.js + MariaDB backend (`backend/`).

## Getting started

The storefront and admin dashboard read and write everything (products,
categories, banners, orders, reviews, photos) through the backend API, so start
that first — see [`backend/README.md`](backend/README.md) for MariaDB setup,
migrations, creating an admin and importing the catalogue.

```bash
# 1. backend (http://127.0.0.1:4000)
cd backend && npm install && npm run migrate && npm run dev

# 2. storefront (http://localhost:3000)
cp .env.local.example .env.local      # BACKEND_URL points at the backend
npm install
npm run dev
```

The browser only calls this site's own `/api/*`; `next.config.ts` forwards those
requests to `BACKEND_URL`, which keeps the admin session cookie same-origin.
`npm run build` also fetches the catalogue, so the backend must be running during a build.
If the backend is unreachable at runtime the storefront still renders (built-in categories
and banners) but shows no products.

## Payments

There is **no Daraja/STK Push integration**. Checkout sends the order to the
backend (which prices it from the database and reserves stock), then opens
WhatsApp with a formatted summary so the team can confirm. The M-Pesa step tells
the customer to **Send Money** to the number in `src/lib/contact.ts`
(`MPESA_PAYBILL_NUMBER`) and optionally capture the confirmation code. Cash on
delivery and bank transfer are also offered.

## Where things live

| Area | Path |
| --- | --- |
| Design tokens & component classes | `src/app/globals.css` |
| Contact / M-Pesa / store details | `src/lib/contact.ts` |
| Counties, delivery pricing, fallback categories/banners | `src/lib/data/` |
| Storefront routes | `src/app/(site)/` |
| Admin dashboard | `src/app/admin/` |
| Backend API client | `src/lib/api/`, `src/services/` |
| Backend (Express + MariaDB), image library | `backend/` |

## Scripts

- `npm run dev` — dev server
- `npm run build` / `npm run start` — production build
- `npm run lint` — ESLint
