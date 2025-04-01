import React from 'react'
import { GanttChartSquare, HelpCircle, LogIn } from 'lucide-react'

const Header: React.FC = () => {
  return (
    <header className="bg-orange-600 text-white flex items-center justify-between p-3 shadow-md z-20">
      <div className="flex items-center space-x-2">
        <GanttChartSquare size={28} />
        {/* Updated Header Text */}
        <h1 className="text-xl font-semibold">The AI Office Timeline Creator</h1>
      </div>
      <div className="flex items-center space-x-3">
        <button className="bg-white text-orange-600 px-4 py-1.5 rounded font-medium hover:bg-gray-100 transition-colors text-sm">
          Create free account
        </button>
        <button className="border border-white text-white px-4 py-1.5 rounded font-medium hover:bg-white hover:text-orange-600 transition-colors text-sm flex items-center space-x-1">
          <LogIn size={16} />
          <span>Login</span>
        </button>
        <button className="text-white hover:bg-orange-700 p-1.5 rounded-full transition-colors">
          <HelpCircle size={20} />
        </button>
      </div>
    </header>
  )
}

export default Header
