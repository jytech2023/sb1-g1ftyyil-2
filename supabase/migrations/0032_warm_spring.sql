-- Create business_hours table
CREATE TABLE business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
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

-- Create function to check if restaurant is open
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

-- Create function to get next opening time
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
WHERE handle = 'hawi';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_restaurant_open TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_opening TO authenticated;