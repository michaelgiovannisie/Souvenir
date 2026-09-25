CREATE TABLE trip_mementos (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id     UUID         NOT NULL REFERENCES trips(id),
    type        VARCHAR(20)  NOT NULL,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    location    VARCHAR(200),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_by  VARCHAR(255),
    updated_by  VARCHAR(255),
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX trip_mementos_trip_id_idx ON trip_mementos(trip_id) WHERE deleted_at IS NULL;
