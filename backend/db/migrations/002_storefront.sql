-- 002: everything the storefront + admin needed from the old cloud database:
-- display ratings, orders (+ line items), reviews, homepage banners.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS rating       DECIMAL(2,1)  NULL,
  ADD COLUMN IF NOT EXISTS review_count INT UNSIGNED  NULL;

CREATE TABLE IF NOT EXISTS orders (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ref             VARCHAR(16)  NOT NULL,            -- customer-facing, e.g. "PH-K7Q2XM"
  customer_name   VARCHAR(120) NOT NULL,
  customer_phone  VARCHAR(30)  NOT NULL,
  phone_key       CHAR(9)      NOT NULL,            -- last 9 digits, used to match on tracking
  customer_email  VARCHAR(190) NULL,
  customer_address VARCHAR(300) NOT NULL,
  county          VARCHAR(60)  NULL,
  town            VARCHAR(80)  NULL,
  delivery_method ENUM('pickup','courier') NOT NULL DEFAULT 'pickup',
  delivery_fee    INT UNSIGNED NOT NULL DEFAULT 0,
  subtotal        INT UNSIGNED NOT NULL,
  total           INT UNSIGNED NOT NULL,
  notes           VARCHAR(1000) NULL,
  payment_method  ENUM('mpesa','cod','bank') NOT NULL,
  payment_status  ENUM('pending','paid','failed') NOT NULL DEFAULT 'pending',
  mpesa_code      VARCHAR(20)  NULL,
  mpesa_name      VARCHAR(120) NULL,
  status          ENUM('pending','confirmed','processing','completed','cancelled') NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_ref (ref),
  KEY ix_orders_status_created (status, created_at),
  KEY ix_orders_created (created_at),
  KEY ix_orders_phone_key (phone_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id         INT UNSIGNED NOT NULL,
  product_id       INT UNSIGNED NULL,               -- kept if the product is later deleted
  sku              VARCHAR(80)  NOT NULL,
  slug             VARCHAR(190) NOT NULL,
  name             VARCHAR(255) NOT NULL,
  color            VARCHAR(60)  NULL,
  unit_price       INT UNSIGNED NULL,               -- price at the time of the order; NULL = price on request
  quantity         INT UNSIGNED NOT NULL,
  stock_decremented TINYINT(1)  NOT NULL DEFAULT 0, -- so a cancel only restores what was taken
  PRIMARY KEY (id),
  KEY ix_order_items_order (order_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id     INT UNSIGNED NOT NULL,
  customer_name  VARCHAR(80)  NOT NULL,
  rating         TINYINT UNSIGNED NOT NULL,
  comment        VARCHAR(2000) NOT NULL,
  approved       TINYINT(1)   NOT NULL DEFAULT 0,   -- reviews are held until an admin approves them
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_reviews_product (product_id, approved, created_at),
  KEY ix_reviews_approved (approved, created_at),
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT ck_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS banners (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  eyebrow       VARCHAR(120)  NULL,
  headline      VARCHAR(200)  NOT NULL,
  subcopy       VARCHAR(400)  NULL,
  image         VARCHAR(1000) NOT NULL,             -- an http(s) URL or a site-relative path
  badge         VARCHAR(40)   NULL,
  cta_label     VARCHAR(60)   NULL,
  cta_href      VARCHAR(500)  NULL,
  deal_ends_at  DATETIME      NULL,                 -- UTC; shows a live countdown while in the future
  active        TINYINT(1)    NOT NULL DEFAULT 1,
  sort_order    INT           NOT NULL DEFAULT 0,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_banners_active_order (active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
