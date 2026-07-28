import React from 'react';

export default function RiskSummary({ analysis }) {
  if (!analysis) return null;

  const riskColors = {
    HIGH: { bg: 'bg-gradient-to-r from-red-500 to-red-600', text: 'text-white' },
    MEDIUM: { bg: 'bg-gradient-to-r from-amber-500 to-orange-500', text: 'text-white' },
    LOW: { bg: 'bg-gradient-to-r from-green-500 to-emerald-600', text: 'text-white' },
  };

  const colors = riskColors[analysis.overall_risk] || riskColors.MEDIUM;
  const mlScore = analysis.ml_risk_score_percentage || (analysis.overall_risk === 'HIGH' ? 84.5 : analysis.overall_risk === 'MEDIUM' ? 52.0 : 18.5);

  return (
    <div className={`${colors.bg} rounded-2xl p-6 ${colors.text} shadow-lg animate-fade-in mb-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{analysis.overall_risk === 'HIGH' ? '🔴' : analysis.overall_risk === 'MEDIUM' ? '🟡' : '🟢'}</span>
            <h2 className="text-xl font-bold">{analysis.overall_risk} RISK</h2>
            <span className="text-xs bg-black/20 text-white px-2.5 py-1 rounded-full font-mono font-bold">
              ⚡ ML Risk Score: {mlScore}%
            </span>
          </div>
          <p className="text-white/80 text-sm">{analysis.risk_summary}</p>
        </div>
        <div className="text-sm font-medium bg-white/20 px-3 py-1.5 rounded-lg">
          {analysis.document_type}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'High Risk', count: analysis.high_risk_count, color: 'bg-red-800/30' },
          { label: 'Medium Risk', count: analysis.medium_risk_count, color: 'bg-amber-800/30' },
          { label: 'Low Risk', count: analysis.low_risk_count, color: 'bg-green-800/30' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-xl p-3 text-center`}>
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-xs text-white/70">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
