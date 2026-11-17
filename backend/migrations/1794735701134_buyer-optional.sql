-- Up Migration
ALTER TABLE deals ALTER COLUMN buyer_id DROP NOT NULL;
-- Down Migration
ALTER TABLE deals ALTER COLUMN buyer_id SET NOT NULL;
