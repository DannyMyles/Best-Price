const LOW_STOCK_THRESHOLD = 5;

/** Numbers for the admin overview, computed in SQL (no need to load every order). */
export async function getStats(pool) {
  const one = async (sql) => (await pool.query(sql))[0][0];
  const [products, categories, orders, reviews] = await Promise.all([
    one("SELECT COUNT(*) AS n FROM products"),
    one("SELECT COUNT(*) AS n FROM categories"),
    one(`SELECT
           SUM(status = 'pending') AS pending,
           SUM(payment_status <> 'paid' AND status <> 'cancelled') AS awaiting_payment,
           COALESCE(SUM(CASE WHEN payment_status = 'paid' AND status <> 'cancelled' THEN total END), 0) AS revenue
         FROM orders`),
    one("SELECT COUNT(*) AS n FROM reviews WHERE approved = 0"),
  ]);
  const [lowStock] = await pool.query(
    `SELECT id, slug, name, stock_count FROM products
     WHERE stock_count IS NOT NULL AND stock_count <= ? ORDER BY stock_count ASC, name ASC LIMIT 5`,
    [LOW_STOCK_THRESHOLD]
  );
  const [recent] = await pool.query(
    "SELECT id, ref, customer_name, total, status, payment_status, created_at FROM orders ORDER BY created_at DESC, id DESC LIMIT 5"
  );
  return {
    products: products.n,
    categories: categories.n,
    pendingOrders: Number(orders.pending ?? 0),
    awaitingPayment: Number(orders.awaiting_payment ?? 0),
    revenue: Number(orders.revenue),
    pendingReviews: reviews.n,
    lowStock: lowStock.map((p) => ({ id: p.id, slug: p.slug, name: p.name, stockCount: p.stock_count })),
    recentOrders: recent.map((o) => ({
      id: o.id, ref: o.ref, customerName: o.customer_name, total: o.total,
      status: o.status, paymentStatus: o.payment_status, createdAt: o.created_at,
    })),
  };
}
