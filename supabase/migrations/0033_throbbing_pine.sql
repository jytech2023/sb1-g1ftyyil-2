/*
  # Business Hours and Order Value Features

  1. Changes
    - Add max_order_value column to restaurants
    - Add preparation_hours column to restaurants
    - Create business_hours table
    - Add functions for checking restaurant open status
    - Add functions for order value validation

  2. Tables
    - business_hours
      - id (uuid, primary key)
      - restaurant_id (uuid, references restaurants)
      - day_of_week (0-6, 0=Sunday)
      - open_time (time)
      - close_time (time)
      - is_closed (boolean)

  3. Functions
    - is_restaurant_open()
    - get_next_opening()
    - check_order_total()
    - submit_order() (updated)
*/

-- Create business_hours table
CREATE TABLE IF NOT EXISTS business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time time NOT NULL,
  close_time time NOT NULL,
  is_closed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (restaurant_id, day_of_week)
);

-- Enable RLS
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view business hours"
  ON business_hours
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Restaurant managers can manage business hours"
  ON business_hours
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE user_id = auth.uid()
      AND role = 'restaurant_manager'
    )
  );

-- Add columns to restaurants
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS max_order_value decimal(10, 2) DEFAULT 5000.00,
ADD COLUMN IF NOT EXISTS preparation_hours integer DEFAULT 48;

