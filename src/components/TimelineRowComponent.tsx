import React, { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Trash2, Edit2 } from 'lucide-react';
import { TimelineRow, TimelineEventData, ItemTypes, TimelineEventDragItem, TimelineEventResizeDragItem } from '../types'; // Added ResizeDragItem
import TimelineEvent from './TimelineEvent';

interface TimelineRowComponentProps {
  row: TimelineRow;
  events: TimelineEventData[];
  pixelsPerDay: number;
  timelineStartDate: Date;
  calculateEventPosition: (event: TimelineEventData) => { left: number; width: number };
  handleMoveEvent: (eventId: string, newStartDate: Date, newRowId: string) => void;
  handleResizeEvent: (eventId: string, handleType: 'start' | 'end', newDate: Date) => void;
  handleEventClick: (eventId: string) => void;
  handleEventDoubleClick: (eventId: string) => void;
  selectedEventId: string | null;
  timeMarkers: { label: string; left: number }[]; // Keep for grid lines
  onDeleteRow: (rowId: string) => void;
  onUpdateRowLabel: (rowId: string, newLabel: string) => void;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Helper to calculate date from pixel offset (used in drop handlers)
const calculateDateFromOffset = (
    initialDate: Date,
    pixelOffset: number,
    pixelsPerDay: number,
    timelineStartDate: Date
): Date => {
    const deltaDays = pixelOffset / pixelsPerDay;
    const newTime = initialDate.getTime() + deltaDays * MS_PER_DAY;
    let newDate = new Date(newTime);
    // Ensure the date doesn't go before the timeline start
    if (newDate < timelineStartDate) {
        newDate = timelineStartDate;
    }
    return newDate;
};


const TimelineRowComponent: React.FC<TimelineRowComponentProps> = ({
  row,
  events,
  pixelsPerDay,
  timelineStartDate,
  calculateEventPosition,
  handleMoveEvent,
  handleResizeEvent, // Make sure this is passed correctly
  handleEventClick,
  handleEventDoubleClick,
  selectedEventId,
  timeMarkers,
  onDeleteRow,
  onUpdateRowLabel,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [currentLabel, setCurrentLabel] = useState(row.label);
  const labelInputRef = useRef<HTMLInputElement>(null);

  // Drop hook for MOVING events onto this row
  const [, dropMove] = useDrop(() => ({
    accept: ItemTypes.TIMELINE_EVENT, // Accept regular events for moving
    drop: (item: TimelineEventDragItem, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta || !rowRef.current) return;

      // Calculate new start date based on drop position relative to timeline start
      const newStartDate = calculateDateFromOffset(
          item.originalStartDate,
          delta.x,
          pixelsPerDay,
          timelineStartDate
      );

      handleMoveEvent(item.id, newStartDate, row.id); // Pass calculated date and this row's ID
    },
  }), [pixelsPerDay, timelineStartDate, row.id, handleMoveEvent]);


  // Drop hook for RESIZING events (handles drop anywhere on the row during resize)
  // This seems less intuitive than dropping onto the handle itself,
  // but react-dnd's default behavior updates based on the handle's drag source `end` method.
  // We might not strictly need a drop target on the row *for resizing* if the handle's `end` logic is sufficient.
  // Let's keep the handle's `end` logic for resizing for now. If needed, we could add row drop logic later.
  /*
  const [, dropResize] = useDrop(() => ({
    accept: ItemTypes.TIMELINE_EVENT_RESIZE_HANDLE, // Accept resize handles
    drop: (item: TimelineEventResizeDragItem, monitor) => {
        // This might be redundant if the handle's endDrag calculates correctly.
        // If needed, calculate the new date based on drop position here.
        console.log("Resize handle dropped on row", item, monitor.getDifferenceFromInitialOffset());
    }
  }), [pixelsPerDay, timelineStartDate, handleResizeEvent]);
  */

  // Combine refs if using multiple drop targets on the same element
  // dropMove(rowRef); // Apply the move drop target to the row div
  // If using dropResize: dropResize(rowRef);

  // Since we only have dropMove for now:
  dropMove(rowRef);


  // Focus input when editing starts (Unchanged)
  useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus();
      labelInputRef.current.select();
    }
  }, [isEditingLabel]);

  // Handle label editing completion (Unchanged)
  const handleLabelEditComplete = () => {
    if (isEditingLabel) {
      const trimmedLabel = currentLabel.trim();
      if (trimmedLabel && trimmedLabel !== row.label) {
        onUpdateRowLabel(row.id, trimmedLabel);
      } else {
        setCurrentLabel(row.label);
      }
      setIsEditingLabel(false);
    }
  };

  // Handle key press in input (Unchanged)
  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLabelEditComplete();
    } else if (e.key === 'Escape') {
      setCurrentLabel(row.label);
      setIsEditingLabel(false);
    }
  };

  return (
    // Added z-0 to ensure events (z-10) and today marker (z-10) appear above row background/grid
    <div ref={rowRef} className="relative h-16 mb-2 border-b border-gray-100 group z-0">
      {/* Row Label Area (Unchanged) */}
      <div className="absolute left-[-40px] top-4 w-10 h-8 flex items-center justify-end pr-2 z-10"> {/* Ensure label area is above grid lines */}
        {isEditingLabel ? (
          <input
            ref={labelInputRef}
            type="text"
            value={currentLabel}
            onChange={(e) => setCurrentLabel(e.target.value)}
            onBlur={handleLabelEditComplete}
            onKeyDown={handleLabelKeyDown}
            className="text-xs text-gray-600 w-full border border-orange-400 rounded px-1 py-0.5 focus:outline-none"
            style={{ maxWidth: '80px' }}
          />
        ) : (
          <span
            className="text-xs text-gray-400 w-full text-right truncate cursor-pointer hover:text-gray-600"
            title={row.label}
            onDoubleClick={() => setIsEditingLabel(true)}
          >
            {row.label}
          </span>
        )}
        {!isEditingLabel && (
          <div className="absolute right-[-30px] top-0 bottom-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button
                onClick={() => setIsEditingLabel(true)}
                className="text-gray-400 hover:text-blue-500 p-0.5 rounded"
                title="Edit Row Label"
             >
                <Edit2 size={12} />
             </button>
             <button
                onClick={() => onDeleteRow(row.id)}
                className="text-gray-400 hover:text-red-500 p-0.5 rounded"
                title="Delete Row"
             >
                <Trash2 size={12} />
             </button>
          </div>
        )}
      </div>


      {/* Grid Lines for this specific row */}
      {timeMarkers.map((marker, index) => (
         // Position grid lines relative to the row container
         // Added z-0 to be behind events
         <div key={`grid-${row.id}-${index}`} className="absolute top-0 bottom-0 border-l border-gray-200 z-0" style={{ left: `${marker.left + 40}px` }}></div>
      ))}

      {/* Render Events */}
      {events.map((event) => {
        const { left, width } = calculateEventPosition(event);
        const isSelected = event.id === selectedEventId;
        return (
          <TimelineEvent
            key={event.id}
            event={event}
            // Position events relative to the row container
            left={left + 40} // Add padding offset
            width={width}
            isSelected={isSelected}
            onClick={() => handleEventClick(event.id)}
            onDoubleClick={() => handleEventDoubleClick(event.id)}
            pixelsPerDay={pixelsPerDay}
            handleResizeEvent={handleResizeEvent} // Pass down the resize handler
            timelineStartDate={timelineStartDate} // Pass down timeline start date
          />
        );
      })}
    </div>
  );
};

export default TimelineRowComponent;
