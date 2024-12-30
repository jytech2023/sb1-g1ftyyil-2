import React from 'react';
import { Clock } from 'lucide-react';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
  minDate: Date;
}

export default function ArrivalTimeInput({ value, onChange, minDate }: Props) {
  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Clock className="h-4 w-4" />
        Arrival Time
        <span className="text-red-500">*</span>
      </label>

      <input
        type="datetime-local"
        value={formatDateForInput(value)}
        min={formatDateForInput(minDate)}
        onChange={(e) => onChange(new Date(e.target.value))}
        className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
        required
      />

      <div className="text-sm text-gray-600">
        <p>Selected arrival time: {formatDateForDisplay(value)}</p>
        <p>Pickup will be scheduled 30 minutes before arrival</p>
      </div>
    </div>
  );
}