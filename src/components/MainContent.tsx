import React from 'react'
import { FileText, UploadCloud, PlusSquare, ArrowRight } from 'lucide-react'

const templates = [
  { id: 1, title: 'Get unlimited timelines', subtitle: 'Learn more', img: 'https://via.placeholder.com/200x120.png?text=Template+1', link: true },
  { id: 2, title: 'Simple Software Development Plan', subtitle: 'Software Dev', img: 'https://via.placeholder.com/200x120.png?text=Template+2', tag: 'Free' },
  { id: 3, title: 'Simple Product Launch Plan', subtitle: 'Projects', img: 'https://via.placeholder.com/200x120.png?text=Template+3', tag: 'Free' },
  { id: 4, title: 'Detailed Development Roadmap', subtitle: 'Roadmaps', img: 'https://via.placeholder.com/200x120.png?text=Template+4', locked: true },
  { id: 5, title: 'Development & Release Swimlanes', subtitle: 'Roadmaps', img: 'https://via.placeholder.com/200x120.png?text=Template+5', locked: true },
  { id: 6, title: 'Simple Planning Roadmap', subtitle: 'Projects', img: 'https://via.placeholder.com/200x120.png?text=Template+6', tag: 'Free' },
  { id: 7, title: 'Systems Planning Portfolio', subtitle: 'Projects', img: 'https://via.placeholder.com/200x120.png?text=Template+7', locked: true },
  { id: 8, title: 'Product Launch Plan', subtitle: 'Projects', img: 'https://via.placeholder.com/200x120.png?text=Template+8', locked: true },
]

const MainContent: React.FC = () => {
  return (
    <main className="flex-1 bg-white p-8 overflow-y-auto">
      <h2 className="text-2xl font-light text-gray-700 mb-6">Start new</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* From template */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow">
          <img src="https://via.placeholder.com/100x60.png?text=Template" alt="Template preview" className="mb-3 border border-gray-300" />
          <FileText size={24} className="text-orange-600 mb-2" />
          <span className="font-medium text-gray-700">From template</span>
        </div>

        {/* Import data */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow">
           {/* Placeholder for Excel/Project icons */}
           <div className="flex space-x-2 mb-3">
             <div className="w-8 h-8 bg-green-600 rounded"></div>
             <div className="w-8 h-8 bg-blue-800 rounded"></div>
             <div className="w-8 h-8 bg-blue-500 rounded"></div>
           </div>
          <UploadCloud size={24} className="text-orange-600 mb-2" />
          <span className="font-medium text-gray-700">Import data</span>
        </div>

        {/* From scratch */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow">
          <div className="w-20 h-12 flex items-center justify-center mb-3">
             <PlusSquare size={40} className="text-orange-600" />
          </div>
          <PlusSquare size={24} className="text-orange-600 mb-2 invisible" /> {/* Placeholder for alignment */}
          <span className="font-medium text-gray-700">From scratch</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-light text-gray-700">Template gallery</h2>
        <a href="#" className="text-sm text-orange-600 hover:underline flex items-center">
          More templates <ArrowRight size={16} className="ml-1" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white border border-gray-200 rounded overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group relative">
            <img src={template.img} alt={template.title} className="w-full h-32 object-cover" />
            {template.tag && (
              <span className="absolute top-1 right-1 bg-green-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                {template.tag}
              </span>
            )}
             {template.locked && (
              <span className="absolute top-1 right-1 bg-gray-400 text-white p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </span>
            )}
            <div className="p-3">
              <h4 className="font-medium text-sm text-gray-800 truncate group-hover:text-orange-600">{template.title}</h4>
              {template.link ? (
                 <a href="#" className="text-xs text-orange-600 hover:underline">{template.subtitle}</a>
              ) : (
                 <p className="text-xs text-gray-500">{template.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>
       <div className="text-center mt-6">
         <a href="#" className="text-sm text-orange-600 hover:underline flex items-center justify-center">
          More templates <ArrowRight size={16} className="ml-1" />
        </a>
       </div>
    </main>
  )
}

export default MainContent
