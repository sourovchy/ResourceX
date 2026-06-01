ALTER TABLE conversations
ADD COLUMN participant_one_cleared_at TIMESTAMP NULL,
ADD COLUMN participant_two_cleared_at TIMESTAMP NULL,
ADD COLUMN participant_one_deleted BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN participant_two_deleted BOOLEAN NOT NULL DEFAULT FALSE;
