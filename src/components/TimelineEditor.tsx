import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Undo2, Redo2, ZoomIn, ZoomOut, Settings, CalendarDays, Plus, Trash2, Rows, ArrowLeft } from 'lucide-react'; // Added ArrowLeft
import { TimelineRow, TimelineEventData, HistoryState } from '../types'; // Added HistoryState
import TimelineRowComponent from './TimelineRowComponent';
import EventEditModal from './EventEditModal';

// --- REMOVED Placeholder Data ---
// const initialRows: TimelineRow[] = [ ... ];
// const initialEvents: TimelineEventData[] = [ ... ];
// --- End REMOVED Placeholder Data ---

// --- Time Scale Logic (Unchanged) ---
const BASE_PIXELS_PER_DAY = 3;
const TIMELINE_START_DATE = new Date(2024, 0, 1); // Keep a default start, might be adjusted by template later
const TIMELINE_END_DATE = new Date(2024, 11, 31); // Default end, adjust as needed
const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0];
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const daysBetween = (date1: Date, date2: Date): number => {
  const d1StartOfDay = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2StartOfDay = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.round((d2StartOfDay.getTime() - d1StartOfDay.getTime()) / MS_PER_DAY);
};

interface TimeMarker {
  label: string;
  left: number;
}

function generateTimeMarkers(startDate: Date, endDate: Date, pixelsPerDay: number): TimeMarker[] {
  const markers: TimeMarker[] = [];
  let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
   // Ensure loop covers the full end date month
  const loopEndDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
  while (currentDate <= loopEndDate) {
    const daysFromStart = daysBetween(startDate, currentDate);
    const left = daysFromStart * pixelsPerDay;
    const label = currentDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    markers.push({ label, left });
    // Move to the first day of the next month
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }
  return markers;
}
// --- End Time Scale Logic ---

// --- Component Props ---
interface TimelineEditorProps {
  initialRows: TimelineRow[];
  initialEvents: TimelineEventData[];
  // Add a callback prop to go back to template selection
  onGoBack?: () => void;
}
// --- End Component Props ---

