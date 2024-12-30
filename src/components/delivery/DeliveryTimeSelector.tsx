import React from 'react';
import { Clock } from 'lucide-react';

interface Props {
  selectedDate: Date;
  minDate: Date;
  onChange: (date: Date) => void;
}

export default function DeliveryTimeSelector({ selectedDate, minDate, onChange }: Props) {
  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime()) && newDate >= minDate) {
      onChange(newDate);
    }
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Clock className="h-4 w-4" />
        Delivery Time
        <span className="text-red-500">*</span>
      </label>

      <input
        type="datetime-local"
        value={formatDateForInput(selectedDate)}
        min={formatDateForInput(minDate)}
        onChange={handleDateChange}
        className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
        required
      />

      <div className="text-sm text-gray-600">
        <p>Selected delivery time: {formatDateForDisplay(selectedDate)}</p>
        <p>Earliest possible delivery: {formatDateForDisplay(minDate)}</p>
      </div>
    </div>
  );
}