import React, { useState } from 'react';
import { Header, Sidebar, MainContent, TimelineEditor } from './components'; // Import MainContent and TimelineEditor
import { TemplateData } from './types'; // Import TemplateData

function App() {
  // State to hold the selected template data. null means no template selected yet.
  const [selectedTemplateData, setSelectedTemplateData] = useState<TemplateData | null>(null);

  // Handler function to be passed to MainContent
  const handleSelectTemplate = (templateData: TemplateData) => {
    setSelectedTemplateData(templateData);
  };

  // Handler to go back to the template selection
  // We might need a button in Header or TimelineEditor later to trigger this
  const handleGoBackToTemplates = () => {
    setSelectedTemplateData(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="The AI Office Timeline Creator" />
        {/* Conditionally render MainContent or TimelineEditor */}
        {selectedTemplateData ? (
          <TimelineEditor
            key={selectedTemplateData.id} // Use key to force re-mount when template changes
            initialRows={selectedTemplateData.initialRows}
            initialEvents={selectedTemplateData.initialEvents}
            // Add a way to go back, e.g., pass handleGoBackToTemplates to a button inside TimelineEditor or Header
          />
        ) : (
          <MainContent onSelectTemplate={handleSelectTemplate} />
        )}
      </div>
    </div>
  );
}

export default App;
