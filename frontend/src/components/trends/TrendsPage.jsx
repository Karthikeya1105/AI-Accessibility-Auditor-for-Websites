import React from 'react';
import { TrendingUp, Award } from 'lucide-react';
import { BaselineCurrentCards } from './BaselineCurrentCards';
import { ScoreTrendChart } from './ScoreTrendChart';
import { IssueReductionCard } from './IssueReductionCard';
import { SeverityTrendTable } from './SeverityTrendTable';
import { CategoryImprovementTable } from './CategoryImprovementTable';
import { ImprovementChecklist } from './ImprovementChecklist';
import { PersistentIssues } from './PersistentIssues';
import { ScanTimeline } from './ScanTimeline';

export const TrendsPage = ({ trendData, onSelectScan }) => {
  if (!trendData || !trendData.timeline || trendData.timeline.length === 0) {
    return (
      <div class="glass-card rounded-2xl p-12 text-center border border-slate-800">
        <TrendingUp class="w-12 h-12 text-blue-400 mx-auto mb-3 opacity-60" />
        <h3 class="text-base font-bold text-white mb-1">No Verification Trends Yet</h3>
        <p class="text-xs text-slate-400">Run multiple audits on the same domain to generate continuous improvement analytics.</p>
      </div>
    );
  }

  const {
    website,
    baseline,
    current,
    overallImprovement,
    shortTermImprovement,
    severityBreakdown,
    categoryImprovements,
    issueLifecycle,
    whatImprovedList,
    stillPresentList,
    timeline,
    scans
  } = trendData;

  const isImproved = overallImprovement?.scorePoints > 0;
  const isRegressed = overallImprovement?.scorePoints < 0;

  return (
    <div class="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-8 animate-fadeIn">
      
      {/* 1. Header Title Banner */}
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div class="flex items-center space-x-2">
            <TrendingUp class="w-6 h-6 text-blue-400" />
            <h3 class="text-xl font-bold text-white">Continuous Accessibility Progress Analytics</h3>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Tracking long-term score progression & issue remediation for <span class="text-blue-400 font-mono font-bold">{website?.domain}</span> against Baseline V1.
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <div class="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
            <Award class="w-5 h-5 text-emerald-400" />
            <div>
              <div class="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Overall Baseline Progress</div>
              <div class="text-sm font-bold text-white flex items-center space-x-1">
                <span class={isImproved ? 'text-emerald-400' : isRegressed ? 'text-red-400' : 'text-slate-300'}>
                  {overallImprovement?.scorePoints > 0 ? `+${overallImprovement.scorePoints}` : overallImprovement?.scorePoints} Points
                </span>
                <span class="text-xs text-slate-500 font-normal">({overallImprovement?.relativeScoreChange}% relative)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hero Baseline vs Current Cards */}
      <BaselineCurrentCards
        baseline={baseline}
        current={current}
        overallImprovement={overallImprovement}
        shortTermImprovement={shortTermImprovement}
      />

      {/* 3. Score Over Time Curve Chart */}
      <ScoreTrendChart
        timeline={timeline}
        baselineScore={baseline?.score}
        scans={scans}
        onSelectScan={onSelectScan}
      />

      {/* 4. Issue Reduction Summary Card */}
      <IssueReductionCard
        baselineTotal={baseline?.totalIssues}
        currentTotal={current?.totalIssues}
        issuesReduced={overallImprovement?.issuesReduced}
        issueReductionPercentage={overallImprovement?.issueReductionPercentage}
      />

      {/* 5. Severity Reduction Breakdown Table */}
      <SeverityTrendTable severityBreakdown={severityBreakdown} />

      {/* 6. Category-Level Improvement Table */}
      <CategoryImprovementTable categoryImprovements={categoryImprovements} />

      {/* 7. What Improved Since Baseline Checklist */}
      <ImprovementChecklist whatImprovedList={whatImprovedList} />

      {/* 8. Remaining & Regressed Issues */}
      <PersistentIssues
        stillPresentList={stillPresentList}
        issueLifecycle={issueLifecycle}
      />

      {/* 9. Scan Timeline List */}
      <ScanTimeline
        timeline={timeline}
        scans={scans}
        onSelectScan={onSelectScan}
      />

    </div>
  );
};
