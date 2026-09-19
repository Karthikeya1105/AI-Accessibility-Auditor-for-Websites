import React from 'react';
import { TrendingUp } from 'lucide-react';

export const ScoreTrendChart = ({ timeline = [], baselineScore, onSelectScan, scans = [] }) => {
  if (!timeline || timeline.length === 0) return null;

  const chartHeight = 160;
  const chartWidth = 600;
  const paddingX = 45;
  const paddingY = 20;

  const getX = (idx) => {
    if (timeline.length === 1) return chartWidth / 2;
    return paddingX + (idx / (timeline.length - 1)) * (chartWidth - paddingX * 2);
  };

  const getY = (score) => {
    const minScore = 0;
    const maxScore = 100;
    return chartHeight - paddingY - ((score - minScore) / (maxScore - minScore)) * (chartHeight - paddingY * 2);
  };

  const pointsString = timeline.map((pt, idx) => `${getX(idx)},${getY(pt.score)}`).join(' ');

  return (
    <div class="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <TrendingUp class="w-4 h-4 text-blue-400" />
          <span>Accessibility Score Progress Over Time</span>
        </h4>
        <span class="text-xs text-slate-400 font-mono">
          {timeline.length} Verifications
        </span>
      </div>

      <div class="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} class="w-full h-44 overflow-visible">
          {/* Grid lines */}
          {[25, 50, 75, 100].map(val => (
            <g key={val}>
              <line
                x1={paddingX}
                y1={getY(val)}
                x2={chartWidth - paddingX}
                y2={getY(val)}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text x={paddingX - 10} y={getY(val) + 3} textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">
                {val}%
              </text>
            </g>
          ))}

          {/* Dotted Baseline Line */}
          {baselineScore !== undefined && (
            <line
              x1={paddingX}
              y1={getY(baselineScore)}
              x2={chartWidth - paddingX}
              y2={getY(baselineScore)}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              opacity="0.6"
            />
          )}

          {/* Score Curve */}
          {timeline.length > 1 && (
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsString}
            />
          )}

          {/* Verification Nodes */}
          {timeline.map((pt, idx) => {
            const cx = getX(idx);
            const cy = getY(pt.score);
            const matchedScan = scans.find(s => s.id === pt.scanId);

            return (
              <g key={pt.scanId || idx} class="cursor-pointer group" onClick={() => matchedScan && onSelectScan(matchedScan)}>
                <text
                  x={cx}
                  y={cy - 12}
                  textAnchor="middle"
                  fill={pt.score >= 80 ? '#10b981' : pt.score >= 50 ? '#f59e0b' : '#ef4444'}
                  fontSize="11"
                  fontWeight="bold"
                >
                  {pt.score}%
                </text>

                <circle
                  cx={cx}
                  cy={cy}
                  r="8"
                  fill={pt.isBaseline ? '#f59e0b' : pt.isCurrent ? '#10b981' : '#3b82f6'}
                  fillOpacity="0.2"
                  class="group-hover:r-10 transition-all"
                />

                <circle
                  cx={cx}
                  cy={cy}
                  r="5"
                  fill={pt.isBaseline ? '#f59e0b' : pt.isCurrent ? '#10b981' : '#3b82f6'}
                  stroke="#0f172a"
                  strokeWidth="2"
                />

                <text x={cx} y={chartHeight - 4} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  {pt.verificationId} ({pt.dateFormatted})
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
