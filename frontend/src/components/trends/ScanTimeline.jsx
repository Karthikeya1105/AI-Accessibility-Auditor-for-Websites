import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';

export const ScanTimeline = ({ timeline = [], scans = [], onSelectScan }) => {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div class="space-y-3">
      <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
        <span>Historical Audit Verification History</span>
        <span class="text-slate-400 font-mono font-normal">{timeline.length} Versions</span>
      </h4>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {timeline.map((item, idx) => {
          const matchedScan = scans.find(s => s.id === item.scanId);

          return (
            <div
              key={item.scanId || idx}
              onClick={() => matchedScan && onSelectScan(matchedScan)}
              class={`p-4 rounded-xl border transition-all cursor-pointer group ${
                item.isCurrent
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : item.isBaseline
                  ? 'border-amber-500/50 bg-amber-500/10'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-blue-500/40'
              }`}
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                  <Clock class="w-3 h-3 text-slate-500" />
                  <span>{item.verificationId} {item.isBaseline ? '(Baseline)' : item.isCurrent ? '(Latest)' : ''}</span>
                </span>
                <span class={`text-xs font-bold ${item.score >= 80 ? 'text-emerald-400' : item.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {item.score}%
                </span>
              </div>

              <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                <div
                  class={`h-full transition-all duration-700 ${item.score >= 80 ? 'bg-emerald-500' : item.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>

              <div class="flex items-center justify-between text-[11px] text-slate-500">
                <span>{item.dateFormatted}</span>
                <span class="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  View <ArrowRight class="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
