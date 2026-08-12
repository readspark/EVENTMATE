import React, { useState } from 'react';
import { generateEventIdeas } from '../services/geminiService';
import { BulletPointDescription } from './BulletPointDescription';

interface IdeaGeneratorProps {
    onEventGenerated: (title: string, description: string) => void;
}

const LoadingSpinner: React.FC<{ size?: string }> = ({ size = '5' }) => (
  <div className={`animate-spin rounded-full h-${size} w-${size} border-b-2 border-white`}></div>
);

const LightbulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

export const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({ onEventGenerated }) => {
  const [theme, setTheme] = useState('');
  const [ideas, setIdeas] = useState<{title: string, description: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!theme.trim()) return;
    setIsLoading(true);
    setIdeas([]);
    const generatedIdeas = await generateEventIdeas(theme);
    setIdeas(generatedIdeas);
    setIsLoading(false);
  };

  const handleAddEvent = (idea: {title: string, description: string}) => {
    onEventGenerated(idea.title, idea.description);
    setIdeas(prevIdeas => prevIdeas.filter(i => i.title !== idea.title));
  };


  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
        <div className="flex items-center mb-4">
            <LightbulbIcon />
            <h2 className="text-2xl font-bold text-white">Event Idea Generator</h2>
        </div>
        <p className="text-slate-400 mb-4">Start by entering a theme. Our AI will craft event profiles for you to add and customize.</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="e.g., 'Sustainability', 'Retro Gaming', 'Space Exploration'"
          className="flex-grow w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 placeholder-slate-400"
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !theme.trim()}
          className="flex items-center justify-center bg-slate-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:bg-slate-500/50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <LoadingSpinner size="6"/> : 'Generate Ideas'}
        </button>
      </div>

      {ideas.length > 0 && (
        <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-lg text-white">Generated Ideas:</h3>
            {ideas.map((idea, index) => (
                <div key={index} className="bg-slate-700 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-grow">
                        <p className="font-bold text-white">{idea.title}</p>
                        <BulletPointDescription description={idea.description} className="text-sm text-slate-300 mt-2" />
                    </div>
                    <button 
                        onClick={() => handleAddEvent(idea)}
                        className="bg-green-600 text-white text-sm font-semibold py-1 px-3 rounded-full hover:bg-green-700 transition-colors whitespace-nowrap"
                    >
                        + Add to Dashboard
                    </button>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};
