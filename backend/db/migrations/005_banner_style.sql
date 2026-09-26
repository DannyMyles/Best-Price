-- 005: B&H-style banner options — layout, per-slide accent colour and a second button.
--   layout 'photo'   = full-bleed lifestyle picture, white copy over a dark scrim
--   layout 'product' = product shot on a white background, shown on a light stage with dark copy
ALTER TABLE banners
  ADD COLUMN IF NOT EXISTS layout      VARCHAR(10) NOT NULL DEFAULT 'photo' AFTER image,
  ADD COLUMN IF NOT EXISTS accent      CHAR(7)     NULL AFTER layout,         -- '#RRGGBB'; primary button + badge colour
  ADD COLUMN IF NOT EXISTS cta2_label  VARCHAR(60)  NULL AFTER cta_href,
  ADD COLUMN IF NOT EXISTS cta2_href   VARCHAR(500) NULL AFTER cta2_label;
