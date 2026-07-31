import React, { useState } from 'react';

export default function ClauseCard({ clause, index }) {
  const [expanded, setExpanded] = useState(false);

  const riskStyles = {
    HIGH: { border: 'border-l-4 border-red-500', badge: 'bg-red-100 text-red-700', icon: '🔴' },
    MEDIUM: { border: 'border-l-4 border-amber-500', badge: 'bg-amber-100 text-amber-700', icon: '🟡' },
    LOW: { border: 'border-l-4 border-green-500', badge: 'bg-green-100 text-green-700', icon: '🟢' },
  };

  const style = riskStyles[clause.risk_level] || riskStyles.MEDIUM;
  const applicableAct = clause.applicable_act || (clause.heading.includes("Eviction") ? "Section 106, Transfer of Property Act 1882" : (clause.heading.includes("Deposit") ? "Section 74, Indian Contract Act 1872" : (clause.heading.includes("Term") ? "Section 107, Transfer of Property Act 1882" : "Indian Contract Act 1872")));

  return (
    <div
      className={`bg-white rounded-xl shadow-sm ${style.border} overflow-hidden transition-all duration-300 hover:shadow-md animate-fade-in`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-sm">{style.icon}</span>
          <span className="text-xs text-gray-400 font-mono">#{clause.clause_number}</span>
          <span className="font-semibold text-navy text-sm truncate">{clause.heading}</span>
        </div>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          <span className="text-[10px] font-bold bg-purple-100/80 text-purple-800 px-2 py-0.5 rounded-md border border-purple-200 hidden sm:inline-block">
            📜 {applicableAct}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${style.badge}`}>
            {clause.risk_level}
          </span>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 animate-fade-in">
          <div className="bg-purple-50/80 border border-purple-200/80 rounded-xl p-3">
            <p className="text-xs font-bold text-purple-900 mb-1 flex items-center gap-1.5">
              <span>📜</span> Applicable Statutory Act & Section:
            </p>
            <p className="text-sm font-semibold text-purple-950">{applicableAct}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-400 mb-1">Original Text</p>
            <p className="text-sm text-gray-700 italic">"{clause.original_text}"</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">📖 Plain Explanation</p>
            <p className="text-sm text-gray-700">{clause.plain_explanation}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">💡 What This Means For You</p>
            <p className="text-sm text-gray-700">{clause.what_it_means_for_you}</p>
          </div>
          {clause.your_rights && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-500 mb-1">⚖️ Your Statutory Rights</p>
              <p className="text-sm text-blue-700">{clause.your_rights}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
