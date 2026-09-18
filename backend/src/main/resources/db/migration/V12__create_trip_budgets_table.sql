CREATE TABLE trip_budgets (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id     UUID        NOT NULL REFERENCES trips(id),
    category    VARCHAR(20) NOT NULL,
    amount      DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency    VARCHAR(3)  NOT NULL DEFAULT 'USD',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by  VARCHAR(255),
    updated_by  VARCHAR(255),
    deleted_at  TIMESTAMPTZ
);

CREATE UNIQUE INDEX trip_budgets_trip_category_idx
    ON trip_budgets(trip_id, category)
    WHERE deleted_at IS NULL;

CREATE INDEX trip_budgets_trip_id_idx ON trip_budgets(trip_id) WHERE deleted_at IS NULL;
