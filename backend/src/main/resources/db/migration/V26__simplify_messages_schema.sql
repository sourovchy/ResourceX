-- Drop receiver_user_id and read_at columns from messages table
ALTER TABLE messages DROP FOREIGN KEY fk_messages_receiver;
ALTER TABLE messages DROP INDEX idx_messages_receiver_user_id;
ALTER TABLE messages DROP COLUMN receiver_user_id;
ALTER TABLE messages DROP COLUMN read_at;
