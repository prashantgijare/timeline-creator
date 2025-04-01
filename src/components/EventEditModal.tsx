import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { X } from 'lucide-react';
import { TimelineEventData } from '../types';

// Basic styling for the modal (Unchanged)
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: '1px solid #ccc',
    background: '#fff',
    borderRadius: '8px',
    padding: '25px',
    minWidth: '350px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
  },
};

interface EventEditModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  event: TimelineEventData | null;
  onSaveEvent: (savedEvent: TimelineEventData) => void; // Renamed from onUpdateEvent
  isAddingNew: boolean; // Flag to know if we are adding or editing
}

const availableColors = ['blue', 'green', 'red', 'default'];

// Helper to format Date to YYYY-MM-DD for input[type="date"]
const formatDateForInput = (date: Date): string => {
  // Adjust for timezone offset to get the correct local date string
  const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return adjustedDate.toISOString().split('T')[0];
};

const EventEditModal: React.FC<EventEditModalProps> = ({
  isOpen,
  onRequestClose,
  event,
  onSaveEvent, // Use the renamed prop
  isAddingNew,
}) => {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('default');
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setLabel(event.label);
      setColor(event.color);
      // Ensure dates are valid before formatting
      setStartDateStr(event.startDate instanceof Date && !isNaN(event.startDate.getTime()) ? formatDateForInput(event.startDate) : '');
      setEndDateStr(event.endDate instanceof Date && !isNaN(event.endDate.getTime()) ? formatDateForInput(event.endDate) : '');
      setError(null);
    } else {
      // Reset fields when modal is closed or no event is provided
      setLabel('');
      setColor('default');
      setStartDateStr('');
      setEndDateStr('');
      setError(null);
    }
  }, [event]); // Rerun effect when the event prop changes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    // Parse dates, ensuring they are treated as local dates
    // Adding 'T00:00:00' makes it UTC midnight, which might shift the date depending on timezone.
    // Instead, parse the date string directly, which JS Date constructor usually interprets as local time.
    // However, to be safe and consistent, let's construct from parts or use UTC midnight and adjust.
    const startDateParts = startDateStr.split('-').map(Number);
    const endDateParts = endDateStr.split('-').map(Number);

    // Construct dates using UTC to avoid timezone issues during construction,
    // but represent the *intended* local date.
    const startDate = new Date(Date.UTC(startDateParts[0], startDateParts[1] - 1, startDateParts[2]));
    const endDate = new Date(Date.UTC(endDateParts[0], endDateParts[1] - 1, endDateParts[2]));


    // Basic validation
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setError('Invalid date format. Please use YYYY-MM-DD.');
      return;
    }
    if (endDate < startDate) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    const savedEvent: TimelineEventData = {
      ...event, // Keep original id (temporary for new) and rowId
      label: label.trim() || (isAddingNew ? 'New Event' : 'Untitled Event'), // Use different default label
      color: color,
      startDate: startDate,
      endDate: endDate,
    };
    onSaveEvent(savedEvent); // Call the save handler passed from parent
    // No need to call onRequestClose here, parent handles it after saving
  };

  if (!event) return null;

  const modalTitle = isAddingNew ? 'Add New Event' : 'Edit Event';

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel={modalTitle}
      appElement={document.getElementById('root') || undefined}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">{modalTitle}</h2>
        <button onClick={onRequestClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        {/* Label Input */}
        <div className="mb-4">
          <label htmlFor="eventLabel" className="block text-sm font-medium text-gray-600 mb-1">
            Label
          </label>
          <input
            type="text"
            id="eventLabel"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="eventStartDate" className="block text-sm font-medium text-gray-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="eventStartDate"
              value={startDateStr}
              onChange={(e) => { setStartDateStr(e.target.value); setError(null); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <div>
            <label htmlFor="eventEndDate" className="block text-sm font-medium text-gray-600 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="eventEndDate"
              value={endDateStr}
              onChange={(e) => { setEndDateStr(e.target.value); setError(null); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
        </div>

        {/* Color Select */}
        <div className="mb-6">
          <label htmlFor="eventColor" className="block text-sm font-medium text-gray-600 mb-1">
            Color
          </label>
          <select
            id="eventColor"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white"
          >
            {availableColors.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c === 'default' ? 'Gray' : c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onRequestClose}
            className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            {isAddingNew ? 'Add Event' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EventEditModal;
