export interface BusinessHours {
  id: string;
  restaurant_id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  website?: string;
  phone?: string;
  address?: string;
  handle: string;
  created_at: string;
  updated_at?: string;
  image?: string;
  max_order_value: number;
  preparation_hours: number;
  is_open?: boolean;
  next_opening?: string;
  business_hours?: BusinessHours[];
}