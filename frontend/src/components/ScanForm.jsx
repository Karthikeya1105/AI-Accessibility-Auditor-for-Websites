import React, { useState } from 'react';
import { Globe, Code2, Layers, Play, Sparkles, AlertTriangle, FileCode, Search, CheckSquare } from 'lucide-react';

const SAMPLE_INACCESSIBLE_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Sample Inaccessible E-Commerce Page</title>
</head>
<body>
  <h3>Welcome to Our Shop</h3>
  <img src="banner.jpg">
  <img src="product.jpg" alt="image">
  <form>
    <div>
      <span>Username:</span>
      <input type="text" name="user">
    </div>
    <div>
      <span>Password:</span>
      <input type="password" name="pass">
    </div>
    <button type="submit"></button>
  </form>
  <p style="color: #aaa; background-color: #ffffff;">
    Special discount code valid for a limited time only!
  </p>
  <p>To read our return policy, <a href="/returns">click here</a>.</p>
  <video src="promo.mp4" controls></video>
</body>
</html>`;

export const ScanForm = ({ onStartScan, onOpenDiscovery, isLoading, resetKey }) => {
  const [activeTab, setActiveTab] = useState('url'); // 'url' | 'html'
  const [scanScope, setScanScope] = useState('single'); // 'single' | 'auto_batch' | 'manual_batch'
  const [maxPages, setMaxPages] = useState(5);
  const [urlInput, setUrlInput] = useState('');
  const [htmlInput, setHtmlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Clear all form inputs on login, signup, or logout trigger
  React.useEffect(() => {
    setUrlInput('');
    setHtmlInput('');
    setErrorMsg('');
  }, [resetKey]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (activeTab === 'url') {
      if (!urlInput.trim()) {
        setErrorMsg('Please enter a target website URL.');
        return;
      }

      if (scanScope === 'manual_batch') {
        onOpenDiscovery(urlInput.trim());
      } else {
        onStartScan({
          mode: 'url',
          scope: scanScope,
          url: urlInput.trim(),
          maxPages: Number(maxPages)
        });
      }
    } else {
      if (!htmlInput.trim()) {
        setErrorMsg('Please paste or upload HTML code content.');
        return;
      }
      onStartScan({ mode: 'html', scope: 'single', html: htmlInput.trim() });
    }
  };

  const handleLoadSample = () => {
    setActiveTab('html');
    setScanScope('single');
    setHtmlInput(SAMPLE_INACCESSIBLE_HTML);
    setErrorMsg('');
  };

  return (
    <div class="glass-card rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl relative overflow-hidden border border-slate-800">
      <div class="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <span>Audit Website Accessibility</span>
            <span class="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-normal">WCAG 2.1 AA</span>
          </h2>
          <p class="text-xs text-slate-400 mt-1">
            Submit a URL, run automatic site audits, select custom pages, or audit raw HTML.
          </p>
        </div>

        {/* Tab Switcher */}
        <div class="flex rounded-lg bg-slate-900 p-1 border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            class={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'url' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe class="w-3.5 h-3.5" />
            <span>Website URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('html')}
            class={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'html' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 class="w-3.5 h-3.5" />
            <span>HTML Source Code</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} class="space-y-4">
        {activeTab === 'url' ? (
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1.5">
                Enter Target Website URL
              </label>
              <div class="relative">
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isLoading}
                  class="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <Globe class="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Scope Selection Cards: Single vs Automatic Batch vs Manual Discovery */}
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setScanScope('single')}
                class={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                  scanScope === 'single'
                    ? 'border-blue-500 bg-blue-950/40 text-white ring-1 ring-blue-500/30'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div class="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                  <Globe class="w-4 h-4" />
                </div>
                <div>
                  <div class="text-xs font-bold text-white">Single Page</div>
                  <div class="text-[11px] text-slate-400">Audits exact page URL</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScanScope('auto_batch')}
                class={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                  scanScope === 'auto_batch'
                    ? 'border-blue-500 bg-blue-950/40 text-white ring-1 ring-blue-500/30'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div class="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Layers class="w-4 h-4" />
                </div>
                <div>
                  <div class="text-xs font-bold text-white">Automatic Site Scan</div>
                  <div class="text-[11px] text-slate-400">Picks priority pages</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScanScope('manual_batch')}
                class={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                  scanScope === 'manual_batch'
                    ? 'border-blue-500 bg-blue-950/40 text-white ring-1 ring-blue-500/30'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div class="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <CheckSquare class="w-4 h-4" />
                </div>
                <div>
                  <div class="text-xs font-bold text-white">Custom Page Selection</div>
                  <div class="text-[11px] text-slate-400">Discover & pick pages</div>
                </div>
              </button>
            </div>

            {/* Max Pages Slider for Auto Batch Mode */}
            {scanScope === 'auto_batch' && (
              <div class="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <Layers class="w-4 h-4 text-indigo-400" />
                  <span class="text-xs font-semibold text-slate-300">Max Top Priority Pages:</span>
                </div>
                <div class="flex items-center space-x-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={maxPages}
                    onChange={(e) => setMaxPages(e.target.value)}
                    class="w-24 accent-blue-500 cursor-pointer"
                  />
                  <span class="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                    {maxPages} Pages
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-medium text-slate-300">
                Paste Raw HTML/CSS Code
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                class="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <Sparkles class="w-3 h-3" />
                Load Inaccessible Demo HTML
              </button>
            </div>
            <textarea
              rows={8}
              placeholder="<html><body><img src='photo.jpg'><form><input></form></body></html>"
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              disabled={isLoading}
              class="w-full p-4 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
            ></textarea>
          </div>
        )}

        {errorMsg && (
          <div class="flex items-center space-x-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
            <AlertTriangle class="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div class="flex items-center justify-between pt-2">
          <div class="text-xs text-slate-500 flex items-center gap-1.5">
            <FileCode class="w-4 h-4 text-blue-400" />
            <span>Checks: Alt Text, Color Contrast, Form Labels, Headings, ARIA, Captions</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            class="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Executing Audit...</span>
              </>
            ) : (
              <>
                <Play class="w-4 h-4 fill-white" />
                <span>
                  {scanScope === 'manual_batch'
                    ? 'Discover & Select Pages'
                    : scanScope === 'auto_batch'
                    ? `Start Auto Batch (${maxPages} Pages)`
                    : 'Start Accessibility Audit'}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
