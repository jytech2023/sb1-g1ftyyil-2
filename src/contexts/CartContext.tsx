import React, { createContext, useContext, useReducer } from 'react';
import type { MenuItem } from '../types/menu';

interface CartItem extends MenuItem {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: MenuItem; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { dishId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, quantity } = action.payload;
      const existingItem = state.items.find(i => i.dish_id === item.dish_id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        return {
          ...state,
          items: state.items.map(i =>
            i.dish_id === item.dish_id
              ? { ...i, quantity: newQuantity }
              : i
          ),
          total: state.total + (item.price * quantity)
        };
      }

      return {
        ...state,
        items: [...state.items, { ...item, quantity }],
        total: state.total + (item.price * quantity)
      };
    }

    case 'UPDATE_QUANTITY': {
      const { dishId, quantity } = action.payload;
      const item = state.items.find(i => i.dish_id === dishId);
      if (!item) return state;

      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(i => i.dish_id !== dishId),
          total: state.total - (item.price * item.quantity)
        };
      }

      const quantityDiff = quantity - item.quantity;
      return {
        ...state,
        items: state.items.map(i =>
          i.dish_id === dishId
            ? { ...i, quantity }
            : i
        ),
        total: state.total + (item.price * quantityDiff)
      };
    }

    case 'REMOVE_ITEM': {
      const item = state.items.find(i => i.dish_id === action.payload);
      if (!item) return state;

      return {
        ...state,
        items: state.items.filter(i => i.dish_id !== action.payload),
        total: state.total - (item.price * item.quantity)
      };
    }

    case 'CLEAR_CART':
      return { items: [], total: 0 };

    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}