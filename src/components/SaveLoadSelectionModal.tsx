import React, { useState, useEffect } from 'react';
import { X, Save, FolderOpen, Trash2, Check, AlertCircle } from 'lucide-react';

interface SavedSelection {
  id: string;
  name: string;
  date: string;
  projectIds: string[];
  description?: string;
}

interface Project {
  id: string;
  number: string;
  name: string;
}

interface SaveLoadSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCards: { [key: string]: boolean };
  onLoadSelection: (selection: { [key: string]: boolean }) => void;
  projects: Project[];
  isConfidential?: boolean;
}

export function SaveLoadSelectionModal({
  isOpen,
  onClose,
  selectedCards,
  onLoadSelection,
  projects,
  isConfidential = false
}: SaveLoadSelectionModalProps) {
  const [mode, setMode] = useState<'save' | 'load'>('load');
  const [savedSelections, setSavedSelections] = useState<SavedSelection[]>([]);
  const [newSelectionName, setNewSelectionName] = useState('');
  const [newSelectionDescription, setNewSelectionDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Load saved selections from localStorage on mount
  useEffect(() => {
    const loadSavedSelections = () => {
      const saved = localStorage.getItem('projectSelections');
      if (saved) {
        try {
          setSavedSelections(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved selections', e);
          setSavedSelections([]);
        }
      }
    };
    
    loadSavedSelections();
  }, [isOpen]);
  
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscKey);
    }

    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    // Set initial mode based on whether there are selected cards
    const selectedCount = Object.values(selectedCards).filter(Boolean).length;
    setMode(selectedCount > 0 ? 'save' : 'load');
  }, [selectedCards, isOpen]);

  const handleSaveSelection = () => {
    if (!newSelectionName.trim()) {
      setErrorMessage('Please enter a name for your selection');
      return;
    }

    // Check if name already exists
    if (savedSelections.some(s => s.name.toLowerCase() === newSelectionName.toLowerCase())) {
      setErrorMessage('A selection with this name already exists');
      return;
    }

    const selectedProjectIds = Object.entries(selectedCards)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);

    if (selectedProjectIds.length === 0) {
      setErrorMessage('Please select at least one project to save');
      return;
    }

    const newSelection: SavedSelection = {
      id: Date.now().toString(),
      name: newSelectionName,
      date: new Date().toISOString(),
      projectIds: selectedProjectIds,
      description: newSelectionDescription || undefined
    };

    const updatedSelections = [...savedSelections, newSelection];
    setSavedSelections(updatedSelections);
    localStorage.setItem('projectSelections', JSON.stringify(updatedSelections));
    
    setNewSelectionName('');
    setNewSelectionDescription('');
    setErrorMessage('');
    setSuccessMessage('Selection saved successfully');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const handleLoadSelection = (selection: SavedSelection) => {
    const newSelectedCards: { [key: string]: boolean } = {};
    
    // Set all selected project IDs to true
    selection.projectIds.forEach(id => {
      newSelectedCards[id] = true;
    });
    
    onLoadSelection(newSelectedCards);
    onClose();
  };

  const handleDeleteSelection = (id: string) => {
    const updatedSelections = savedSelections.filter(s => s.id !== id);
    setSavedSelections(updatedSelections);
    localStorage.setItem('projectSelections', JSON.stringify(updatedSelections));
  };

  const getProjectDisplay = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return id;
    
    // In confidential mode, show project number instead of name
    return isConfidential ? project.number : project.name;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {mode === 'save' ? (
              <Save className="w-6 h-6 text-[#E4002B]" />
            ) : (
              <FolderOpen className="w-6 h-6 text-[#E4002B]" />
            )}
            <h2 className="text-xl font-semibold">
              {mode === 'save' ? 'Save Selection' : 'Load Selection'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setMode('save')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'save'
                  ? 'bg-[#E4002B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                <span>Save Selection</span>
              </div>
            </button>
            <button
              onClick={() => setMode('load')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'load'
                  ? 'bg-[#E4002B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                <span>Load Selection</span>
              </div>
            </button>
          </div>
          
          {mode === 'save' && (
            <div className="space-y-4">
              {errorMessage && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <span>{errorMessage}</span>
                </div>
              )}
              
              {successMessage && (
                <div className="bg-green-50 text-green-600 p-3 rounded-md flex items-center gap-2 mb-4">
                  <Check className="w-5 h-5" />
                  <span>{successMessage}</span>
                </div>
              )}
              
              <div>
                <label htmlFor="selection-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Selection Name
                </label>
                <input
                  type="text"
                  id="selection-name"
                  value={newSelectionName}
                  onChange={(e) => setNewSelectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4002B] focus:border-transparent"
                  placeholder="Enter a name for this selection"
                />
              </div>
              
              <div>
                <label htmlFor="selection-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="selection-description"
                  value={newSelectionDescription}
                  onChange={(e) => setNewSelectionDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4002B] focus:border-transparent h-24"
                  placeholder="Add a description for this selection"
                />
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Projects</h3>
                <div className="border border-gray-200 rounded-md p-3 max-h-60 overflow-y-auto">
                  {Object.entries(selectedCards)
                    .filter(([_, isSelected]) => isSelected)
                    .map(([id]) => (
                      <div key={id} className="py-1.5 flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#E4002B] rounded-full"></div>
                        <span>{getProjectDisplay(id)}</span>
                      </div>
                    ))}
                  
                  {Object.values(selectedCards).filter(Boolean).length === 0 && (
                    <div className="text-gray-500 text-sm py-2">
                      No projects selected. Please select projects before saving.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleSaveSelection}
                  disabled={Object.values(selectedCards).filter(Boolean).length === 0}
                  className={`w-full py-2 rounded-md text-white font-medium flex items-center justify-center gap-2 ${
                    Object.values(selectedCards).filter(Boolean).length === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-[#E4002B] hover:bg-[#cc0027]'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>Save Selection</span>
                </button>
              </div>
            </div>
          )}
          
          {mode === 'load' && (
            <div>
              {savedSelections.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No saved selections found</p>
                  <p className="text-gray-400 mt-2">
                    Select projects and save them to create your first selection
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedSelections.map((selection) => (
                    <div key={selection.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-lg text-gray-800">{selection.name}</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLoadSelection(selection)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E4002B] text-white rounded-md text-sm font-medium hover:bg-[#cc0027] transition-colors"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Load</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSelection(selection.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            title="Delete selection"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {selection.description && (
                        <p className="text-gray-600 text-sm mb-3">{selection.description}</p>
                      )}
                      
                      <div className="text-xs text-gray-500 mb-2">
                        Saved on {new Date(selection.date).toLocaleDateString()} • {selection.projectIds.length} projects
                      </div>
                      
                      <div className="border border-gray-100 rounded bg-gray-50 p-2 max-h-32 overflow-y-auto">
                        {selection.projectIds.map((id) => (
                          <div key={id} className="py-1 text-sm text-gray-700">
                            • {getProjectDisplay(id)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}