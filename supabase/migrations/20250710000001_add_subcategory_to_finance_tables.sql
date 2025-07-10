-- Migration: Add subcategory field to transactions and debts tables
-- Date: 2025-07-10
-- Description: Add subcategory field to support 'fixed' and 'variable' categorization

-- Add subcategory column to transactions table
ALTER TABLE transactions 
ADD COLUMN subcategory TEXT CHECK (subcategory IN ('fixed', 'variable'));

-- Add subcategory column to debts table
ALTER TABLE debts 
ADD COLUMN subcategory TEXT CHECK (subcategory IN ('fixed', 'variable'));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS transactions_subcategory_idx ON transactions(subcategory);
CREATE INDEX IF NOT EXISTS debts_subcategory_idx ON debts(subcategory);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS transactions_category_subcategory_idx ON transactions(category, subcategory);
CREATE INDEX IF NOT EXISTS debts_priority_subcategory_idx ON debts(priority, subcategory);

-- Update updated_at timestamp for both tables to reflect schema changes
-- This is optional but helps with tracking when schema changes were applied
UPDATE transactions SET updated_at = NOW() WHERE updated_at IS NOT NULL;
UPDATE debts SET updated_at = NOW() WHERE updated_at IS NOT NULL;