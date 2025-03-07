import React from 'react';
import { Building2, X, Scale, ArrowRight, Sparkles } from 'lucide-react';
import { PrimaryProjectSelector } from './PrimaryProjectSelector';

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

interface PrimaryProjectContextProps {
  primaryProject: Project | null;
  isConfidential: boolean;
  onClearPrimary: () => void;
  projects: Project[];
  selectedProjectId: string | null;
  onProjectSelect: (id: string | null) => void;
  onFindSimilarProjects?: () => void;
}

export function PrimaryProjectContext({ 
  primaryProject, 
  isConfidential, 
  onClearPrimary,
  projects,
  selectedProjectId,
  onProjectSelect,
  onFindSimilarProjects = () => {}
}: PrimaryProjectContextProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#E4002B]" />
            <PrimaryProjectSelector
              projects={projects}
              selectedProjectId={selectedProjectId}
              onProjectSelect={onProjectSelect}
              isConfidential={isConfidential}
            />
          </div>
          
          {primaryProject && (
            <>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">
                    {isConfidential ? primaryProject.number : primaryProject.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {isConfidential ? '' : primaryProject.number}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>•</span>
                <span>{primaryProject.scope}</span>
                <span>•</span>
                <span>{primaryProject.area.toLocaleString()} ft²</span>
                <span>•</span>
                <span>£{primaryProject.costPerSqft.toFixed(2)}/ft²</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {primaryProject && (
            <button
              onClick={onFindSimilarProjects}
              className="flex items-center gap-2 bg-[#E4002B] text-white px-4 py-2 rounded-full shadow-md hover:bg-[#cc0027] transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Find Similar</span>
            </button>
          )}
          
          {primaryProject && (
            <button
              onClick={onClearPrimary}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Clear primary project"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}