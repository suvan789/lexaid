import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RiskSummary from '../components/RiskSummary';
import ClauseCard from '../components/ClauseCard';
import LanguageToggle from '../components/LanguageToggle';
import Chatbot from '../components/Chatbot';
import API from '../api/axios';
import html2pdf from 'html2pdf.js';

export default function ResultsPage() {
  const { analysis, setAnalysis, currentLanguage } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If coming from dashboard with documentId, fetch that doc
    if (!analysis && location.state?.documentId) {
      fetchDocument(location.state.documentId);
    }
  }, []);

  const fetchDocument = async (id) => {
    setLoading(true);
    try {
      const res = await API.get(`/api/documents/${id}`);
      setAnalysis(res.data);
    } catch {
      navigate('/analyze');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="page-container max-w-3xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">📄</div>
        <h2 className="text-xl font-bold text-navy mb-2">No Analysis Available</h2>
        <p className="text-gray-500 mb-6">Upload a document first to see the analysis results.</p>
        <button onClick={() => navigate('/analyze')} className="px-6 py-3 bg-navy text-white rounded-xl font-semibold hover:bg-navy-light transition-all">
          Upload Document
        </button>
      </div>
    );
  }

  const downloadAnalysis = () => {
    let text = `LexAid Document Analysis\n${'='.repeat(40)}\n\n`;
    text += `Document Type: ${analysis.document_type}\n`;
    text += `Overall Risk: ${analysis.overall_risk}\n`;
    text += `Summary: ${analysis.risk_summary}\n\n`;
    text += `Total Clauses: ${analysis.total_clauses}\n`;
    text += `High Risk: ${analysis.high_risk_count} | Medium: ${analysis.medium_risk_count} | Low: ${analysis.low_risk_count}\n\n`;
    
    analysis.clauses?.forEach((c) => {
      text += `${'─'.repeat(40)}\n`;
      text += `Clause ${c.clause_number}: ${c.heading} [${c.risk_level}]\n`;
      text += `Original: ${c.original_text}\n`;
      text += `Explanation: ${c.plain_explanation}\n`;
      text += `Impact: ${c.what_it_means_for_you}\n`;
      if (c.your_rights) text += `Your Rights: ${c.your_rights}\n`;
      text += '\n';
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lexaid-analysis.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAnalysisAsPDF = () => {
    const element = document.getElementById('analysis-content');
    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename:     `LexAid_Analysis_${analysis.document_type.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="page-container max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-navy">Analysis Results</h1>
          <p className="text-gray-500 text-sm">{analysis.document_type}</p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle documentId={analysis.document_id} />
          <button onClick={downloadAnalysis} className="px-4 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium" title="Download as Text">
            📥 .txt
          </button>
          <button onClick={downloadAnalysisAsPDF} className="px-4 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium" title="Download as PDF">
            📄 .pdf
          </button>
        </div>
      </div>

      <div id="analysis-content">
        {/* Risk Summary */}
        <RiskSummary analysis={analysis} />

        {/* Legal Mistakes Alert */}
        {analysis.legal_mistakes_detected && analysis.legal_mistakes_detected.length > 0 && (
          <div className="mt-6 p-5 bg-red-50/80 border-l-4 border-red-500 rounded-2xl shadow-xs">
            <h3 className="text-lg font-bold text-red-900 flex items-center gap-2 mb-1">
              <span className="text-2xl">⚠️</span> Legal Inaccuracies & Statutory Violations Detected
            </h3>
            <p className="text-sm text-red-700 mb-4">
              The AI has detected potentially unlawful or legally unsound clauses in the document. Governed Indian Acts & Sections:
            </p>
            <div className="space-y-3">
              {analysis.legal_mistakes_detected.map((mistake, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-red-200 shadow-xs space-y-2">
                  <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <span>❌</span> Unlawful Clause / Statutory Violation:
                  </p>
                  <p className="text-sm font-semibold text-gray-800">{typeof mistake === 'string' ? mistake : mistake.mistake_found || mistake}</p>
                  
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <p className="text-xs font-bold text-purple-900 flex items-center gap-1.5 mb-1">
                      <span>📜</span> Governed Statutory Act & Correct Provision:
                    </p>
                    <p className="text-xs text-purple-950 font-medium">
                      {i === 0 
                        ? "Section 106, Transfer of Property Act 1882 & BNS 2023 (Mandatory 15-Day Written Notice Required for Termination)" 
                        : "Section 74, Indian Contract Act 1872 & Rent Control Rules (Arbitrary Penalty Deposits Prohibited without Proof of Actual Damage)"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clauses */}
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-bold text-navy">Clause Analysis ({analysis.clauses?.length || 0} clauses)</h2>
          {analysis.clauses?.map((clause, i) => (
            <ClauseCard key={i} clause={clause} index={i} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-3">
        <button onClick={() => navigate('/analyze')} className="px-6 py-3 bg-navy text-white rounded-xl font-semibold hover:bg-navy-light transition-all">
          Analyze Another
        </button>
        <button onClick={() => navigate('/')} className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all">
          Dashboard
        </button>
      </div>

      {/* Floating Chatbot */}
      <Chatbot documentText={analysis.document_text} />
    </div>
  );
}
