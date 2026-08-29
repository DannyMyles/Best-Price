# PriceHub

A modern storefront for selling electronics in Kenya — MacBooks, iPads, iMacs,
Surface devices and accessories. Built with Next.js 16 (App Router), React 19,
Tailwind CSS v4 and Firebase.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

With no `.env.local` the storefront runs entirely on the bundled seed catalogue
(`src/lib/data/`). Add Firebase credentials (see `.env.local.example`) to switch
the catalogue, orders and reviews to Firestore, then `npm run seed` to push the
seed data up.

## Payments

There is **no Daraja/STK Push integration**. Checkout collects the order, records
it to Firestore (when configured), and opens WhatsApp with a formatted summary so
the team can confirm. The M-Pesa step tells the customer to **Send Money** to the
number in `src/lib/contact.ts` (`MPESA_PAYBILL_NUMBER`) and optionally capture the
confirmation code. Cash on delivery and bank transfer are also offered.

## Where things live

| Area | Path |
| --- | --- |
| Design tokens & component classes | `src/app/globals.css` |
| Contact / M-Pesa / store details | `src/lib/contact.ts` |
| Seed catalogue, counties, delivery pricing | `src/lib/data/` |
| Storefront routes | `src/app/(site)/` |
| Admin dashboard | `src/app/admin/` |
| Firestore access | `src/lib/firebase/`, `src/services/` |

## Scripts

- `npm run dev` — dev server
- `npm run build` / `npm run start` — production build
- `npm run lint` — ESLint
- `npm run seed` — push seed catalogue to Firestore (needs a service account)
