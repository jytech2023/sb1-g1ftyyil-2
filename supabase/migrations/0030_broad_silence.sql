-- Add function to check order total against maximum limit
CREATE OR REPLACE FUNCTION check_order_total(p_items jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total decimal;
  v_max_order_value decimal := 5000.00;  -- Maximum order value
BEGIN
  -- Calculate total from items
  SELECT COALESCE(SUM((item->>'quantity')::integer * (item->>'price')::decimal), 0)
  INTO v_total
  FROM jsonb_array_elements(p_items) AS item;

  -- Check if total exceeds maximum
  RETURN v_total <= v_max_order_value;
END;
$$;

-- Update submit_order function to include maximum order check
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
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_available boolean;
  v_restaurant_id uuid;
  v_restaurant_address text;
BEGIN
  -- Check maximum order value
  IF NOT check_order_total(p_items) THEN
    RAISE EXCEPTION 'Order total exceeds maximum limit of $5,000';
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

  RETURN v_order_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_order_total TO authenticated;