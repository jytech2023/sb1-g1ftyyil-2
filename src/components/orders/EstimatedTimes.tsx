import React from 'react';
import { Clock, Package } from 'lucide-react';
import { formatPacificTime } from '../../utils/dateUtils';

interface Props {
  pickupTime?: string;
  deliveryTime?: string;
}

export default function EstimatedTimes({ pickupTime, deliveryTime }: Props) {
  if (!pickupTime && !deliveryTime) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
      {pickupTime && (
        <div className="flex items-start gap-2">
          <Package className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-orange-900">Estimated Pickup Time</p>
            <p className="text-orange-800">
              {formatPacificTime(pickupTime)} PT
            </p>
            <p className="text-sm text-orange-700 mt-1">
              Please arrive at the restaurant to pick up your order
            </p>
          </div>
        </div>
      )}

      {deliveryTime && (
        <div className="flex items-start gap-2">
          <Clock className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-orange-900">Estimated Arrival Time</p>
            <p className="text-orange-800">
              {formatPacificTime(deliveryTime)} PT
            </p>
            <p className="text-sm text-orange-700 mt-1">
              Expected time of arrival at the delivery address
            </p>
          </div>
        </div>
      )}
    </div>
  );
}