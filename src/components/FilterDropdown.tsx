import React, { useState, useRef, useEffect } from 'react';
import { Filter, XCircle, CheckCircle2, ChevronDown, Check, Calendar } from 'lucide-react';
import { RangeSlider } from './RangeSlider';

interface FilterDropdownProps {
  type: string;
  options?: string[];
  hasRange?: boolean;
  rangeConfig?: {
    min: number;
    max: number;
    step: number;
    formatValue: (value: number) => string;
  };
  value: any;
  onChange: (value: any) => void;
  additionalOptions?: {
    type: 'checkbox';
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
  };
  hasDateRange?: boolean;
  dateRangeConfig?: {
    min: Date;
    max: Date;
    value: [Date, Date];
    onChange: (value: [Date, Date]) => void;
  };
}

export function FilterDropdown({ 
  type, 
  options, 
  hasRange, 
  rangeConfig, 
  value, 
  onChange,
  additionalOptions,
  hasDateRange,
  dateRangeConfig
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = {
    sector: 'Sector',
    scope: 'Scope',
    location: 'Location',
    cost: 'Cost per ft²',
    size: 'Area, GIA',
    reception: 'Reception',
    wc: 'WC',
    latestData: 'Latest Data'
  }[type];

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(hasRange ? [rangeConfig?.min || 0, rangeConfig?.max || 100] : []);
    if (additionalOptions) {
      additionalOptions.onChange([]);
    }
    if (hasDateRange && dateRangeConfig) {
      dateRangeConfig.onChange([dateRangeConfig.min, dateRangeConfig.max]);
    }
  };

  const isActive = hasRange 
    ? value[0] !== rangeConfig?.min || value[1] !== rangeConfig?.max || (additionalOptions?.value.length ?? 0) > 0
    : hasDateRange
      ? dateRangeConfig?.value[0].getTime() !== dateRangeConfig?.min.getTime() || 
        dateRangeConfig?.value[1].getTime() !== dateRangeConfig?.max.getTime() ||
        value.length > 0
      : value.length > 0;

  const toggleOption = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter((v: string) => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  const toggleAdditionalOption = (option: string) => {
    if (!additionalOptions) return;
    
    const newValue = additionalOptions.value.includes(option)
      ? additionalOptions.value.filter(v => v !== option)
      : [...additionalOptions.value, option];
    additionalOptions.onChange(newValue);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getYearDiff = (date1: Date, date2: Date) => {
    return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24 * 365));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
          ${isActive
            ? 'bg-[#E4002B] text-white shadow-lg shadow-[#E4002B]/20 hover:bg-[#cc0027]'
            : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'
          }
          ${isOpen ? 'ring-2 ring-[#E4002B] ring-offset-2' : ''}
        `}
      >
        <Filter className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
        <span>{displayName}</span>
        {isActive && (
          <div className="flex items-center gap-1">
            {!hasRange && !hasDateRange && <span className="text-white/90 font-normal">{value.length}</span>}
            {hasRange && (
              <span className="text-white/90 font-normal">
                {1 + (additionalOptions?.value.length ? 1 : 0)}
              </span>
            )}
            {hasDateRange && (
              <span className="text-white/90 font-normal">
                {value.length + (dateRangeConfig?.value[0].getTime() !== dateRangeConfig?.min.getTime() || 
                  dateRangeConfig?.value[1].getTime() !== dateRangeConfig?.max.getTime() ? 1 : 0)}
              </span>
            )}
            <XCircle
              className="w-3.5 h-3.5 text-white/90 hover:text-white transition-colors"
              onClick={handleClear}
            />
          </div>
        )}
        {!isActive && (
          <ChevronDown className={`w-3.5 h-3.5 ${isOpen ? 'rotate-180' : ''} transition-transform duration-200`} />
        )}
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 w-56 rounded-lg shadow-xl bg-white ring-1 ring-black/5 transform opacity-100 scale-100 transition-all duration-200 animate-fade-in">
          <div className="p-2">
            {hasRange && rangeConfig ? (
              <>
                <RangeSlider
                  min={rangeConfig.min}
                  max={rangeConfig.max}
                  step={rangeConfig.step}
                  value={value}
                  onChange={onChange}
                  formatValue={rangeConfig.formatValue}
                />
                
                {additionalOptions && additionalOptions.type === 'checkbox' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">WC Types</div>
                    {additionalOptions.options.map((option) => (
                      <div 
                        key={option}
                        className="flex items-center gap-2 py-1.5"
                      >
                        <button
                          onClick={() => toggleAdditionalOption(option)}
                          className={`
                            w-5 h-5 rounded border flex items-center justify-center transition-colors
                            ${additionalOptions.value.includes(option)
                              ? 'bg-[#E4002B] border-[#E4002B]'
                              : 'border-gray-300 hover:border-gray-400'
                            }
                          `}
                        >
                          {additionalOptions.value.includes(option) && (
                            <Check className="w-3.5 h-3.5 text-white" />
                          )}
                        </button>
                        <span className="text-sm text-gray-700">{option}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : hasDateRange && dateRangeConfig ? (
              <>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-700">Date Range</div>
                    <div className="text-xs text-gray-500">
                      {getYearDiff(dateRangeConfig.value[0], dateRangeConfig.value[1])} years
                    </div>
                  </div>
                  <div className="relative pt-6 pb-2">
                    <div className="absolute left-0 right-0 h-1 bg-gray-200 rounded-full top-0"></div>
                    <div 
                      className="absolute h-1 bg-[#E4002B] rounded-full top-0"
                      style={{
                        left: `${((dateRangeConfig.value[0].getTime() - dateRangeConfig.min.getTime()) / 
                          (dateRangeConfig.max.getTime() - dateRangeConfig.min.getTime())) * 100}%`,
                        right: `${100 - ((dateRangeConfig.value[1].getTime() - dateRangeConfig.min.getTime()) / 
                          (dateRangeConfig.max.getTime() - dateRangeConfig.min.getTime())) * 100}%`
                      }}
                    ></div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <div>{formatDate(dateRangeConfig.value[0])}</div>
                      <div>{formatDate(dateRangeConfig.value[1])}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <button 
                      className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => {
                        const fiveYearsAgo = new Date();
                        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
                        dateRangeConfig.onChange([fiveYearsAgo, dateRangeConfig.max]);
                      }}
                    >
                      5 Years
                    </button>
                    <button 
                      className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => {
                        const threeYearsAgo = new Date();
                        threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
                        dateRangeConfig.onChange([threeYearsAgo, dateRangeConfig.max]);
                      }}
                    >
                      3 Years
                    </button>
                    <button 
                      className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => {
                        const oneYearAgo = new Date();
                        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                        dateRangeConfig.onChange([oneYearAgo, dateRangeConfig.max]);
                      }}
                    >
                      1 Year
                    </button>
                    <button 
                      className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => {
                        dateRangeConfig.onChange([dateRangeConfig.min, dateRangeConfig.max]);
                      }}
                    >
                      All
                    </button>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <div className="text-sm font-medium text-gray-700 mb-2">Data Types</div>
                  {options?.map((option) => (
                    <div 
                      key={option}
                      className="flex items-center gap-2 py-1.5"
                    >
                      <button
                        onClick={() => toggleOption(option)}
                        className={`
                          w-5 h-5 rounded border flex items-center justify-center transition-colors
                          ${value.includes(option)
                            ? 'bg-[#E4002B] border-[#E4002B]'
                            : 'border-gray-300 hover:border-gray-400'
                          }
                        `}
                      >
                        {value.includes(option) && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </button>
                      <span className="text-sm text-gray-700">{option}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              options?.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`
                    flex items-center w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                    ${value.includes(option)
                      ? 'bg-[#E4002B]/5 text-[#E4002B] font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {value.includes(option) && (
                    <CheckCircle2 className="w-4 h-4 mr-2 text-[#E4002B]" />
                  )}
                  <span className={value.includes(option) ? 'ml-0' : 'ml-6'}>
                    {option}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}