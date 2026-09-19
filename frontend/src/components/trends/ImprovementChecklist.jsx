import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const ImprovementChecklist = ({ whatImprovedList = [] }) => {
  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <CheckCircle2 class="w-4 h-4 text-emerald-400" />
          <span>What Improved Since Baseline Scan?</span>
        </h4>
        <span class="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
          {whatImprovedList.length} Categories Fixed
        </span>
      </div>

      {whatImprovedList.length === 0 ? (
        <p class="text-xs text-slate-400 italic">No violations resolved yet compared to baseline.</p>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          {whatImprovedList.map((item, idx) => (
            <div key={idx} class="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start space-x-3">
              <CheckCircle2 class="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div class="space-y-1 text-xs">
                <div class="font-bold text-emerald-200">
                  ✓ {item.countFixed} {item.title} issues resolved
                </div>
                <div class="text-slate-400 text-[11px]">
                  Category: <span class="text-slate-300">{item.category || 'General'}</span> | Severity: <span class="text-amber-300 capitalize">{item.severity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
