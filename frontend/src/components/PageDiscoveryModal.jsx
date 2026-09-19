import React, { useState } from 'react';
import { X, CheckSquare, Square, Layers, Search, Plus, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';

export const PageDiscoveryModal = ({ isOpen, onClose, baseUrl, pages = [], onConfirmScan }) => {
  const [selectedUrls, setSelectedUrls] = useState(() => {
    return pages.filter(p => p.isSelected).map(p => p.url);
  });
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [customPages, setCustomPages] = useState([]);

  if (!isOpen) return null;

  const allPages = [...pages, ...customPages];

  const toggleSelect = (url) => {
    if (selectedUrls.includes(url)) {
      setSelectedUrls(selectedUrls.filter(u => u !== url));
    } else {
      if (selectedUrls.length >= 10) return;
      setSelectedUrls([...selectedUrls, url]);
    }
  };

  const handleSelectAll = () => {
    setSelectedUrls(allPages.slice(0, 10).map(p => p.url));
  };

  const handleClearAll = () => {
    setSelectedUrls([]);
  };

  const handleAddCustomUrl = (e) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    let formatted = customUrlInput.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'https://' + formatted;
    }

    if (!allPages.some(p => p.url === formatted)) {
      const newPage = {
        url: formatted,
        title: formatted,
        category: 'Custom Added',
        priority: 80,
        isSelected: true
      };
      setCustomPages([...customPages, newPage]);
      if (selectedUrls.length < 10) {
        setSelectedUrls([...selectedUrls, formatted]);
      }
    }
    setCustomUrlInput('');
  };

  const handleStart = () => {
    if (selectedUrls.length === 0) return;
    onConfirmScan(selectedUrls);
    onClose();
  };

  // Group pages by category
  const categories = ['Core Pages', 'Business Pages', 'Content Pages', 'Utility & Legal', 'Custom Added'];
  const groupedPages = {};
  categories.forEach(cat => {
    groupedPages[cat] = allPages.filter(p => (p.category || 'Core Pages') === cat);
  });

  return (
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div class="glass-card rounded-2xl max-w-2xl w-full border border-slate-800 shadow-2xl p-6 sm:p-8 relative">
        
        {/* Header */}
        <div class="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <div class="flex items-center space-x-2">
              <Layers class="w-5 h-5 text-indigo-400" />
              <h3 class="text-lg font-bold text-white">Categorized Page Discovery & Selection</h3>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              Select discovered internal pages for <span class="text-blue-400 font-mono">{baseUrl}</span> or add unlinked URLs manually.
            </p>
          </div>

          <button
            onClick={onClose}
            class="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        {/* Add Custom URL Form */}
        <form onSubmit={handleAddCustomUrl} class="flex items-center space-x-2 mb-4">
          <input
            type="text"
            placeholder="Add unlinked URL (e.g. https://example.com/special-offer)"
            value={customUrlInput}
            onChange={(e) => setCustomUrlInput(e.target.value)}
            class="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            class="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1 shrink-0"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Add URL</span>
          </button>
        </form>

        {/* Action Controls */}
        <div class="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800 mb-4">
          <div class="flex items-center space-x-2 text-xs">
            <button
              type="button"
              onClick={handleSelectAll}
              class="text-blue-400 hover:text-blue-300 font-semibold px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20"
            >
              ✓ Select Top 10
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              class="text-slate-400 hover:text-slate-200 font-medium px-2.5 py-1 rounded bg-slate-800"
            >
              Clear All
            </button>
          </div>

          <span class="text-xs font-bold text-slate-300">
            Selected: <span class="text-blue-400">{selectedUrls.length}</span> / 10 Max
          </span>
        </div>

        {/* Categorized Discovered Pages List */}
        <div class="space-y-4 max-h-80 overflow-y-auto pr-1 mb-6">
          {categories.map((catName) => {
            const groupList = groupedPages[catName] || [];
            if (groupList.length === 0) return null;

            return (
              <div key={catName} class="space-y-2">
                <div class="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  <span>{catName} ({groupList.length})</span>
                </div>

                <div class="space-y-1.5">
                  {groupList.map((p) => {
                    const isChecked = selectedUrls.includes(p.url);

                    return (
                      <div
                        key={p.url}
                        onClick={() => toggleSelect(p.url)}
                        class={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-blue-950/40 border-blue-500/50 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div class="flex items-center space-x-3 overflow-hidden">
                          <button class="shrink-0 text-slate-400 hover:text-blue-400">
                            {isChecked ? (
                              <CheckSquare class="w-4 h-4 text-blue-400" />
                            ) : (
                              <Square class="w-4 h-4 text-slate-600" />
                            )}
                          </button>

                          <div class="truncate">
                            <h4 class="text-xs font-bold text-slate-200 truncate" title={p.title}>
                              {p.title || p.url}
                            </h4>
                            <p class="text-[11px] font-mono text-slate-500 truncate">
                              {p.url}
                            </p>
                          </div>
                        </div>

                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0 ml-2">
                          {p.priority || 60} Priority
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div class="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            class="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleStart}
            disabled={selectedUrls.length === 0}
            class="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Start Batch Audit ({selectedUrls.length} Pages)</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
