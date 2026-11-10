import React, { useState } from 'react';
import { Sparkles, Loader2, Plus, ArrowRight, Lightbulb } from 'lucide-react';
import { generateEventIdeas } from '../services/geminiService';
import { INSPIRATION_THEMES } from '../constants';
import type { EventCategory } from '../types';

interface IdeaGeneratorProps {
  onEventGenerated: (
    title: string, 
    description: string, 
    category?: EventCategory, 
    capacity?: number
  ) => void;
  onToast?: (message: string) => void;
}

export const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({ onEventGenerated, onToast }) => {
  const [theme, setTheme] = useState('');
  const [ideas, setIdeas] = useState<{ title: string; description: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (queryTheme?: string) => {
    const activeTheme = (queryTheme || theme).trim();
    if (!activeTheme) return;

    if (queryTheme) setTheme(queryTheme);
    setIsLoading(true);
    setIdeas([]);

    const generatedIdeas = await generateEventIdeas(activeTheme);
    setIdeas(generatedIdeas);
    setIsLoading(false);

    if (onToast && generatedIdeas.length > 0) {
      onToast(`Generated ${generatedIdeas.length} creative concepts for "${activeTheme}"`);
    }
  };

  const handleAddEvent = (idea: { title: string; description: string }) => {
    let category: EventCategory = 'Conference';
    const lower = (idea.title + ' ' + idea.description).toLowerCase();
    if (lower.includes('workshop') || lower.includes('masterclass') || lower.includes('hands-on')) {
      category = 'Workshop';
    } else if (lower.includes('mixer') || lower.includes('networking') || lower.includes('dinner')) {
      category = 'Networking';
    } else if (lower.includes('webinar') || lower.includes('virtual') || lower.includes('online')) {
      category = 'Webinar';
    } else if (lower.includes('executive') || lower.includes('summit') || lower.includes('roundtable')) {
      category = 'Executive';
    }

    onEventGenerated(idea.title, idea.description, category, 100);
    setIdeas(prev => prev.filter(i => i.title !== idea.title));
    if (onToast) {
      onToast(`"${idea.title}" added to your event dashboard!`);
    }
  };

  return (
    <section id="ideas-section" className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="w-4 h-4 text-[#FBBF24]" />
        <h2 className="text-base font-semibold text-[#0F172A] tracking-tight">AI Event Ideation Studio</h2>
      </div>

      {/* Input Group */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-grow">
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Enter an industry, topic, or theme (e.g. 'Autonomous Agents', 'Sustainable Packaging Summit')..."
            className="w-full px-4 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-full text-[#0F172A] text-xs placeholder-[#64748B] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#047857] focus:border-[#047857] transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
        </div>
        <button
          onClick={() => handleGenerate()}
          disabled={isLoading || !theme.trim()}
          className="flex items-center justify-center gap-1.5 bg-[#047857] hover:bg-[#065f46] text-white font-medium text-xs py-2 px-5 rounded-full shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>Generate Concepts</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Concepts Cards */}
      {ideas.length > 0 && (
        <div className="mt-6 pt-5 border-t border-[#E2E8F0] space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#0F172A]">
              Generated Event Proposals <span className="text-xs text-[#64748B] font-mono">({ideas.length})</span>
            </h3>
            <span className="text-[13px] text-[#64748B]">Click to add concept to your active events</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.map((idea, index) => (
              <div 
                key={index} 
                className="bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl p-5 flex flex-col justify-between transition-all shadow-xs"
              >
                <div>
                  <h4 className="font-semibold text-[#0F172A] text-sm mb-2">{idea.title}</h4>
                  <div className="text-xs text-[#64748B] whitespace-pre-line leading-relaxed mb-4 max-h-48 overflow-y-auto pr-1">
                    {idea.description}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-[13px] text-[#64748B]">Auto-configures timeline & logistics</span>
                  <button
                    onClick={() => handleAddEvent(idea)}
                    className="flex items-center gap-1.5 bg-[#047857] hover:bg-[#065f46] text-white text-xs font-medium py-1.5 px-4 rounded-full transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Dashboard</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
