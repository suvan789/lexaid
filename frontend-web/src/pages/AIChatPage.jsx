import React, { useState, useRef, useEffect } from 'react';
import API from '../api/axios';

export default function AIChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Namaste! 🙏 I\'m LexAid, your AI legal assistant. Ask me anything about Indian law — IPC, tenant rights, labour law, consumer rights, family law, and more.\n\n⚖️ Always consult a qualified lawyer for your specific case.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(Date.now());
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.filter(m => m.role !== 'system').map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await API.post('/api/chat/legal', {
        message: userMsg,
        conversation_history: history.slice(-10),
      });

      const reply = res.data.reply + '\n\n⚖️ Always consult a qualified lawyer for your specific case.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    if (messages.length > 1) {
      setConversations(prev => [{
        id: currentConvId,
        preview: messages.find(m => m.role === 'user')?.content || 'New chat',
        date: new Date().toLocaleDateString(),
        messages: [...messages],
      }, ...prev]);
    }
    setCurrentConvId(Date.now());
    setMessages([
      { role: 'assistant', content: 'Namaste! 🙏 What legal question can I help you with today?\n\n⚖️ Always consult a qualified lawyer for your specific case.' }
    ]);
  };

  const loadConversation = (conv) => {
    if (messages.length > 1) {
      setConversations(prev => {
        const existing = prev.find(c => c.id === currentConvId);
        if (existing) {
          return prev.map(c => c.id === currentConvId ? { ...c, messages: [...messages] } : c);
        }
        return [{ id: currentConvId, preview: messages.find(m => m.role === 'user')?.content || 'Chat', date: new Date().toLocaleDateString(), messages: [...messages] }, ...prev];
      });
    }
    setCurrentConvId(conv.id);
    setMessages(conv.messages);
  };

  return (
    <div className="flex gap-4 h-[calc(100dvh-125px)] lg:h-[calc(100vh-6rem)] max-w-6xl mx-auto px-2 sm:px-4">
      {/* Sidebar - Conversation History */}
      <div className="hidden lg:flex flex-col w-64 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={startNewChat}
            className="w-full py-2.5 px-4 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy-light transition-colors shadow-sm"
          >
            + New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No past conversations</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv)}
                className={`w-full text-left p-3 rounded-xl mb-1 hover:bg-gray-50 transition-colors ${
                  currentConvId === conv.id ? 'bg-accent/10 border border-accent/20' : ''
                }`}
              >
                <p className="text-sm text-gray-800 truncate font-medium">{conv.preview}</p>
                <p className="text-xs text-gray-400 mt-1">{conv.date}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-w-0">
        {/* Header */}
        <div className="bg-navy text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚖️</span>
            <div>
              <p className="font-bold text-sm sm:text-base">LexAid AI Legal Chat</p>
              <p className="text-[11px] text-white/70">General Indian Law Q&A</p>
            </div>
          </div>
          <button onClick={startNewChat} className="lg:hidden text-xs bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 font-medium transition-colors">
            + New Chat
          </button>
        </div>

        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 min-h-0">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[88%] sm:max-w-[75%] ${
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm'
                  : 'bg-gray-50 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-100'
              }`}>
                <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar (Always Visible on Mobile Portrait) */}
        <div className="p-2.5 sm:p-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <div className="flex gap-2 max-w-3xl mx-auto items-center">
            <button
              onClick={toggleListening}
              className={`p-2.5 sm:px-4 sm:py-3 rounded-xl transition-colors shrink-0 text-base ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              title="Voice Input"
            >
              🎤
            </button>
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask about Indian law..."
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white min-w-0"
            />
            <button
              id="chat-send"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-navy text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-navy-light disabled:opacity-50 transition-all shrink-0 shadow-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
