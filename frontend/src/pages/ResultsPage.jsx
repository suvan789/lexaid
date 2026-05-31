import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RiskSummary from "../components/RiskSummary";
import ClauseCard from "../components/ClauseCard";
import Chatbot from "../components/Chatbot";
import { useDocument } from "../context/DocumentContext";

function ResultsPage() {
  const { analysis } = useDocument();
  const navigate = useNavigate();

  useEffect(() => {
    if (!analysis) {
      navigate("/");
    }
  }, [analysis, navigate]);

  if (!analysis) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-light font-inter">
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div style={{ height: "64px" }}></div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-navy">Document Analysis</h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's what we found in your document
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="lg:pr-4">
          {/* Risk Summary */}
          <RiskSummary analysis={analysis} />

          {/* Clause Cards Section Title */}
          <div className="mb-4 mt-2">
            <h2 className="text-xl font-bold text-navy">
              Clause-by-Clause Breakdown
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Each clause is analyzed for risk and explained in plain English
            </p>
          </div>

          {/* Clause Cards List */}
          <div className="space-y-0" id="clause-list">
            {analysis.clauses &&
              analysis.clauses.map((clause, index) => (
                <ClauseCard
                  key={clause.clause_number || index}
                  clause={clause}
                  index={index}
                />
              ))}
          </div>

          {/* Disclaimer Footer */}
          <div className="mt-10 mb-20 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs text-center">
            ⚠️ LexAid provides AI-generated analysis for educational purposes.
            This is not a substitute for professional legal advice. Always
            consult a qualified lawyer for important legal matters.
          </div>
        </div>
      </div>

      {/* Chatbot - fixed bottom right */}
      <Chatbot />
    </div>
  );
}

export default ResultsPage;
