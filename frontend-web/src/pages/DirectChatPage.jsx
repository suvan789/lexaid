import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function DirectChatPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user_id');
  const appointmentId = searchParams.get('apt_id');

  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (targetUserId) {
      loadThread(targetUserId);
    }
  }, [targetUserId]);

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
      setConversations(res.data);
      if (!targetUserId && res.data.length > 0 && !activeUser) {
        loadThread(res.data[0].user_id, res.data[0].full_name, res.data[0].role);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadThread = async (uid, name = null, role = null) => {
    setLoading(true);
    try {
      const res = await API.get(`/api/direct-chat/thread/${uid}`);
      setMessages(res.data);

      const otherName = name || (res.data.length > 0 ? (res.data[0].sender_id === user?.id ? res.data[0].receiver_name : res.data[0].sender_name) : 'User');
      setActiveUser({ user_id: uid, full_name: otherName, role: role || 'user' });
    } catch (err) {
      console.error('Failed to load thread:', err);
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
        appointment_id: appointmentId || null,
        message: text
      });
      fetchConversations();
    } catch (err) {
      alert('Failed to send message.');
    }
  };

  return (
    <div className="page-container flex gap-4 h-[calc(100vh-8rem)] max-w-6xl mx-auto">
      {/* Sidebar - Conversations */}
      <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-navy text-white">
          <h2 className="font-bold text-base flex items-center gap-2">💬 Direct Messages</h2>
          <p className="text-xs text-white/70">Client ↔ Lawyer Consultations</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              No active conversations yet.<br />Book an appointment to start chatting!
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

      {/* Main Chat Window */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        {activeUser ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent text-white font-bold flex items-center justify-center text-sm">
                  {activeUser.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-navy text-sm">{activeUser.full_name}</h3>
                  <p className="text-xs text-gray-400 capitalize">{activeUser.role || 'User'} • Direct Legal Chat</p>
                </div>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No messages yet. Send a message to start the consultation!
                </div>
              ) : (
                messages.map((m, i) => {
                  const isMe = m.sender_id === user?.id;
                  return (
                    <div key={m.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-xs ${
                        isMe
                          ? 'bg-accent text-white rounded-br-none'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                      }`}>
                        <p className="whitespace-pre-wrap">{m.message}</p>
                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={`Type a message to ${activeUser.full_name}...`}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="px-5 py-2.5 bg-navy text-white font-semibold rounded-xl text-sm hover:bg-navy-light disabled:opacity-50 transition-colors"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <div className="text-5xl mb-3">💬</div>
            <h3 className="font-bold text-navy text-base mb-1">Select a Conversation</h3>
            <p className="text-xs max-w-xs">Select a client or lawyer from the sidebar to view your direct legal consultation messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}
