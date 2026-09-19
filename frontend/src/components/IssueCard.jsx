import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, ChevronDown, ChevronUp, Code, Lightbulb } from 'lucide-react';
import { CodeComparison } from './CodeComparison';

export const IssueCard = ({ issue, index }) => {
  const [expanded, setExpanded] = useState(true);

  const { severity, category, element, selector, wcag, explanation, originalSnippet, suggestedFixCode, quickTip, context } = issue;

  let sevBadge = 'bg-slate-800 text-slate-300 border-slate-700';
  let SevIcon = Info;
  if (severity === 'Critical') {
    sevBadge = 'bg-red-500/10 text-red-400 border-red-500/30';
    SevIcon = AlertCircle;
  } else if (severity === 'Major') {
    sevBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    SevIcon = AlertTriangle;
  }

  return (
    <div class="glass-card rounded-xl border border-slate-800 overflow-hidden mb-4 transition-all hover:border-slate-700">
      
      {/* Header Bar */}
      <div class="p-4 sm:p-5 flex items-start justify-between gap-4">
        <div class="flex items-start space-x-3.5">
          <div class={`p-2 rounded-lg border ${sevBadge} shrink-0 mt-0.5`}>
            <SevIcon class="w-4 h-4" />
          </div>

          <div>
            <div class="flex flex-wrap items-center gap-2 mb-1.5">
              <span class={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${sevBadge}`}>
                {severity}
              </span>
              <span class="text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                {category}
              </span>
              <span class="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                &lt;{element}&gt;
              </span>
            </div>

            <h4 class="text-sm font-bold text-white">
              {context || `Accessibility issue detected in <${element}>`}
            </h4>

            <p class="text-xs text-slate-400 mt-1 font-mono">
              Selector: <span class="text-slate-300">{selector}</span>
            </p>
          </div>
        </div>

        {/* Toggle Expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          class="text-slate-400 hover:text-slate-200 p-1 rounded-lg bg-slate-900 border border-slate-800 shrink-0"
        >
          {expanded ? <ChevronUp class="w-4 h-4" /> : <ChevronDown class="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div class="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-4">
          
          {/* Plain-English Explanation */}
          <div class="bg-slate-900/90 rounded-xl p-4 border border-slate-800/80">
            <h5 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Info class="w-3.5 h-3.5 text-blue-400" />
              <span>Plain-English Impact & Context</span>
            </h5>
            <p class="text-xs text-slate-300 leading-relaxed">
              {explanation}
            </p>
            <div class="mt-2 text-[11px] text-slate-400 flex items-center space-x-1">
              <span class="font-semibold text-slate-300">Standard:</span>
              <span class="text-blue-400">{wcag}</span>
            </div>
          </div>

          {/* Code Fix Side-by-Side Comparison */}
          <CodeComparison
            originalSnippet={originalSnippet}
            suggestedFixCode={suggestedFixCode}
          />

          {/* Quick Tip */}
          {quickTip && (
            <div class="flex items-center space-x-2 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
              <Lightbulb class="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Developer Tip:</strong> {quickTip}</span>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
