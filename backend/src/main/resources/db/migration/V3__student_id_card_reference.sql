-- =========================================================
-- ResourceX — V3: Student ID Card Reference
-- =========================================================

ALTER TABLE student_profiles
    ADD COLUMN id_card_file_id BIGINT NULL,
    ADD INDEX idx_student_profiles_id_card_file_id (id_card_file_id),
    ADD CONSTRAINT fk_student_profiles_id_card
        FOREIGN KEY (id_card_file_id) REFERENCES files(file_id) ON DELETE SET NULL;
