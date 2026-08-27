CREATE TABLE expenses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id     UUID        NOT NULL REFERENCES trips(id),
    amount      DECIMAL(10, 2) NOT NULL,
    currency    VARCHAR(3)  NOT NULL DEFAULT 'USD',
    category    VARCHAR(20) NOT NULL DEFAULT 'OTHER',
    description VARCHAR(200),
    expense_date DATE        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_expenses_trip_id ON expenses(trip_id) WHERE deleted_at IS NULL;
