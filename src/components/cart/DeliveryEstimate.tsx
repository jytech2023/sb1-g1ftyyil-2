import React from 'react';
import { Clock } from 'lucide-react';

interface Props {
  preparationHours: number;
}

export default function DeliveryEstimate({ preparationHours }: Props) {
  const estimatedDelivery = new Date();
  estimatedDelivery.setHours(estimatedDelivery.getHours() + preparationHours);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2 text-orange-800">
        <Clock className="h-5 w-5" />
        <h3 className="font-medium">Estimated Delivery Time</h3>
      </div>
      <p className="text-orange-900 font-medium">
        {formatDate(estimatedDelivery)}
      </p>
      <p className="text-sm text-orange-700">
        Please note that this is an estimated time and may vary based on order volume and other factors.
      </p>
    </div>
  );
}