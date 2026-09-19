import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ScanForm } from './components/ScanForm';
import { ScanProgress } from './components/ScanProgress';
import { ScoreCard } from './components/ScoreCard';
import { BatchScoreCard } from './components/BatchScoreCard';
import { PageScoreList } from './components/PageScoreList';
import { CommonIssuesSummary } from './components/CommonIssuesSummary';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { IssueFilter } from './components/IssueFilter';
import { IssueCard } from './components/IssueCard';
import { ManualReview } from './components/ManualReview';
import { PageDiscoveryModal } from './components/PageDiscoveryModal';
import { ComparisonDashboard } from './components/ComparisonDashboard';
import { PerformanceSEOImpact } from './components/PerformanceSEOImpact';
import { TrendTimelineChart } from './components/TrendTimelineChart';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AccessDeniedCard } from './components/AccessDeniedCard';
import { LoginModal } from './components/LoginModal';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { CheckCircle2, AlertOctagon, TrendingUp, ShieldCheck, Gauge, Info } from 'lucide-react';

export const App = () => {
  const { isAuthenticated } = useAuth();
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [accessError, setAccessError] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [unchangedNotice, setUnchangedNotice] = useState('');

  // Discovery Modal state
  const [discoveryData, setDiscoveryData] = useState(null);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);

  // Comparison & Trends state
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'comparison' | 'trends'
  const [comparisonData, setComparisonData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPageUrl, setSelectedPageUrl] = useState(null);

  const handleLogoutClear = () => {
    setScanResult(null);
    setTrendData(null);
    setComparisonData(null);
    setActiveTab('dashboard');
    setErrorMsg('');
    setAccessError(null);
    setUnchangedNotice('');
  };

  const handleStartScan = async (payload) => {
    setIsLoading(true);
    setErrorMsg('');
    setAccessError(null);
    setUnchangedNotice('');
    setSelectedPageUrl(null);
    setActiveTab('dashboard');

    try {
      let response;
      if (payload.scope === 'auto_batch' || payload.scope === 'manual_batch') {
        response = await api.runBatchScan({
          url: payload.url,
          selectedUrls: payload.selectedUrls,
          maxPages: payload.maxPages
        });
      } else {
        response = await api.runScan(payload);
      }

      if (response.success) {
        setScanResult(response.data);
        if (response.unchanged) {
          setUnchangedNotice('No HTML changes detected since your previous scan (SHA-256 hash matched). Displaying existing scan version.');
        }
        if (response.data.websiteId) {
          fetchTrends(response.data.websiteId);
        }
      } else {
        if (response.status && response.status !== 'SCAN_FAILED') {
          setAccessError({
            status: response.status,
            message: response.message || response.error,
            targetUrl: payload.url
          });
        } else {
          setErrorMsg(response.error || response.message || 'Scan failed to return results.');
        }
      }
    } catch (err) {
      console.error('Scan Error:', err);
      const resData = err.response?.data;
      if (resData && resData.status && resData.status !== 'SCAN_FAILED') {
        setAccessError({
          status: resData.status,
          message: resData.message || resData.error,
          targetUrl: payload.url
        });
      } else {
        const msg = resData?.error || resData?.message || err.message || 'Server error occurred during scan.';
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrends = async (websiteId) => {
    try {
      const res = await api.getWebsiteTrends(websiteId);
      if (res.success) {
        setTrendData(res.data);
      }
    } catch {
      // Ignore trend error
    }
  };

  const handleOpenDiscovery = async (url) => {
    setIsDiscovering(true);
    setErrorMsg('');
    setAccessError(null);
    try {
      const response = await api.discoverPages(url);
      if (response.success) {
        setDiscoveryData(response);
        setIsDiscoveryOpen(true);
      } else {
        setErrorMsg(response.error || 'Failed to discover site pages.');
      }
    } catch (err) {
      setErrorMsg('Failed to fetch site links for manual selection.');
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleConfirmManualScan = (selectedUrls) => {
    if (!discoveryData?.baseUrl) return;
    handleStartScan({
      mode: 'url',
      scope: 'manual_batch',
      url: discoveryData.baseUrl,
      selectedUrls
    });
  };

  const handleCompareLatest = async () => {
    try {
      setComparisonLoading(true);
      const hist = await api.getHistory();
      const list = hist.data || [];
      if (list.length < 2) {
        setErrorMsg('At least 2 scan records are required to compare history.');
        return;
      }

      const res = await api.compareScans(list[1].id, list[0].id);
      if (res.success) {
        setComparisonData(res.data);
        setActiveTab('comparison');
      }
    } catch (err) {
      setErrorMsg('Failed to compare historical scan versions.');
    } finally {
      setComparisonLoading(false);
    }
  };

  const isBatch = Boolean(scanResult?.isBatch);

  // Flatten or filter issues list
  let rawIssuesList = [];
  if (isBatch && scanResult.pages) {
    if (selectedPageUrl) {
      const p = scanResult.pages.find(page => page.url === selectedPageUrl);
      rawIssuesList = p ? (p.issues || []) : [];
    } else {
      scanResult.pages.forEach(p => {
        if (p.issues) rawIssuesList.push(...p.issues);
      });
    }
  } else if (scanResult?.issues) {
    rawIssuesList = scanResult.issues;
  }

  const filteredIssues = rawIssuesList.filter(issue => {
    const matchesSeverity = selectedSeverity === 'ALL' || issue.severity.toLowerCase() === selectedSeverity.toLowerCase();
    const matchesCategory = selectedCategory === 'ALL' || issue.category === selectedCategory;
    const matchesSearch = !searchTerm.trim() ||
      (issue.context && issue.context.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (issue.element && issue.element.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (issue.explanation && issue.explanation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (issue.wcag && issue.wcag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSeverity && matchesCategory && matchesSearch;
  });

  const categories = scanResult?.categoryScores ? Object.keys(scanResult.categoryScores) : [];

  return (
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      
      {/* Top Sticky Header */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onLogout={handleLogoutClear}
      />

      {/* Main Container */}
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section & Scan Form */}
        <section>
          <ScanForm
            onStartScan={handleStartScan}
            onOpenDiscovery={handleOpenDiscovery}
            isLoading={isLoading || isDiscovering}
          />
        </section>

        {/* SHA-256 Unchanged HTML Notice Banner */}
        {unchangedNotice && (
          <div class="max-w-4xl mx-auto p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center space-x-3 text-xs animate-fadeIn">
            <Info class="w-5 h-5 shrink-0 text-blue-400" />
            <div>
              <span class="font-bold block text-blue-200">No HTML Code Changes Detected</span>
              <span>{unchangedNotice}</span>
            </div>
          </div>
        )}

        {/* Access Denied Alert Card */}
        {accessError && (
          <AccessDeniedCard
            errorObj={accessError}
            onReset={() => setAccessError(null)}
            onSwitchToHtml={() => setAccessError(null)}
          />
        )}

        {/* Global Error Banner */}
        {errorMsg && !accessError && (
          <div class="max-w-4xl mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center space-x-3 text-xs">
            <AlertOctagon class="w-5 h-5 shrink-0 text-red-400" />
            <div>
              <span class="font-bold block">Scan Encountered an Issue</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Loading Progress Animation */}
        {isLoading && (
          <section class="py-12">
            <ScanProgress />
          </section>
        )}

        {/* View Tabs Header (Audit Dashboard vs Historical Comparison) */}
        {!isLoading && scanResult && !accessError && (
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex space-x-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                class={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <ShieldCheck class="w-4 h-4" />
                <span>Audit Dashboard</span>
              </button>

              <button
                onClick={handleCompareLatest}
                disabled={comparisonLoading}
                class={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'comparison'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <TrendingUp class="w-4 h-4 text-emerald-400" />
                <span>Compare History & Trends</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Audit Dashboard */}
        {!isLoading && scanResult && !accessError && activeTab === 'dashboard' && (
          <div class="space-y-8 animate-fadeIn">
            
            {/* Score Overview Header (Single Page vs Batch) */}
            {isBatch ? (
              <BatchScoreCard scanData={scanResult} />
            ) : (
              <ScoreCard scanData={scanResult} />
            )}

            {/* Performance & SEO Impact Section */}
            <PerformanceSEOImpact performanceImpact={scanResult.performanceImpact} />

            {/* Trend Timeline Chart */}
            {trendData && (
              <TrendTimelineChart
                trendData={trendData}
                onSelectScan={(selected) => setScanResult(selected)}
              />
            )}

            {/* Category Breakdown Progress Grid */}
            <CategoryBreakdown
              categoryScores={scanResult.categoryScores}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Batch Specific Sections: Page Score Ranking & Common Site Issues */}
            {isBatch && (
              <>
                <PageScoreList
                  pages={scanResult.pages}
                  onSelectPage={setSelectedPageUrl}
                  selectedPageUrl={selectedPageUrl}
                />

                <CommonIssuesSummary issues={scanResult.issueFrequency} />
              </>
            )}

            {/* Issue List & Filter Controls */}
            <section>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-white flex items-center space-x-2">
                  <span>
                    {isBatch ? (selectedPageUrl ? `Issues on Page: ${selectedPageUrl}` : 'All Detailed Site Issues') : 'Detected Accessibility Issues'}
                  </span>
                  <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold">
                    {filteredIssues.length} Shown
                  </span>
                </h3>
              </div>

              <IssueFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedSeverity={selectedSeverity}
                onSeverityChange={setSelectedSeverity}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categories={categories}
                totalCount={filteredIssues.length}
              />

              {filteredIssues.length === 0 ? (
                <div class="glass-card rounded-2xl p-12 text-center border border-slate-800">
                  <CheckCircle2 class="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
                  <h4 class="text-base font-bold text-white mb-1">No Issues Matching Selected Filters</h4>
                  <p class="text-xs text-slate-400">Try adjusting your severity or category filter settings above.</p>
                </div>
              ) : (
                <div class="space-y-4">
                  {filteredIssues.map((issue, idx) => (
                    <IssueCard key={issue.id || idx} issue={issue} index={idx} />
                  ))}
                </div>
              )}
            </section>

            {/* Interactive Manual Review Checklist */}
            <ManualReview items={scanResult.manualReviewItems || []} />

          </div>
        )}

        {/* Tab 2: Historical Comparison Dashboard */}
        {!isLoading && activeTab === 'comparison' && (
          <ComparisonDashboard comparisonData={comparisonData} />
        )}

      </main>

      {/* Interactive Page Discovery Modal */}
      <PageDiscoveryModal
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
        baseUrl={discoveryData?.baseUrl}
        pages={discoveryData?.pages || []}
        onConfirmScan={handleConfirmManualScan}
      />

      {/* History Slide-Over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectScan={(scan) => {
          setScanResult(scan);
          if (scan.websiteId) fetchTrends(scan.websiteId);
        }}
      />

      {/* Footer */}
      <footer class="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>AI Accessibility Auditor • WCAG 2.1 AA Compliance, Batch Scanner & Versioning Engine</p>
      </footer>

    </div>
  );
};
