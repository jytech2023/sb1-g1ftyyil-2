/*
  # Add arrival time to orders

  1. Changes
    - Add arrival_time column to orders table
    - Update submit_order function to handle arrival time
    - Add function to calculate estimated pickup time

  2. Notes
    - arrival_time is when the customer wants their order delivered
    - pickup_time is automatically calculated as 30 minutes before arrival_time
*/

-- Add arrival_time column to orders table
ALTER TABLE orders
ADD COLUMN arrival_time timestamptz;

-- Function to calculate pickup time (30 mins before arrival)
CREATE OR REPLACE FUNCTION calculate_pickup_time(arrival timestamptz)
RETURNS timestamptz
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT arrival - interval '30 minutes'
$$;

-- Update submit_order function to include arrival_time
CREATE OR REPLACE FUNCTION submit_order(
  p_customer_id uuid,
  p_delivery_name text,
  p_delivery_phone text,
  p_delivery_address text,
  p_contact_person_name text,
  p_contact_person_phone text,
  p_contact_person_address text,
  p_arrival_time timestamptz,
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
  -- Check order total and get preparation time
  v_order_check := check_order_total(p_items);
  
  IF NOT (v_order_check->>'is_valid')::boolean THEN
    RAISE EXCEPTION 'Order total exceeds maximum limit of $%', (v_order_check->>'max_value')::decimal;
  END IF;

  -- Get the restaurant ID and address from the first item
  SELECT r.id, r.address
  INTO v_restaurant_id, v_restaurant_address
  FROM restaurants r
  JOIN dishes d ON d.restaurant_id = r.id
  WHERE d.dish_id = (p_items->0->>'dish_id')::uuid;

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
    arrival_time,
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
    p_arrival_time,
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
    'preparation_hours', (v_order_check->>'preparation_hours')::integer,
    'pickup_time', calculate_pickup_time(p_arrival_time)
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_pickup_time TO authenticated;