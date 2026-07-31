import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForumPost({ post, isSaved, onToggleSave }) {
  const navigate = useNavigate();

  const getCategoryColor = (cat) => {
    const colors = {
      rent: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      employment: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      consumer: 'bg-amber-50 text-amber-700 border-amber-100',
      property: 'bg-orange-50 text-orange-700 border-orange-100',
      family: 'bg-pink-50 text-pink-700 border-pink-100',
      criminal: 'bg-red-50 text-red-700 border-red-100',
      general: 'bg-blue-50 text-blue-700 border-blue-100',
      other: 'bg-gray-50 text-gray-700 border-gray-100',
    };
    return colors[cat] || colors.general;
  };

  return (
    <div 
      onClick={() => navigate(`/forum/${post.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-accent/30 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="font-bold text-lg text-navy group-hover:text-accent transition-colors line-clamp-2">
          {post.title}
        </h3>
        {post.is_answered && (
          <span className="shrink-0 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-green-200">
            ✓ Solved
          </span>
        )}
      </div>

      <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
        {post.content}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-4 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border uppercase tracking-wider ${getCategoryColor(post.category)}`}>
            {post.category}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">
              {post.user_name?.charAt(0) || 'U'}
            </div>
            {post.user_name || 'Anonymous'}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
          {onToggleSave && (
            <button onClick={(e) => { e.stopPropagation(); onToggleSave(); }} className={`p-1.5 rounded-full transition-colors ${isSaved ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-400 bg-gray-50'}`}>
              <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </button>
          )}
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            {post.upvotes}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {post.reply_count}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {post.views}
          </span>
        </div>
      </div>
    </div>
  );
}
