import React from 'react';
import { Clock } from 'lucide-react';
import type { BusinessHours } from '../../types/restaurant';

interface Props {
  businessHours: BusinessHours[];
  isOpen?: boolean;
  nextOpening?: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime(time: string): string {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function groupBusinessHours(hours: BusinessHours[]): Array<{
  days: string[];
  open_time: string;
  close_time: string;
}> {
  const sortedHours = [...hours].sort((a, b) => a.day_of_week - b.day_of_week);
  const groups: Array<{
    days: string[];
    open_time: string;
    close_time: string;
  }> = [];

  let currentGroup = {
    days: [DAYS[sortedHours[0].day_of_week]],
    open_time: sortedHours[0].open_time,
    close_time: sortedHours[0].close_time
  };

  for (let i = 1; i < sortedHours.length; i++) {
    const current = sortedHours[i];
    const prev = sortedHours[i - 1];

    if (
      current.open_time === prev.open_time &&
      current.close_time === prev.close_time &&
      current.day_of_week === prev.day_of_week + 1
    ) {
      currentGroup.days.push(DAYS[current.day_of_week]);
    } else {
      groups.push({ ...currentGroup });
      currentGroup = {
        days: [DAYS[current.day_of_week]],
        open_time: current.open_time,
        close_time: current.close_time
      };
    }
  }

  groups.push(currentGroup);
  return groups;
}

export default function BusinessHoursDisplay({ businessHours, isOpen, nextOpening }: Props) {
  const groupedHours = groupBusinessHours(businessHours);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-gray-500" />
        <div>
          <h3 className="font-semibold">Business Hours</h3>
          {isOpen !== undefined && (
            <div className={`text-sm ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
              {isOpen ? 'Open Now' : 'Closed'}
              {!isOpen && nextOpening && (
                <span className="text-gray-600">
                  {' '}· Opens {new Date(nextOpening).toLocaleString('en-US', {
                    weekday: 'short',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {groupedHours.map((group, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-gray-600">
              {group.days.length === 1
                ? group.days[0]
                : `${group.days[0]} - ${group.days[group.days.length - 1]}`}
            </span>
            <span>
              {formatTime(group.open_time)} - {formatTime(group.close_time)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}