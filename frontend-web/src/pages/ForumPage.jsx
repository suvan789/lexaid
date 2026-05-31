import React, { useState, useEffect } from 'react';
import ForumPost from '../components/ForumPost';
import API from '../api/axios';

const CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'rent', label: 'Rent & Tenancy' },
  { id: 'employment', label: 'Employment & Labour' },
  { id: 'consumer', label: 'Consumer Rights' },
  { id: 'family', label: 'Family & Divorce' },
  { id: 'criminal', label: 'Criminal Law' },
  { id: 'property', label: 'Property Disputes' },
  { id: 'other', label: 'Other' },
];

export default function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: 'all', search: '', sortBy: 'latest' });
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const [postLoading, setPostLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedPostIds, setSavedPostIds] = useState([]);

  useEffect(() => {
    fetchSavedIds();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPosts();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [filters.category, filters.sortBy, filters.search]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      params.append('sort_by', filters.sortBy);
      params.append('limit', '20');

      const res = await API.get(`/api/forum/posts?${params.toString()}`);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedIds = async () => {
    try {
      const res = await API.get('/api/user/saved/forum/ids');
      setSavedPostIds(res.data);
    } catch { }
  };

  const toggleSavePost = async (id) => {
    try {
      await API.post(`/api/user/saved/forum/${id}`);
      if (savedPostIds.includes(id)) {
        setSavedPostIds(prev => prev.filter(postId => postId !== id));
      } else {
        setSavedPostIds(prev => [...prev, id]);
      }
    } catch (err) {
      alert('Please login to save posts.');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;
    setPostLoading(true);
    setError('');
    try {
      await API.post('/api/forum/posts', newPost);
      setShowModal(false);
      setNewPost({ title: '', content: '', category: 'general' });
      fetchPosts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post.');
    } finally {
      setPostLoading(false);
    }
  };

  return (
    <div className="page-container max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-navy mb-1">Community Forum</h1>
          <p className="text-gray-500 text-sm">Ask questions and get answers from the LexAid community</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-accent text-white rounded-xl font-medium hover:bg-accent-dark transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span> Ask a Question
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-4 animate-fade-in delay-100">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search discussions..."
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value }))}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none font-medium text-gray-700"
          >
            <option value="latest">Latest</option>
            <option value="popular">Most Popular</option>
            <option value="unanswered">Unanswered</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Categories Sidebar */}
        <div className="lg:w-64 shrink-0 animate-fade-in delay-200">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <h3 className="px-5 py-4 border-b border-gray-50 font-bold text-navy text-sm uppercase tracking-wider bg-gray-50">
              Categories
            </h3>
            <div className="p-2 space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilters(f => ({ ...f, category: cat.id }))}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    filters.category === cat.id
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm animate-fade-in">
              <p className="text-4xl mb-4">📭</p>
              <h3 className="text-lg font-bold text-navy mb-1">No discussions found</h3>
              <p className="text-sm text-gray-500 mb-6">Be the first to ask a question in this category.</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-5 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
              >
                Ask a Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, i) => (
                <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <ForumPost 
                    post={post} 
                    isSaved={savedPostIds.includes(post.id)}
                    onToggleSave={() => toggleSavePost(post.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ask Question Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <span className="text-2xl">📝</span> Ask a Question
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-navy p-1">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreatePost} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Question Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Can my landlord increase rent mid-lease?"
                  value={newPost.title}
                  onChange={e => setNewPost({...newPost, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                <select
                  value={newPost.category}
                  onChange={e => setNewPost({...newPost, category: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none bg-white"
                >
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Details <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={6}
                  placeholder="Provide context and details about your legal situation..."
                  value={newPost.content}
                  onChange={e => setNewPost({...newPost, content: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-2">Do not share sensitive personal information (Aadhaar, bank details, exact addresses).</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postLoading || !newPost.title || !newPost.content}
                  className="px-6 py-2.5 bg-accent text-white rounded-xl font-medium hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {postLoading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Posting...</>
                  ) : 'Post Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
