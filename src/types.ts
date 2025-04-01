export interface TimelineRow {
  id: string;
  label: string;
}

export interface TimelineEventData {
  id: string;
  rowId: string;
  label: string;
  startDate: Date;
  endDate: Date;
  color: string; // e.g., 'blue', 'green', 'red'
}

// --- Template Data Structure ---
export interface TemplateData {
  id: string;
  name: string;
  description: string;
  imageUrl: string; // URL for the template preview image
  initialRows: TimelineRow[];
  initialEvents: TimelineEventData[];
}
// --- End Template Data Structure ---


// Define item types for react-dnd
export const ItemTypes = {
  TIMELINE_EVENT: 'timelineEvent',
  TIMELINE_EVENT_RESIZE_HANDLE: 'timelineEventResizeHandle', // New type for resizing
}

// Define the drag item structure for moving events
export interface TimelineEventDragItem {
  type: typeof ItemTypes.TIMELINE_EVENT;
  id: string;
  originalStartDate: Date;
  originalEndDate: Date;
  rowId: string;
}

// Define the drag item structure for resizing events
export interface TimelineEventResizeDragItem {
  type: typeof ItemTypes.TIMELINE_EVENT_RESIZE_HANDLE;
  id: string;
  handleType: 'start' | 'end'; // Which handle is being dragged
  originalDate: Date; // The date corresponding to the handle being dragged
  rowId: string; // Keep rowId for context if needed
  pixelsPerDay: number; // Pass pixelsPerDay for calculation in endDrag
}

// --- History State Type (for TimelineEditor) ---
export interface HistoryState {
  rows: TimelineRow[];
  events: TimelineEventData[];
}
// --- End History State Type ---
