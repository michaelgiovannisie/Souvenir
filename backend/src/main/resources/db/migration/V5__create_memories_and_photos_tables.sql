CREATE TABLE memories (
    id              UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id         UUID        NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    destination_id  UUID        REFERENCES destinations(id) ON DELETE SET NULL,
    title           VARCHAR(200) NOT NULL,
    journal_entry   TEXT,
    memory_date     DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_memories_trip_id ON memories(trip_id);
CREATE INDEX idx_memories_destination_id ON memories(destination_id);
CREATE INDEX idx_memories_deleted_at ON memories(deleted_at) WHERE deleted_at IS NULL;

-- -------------------------------------------------------

CREATE TABLE photos (
    id                  UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id             UUID        NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    memory_id           UUID        REFERENCES memories(id) ON DELETE SET NULL,
    destination_id      UUID        REFERENCES destinations(id) ON DELETE SET NULL,
    cloudinary_url      VARCHAR(500) NOT NULL,
    cloudinary_public_id VARCHAR(255) NOT NULL,
    caption             VARCHAR(300),
    taken_at            TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          VARCHAR(255),
    updated_by          VARCHAR(255),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_photos_trip_id ON photos(trip_id);
CREATE INDEX idx_photos_memory_id ON photos(memory_id);
CREATE INDEX idx_photos_deleted_at ON photos(deleted_at) WHERE deleted_at IS NULL;
