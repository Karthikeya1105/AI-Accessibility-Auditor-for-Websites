import React from 'react';
import { ArrowDownRight, ShieldAlert } from 'lucide-react';

export const IssueReductionCard = ({ baselineTotal, currentTotal, issuesReduced, issueReductionPercentage }) => {
  return (
    <div class="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center space-x-3">
        <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <ArrowDownRight class="w-6 h-6" />
        </div>
        <div>
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Issue Reduction</span>
          <div class="text-lg font-bold text-white mt-0.5">
            <span class="text-slate-400 font-normal">{baselineTotal || 0}</span> ➔ <span class="text-emerald-400">{currentTotal || 0}</span> detected issues
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-3 text-right">
        <div>
          <div class="text-2xl font-black text-emerald-400">
            -{issuesReduced || 0} Issues
          </div>
          <div class="text-xs text-slate-400 font-medium">
            {issueReductionPercentage || 0}% overall reduction rate
          </div>
        </div>
      </div>
    </div>
  );
};
