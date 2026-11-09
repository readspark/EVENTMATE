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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-[#7C3AED] hover:bg-[#6D28D9] text-white w-12 h-12 rounded-full shadow-lg hover:shadow-[#7C3AED]/20 flex items-center justify-center transition-all focus:outline-none"
        aria-label="Open AI Planning Assistant"
        title="EventMate AI Assistant"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-full max-w-sm sm:max-w-md h-[500px] bg-[#020204] border border-[#1F1F24] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-[#060608] border-b border-[#1F1F24] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#181126] border border-[#7C3AED]/30 flex items-center justify-center text-[#A78BFA]">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white leading-none">EventMate AI Partner</h3>
                <div className="text-[11px] text-[#8E8E93] mt-1">
                  Direct Definite Planning Intelligence
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#8E8E93] hover:text-white p-1 rounded-full hover:bg-[#121215] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div ref={chatboxRef} className="flex-grow p-4 space-y-3 overflow-y-auto bg-[#020204]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative group rounded-2xl px-3.5 py-2.5 max-w-[85%] text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#7C3AED] text-white shadow-xs'
                      : 'bg-[#0A0A0E] text-[#E4E4E7] border border-[#1F1F24] shadow-xs'
                  }`}
                >
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2 py-0.5">
                      <Loader2 className="w-3 h-3 animate-spin text-[#A78BFA]" />
                      <span className="text-[#8E8E93] text-xs">Evaluating...</span>
                    </div>
                  ) : (
                    <>
                      <div className="whitespace-pre-line font-sans">{msg.text}</div>
                      {msg.sender === 'bot' && (
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 right-2 p-1 bg-black border border-[#1F1F24] rounded-full text-[#8E8E93] hover:text-[#A78BFA]"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-[#10B981]" />
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
          <div className="p-3 bg-[#060608] border-t border-[#1F1F24] flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a definite question..."
              className="flex-grow px-3.5 py-2 bg-[#0A0A0E] border border-[#1F1F24] rounded-full text-xs text-white placeholder-[#71717A] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!userInput.trim()}
              className="p-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 text-white rounded-full transition-all shrink-0"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};