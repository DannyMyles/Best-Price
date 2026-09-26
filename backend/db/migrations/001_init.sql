-- 001: core tables (categories, products, admins, admin_sessions).
-- Prices are whole Kenyan shillings (KES); NULL price = "price on request".

CREATE TABLE IF NOT EXISTS categories (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug         VARCHAR(64)  NOT NULL,
  name         VARCHAR(120) NOT NULL,
  short_name   VARCHAR(60)  NOT NULL,
  description  VARCHAR(500) NOT NULL DEFAULT '',
  icon         VARCHAR(40)  NOT NULL DEFAULT 'package',
  sort_order   INT          NOT NULL DEFAULT 0,
  active       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug             VARCHAR(190) NOT NULL,
  sku              VARCHAR(80)  NOT NULL,
  name             VARCHAR(255) NOT NULL,
  category_id      INT UNSIGNED NOT NULL,
  brand            VARCHAR(80)  NULL,
  price            INT UNSIGNED NULL,
  compare_at_price INT UNSIGNED NULL,
  description      TEXT         NOT NULL,
  specs            JSON         NULL,
  color            VARCHAR(60)  NULL,
  in_stock         TINYINT(1)   NOT NULL DEFAULT 1,
  stock_count      INT UNSIGNED NULL,
  badge            VARCHAR(20)  NULL,
  featured         TINYINT(1)   NOT NULL DEFAULT 0,
  feature_rank     INT          NULL,
  active           TINYINT(1)   NOT NULL DEFAULT 1,
  -- "<category folder>/<item folder>" relative to IMAGES_ROOT, e.g. "01_canon-cameras/R50V Body".
  -- Files inside are "<item folder> - N.jpg"; N = 1 is the primary image.
  image_dir        VARCHAR(255) NULL,
  admin_notes      TEXT         NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_slug (slug),
  UNIQUE KEY uq_products_sku (sku),
  UNIQUE KEY uq_products_image_dir (image_dir),
  KEY ix_products_category (category_id, active),
  KEY ix_products_price (price),
  KEY ix_products_created (created_at),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id)
    REFERENCES categories (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admins (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email          VARCHAR(190) NOT NULL,
  name           VARCHAR(120) NOT NULL,
  password_hash  VARCHAR(100) NOT NULL,
  active         TINYINT(1)   NOT NULL DEFAULT 1,
  last_login_at  DATETIME     NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Server-side sessions: only a SHA-256 of the cookie token is stored, so a DB
-- leak doesn't hand out live sessions, and logout really revokes access.
CREATE TABLE IF NOT EXISTS admin_sessions (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id    INT UNSIGNED    NOT NULL,
  token_hash  CHAR(64)        NOT NULL,
  ip          VARCHAR(64)     NULL,
  user_agent  VARCHAR(255)    NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at  DATETIME        NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sessions_token (token_hash),
  KEY ix_sessions_expires (expires_at),
  CONSTRAINT fk_sessions_admin FOREIGN KEY (admin_id)
    REFERENCES admins (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
