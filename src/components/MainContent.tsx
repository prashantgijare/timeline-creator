// Recreate MainContent based on Image-1 (Template Gallery)
import React from 'react';
import { TemplateData } from '../types'; // Import the new TemplateData type

// --- Placeholder Template Data ---
// In a real app, this would likely come from an API or a configuration file
const placeholderTemplates: TemplateData[] = [
  {
    id: 'tpl-blank',
    name: 'Blank Canvas',
    description: 'Start with an empty timeline.',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&h=600&fit=crop', // Placeholder image
    initialRows: [],
    initialEvents: [],
  },
  {
    id: 'tpl-project',
    name: 'Project Plan',
    description: 'Basic structure for a project timeline.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&h=600&fit=crop', // Placeholder image
    initialRows: [
      { id: 'proj-r1', label: 'Planning' },
      { id: 'proj-r2', label: 'Development' },
      { id: 'proj-r3', label: 'Testing' },
      { id: 'proj-r4', label: 'Deployment' },
    ],
    initialEvents: [
      { id: 'proj-e1', rowId: 'proj-r1', label: 'Initial Meeting', startDate: new Date(2024, 0, 5), endDate: new Date(2024, 0, 7), color: 'blue' },
      { id: 'proj-e2', rowId: 'proj-r2', label: 'Core Feature Dev', startDate: new Date(2024, 0, 10), endDate: new Date(2024, 1, 15), color: 'green' },
      { id: 'proj-e3', rowId: 'proj-r3', label: 'QA Cycle 1', startDate: new Date(2024, 1, 16), endDate: new Date(2024, 1, 28), color: 'red' },
      { id: 'proj-e4', rowId: 'proj-r4', label: 'Production Rollout', startDate: new Date(2024, 2, 1), endDate: new Date(2024, 2, 5), color: 'default' },
    ],
  },
  {
    id: 'tpl-marketing',
    name: 'Marketing Campaign',
    description: 'Timeline for launching a marketing campaign.',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&h=600&fit=crop', // Placeholder image
    initialRows: [
      { id: 'mkt-r1', label: 'Strategy' },
      { id: 'mkt-r2', label: 'Content Creation' },
      { id: 'mkt-r3', label: 'Promotion' },
      { id: 'mkt-r4', label: 'Analysis' },
    ],
    initialEvents: [
      { id: 'mkt-e1', rowId: 'mkt-r1', label: 'Define Goals', startDate: new Date(2024, 2, 1), endDate: new Date(2024, 2, 7), color: 'blue' },
      { id: 'mkt-e2', rowId: 'mkt-r2', label: 'Blog Posts', startDate: new Date(2024, 2, 8), endDate: new Date(2024, 2, 20), color: 'green' },
      { id: 'mkt-e3', rowId: 'mkt-r2', label: 'Social Media Assets', startDate: new Date(2024, 2, 15), endDate: new Date(2024, 2, 28), color: 'green' },
      { id: 'mkt-e4', rowId: 'mkt-r3', label: 'Launch Ads', startDate: new Date(2024, 3, 1), endDate: new Date(2024, 3, 30), color: 'red' },
      { id: 'mkt-e5', rowId: 'mkt-r4', label: 'Report Results', startDate: new Date(2024, 4, 1), endDate: new Date(2024, 4, 7), color: 'default' },
    ],
  },
  // Add more templates as needed
];
// --- End Placeholder Template Data ---

interface MainContentProps {
  onSelectTemplate: (templateData: TemplateData) => void; // Function to call when a template is selected
}

const MainContent: React.FC<MainContentProps> = ({ onSelectTemplate }) => {
  return (
    <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Choose a Template</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {placeholderTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col"
            onClick={() => onSelectTemplate(template)} // Call the handler on click
          >
            <img
              src={template.imageUrl}
              alt={template.name}
              className="w-full h-40 object-cover" // Fixed height for consistency
            />
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold text-gray-700 mb-1">{template.name}</h3>
              <p className="text-sm text-gray-500 flex-grow">{template.description}</p>
              <button
                 className="mt-4 w-full bg-orange-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                 onClick={(e) => {
                    e.stopPropagation(); // Prevent card click from firing again
                    onSelectTemplate(template);
                 }}
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default MainContent;
