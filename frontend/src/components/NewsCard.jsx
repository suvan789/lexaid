import React from 'react';

export default function NewsCard({ article, isSaved, onToggleSave }) {
  const getCategoryColor = (cat) => {
    const colors = {
      'Supreme Court': 'bg-purple-100 text-purple-700 border-purple-200',
      'High Court': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'Consumer': 'bg-amber-100 text-amber-700 border-amber-200',
      'Labour': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Property': 'bg-orange-100 text-orange-700 border-orange-200',
      'Criminal': 'bg-red-100 text-red-700 border-red-200',
      'General': 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return colors[cat] || colors['General'];
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (isNaN(seconds) || seconds < 60) return 'Just now';
    
    let interval = seconds / 86400;
    if (interval >= 1) return Math.floor(interval) + 'd ago';
    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + 'h ago';
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + 'm ago';
    return 'Just now';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col h-full animate-fade-in">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex gap-2 items-center">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(article.category)}`}>
              {article.category}
            </span>
            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
              {timeAgo(article.published_at)}
            </span>
          </div>
          {onToggleSave && (
            <button onClick={(e) => { e.preventDefault(); onToggleSave(); }} className={`p-1.5 rounded-full transition-colors ${isSaved ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-red-400'}`}>
              <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </button>
          )}
        </div>

        <h3 className="text-lg font-bold text-navy mb-3 line-clamp-3 group-hover:text-accent transition-colors leading-snug">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h3>

        <div className="bg-blue-50/50 rounded-xl p-4 mb-4 border border-blue-100/50 relative">
          <div className="absolute top-3 right-3 text-lg opacity-20">✨</div>
          <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            AI Summary
          </p>
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
            {article.summary}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            {article.source}
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-accent hover:text-accent-dark flex items-center gap-1 transition-colors"
          >
            Read Article ↗
          </a>
        </div>
      </div>
    </div>
  );
}
