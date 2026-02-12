-- Migration: Add notes field to sales table
-- Date: 2026-02-12
-- Description: Add a notes field to store observations about the appointment/sale

-- Add notes column to sales table
ALTER TABLE sales ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment to document the column
COMMENT ON COLUMN sales.notes IS 'Observações sobre o atendimento (máximo 500 caracteres)';
