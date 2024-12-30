-- Add max_order_value column to restaurants
ALTER TABLE restaurants
ADD COLUMN max_order_value decimal(10, 2) DEFAULT 5000.00;

-- Add preparation_hours column to restaurants
ALTER TABLE restaurants
ADD COLUMN preparation_hours integer DEFAULT 48;

-- Update check_order_total function to use restaurant-specific limit
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
  -- Get restaurant ID from first item
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

-- Update submit_order function to use new check_order_total
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
GRANT EXECUTE ON FUNCTION check_order_total TO authenticated;