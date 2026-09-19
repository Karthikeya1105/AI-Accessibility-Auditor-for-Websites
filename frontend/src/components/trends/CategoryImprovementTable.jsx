import React from 'react';
import { Layers } from 'lucide-react';

export const CategoryImprovementTable = ({ categoryImprovements = [] }) => {
  if (!categoryImprovements || categoryImprovements.length === 0) return null;

  return (
    <div class="space-y-3">
      <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
        <Layers class="w-4 h-4 text-purple-400" />
        <span>Category-Level Score Progression</span>
      </h4>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th class="p-3 rounded-l-lg">Category</th>
              <th class="p-3">Baseline Score</th>
              <th class="p-3">Current Score</th>
              <th class="p-3">Score Change</th>
              <th class="p-3 rounded-r-lg">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            {categoryImprovements.map(cat => (
              <tr key={cat.category} class="hover:bg-slate-900/40 transition-colors">
                <td class="p-3 font-medium text-white">{cat.category}</td>
                <td class="p-3 text-slate-400">{cat.baselineScore}%</td>
                <td class="p-3 font-bold text-white">{cat.currentScore}%</td>
                <td class="p-3">
                  <span class={`font-bold px-2 py-0.5 rounded border ${
                    cat.change > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : cat.change < 0 ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {cat.change > 0 ? `+${cat.change}` : cat.change} pts
                  </span>
                </td>
                <td class="p-3">
                  <span class={`text-[11px] font-semibold ${cat.change > 0 ? 'text-emerald-400' : cat.change < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {cat.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
