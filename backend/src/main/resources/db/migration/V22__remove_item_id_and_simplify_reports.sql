-- Drop reviews item_id dependencies
ALTER TABLE reviews DROP FOREIGN KEY fk_reviews_item;
ALTER TABLE reviews DROP INDEX idx_reviews_item_id;
ALTER TABLE reviews DROP COLUMN item_id;

-- Drop reports reviewed/status dependencies
ALTER TABLE reports DROP FOREIGN KEY fk_reports_reviewed_by;
ALTER TABLE reports DROP INDEX idx_reports_reviewed_by_user_id;
ALTER TABLE reports DROP INDEX idx_reports_status;
ALTER TABLE reports DROP COLUMN status;
ALTER TABLE reports DROP COLUMN reviewed_by_user_id;
ALTER TABLE reports DROP COLUMN reviewed_at;
