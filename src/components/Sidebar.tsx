import React from 'react'
import { Plus, Folder, CheckCircle, Download, Share2, Palette } from 'lucide-react'

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-50 p-4 border-r border-gray-200 flex flex-col space-y-6 overflow-y-auto">
      <button className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2 font-medium">
        <Plus size={18} />
        <span>New</span>
      </button>

      <div className="flex items-center space-x-2 text-gray-600 cursor-pointer hover:text-gray-800">
        <Folder size={18} />
        <span className="font-medium">My timelines (0)</span>
      </div>

      <div className="mt-auto pt-6 border-t border-gray-200">
         {/* Placeholder for illustration */}
         <div className="flex justify-center mb-4">
            <img src="https://via.placeholder.com/100x80.png?text=Illustration" alt="Illustration" className="rounded" />
         </div>
        <h3 className="font-semibold text-gray-700 mb-2">Things to try...</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-500" />
            <span>Create & style</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-500" />
            <span>Share & collaborate</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-500" />
            <span>Download & present</span>
          </li>
        </ul>
      </div>
    </aside>
  )
}

export default Sidebar
