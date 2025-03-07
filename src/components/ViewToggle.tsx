import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-0.5 flex">
      <button
        onClick={() => onViewChange('grid')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          view === 'grid'
            ? 'bg-[#E4002B] text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span>Grid</span>
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          view === 'list'
            ? 'bg-[#E4002B] text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <List className="w-4 h-4" />
        <span>List</span>
      </button>
    </div>
  );
}