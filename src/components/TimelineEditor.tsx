import React, { useState, useMemo, useCallback } from 'react';
import { Undo2, Redo2, ZoomIn, ZoomOut, Settings, CalendarDays, Plus, Trash2 } from 'lucide-react';
import { TimelineRow, TimelineEventData } from '../types';
import TimelineEvent from './TimelineEvent';

// --- Placeholder Data ---
const initialRows: TimelineRow[] = [
  { id: 'row-1', label: 'Row 1' },
  { id: 'row-2', label: 'Row 2' },
  { id: 'row-3', label: 'Row 3' },
  { id: 'row-4', label: 'Marketing' },
];

const initialEvents: TimelineEventData[] = [
  { id: 'event-1', rowId: 'row-1', label: 'Project Alpha Kickoff', startDate: new Date(2024, 0, 15), endDate: new Date(2024, 1, 28), color: 'blue' },
  { id: 'event-2', rowId: 'row-2', label: 'Design Phase', startDate: new Date(2024, 1, 10), endDate: new Date(2024, 3, 5), color: 'green' },
  { id: 'event-3', rowId: 'row-1', label: 'Client Meeting', startDate: new Date(2024, 3, 20), endDate: new Date(2024, 4, 10), color: 'red' },
  { id: 'event-4', rowId: 'row-4', label: 'Campaign Launch', startDate: new Date(2024, 2, 1), endDate: new Date(2024, 4, 30), color: 'blue' },
];
// --- End Placeholder Data ---

// --- Time Scale Logic (Unchanged) ---
const BASE_PIXELS_PER_DAY = 3;
const TIMELINE_START_DATE = new Date(2024, 0, 1);
const TIMELINE_END_DATE = new Date(2024, 6, 0);
const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0];

const daysBetween = (date1: Date, date2: Date): number => {
  const d1 = Math.min(date1.getTime(), date2.getTime());
  const d2 = Math.max(date1.getTime(), date2.getTime());
  return (d2 - d1) / (1000 * 60 * 60 * 24);
};

interface TimeMarker {
  label: string;
  left: number;
}

