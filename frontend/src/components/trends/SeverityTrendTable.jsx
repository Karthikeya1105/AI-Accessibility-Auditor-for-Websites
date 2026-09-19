import React from 'react';
import { Filter } from 'lucide-react';

export const SeverityTrendTable = ({ severityBreakdown }) => {
  if (!severityBreakdown) return null;

  const { critical, major, minor } = severityBreakdown;

  return (
    <div class="space-y-3">
      <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
        <Filter class="w-4 h-4 text-amber-400" />
        <span>Severity Breakdown Progress (Baseline V1 ➔ Current)</span>
      </h4>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Critical */}
        <div class="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-red-400 uppercase tracking-wider block">Critical Severity</span>
            <div class="text-sm font-semibold text-slate-300 mt-1">
              {critical?.baseline || 0} ➔ <strong class="text-white text-base">{critical?.current || 0}</strong>
            </div>
          </div>
          <span class={`text-xs font-bold px-3 py-1 rounded-full ${
            critical?.delta < 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
          }`}>
            {critical?.delta || 0}
          </span>
        </div>

        {/* Major */}
        <div class="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-amber-400 uppercase tracking-wider block">Major Severity</span>
            <div class="text-sm font-semibold text-slate-300 mt-1">
              {major?.baseline || 0} ➔ <strong class="text-white text-base">{major?.current || 0}</strong>
            </div>
          </div>
          <span class={`text-xs font-bold px-3 py-1 rounded-full ${
            major?.delta < 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
          }`}>
            {major?.delta || 0}
          </span>
        </div>

        {/* Minor */}
        <div class="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-blue-400 uppercase tracking-wider block">Minor Severity</span>
            <div class="text-sm font-semibold text-slate-300 mt-1">
              {minor?.baseline || 0} ➔ <strong class="text-white text-base">{minor?.current || 0}</strong>
            </div>
          </div>
          <span class={`text-xs font-bold px-3 py-1 rounded-full ${
            minor?.delta < 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
          }`}>
            {minor?.delta || 0}
          </span>
        </div>
      </div>
    </div>
  );
};
