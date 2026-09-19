import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export const PersistentIssues = ({ stillPresentList = [], issueLifecycle = {} }) => {
  const regressedList = issueLifecycle?.regressed || [];

  return (
    <div class="space-y-4">
      {/* Regressed Issues Banner if any */}
      {regressedList.length > 0 && (
        <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
          <div class="flex items-center space-x-2 text-red-400 font-bold text-xs uppercase tracking-wider">
            <RotateCcw class="w-4 h-4" />
            <span>Regression Alert ({regressedList.length} Issues Returned)</span>
          </div>
          <div class="space-y-1">
            {regressedList.map((iss, idx) => (
              <div key={idx} class="text-xs text-slate-300 flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-800">
                <span class="font-mono text-red-400">{iss.ruleId}</span>
                <span class="text-slate-400 truncate max-w-sm">{iss.context}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Still Present List */}
      <div class="space-y-3">
        <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <AlertTriangle class="w-4 h-4 text-amber-400" />
          <span>Remaining & Persistent Issues</span>
        </h4>

        {stillPresentList.length === 0 ? (
          <p class="text-xs text-slate-400 italic">No remaining issues detected!</p>
        ) : (
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stillPresentList.map((item, idx) => (
              <div key={idx} class="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start space-x-3">
                <AlertTriangle class="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div class="text-xs space-y-1">
                  <div class="font-semibold text-amber-200">
                    ⚠ {item.count} {item.title} remaining
                  </div>
                  <div class="text-slate-400 text-[11px]">
                    Rule ID: <span class="font-mono text-amber-400">{item.ruleId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
