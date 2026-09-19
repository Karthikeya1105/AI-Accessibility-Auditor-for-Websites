import React from 'react';
import { Globe, AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export const PageScoreList = ({ pages = [], onSelectPage, selectedPageUrl }) => {
  if (!pages || pages.length === 0) return null;

  return (
    <div class="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <span>Individual Page Accessibility Scores</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {pages.length} Pages Scanned
            </span>
          </h3>
          <p class="text-xs text-slate-400 mt-1">
            Click any page to filter and inspect detailed findings for that specific URL.
          </p>
        </div>

        {selectedPageUrl && (
          <button
            onClick={() => onSelectPage(null)}
            class="text-xs text-blue-400 hover:text-blue-300 font-medium px-3 py-1 rounded bg-blue-500/10 border border-blue-500/20"
          >
            Show All Site Pages
          </button>
        )}
      </div>

      <div class="space-y-3">
        {pages.map((page, idx) => {
          const isSelected = selectedPageUrl === page.url;
          const isFailed = page.status === 'failed';

          let scoreColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
          let barBg = 'bg-emerald-500';

          if (isFailed || page.score < 50) {
            scoreColor = 'text-red-400 bg-red-500/10 border-red-500/30';
            barBg = 'bg-red-500';
          } else if (page.score < 80) {
            scoreColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
            barBg = 'bg-amber-500';
          }

          return (
            <div
              key={page.url || idx}
              onClick={() => onSelectPage(isSelected ? null : page.url)}
              class={`p-4 rounded-xl border transition-all cursor-pointer glass-card-hover ${
                isSelected
                  ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500/30'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
              }`}
            >
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div class="flex items-center space-x-3 overflow-hidden">
                  <Globe class="w-4 h-4 text-blue-400 shrink-0" />
                  <div class="truncate">
                    <h4 class="text-xs font-bold text-white truncate" title={page.pageTitle || page.url}>
                      {page.pageTitle || page.url}
                    </h4>
                    <p class="text-[11px] font-mono text-slate-400 truncate">
                      {page.url}
                    </p>
                  </div>
                </div>

                <div class="flex items-center space-x-3 shrink-0">
                  {!isFailed && page.counts && (
                    <div class="flex items-center space-x-2 text-[11px]">
                      <span class="text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/20 font-medium">
                        {page.counts.critical} Crit
                      </span>
                      <span class="text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                        {page.counts.major} Maj
                      </span>
                    </div>
                  )}

                  <span class={`text-xs font-bold px-3 py-1 rounded-full border ${scoreColor}`}>
                    {isFailed ? 'FAILED' : `${page.score}%`}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              {!isFailed && (
                <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    class={`h-full transition-all duration-700 ${barBg}`}
                    style={{ width: `${page.score}%` }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
