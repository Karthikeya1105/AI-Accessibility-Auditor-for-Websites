import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Shield, Search, Cpu, BarChart3 } from 'lucide-react';

const STAGES = [
  { label: 'Validating URL & Request Security', icon: Shield },
  { label: 'Fetching DOM Content & Resources', icon: Search },
  { label: 'Running Static WCAG 2.1 Rule Checks', icon: BarChart3 },
  { label: 'Generating AI Explanations & Code Fixes', icon: Cpu }
];

export const ScanProgress = () => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStage(prev => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div class="glass-card rounded-2xl p-8 max-w-xl mx-auto text-center border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Scanner Radar Beam Background */}
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div class="relative z-10">
        <div class="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 mx-auto mb-6 flex items-center justify-center animate-pulse">
          <Loader2 class="w-8 h-8 animate-spin" />
        </div>

        <h3 class="text-xl font-bold text-white mb-2">Analyzing Web Accessibility</h3>
        <p class="text-xs text-slate-400 mb-8 max-w-sm mx-auto">
          Checking DOM elements against WCAG 2.1 Level AA standards and crafting AI code remediation...
        </p>

        {/* Step-by-Step Progress List */}
        <div class="space-y-3 text-left max-w-md mx-auto">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isDone = idx < currentStage;
            const isCurrent = idx === currentStage;

            return (
              <div
                key={idx}
                class={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-600/10 border-blue-500/40 text-blue-300'
                    : isDone
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                    : 'opacity-40 border-transparent text-slate-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 class="w-5 h-5 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 class="w-5 h-5 text-blue-400 animate-spin shrink-0" />
                ) : (
                  <Icon class="w-5 h-5 text-slate-500 shrink-0" />
                )}
                <span class="text-xs font-medium">{stage.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
