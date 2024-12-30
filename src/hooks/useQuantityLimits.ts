import { useMemo } from 'react';
import type { MenuItem } from '../types/menu';
import type { CartState } from '../contexts/CartContext';

export function useQuantityLimits(item: MenuItem, cartState: CartState) {
  return useMemo(() => {
    const cartItem = cartState.items.find(i => i.dish_id === item.dish_id);
    const cartQuantity = cartItem?.quantity || 0;
    
    const remainingQuantity = item.remaining_quantity ?? item.daily_limit;
    const isOutOfStock = remainingQuantity === 0;
    const isNearLimit = remainingQuantity <= 5 && remainingQuantity > 0;
    const availableQuantity = Math.max(0, remainingQuantity - cartQuantity);

    return {
      isOutOfStock,
      remainingQuantity,
      isNearLimit,
      availableQuantity,
      cartQuantity
    };
  }, [item, cartState.items]);
}