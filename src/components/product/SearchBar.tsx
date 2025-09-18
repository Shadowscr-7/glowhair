"use client";

import { motion } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onToggleFilters: () => void;
  resultsCount: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onToggleFilters,
  resultsCount
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const clearSearch = () => {
    onSearchChange("");
  };

  return (
    <div className="relative">
      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Buscar productos, ingredientes, marcas..."
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
          />
          
          {/* Clear Button */}
          {searchTerm && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
            </motion.button>
          )}
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 p-3 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
          >
            <p className="text-sm text-gray-600">
              {resultsCount === 0 ? (
                <span className="text-red-500">
                  No se encontraron productos para &quot;{searchTerm}&quot;
                </span>
              ) : (
                <span>
                  {resultsCount} producto{resultsCount !== 1 ? 's' : ''} encontrado{resultsCount !== 1 ? 's' : ''} para &quot;
                  <span className="font-medium text-glow-600">{searchTerm}</span>&quot;
                </span>
              )}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Filter Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleFilters}
        className="absolute right-0 top-0 bottom-0 px-4 bg-glow-600 text-white rounded-r-xl hover:bg-glow-700 transition-colors duration-200 flex items-center gap-2 lg:hidden"
      >
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filtros</span>
      </motion.button>
    </div>
  );
};

export default SearchBar;