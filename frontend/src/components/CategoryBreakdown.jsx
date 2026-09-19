import React from 'react';
import { Image, Palette, FormInput, Heading, Link2, Code } from 'lucide-react';

const CATEGORY_ICONS = {
  'Images & Media': Image,
  'Color & Contrast': Palette,
  'Forms & Controls': FormInput,
  'Headings & Structure': Heading,
  'Links & Navigation': Link2,
  'ARIA & Semantics': Code
};

export const CategoryBreakdown = ({ categoryScores, onSelectCategory, selectedCategory }) => {
  if (!categoryScores) return null;

  return (
    <div class="mb-8">
      <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
        Category Performance Scores
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(categoryScores).map(([catName, score]) => {
          const Icon = CATEGORY_ICONS[catName] || Code;
          const isSelected = selectedCategory === catName;

          let scoreColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
          if (score < 50) scoreColor = 'text-red-400 bg-red-500/10 border-red-500/30';
          else if (score < 80) scoreColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';

          return (
            <button
              key={catName}
              onClick={() => onSelectCategory(isSelected ? 'ALL' : catName)}
              class={`p-4 rounded-xl text-left border transition-all glass-card-hover ${
                isSelected
                  ? 'border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/20'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
              }`}
            >
              <div class="flex items-center justify-between mb-2">
                <Icon class="w-4 h-4 text-slate-400" />
                <span class={`text-xs font-bold px-2 py-0.5 rounded-full border ${scoreColor}`}>
                  {score}%
                </span>
              </div>
              <div class="text-xs font-semibold text-white truncate" title={catName}>
                {catName}
              </div>
              <div class="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                <div
                  class={`h-full transition-all duration-700 ${
                    score < 50 ? 'bg-red-500' : score < 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
