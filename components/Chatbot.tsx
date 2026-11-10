import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Copy, Check, Loader2 } from 'lucide-react';
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
      text: "EventMate assistant ready. Ask any event question for direct, definite planning guidance.", 
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

  return (
    <>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-[#0F172A]/25 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-[#047857] hover:bg-[#065f46] text-white w-14 h-14 rounded-full shadow-xl hover:shadow-[#047857]/25 flex items-center justify-center transition-all focus:outline-none"
        aria-label="Open AI Planning Assistant"
        title="EventMate AI Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-[85px] right-6 z-50 w-[420px] max-w-[calc(100vw-32px)] sm:w-[460px] h-[420px] bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-3 px-4 bg-[#F1F5F9] border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-50 border border-[#10B981]/30 flex items-center justify-center text-[#047857] shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] leading-none">EventMate AI Partner</h3>
                <div className="text-xs text-[#64748B] mt-1">
                  Direct Definite Guidance
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#64748B] hover:text-[#0F172A] p-1.5 rounded-full hover:bg-[#E2E8F0] transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div ref={chatboxRef} className="flex-grow p-3.5 space-y-3 overflow-y-auto bg-white">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative group rounded-xl px-3.5 py-2.5 max-w-[88%] text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#047857] text-white shadow-xs font-medium'
                      : 'bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] shadow-xs'
                  }`}
                >
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2 py-0.5">
                      <Loader2 className="w-4 h-4 animate-spin text-[#047857]" />
                      <span className="text-[#64748B] text-sm">Evaluating...</span>
                    </div>
                  ) : (
                    <>
                      <div className="whitespace-pre-line font-sans text-sm">{msg.text}</div>
                      {msg.sender === 'bot' && (
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2.5 right-2 p-1 bg-white border border-[#E2E8F0] rounded-full text-[#64748B] hover:text-[#047857] shadow-xs"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
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
          <div className="p-3 px-3.5 bg-[#F1F5F9] border-t border-[#E2E8F0] flex items-center gap-2.5">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a definite question..."
              className="flex-grow px-3.5 py-2 bg-white border border-[#E2E8F0] rounded-full text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#047857] focus:border-[#047857] transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!userInput.trim()}
              className="p-2 bg-[#047857] hover:bg-[#065f46] disabled:opacity-40 text-white rounded-full transition-all shrink-0 shadow-xs"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};