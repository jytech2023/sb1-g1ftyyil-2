import React, { useState } from 'react';
import type { MenuItem as MenuItemType } from '../../types/menu';
import { useCart } from '../../contexts/CartContext';
import QuantityInput from './QuantityInput';
import MenuItemImage from './MenuItemImage';
import MenuItemHeader from './MenuItemHeader';
import AddToCartButton from './AddToCartButton';
import { useQuantityLimits } from '../../hooks/useQuantityLimits';

interface Props {
  item: MenuItemType;
}

export default function MenuItem({ item }: Props) {
  const { state, dispatch } = useCart();
  const [quantity, setQuantity] = useState(1);
  const { 
    isOutOfStock,
    remainingQuantity,
    isNearLimit,
    availableQuantity,
    cartQuantity
  } = useQuantityLimits(item, state);
  
  const handleAddToCart = () => {
    if (quantity > 0 && quantity <= availableQuantity) {
      dispatch({ 
        type: 'ADD_ITEM', 
        payload: { 
          item,
          quantity 
        } 
      });
      setQuantity(1);
    }
  };

  const showDailyLimitNotice = isNearLimit || cartQuantity === remainingQuantity;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <MenuItemImage 
        src={item.picture}
        alt={item.dish_name}
        isOutOfStock={isOutOfStock}
        isNearLimit={isNearLimit}
        remainingQuantity={remainingQuantity}
        showDailyLimitNotice={showDailyLimitNotice}
      />
      
      <div className="p-4 space-y-4">
        <MenuItemHeader
          name={item.dish_name}
          description={item.description}
          price={item.price}
          remainingQuantity={remainingQuantity}
          isOutOfStock={isOutOfStock}
          isNearLimit={isNearLimit}
          cartQuantity={cartQuantity}
        />
        
        {!isOutOfStock && (
          <div className="space-y-3">
            <QuantityInput
              quantity={quantity}
              maxQuantity={availableQuantity}
              onChange={setQuantity}
            />
            
            <AddToCartButton
              quantity={quantity}
              onClick={handleAddToCart}
              disabled={quantity < 1 || quantity > availableQuantity}
            />
          </div>
        )}

        {item.flags?.category && (
          <div className="pt-2 border-t">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {item.flags.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}