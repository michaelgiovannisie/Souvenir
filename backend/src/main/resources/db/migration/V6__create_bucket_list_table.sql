CREATE TABLE bucket_list_items (
    id               UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    destination_name VARCHAR(200) NOT NULL,
    country          VARCHAR(100) NOT NULL,
    notes            TEXT,
    is_completed     BOOLEAN     NOT NULL DEFAULT FALSE,
    completed_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by       VARCHAR(255),
    updated_by       VARCHAR(255),
    deleted_at       TIMESTAMPTZ
);

CREATE INDEX idx_bucket_list_user_id ON bucket_list_items(user_id);
CREATE INDEX idx_bucket_list_deleted_at ON bucket_list_items(deleted_at) WHERE deleted_at IS NULL;
