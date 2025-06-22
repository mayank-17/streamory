CREATE TABLE IF NOT EXISTS streamory_events (
    user_id String,
    event String,
    properties String,
    created_at DateTime
) ENGINE = MergeTree()
ORDER BY (created_at, event);