function generateTimeMarkers(startDate: Date, endDate: Date, pixelsPerDay: number): TimeMarker[] {
  const markers: TimeMarker[] = [];
  let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  while (currentDate <= endDate) {
    const daysFromStart = daysBetween(startDate, currentDate);
    const left = daysFromStart * pixelsPerDay;
    const label = currentDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    markers.push({ label, left });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  return markers;
}
// --- End Time Scale Logic ---


const TimelineEditor: React.FC = () => {
  const [rows, setRows] = useState<TimelineRow[]>(initialRows);
  const [events, setEvents] = useState<TimelineEventData[]>(initialEvents);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null); // State for selected event

  const pixelsPerDay = useMemo(() => BASE_PIXELS_PER_DAY * zoomLevel, [zoomLevel]);

  const calculateEventPosition = useCallback((event: TimelineEventData): { left: number; width: number } => {
    const daysFromStart = daysBetween(TIMELINE_START_DATE, event.startDate);
    const durationDays = event.endDate >= event.startDate
      ? daysBetween(event.startDate, event.endDate)
      : 0;
    const left = daysFromStart * pixelsPerDay;
    const width = Math.max(durationDays * pixelsPerDay, 2);
    return { left, width };
  }, [pixelsPerDay]);

  const timeMarkers = useMemo(() => {
    return generateTimeMarkers(TIMELINE_START_DATE, TIMELINE_END_DATE, pixelsPerDay);
  }, [pixelsPerDay]);

  const totalTimelineWidth = useMemo(() => {
    return daysBetween(TIMELINE_START_DATE, TIMELINE_END_DATE) * pixelsPerDay;
  }, [pixelsPerDay]);

  // --- Zoom Handlers (Unchanged) ---
  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoomLevel(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIndex > 0) {
      setZoomLevel(ZOOM_LEVELS[currentIndex - 1]);
    }
  };
  // --- End Zoom Handlers ---

  // --- Event Handlers ---
  const handleAddEvent = () => {
    // Basic implementation: Add a default event to the first row
    if (rows.length === 0) return; // Don't add if no rows exist

    const newEvent: TimelineEventData = {
      id: `event-${Date.now()}`, // Simple unique ID
      rowId: rows[0].id,
      label: 'New Event',
      startDate: new Date(2024, 0, 5), // Default start date
      endDate: new Date(2024, 0, 12),   // Default end date
      color: 'default',
    };
    setEvents(prevEvents => [...prevEvents, newEvent]);
    setSelectedEventId(newEvent.id); // Select the newly added event
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleDeleteSelectedEvent = () => {
    if (!selectedEventId) return;
    setEvents(prevEvents => prevEvents.filter(event => event.id !== selectedEventId));
    setSelectedEventId(null); // Deselect after deletion
  };
  // --- End Event Handlers ---

  return (
    <main className="flex-1 flex flex-col bg-gray-200 overflow-hidden">
      {/* Top Control Bar */}
      <div className="bg-white border-b border-gray-300 px-4 py-2 flex items-center justify-between shadow-sm">
         <div className="flex items-center space-x-2">
          {/* Undo/Redo/Zoom/Settings/Calendar (Unchanged) */}
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded">
            <Undo2 size={18} />
          </button>
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded">
            <Redo2 size={18} />
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel === ZOOM_LEVELS[0]}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ZoomIn size={18} />
          </button>
          <span className="text-sm text-gray-500 w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
          <span className="text-gray-300">|</span>
           <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded">
            <Settings size={18} />
          </button>
           <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded">
            <CalendarDays size={18} />
          </button>
        </div>
        <div className="flex items-center space-x-2">
           {/* Add Event Button */}
           <button
             onClick={handleAddEvent} // Added onClick handler
             className="bg-orange-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-orange-600 flex items-center space-x-1"
           >
             <Plus size={16} />
             <span>Add Event</span>
           </button>
           {/* Delete Button - Enabled only if an event is selected */}
           <button
             onClick={handleDeleteSelectedEvent} // Added onClick handler
             disabled={!selectedEventId} // Disable if no event is selected
             className="text-red-500 hover:bg-red-50 p-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Trash2 size={18} />
           </button>
        </div>
      </div>

      {/* Main Timeline Area */}
      <div className="flex-1 bg-gray-100 p-4 overflow-auto">
        <div className="bg-white rounded shadow min-h-[600px] flex flex-col relative min-w-full" style={{ width: `${totalTimelineWidth + 40}px` }}>
          {/* Timeline Header / Time Scale (Unchanged) */}
          <div className="h-12 border-b border-gray-200 flex items-center sticky top-0 bg-white z-10 px-4">
            <div className="relative w-full h-full">
              {timeMarkers.map((marker, index) => (
                <span
                  key={index}
                  className="absolute bottom-1 text-sm text-gray-500"
                  style={{ left: `${marker.left + 40}px` }}
                >
                  {marker.label}
                </span>
              ))}
            </div>
          </div>

          {/* Timeline Rows / Content Area */}
          <div className="flex-1 p-4 pl-10 relative">
            {/* Grid Lines (Unchanged) */}
            {timeMarkers.map((marker, index) => (
              <div
                key={`grid-${index}`}
                className="absolute top-0 bottom-0 border-l border-gray-200"
                style={{ left: `${marker.left + 40}px` }}
              ></div>
            ))}

            {/* Render Rows */}
            {rows.map((row) => (
              <div key={row.id} className="relative h-16 mb-2 border-b border-gray-100">
                {/* Row Label (Unchanged) */}
                <span className="absolute left-[-30px] top-4 text-xs text-gray-400 w-8 text-right truncate" title={row.label}>
                  {row.label}
                </span>
                {/* Render Events for this Row */}
                {events
                  .filter((event) => event.rowId === row.id)
                  .map((event) => {
                    const { left, width } = calculateEventPosition(event);
                    const isSelected = event.id === selectedEventId; // Check if this event is selected
                    return (
                      <TimelineEvent
                        key={event.id}
                        event={event}
                        left={left + 40}
                        width={width}
                        isSelected={isSelected} // Pass isSelected prop
                        onClick={() => handleEventClick(event.id)} // Pass click handler
                      />
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default TimelineEditor;
