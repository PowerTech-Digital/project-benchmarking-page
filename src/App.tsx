import React, { useState, useMemo, useEffect } from 'react';
import { Building2, PoundSterling, CircleDot, Building, Eye, EyeOff, Plus, X, Calendar, DoorClosed, Bell, ChevronDown, ChevronUp, BarChart2, CheckCircle2, AlertCircle, Search, Filter, Sparkles, Check, Save, FolderOpen } from 'lucide-react';
import { FilterHeader } from './components/FilterHeader';
import { ViewToggle } from './components/ViewToggle';
import { ProjectList } from './components/ProjectList';
import { PrimaryProjectContext } from './components/PrimaryProjectContext';
import { SimilarProjectsModal } from './components/SimilarProjectsModal';
import { SaveLoadSelectionModal } from './components/SaveLoadSelectionModal';
import { UnitToggle } from './components/UnitToggle';
import ProjectCard from './components/ProjectCard';

function App() {
  const [isConfidential, setIsConfidential] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [hoveredCategories, setHoveredCategories] = useState<{ [key: string]: string | null }>({});
  const [hoveredCards, setHoveredCards] = useState<{ [key: string]: boolean }>({});
  const [hoveredButtons, setHoveredButtons] = useState<{ [key: string]: boolean }>({});
  const [selectedCards, setSelectedCards] = useState<{ [key: string]: boolean }>({});
  const [hoveredCosts, setHoveredCosts] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [primaryProjectId, setPrimaryProjectId] = useState<string | null>(null);
  const [wcTypes, setWcTypes] = useState<string[]>([]);
  const [latestDataFilter, setLatestDataFilter] = useState<string[]>([]);
  const [showSimilarProjectsModal, setShowSimilarProjectsModal] = useState(false);
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);
  const [unitSystem, setUnitSystem] = useState<'imperial' | 'metric'>('imperial');
  const [useCurrentDate, setUseCurrentDate] = useState(true);
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(new Date().setFullYear(new Date().getFullYear() - 5)),
    new Date()
  ]);
  const [filters, setFilters] = useState({
    sector: [] as string[],
    scope: [] as string[],
    location: [] as string[],
    cost: [400, 800] as [number, number],
    size: [0, 150000] as [number, number],
    reception: [0, 1000] as [number, number],
    wc: [0, 20000] as [number, number],
    clients: [] as string[]
  });

  const buildingImages = [
    null,
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1582657118090-af35eefc4e48?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1577613170315-0a73d3d24c1a?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1554435493-93422e8d1c46?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=800"
  ];

  const filterOptions = {
    sector: ['Offices', 'Mixed Use', 'Retail', 'Commercial'],
    scope: ['New Build', 'Refurbishment', 'Extension', 'Renovation', 'Retrofit'],
    location: ['Liverpool St', 'Moorgate', 'Bank', 'Spitalfields', 'Euston', 'City', 'Shoreditch'],
    latestData: ['Cost Model 1', 'Cost Model 2', 'Cost Model 3', 'Cost Model 4', 'Final Account', 'Contract Sum']
  };

  const baseProjects = [
    {
      id: 'bunker-1',
      number: "BNK-01",
      name: "Bunker Scheme Alpha",
      image: null,
      scope: "Offices • New Build • City",
      area: 75000,
      costPerSqft: 525.50,
      baseCostPerSqft: 510.25,
      netGross: 78,
      latestData: "Cost Model 1",
      status: "Live",
      baseDate: new Date('2024-01-15'),
      dataAvailability: {
        Areas: 'complete',
        Cost: 'complete',
        Programme: 'complete',
        WC: 'complete',
        Reception: 'complete'
      },
      wcType: "Superloo Only"
    },
    {
      id: '1',
      number: "NEP-22",
      name: "1 Broadgate",
      image: buildingImages[0],
      scope: "Offices • New Build • Liverpool St",
      area: 82427,
      costPerSqft: 497.96,
      baseCostPerSqft: 485.30,
      netGross: 75,
      latestData: "Cost Model 2",
      status: "Live",
      baseDate: new Date('2023-11-05'),
      dataAvailability: {
        Areas: 'complete',
        Cost: 'complete',
        Programme: 'complete',
        WC: 'partial',
        Reception: 'partial'
      }
    },
    {
      id: '2',
      number: "NEP-23",
      name: "2 Finsbury Avenue",
      image: buildingImages[1],
      scope: "Mixed Use • Refurbishment • Moorgate",
      area: 95750,
      costPerSqft: 542.30,
      baseCostPerSqft: 530.15,
      netGross: 69,
      latestData: "Cost Model 3",
      status: "Dead",
      baseDate: new Date('2022-08-22'),
      dataAvailability: {
        Areas: 'complete',
        Cost: 'partial',
        Programme: 'none',
        WC: 'complete',
        Reception: 'complete'
      },
      wcType: "Superloo Only",
      receptionCost: 650
    },
    {
      id: '3',
      number: "NEP-24",
      name: "100 Liverpool Street",
      image: buildingImages[2],
      scope: "Retail • New Build • Bank",
      area: 68900,
      costPerSqft: 623.45,
      baseCostPerSqft: 605.80,
      netGross: 62,
      latestData: "Final Account",
      status: "Complete",
      baseDate: new Date('2022-03-10'),
      dataAvailability: {
        Areas: 'complete',
        Cost: 'complete',
        Programme: 'partial',
        WC: 'complete',
        Reception: 'none'
      }
    },
    {
      id: '4',
      number: "NEP-25",
      name: "Norton Folgate",
      image: buildingImages[3],
      scope: "Offices • Extension • Spitalfields",
      area: 124500,
      costPerSqft: 478.15,
      baseCostPerSqft: 465.90,
      netGross: 81,
      latestData: "Cost Model 4",
      status: "Bid",
      baseDate: new Date('2024-04-18'),
      dataAvailability: {
        Areas: 'partial',
        Cost: 'partial',
        Programme: 'none',
        WC: 'none',
        Reception: 'none'
      }
    },
    {
      id: '5',
      number: "NEP-26",
      name: "1 Triton Square",
      image: buildingImages[4],
      scope: "Commercial • Renovation • Euston",
      area: 73200,
      costPerSqft: 556.80,
      baseCostPerSqft: 540.50,
      netGross: 83,
      latestData: "Final Account",
      status: "Complete",
      baseDate: new Date('2023-07-30'),
      dataAvailability: {
        Areas: 'complete',
        Cost: 'complete',
        Programme: 'complete',
        WC: 'complete',
        Reception: 'complete'
      }
    },
    {
      id: '6',
      number: "NEP-27",
      name: "135 Bishopsgate",
      image: buildingImages[5],
      scope: "Offices • Retrofit • City",
      area: 88600,
      costPerSqft: 512.90,
      baseCostPerSqft: 498.75,
      netGross: 76,
      latestData: "Cost Model 3",
      status: "Dormant",
      baseDate: new Date('2023-02-14'),
      dataAvailability: {
        Areas: 'partial',
        Cost: 'none',
        Programme: 'none',
        WC: 'none',
        Reception: 'none'
      }
    },
    {
      id: '7',
      number: "NEP-28",
      name: "155 Bishopsgate",
      image: buildingImages[6],
      scope: "Mixed Use • New Build • Shoreditch",
      area: 96300,
      costPerSqft: 587.25,
      baseCostPerSqft: 570.40,
      netGross: 84,
      latestData: "Cost Model 4",
      status: "Complete",
      baseDate: new Date('2024-02-25'),
      dataAvailability: {
        Areas: 'complete',
        Cost: 'complete',
        Programme: 'partial',
        WC: 'partial',
        Reception: 'partial'
      }
    },
    {
      id: '8',
      number: "NEP-29",
      name: "Broadgate Circle",
      image: buildingImages[7],
      scope: "Retail • Refurbishment • Liverpool St",
      area: 54800,
      costPerSqft: 534.60,
      baseCostPerSqft: 520.10,
      netGross: 80,
      latestData: "Contract Sum",
      status: "Complete",
      baseDate: new Date('2024-05-05'),
      dataAvailability: {
        Areas: 'complete',
        Cost: 'partial',
        Programme: 'none',
        WC: 'none',
        Reception: 'none'
      }
    },
    // New projects with similar reception costs to 2 Finsbury Avenue and Superloo WC types
    {
      id: '9',
      number: "NEP-30",
      name: "Finsbury Pavement",
      image: buildingImages[8],
      scope: "Mixed Use • Refurbishment • Moorgate",
      area: 92300,
      costPerSqft: 538.75,
      baseCostPerSqft: 525.20,
      netGross: 71,
      latestData: "Cost Model 3",
      status: "Live",
      baseDate: new Date('2023-09-12'),
      dataAvailability: {
        Areas: 'complete',
        Cost: 'complete',
        Programme: 'partial',
        WC: 'complete',
        Reception: 'complete'
      },
      wcType: "Superloo Only",
      receptionCost: 635
    },
    {
      id: '10',
      number: "NEP-31",
      name: "Moorgate Exchange",
      image: buildingImages[9],
      scope: "Offices • Refurbishment • Moorgate",
      area: 88900,
      costPerSqft: 551.20,
      baseCostPerSqft: 535.80,
      netGross: 73,
      latestData: "Cost Model 2",
      status: "Bid",
      baseDate: new Date('2023-11-28'),
      dataAvailability: {
        Areas: 'complete',
        Cost: 'complete',
        Programme: 'partial',
        WC: 'complete',
        Reception: 'complete'
      },
      wcType: "Superloo Only",
      receptionCost: 670
    },
    {
      id: '11',
      number: "NEP-32",
      name: "Ropemaker Place",
      image: buildingImages[10],
      scope: "Mixed Use • Refurbishment • City",
      area: 97800,
      costPerSqft: 535.60,
      baseCostPerSqft: 520.90,
      netGross: 70,
      latestData: "Cost Model 4",
      status: "Live",
      baseDate: new Date('2024-01-20'),
      dataAvailability: {
        Areas: 'complete',
        Cost: 'complete',
        Programme: 'partial',
        WC: 'complete',
        Reception: 'complete'
      },
      wcType: "Superloo Only",
      receptionCost: 645
    }
  ];

  // Auto-select Bunker Scheme when a New Build project is selected
  useEffect(() => {
    if (primaryProjectId) {
      const selectedProject = baseProjects.find(p => p.id === primaryProjectId);
      if (selectedProject && selectedProject.scope.includes('New Build')) {
        // Find the Bunker Scheme project
        const bunkerProject = baseProjects.find(p => p.id === 'bunker-1');
        if (bunkerProject && primaryProjectId !== 'bunker-1') {
          // Auto-select the Bunker Scheme
          setSelectedCards(prev => ({ ...prev, 'bunker-1': true }));
        }
      }
    }
  }, [primaryProjectId]);

  const handleFilterChange = (type: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleClearAllFilters = () => {
    setFilters({
      sector: [],
      scope: [],
      location: [],
      cost: [400, 800],
      size: [0, 150000],
      reception: [0, 1000],
      wc: [0, 20000],
      clients: []
    });
    setSearchTerm('');
    setWcTypes([]);
    setLatestDataFilter([]);
    setDateRange([
      new Date(new Date().setFullYear(new Date().getFullYear() - 5)),
      new Date()
    ]);
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (Array.isArray(value) && typeof value[0] === 'string') {
      return value.length > 0;
    }
    if (Array.isArray(value) && typeof value[0] === 'number') {
      const config = {
        cost: [400, 800],
        size: [0, 150000],
        reception: [0, 1000],
        wc: [0, 20000]
      }[key] as [number, number];
      return value[0] !== config[0] || value[1] !== config[1];
    }
    return false;
  }).length + (wcTypes.length > 0 ? 1 : 0) + (latestDataFilter.length > 0 ? 1 : 0) + 
  (dateRange[0].getTime() !== new Date(new Date().setFullYear(new Date().getFullYear() - 5)).getTime() || 
   dateRange[1].getTime() !== new Date().getTime() ? 1 : 0);

  const filteredProjects = useMemo(() => {
    return baseProjects.filter(project => {
      if (searchTerm && !project.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !project.number.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      if (filters.sector.length > 0 && !filters.sector.some(sector => project.scope.includes(sector))) {
        return false;
      }
      if (filters.scope.length > 0 && !filters.scope.some(scope => project.scope.includes(scope))) {
        return false;
      }
      if (filters.location.length > 0 && !filters.location.some(location => project.scope.includes(location))) {
        return false;
      }
      if (latestDataFilter.length > 0 && !latestDataFilter.includes(project.latestData)) {
        return false;
      }
      
      // Filter by date range
      if (project.baseDate < dateRange[0] || project.baseDate > dateRange[1]) {
        return false;
      }
      
      // Filter by WC type if selected
      if (wcTypes.length > 0 && (!project.wcType || !wcTypes.includes(project.wcType))) {
        return false;
      }

      const cost = useCurrentDate ? project.costPerSqft : project.baseCostPerSqft;
      if (cost < filters.cost[0] || cost > filters.cost[1]) {
        return false;
      }

      const size = project.area;
      if (size < filters.size[0] || size > filters.size[1]) {
        return false;
      }

      return true;
    });
  }, [searchTerm, filters, baseProjects, latestDataFilter, wcTypes, useCurrentDate, dateRange]);

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (selectedCards[a.id] && !selectedCards[b.id]) return -1;
    if (!selectedCards[a.id] && selectedCards[b.id]) return 1;
    return parseInt(a.id) - parseInt(b.id);
  });

  // Limit to 8 visible projects at a time
  const [visibleProjects, setVisibleProjects] = useState<number>(8);

  const displayedProjects = sortedProjects.slice(0, visibleProjects);
  const hasMoreProjects = sortedProjects.length > visibleProjects;

  const categories = [
    { name: 'Areas', icon: Building2 },
    { name: 'Cost', icon: PoundSterling },
    { name: 'Programme', icon: Calendar },
    { name: 'WC', icon: DoorClosed },
    { name: 'Reception', icon: Bell }
  ];

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

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'complete':
        return {
          icon: 'text-orange-100',
          bg: 'bg-orange-600',
          text: 'text-gray-300',
          tooltip: 'Detailed data'
        };
      case 'partial':
        return {
          icon: 'text-orange-600',
          bg: 'bg-orange-100',
          text: 'text-gray-300',
          tooltip: 'High Level data'
        };
      default:
        return {
          icon: 'text-gray-400/50',
          bg: 'bg-gray-200/30',
          text: 'text-gray-400/50',
          tooltip: 'No data'
        };
    }
  };

  const toggleCardSelection = (id: string) => {
    setSelectedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const primaryProject = useMemo(() => {
    return primaryProjectId ? baseProjects.find(p => p.id === primaryProjectId) || null : null;
  }, [primaryProjectId]);

  const handlePrimaryProjectChange = (id: string | null) => {
    if (primaryProjectId) {
      setSelectedCards(prev => {
        const newSelected = { ...prev };
        delete newSelected[primaryProjectId];
        return newSelected;
      });
    }
    
    setPrimaryProjectId(id);
    if (id) {
      setSelectedCards(prev => ({ ...prev, [id]: true }));
    }
  };

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Conversion functions
  const sqftToSqm = (sqft: number): number => sqft * 0.092903;
  const costPerSqftToSqm = (costPerSqft: number): number => costPerSqft / 0.092903;

  const formatArea = (area: number): string => {
    if (unitSystem === 'metric') {
      return `${formatNumber(Math.round(sqftToSqm(area)))} m²`;
    }
    return `${formatNumber(area)} ft²`;
  };

  const formatCost = (project: any): string => {
    const cost = useCurrentDate ? project.costPerSqft : project.baseCostPerSqft;
    
    if (unitSystem === 'metric') {
      return `£${costPerSqftToSqm(cost).toFixed(2)}/m²`;
    }
    return `£${cost.toFixed(2)}/ft²`;
  };

  const PlaceholderContent = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="flex items-center gap-4">
        <Building2 className="w-12 h-12 text-white flex-shrink-0" />
        <div className="flex flex-col justify-center">
          <p className="text-white text-lg font-medium leading-tight">Project image</p>
          <p className="text-white/80 text-lg font-medium leading-tight">coming soon</p>
        </div>
      </div>
    </div>
  );

  const getProjectImage = (project: any) => {
    if (isConfidential) {
      return "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?auto=format&fit=crop&q=80&w=800";
    }
    return project.image;
  };

  const findSimilarProjects = () => {
    if (!primaryProject) return [];
    
    // Extract sector and scope from primary project
    const primarySectors = primaryProject.scope.split(' • ').filter(s => 
      filterOptions.sector.includes(s)
    );
    
    const primaryScopes = primaryProject.scope.split(' • ').filter(s => 
      filterOptions.scope.includes(s)
    );
    
    // Size range: +/- 100% of primary project size
    const minSize = primaryProject.area * 0;  // 0% of primary project size
    const maxSize = primaryProject.area * 2;  // 200% of primary project size
    
    return baseProjects
      .filter(project => {
        if (project.id === primaryProject.id) return false;
        
        // Extract project sectors and scopes
        const projectSectors = project.scope.split(' • ').filter(s => 
          filterOptions.sector.includes(s)
        );
        
        const projectScopes = project.scope.split(' • ').filter(s => 
          filterOptions.scope.includes(s)
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
          filterOptions.sector.includes(s)
        );
        const sectorMatchRatio = primarySectors.filter(s => 
          projectSectors.includes(s)
        ).length / Math.max(primarySectors.length, projectSectors.length);
        score += sectorMatchRatio * 40;
        
        // Scope match (40% of score)
        const projectScopes = project.scope.split(' • ').filter(s => 
          filterOptions.scope.includes(s)
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
      .sort((a, b) => b.similarityScore - a.similarityScore);
  };

  const selectedProjectsCount = Object.values(selectedCards).filter(Boolean).length;

  const loadMoreProjects = () => {
    setVisibleProjects(prev => Math.min(prev + 4, sortedProjects.length));
  };

  const handleLoadSelection = (selection: { [key: string]: boolean }) => {
    setSelectedCards(selection);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col h-screen">
      <PrimaryProjectContext
        primaryProject={primaryProject}
        isConfidential={isConfidential}
        onClearPrimary={() => handlePrimaryProjectChange(null)}
        projects={baseProjects}
        selectedProjectId={primaryProjectId}
        onProjectSelect={handlePrimaryProjectChange}
        onFindSimilarProjects={() => setShowSimilarProjectsModal(true)}
      />
      
      <FilterHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAllFilters}
        filterOptions={filterOptions}
        view={view}
        onViewChange={setView}
        wcTypes={wcTypes}
        onWcTypesChange={setWcTypes}
        latestDataFilter={latestDataFilter}
        onLatestDataFilterChange={setLatestDataFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="text-gray-700 font-medium">
              {filteredProjects.length} projects found
            </span>
            {activeFilterCount > 0 && (
              <div className="bg-[#E4002B]/5 text-[#E4002B] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
              </div>
            )}
            {selectedProjectsCount > 0 && (
              <div className="bg-blue-500/5 text-blue-500 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                {selectedProjectsCount} {selectedProjectsCount === 1 ? 'project' : 'projects'} selected
              </div>
            )}
          </div>
          <span className="text-sm text-gray-500 italic">
            All costs are inflation-adjusted to current market rates
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSaveLoadModal(true)}
            className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          >
            {selectedProjectsCount > 0 ? (
              <>
                <Save className="w-4 h-4" />
                <span>Save/Load Selection</span>
              </>
            ) : (
              <>
                <FolderOpen className="w-4 h-4" />
                <span>Load Selection</span>
              </>
            )}
          </button>
          
          <UnitToggle 
            unitSystem={unitSystem} 
            onUnitSystemChange={setUnitSystem} 
          />
          
          <button
            onClick={() => setIsConfidential(!isConfidential)}
            className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          >
            {isConfidential ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Confidential Mode</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Standard Mode</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowCategories(!showCategories)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm transition-colors ${
              showCategories 
                ? 'bg-[#E4002B] text-white hover:bg-[#cc0027]' 
                : 'bg-white text-gray-800 hover:bg-gray-50'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Data Type / Availability</span>
            {showCategories ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      <div className="flex-grow overflow-hidden bg-white rounded-lg shadow-sm">
        {view === 'list' ? (
          <ProjectList 
            projects={sortedProjects}
            isConfidential={isConfidential}
            selectedCards={selectedCards}
            toggleCardSelection={toggleCardSelection}
            primaryProjectId={primaryProjectId}
            unitSystem={unitSystem}
            useCurrentDate={useCurrentDate}
          />
        ) : (
          <div className="h-full flex flex-col">
            <div className="overflow-y-auto custom-scrollbar h-full p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isConfidential={isConfidential}
                    selectedCards={selectedCards}
                    toggleCardSelection={toggleCardSelection}
                    unitSystem={unitSystem}
                    useCurrentDate={useCurrentDate}
                    showCategories={showCategories}
                    categories={categories}
                    hoveredCards={hoveredCards}
                    setHoveredCards={setHoveredCards}
                    hoveredButtons={hoveredButtons}
                    setHoveredButtons={setHoveredButtons}
                    hoveredCosts={hoveredCosts}
                    setHoveredCosts={setHoveredCosts}
                    hoveredCategories={hoveredCategories}
                    setHoveredCategories={setHoveredCategories}
                    getStatusConfig={getStatusConfig}
                    getStatusClasses={getStatusClasses}
                    formatArea={formatArea}
                    formatCost={formatCost}
                    formatNumber={formatNumber}
                    getProjectImage={getProjectImage}
                    PlaceholderContent={PlaceholderContent}
                  />
                ))}
              </div>
              
              {hasMoreProjects && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={loadMoreProjects}
                    className="px-6 py-3 bg-white text-gray-800 rounded-full shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <ChevronDown className="w-4 h-4" />
                    <span>Load More Projects</span>
                    <span className="text-gray-500 ml-1">({sortedProjects.length - visibleProjects} remaining)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showSimilarProjectsModal && primaryProject && (
         <SimilarProjectsModal
          isOpen={showSimilarProjectsModal}
          onClose={() => setShowSimilarProjectsModal(false)}
          primaryProject={primaryProject}
          similarProjects={findSimilarProjects()}
          isConfidential={isConfidential}
          onSelectProject={(id) => {
            toggleCardSelection(id);
            setShowSimilarProjectsModal(false);
          }}
          unitSystem={unitSystem}
          useCurrentDate={useCurrentDate}
        />
      )}

      {showSaveLoadModal && (
        <SaveLoadSelectionModal
          isOpen={showSaveLoadModal}
          onClose={() => setShowSaveLoadModal(false)}
          selectedCards={selectedCards}
          onLoadSelection={handleLoadSelection}
          projects={baseProjects}
          isConfidential={isConfidential}
        />
      )}
    </div>
  );
}

export default App;