const TimelineEditor: React.FC<TimelineEditorProps> = ({ initialRows, initialEvents, onGoBack }) => {
  // --- Core State ---
  // Initialize state from props
  const [rows, setRows] = useState<TimelineRow[]>(initialRows);
  const [events, setEvents] = useState<TimelineEventData[]>(initialEvents);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<TimelineEventData | null>(null);
  const [isAddingNewEvent, setIsAddingNewEvent] = useState<boolean>(false);
  const [todayPosition, setTodayPosition] = useState<number | null>(null);

  // --- History State ---
  const [undoStack, setUndoStack] = useState<HistoryState[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryState[]>([]);
  const isUndoRedoOperation = useRef(false);

  // --- Effect to update state if initial props change (e.g., new template selected) ---
  useEffect(() => {
    setRows(initialRows);
    setEvents(initialEvents);
    // Reset history when template changes
    setUndoStack([]);
    setRedoStack([]);
    setSelectedEventId(null); // Clear selection
    setEditingEvent(null); // Close modal if open
    setIsAddingNewEvent(false);
    // Optionally reset zoom?
    // setZoomLevel(1.0);
  }, [initialRows, initialEvents]); // Rerun only if initial props change

  // --- Derived State & Calculations ---
  // Determine timeline bounds based on events, falling back to defaults
  const { timelineStartDate, timelineEndDate } = useMemo(() => {
    if (initialEvents.length === 0) {
      return { timelineStartDate: TIMELINE_START_DATE, timelineEndDate: TIMELINE_END_DATE };
    }
    let minDate = initialEvents[0].startDate;
    let maxDate = initialEvents[0].endDate;
    initialEvents.forEach(event => {
      if (event.startDate < minDate) minDate = event.startDate;
      if (event.endDate > maxDate) maxDate = event.endDate;
    });

    // Add some padding (e.g., start at the beginning of the minDate's month, end at the end of maxDate's month)
    const start = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0); // Last day of maxDate's month

    return { timelineStartDate: start, timelineEndDate: end };
  }, [initialEvents]); // Recalculate if initial events change

  const pixelsPerDay = useMemo(() => BASE_PIXELS_PER_DAY * zoomLevel, [zoomLevel]);

  useEffect(() => {
    const today = new Date();
    if (today >= timelineStartDate && today <= timelineEndDate) {
      const daysFromStart = daysBetween(timelineStartDate, today);
      setTodayPosition(daysFromStart * pixelsPerDay);
    } else {
      setTodayPosition(null);
    }
  }, [pixelsPerDay, timelineStartDate, timelineEndDate]); // Update today marker based on calculated bounds

  const calculateEventPosition = useCallback((event: TimelineEventData): { left: number; width: number } => {
    const daysFromStart = daysBetween(timelineStartDate, event.startDate);
    const durationDays = event.endDate >= event.startDate
      ? daysBetween(event.startDate, event.endDate) + 1
      : 1;
    const left = daysFromStart * pixelsPerDay;
    const width = Math.max(durationDays * pixelsPerDay, pixelsPerDay / 2, 5); // Ensure minimum width
    return { left, width };
  }, [pixelsPerDay, timelineStartDate]); // Depends on calculated start date

  const timeMarkers = useMemo(() => {
    return generateTimeMarkers(timelineStartDate, timelineEndDate, pixelsPerDay);
  }, [pixelsPerDay, timelineStartDate, timelineEndDate]); // Depends on calculated bounds

  const totalTimelineWidth = useMemo(() => {
    // Calculate width based on the actual start and end dates
    return (daysBetween(timelineStartDate, timelineEndDate) + 1) * pixelsPerDay;
  }, [pixelsPerDay, timelineStartDate, timelineEndDate]); // Depends on calculated bounds

  // --- History Management (Unchanged) ---
  const pushToUndoStack = useCallback(() => {
    if (!isUndoRedoOperation.current) {
      setUndoStack(prev => [...prev, { rows, events }]);
      setRedoStack([]);
    }
  }, [rows, events]);

  // --- State Update Wrappers (Unchanged) ---
  const updateRows = useCallback((newRows: TimelineRow[] | ((prevRows: TimelineRow[]) => TimelineRow[])) => {
    pushToUndoStack();
    setRows(newRows);
  }, [pushToUndoStack]);

  const updateEvents = useCallback((newEvents: TimelineEventData[] | ((prevEvents: TimelineEventData[]) => TimelineEventData[])) => {
    pushToUndoStack();
    setEvents(newEvents);
  }, [pushToUndoStack]);

  const updateRowsAndEvents = useCallback((newRows: TimelineRow[], newEvents: TimelineEventData[]) => {
    pushToUndoStack();
    setRows(newRows);
    setEvents(newEvents);
  }, [pushToUndoStack]);

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

  // --- Event Handlers (Logic mostly unchanged, uses state wrappers) ---
  const handleAddEvent = () => {
    if (rows.length === 0) {
        alert("Please add a row before adding an event.");
        return;
    }
    // Default to the first row and a date range around today or timeline start
    const targetRowId = rows[0].id;
    const today = new Date();
    const defaultStartDate = today >= timelineStartDate && today <= timelineEndDate ? today : timelineStartDate;
    const defaultEndDate = new Date(defaultStartDate.getTime() + 7 * MS_PER_DAY);

    const newEvent: TimelineEventData = {
      id: `new-event-${Date.now()}`,
      rowId: targetRowId,
      label: 'New Event',
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      color: 'default',
    };
    setIsAddingNewEvent(true);
    setEditingEvent(newEvent);
  };

  const handleEventClick = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
  }, []);

  const handleDeleteSelectedEvent = () => {
    if (!selectedEventId) return;
    updateEvents(prevEvents => prevEvents.filter(event => event.id !== selectedEventId));
    setSelectedEventId(null);
  };

  const handleEventDoubleClick = useCallback((eventId: string) => {
    const eventToEdit = events.find(event => event.id === eventId);
    if (eventToEdit) {
      setIsAddingNewEvent(false);
      setEditingEvent(eventToEdit);
    }
  }, [events]);

  const handleSaveEvent = useCallback((savedEvent: TimelineEventData) => {
    if (isAddingNewEvent) {
      const finalNewEvent = { ...savedEvent, id: `event-${Date.now()}` };
      updateEvents(prevEvents => [...prevEvents, finalNewEvent]);
      setSelectedEventId(finalNewEvent.id);
    } else {
      updateEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === savedEvent.id ? savedEvent : event
        )
      );
      setSelectedEventId(savedEvent.id);
    }
    setEditingEvent(null);
    setIsAddingNewEvent(false);
  }, [isAddingNewEvent, updateEvents]);

  const handleCloseModal = useCallback(() => {
    setEditingEvent(null);
    setIsAddingNewEvent(false);
  }, []);

  // --- Drag and Drop / Resize Handlers (Logic mostly unchanged, uses state wrappers) ---
  const handleMoveEvent = useCallback((id: string, newStartDate: Date, newRowId: string) => {
    updateEvents(prevEvents =>
      prevEvents.map(event => {
        if (event.id === id) {
          const duration = event.endDate.getTime() - event.startDate.getTime();
          // Ensure start date doesn't go before the dynamic timeline start
          const finalStartDate = newStartDate < timelineStartDate ? timelineStartDate : newStartDate;
          const finalEndDate = new Date(finalStartDate.getTime() + duration);
          return { ...event, startDate: finalStartDate, endDate: finalEndDate, rowId: newRowId };
        }
        return event;
      })
    );
  }, [updateEvents, timelineStartDate]); // Added timelineStartDate dependency

  const handleResizeEvent = useCallback((id: string, handleType: 'start' | 'end', newDate: Date) => {
    updateEvents(prevEvents =>
      prevEvents.map(event => {
        if (event.id === id) {
          let updatedStartDate = event.startDate;
          let updatedEndDate = event.endDate;
          if (handleType === 'start') {
             // Ensure start date doesn't go before the dynamic timeline start
            updatedStartDate = newDate < timelineStartDate ? timelineStartDate : newDate;
            if (updatedStartDate >= updatedEndDate) {
               updatedEndDate = new Date(updatedStartDate.getTime() + MS_PER_DAY / 2); // Ensure end is after start
            }
          } else {
            updatedEndDate = newDate;
             // Ensure end date is not before start date
            if (updatedEndDate <= updatedStartDate) {
               // If resizing end handle makes it before start, snap it slightly after start
               updatedEndDate = new Date(updatedStartDate.getTime() + MS_PER_DAY / 2);
            }
          }
          return { ...event, startDate: updatedStartDate, endDate: updatedEndDate };
        }
        return event;
      })
    );
  }, [updateEvents, timelineStartDate]); // Added timelineStartDate dependency

  // --- Row Management Handlers (Logic mostly unchanged, uses state wrappers) ---
  const handleAddRow = useCallback(() => {
    const newRow: TimelineRow = {
      id: `row-${Date.now()}`,
      label: `New Row ${rows.length + 1}`,
    };
    updateRows(prevRows => [...prevRows, newRow]);
  }, [rows.length, updateRows]);

  const handleDeleteRow = useCallback((rowIdToDelete: string) => {
    const newRows = rows.filter(row => row.id !== rowIdToDelete);
    const newEvents = events.filter(event => event.rowId !== rowIdToDelete);
    updateRowsAndEvents(newRows, newEvents);

    if (selectedEventId && events.find(e => e.id === selectedEventId)?.rowId === rowIdToDelete) {
        setSelectedEventId(null);
    }
  }, [rows, events, selectedEventId, updateRowsAndEvents]);

  const handleUpdateRowLabel = useCallback((rowId: string, newLabel: string) => {
    updateRows(prevRows =>
      prevRows.map(row =>
        row.id === rowId ? { ...row, label: newLabel } : row
      )
    );
  }, [updateRows]);

  // --- Undo/Redo Handlers (Unchanged) ---
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    isUndoRedoOperation.current = true;
    const previousState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    setRedoStack(prev => [...prev, { rows, events }]);
    setRows(previousState.rows);
    setEvents(previousState.events);
    setUndoStack(newUndoStack);
    setTimeout(() => { isUndoRedoOperation.current = false; }, 0);
  }, [undoStack, rows, events]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    isUndoRedoOperation.current = true;
    const nextState = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    setUndoStack(prev => [...prev, { rows, events }]);
    setRows(nextState.rows);
    setEvents(nextState.events);
    setRedoStack(newRedoStack);
    setTimeout(() => { isUndoRedoOperation.current = false; }, 0);
  }, [redoStack, rows, events]);


  return (
    <main className="flex-1 flex flex-col bg-gray-200 overflow-hidden">
      {/* Top Control Bar */}
      <div className="bg-white border-b border-gray-300 px-4 py-2 flex items-center justify-between shadow-sm">
         <div className="flex items-center space-x-2">
          {/* Add Back Button if handler is provided */}
          {onGoBack && (
             <button onClick={onGoBack} title="Back to Templates" className="p-1.5 text-gray-600 hover:bg-gray-100 rounded mr-2"> <ArrowLeft size={18} /> </button>
          )}
          <button onClick={handleUndo} disabled={undoStack.length === 0} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"> <Undo2 size={18} /> </button>
          <button onClick={handleRedo} disabled={redoStack.length === 0} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"> <Redo2 size={18} /> </button>
          <span className="text-gray-300">|</span>
          <button onClick={handleZoomOut} disabled={zoomLevel === ZOOM_LEVELS[0]} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"> <ZoomOut size={18} /> </button>
          <button onClick={handleZoomIn} disabled={zoomLevel === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"> <ZoomIn size={18} /> </button>
          <span className="text-sm text-gray-500 w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
          <span className="text-gray-300">|</span>
           <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"> <Settings size={18} /> </button>
           <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"> <CalendarDays size={18} /> </button>
           <span className="text-gray-300">|</span>
           <button onClick={handleAddRow} title="Add New Row" className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"> <Rows size={18} /> </button>
        </div>
        <div className="flex items-center space-x-2">
           <button onClick={handleAddEvent} className="bg-orange-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-orange-600 flex items-center space-x-1"> <Plus size={16} /> <span>Add Event</span> </button>
           <button onClick={handleDeleteSelectedEvent} disabled={!selectedEventId} className="text-red-500 hover:bg-red-50 p-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed"> <Trash2 size={18} /> </button>
        </div>
      </div>

      {/* Main Timeline Area */}
      {/* Added key to force re-render on timeline bounds change */}
      <div key={`${timelineStartDate.toISOString()}-${timelineEndDate.toISOString()}`} className="flex-1 bg-gray-100 p-4 overflow-auto timeline-scroller">
        {/* Adjust min-w based on calculated width */}
        <div className="bg-white rounded shadow min-h-[600px] flex flex-col relative min-w-max timeline-container" style={{ width: `${totalTimelineWidth + 40}px` }}>
          {/* Timeline Header / Time Scale */}
          <div className="h-12 border-b border-gray-200 flex items-center sticky top-0 bg-white z-20 px-4">
            <div className="relative w-full h-full">
              {/* Month Markers */}
              {timeMarkers.map((marker, index) => (
                <span key={index} className="absolute bottom-1 text-sm text-gray-500" style={{ left: `${marker.left + 40}px` }}> {marker.label} </span>
              ))}
              {/* Vertical Month Grid Lines */}
              {timeMarkers.map((marker, index) => (
                 <div key={`header-grid-${index}`} className="absolute top-0 bottom-0 border-l border-gray-200" style={{ left: `${marker.left + 40}px` }}></div>
              ))}
              {/* Today Marker in Header */}
              {todayPosition !== null && (
                <div
                  className="absolute top-0 bottom-0 border-l-2 border-red-500 z-10"
                  style={{ left: `${todayPosition + 40}px` }}
                  title={`Today (${new Date().toLocaleDateString()})`}
                ></div>
              )}
            </div>
          </div>

          {/* Timeline Rows / Content Area */}
          <div className="flex-1 p-4 pl-10 relative">
             {/* Today Marker across Rows */}
             {todayPosition !== null && (
                <div
                  className="absolute top-0 bottom-0 border-l-2 border-red-500 z-10"
                  style={{ left: `${todayPosition + 40}px` }}
                ></div>
              )}
            {/* Render Rows */}
            {rows.map((row) => (
              <TimelineRowComponent
                key={row.id}
                row={row}
                events={events.filter((event) => event.rowId === row.id)}
                pixelsPerDay={pixelsPerDay}
                timelineStartDate={timelineStartDate} // Pass calculated start date
                calculateEventPosition={calculateEventPosition}
                handleMoveEvent={handleMoveEvent}
                handleResizeEvent={handleResizeEvent}
                handleEventClick={handleEventClick}
                handleEventDoubleClick={handleEventDoubleClick}
                selectedEventId={selectedEventId}
                timeMarkers={timeMarkers} // Pass calculated markers
                onDeleteRow={handleDeleteRow}
                onUpdateRowLabel={handleUpdateRowLabel}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Event Editing Modal (Unchanged) */}
      <EventEditModal
        isOpen={!!editingEvent}
        onRequestClose={handleCloseModal}
        event={editingEvent}
        onSaveEvent={handleSaveEvent}
        isAddingNew={isAddingNewEvent}
      />
    </main>
  );
};

export default TimelineEditor;
