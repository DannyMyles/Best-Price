import { Router } from "express";
import { parse } from "../errors.js";
import { limiter } from "../middleware/security.js";
import {
  orderCreateSchema,
  orderTrackSchema,
  reviewCreateSchema,
  reviewListQuerySchema,
} from "../schemas.js";
import { createOrder, getOrderByRef, trackOrder } from "../services/orders.js";
import { createReview, listApprovedReviews } from "../services/reviews.js";
import { listBanners } from "../services/banners.js";

const HOUR = 60 * 60 * 1000;
const QUARTER_HOUR = 15 * 60 * 1000;

/** Public endpoints that write (checkout, tracking, reviews) + homepage banners. */
export function publicStoreRouter({ pool, notifier }, options = {}) {
  const r = Router();

  r.post("/orders", limiter(HOUR, options.orderLimit ?? 30), async (req, res) => {
    const order = await createOrder({ pool }, parse(orderCreateSchema, req.body));
    if (notifier?.enabled) {
      // Full order (customer, notes…) for the alert; never let this affect the response.
      const full = await getOrderByRef(pool, order.ref).catch(() => null);
      if (full) notifier.orderPlaced(full);
    }
    res.status(201).json(order);
  });

  // POST (not GET) so the phone number never lands in URLs or access logs.
  r.post("/orders/track", limiter(QUARTER_HOUR, options.trackLimit ?? 20), async (req, res) => {
    const { ref, phone } = parse(orderTrackSchema, req.body);
    res.json(await trackOrder(pool, ref, phone));
  });

  r.get("/reviews", async (req, res) => {
    const { sku } = parse(reviewListQuerySchema, req.query);
    res.json({ items: await listApprovedReviews(pool, sku) });
  });

  r.post("/reviews", limiter(HOUR, options.reviewLimit ?? 10), async (req, res) => {
    await createReview(pool, parse(reviewCreateSchema, req.body));
    res.status(201).json({ ok: true, message: "Thanks! Your review will appear once it's approved." });
  });

  r.get("/banners", async (_req, res) => {
    res.json({ items: await listBanners(pool, { activeOnly: true }) });
  });

  return r;
}
