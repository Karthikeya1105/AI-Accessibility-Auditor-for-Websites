import React, { useEffect, useState } from 'react';
import { X, History, ExternalLink, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const HistoryDrawer = ({ isOpen, onClose, onSelectScan }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getHistory()
        .then(res => setHistory(res.data || []))
        .catch(err => console.error('Failed to load history:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div class="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto flex flex-col shadow-2xl">
        
        {/* Header */}
        <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div class="flex items-center space-x-2">
            <History class="w-5 h-5 text-blue-400" />
            <h3 class="text-lg font-bold text-white">Scan History</h3>
          </div>
          <button
            onClick={onClose}
            class="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 border border-slate-700"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        {loading ? (
          <div class="flex-1 flex items-center justify-center text-xs text-slate-400">
            <span>Loading history...</span>
          </div>
        ) : history.length === 0 ? (
          <div class="flex-1 flex flex-col items-center justify-center text-slate-500 text-center p-6">
            <History class="w-10 h-10 mb-2 opacity-40" />
            <p class="text-xs font-medium">No previous scans found.</p>
            <p class="text-[11px] text-slate-600 mt-1">Run a scan above to save audit records.</p>
          </div>
        ) : (
          <div class="space-y-3 flex-1 overflow-y-auto pr-1">
            {history.map((item) => {
              let scoreColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
              if (item.score < 50) scoreColor = 'text-red-400 border-red-500/30 bg-red-500/10';
              else if (item.score < 80) scoreColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectScan(item);
                    onClose();
                  }}
                  class="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-blue-500/50 hover:bg-slate-950 transition-all cursor-pointer group"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-mono text-slate-400 truncate max-w-[200px]" title={item.url}>
                      {item.url}
                    </span>
                    <span class={`text-xs font-bold px-2 py-0.5 rounded-full border ${scoreColor}`}>
                      {item.score}%
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-[11px] text-slate-500">
                    <div class="flex items-center space-x-2">
                      <Clock class="w-3 h-3 text-slate-600" />
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="flex items-center space-x-1 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      <span>View</span>
                      <ArrowRight class="w-3 h-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
