import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { MenuItem } from '../../types/menu';
import OrderSummary from '../checkout/OrderSummary';

interface DeliveryDetails {
  name: string;
  phone: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactAddress: string;
}

interface Props {
  items: (MenuItem & { quantity: number })[];
  total: number;
  deliveryDetails: DeliveryDetails;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export default function CartConfirmation({
  items,
  total,
  deliveryDetails,
  onConfirm,
  onBack,
  isSubmitting
}: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-800">
            <p className="font-medium mb-1">Please review your order</p>
            <p>Make sure all details are correct before placing your order.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        {/* Contact Details */}
        <div>
          <h3 className="font-semibold mb-4">Contact Person</h3>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{deliveryDetails.contactName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{deliveryDetails.contactPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span className="font-medium">{deliveryDetails.contactAddress}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details if different */}
        {(deliveryDetails.name || deliveryDetails.phone || deliveryDetails.address) && (
          <div>
            <h3 className="font-semibold mb-4">Delivery Details</h3>
            <div className="grid gap-2 text-sm">
              {deliveryDetails.name && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{deliveryDetails.name}</span>
                </div>
              )}
              {deliveryDetails.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{deliveryDetails.phone}</span>
                </div>
              )}
              {deliveryDetails.address && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium">{deliveryDetails.address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <OrderSummary items={items} total={total} />
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
        </button>
      </div>
    </div>
  );
}