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
    // Derive sensible category from title
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
    <section id="ideas-section" className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:p-7 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">AI Event Ideation Studio</h2>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Generate executive-ready event briefs, target attendee profiles, and programming formats powered by Gemini.
          </p>
        </div>

        {/* Quick Inspiration Prompts */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 mr-1 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>Try:</span>
          </span>
          {INSPIRATION_THEMES.slice(0, 3).map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleGenerate(item.label)}
              disabled={isLoading}
              className="text-xs px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Group */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Enter an industry, topic, or theme (e.g. 'Enterprise Autonomous Agents', 'Sustainable Packaging Summit')..."
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
        </div>
        <button
          onClick={() => handleGenerate()}
          disabled={isLoading || !theme.trim()}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-2.5 px-6 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Concepts</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Concepts Cards */}
      {ideas.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">
              Generated Event Proposals <span className="text-xs text-slate-500 font-mono">({ideas.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Click to add any concept to your active dashboard</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.map((idea, index) => (
              <div 
                key={index} 
                className="bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-lg p-5 flex flex-col justify-between transition-colors shadow-sm"
              >
                <div>
                  <h4 className="font-bold text-white text-base mb-2">{idea.title}</h4>
                  <div className="text-xs text-slate-300/90 whitespace-pre-line leading-relaxed mb-4 max-h-48 overflow-y-auto pr-1">
                    {idea.description}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Includes auto-configured agenda & logistics</span>
                  <button
                    onClick={() => handleAddEvent(idea)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-1.5 px-3.5 rounded-md transition-colors"
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
