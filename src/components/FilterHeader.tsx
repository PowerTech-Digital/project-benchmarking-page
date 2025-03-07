import React from 'react';
import { Search, XCircle } from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';
import { ClientSearch } from './ClientSearch';

interface FilterHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    sector: string[];
    scope: string[];
    location: string[];
    cost: [number, number];
    size: [number, number];
    reception: [number, number];
    wc: [number, number];
    clients: string[];
  };
  onFilterChange: (type: string, value: any) => void;
  onClearAll: () => void;
  filterOptions: {
    sector: string[];
    scope: string[];
    location: string[];
    latestData: string[];
  };
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  wcTypes?: string[];
  onWcTypesChange?: (value: string[]) => void;
  latestDataFilter?: string[];
  onLatestDataFilterChange?: (value: string[]) => void;
  onFindSimilarProjects?: () => void;
  dateRange?: [Date, Date];
  onDateRangeChange?: (value: [Date, Date]) => void;
}

export function FilterHeader({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onFilterChange, 
  onClearAll,
  filterOptions,
  view,
  onViewChange,
  wcTypes = [],
  onWcTypesChange = () => {},
  latestDataFilter = [],
  onLatestDataFilterChange = () => {},
  dateRange = [new Date(new Date().setFullYear(new Date().getFullYear() - 5)), new Date()],
  onDateRangeChange = () => {}
}: FilterHeaderProps) {
  const formatCurrency = (value: number) => `£${value.toLocaleString()}`;
  const formatArea = (value: number) => `${value.toLocaleString()} ft²`;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-grow">
          <div className="relative max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search comparison projects..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#E4002B] focus:border-transparent"
            />
          </div>

          <ClientSearch
            selectedClients={filters.clients}
            onClientSelect={(clients) => onFilterChange('clients', clients)}
          />
          <FilterDropdown
            type="sector"
            options={filterOptions.sector}
            value={filters.sector}
            onChange={(value) => onFilterChange('sector', value)}
          />
          <FilterDropdown
            type="scope"
            options={filterOptions.scope}
            value={filters.scope}
            onChange={(value) => onFilterChange('scope', value)}
          />
          <FilterDropdown
            type="location"
            options={filterOptions.location}
            value={filters.location}
            onChange={(value) => onFilterChange('location', value)}
          />
          <FilterDropdown
            type="latestData"
            options={filterOptions.latestData}
            value={latestDataFilter}
            onChange={onLatestDataFilterChange}
            hasDateRange
            dateRangeConfig={{
              min: new Date(new Date().setFullYear(new Date().getFullYear() - 5)),
              max: new Date(),
              value: dateRange,
              onChange: onDateRangeChange
            }}
          />
          <FilterDropdown
            type="cost"
            hasRange
            rangeConfig={{
              min: 400,
              max: 800,
              step: 10,
              formatValue: (v) => `£${v}/ft²`
            }}
            value={filters.cost}
            onChange={(value) => onFilterChange('cost', value)}
          />
          <FilterDropdown
            type="size"
            hasRange
            rangeConfig={{
              min: 0,
              max: 150000,
              step: 5000,
              formatValue: formatArea
            }}
            value={filters.size}
            onChange={(value) => onFilterChange('size', value)}
          />
          <FilterDropdown
            type="reception"
            hasRange
            rangeConfig={{
              min: 0,
              max: 1000,
              step: 50,
              formatValue: formatCurrency
            }}
            value={filters.reception}
            onChange={(value) => onFilterChange('reception', value)}
          />
          <FilterDropdown
            type="wc"
            hasRange
            rangeConfig={{
              min: 0,
              max: 20000,
              step: 1000,
              formatValue: formatCurrency
            }}
            value={filters.wc}
            onChange={(value) => onFilterChange('wc', value)}
            additionalOptions={{
              type: 'checkbox',
              options: ['Superloo Only', 'Cubicle Only', 'Combined'],
              value: wcTypes,
              onChange: onWcTypesChange
            }}
          />

          {(filters.sector.length > 0 || filters.scope.length > 0 || filters.location.length > 0 ||
            filters.cost[0] !== 400 || filters.cost[1] !== 800 ||
            filters.size[0] !== 0 || filters.size[1] !== 150000 ||
            filters.reception[0] !== 0 || filters.reception[1] !== 1000 ||
            filters.wc[0] !== 0 || filters.wc[1] !== 20000 ||
            filters.clients.length > 0 ||
            wcTypes.length > 0 ||
            latestDataFilter.length > 0 ||
            dateRange[0].getTime() !== new Date(new Date().setFullYear(new Date().getFullYear() - 5)).getTime() ||
            dateRange[1].getTime() !== new Date().getTime()) && (
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5 hover:bg-gray-50 rounded-full"
            >
              <XCircle className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}