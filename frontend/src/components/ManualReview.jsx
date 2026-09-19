import React, { useState } from 'react';
import { ClipboardCheck, CheckSquare, Square, Info } from 'lucide-react';

export const ManualReview = ({ items = [] }) => {
  const [completed, setCompleted] = useState({});

  const toggleCheck = (id) => {
    setCompleted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!items || items.length === 0) return null;

  return (
    <div class="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl mb-8">
      <div class="flex items-center space-x-2 mb-2">
        <ClipboardCheck class="w-5 h-5 text-blue-400" />
        <h3 class="text-lg font-bold text-white">Recommended Manual Review Checklist</h3>
      </div>
      <p class="text-xs text-slate-400 mb-6">
        Automated scanners evaluate ~40% of WCAG criteria. Complete these manual review items for full accessibility assurance.
      </p>

      <div class="space-y-3">
        {items.map(item => {
          const isDone = Boolean(completed[item.id]);

          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              class={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <button class="mt-0.5 shrink-0 text-slate-400 hover:text-blue-400">
                {isDone ? (
                  <CheckSquare class="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square class="w-5 h-5 text-slate-500" />
                )}
              </button>

              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h4 class={`text-xs font-bold ${isDone ? 'line-through text-emerald-300' : 'text-white'}`}>
                    {item.title}
                  </h4>
                  <span class="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    {item.wcag}
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
