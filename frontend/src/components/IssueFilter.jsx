import React from 'react';
import { Search, Filter, Layers } from 'lucide-react';

export const IssueFilter = ({
  searchTerm,
  onSearchChange,
  selectedSeverity,
  onSeverityChange,
  selectedCategory,
  onCategoryChange,
  categories = [],
  totalCount = 0
}) => {
  return (
    <div class="glass-card rounded-xl p-4 border border-slate-800 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      
      {/* Search Input */}
      <div class="relative w-full md:w-72">
        <input
          type="text"
          placeholder="Search issues or tags..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          class="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <Search class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
      </div>

      {/* Filter Controls */}
      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
        
        {/* Severity Filter Pills */}
        <div class="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          {['ALL', 'Critical', 'Major', 'Minor'].map((sev) => (
            <button
              key={sev}
              onClick={() => onSeverityChange(sev)}
              class={`px-3 py-1 rounded-md transition-all font-medium ${
                selectedSeverity === sev
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <div class="relative">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            class="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <span class="text-xs font-semibold text-slate-400 ml-auto md:ml-2">
          {totalCount} Issues Found
        </span>
      </div>

    </div>
  );
};
