import React, { useState } from 'react';
import DeliveryAddressForm from './DeliveryAddressForm';
import ArrivalTimeInput from './ArrivalTimeInput';
import type { DeliveryDetails } from '../../types/delivery';

interface Props {
  onSubmit: (details: DeliveryDetails) => void;
  isSubmitting?: boolean;
}

export default function DeliveryForm({ onSubmit, isSubmitting = false }: Props) {
  // Set default arrival time to 24 hours from now
  const defaultArrivalTime = new Date();
  defaultArrivalTime.setHours(defaultArrivalTime.getHours() + 24);
  
  const [details, setDetails] = useState<DeliveryDetails>({
    name: '',
    phone: '',
    address: '',
    contactName: 'Michael Limo',
    contactPhone: '',
    contactAddress: '',
    arrivalTime: defaultArrivalTime
  });

  const handleContactChange = (field: string, value: string) => {
    setDetails(prev => ({
      ...prev,
      [`contact${field.charAt(0).toUpperCase()}${field.slice(1)}`]: value
    }));
  };

  const handleDeliveryChange = (field: string, value: string) => {
    setDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(details);
  };

  // Calculate minimum arrival time (24 hours from now)
  const minArrivalTime = new Date();
  minArrivalTime.setHours(minArrivalTime.getHours() + 24);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact Person Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Contact Person</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please provide your contact information for order confirmation and updates.
        </p>
        
        <DeliveryAddressForm
          name={details.contactName}
          phone={details.contactPhone}
          address={details.contactAddress}
          onChange={handleContactChange}
        />

        <ArrivalTimeInput
          value={details.arrivalTime}
          onChange={(date) => setDetails(prev => ({ ...prev, arrivalTime: date }))}
          minDate={minArrivalTime}
        />
      </div>

      {/* Optional Delivery Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Delivery Information</h3>
        <p className="text-sm text-gray-600 mb-4">
          Optional: Fill this section if the delivery details are different from your contact information.
          If left blank, we'll use your contact information for delivery.
        </p>

        <DeliveryAddressForm
          name={details.name}
          phone={details.phone}
          address={details.address}
          onChange={handleDeliveryChange}
          isOptional
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
      >
        {isSubmitting ? 'Processing...' : 'Place Order'}
      </button>
    </form>
  );
}