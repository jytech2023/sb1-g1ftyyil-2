import React from 'react';
import { PhoneCall } from 'lucide-react';

export default function DailyLimitNotice() {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
      <div className="flex items-start gap-2">
        <PhoneCall className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
        <p className="text-orange-800 text-sm">
          Need more? Please contact the restaurant directly for special arrangements.
        </p>
      </div>
    </div>
  );
}