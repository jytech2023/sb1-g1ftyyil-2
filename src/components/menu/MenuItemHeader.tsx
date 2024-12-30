import React from 'react';

interface Props {
  name: string;
  description?: string;
  price: number;
  remainingQuantity: number;
  isOutOfStock: boolean;
  isNearLimit: boolean;
  cartQuantity: number;
}

export default function MenuItemHeader({
  name,
  description,
  price,
  remainingQuantity,
  isOutOfStock,
  isNearLimit,
  cartQuantity
}: Props) {
  return (
    <div className="space-y-2 min-h-[120px] flex flex-col">
      <h3 className="text-lg font-semibold">{name}</h3>
      {description && (
        <p className="text-gray-600 text-sm flex-grow line-clamp-2">{description}</p>
      )}
      
      <div className="flex items-end justify-between mt-auto">
        <span className="text-lg font-bold">${price.toFixed(2)}</span>
        {!isOutOfStock && (
          <div className="text-sm text-right">
            <div className={`${isNearLimit ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
              Available: {remainingQuantity - cartQuantity}
            </div>
            {cartQuantity > 0 && (
              <div className="text-orange-500 font-medium">
                {cartQuantity} in cart
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}