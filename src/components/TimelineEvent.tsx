import React from 'react';
import { GripVertical } from 'lucide-react';
import { TimelineEventData } from '../types';

interface TimelineEventProps {
  event: TimelineEventData;
  left: number;
  width: number;
  isSelected: boolean; // New prop
  onClick: () => void; // New prop
}

// Map color names to Tailwind classes
const colorClasses: Record<string, { bg: string; text: string; grip: string; border: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-white', grip: 'text-blue-200', border: 'border-blue-700' },
  green: { bg: 'bg-green-500', text: 'text-white', grip: 'text-green-200', border: 'border-green-700' },
  red: { bg: 'bg-red-500', text: 'text-white', grip: 'text-red-200', border: 'border-red-700' },
  default: { bg: 'bg-gray-500', text: 'text-white', grip: 'text-gray-200', border: 'border-gray-700' },
};


const TimelineEvent: React.FC<TimelineEventProps> = ({ event, left, width, isSelected, onClick }) => {
  const styles = colorClasses[event.color] || colorClasses.default;

  // Add border style if selected
  const selectionClasses = isSelected ? `ring-2 ring-offset-1 ${styles.border} ring-opacity-75` : '';

  return (
    <div
      className={`absolute top-4 h-8 ${styles.bg} rounded flex items-center px-2 ${styles.text} text-sm shadow cursor-pointer hover:opacity-90 ${selectionClasses}`} // Added selectionClasses
      style={{ left: `${left}px`, width: `${width}px` }}
      title={`${event.label} (${event.startDate.toLocaleDateString()} - ${event.endDate.toLocaleDateString()})`}
      onClick={onClick} // Added onClick handler
    >
      <GripVertical size={16} className={`mr-1 cursor-move ${styles.grip}`} />
      <span className="truncate">{event.label}</span>
    </div>
  );
};

export default TimelineEvent;
