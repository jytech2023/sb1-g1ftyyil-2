import React from 'react';
import { LucideIcon } from 'lucide-react';
import { formatPacificTime } from '../../utils/dateUtils';

interface Props {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  timestamp?: string | null;
  estimatedTime?: string | null;
  isEstimated?: boolean;
}

export default function TimelineStep({ 
  icon: Icon, 
  label, 
  isActive, 
  timestamp, 
  estimatedTime,
  isEstimated 
}: Props) {
  return (
    <div className="flex flex-col items-center">
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center 
        ${isActive ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'}
        relative z-10
      `}>
        <Icon className="h-5 w-5" />
      </div>
      <span className={`
        text-xs mt-2 font-medium text-center
        ${isActive ? 'text-orange-500' : 'text-gray-500'}
      `}>
        {label}
      </span>
      {timestamp && (
        <span className="text-xs text-gray-600 mt-1 text-center">
          {formatPacificTime(timestamp)} PT
        </span>
      )}
      {estimatedTime && (
        <div className="text-xs text-gray-500 mt-0.5 text-center">
          <span className="inline-block bg-gray-100 px-1.5 py-0.5 rounded">
            Est. {formatPacificTime(estimatedTime)} PT
          </span>
          {isEstimated && (
            <div className="text-[10px] text-gray-400 mt-0.5">
              (30 mins before delivery)
            </div>
          )}
        </div>
      )}
    </div>
  );
}