import React, { useState } from 'react';
import { Copy, Check, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const CodeComparison = ({ originalSnippet, suggestedFixCode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestedFixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* Problematic Original Code */}
      <div class="rounded-xl border border-red-500/30 bg-red-950/20 overflow-hidden">
        <div class="px-4 py-2 bg-red-950/60 border-b border-red-500/20 flex items-center space-x-2 text-xs font-semibold text-red-300">
          <AlertOctagon class="w-3.5 h-3.5 text-red-400" />
          <span>Problematic Code (Current)</span>
        </div>
        <div class="p-4 font-mono text-xs text-red-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
          <code>{originalSnippet || '<!-- No snippet captured -->'}</code>
        </div>
      </div>

      {/* Suggested AI Corrected Code */}
      <div class="rounded-xl border border-emerald-500/30 bg-emerald-950/20 overflow-hidden relative">
        <div class="px-4 py-2 bg-emerald-950/60 border-b border-emerald-500/20 flex items-center justify-between">
          <div class="flex items-center space-x-2 text-xs font-semibold text-emerald-300">
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-400" />
            <span>Suggested Code Fix (AI Corrected)</span>
          </div>
          <button
            onClick={handleCopy}
            class="flex items-center space-x-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-500/30 transition-colors"
          >
            {copied ? (
              <>
                <Check class="w-3 h-3 text-emerald-300" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy class="w-3 h-3" />
                <span>Copy Fix</span>
              </>
            )}
          </button>
        </div>
        <div class="p-4 font-mono text-xs text-emerald-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
          <code>{suggestedFixCode || '<!-- Suggested fix template -->'}</code>
        </div>
      </div>

    </div>
  );
};
