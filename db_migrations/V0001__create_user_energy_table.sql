CREATE TABLE IF NOT EXISTS user_energy (
    user_id VARCHAR(255) PRIMARY KEY,
    energy INTEGER NOT NULL DEFAULT 0,
    last_collection_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_energy_date ON user_energy(last_collection_date);