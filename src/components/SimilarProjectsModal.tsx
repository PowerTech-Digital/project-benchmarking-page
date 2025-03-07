import React, { useState, useEffect } from 'react';
import { X, Building2, CircleDot, Plus, Info, Calendar, Filter, DoorClosed, Bell, Check } from 'lucide-react';

interface Project {
  id: string;
  number: string;
  name: string;
  scope: string;
  area: number;
  costPerSqft: number;
  baseCostPerSqft: number;
  netGross: number;
  latestData: string;
  status: string;
  baseDate: Date;
  similarityScore?: number;
  wcType?: string;
  receptionCost?: number;
}

interface SimilarProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryProject: Project;
  similarProjects: Project[];
  isConfidential: boolean;
  onSelectProject: (id: string) => void;
  unitSystem: 'imperial' | 'metric';
  useCurrentDate: boolean;
}

export function SimilarProjectsModal({
  isOpen,
  onClose,
  primaryProject,
  similarProjects,
  isConfidential,
  onSelectProject,
  unitSystem,
  useCurrentDate
}: SimilarProjectsModalProps) {
  const [similarityType, setSimilarityType] = useState<'default' | 'reception' | 'wc'>('default');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  
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
  
  if (!isOpen) return null;

  // Conversion functions
  const sqftToSqm = (sqft: number): number => sqft * 0.092903;
  const costPerSqftToSqm = (costPerSqft: number): number => costPerSqft / 0.092903;

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatArea = (area: number): string => {
    if (unitSystem === 'metric') {
      return `${formatNumber(Math.round(sqftToSqm(area)))} m²`;
    }
    return `${formatNumber(area)} ft²`;
  };

  const formatCost = (project: Project): string => {
    const cost = useCurrentDate ? project.costPerSqft : project.baseCostPerSqft;
    
    if (unitSystem === 'metric') {
      return `£${costPerSqftToSqm(cost).toFixed(2)}/m²`;
    }
    return `£${cost.toFixed(2)}/ft²`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'live':
        return {
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/20',
          icon: CircleDot
        };
      case 'dead':
        return {
          color: 'text-red-400',
          bg: 'bg-red-500/20',
          icon: CircleDot
        };
      case 'bid':
        return {
          color: 'text-purple-400',
          bg: 'bg-purple-500/20',
          icon: CircleDot
        };
      case 'complete':
        return {
          color: 'text-blue-400',
          bg: 'bg-blue-500/20',
          icon: CircleDot
        };
      case 'dormant':
        return {
          color: 'text-amber-400',
          bg: 'bg-amber-500/20',
          icon: CircleDot
        };
      default:
        return {
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/20',
          icon: CircleDot
        };
    }
  };

  const findSimilarProjectsByDefault = () => {
    // Extract sector and scope from primary project
    const primarySectors = primaryProject.scope.split(' • ').filter(s => 
      ['Offices', 'Mixed Use', 'Retail', 'Commercial'].includes(s)
    );
    
    const primaryScopes = primaryProject.scope.split(' • ').filter(s => 
      ['New Build', 'Refurbishment', 'Extension', 'Renovation', 'Retrofit'].includes(s)
    );
    
    // Size range: +/- 100% of primary project size
    const minSize = primaryProject.area * 0;  // 0% of primary project size
    const maxSize = primaryProject.area * 2;  // 200% of primary project size
    
    return similarProjects
      .filter(project => {
        if (project.id === primaryProject.id) return false;
        
        // Extract project sectors and scopes
        const projectSectors = project.scope.split(' • ').filter(s => 
          ['Offices', 'Mixed Use', 'Retail', 'Commercial'].includes(s)
        );
        
        const projectScopes = project.scope.split(' • ').filter(s => 
          ['New Build', 'Refurbishment', 'Extension', 'Renovation', 'Retrofit'].includes(s)
        );
        
        // Must match at least one sector
        const hasSectorMatch = primarySectors.some(s => projectSectors.includes(s));
        if (!hasSectorMatch) return false;
        
        // Must match at least one scope
        const hasScopeMatch = primaryScopes.some(s => projectScopes.includes(s));
        if (!hasScopeMatch) return false;
        
        // Must be within size range
        if (project.area < minSize || project.area > maxSize) return false;
        
        return true;
      })
      .map(project => {
        // Calculate similarity score (100% = perfect match)
        let score = 0;
        
        // Sector match (40% of score)
        const projectSectors = project.scope.split(' • ').filter(s => 
          ['Offices', 'Mixed Use', 'Retail', 'Commercial'].includes(s)
        );
        const sectorMatchRatio = primarySectors.filter(s => 
          projectSectors.includes(s)
        ).length / Math.max(primarySectors.length, projectSectors.length);
        score += sectorMatchRatio * 40;
        
        // Scope match (40% of score)
        const projectScopes = project.scope.split(' • ').filter(s => 
          ['New Build', 'Refurbishment', 'Extension', 'Renovation', 'Retrofit'].includes(s)
        );
        const scopeMatchRatio = primaryScopes.filter(s => 
          projectScopes.includes(s)
        ).length / Math.max(primaryScopes.length, projectScopes.length);
        score += scopeMatchRatio * 40;
        
        // Size similarity (20% of score)
        const sizeDiff = Math.abs(project.area - primaryProject.area) / primaryProject.area;
        const sizeScore = Math.max(0, 20 * (1 - sizeDiff / 1.0)); // 1.0 = 100% difference
        score += sizeScore;
        
        return { 
          ...project, 
          similarityScore: Math.round(score) 
        };
      })
      .sort((a, b) => b.similarityScore! - a.similarityScore!);
  };

  const findSimilarProjectsByReception = () => {
    if (!primaryProject.receptionCost) {
      // If primary project doesn't have reception cost data, return empty array
      return [];
    }

    return similarProjects
      .filter(project => {
        if (project.id === primaryProject.id) return false;
        if (!project.receptionCost) return false;
        
        // Must have reception cost data
        return true;
      })
      .map(project => {
        // Calculate similarity score (100% = perfect match)
        let score = 0;
        
        // Reception cost similarity (100% of score)
        const costDiff = Math.abs(project.receptionCost! - primaryProject.receptionCost!) / primaryProject.receptionCost!;
        const costScore = Math.max(0, 100 * (1 - costDiff / 0.5)); // 0.5 = 50% difference for 0 score
        score += costScore;
        
        return { 
          ...project, 
          similarityScore: Math.round(score) 
        };
      })
      .sort((a, b) => b.similarityScore! - a.similarityScore!);
  };

  const findSimilarProjectsByWcType = () => {
    if (!primaryProject.wcType) {
      // If primary project doesn't have WC type data, return empty array
      return [];
    }

    return similarProjects
      .filter(project => {
        if (project.id === primaryProject.id) return false;
        if (!project.wcType) return false;
        
        // Must have the same WC type
        return project.wcType === primaryProject.wcType;
      })
      .map(project => {
        // Calculate similarity score
        let score = 0;
        
        // WC type match (50% of score)
        score += 50;
        
        // Size similarity (25% of score)
        const sizeDiff = Math.abs(project.area - primaryProject.area) / primaryProject.area;
        const sizeScore = Math.max(0, 25 * (1 - sizeDiff / 1.0));
        score += sizeScore;
        
        // Cost similarity (25% of score)
        const costDiff = Math.abs(project.costPerSqft - primaryProject.costPerSqft) / primaryProject.costPerSqft;
        const costScore = Math.max(0, 25 * (1 - costDiff / 0.5));
        score += costScore;
        
        return { 
          ...project, 
          similarityScore: Math.round(score) 
        };
      })
      .sort((a, b) => b.similarityScore! - a.similarityScore!);
  };

  const getSimilarProjects = () => {
    switch (similarityType) {
      case 'reception':
        return findSimilarProjectsByReception();
      case 'wc':
        return findSimilarProjectsByWcType();
      default:
        return findSimilarProjectsByDefault();
    }
  };

  const filteredSimilarProjects = getSimilarProjects();

  const getSimilarityDescription = () => {
    switch (similarityType) {
      case 'reception':
        return "Similarity score is based on matching reception cost per ft² (100%).";
      case 'wc':
        return "Similarity score is based on matching WC type (50%), area size (25%), and cost per ft² (25%).";
      default:
        return "Similarity score is based on matching sector (40%), scope (40%), and area size (20%). Only projects with the same sector and scope that are within 100% of the primary project's area are shown.";
    }
  };

  const getAdditionalInfo = (project: Project) => {
    switch (similarityType) {
      case 'reception':
        return (
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">
              Reception: £{project.receptionCost?.toFixed(2)}/ft²
            </span>
            {primaryProject.receptionCost && (
              <span className="text-xs text-gray-500">
                ({Math.round((project.receptionCost! / primaryProject.receptionCost! - 1) * 100)}% difference)
              </span>
            )}
          </div>
        );
      case 'wc':
        return (
          <div className="flex items-center gap-2">
            <DoorClosed className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">
              WC Type: {project.wcType}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSelectProject = (id: string) => {
    onSelectProject(id);
    setSelectedProjects(prev => [...prev, id]);
  };

  const isProjectSelected = (id: string) => {
    return selectedProjects.includes(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-[#E4002B]" />
            <h2 className="text-xl font-semibold">
              Similar Projects to {isConfidential ? primaryProject.number : primaryProject.name}
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
            <div className="text-sm font-medium text-gray-700">Find similar projects by:</div>
            <div className="flex gap-2">
              <button
                onClick={() => setSimilarityType('default')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  similarityType === 'default'
                    ? 'bg-[#E4002B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sector, Scope & Size
              </button>
              <button
                onClick={() => setSimilarityType('reception')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  similarityType === 'reception'
                    ? 'bg-[#E4002B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={!primaryProject.receptionCost}
                title={!primaryProject.receptionCost ? "Primary project has no reception cost data" : ""}
              >
                <Bell className="w-3.5 h-3.5" />
                Reception Cost
              </button>
              <button
                onClick={() => setSimilarityType('wc')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  similarityType === 'wc'
                    ? 'bg-[#E4002B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={!primaryProject.wcType}
                title={!primaryProject.wcType ? "Primary project has no WC type data" : ""}
              >
                <DoorClosed className="w-3.5 h-3.5" />
                WC Type
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-[#E4002B]" />
              <span className="text-sm text-gray-600">
                {getSimilarityDescription()}
              </span>
            </div>
          </div>
          
          {filteredSimilarProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No similar projects found.</p>
              <p className="text-gray-400 mt-2">
                {similarityType === 'reception' && !primaryProject.receptionCost 
                  ? "The primary project doesn't have reception cost data."
                  : similarityType === 'wc' && !primaryProject.wcType
                    ? "The primary project doesn't have WC type data."
                    : "Try selecting a different primary project or similarity criteria."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-2">Primary Project</div>
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
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-gray-500">Scope</div>
                    <div className="text-gray-700">{primaryProject.scope}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Area</div>
                    <div className="text-gray-700">{formatArea(primaryProject.area)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Cost per {unitSystem === 'imperial' ? 'ft²' : 'm²'}</div>
                    <div className="text-gray-700">{formatCost(primaryProject)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Latest Data</div>
                    <div className="text-gray-700">{primaryProject.latestData}</div>
                  </div>
                </div>
                {similarityType === 'reception' && primaryProject.receptionCost && (
                  <div className="mt-3 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-400" />
                    <div className="text-gray-700">Reception: £{primaryProject.receptionCost.toFixed(2)}/ft²</div>
                  </div>
                )}
                {similarityType === 'wc' && primaryProject.wcType && (
                  <div className="mt-3 flex items-center gap-2">
                    <DoorClosed className="w-4 h-4 text-gray-400" />
                    <div className="text-gray-700">WC Type: {primaryProject.wcType}</div>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-500 mb-2">Similar Projects</div>
              <div className="space-y-4">
                {filteredSimilarProjects.map((project) => {
                  const statusConfig = getStatusConfig(project.status);
                  const StatusIcon = statusConfig.icon;
                  const projectSelected = isProjectSelected(project.id);
                  
                  return (
                    <div key={project.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      projectSelected ? 'bg-[#E4002B]/5 border-[#E4002B]/20' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {isConfidential ? project.number : project.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {isConfidential ? '' : project.number}
                            </div>
                          </div>
                          <div className={`${statusConfig.bg} ml-2 rounded-full px-2.5 py-0.5 flex items-center gap-1.5`}>
                            <StatusIcon className={`w-2.5 h-2.5 ${statusConfig.color}`} />
                            <span className={`${statusConfig.color} text-xs font-medium`}>{project.status}</span>
                          </div>
                        </div>
                        {projectSelected ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E4002B]/10 text-[#E4002B] rounded-full text-sm font-medium">
                            <Check className="w-3.5 h-3.5" />
                            <span>Added to Benchmarking</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSelectProject(project.id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#E4002B] text-white rounded-full text-sm font-medium hover:bg-[#cc0027] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Benchmarking</span>
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-5 gap-4 mt-4">
                        <div>
                          <div className="text-sm text-gray-500">Scope</div>
                          <div className="text-gray-700">{project.scope}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Area</div>
                          <div className="text-gray-700">{formatArea(project.area)}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round((project.area / primaryProject.area - 1) * 100)}% difference
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Cost per {unitSystem === 'imperial' ? 'ft²' : 'm²'}</div>
                          <div className="text-gray-700">{formatCost(project)}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(((useCurrentDate ? project.costPerSqft : project.baseCostPerSqft) / 
                                        (useCurrentDate ? primaryProject.costPerSqft : primaryProject.baseCostPerSqft) - 1) * 100)}% difference
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Latest Data</div>
                          <div className="text-gray-700">{project.latestData}</div>
                        </div>
                        <div>
                           <div className="text-sm text-gray-500">Base Date</div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-700">{formatDate(project.baseDate)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500">Similarity</div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div 
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < Math.round((project.similarityScore || 0) / 20) 
                                    ? 'bg-[#E4002B]' 
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-gray-700">
                              {project.similarityScore}%
                            </span>
                          </div>
                        </div>
                        {getAdditionalInfo(project)}
                      </div>
                    </div>
                  );
                })}
              </div>
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