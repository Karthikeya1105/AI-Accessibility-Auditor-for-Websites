import React from 'react';
import { AlertTriangle, Layers, Info, CheckCircle2 } from 'lucide-react';
import { CodeComparison } from './CodeComparison';

export const CommonIssuesSummary = ({ issues = [] }) => {
  if (!issues || issues.length === 0) return null;

  return (
    <div class="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl mb-8">
      <div class="flex items-center space-x-2 mb-2">
        <Layers class="w-5 h-5 text-indigo-400" />
        <h3 class="text-lg font-bold text-white">Most Common Site-Wide Violations</h3>
      </div>
      <p class="text-xs text-slate-400 mb-6">
        Issues detected across multiple pages on the website, ranked by frequency and impact.
      </p>

      <div class="space-y-4">
        {issues.slice(0, 6).map((item, idx) => {
          let sevBadge = 'bg-slate-800 text-slate-300 border-slate-700';
          if (item.severity === 'Critical') {
            sevBadge = 'bg-red-500/10 text-red-400 border-red-500/30';
          } else if (item.severity === 'Major') {
            sevBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
          }

          return (
            <div key={item.ruleId || idx} class="bg-slate-900/80 rounded-xl p-5 border border-slate-800">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div class="flex items-center space-x-2">
                  <span class={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${sevBadge}`}>
                    {item.severity}
                  </span>
                  <span class="text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                    {item.category}
                  </span>
                </div>

                <div class="flex items-center space-x-3 text-xs font-semibold">
                  <span class="text-red-400 bg-red-950/40 px-3 py-1 rounded border border-red-500/20">
                    {item.occurrences} Occurrences
                  </span>
                  <span class="text-indigo-300 bg-indigo-950/40 px-3 py-1 rounded border border-indigo-500/20">
                    {item.affectedPagesCount} Pages Affected
                  </span>
                </div>
              </div>

              <h4 class="text-sm font-bold text-white mb-1">
                {item.context || item.explanation}
              </h4>

              <p class="text-xs text-slate-400 mb-3">
                Found on pages: <span class="text-slate-200">{item.affectedPages.slice(0, 4).join(', ')}</span>
              </p>

              <CodeComparison
                originalSnippet={item.originalSnippet}
                suggestedFixCode={item.suggestedFixCode}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
