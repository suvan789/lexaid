import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useDocument } from "../context/DocumentContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I've read your document. Ask me anything — like 'Is my notice period fair?' or 'Can I sublet this property?'",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { documentText } = useDocument();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMessage = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: trimmed,
        document_text: documentText,
      });
      const botMessage = { role: "bot", text: response.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorText =
        err.response?.data?.error ||
        "Sorry, I encountered an error. Please try again.";
      setMessages((prev) => [...prev, { role: "bot", text: errorText }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      {!isOpen && (
        <button
          id="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 w-14 h-14 bg-navy rounded-full flex items-center justify-center 
                     shadow-xl hover:scale-110 transition-transform duration-200 animate-pulse-glow"
        >
          <span className="text-2xl">💬</span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed right-0 top-0 bottom-0 z-50 bg-white shadow-2xl flex flex-col"
          style={{ width: "380px" }}
          id="chatbot-panel"
        >
          {/* Header */}
          <div className="bg-navy px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-white font-semibold text-base">
                ⚖️ LexAid Assistant
              </h3>
              <p className="text-accent text-xs mt-0.5">
                Ask anything about your document
              </p>
            </div>
            <button
              id="chatbot-close"
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white text-2xl transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "bot" && (
                  <div className="w-7 h-7 bg-accent/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <span className="text-xs">⚖️</span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-navy text-white rounded-br-md"
                      : "bg-white text-gray-700 border border-gray-200 rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-accent/10 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <span className="text-xs">⚖️</span>
                </div>
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1.5">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your document..."
                disabled={isTyping}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent 
                           focus:ring-2 focus:ring-accent/20 transition-all disabled:opacity-50"
              />
              <button
                id="chat-send-btn"
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0
                  ${
                    input.trim() && !isTyping
                      ? "bg-accent text-white hover:bg-accent/90"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
