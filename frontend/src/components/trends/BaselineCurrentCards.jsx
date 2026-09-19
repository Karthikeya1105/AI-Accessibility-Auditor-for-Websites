import React from 'react';
import { Clock, CheckCircle2, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';

export const BaselineCurrentCards = ({ baseline, current, overallImprovement, shortTermImprovement }) => {
  if (!baseline || !current) return null;

  const isLongTermImproved = overallImprovement?.scorePoints > 0;
  const isShortTermImproved = shortTermImprovement?.scoreDelta > 0;

  return (
    <div class="space-y-4">
      {/* Short-Term Verification Banner */}
      {shortTermImprovement && (
        <div class="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div class="flex items-center space-x-2">
            <TrendingUp class="w-4 h-4 text-blue-400" />
            <span class="text-slate-300">
              Score progress since immediate previous verification:
            </span>
            <strong class="text-white font-mono">
              {shortTermImprovement.previousScore}% ➔ {shortTermImprovement.currentScore}%
            </strong>
          </div>
          <span class={`font-bold px-3 py-0.5 rounded-full border ${
            isShortTermImproved ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            {shortTermImprovement.scoreDelta > 0 ? `+${shortTermImprovement.scoreDelta}` : shortTermImprovement.scoreDelta} Pts Since Last Scan
          </span>
        </div>
      )}

      {/* Hero 3-Card Grid */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Baseline Card (V1) */}
        <div class="p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 relative overflow-hidden">
          <div class="absolute top-0 right-0 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
            V1 Baseline
          </div>
          <div class="text-xs text-amber-400 font-medium mb-1 flex items-center space-x-1">
            <Clock class="w-3.5 h-3.5" />
            <span>{baseline.dateFormatted}</span>
          </div>
          <div class="text-3xl font-black text-white mt-2">
            {baseline.score}% <span class="text-xs font-normal text-slate-400">baseline score</span>
          </div>
          <div class="text-xs text-slate-300 mt-3 flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-red-400 font-bold">
              {baseline.totalIssues} Baseline Issues
            </span>
          </div>
        </div>

        {/* Long-Term Progress Metric */}
        <div class="p-5 rounded-xl border border-blue-500/30 bg-blue-500/5 flex flex-col justify-center items-center text-center">
          <Sparkles class="w-6 h-6 text-blue-400 mb-1 animate-pulse" />
          <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Long-Term Progress (V1 ➔ Vn)</div>
          <div class="text-3xl font-black text-emerald-400 mt-1">
            {overallImprovement?.scorePoints > 0 ? `+${overallImprovement.scorePoints}` : overallImprovement?.scorePoints} Points
          </div>
          <div class="text-xs text-slate-300 mt-2 font-medium">
            <strong class="text-emerald-400">+{overallImprovement?.relativeScoreChange}%</strong> relative score change
          </div>
        </div>

        {/* Current Card (Vn) */}
        <div class="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden">
          <div class="absolute top-0 right-0 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
            Current Verification
          </div>
          <div class="text-xs text-emerald-400 font-medium mb-1 flex items-center space-x-1">
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>{current.dateFormatted}</span>
          </div>
          <div class="text-3xl font-black text-white mt-2">
            {current.score}% <span class="text-xs font-normal text-slate-400">current score</span>
          </div>
          <div class="text-xs text-slate-300 mt-3 flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
              {current.totalIssues} Remaining Issues
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
