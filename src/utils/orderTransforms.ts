import type { Order, OrderItem } from '../types/order';

interface RawOrderData {
  order_id: string;
  customer_id: string | null;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_address_from: string;
  restaurant_id: string;
  status: Order['status'];
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_address: string;
  created_at: string;
  updated_at: string;
  arrival_time: string;
  order_items: Array<{
    id: string;
    dish_id: string;
    quantity: number;
    price_at_time: number;
    dishes: {
      dish_name: string;
    };
  }>;
}

export function transformOrderData(data: RawOrderData): Order {
  const items: OrderItem[] = data.order_items.map(item => ({
    id: item.id,
    dish_id: item.dish_id,
    quantity: item.quantity,
    price_at_time: item.price_at_time,
    dish_name: item.dishes.dish_name
  }));

  // Calculate pickup time (30 minutes before arrival)
  const pickupTime = data.arrival_time ? 
    new Date(new Date(data.arrival_time).getTime() - 30 * 60000).toISOString() : 
    undefined;

  return {
    order_id: data.order_id,
    customer_id: data.customer_id,
    delivery_name: data.delivery_name,
    delivery_phone: data.delivery_phone,
    delivery_address: data.delivery_address,
    delivery_address_from: data.delivery_address_from,
    restaurant_id: data.restaurant_id,
    status: data.status,
    contact_person_name: data.contact_person_name,
    contact_person_phone: data.contact_person_phone,
    contact_person_address: data.contact_person_address,
    created_at: data.created_at,
    updated_at: data.updated_at,
    pickup_time: pickupTime,
    estimated_delivery_time: data.arrival_time,
    items
  };
}