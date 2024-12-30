import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Copy, Check, Clock } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import type { Order } from '../../types/order';

interface Props {
  order: Order;
  preparationHours: number;
}

export default function OrderConfirmation({ order, preparationHours }: Props) {
  const [copied, setCopied] = useState(false);
  const trackingUrl = `/track/${order.order_id}`;
  const fullTrackingUrl = window.location.origin + trackingUrl;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullTrackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="text-center">
      <div className="mb-4">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
      <p className="text-gray-600 mb-4">Your order #{order.order_id.slice(0, 8)} has been placed</p>
      
      <div className="mb-6">
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 max-w-xl mx-auto">
        <div className="flex items-start gap-2">
          <Clock className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-800 text-left">
            <p className="font-medium">Estimated Preparation Time</p>
            <p>Your order will be ready in approximately {preparationHours} hours.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg mb-4 max-w-xl mx-auto">
          <p className="text-sm text-gray-600 mb-2">Share this tracking link:</p>
          <div className="flex gap-2 items-center">
            <div className="flex-grow bg-white px-3 py-2 rounded border">
              <div className="truncate text-sm">
                {fullTrackingUrl}
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <Link
          to={trackingUrl}
          className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
        >
          <ClipboardList className="h-5 w-5" />
          Track Your Order
        </Link>

        <div>
          <Link
            to="/"
            className="inline-block text-orange-500 hover:text-orange-600 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}