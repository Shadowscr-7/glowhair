"use client";

import { motion } from 'framer-motion';
import { Calendar, Search, Filter, X } from 'lucide-react';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export const DateRangeFilter = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}: DateRangeFilterProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-5 h-5 text-glow-600" />
        <h3 className="font-medium text-gray-900">Rango de Fechas</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Desde
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

interface SearchFilterProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export const SearchFilter = ({ placeholder, value, onChange }: SearchFilterProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Search className="w-5 h-5 text-glow-600" />
        <h3 className="font-medium text-gray-900">Búsqueda</h3>
      </div>
      
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

interface SelectFilterProps {
  title: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SelectFilter = ({ 
  title, 
  options, 
  value, 
  onChange, 
  placeholder = "Seleccionar..." 
}: SelectFilterProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-5 h-5 text-glow-600" />
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface FiltersSummaryProps {
  activeFilters: { label: string; value: string }[];
  onClearFilter: (index: number) => void;
  onClearAll: () => void;
}

export const FiltersSummary = ({ 
  activeFilters, 
  onClearFilter, 
  onClearAll 
}: FiltersSummaryProps) => {
  if (activeFilters.length === 0) return null;

  return (
    <div className="bg-glow-50 border border-glow-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-glow-900">Filtros Activos</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClearAll}
          className="text-glow-600 hover:text-glow-700 text-sm font-medium"
        >
          Limpiar Todo
        </motion.button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 bg-white border border-glow-300 rounded-full px-3 py-1 text-sm"
          >
            <span className="text-gray-600">{filter.label}:</span>
            <span className="font-medium text-gray-900">{filter.value}</span>
            <button
              onClick={() => onClearFilter(index)}
              className="text-gray-400 hover:text-gray-600 ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

interface QuickDateFiltersProps {
  onQuickFilter: (days: number) => void;
  activeFilter?: number;
}

export const QuickDateFilters = ({ onQuickFilter, activeFilter }: QuickDateFiltersProps) => {
  const quickFilters = [
    { label: 'Últimos 7 días', days: 7 },
    { label: 'Últimos 30 días', days: 30 },
    { label: 'Últimos 90 días', days: 90 },
    { label: 'Este año', days: 365 }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-medium text-gray-900 mb-3">Filtros Rápidos</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {quickFilters.map((filter) => (
          <motion.button
            key={filter.days}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onQuickFilter(filter.days)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === filter.days
                ? 'bg-glow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
};