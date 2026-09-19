import React, { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, History, Cpu, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const Navbar = ({ onOpenHistory }) => {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.checkHealth()
      .then(res => setHealth(res))
      .catch(() => setHealth({ status: 'offline' }));
  }, []);

  return (
    <header class="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck class="w-6 h-6 text-white" />
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-bold text-lg text-white tracking-tight">a11yAuditor</span>
              <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                WCAG 2.1 AI
              </span>
            </div>
            <p class="text-xs text-slate-400">Automated Web Accessibility Auditor & Fix Generator</p>
          </div>
        </div>

        {/* Status Indicators & History Trigger */}
        <div class="flex items-center space-x-4">
          
          {/* Groq AI Badge */}
          <div class="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Cpu class="w-3.5 h-3.5 text-purple-400" />
            <span>AI Engine:</span>
            <span class="font-semibold text-purple-300">
              {health?.groqEnabled ? 'Groq Llama-3' : 'Smart Template'}
            </span>
          </div>

          {/* API Server Health */}
          <div class="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
            <span class={`w-2 h-2 rounded-full ${health?.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span class="text-slate-400">{health?.status === 'online' ? 'API Online' : 'Connecting...'}</span>
          </div>

          {/* Scan History Button */}
          <button
            onClick={onOpenHistory}
            class="flex items-center space-x-1.5 text-xs font-medium px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
          >
            <History class="w-4 h-4 text-blue-400" />
            <span>Scan History</span>
          </button>
        </div>

      </div>
    </header>
  );
};
