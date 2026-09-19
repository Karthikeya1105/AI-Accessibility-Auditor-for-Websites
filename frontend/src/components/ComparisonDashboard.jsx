import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowRight, ShieldCheck, CheckCircle2, AlertOctagon, Sparkles, RefreshCw, PlusCircle, CheckCircle } from 'lucide-react';
import { CodeComparison } from './CodeComparison';

export const ComparisonDashboard = ({ comparisonData }) => {
  const [activeTab, setActiveTab] = useState('FIXED'); // 'FIXED' | 'PERSISTING' | 'NEW'

  if (!comparisonData) return null;

  const {
    targetUrl,
    scoreA,
    scoreB,
    scoreDiff,
    statusChange,
    timestampA,
    timestampB,
    aiTrendSummary,
    issueDiffs,
    lifecycleCounts = { fixed: 0, persisting: 0, new: 0, regressed: 0 },
    fixedIssues = [],
    persistingIssues = [],
    newIssues = []
  } = comparisonData;

  const isImproved = statusChange === 'Improved';
  const isRegressed = statusChange === 'Regressed';

  let deltaColor = 'text-slate-300 bg-slate-800 border-slate-700';
  let DeltaIcon = Minus;
  if (isImproved) {
    deltaColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    DeltaIcon = TrendingUp;
  } else if (isRegressed) {
    deltaColor = 'text-red-400 bg-red-500/10 border-red-500/30';
    DeltaIcon = TrendingDown;
  }

  let activeList = fixedIssues;
  if (activeTab === 'PERSISTING') activeList = persistingIssues;
  if (activeTab === 'NEW') activeList = newIssues;

  return (
    <div class="space-y-8 animate-fadeIn">
      
      {/* Hero Comparison Card */}
      <div class="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div>
            <div class="flex items-center space-x-2 mb-2">
              <span class={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${deltaColor}`}>
                <DeltaIcon class="w-3.5 h-3.5" />
                <span>{scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff} Score Delta ({statusChange})</span>
              </span>
              <span class="text-xs text-slate-400">Historical Scan Comparison</span>
            </div>

            <h3 class="text-xl font-bold text-white max-w-md truncate" title={targetUrl}>
              {targetUrl}
            </h3>

            <div class="flex items-center space-x-4 text-xs text-slate-400 mt-2">
              <span><strong>Previous:</strong> {new Date(timestampA).toLocaleDateString()} ({scoreA}%)</span>
              <ArrowRight class="w-3.5 h-3.5 text-slate-500" />
              <span><strong>Current:</strong> {new Date(timestampB).toLocaleDateString()} ({scoreB}%)</span>
            </div>
          </div>

          {/* Scores Side by Side */}
          <div class="flex items-center space-x-6">
            <div class="text-center p-4 rounded-xl bg-slate-900 border border-slate-800 min-w-[100px]">
              <span class="block text-3xl font-extrabold text-slate-400">{scoreA}</span>
              <span class="text-[10px] font-bold text-slate-500 uppercase">Previous Score</span>
            </div>

            <ArrowRight class="w-5 h-5 text-blue-400" />

            <div class="text-center p-4 rounded-xl bg-slate-900 border border-slate-800 min-w-[100px]">
              <span class={`block text-3xl font-extrabold ${scoreB >= 80 ? 'text-emerald-400' : scoreB >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {scoreB}
              </span>
              <span class="text-[10px] font-bold text-slate-400 uppercase">Current Score</span>
            </div>
          </div>

        </div>

        {/* Groq AI Trend Summary Callout */}
        {aiTrendSummary && (
          <div class="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-start space-x-3">
            <Sparkles class="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span class="font-bold text-white block mb-0.5">AI Executive Trend Analysis</span>
              <span>{aiTrendSummary}</span>
            </div>
          </div>
        )}
      </div>

      {/* 4-State Lifecycle Count Cards */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('FIXED')}
          class={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'FIXED' ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500/30' : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}
        >
          <div class="flex items-center justify-between mb-1">
            <CheckCircle class="w-4 h-4 text-emerald-400" />
            <span class="text-xs font-bold text-emerald-400">{lifecycleCounts.fixed}</span>
          </div>
          <span class="text-xs font-bold block text-white">Fixed Issues</span>
          <span class="text-[11px] text-slate-500">Resolved since last audit</span>
        </button>

        <button
          onClick={() => setActiveTab('PERSISTING')}
          class={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'PERSISTING' ? 'bg-amber-950/40 border-amber-500 text-white ring-1 ring-amber-500/30' : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}
        >
          <div class="flex items-center justify-between mb-1">
            <RefreshCw class="w-4 h-4 text-amber-400" />
            <span class="text-xs font-bold text-amber-400">{lifecycleCounts.persisting}</span>
          </div>
          <span class="text-xs font-bold block text-white">Persisting Issues</span>
          <span class="text-[11px] text-slate-500">Unresolved from previous</span>
        </button>

        <button
          onClick={() => setActiveTab('NEW')}
          class={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'NEW' ? 'bg-red-950/40 border-red-500 text-white ring-1 ring-red-500/30' : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}
        >
          <div class="flex items-center justify-between mb-1">
            <PlusCircle class="w-4 h-4 text-red-400" />
            <span class="text-xs font-bold text-red-400">{lifecycleCounts.new}</span>
          </div>
          <span class="text-xs font-bold block text-white">New Issues</span>
          <span class="text-[11px] text-slate-500">Introduced in recent audit</span>
        </button>

        <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-left">
          <div class="flex items-center justify-between mb-1">
            <AlertOctagon class="w-4 h-4 text-slate-500" />
            <span class="text-xs font-bold text-slate-400">{lifecycleCounts.regressed}</span>
          </div>
          <span class="text-xs font-bold block text-slate-300">Regressions</span>
          <span class="text-[11px] text-slate-500">Reappeared violations</span>
        </div>
      </div>

      {/* Code Snippet Change Details */}
      <div class="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <h4 class="text-base font-bold text-white flex items-center justify-between">
          <span>{activeTab === 'FIXED' ? 'Resolved Code Changes (Fixed)' : activeTab === 'PERSISTING' ? 'Unresolved Issues (Persisting)' : 'New Issues Introduced'}</span>
          <span class="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded">
            {activeList.length} Items
          </span>
        </h4>

        {activeList.length === 0 ? (
          <div class="text-center py-8 text-xs text-slate-500">
            No issues found under {activeTab.toLowerCase()} classification.
          </div>
        ) : (
          activeList.map((item, idx) => (
            <div key={item.fingerprint || idx} class="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="text-xs font-semibold text-blue-400">{item.category}</span>
                  <span class="text-xs font-mono text-slate-400">&lt;{item.selector}&gt;</span>
                </div>
                <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {item.lifecycle}
                </span>
              </div>

              <p class="text-xs font-bold text-white">
                {item.context || item.explanation}
              </p>

              <CodeComparison
                originalSnippet={item.htmlBefore || item.htmlCurrent}
                suggestedFixCode={item.htmlAfter || item.suggestedFixCode}
              />
            </div>
          ))
        )}
      </div>

    </div>
  );
};
