export type OrderStatus = 
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  dish_id: string;
  quantity: number;
  price_at_time: number;
  dish_name: string;
}

export interface Order {
  order_id: string;
  customer_id?: string | null;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_address_from: string;
  restaurant_id: string;
  status: OrderStatus;
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_address: string;
  created_at: string;
  updated_at: string;
  pickup_time?: string;
  estimated_delivery_time?: string;
  items: OrderItem[];
}