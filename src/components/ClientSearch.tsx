import React, { useState, useEffect, useRef } from 'react';
import { Search, Users } from 'lucide-react';

interface Client {
  id: string;
  company: string;
}

interface ClientSearchProps {
  selectedClients: string[];
  onClientSelect: (clientIds: string[]) => void;
}

const generateRandomClients = (): Client[] => {
  const companies = [
    'Acme Corp', 'TechGiant Ltd', 'BuildWell Construction',
    'Global Finance', 'InnovatePro', 'MetroWorks',
    'Future Dynamics', 'Urban Spaces', 'Peak Properties',
    'Skyline Development', 'Quantum Real Estate', 'Nexus Group',
    'Vertex Holdings', 'Pinnacle Solutions', 'Horizon Builders'
  ];

  return Array.from({ length: 15 }, (_, i) => ({
    id: `client-${i + 1}`,
    company: companies[Math.floor(Math.random() * companies.length)]
  }));
};

export function ClientSearch({ selectedClients, onClientSelect }: ClientSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clients] = useState(generateRandomClients);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredClients = clients.filter(client =>
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleClient = (clientId: string) => {
    const newSelected = selectedClients.includes(clientId)
      ? selectedClients.filter(id => id !== clientId)
      : [...selectedClients, clientId];
    onClientSelect(newSelected);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
          ${selectedClients.length > 0
            ? 'bg-[#E4002B] text-white shadow-lg shadow-[#E4002B]/20 hover:bg-[#cc0027]'
            : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'
          }
          ${isOpen ? 'ring-2 ring-[#E4002B] ring-offset-2' : ''}
        `}
      >
        <Users className={`w-3.5 h-3.5 ${selectedClients.length > 0 ? 'text-white' : 'text-gray-400'}`} />
        <span>Client View</span>
        {selectedClients.length > 0 && (
          <span className="bg-white/20 text-white px-1.5 rounded-full text-xs">
            {selectedClients.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 rounded-lg shadow-xl bg-white ring-1 ring-black/5 max-h-80 flex flex-col animate-fade-in">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4002B] focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {filteredClients.slice(0, 10).map((client) => (
              <button
                key={client.id}
                onClick={() => toggleClient(client.id)}
                className={`
                  w-full px-3 py-2 flex items-center text-left hover:bg-gray-50 transition-colors
                  ${selectedClients.includes(client.id) ? 'bg-[#E4002B]/5' : ''}
                `}
              >
                <span className={`font-medium ${selectedClients.includes(client.id) ? 'text-[#E4002B]' : 'text-gray-900'}`}>
                  {client.company}
                </span>
              </button>
            ))}
            {filteredClients.length > 10 && (
              <div className="px-3 py-2 text-sm text-gray-500 border-t">
                + {filteredClients.length - 10} more organizations
              </div>
            )}
            {filteredClients.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No organizations found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}