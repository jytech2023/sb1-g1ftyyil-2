import React from 'react';
import { CheckCircle2, Clock, Package, Truck } from 'lucide-react';
import TimelineStep from './TimelineStep';
import { formatPacificTime } from '../../utils/dateUtils';
import type { OrderStatus } from '../../types/order';

const TIMELINE_STEPS = [
  { key: 'pending', icon: Clock, label: 'Order Placed' },
  { key: 'ready', icon: Package, label: 'Ready for Pickup' },
  { key: 'on_the_way', icon: Truck, label: 'On the Way' },
  { key: 'delivered', icon: CheckCircle2, label: 'Delivered' }
] as const;

const STATUS_ORDER = {
  pending: 0,
  ready: 1,
  on_the_way: 2,
  delivered: 3,
  cancelled: -1
} as const;

interface Props {
  status: OrderStatus;
  createdAt: string;
  pickupTime?: string;
  estimatedDeliveryTime?: string;
}

export default function OrderTimeline({ 
  status, 
  createdAt, 
  pickupTime,
  estimatedDeliveryTime 
}: Props) {
  const currentStep = STATUS_ORDER[status];

  if (status === 'cancelled') {
    return (
      <div className="mt-6">
        <div className="text-center text-red-600 font-medium mb-2">
          This order has been cancelled
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute left-0 top-5 w-full h-0.5 bg-gray-200" />
        
        <div className="relative flex justify-between">
          {TIMELINE_STEPS.map((step, index) => {
            const isActive = STATUS_ORDER[status] >= index;
            let timestamp = null;
            let estimatedTime = null;
            let isEstimated = false;
            
            // Add timestamps for specific steps
            if (step.key === 'pending') {
              timestamp = createdAt;
            } else if (step.key === 'ready' && pickupTime) {
              estimatedTime = pickupTime;
              isEstimated = true;
            } else if (step.key === 'delivered' && estimatedDeliveryTime) {
              estimatedTime = estimatedDeliveryTime;
            }

            return (
              <TimelineStep
                key={step.key}
                icon={step.icon}
                label={step.label}
                isActive={isActive}
                timestamp={timestamp}
                estimatedTime={estimatedTime}
                isEstimated={isEstimated}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}