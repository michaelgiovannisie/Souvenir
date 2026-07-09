CREATE TYPE trip_status AS ENUM ('PLANNED', 'ONGOING', 'COMPLETED');

CREATE TABLE trips (
    id                  UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id             UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    start_date          DATE,
    end_date            DATE,
    cover_photo_url     VARCHAR(500),
    cover_photo_public_id VARCHAR(255),
    status              trip_status  NOT NULL DEFAULT 'PLANNED',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by          VARCHAR(255),
    updated_by          VARCHAR(255),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_deleted_at ON trips(deleted_at) WHERE deleted_at IS NULL;
