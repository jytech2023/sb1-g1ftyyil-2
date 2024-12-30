import { supabase } from '../lib/supabase';
import { transformOrderData } from '../utils/orderTransforms';
import type { Order } from '../types/order';

export interface CreateOrderData {
  items: Array<{
    dish_id: string;
    quantity: number;
    price: number;
  }>;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_address: string;
  arrival_time: string;
}

export interface OrderResponse {
  order_id: string;
  preparation_hours: number;
}

export async function createOrder(orderData: CreateOrderData): Promise<OrderResponse> {
  try {
    const { data, error } = await supabase.rpc('submit_order', {
      p_customer_id: null,
      p_delivery_name: orderData.delivery_name,
      p_delivery_phone: orderData.delivery_phone,
      p_delivery_address: orderData.delivery_address,
      p_contact_person_name: orderData.contact_person_name,
      p_contact_person_phone: orderData.contact_person_phone,
      p_contact_person_address: orderData.contact_person_address,
      p_arrival_time: orderData.arrival_time,
      p_items: orderData.items
    });

    if (error) throw error;
    if (!data) throw new Error('No response from server');

    return {
      order_id: data.order_id,
      preparation_hours: data.preparation_hours
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error instanceof Error ? error : new Error('Failed to create order');
  }
}

export async function getOrderById(orderId: string): Promise<Order> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(
          id,
          dish_id,
          quantity,
          price_at_time,
          dishes:dishes(dish_name)
        )
      `)
      .eq('order_id', orderId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Order not found');

    return transformOrderData(data);
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch order');
  }
}

export async function getCustomerOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(
          id,
          dish_id,
          quantity,
          price_at_time,
          dishes:dishes(dish_name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map(transformOrderData);
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch orders');
  }
}