import { useState } from 'react';
import { Building2, CircleDot, Plus, X, ChevronUp, ChevronDown, Scale } from 'lucide-react';

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
}

interface ProjectListProps {
  projects: Project[];
  isConfidential: boolean;
  selectedCards: { [key: string]: boolean };
  toggleCardSelection: (id: string) => void;
  primaryProjectId: string | null;
  unitSystem: 'imperial' | 'metric';
  useCurrentDate: boolean;
}

type SortField = 'name' | 'status' | 'scope' | 'area' | 'costPerSqft' | 'netGross' | 'latestData';
type SortDirection = 'asc' | 'desc';

export function ProjectList({ 
  projects, 
  isConfidential, 
  selectedCards, 
  toggleCardSelection, 
  primaryProjectId,
  unitSystem,
  useCurrentDate
}: ProjectListProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'live':
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
      case 'dead':
        return { color: 'text-red-400', bg: 'bg-red-500/20' };
      case 'bid':
        return { color: 'text-purple-400', bg: 'bg-purple-500/20' };
      case 'complete':
        return { color: 'text-blue-400', bg: 'bg-blue-500/20' };
      case 'dormant':
        return { color: 'text-amber-400', bg: 'bg-amber-500/20' };
      default:
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    }
  };

  // Conversion functions
  const sqftToSqm = (sqft: number): number => sqft * 0.092903;
  const costPerSqftToSqm = (costPerSqft: number): number => costPerSqft / 0.092903;

  const formatNumber = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortProjects = (projectsToSort: Project[]) => {
    return [...projectsToSort].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'name':
          return (isConfidential ? a.number : a.name).localeCompare(isConfidential ? b.number : b.name) * direction;
        case 'status':
          return a.status.localeCompare(b.status) * direction;
        case 'scope':
          return a.scope.localeCompare(b.scope) * direction;
        case 'area':
          return (a.area - b.area) * direction;
        case 'costPerSqft':
          const costA = useCurrentDate ? a.costPerSqft : a.baseCostPerSqft;
          const costB = useCurrentDate ? b.costPerSqft : b.baseCostPerSqft;
          return (costA - costB) * direction;
        case 'netGross':
          return (a.netGross - b.netGross) * direction;
        case 'latestData':
          return a.latestData.localeCompare(b.latestData) * direction;
        default:
          return 0;
      }
    });
  };

  const selectedProjects = sortProjects(projects.filter(p => selectedCards[p.id]));
  const unselectedProjects = sortProjects(projects.filter(p => !selectedCards[p.id]));

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th 
      className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronUp className={`w-3 h-3 -mb-1 ${sortField === field && sortDirection === 'asc' ? 'text-[#E4002B]' : ''}`} />
          <ChevronDown className={`w-3 h-3 ${sortField === field && sortDirection === 'desc' ? 'text-[#E4002B]' : ''}`} />
        </div>
      </div>
    </th>
  );

  const ProjectTable = ({ projects, showHeader = true }: { projects: Project[], showHeader?: boolean }) => (
    <table className="w-full">
      {showHeader && (
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="w-10 px-6 py-3"></th>
            <SortHeader field="name" label="Project" />
            <SortHeader field="status" label="Status" />
            <SortHeader field="scope" label="Scope" />
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group" onClick={() => handleSort('area')}>
              <div className="flex items-center justify-end gap-1">
                Area ({unitSystem === 'imperial' ? 'ft²' : 'm²'})
                <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronUp className={`w-3 h-3 -mb-1 ${sortField === 'area' && sortDirection === 'asc' ? 'text-[#E4002B]' : ''}`} />
                  <ChevronDown className={`w-3 h-3 ${sortField === 'area' && sortDirection === 'desc' ? 'text-[#E4002B]' : ''}`} />
                </div>
              </div>
            </th>
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group" onClick={() => handleSort('costPerSqft')}>
              <div className="flex items-center justify-end gap-1">
                Cost/{unitSystem === 'imperial' ? 'ft²' : 'm²'}
                <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronUp className={`w-3 h-3 -mb-1 ${sortField === 'costPerSqft' && sortDirection === 'asc' ? 'text-[#E4002B]' : ''}`} />
                  <ChevronDown className={`w-3 h-3 ${sortField === 'costPerSqft' && sortDirection === 'desc' ? 'text-[#E4002B]' : ''}`} />
                </div>
              </div>
            </th>
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group" onClick={() => handleSort('netGross')}>
              <div className="flex items-center justify-end gap-1">
                Net:Gross
                <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronUp className={`w-3 h-3 -mb-1 ${sortField === 'netGross' && sortDirection === 'asc' ? 'text-[#E4002B]' : ''}`} />
                  <ChevronDown className={`w-3 h-3 ${sortField === 'netGross' && sortDirection === 'desc' ? 'text-[#E4002B]' : ''}`} />
                </div>
              </div>
            </th>
            <SortHeader field="latestData" label="Latest Data" />
          </tr>
        </thead>
      )}
      <tbody className="divide-y divide-gray-200">
        {projects.map((project) => {
          const statusConfig = getStatusConfig(project.status);
          const isSelected = selectedCards[project.id];
          
          return (
            <tr key={project.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-[#E4002B]/5' : ''}`}>
              <td className="px-6 py-4">
                <button
                  onClick={() => toggleCardSelection(project.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#E4002B] hover:bg-[#cc0027]'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {isSelected ? (
                    <X className="w-4 h-4 text-white" />
                  ) : (
                    <Plus className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {isConfidential ? project.number : project.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isConfidential ? '' : project.number}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className={`inline-flex items-center gap-1.5 ${statusConfig.bg} px-2.5 py-0.5 rounded-full`}>
                  <CircleDot className={`w-2.5 h-2.5 ${statusConfig.color}`} />
                  <span className={`text-xs font-medium ${statusConfig.color}`}>{project.status}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{project.scope}</div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="text-sm text-gray-900">{formatArea(project.area)}</div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="text-sm text-gray-900">{formatCost(project)}</div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="text-sm text-gray-900">{project.netGross}%</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{project.latestData}</div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-8">
      {selectedProjects.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-[#E4002B]/5 border-b border-[#E4002B]/10">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#E4002B]" />
              <h2 className="text-lg font-medium text-[#E4002B]">
                {primaryProjectId ? 'Comparison Projects' : 'Benchmarking Selection'} ({selectedProjects.length} {selectedProjects.length === 1 ? 'project' : 'projects'})
              </h2>
            </div>
          </div>
          <ProjectTable projects={selectedProjects} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {selectedProjects.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-700">
              All Projects ({unselectedProjects.length})
            </h2>
          </div>
        )}
        <ProjectTable projects={unselectedProjects} showHeader={selectedProjects.length === 0} />
      </div>
    </div>
  );
}