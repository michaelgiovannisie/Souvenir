CREATE TABLE packing_items (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id         UUID         NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    category        VARCHAR(20),
    quantity        INTEGER      NOT NULL DEFAULT 1,
    is_packed       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_packing_items_trip_id ON packing_items(trip_id);
