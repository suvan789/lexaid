import React, { useState } from "react";

function ClauseCard({ clause, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const riskStyles = {
    HIGH: {
      border: "border-l-risk-high",
      badge: "bg-red-100 text-risk-high",
      label: "HIGH RISK",
    },
    MEDIUM: {
      border: "border-l-risk-medium",
      badge: "bg-amber-100 text-risk-medium",
      label: "MEDIUM RISK",
    },
    LOW: {
      border: "border-l-risk-low",
      badge: "bg-green-100 text-risk-low",
      label: "LOW RISK",
    },
  };

  const style = riskStyles[clause.risk_level] || riskStyles.MEDIUM;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-l-4 ${style.border} p-5 mb-4 
                  animate-fade-in-up hover:shadow-md transition-shadow duration-200`}
      style={{ animationDelay: `${index * 80}ms` }}
      id={`clause-card-${clause.clause_number}`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-navy font-semibold text-base pr-3">
          <span className="text-gray-400 mr-1">#{clause.clause_number}</span>
          {clause.heading}
        </h3>
        <span
          className={`${style.badge} px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap`}
        >
          {style.label}
        </span>
      </div>

      {/* Plain English */}
      <div className="bg-gray-50 rounded-lg p-4 mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
          Plain English
        </p>
        <p className="text-gray-700 text-sm leading-relaxed">
          {clause.plain_explanation}
        </p>
      </div>

      {/* What This Means For You */}
      <div className="mb-3">
        <div className="flex items-start gap-2">
          <span className="text-lg mt-0.5">👤</span>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              What This Means For You
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              {clause.what_it_means_for_you}
            </p>
          </div>
        </div>
      </div>

      {/* Your Rights — only if not empty */}
      {clause.your_rights && clause.your_rights.trim() !== "" && (
        <div className="bg-blue-50 rounded-lg p-4 mb-3">
          <div className="flex items-start gap-2">
            <span className="text-lg mt-0.5">⚖️</span>
            <div>
              <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
                Your Rights
              </p>
              <p className="text-navy text-sm leading-relaxed font-medium">
                {clause.your_rights}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Original Text Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-accent text-sm font-medium hover:text-accent/80 transition-colors mt-1"
        id={`toggle-original-${clause.clause_number}`}
      >
        <span
          className={`transform transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
        >
          ▶
        </span>
        {isExpanded ? "Hide Original Text" : "View Original Text"}
      </button>

      {/* Collapsible Original Text */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-gray-600 text-xs font-mono leading-relaxed whitespace-pre-wrap">
            {clause.original_text}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ClauseCard;
