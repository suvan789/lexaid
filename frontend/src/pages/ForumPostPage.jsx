import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function ForumPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await API.get(`/api/forum/posts/${id}`);
      setPost(res.data);
    } catch {
      navigate('/forum');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setReplyLoading(true);
    try {
      await API.post(`/api/forum/posts/${id}/reply`, { content: replyContent });
      setReplyContent('');
      fetchPost(); // Reload to get new reply
    } catch (err) {
      alert('Failed to post reply.');
    } finally {
      setReplyLoading(false);
    }
  };

  const toggleUpvote = async (type, targetId) => {
    try {
      const endpoint = type === 'post' 
        ? `/api/forum/posts/${targetId}/upvote` 
        : `/api/forum/replies/${targetId}/upvote`;
      await API.post(endpoint);
      fetchPost(); // Refresh counts
    } catch (err) {
      if (err.response?.status === 401) alert('Please login to upvote.');
    }
  };

  const acceptReply = async (replyId) => {
    try {
      await API.post(`/api/forum/replies/${replyId}/accept`);
      fetchPost();
    } catch (err) {
      alert('Failed to accept answer.');
    }
  };

  const getAiAnswer = async () => {
    setAiLoading(true);
    try {
      const res = await API.get(`/api/forum/posts/${id}/ai-answer`);
      setAiAnswer(res.data.ai_answer);
    } catch {
      alert('Failed to generate AI answer.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!post) return null;

  return (
    <div className="page-container max-w-4xl mx-auto pb-12">
      <button onClick={() => navigate('/forum')} className="text-sm text-gray-500 hover:text-navy mb-6 flex items-center gap-1 font-medium transition-colors">
        ← Back to Forum
      </button>

      {/* Main Post */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-8 animate-fade-in relative overflow-hidden">
        {post.is_answered && (
          <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl shadow-sm">
            ✓ SOLVED
          </div>
        )}
        
        <div className="flex items-start gap-4 mb-6">
          <div className="flex flex-col items-center gap-1 shrink-0 bg-gray-50 p-2 rounded-xl border border-gray-100 min-w-[60px]">
            <button onClick={() => toggleUpvote('post', post.id)} className="text-gray-400 hover:text-accent transition-colors p-1">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span className="font-bold text-navy text-lg">{post.upvotes}</span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                {post.category}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-navy text-white flex items-center justify-center text-[10px]">
                  {post.user_name?.charAt(0) || 'U'}
                </span>
                {post.user_name || 'Anonymous'}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-navy leading-snug">{post.title}</h1>
          </div>
        </div>

        <div className="prose prose-sm lg:prose-base max-w-none text-gray-700 ml-[76px] leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        {/* AI Answer Request */}
        <div className="ml-[76px] mt-8 pt-6 border-t border-gray-100">
          {!aiAnswer && !aiLoading && (
            <button
              onClick={getAiAnswer}
              className="px-4 py-2 bg-gradient-to-r from-accent to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all flex items-center gap-2"
            >
              <span className="text-lg">✨</span> Get AI Legal Suggestion
            </button>
          )}
          
          {aiLoading && (
            <div className="flex items-center gap-3 text-accent text-sm font-medium bg-accent/5 p-4 rounded-xl border border-accent/20">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              LexAid AI is analyzing the question...
            </div>
          )}

          {aiAnswer && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 animate-slide-up relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent to-purple-500"></div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">✨</span>
                <span className="font-bold text-navy text-sm">LexAid AI Suggestion</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ml-2">Not Legal Advice</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
          {post.replies?.length || 0} {post.replies?.length === 1 ? 'Answer' : 'Answers'}
        </h3>
        
        {post.replies?.length > 0 ? (
          <div className="space-y-4">
            {post.replies.map((reply) => (
              <div 
                key={reply.id} 
                className={`bg-white rounded-xl shadow-sm border p-6 flex items-start gap-4 animate-fade-in ${
                  reply.is_accepted ? 'border-green-400 bg-green-50/30' : 'border-gray-100'
                }`}
              >
                <div className="flex flex-col items-center gap-1 shrink-0 min-w-[40px]">
                  <button onClick={() => toggleUpvote('reply', reply.id)} className="text-gray-400 hover:text-accent transition-colors p-1">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <span className="font-bold text-navy">{reply.upvotes}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                        {reply.user_name?.charAt(0) || 'U'}
                      </span>
                      <span className="text-navy">{reply.user_name || 'Anonymous'}</span>
                      <span className="text-gray-400">• {new Date(reply.created_at).toLocaleDateString()}</span>
                    </div>
                    {reply.is_accepted && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-green-200 flex items-center gap-1">
                        ✓ Accepted Answer
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                  
                  {/* Accept Button for Post Author */}
                  {user && user.id === post.user_id && !post.is_answered && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => acceptReply(reply.id)}
                        className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors border border-green-100"
                      >
                        ✓ Mark as Accepted Answer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 border-dashed p-8 text-center">
            <p className="text-gray-500 text-sm">No answers yet. Be the first to help out!</p>
          </div>
        )}
      </div>

      {/* Add Reply */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-navy mb-4">Your Answer</h3>
        <form onSubmit={handleReply}>
          <textarea
            required
            rows={4}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your answer here... Be respectful and clear."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none resize-none mb-4"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={replyLoading || !replyContent.trim()}
              className="px-6 py-2.5 bg-navy text-white rounded-xl font-medium hover:bg-navy-light disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {replyLoading ? 'Posting...' : 'Post Answer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