-- Function to check if restaurant is open
CREATE OR REPLACE FUNCTION is_restaurant_open(
  p_restaurant_id uuid,
  p_timestamp timestamptz DEFAULT CURRENT_TIMESTAMP
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_day_of_week smallint;
  v_current_time time;
  v_is_open boolean;
BEGIN
  -- Get current day and time in Pacific timezone
  SELECT 
    EXTRACT(DOW FROM p_timestamp AT TIME ZONE 'America/Los_Angeles')::smallint,
    (p_timestamp AT TIME ZONE 'America/Los_Angeles')::time
  INTO v_day_of_week, v_current_time;

  -- Check if restaurant is open
  SELECT 
    EXISTS (
      SELECT 1
      FROM business_hours
      WHERE restaurant_id = p_restaurant_id
        AND day_of_week = v_day_of_week
        AND NOT is_closed
        AND v_current_time BETWEEN open_time AND close_time
    )
  INTO v_is_open;

  RETURN v_is_open;
END;
$$;

-- Function to get next opening time
CREATE OR REPLACE FUNCTION get_next_opening(
  p_restaurant_id uuid,
  p_timestamp timestamptz DEFAULT CURRENT_TIMESTAMP
)
RETURNS timestamptz
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_next_opening timestamptz;
  v_current_pacific timestamp;
  v_day_of_week smallint;
BEGIN
  -- Get current time in Pacific timezone
  v_current_pacific := p_timestamp AT TIME ZONE 'America/Los_Angeles';
  v_day_of_week := EXTRACT(DOW FROM v_current_pacific)::smallint;

  -- Find next opening time
  WITH next_slots AS (
    -- Check remaining slots today
    SELECT 
      v_current_pacific::date + open_time AS opening,
      day_of_week
    FROM business_hours
    WHERE restaurant_id = p_restaurant_id
      AND day_of_week = v_day_of_week
      AND NOT is_closed
      AND open_time > v_current_pacific::time
    
    UNION ALL
    
    -- Check future days
    SELECT 
      v_current_pacific::date + 
      ((day_of_week - v_day_of_week + CASE WHEN day_of_week <= v_day_of_week THEN 7 ELSE 0 END) || ' days')::interval + 
      open_time AS opening,
      day_of_week
    FROM business_hours
    WHERE restaurant_id = p_restaurant_id
      AND NOT is_closed
      AND (day_of_week > v_day_of_week OR day_of_week <= v_day_of_week)
  )
  SELECT opening AT TIME ZONE 'America/Los_Angeles'
  INTO v_next_opening
  FROM next_slots
  ORDER BY opening
  LIMIT 1;

  RETURN v_next_opening;
END;
$$;

-- Function to check order total and get preparation time
CREATE OR REPLACE FUNCTION check_order_total(p_items jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total decimal;
  v_restaurant_id uuid;
  v_max_order_value decimal;
  v_preparation_hours integer;
BEGIN
  -- Get restaurant ID and limits from first item
  SELECT r.id, r.max_order_value, r.preparation_hours
  INTO v_restaurant_id, v_max_order_value, v_preparation_hours
  FROM restaurants r
  JOIN dishes d ON d.restaurant_id = r.id
  WHERE d.dish_id = (p_items->0->>'dish_id')::uuid;

  -- Calculate total from items
  SELECT COALESCE(SUM((item->>'quantity')::integer * (item->>'price')::decimal), 0)
  INTO v_total
  FROM jsonb_array_elements(p_items) AS item;

  -- Return result as JSON
  RETURN jsonb_build_object(
    'is_valid', v_total <= v_max_order_value,
    'total', v_total,
    'max_value', v_max_order_value,
    'preparation_hours', 
    CASE 
      WHEN v_total > (v_max_order_value * 0.7) THEN v_preparation_hours
      ELSE 24
    END
  );
END;
$$;

-- Update submit_order function
CREATE OR REPLACE FUNCTION submit_order(
  p_customer_id uuid,
  p_delivery_name text,
  p_delivery_phone text,
  p_delivery_address text,
  p_contact_person_name text,
  p_contact_person_phone text,
  p_contact_person_address text,
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_available boolean;
  v_restaurant_id uuid;
  v_restaurant_address text;
  v_order_check jsonb;
BEGIN
  -- Check if restaurant is open
  SELECT r.id, r.address
  INTO v_restaurant_id, v_restaurant_address
  FROM restaurants r
  JOIN dishes d ON d.restaurant_id = r.id
  WHERE d.dish_id = (p_items->0->>'dish_id')::uuid;

  IF NOT is_restaurant_open(v_restaurant_id) THEN
    RAISE EXCEPTION 'Restaurant is currently closed';
  END IF;

  -- Check order total and get preparation time
  v_order_check := check_order_total(p_items);
  
  IF NOT (v_order_check->>'is_valid')::boolean THEN
    RAISE EXCEPTION 'Order total exceeds maximum limit of $%', (v_order_check->>'max_value')::decimal;
  END IF;

  -- Create the order
  INSERT INTO orders (
    customer_id,
    delivery_name,
    delivery_phone,
    delivery_address,
    delivery_address_from,
    restaurant_id,
    contact_person_name,
    contact_person_phone,
    contact_person_address,
    status
  ) VALUES (
    p_customer_id,
    p_delivery_name,
    p_delivery_phone,
    p_delivery_address,
    v_restaurant_address,
    v_restaurant_id,
    p_contact_person_name,
    p_contact_person_phone,
    p_contact_person_address,
    'pending'
  ) RETURNING order_id INTO v_order_id;

  -- Process each item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Check and update dish quantity
    SELECT check_and_update_dish_quantity(
      (v_item->>'dish_id')::uuid,
      (v_item->>'quantity')::integer
    ) INTO v_available;

    IF NOT v_available THEN
      RAISE EXCEPTION 'Insufficient quantity for dish %', (v_item->>'dish_id');
    END IF;

    -- Insert order item
    INSERT INTO order_items (
      order_id,
      dish_id,
      quantity,
      price_at_time
    ) VALUES (
      v_order_id,
      (v_item->>'dish_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'price')::decimal
    );
  END LOOP;

  -- Return order details
  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'preparation_hours', (v_order_check->>'preparation_hours')::integer
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_restaurant_open TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_opening TO authenticated;
GRANT EXECUTE ON FUNCTION check_order_total TO authenticated;

-- Insert sample business hours for Hawi
INSERT INTO business_hours (restaurant_id, day_of_week, open_time, close_time)
SELECT 
  id as restaurant_id,
  day_of_week,
  open_time::time,
  close_time::time
FROM restaurants
CROSS JOIN (
  VALUES 
    (0, '11:00', '21:00'),  -- Sunday
    (1, '10:30', '21:00'),  -- Monday
    (2, '10:30', '21:00'),  -- Tuesday
    (3, '10:30', '21:00'),  -- Wednesday
    (4, '10:30', '21:00'),  -- Thursday
    (5, '10:30', '21:30'),  -- Friday
    (6, '10:30', '21:30')   -- Saturday
) AS hours(day_of_week, open_time, close_time)
WHERE handle = 'hawi'
ON CONFLICT (restaurant_id, day_of_week) DO NOTHING;