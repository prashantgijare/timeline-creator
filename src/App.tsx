import React, { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import TimelineEditor from './components/TimelineEditor' // Import the new component

function App() {
  // Basic state to toggle between views (example)
  // For now, we'll directly show the TimelineEditor
  // const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {/* Replace MainContent with TimelineEditor */}
        {/* {showEditor ? <TimelineEditor /> : <MainContent />} */}
        <TimelineEditor />
        <FeedbackTab />
      </div>
    </div>
  )
}

// Simple Feedback Tab component for the side
const FeedbackTab = () => (
  <div className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-2 rounded-l-md cursor-pointer shadow-md hover:bg-orange-600 transition-colors z-10">
    <span className="writing-mode-vertical-rl rotate-180">Feedback</span>
  </div>
)


export default App
