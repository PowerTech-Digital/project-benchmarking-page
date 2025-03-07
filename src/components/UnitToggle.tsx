import React from 'react';
import { Repeat } from 'lucide-react';

interface UnitToggleProps {
  unitSystem: 'imperial' | 'metric';
  onUnitSystemChange: (unitSystem: 'imperial' | 'metric') => void;
}

export function UnitToggle({ unitSystem, onUnitSystemChange }: UnitToggleProps) {
  return (
    <button
      onClick={() => onUnitSystemChange(unitSystem === 'imperial' ? 'metric' : 'imperial')}
      className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
    >
      <Repeat className="w-4 h-4" />
      <span>{unitSystem === 'imperial' ? 'ft²' : 'm²'}</span>
    </button>
  );
}