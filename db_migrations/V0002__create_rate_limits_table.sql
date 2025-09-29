CREATE TABLE IF NOT EXISTS rate_limits (
    user_id VARCHAR(255) NOT NULL,
    endpoint VARCHAR(50) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, endpoint)
);

CREATE INDEX idx_rate_limits_window ON rate_limits(window_start);