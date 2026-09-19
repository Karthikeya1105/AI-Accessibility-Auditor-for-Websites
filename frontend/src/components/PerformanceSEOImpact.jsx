import React from 'react';
import { Gauge, Smartphone, Image, FormInput, Heading, Sun, Info, CheckCircle2 } from 'lucide-react';

const ICON_MAP = {
  Image,
  FormInput,
  Heading,
  Sun
};

export const PerformanceSEOImpact = ({ performanceImpact }) => {
  if (!performanceImpact) return null;

  const { loadDurationSeconds, speedBadge, disclaimer, impactNotes = [] } = performanceImpact;

  return (
    <div class="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl mb-8">
      
      {/* Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <div class="flex items-center space-x-2">
            <Gauge class="w-5 h-5 text-emerald-400" />
            <h3 class="text-lg font-bold text-white">Performance, Mobile & Usability Impact</h3>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Broader user experience and search engine discoverability benefits enabled by WCAG remediation.
          </p>
        </div>

        <div class="flex items-center space-x-3 text-xs">
          <div class="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <span>Page Speed: </span>
            <span class="font-bold text-emerald-400">{loadDurationSeconds}s</span>
          </div>
          <div class="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
            {speedBadge}
          </div>
        </div>
      </div>

      {/* Impact Benefit Cards */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {impactNotes.map((note, idx) => {
          const IconComponent = ICON_MAP[note.icon] || CheckCircle2;

          return (
            <div key={idx} class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3.5">
              <div class="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                <IconComponent class="w-4 h-4" />
              </div>

              <div>
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-white">{note.title}</h4>
                  <span class="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    {note.category}
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                  {note.benefit}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer Callout */}
      <div class="flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-900 border border-slate-800 p-3 rounded-lg">
        <Info class="w-4 h-4 text-blue-400 shrink-0" />
        <span>{disclaimer}</span>
      </div>

    </div>
  );
};
