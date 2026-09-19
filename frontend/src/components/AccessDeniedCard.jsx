import React from 'react';
import { ShieldAlert, Globe, Code, ArrowRight, RefreshCw, Lock } from 'lucide-react';

export const AccessDeniedCard = ({ errorObj, onReset, onSwitchToHtml }) => {
  if (!errorObj) return null;

  const { status = 'ACCESS_DENIED', message = 'The target website could not be accessed for scanning.', targetUrl } = errorObj;

  const getStatusBadge = () => {
    switch (status) {
      case 'ACCESS_DENIED':
        return { label: 'HTTP 403 Access Forbidden', color: 'bg-red-500/10 text-red-400 border-red-500/30', icon: Lock };
      case 'NOT_FOUND':
        return { label: 'HTTP 404 Page Not Found', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Globe };
      case 'TIMEOUT':
        return { label: 'Connection Timed Out (10s)', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: RefreshCw };
      case 'DNS_ERROR':
        return { label: 'DNS Resolution Failed', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: Globe };
      default:
        return { label: 'Inspection Access Blocked', color: 'bg-red-500/10 text-red-400 border-red-500/30', icon: ShieldAlert };
    }
  };

  const badge = getStatusBadge();
  const IconComponent = badge.icon;

  return (
    <div class="max-w-3xl mx-auto glass-card rounded-2xl p-6 sm:p-8 border border-red-500/30 bg-red-950/10 shadow-2xl space-y-6 animate-fadeIn">
      
      {/* Header Badge */}
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <IconComponent class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-white">Unable to Access Website URL</h3>
            <p class="text-xs text-slate-400 font-mono">{targetUrl || 'Target Web Address'}</p>
          </div>
        </div>

        <span class={`text-xs font-bold px-3 py-1 rounded-full border ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      {/* Description Body */}
      <div class="space-y-3 text-xs text-slate-300 leading-relaxed">
        <p class="font-medium text-slate-200">{message}</p>
        <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Why did this happen?</span>
          <ul class="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
            <li>The web server or firewall configured anti-bot rules blocking automated HTTP inspection.</li>
            <li>The page requires user authentication or session cookies to render content.</li>
            <li>The URL contains a typo or points to an internal private network address.</li>
          </ul>
        </div>
      </div>

      {/* Recommended Alternative Action Buttons */}
      <div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={onReset}
          class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center space-x-2"
        >
          <RefreshCw class="w-4 h-4 text-slate-400" />
          <span>Try Another URL</span>
        </button>

        <button
          onClick={onSwitchToHtml}
          class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2"
        >
          <Code class="w-4 h-4" />
          <span>Upload HTML Code Instead</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
