import { supabase } from '../lib/supabase';
import type { Restaurant, BusinessHours } from '../types/restaurant';

export async function getRestaurants(): Promise<Restaurant[]> {
  const { data: restaurants, error: restaurantsError } = await supabase
    .from('restaurants')
    .select('*')
    .order('name');

  if (restaurantsError) throw restaurantsError;

  // Get open status for each restaurant
  const restaurantsWithStatus = await Promise.all(
    restaurants.map(async (restaurant) => {
      const { data: isOpen } = await supabase
        .rpc('is_restaurant_open', { p_restaurant_id: restaurant.id });

      const { data: nextOpening } = await supabase
        .rpc('get_next_opening', { p_restaurant_id: restaurant.id });

      return {
        ...restaurant,
        is_open: isOpen,
        next_opening: nextOpening
      };
    })
  );

  return restaurantsWithStatus;
}

export async function getRestaurantByHandle(handle: string): Promise<Restaurant | null> {
  // Get restaurant details
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('handle', handle)
    .single();

  if (restaurantError) throw restaurantError;
  if (!restaurant) return null;

  // Get business hours
  const { data: businessHours, error: hoursError } = await supabase
    .from('business_hours')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('day_of_week');

  if (hoursError) throw hoursError;

  // Get open status
  const { data: isOpen } = await supabase
    .rpc('is_restaurant_open', { p_restaurant_id: restaurant.id });

  // Get next opening time if closed
  const { data: nextOpening } = await supabase
    .rpc('get_next_opening', { p_restaurant_id: restaurant.id });

  return {
    ...restaurant,
    business_hours: businessHours,
    is_open: isOpen,
    next_opening: nextOpening
  };
}