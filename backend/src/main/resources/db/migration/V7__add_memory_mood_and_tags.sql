-- Add mood column to memories
ALTER TABLE memories
    ADD COLUMN mood VARCHAR(30);

-- Tags stored in a separate table (one row per tag per memory)
CREATE TABLE memory_tags (
    memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    tag       VARCHAR(50) NOT NULL,
    CONSTRAINT memory_tags_pkey PRIMARY KEY (memory_id, tag)
);

CREATE INDEX idx_memory_tags_memory_id ON memory_tags(memory_id);
CREATE INDEX idx_memory_tags_tag ON memory_tags(tag);
