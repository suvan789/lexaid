import React, { useState, useEffect } from 'react';
import NewsCard from '../components/NewsCard';
import API from '../api/axios';

const CATEGORIES = [
  'All', 'Supreme Court', 'High Court', 'Consumer', 
  'Labour', 'Property', 'Criminal', 'General'
];

export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [isScraping, setIsScraping] = useState(false);
  const [savedNewsIds, setSavedNewsIds] = useState([]);

  useEffect(() => {
    fetchNews();
    fetchSavedIds();
  }, [category]);

  const fetchSavedIds = async () => {
    try {
      const res = await API.get('/api/user/saved/news/ids');
      setSavedNewsIds(res.data);
    } catch { }
  };

  const toggleSaveNews = async (id) => {
    try {
      await API.post(`/api/user/saved/news/${id}`);
      if (savedNewsIds.includes(id)) {
        setSavedNewsIds(prev => prev.filter(newsId => newsId !== id));
      } else {
        setSavedNewsIds(prev => [...prev, id]);
      }
    } catch (err) {
      alert('Please login to save news.');
    }
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
      const url = category === 'All' ? '/api/news' : `/api/news?category=${category}`;
      const res = await API.get(url);
      setArticles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const forceScrape = async () => {
    setIsScraping(true);
    try {
      await API.get('/api/news/refresh');
      await fetchNews();
    } catch (err) {
      alert('Failed to update news.');
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="page-container max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-navy mb-1">Legal News Feed</h1>
          <p className="text-gray-500 text-sm">Stay updated with AI-summarized legal news from Indian courts</p>
        </div>
        <button
          onClick={forceScrape}
          disabled={isScraping}
          className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isScraping ? (
            <><div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div> Updating...</>
          ) : (
            <>🔄 Refresh News</>
          )}
        </button>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar animate-fade-in delay-100">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              category === cat 
                ? 'bg-navy text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-4">📰</p>
          <h3 className="text-lg font-bold text-navy mb-1">No news found</h3>
          <p className="text-sm text-gray-500">Check back later for updates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <div key={article.id} style={{ animationDelay: `${i * 0.1}s` }}>
              <NewsCard 
                article={article} 
                isSaved={savedNewsIds.includes(article.id)}
                onToggleSave={() => toggleSaveNews(article.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
