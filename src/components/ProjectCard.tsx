import React from 'react';
import { Building, Building2, PoundSterling, X, Plus } from 'lucide-react';

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
  image?: string | null;
  dataAvailability: {
    [key: string]: string;
  };
}

interface Category {
  name: string;
  icon: React.ComponentType<any>;
}

interface ProjectCardProps {
  project: Project;
  isConfidential: boolean;
  selectedCards: { [key: string]: boolean };
  toggleCardSelection: (id: string) => void;
  unitSystem: 'imperial' | 'metric';
  useCurrentDate: boolean;
  showCategories: boolean;
  categories: Category[];
  // State for hover effects
  hoveredCards: { [key: string]: boolean };
  setHoveredCards: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  hoveredButtons: { [key: string]: boolean };
  setHoveredButtons: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  hoveredCosts: { [key: string]: boolean };
  setHoveredCosts: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  hoveredCategories: { [key: string]: string | null };
  setHoveredCategories: React.Dispatch<React.SetStateAction<{ [key: string]: string | null }>>;
  // Helper functions
  getStatusConfig: (status: string) => { color: string; bg: string; icon?: React.ComponentType<any> };
  getStatusClasses: (status: string) => { bg: string; icon: string; text: string; tooltip: string };
  formatArea: (area: number) => string;
  formatCost: (project: Project) => string;
  formatNumber: (num: number) => string;
  getProjectImage: (project: Project) => string;
  PlaceholderContent: React.FC;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isConfidential,
  selectedCards,
  toggleCardSelection,
  unitSystem,
  useCurrentDate,
  showCategories,
  categories,
  hoveredCards,
  setHoveredCards,
  hoveredButtons, 
  setHoveredButtons,
  hoveredCosts,
  setHoveredCosts,
  hoveredCategories,
  setHoveredCategories,
  getStatusConfig,
  getStatusClasses,
  formatArea,
  formatCost,
  formatNumber,
  getProjectImage,
  PlaceholderContent
}) => {
  return (
    <div className="w-full rounded-lg overflow-hidden shadow-xl">
      <div 
        className="relative h-48 cursor-pointer overflow-hidden"
        onMouseEnter={() => setHoveredCards({ ...hoveredCards, [project.id]: true })}
        onMouseLeave={() => setHoveredCards({ ...hoveredCards, [project.id]: false })}
      >
        {!isConfidential && !project.image ? (
          <PlaceholderContent />
        ) : (
          <img 
            src={getProjectImage(project)}
            alt={isConfidential ? project.number : project.name}
            className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${hoveredCards[project.id] ? 'scale-105' : 'scale-100'}`}
          />
        )}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-700 ease-out ${hoveredCards[project.id] ? 'opacity-70' : 'opacity-100'}`}></div>
        
        <div className="absolute top-4 right-4">
          <div className="relative">
            <button
              onClick={() => toggleCardSelection(project.id)}
              onMouseEnter={() => setHoveredButtons({ ...hoveredButtons, [project.id]: true })}
              onMouseLeave={() => setHoveredButtons({ ...hoveredButtons, [project.id]: false })}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                selectedCards[project.id]
                  ? 'bg-[#E4002B] hover:bg-[#cc0027]' 
                  : 'bg-white/20 backdrop-blur-sm hover:bg-white/30'
              }`}
            >
              {selectedCards[project.id] ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Plus className="w-5 h-5 text-white" />
              )}
            </button>
            {hoveredButtons[project.id] && (
              <div className="absolute top-full right-0 mt-2 bg-white text-gray-800 px-3 py-1.5 rounded text-xs whitespace-nowrap shadow-lg animate-fade-in">
                {selectedCards[project.id] ? 'Remove from benchmarking' : 'Add to benchmarking'}
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex flex-col gap-1">
            {isConfidential ? (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white drop-shadow-lg">{project.number}</h1>
                {(() => {
                  const statusConfig = getStatusConfig(project.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div className={`${statusConfig.bg} backdrop-blur-sm w-fit rounded-full px-2.5 py-0.5 flex items-center gap-1.5 shadow-lg`}>
                      {StatusIcon && <StatusIcon className={`w-2.5 h-2.5 ${statusConfig.color}`} />}
                      <span className={`${statusConfig.color} text-xs font-medium`}>{project.status}</span>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold text-white drop-shadow-lg">{project.name}</h1>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium drop-shadow-lg">{project.number}</span>
                  {(() => {
                    const statusConfig = getStatusConfig(project.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <div className={`${statusConfig.bg} backdrop-blur-sm w-fit rounded-full px-2.5 py-0.5 flex items-center gap-1.5 shadow-lg`}>
                        {StatusIcon && <StatusIcon className={`w-2.5 h-2.5 ${statusConfig.color}`} />}
                        <span className={`${statusConfig.color} text-xs font-medium`}>{project.status}</span>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[rgb(51,63,72)] text-white p-4">
        <div className="flex items-center gap-2 text-sm mb-4">
          {project.scope.split(' • ').map((tag: string, index: number, array: string[]) => (
            <React.Fragment key={index}>
              <span className="text-gray-300">{tag}</span>
              {index < array.length - 1 && <span className="text-gray-300">•</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[rgb(41,53,62)] to-[rgb(31,43,52)] rounded-lg p-3 hover:from-[rgb(31,43,52)] hover:to-[rgb(21,33,42)] transition-all duration-300">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm text-gray-400">Latest data</div>
            </div>
            <div className="text-xl font-bold">{project.latestData}</div>
          </div>
          <div className="bg-gradient-to-br from-[rgb(41,53,62)] to-[rgb(31,43,52)] rounded-lg p-3 hover:from-[rgb(31,43,52)] hover:to-[rgb(21,33,42)] transition-all duration-300">
            <div className="flex items-center gap-2 mb-1">
              <Building className="w-4 h-4 text-gray-400" />
              <div className="text-sm text-gray-400">Area, GIA</div>
            </div>
            <div className="text-xl font-bold">{formatArea(project.area)}</div>
          </div>
          <div 
            className="bg-gradient-to-br from-[rgb(41,53,62)] to-[rgb(31,43,52)] rounded-lg p-3 hover:from-[rgb(31,43,52)] hover:to-[rgb(21,33,42)] transition-all duration-300 relative"
            onMouseEnter={() => setHoveredCosts({ ...hoveredCosts, [project.id]: true })}
            onMouseLeave={() => setHoveredCosts({ ...hoveredCosts, [project.id]: false })}
          >
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 pointer-events-none">
              {hoveredCosts[project.id] && (
                <div className="bg-white text-gray-800 px-3 py-1.5 rounded text-xs whitespace-nowrap shadow-lg animate-fade-in">
                  Current: Feb 25
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mb-1">
              <PoundSterling className="w-4 h-4 text-gray-400" />
              <div className="text-sm text-gray-400">Total cost</div>
            </div>
            <div className="text-xl font-bold">£{formatNumber(Math.round(project.area * project.costPerSqft))}</div>
          </div>
          <div className="bg-gradient-to-br from-[rgb(41,53,62)] to-[rgb(31,43,52)] rounded-lg p-3 hover:from-[rgb(31,43,52)] hover:to-[rgb(21,33,42)] transition-all duration-300">
            <div className="flex items-center gap-2 mb-1">
              <PoundSterling className="w-4 h-4 text-gray-400" />
              <div className="text-sm text-gray-400">Cost per {unitSystem === 'imperial' ? 'ft²' : 'm²'}</div>
            </div>
            <div className="text-xl font-bold">{formatCost(project)}</div>
          </div>
        </div>

        {showCategories && (
          <div className="grid grid-cols-5 gap-4 pt-4 mt-4 border-t border-[rgb(61,73,82)] animate-fade-in">
            {categories.map((category) => {
              const status = project.dataAvailability[category.name as keyof typeof project.dataAvailability];
              const statusClasses = getStatusClasses(status);
              return (
                <div 
                  key={category.name} 
                  className="flex flex-col items-center gap-2 relative"
                  onMouseEnter={() => setHoveredCategories({ ...hoveredCategories, [project.id]: category.name })}
                  onMouseLeave={() => setHoveredCategories({ ...hoveredCategories, [project.id]: null })}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
                    {hoveredCategories[project.id] === category.name && (
                      <div className="bg-white text-gray-800 px-3 py-1.5 rounded text-xs whitespace-nowrap shadow-lg animate-fade-in">
                        {statusClasses.tooltip}
                      </div>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-full ${statusClasses.bg} flex items-center justify-center transform transition-transform duration-200 hover:scale-110`}>
                    <category.icon className={`w-5 h-5 ${statusClasses.icon}`} />
                  </div>
                  <span className={`text-xs ${statusClasses.text}`}>{category.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard; 