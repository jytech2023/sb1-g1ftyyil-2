import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface Props {
  quantity: number;
  onClick: () => void;
  disabled: boolean;
}

export default function AddToCartButton({ quantity, onClick, disabled }: Props) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition w-full disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={disabled}
    >
      <ShoppingCart className="h-5 w-5" />
      <span>Add {quantity} to Order</span>
    </button>
  );
}