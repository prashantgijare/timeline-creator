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
