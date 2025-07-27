CREATE TABLE streamory_events (
    user_id String,
    event String,
    action String,
    properties String,
    created_at DateTime64(6, 'Asia/Kolkata') DEFAULT now64(6),
    timestamp DateTime64(6, 'Asia/Kolkata')
) ENGINE = MergeTree()
ORDER BY (created_at, event, action);
