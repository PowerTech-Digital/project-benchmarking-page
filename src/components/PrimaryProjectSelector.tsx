import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface Project {
  id: string;
  number: string;
  name: string;
  scope: string;
  area: number;
  costPerSqft: number;
  netGross: number;
  latestData: string;
  status: string;
}

interface PrimaryProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string | null;
  onProjectSelect: (id: string | null) => void;
  isConfidential: boolean;
}

export function PrimaryProjectSelector({ projects, selectedProjectId, onProjectSelect, isConfidential }: PrimaryProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Update search term when a project is selected
  useEffect(() => {
    if (selectedProjectId) {
      const selectedProject = projects.find(p => p.id === selectedProjectId);
      if (selectedProject) {
        setSearchTerm(isConfidential ? selectedProject.number : selectedProject.name);
      }
    } else {
      setSearchTerm('');
    }
  }, [selectedProjectId, projects, isConfidential]);

  const filteredProjects = searchTerm.trim() === '' 
    ? projects 
    : projects.filter(project => {
        const projectName = isConfidential ? project.number : project.name;
        const projectNumber = project.number;
        
        return projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
               projectNumber.toLowerCase().includes(searchTerm.toLowerCase());
      });

  const handleSelectProject = (id: string | null) => {
    onProjectSelect(id);
    setIsOpen(false);
  };

  const handleInputClick = () => {
    setIsOpen(true);
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onProjectSelect(null);
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="flex items-center bg-white text-gray-900 text-sm rounded-lg pl-3 pr-8 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-[#E4002B] focus-within:border-transparent cursor-pointer min-w-[250px] relative"
        onClick={handleInputClick}
      >
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder="Select Primary Project"
          className="outline-none border-none w-full bg-transparent"
        />
        {searchTerm && (
          <button 
            onClick={handleClearSelection}
            className="absolute right-8 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 pointer-events-none" />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-fade-in">
          <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E4002B] focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            {filteredProjects.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                No projects found
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleSelectProject(project.id)}
                  className={`px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                    selectedProjectId === project.id ? 'bg-[#E4002B]/5 text-[#E4002B]' : ''
                  }`}
                >
                  <div className="font-medium">
                    {isConfidential ? project.number : project.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isConfidential ? '' : project.number} • {project.scope}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}