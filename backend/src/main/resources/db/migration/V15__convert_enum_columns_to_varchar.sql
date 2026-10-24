-- Convert native PostgreSQL enum types to VARCHAR so Hibernate can bind them correctly.
-- Hibernate 6 with @Enumerated(EnumType.STRING) binds as character varying, not as the native enum type.

ALTER TABLE trips
    ALTER COLUMN status TYPE VARCHAR(50) USING status::text;

ALTER TABLE destinations
    ALTER COLUMN type TYPE VARCHAR(50) USING type::text;

DROP TYPE IF EXISTS trip_status CASCADE;
DROP TYPE IF EXISTS destination_type CASCADE;
