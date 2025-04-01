import React from 'react';
import { GripVertical } from 'lucide-react';
import { useDrag } from 'react-dnd';
import { TimelineEventData, ItemTypes, TimelineEventDragItem, TimelineEventResizeDragItem } from '../types';

interface TimelineEventProps {
  event: TimelineEventData;
  left: number;
  width: number;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  pixelsPerDay: number;
  handleResizeEvent: (eventId: string, handleType: 'start' | 'end', newDate: Date) => void;
  timelineStartDate: Date; // Added timelineStartDate prop
}

// Color classes (Unchanged)
const colorClasses: Record<string, { bg: string; text: string; grip: string; border: string; handle: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-white', grip: 'text-blue-200', border: 'border-blue-700', handle: 'bg-blue-700' },
  green: { bg: 'bg-green-500', text: 'text-white', grip: 'text-green-200', border: 'border-green-700', handle: 'bg-green-700' },
  red: { bg: 'bg-red-500', text: 'text-white', grip: 'text-red-200', border: 'border-red-700', handle: 'bg-red-700' },
  default: { bg: 'bg-gray-500', text: 'text-white', grip: 'text-gray-200', border: 'border-gray-700', handle: 'bg-gray-700' },
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Resize Handle Component
interface ResizeHandleProps {
  eventId: string;
  handleType: 'start' | 'end';
  originalDate: Date;
  rowId: string;
  pixelsPerDay: number;
  handleResizeEvent: (eventId: string, handleType: 'start' | 'end', newDate: Date) => void;
  handleColor: string;
  timelineStartDate: Date; // Added timelineStartDate prop
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ eventId, handleType, originalDate, rowId, pixelsPerDay, handleResizeEvent, handleColor, timelineStartDate }) => {
  const [{ isDragging }, drag] = useDrag<TimelineEventResizeDragItem, void, { isDragging: boolean }>(() => ({
    type: ItemTypes.TIMELINE_EVENT_RESIZE_HANDLE,
    item: { type: ItemTypes.TIMELINE_EVENT_RESIZE_HANDLE, id: eventId, handleType, originalDate, rowId, pixelsPerDay },
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) return;
      const deltaDays = delta.x / item.pixelsPerDay;
      const newDateTime = item.originalDate.getTime() + deltaDays * MS_PER_DAY;
      let newDate = new Date(newDateTime);

      // Prevent resizing before timeline start
      if (newDate < timelineStartDate) {
          newDate = timelineStartDate;
      }

      handleResizeEvent(item.id, item.handleType, newDate);
    },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }), [eventId, handleType, originalDate, rowId, pixelsPerDay, handleResizeEvent, timelineStartDate]); // Added timelineStartDate dependency

  const positionClass = handleType === 'start' ? 'left-0' : 'right-0';
  const cursorClass = 'cursor-ew-resize';

  return (
    <div
      ref={drag}
      className={`absolute top-0 bottom-0 w-2 ${positionClass} ${cursorClass} ${handleColor} rounded opacity-50 hover:opacity-100 z-20 ${isDragging ? 'opacity-80' : ''}`} // Increased z-index
      title={handleType === 'start' ? 'Drag to resize start date' : 'Drag to resize end date'}
    />
  );
};


const TimelineEvent: React.FC<TimelineEventProps> = ({ event, left, width, isSelected, onClick, onDoubleClick, pixelsPerDay, handleResizeEvent, timelineStartDate }) => {
  const styles = colorClasses[event.color] || colorClasses.default;
  const selectionClasses = isSelected ? `ring-2 ring-offset-1 ${styles.border} ring-opacity-75` : '';

  // Drag hook for moving (Unchanged)
  const [{ isDragging: isMoving }, drag, dragPreview] = useDrag<TimelineEventDragItem, void, { isDragging: boolean }>(() => ({
    type: ItemTypes.TIMELINE_EVENT,
    item: { type: ItemTypes.TIMELINE_EVENT, id: event.id, originalStartDate: event.startDate, originalEndDate: event.endDate, rowId: event.rowId },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }), [event]);

  return dragPreview(
    <div
      ref={drag}
      // Added z-10 to ensure events are above row grid lines and today marker line
      className={`absolute top-4 h-8 ${styles.bg} rounded flex items-center px-2 ${styles.text} text-sm shadow cursor-pointer hover:opacity-90 ${selectionClasses} ${isMoving ? 'opacity-50' : 'opacity-100'} z-10`}
      style={{ left: `${left}px`, width: `${width}px`, minWidth: '10px' }}
      title={`${event.label} (${event.startDate.toLocaleDateString()} - ${event.endDate.toLocaleDateString()})`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {/* Move Handle (Unchanged) */}
      <div className="flex-shrink-0 cursor-move">
        <GripVertical size={16} className={`mr-1 ${styles.grip}`} />
      </div>

      {/* Event Label (Unchanged) */}
      <span className="truncate flex-grow mx-1">{event.label}</span>

      {/* Resize Handles */}
      {isSelected && (
        <>
          <ResizeHandle eventId={event.id} handleType="start" originalDate={event.startDate} rowId={event.rowId} pixelsPerDay={pixelsPerDay} handleResizeEvent={handleResizeEvent} handleColor={styles.handle} timelineStartDate={timelineStartDate} />
          <ResizeHandle eventId={event.id} handleType="end" originalDate={event.endDate} rowId={event.rowId} pixelsPerDay={pixelsPerDay} handleResizeEvent={handleResizeEvent} handleColor={styles.handle} timelineStartDate={timelineStartDate} />
        </>
      )}
    </div>
  );
};

export default TimelineEvent;
