import React from 'react';
import { AlertCircle, PhoneCall } from 'lucide-react';

interface Props {
  src: string | undefined;
  alt: string;
  isOutOfStock?: boolean;
  isNearLimit?: boolean;
  remainingQuantity?: number;
  showDailyLimitNotice?: boolean;
}

export default function MenuItemImage({ 
  src, 
  alt, 
  isOutOfStock,
  isNearLimit,
  remainingQuantity,
  showDailyLimitNotice
}: Props) {
  const defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="relative h-48">
      <img 
        src={src || defaultImage} 
        alt={alt}
        className="w-full h-full object-cover rounded-t-lg"
      />
      
      {isOutOfStock && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <span className="text-white font-bold text-lg">Sold Out</span>
        </div>
      )}

      {!isOutOfStock && (
        <>
          {isNearLimit && (
            <div className="absolute top-2 right-2">
              <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-lg">
                <AlertCircle className="h-4 w-4" />
                <span>Only {remainingQuantity} left</span>
              </div>
            </div>
          )}

          {showDailyLimitNotice && (
            <div className="absolute inset-x-0 bottom-0">
              <div className="absolute inset-0 bg-black/60" />
              <div className="relative px-3 py-2 flex items-center gap-2">
                <PhoneCall className="h-4 w-4 flex-shrink-0 text-orange-400" />
                <p className="text-sm font-medium text-white">
                  Need more? Contact restaurant for special arrangements
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}