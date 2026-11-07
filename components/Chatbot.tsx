import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import type { ChatMessage, Event } from '../types';
import { getChatbotResponse } from '../services/geminiService';

interface ChatbotProps {
  availableEvents: Event[];
  onToast?: (message: string) => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ availableEvents, onToast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 1, 
      text: "Hello! I'm your EventMate planning partner. I have full context on your events. Ask me for venue budgeting advice, speaker recommendations, run-of-show adjustments, or attendee communication strategies.", 
      sender: 'bot' 
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const chatboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || userInput).trim();
    if (!text) return;

    const newUserMessage: ChatMessage = { id: Date.now(), text, sender: 'user' };
    const loadingBotMessage: ChatMessage = { id: Date.now() + 1, text: "...", sender: 'bot', isLoading: true };

    setMessages(prev => [...prev, newUserMessage, loadingBotMessage]);
    setUserInput('');

    const history = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    const botResponseText = await getChatbotResponse(history, text, availableEvents);

    const newBotMessage: ChatMessage = { id: Date.now() + 2, text: botResponseText, sender: 'bot' };

    setMessages(prev => {
      const filtered = prev.filter(m => !m.isLoading);
      return [...filtered, newBotMessage];
    });
  };

  const handleCopyMessage = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    if (onToast) onToast('Assistant response copied to clipboard');
  };

  const QUICK_PROMPTS = [
    "Suggest 3 interactive icebreakers",
    "How should I budget catering for 250 people?",
    "Tips for maximizing workshop attendance"
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-500 text-white p-3.5 rounded-full shadow-xl hover:shadow-indigo-500/20 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-label="Open AI Planning Assistant"
        title="Open EventMate AI Assistant"
      >
        <div className="relative">
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-600" />
        </div>
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-full max-w-sm sm:max-w-md h-[560px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-none">EventMate AI Partner</h3>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Grounded with {availableEvents.length} active events</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-slate-950/50 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
            <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div ref={chatboxRef} className="flex-grow p-4 space-y-3.5 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative group rounded-xl px-4 py-2.5 max-w-[85%] text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 shadow-sm'
                  }`}
                >
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2 py-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span className="text-slate-400 text-xs">Thinking...</span>
                    </div>
                  ) : (
                    <>
                      <div className="whitespace-pre-line font-sans">{msg.text}</div>
                      {msg.sender === 'bot' && (
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 right-2 p-1 bg-slate-900 border border-slate-700 rounded text-slate-400 hover:text-white"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask for planning advice or suggestions..."
              className="flex-grow px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!userInput.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};