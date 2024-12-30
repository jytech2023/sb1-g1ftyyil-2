import React from 'react';
import { MapPin, Phone, User } from 'lucide-react';

interface Props {
  name: string;
  phone: string;
  address: string;
  onChange: (field: string, value: string) => void;
  isOptional?: boolean;
}

export default function DeliveryAddressForm({ 
  name, 
  phone, 
  address, 
  onChange,
  isOptional = false 
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          <User className="h-4 w-4" />
          Name
          {!isOptional && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          required={!isOptional}
          value={name}
          onChange={e => onChange('name', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          placeholder={`${isOptional ? 'Delivery recipient name (optional)' : 'Your name'}`}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          <Phone className="h-4 w-4" />
          Phone Number
          {!isOptional && <span className="text-red-500">*</span>}
        </label>
        <input
          type="tel"
          required={!isOptional}
          value={phone}
          onChange={e => onChange('phone', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          placeholder={`${isOptional ? 'Delivery contact number (optional)' : 'Your phone number'}`}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
          <MapPin className="h-4 w-4" />
          Address
          {!isOptional && <span className="text-red-500">*</span>}
        </label>
        <textarea
          required={!isOptional}
          value={address}
          onChange={e => onChange('address', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          rows={3}
          placeholder={`${isOptional ? 'Delivery address (optional)' : 'Your address'}`}
        />
      </div>
    </div>
  );
}