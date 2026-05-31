import React from "react";

function RiskSummary({ analysis }) {
  const riskColors = {
    HIGH: {
      bg: "bg-red-50",
      border: "border-risk-high",
      text: "text-risk-high",
      banner: "bg-risk-high",
      icon: "🔴",
    },
    MEDIUM: {
      bg: "bg-amber-50",
      border: "border-risk-medium",
      text: "text-risk-medium",
      banner: "bg-risk-medium",
      icon: "🟡",
    },
    LOW: {
      bg: "bg-green-50",
      border: "border-risk-low",
      text: "text-risk-low",
      banner: "bg-risk-low",
      icon: "🟢",
    },
  };

  const riskStyle = riskColors[analysis.overall_risk] || riskColors.MEDIUM;

  return (
    <div className="animate-fade-in-up" id="risk-summary">
      {/* Document Type Badge */}
      <div className="mb-4">
        <span className="inline-block bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-semibold">
          📋 {analysis.document_type}
        </span>
      </div>

      {/* Overall Risk Banner */}
      <div
        className={`${riskStyle.banner} rounded-2xl p-6 mb-6 text-white shadow-lg`}
        id="risk-banner"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{riskStyle.icon}</span>
          <h2 className="text-2xl font-bold">
            Overall Risk: {analysis.overall_risk}
          </h2>
        </div>
        <p className="text-white/90 text-base">{analysis.risk_summary}</p>
      </div>

      {/* Risk Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* High Risk */}
        <div
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
          id="stat-high"
        >
          <span className="text-2xl">🔴</span>
          <p className="text-2xl font-bold text-risk-high mt-1">
            {analysis.high_risk_count}
          </p>
          <p className="text-gray-500 text-xs font-medium mt-1">
            High Risk Clauses
          </p>
        </div>

        {/* Medium Risk */}
        <div
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
          id="stat-medium"
        >
          <span className="text-2xl">🟡</span>
          <p className="text-2xl font-bold text-risk-medium mt-1">
            {analysis.medium_risk_count}
          </p>
          <p className="text-gray-500 text-xs font-medium mt-1">
            Medium Risk Clauses
          </p>
        </div>

        {/* Low Risk */}
        <div
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
          id="stat-low"
        >
          <span className="text-2xl">🟢</span>
          <p className="text-2xl font-bold text-risk-low mt-1">
            {analysis.low_risk_count}
          </p>
          <p className="text-gray-500 text-xs font-medium mt-1">
            Low Risk Clauses
          </p>
        </div>
      </div>

      {/* Total Clauses */}
      <p className="text-gray-500 text-sm text-center mb-6">
        📊 <span className="font-semibold">{analysis.total_clauses}</span>{" "}
        clauses analyzed in your document
      </p>
    </div>
  );
}

export default RiskSummary;
