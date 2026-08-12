import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Event } from '../types';
import { getChatbotResponse } from '../services/geminiService';

interface ChatbotProps {
  availableEvents: Event[];
}

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

export const Chatbot: React.FC<ChatbotProps> = ({ availableEvents }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Hello! I'm EventMate, your AI planning assistant. Ask me for theme ideas, marketing tips, or scheduling advice!", sender: 'bot' }
  ]);
  const [userInput, setUserInput] = useState('');
  const chatboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newUserMessage: ChatMessage = { id: Date.now(), text: userInput, sender: 'user' };
    const loadingBotMessage: ChatMessage = { id: Date.now() + 1, text: "...", sender: 'bot', isLoading: true };

    setMessages(prev => [...prev, newUserMessage, loadingBotMessage]);
    setUserInput('');

    const history = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    const botResponseText = await getChatbotResponse(history, userInput, availableEvents);
    
    const newBotMessage: ChatMessage = { id: Date.now() + 1, text: botResponseText, sender: 'bot' };
    
    setMessages(prev => {
        const newMessages = prev.filter(m => !m.isLoading);
        return [...newMessages, newBotMessage];
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-slate-800 text-white p-4 rounded-full shadow-lg hover:bg-slate-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
      >
        <ChatIcon />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out">
          <div className="p-4 bg-slate-800 text-white flex justify-between items-center rounded-t-xl">
            <h3 className="font-bold text-lg">EventMate Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              <CloseIcon />
            </button>
          </div>
          <div ref={chatboxRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg px-4 py-2 max-w-[80%] ${msg.sender === 'user' ? 'bg-slate-700 text-white' : 'bg-slate-600 text-white'}`}>
                  {msg.isLoading ? (
                    <div className="flex items-center justify-center space-x-1">
                        <span className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                    </div>
                  ) : msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-700 flex items-center">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a question..."
              className="flex-grow px-3 py-2 border border-slate-700 bg-slate-700 text-white rounded-l-lg focus:outline-none focus:ring-1 focus:ring-slate-500 placeholder-gray-400"
            />
            <button onClick={handleSendMessage} className="bg-slate-800 text-white p-2 rounded-r-lg hover:bg-slate-700">
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
};