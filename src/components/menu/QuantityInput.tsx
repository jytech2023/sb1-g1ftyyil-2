import React from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { formatNumber } from '../../utils/numberUtils';

interface Props {
  quantity: number;
  maxQuantity: number;
  onChange: (quantity: number) => void;
}

export default function QuantityInput({ quantity, maxQuantity, onChange }: Props) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
    const newQuantity = Math.max(1, Math.min(value, maxQuantity));
    onChange(newQuantity);
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
      <button 
        onClick={() => onChange(Math.max(1, quantity - 1))}
        className="text-orange-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed p-1"
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
      >
        <MinusCircle className="h-5 w-5" />
      </button>
      
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={formatNumber(quantity)}
        onChange={handleInputChange}
        className="w-16 text-center bg-white border rounded py-1 px-2 mx-2 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
        aria-label="Quantity"
      />
      
      <button 
        onClick={() => onChange(Math.min(maxQuantity, quantity + 1))}
        className="text-orange-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed p-1"
        disabled={quantity >= maxQuantity}
        aria-label="Increase quantity"
      >
        <PlusCircle className="h-5 w-5" />
      </button>
    </div>
  );
}