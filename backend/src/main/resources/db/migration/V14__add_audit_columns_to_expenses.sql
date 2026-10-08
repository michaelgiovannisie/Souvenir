-- Add missing BaseEntity audit columns to expenses table
ALTER TABLE expenses
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
