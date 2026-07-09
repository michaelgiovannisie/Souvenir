CREATE TYPE destination_type AS ENUM (
    'CITY', 'COUNTRY', 'NATIONAL_PARK', 'LANDMARK', 'BEACH', 'MOUNTAIN', 'OTHER'
);

CREATE TABLE destinations (
    id              UUID             NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id         UUID             NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    name            VARCHAR(200)     NOT NULL,
    country         VARCHAR(100)     NOT NULL,
    state_province  VARCHAR(100),
    city            VARCHAR(100),
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    type            destination_type NOT NULL DEFAULT 'CITY',
    arrival_date    DATE,
    departure_date  DATE,
    notes           TEXT,
    rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
    created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_destinations_trip_id ON destinations(trip_id);
CREATE INDEX idx_destinations_country ON destinations(country);
CREATE INDEX idx_destinations_deleted_at ON destinations(deleted_at) WHERE deleted_at IS NULL;
