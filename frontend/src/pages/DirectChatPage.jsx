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

  const DEFAULT_CONTACTS = [
    {
      user_id: "adv_flowfored",
      full_name: "Advocate Flowfored",
      role: "High Court Advocate",
      last_message: "Hello! How can I assist with your legal matter today?"
    },
    {
      user_id: "adv_suvan_senthil",
      full_name: "Adv. Suvan Senthil",
      role: "Supreme Court Advocate",
      last_message: "I have reviewed your legal notice documents."
    },
    {
      user_id: "adv_rajesh_sharma",
      full_name: "Adv. Rajesh Sharma",
      role: "Corporate Counsel",
      last_message: "Employment contract non-compete clause is void under Section 27."
    },
    {
      user_id: "adv_ananya_deshmukh",
      full_name: "Adv. Ananya Deshmukh",
      role: "Family Law Expert",
      last_message: "Consultation booked for property partition deed."
    }
  ];

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (targetUserId) {
      loadThread(targetUserId, targetName);
      setShowMobileChat(true);
    }
  }, [targetUserId, targetName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    let serverConvs = [];
    try {
      const res = await API.get('/api/direct-chat/conversations');
      if (Array.isArray(res.data) && res.data.length > 0) {
        serverConvs = res.data;
      }
    } catch { }

    const savedAppts = JSON.parse(localStorage.getItem(`lexaid_client_appointments_${user?.email || 'guest'}`) || '[]');
    const apptConvs = savedAppts.map(apt => ({
      user_id: apt.lawyer_id || apt.lawyer?.id || "adv_flowfored",
      full_name: apt.lawyer?.name || "Advocate Counsel",
      role: "Advocate",
      last_message: apt.issue_description || "Consultation appointment booked"
    }));

    const combinedMap = new Map();
    [...DEFAULT_CONTACTS, ...serverConvs, ...apptConvs].forEach(item => {
      const key = String(item.user_id || item.full_name);
      if (!combinedMap.has(key)) {
        combinedMap.set(key, item);
      }
    });

    const finalConvs = Array.from(combinedMap.values());
    setConversations(finalConvs);

    if (targetUserId) {
      const match = finalConvs.find(c => String(c.user_id) === String(targetUserId));
      loadThread(targetUserId, match?.full_name || targetName, match?.role);
    } else if (finalConvs.length > 0 && !activeUser) {
      loadThread(finalConvs[0].user_id, finalConvs[0].full_name, finalConvs[0].role);
    }
  };

  const getStorageKey = (uid) => `lexaid_chat_history_${user?.email || 'guest'}_${uid}`;

  const loadThread = async (uid, name = null, role = null) => {
    setLoading(true);
    const targetFullName = name || targetName || 'Advocate Counsel';

    // 1. Load persistent chat history from localStorage
    const savedLocalMsgs = JSON.parse(localStorage.getItem(getStorageKey(uid)) || '[]');
    
    // Initial welcome message if thread is new
    const initialMsgs = savedLocalMsgs.length > 0 ? savedLocalMsgs : [
      {
        id: "init_1",
        sender_id: uid,
        receiver_id: user?.id || "client",
        message: `Namaste! I am ${targetFullName}. How can I assist you with your legal query?`,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        sender_name: targetFullName
      }
    ];

    setActiveUser({ user_id: uid, full_name: targetFullName, role: role || 'Advocate' });
    setMessages(initialMsgs);
    setShowMobileChat(true);

    // 2. Sync with backend API
    try {
      const res = await API.get(`/api/direct-chat/thread/${uid}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        const merged = [...initialMsgs];
        res.data.forEach(m => {
          if (!merged.some(x => x.id === m.id || x.message === m.message)) {
            merged.push(m);
          }
        });
        setMessages(merged);
        localStorage.setItem(getStorageKey(uid), JSON.stringify(merged));
      }
    } catch { } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeUser) return;
    const text = input.trim();
    setInput('');

    const newMsg = {
      id: "msg_" + Date.now(),
      sender_id: user?.id || "client_user",
      receiver_id: activeUser.user_id,
      message: text,
      created_at: new Date().toISOString(),
      sender_name: user?.full_name || "Client",
      receiver_name: activeUser.full_name
    };

    const updatedMsgs = [...messages, newMsg];
    setMessages(updatedMsgs);
    localStorage.setItem(getStorageKey(activeUser.user_id), JSON.stringify(updatedMsgs));

    setConversations(prev => prev.map(c => {
      if (String(c.user_id) === String(activeUser.user_id)) {
        return { ...c, last_message: text };
      }
      return c;
    }));

    try {
      await API.post('/api/direct-chat/send', {
        receiver_id: activeUser.user_id,
        message: text,
      });
    } catch { }
  };

  return (
    <div className="flex gap-4 h-[calc(100dvh-120px)] lg:h-[calc(100vh-6rem)] max-w-6xl mx-auto px-1 sm:px-4">
      {/* WhatsApp Sidebar — Contact List */}
      <div className={`w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden shrink-0 ${
        showMobileChat ? 'hidden lg:flex' : 'flex'
      }`}>
        <div className="p-4 bg-[#075e54] text-white shrink-0 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">💬 Direct Messages</h2>
            <p className="text-[11px] text-emerald-100">WhatsApp Style Legal Messaging</p>
          </div>
          <span className="text-xl">⚖️</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {conversations.map((conv) => (
            <button
              key={conv.user_id}
              onClick={() => loadThread(conv.user_id, conv.full_name, conv.role)}
              className={`w-full p-3.5 text-left transition-all flex items-center gap-3.5 hover:bg-gray-50 ${
                activeUser?.user_id === conv.user_id ? 'bg-emerald-50/80 border-l-4 border-[#075e54]' : ''
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-[#075e54] text-white font-bold flex items-center justify-center shrink-0 text-base shadow-sm">
                {conv.full_name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-navy truncate">{conv.full_name}</p>
                </div>
                <p className="text-xs text-emerald-800 font-medium truncate mt-0.5">{conv.role}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{conv.last_message}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* WhatsApp Main Chat Thread Area */}
      <div className={`flex-1 flex flex-col bg-[#efeae2] rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-w-0 ${
        !showMobileChat && 'hidden lg:flex'
      }`}>
        {activeUser ? (
          <>
            {/* Header */}
            <div className="p-3 sm:p-4 bg-[#075e54] text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="lg:hidden p-1.5 rounded-lg text-white hover:bg-white/10 font-bold text-sm"
                >
                  ← Back
                </button>
                <div className="w-10 h-10 rounded-full bg-white text-[#075e54] font-bold flex items-center justify-center text-base shrink-0 shadow-sm">
                  {activeUser.full_name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base leading-tight">{activeUser.full_name}</h3>
                  <span className="text-[11px] text-emerald-200 font-medium">
                    ● Online • {activeUser.role}
                  </span>
                </div>
              </div>
            </div>

            {/* WhatsApp Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 bg-[#efeae2] min-h-0">
              {messages.map((msg) => {
                const isMe = msg.sender_id === (user?.id || 'client_user');
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-xl shadow-xs ${
                      isMe ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'
                    }`}>
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[9px] text-gray-500">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <span className="text-blue-600 text-xs font-bold">✓✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* WhatsApp Input Bar */}
            <div className="p-3 bg-[#f0f2f5] border-t border-gray-200 shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={`Type a message to ${activeUser.full_name}...`}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#075e54] bg-white min-w-0"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="px-5 py-3 bg-[#075e54] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#064e46] disabled:opacity-50 transition-all shrink-0 shadow-sm"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm p-6 text-center">
            Select an advocate conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
