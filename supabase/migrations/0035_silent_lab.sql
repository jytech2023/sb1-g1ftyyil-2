-- Update default daily limit for dishes table
ALTER TABLE dishes 
ALTER COLUMN daily_limit SET DEFAULT 999;

-- Update existing dishes to have 999 daily limit and remaining quantity
UPDATE dishes
SET daily_limit = 999,
    remaining_quantity = 999
WHERE daily_limit = 1000;

-- Update any NULL remaining quantities
UPDATE dishes
SET remaining_quantity = 999
WHERE remaining_quantity IS NULL;