import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import API from '../api/axios';

export default function LanguageToggle({ documentId }) {
  const { currentLanguage, setCurrentLanguage, analysis, setAnalysis } = useApp();
  const [loading, setLoading] = useState(false);

  const handleTranslate = async (lang) => {
    if (lang === 'english') {
      // Refetch original analysis
      if (documentId) {
        setLoading(true);
        try {
          const res = await API.get(`/api/documents/${documentId}`);
          setAnalysis(res.data);
          setCurrentLanguage('english');
        } catch {} finally { setLoading(false); }
      }
      return;
    }

    if (!documentId) return;
    setLoading(true);
    try {
      const res = await API.post(`/api/documents/${documentId}/translate`, { target_language: lang });
      setAnalysis(res.data);
      setCurrentLanguage(lang);
    } catch {} finally { setLoading(false); }
  };

  const langs = [
    { code: 'english', label: 'EN', full: 'English' },
    { code: 'hindi', label: 'हिं', full: 'Hindi' },
    { code: 'tamil', label: 'த', full: 'Tamil' },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {langs.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleTranslate(lang.code)}
          disabled={loading}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            currentLanguage === lang.code
              ? 'bg-navy text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-200'
          } ${loading ? 'opacity-50' : ''}`}
          title={lang.full}
        >
          {loading && currentLanguage !== lang.code ? '...' : lang.label}
        </button>
      ))}
    </div>
  );
}
