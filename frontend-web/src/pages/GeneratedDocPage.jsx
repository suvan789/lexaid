import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import html2pdf from 'html2pdf.js';

export default function GeneratedDocPage() {
  const { generatedDoc } = useApp();
  const navigate = useNavigate();

  if (!generatedDoc) {
    return (
      <div className="page-container max-w-3xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-xl font-bold text-navy mb-2">No Document Generated</h2>
        <p className="text-gray-500 mb-6">Generate a document first to see it here.</p>
        <button onClick={() => navigate('/generate')} className="px-6 py-3 bg-navy text-white rounded-xl font-semibold hover:bg-navy-light transition-all">
          Generate Document
        </button>
      </div>
    );
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDoc.content);
    alert('Document copied to clipboard!');
  };

  const downloadAsTxt = () => {
    const blob = new Blob([generatedDoc.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedDoc.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = () => {
    const element = document.getElementById('document-content');
    const opt = {
      margin:       1,
      filename:     `${generatedDoc.title.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="page-container max-w-4xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-navy mb-1">{generatedDoc.title}</h1>
        <p className="text-gray-500 text-sm">
          Generated on {new Date(generatedDoc.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6 animate-fade-in">
        <button onClick={copyToClipboard} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          📋 Copy to Clipboard
        </button>
        <button onClick={downloadAsTxt} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          📥 Download as .txt
        </button>
        <button onClick={downloadAsPDF} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          📄 Download as PDF
        </button>
        <button onClick={() => navigate('/generate')} className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors text-sm font-medium">
          📝 Generate Another
        </button>
      </div>

      {/* Document Content */}
      <div id="document-content" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 animate-fade-in">
        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
          {generatedDoc.content}
        </pre>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 animate-fade-in">
        <p className="font-medium mb-1">⚠️ Disclaimer</p>
        <p>This document is AI-generated and should be reviewed by a qualified lawyer before use. LexAid provides this as a starting template only.</p>
      </div>
    </div>
  );
}
