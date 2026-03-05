-- Store file content directly in Postgres instead of on local disk.
-- file_data holds the raw binary; file_path is kept nullable for any
-- legacy rows that might still reference a disk path.

ALTER TABLE attachments ADD COLUMN IF NOT EXISTS file_data BYTEA;
ALTER TABLE attachments ALTER COLUMN file_path DROP NOT NULL;
