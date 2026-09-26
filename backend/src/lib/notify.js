import nodemailer from "nodemailer";

const kes = (n) => `KES ${Number(n).toLocaleString("en-KE")}`;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** Plain-text + HTML body for a "new order" email. */
export function orderEmail(order, storeName) {
  const items = order.items ?? [];
  const lines = items.map((i) => `• ${i.name} ×${i.quantity} — ${i.price == null ? "POA" : kes(i.price * i.quantity)}`);
  const text = [
    `New ${storeName} order ${order.ref}`,
    "",
    ...lines,
    "",
    `Subtotal: ${kes(order.subtotal)}`,
    `Delivery (${order.deliveryMethod}): ${kes(order.deliveryFee)}`,
    `Total: ${kes(order.total)}`,
    `Payment: ${order.paymentMethod}${order.mpesaCode ? ` (M-Pesa code ${order.mpesaCode})` : ""}`,
    "",
    `Customer: ${order.customer.name} · ${order.customer.phone}${order.customer.email ? ` · ${order.customer.email}` : ""}`,
    order.deliveryMethod === "courier"
      ? `Deliver to: ${[order.customer.address, order.customer.town, order.customer.county].filter(Boolean).join(", ")}`
      : "Pickup at the shop",
    order.notes ? `Notes: ${order.notes}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const html =
    `<h2>New ${esc(storeName)} order ${esc(order.ref)}</h2><ul>` +
    items.map((i) => `<li>${esc(i.name)} ×${i.quantity} — ${i.price == null ? "POA" : esc(kes(i.price * i.quantity))}</li>`).join("") +
    `</ul><p><b>Total: ${esc(kes(order.total))}</b> (${esc(order.deliveryMethod)}, ${esc(order.paymentMethod)})</p>` +
    `<p>${esc(order.customer.name)} · ${esc(order.customer.phone)}</p>`;
  return { subject: `New order ${order.ref} — ${kes(order.total)}`, text, html };
}

/**
 * Order alerts. Never throws and never delays checkout: failures are logged and dropped.
 * `transport` is injectable for tests; without SMTP + recipients this is a no-op.
 */
export function createNotifier(config, { transport, log = console } = {}) {
  const { to, smtp, from, storeName } = config.notify;
  const enabled = to.length > 0 && (transport || smtp);
  const mailer = enabled ? (transport ?? nodemailer.createTransport(smtp)) : null;

  return {
    enabled: Boolean(enabled),
    orderPlaced(order) {
      if (!mailer) return;
      const { subject, text, html } = orderEmail(order, storeName);
      Promise.resolve()
        .then(() => mailer.sendMail({ from, to: to.join(", "), subject, text, html }))
        .catch((err) => log.error(`Order alert for ${order.ref} failed: ${err.message}`));
    },
  };
}
