import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import API from '../api/axios';

const LOADING_MESSAGES = [
  '📄 Reading your document...',
  '🔍 Identifying clauses...',
  '⚖️ Analyzing legal risks...',
  '🧠 Applying Indian law knowledge...',
  '📊 Generating your report...',
];

export default function AnalyzePage() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');
  const { setAnalysis } = useApp();
  const navigate = useNavigate();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const f = e.dataTransfer.files[0];
      if (f.type === 'application/pdf') { setFile(f); setError(''); }
      else setError('Only PDF files are accepted.');
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) { setError('Please select a PDF file.'); return; }
    setLoading(true);
    setError('');

    let msgIndex = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIndex]);
    }, 3000);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await API.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnalysis(res.data);
      navigate('/results');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-3xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-navy mb-2">Analyze Document</h1>
        <p className="text-gray-500">Upload a legal document (PDF) for AI-powered clause analysis</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-navy mb-2">{loadingMsg}</p>
          <p className="text-sm text-gray-400">This may take 15-30 seconds...</p>
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* Upload Zone */}
          <div
            id="upload-zone"
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
              dragActive ? 'border-accent bg-accent/5 scale-[1.02]' : file ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-white hover:border-accent hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input id="file-input" type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
            
            {file ? (
              <>
                <div className="text-5xl mb-4">✅</div>
                <p className="text-lg font-semibold text-green-700 mb-1">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">📄</div>
                <p className="text-lg font-semibold text-navy mb-2">Drop your PDF here</p>
                <p className="text-sm text-gray-400 mb-4">or click to browse files</p>
                <div className="inline-block px-4 py-2 bg-navy/5 text-navy rounded-lg text-sm font-medium">
                  Supports: Rent Agreements, Employment Contracts, Loan Agreements, NDAs, and more
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          {file && (
            <div className="mt-6 flex gap-3">
              <button
                id="analyze-btn"
                onClick={handleUpload}
                className="flex-1 py-3 bg-navy text-white rounded-xl font-semibold hover:bg-navy-light transition-all"
              >
                🔍 Analyze Document
              </button>
              <button
                onClick={() => { setFile(null); setError(''); }}
                className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
