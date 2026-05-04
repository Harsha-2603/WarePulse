import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, TrendingUp, Package, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import api from '../services/api';

const AIAssistantPage = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello Admin! I'm your Inventory Intelligence Assistant. I can help you analyze sales data, manage stock levels, and understand your customer purchasing patterns. How can I assist you today?"
    }
  ]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    
    const userMessage = query.trim();
    // Add user message to UI
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: userMessage }]);
    setQuery('');
    setIsLoading(true);
    
    try {
      // Connect to the secure backend Groq service
      const response = await api.post('/ai/chat', { message: userMessage });
      
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        type: 'ai', 
        content: response.data.reply || "No response received." 
      }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        type: 'ai', 
        content: "I'm sorry, I am having trouble connecting to the intelligence server right now. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    setQuery(suggestionText);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">
      
      {/* Header Info */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Bot className="w-8 h-8 text-indigo-600" />
          AI Business Assistant
        </h1>
        <p className="mt-1 text-slate-500">Ask questions about your inventory, customers, or sales in natural language.</p>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
        
        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Welcome Screen / Suggestions (Only show if few messages exist) */}
          {messages.length <= 1 && (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to AI Assistant</h2>
              <p className="text-slate-500 mb-8 max-w-lg">I have full context of your inventory management system. Ask me to generate reports, analyze trends, or find specific records.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
                <button 
                  onClick={() => handleSuggestionClick("Show revenue and sales performance")}
                  className="bg-white border border-slate-200 p-4 rounded-xl text-left hover:border-indigo-300 hover:shadow-sm transition-all group"
                >
                  <TrendingUp className="w-5 h-5 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-slate-700 leading-snug">Show revenue and sales performance</p>
                </button>
                <button 
                  onClick={() => handleSuggestionClick("What's my current inventory status?")}
                  className="bg-white border border-slate-200 p-4 rounded-xl text-left hover:border-indigo-300 hover:shadow-sm transition-all group"
                >
                  <Package className="w-5 h-5 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-slate-700 leading-snug">What's my current inventory status?</p>
                </button>
                <button 
                  onClick={() => handleSuggestionClick("Tell me about my top customers")}
                  className="bg-white border border-slate-200 p-4 rounded-xl text-left hover:border-indigo-300 hover:shadow-sm transition-all group"
                >
                  <Users className="w-5 h-5 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-slate-700 leading-snug">Tell me about my top customers</p>
                </button>
              </div>
            </div>
          )}

          {/* Actual Message Bubbles */}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.type === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                {msg.type === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${msg.type === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-indigo-100 text-indigo-600">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="max-w-[80%] rounded-2xl px-5 py-4 bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Message your AI Assistant..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent block pl-5 pr-14 py-3.5 sm:py-4 transition-all"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-xs text-slate-400">AI Assistant can make mistakes. Consider verifying important financial data.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIAssistantPage;
