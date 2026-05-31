import React from "react";

function HistoryList({ document, onView }) {
  const riskConfig = {
    HIGH: { border: "border-l-risk-high", badge: "bg-red-100 text-risk-high" },
    MEDIUM: { border: "border-l-risk-medium", badge: "bg-amber-100 text-risk-medium" },
    LOW: { border: "border-l-risk-low", badge: "bg-green-100 text-risk-low" },
  };

  const config = riskConfig[document.overall_risk] || riskConfig.MEDIUM;
  
  // Format Date: DD MMM YYYY
  const formattedDate = new Date(document.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${config.border} p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow`}>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-navy truncate mb-1">
          {document.filename}
        </h3>
        <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted font-medium mb-3">
          <span className="flex items-center gap-1">
            📋 {document.document_type || "Unknown Type"}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            📅 {formattedDate}
          </span>
        </div>
        <p className="text-sm text-text-primary line-clamp-2">
          {document.risk_summary}
        </p>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
        <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold tracking-wider ${config.badge}`}>
          {document.overall_risk || "UNKNOWN"} RISK
        </span>
        <button
          onClick={() => onView(document.id)}
          className="text-sm font-semibold text-accent hover:text-navy transition-colors whitespace-nowrap"
        >
          View Analysis →
        </button>
      </div>
    </div>
  );
}

export default HistoryList;
