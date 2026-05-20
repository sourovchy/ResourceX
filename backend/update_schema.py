import re

with open('../database/schema.sql', 'r') as f:
    schema = f.read()

new_otp_table = """
CREATE TABLE otp_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    otp_hash VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP NULL DEFAULT NULL,
    used_at TIMESTAMP NULL DEFAULT NULL,
    attempt_count INT NOT NULL DEFAULT 0,
    last_sent_at TIMESTAMP NULL DEFAULT NULL,
    version BIGINT DEFAULT 0
);
"""

schema = re.sub(r'CREATE TABLE otp_tokens \(.*?\);', new_otp_table.strip(), schema, flags=re.DOTALL)

with open('../database/schema.sql', 'w') as f:
    f.write(schema)

