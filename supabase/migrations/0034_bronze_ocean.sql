-- Update default daily limit for dishes table
ALTER TABLE dishes 
ALTER COLUMN daily_limit SET DEFAULT 1000;

-- Update existing dishes to have 1000 daily limit and remaining quantity
UPDATE dishes
SET daily_limit = 1000,
    remaining_quantity = 1000
WHERE daily_limit = 50;

-- Update any NULL remaining quantities
UPDATE dishes
SET remaining_quantity = 1000
WHERE remaining_quantity IS NULL;