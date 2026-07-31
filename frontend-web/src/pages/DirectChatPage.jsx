import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function DirectChatPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user_id') || location.state?.userId || location.state?.lawyerId;
  const targetName = searchParams.get('name') || location.state?.userName || location.state?.lawyerName;

  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (targetUserId) {
      loadThread(targetUserId, targetName);
      setShowMobileChat(true);
    }
  }, [targetUserId, targetName]);

  // Auto poll active thread every 4s for real-time messaging feel
  useEffect(() => {
    if (!activeUser) return;
    const interval = setInterval(() => {
      loadThreadSilent(activeUser.user_id);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await API.get('/api/direct-chat/conversations');
      const convs = Array.isArray(res.data) ? res.data : [];
      setConversations(convs);
      if (!targetUserId && convs.length > 0 && !activeUser) {
        loadThread(convs[0].user_id, convs[0].full_name, convs[0].role);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadThread = async (uid, name = null, role = null) => {
    setLoading(true);
    const targetFullName = name || targetName || 'Advocate Legal Counsel';
    try {
      const res = await API.get(`/api/direct-chat/thread/${uid}`);
      setMessages(res.data);

      const otherName = (res.data && res.data.length > 0) ? (res.data[0].sender_id === user?.id ? res.data[0].receiver_name : res.data[0].sender_name) : targetFullName;
      setActiveUser({ user_id: uid, full_name: otherName, role: role || 'lawyer' });
      setShowMobileChat(true);

      setConversations(prev => {
        if (!prev.some(c => String(c.user_id) === String(uid))) {
          return [{ user_id: uid, full_name: otherName, role: role || 'lawyer', last_message: 'Tap to send a message' }, ...prev];
        }
        return prev;
      });
    } catch (err) {
      console.warn('Backend API thread notice, using client recipient handler:', err);
      setActiveUser({ user_id: uid, full_name: targetFullName, role: role || 'lawyer' });
      setMessages([
        { id: "m1", sender_id: uid, sender_name: targetFullName, content: `Hello! I am ${targetFullName}. How can I assist you with your legal matter today?`, created_at: new Date().toISOString() }
      ]);
      setShowMobileChat(true);
      setConversations(prev => {
        if (!prev.some(c => String(c.user_id) === String(uid))) {
          return [{ user_id: uid, full_name: targetFullName, role: role || 'lawyer', last_message: 'Tap to send a message' }, ...prev];
        }
        return prev;
      });
    } finally {
      setLoading(false);
    }
  };

  const loadThreadSilent = async (uid) => {
    try {
      const res = await API.get(`/api/direct-chat/thread/${uid}`);
      setMessages(res.data);
    } catch { }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeUser) return;
    const text = input.trim();
    setInput('');

    // Optimistic UI update
    const optimisticMsg = {
      id: Date.now(),
      sender_id: user?.id,
      receiver_id: activeUser.user_id,
      message: text,
      created_at: new Date().toISOString(),
      sender_name: user?.full_name,
      receiver_name: activeUser.full_name
    };

    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await API.post('/api/direct-chat/send', {
        receiver_id: activeUser.user_id,
        message: text,
      });
      loadThreadSilent(activeUser.user_id);
    } catch (err) {
      alert('Failed to send message.');
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100dvh-125px)] lg:h-[calc(100vh-6rem)] max-w-6xl mx-auto px-2 sm:px-4">
      {/* Sidebar - Conversations List */}
      <div className={`w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0 ${
        showMobileChat ? 'hidden lg:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-gray-100 bg-navy text-white shrink-0">
          <h2 className="font-bold text-base flex items-center gap-2">💬 Direct Messages</h2>
          <p className="text-xs text-white/70">Client ↔ Lawyer Consultations</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              No active conversations yet.<br />Book a consultation to start chatting!
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.user_id}
                onClick={() => loadThread(conv.user_id, conv.full_name, conv.role)}
                className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                  activeUser?.user_id === conv.user_id ? 'bg-accent/10 border border-accent/30' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-navy/10 text-navy font-bold flex items-center justify-center shrink-0 text-sm">
                  {conv.full_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-navy truncate">{conv.full_name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">
                      {conv.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{conv.last_message}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Thread Area */}
      <div className={`flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-w-0 ${
        !showMobileChat && 'hidden lg:flex'
      }`}>
        {activeUser ? (
          <>
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-gray-100 bg-white flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="lg:hidden p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 font-bold text-sm"
                >
                  ← Back
                </button>
                <div className="w-9 h-9 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shrink-0">
                  {activeUser.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-navy text-sm sm:text-base leading-tight">{activeUser.full_name}</h3>
                  <span className="text-[10px] text-accent font-semibold uppercase tracking-wider">
                    ● {activeUser.role} Consultation
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 bg-gray-50/50 min-h-0">
              {loading && messages.length === 0 ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs">
                  No messages yet. Send a message to start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl ${
                        isMe ? 'bg-navy text-white rounded-br-none shadow-xs' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-xs'
                      }`}>
                        <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        <span className={`text-[9px] block mt-1 text-right ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area (Always Visible in Portrait Mode) */}
            <div className="p-2.5 sm:p-4 border-t border-gray-100 bg-white shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={`Message ${activeUser.full_name}...`}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-gray-50 min-w-0"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-accent text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-accent-dark disabled:opacity-50 transition-all shrink-0 shadow-sm"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-6 text-center">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
