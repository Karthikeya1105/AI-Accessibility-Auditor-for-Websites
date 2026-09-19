import React from 'react';
import { ShieldCheck, FileText, Layers, Clock } from 'lucide-react';
import { api } from '../services/api';

export const BatchScoreCard = ({ scanData }) => {
  if (!scanData) return null;

  const { score, wcagLevel, counts, url, pageTitle, durationSeconds, id, pagesScanned } = scanData;

  let scoreColor = 'text-emerald-400';
  let strokeColor = '#22c55e';
  let badgeBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';

  if (score < 50) {
    scoreColor = 'text-red-400';
    strokeColor = '#ef4444';
    badgeBg = 'bg-red-500/10 border-red-500/30 text-red-400';
  } else if (score < 80) {
    scoreColor = 'text-amber-400';
    strokeColor = '#f59e0b';
    badgeBg = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
  }

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const pdfUrl = api.getPdfDownloadUrl(id);

  return (
    <div class="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
      <div class="flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left Side: Site Score Gauge */}
        <div class="flex items-center space-x-6">
          <div class="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg class="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                class="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r="42"
                stroke={strokeColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                class="transition-all duration-1000 ease-out"
              />
            </svg>
            <div class="absolute flex flex-col items-center justify-center">
              <span class={`text-3xl font-extrabold ${scoreColor}`}>{score}</span>
              <span class="text-[10px] uppercase font-bold text-slate-400">/ 100</span>
            </div>
          </div>

          <div>
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${badgeBg}`}>
                <ShieldCheck class="w-3.5 h-3.5" />
                <span>{wcagLevel}</span>
              </span>
              <span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                <Layers class="w-3.5 h-3.5 text-indigo-400" />
                <span>Batch Audit ({pagesScanned} Pages)</span>
              </span>
            </div>

            <h3 class="text-xl font-bold text-white max-w-md truncate" title={url}>
              {url}
            </h3>

            <div class="flex items-center space-x-3 text-xs text-slate-400 mt-1">
              <span>Site-Wide Aggregated Score</span>
              <span>•</span>
              <span class="flex items-center space-x-1">
                <Clock class="w-3 h-3 text-slate-500" />
                <span>{durationSeconds}s batch scan</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Total Site Issues & Download PDF */}
        <div class="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          
          <div class="grid grid-cols-3 gap-3 w-full sm:w-auto">
            <div class="px-4 py-3 rounded-xl bg-red-950/40 border border-red-500/20 text-center min-w-[90px]">
              <span class="block text-2xl font-bold text-red-400">{counts.critical}</span>
              <span class="text-[11px] font-medium text-red-300">Critical</span>
            </div>
            <div class="px-4 py-3 rounded-xl bg-amber-950/40 border border-amber-500/20 text-center min-w-[90px]">
              <span class="block text-2xl font-bold text-amber-400">{counts.major}</span>
              <span class="text-[11px] font-medium text-amber-300">Major</span>
            </div>
            <div class="px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-center min-w-[90px]">
              <span class="block text-2xl font-bold text-slate-300">{counts.minor}</span>
              <span class="text-[11px] font-medium text-slate-400">Minor</span>
            </div>
          </div>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/30 whitespace-nowrap shrink-0"
          >
            <FileText class="w-4 h-4" />
            <span>Download Site PDF Report</span>
          </a>
        </div>

      </div>
    </div>
  );
};
