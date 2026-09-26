-- 006: richer order tracking — a "dispatched" step for courier orders and the
-- courier's details, shown to the customer on the Track Order page.
ALTER TABLE orders
  MODIFY COLUMN status ENUM('pending','confirmed','processing','dispatched','completed','cancelled') NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS courier           VARCHAR(80) NULL AFTER status,
  ADD COLUMN IF NOT EXISTS tracking_number   VARCHAR(80) NULL AFTER courier,
  ADD COLUMN IF NOT EXISTS expected_delivery DATE        NULL AFTER tracking_number;
