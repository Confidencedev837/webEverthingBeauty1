import React, { useState, useEffect } from 'react';

export interface PromptItem {
  prefix: string;
  highlight: string;
  category?: string;
}

interface HeroPsychologyTypewriterProps {
  greeting: string;
  userName: string;
  onSelectPrompt?: (category: string) => void;
  className?: string;
}

export const HeroPsychologyTypewriter: React.FC<HeroPsychologyTypewriterProps> = ({
  greeting,
  userName,
  onSelectPrompt,
  className = '',
}) => {
  // Psychological action prompts designed to trigger immediate booking intent
  const prompts: PromptItem[] = [
    { prefix: `${greeting},`, highlight: userName || 'Beauty Lover', category: '' },
    { prefix: 'Looking for a', highlight: 'sharp barber cut?', category: 'Barbering' },
    { prefix: 'Need your', highlight: 'braids or locs refreshed?', category: 'Hair Styling' },
    { prefix: 'Ready for a', highlight: 'flawless glam session?', category: 'Makeup Artistry' },
    { prefix: 'Want a luxury', highlight: 'pedicure & home spa?', category: 'Nails & Pedicure' },
    { prefix: 'Craving a fresh', highlight: 'lash set & facial?', category: 'Lashes & Brows' },
    { prefix: 'Need a verified pro', highlight: 'at your doorstep today?', category: '' },
  ];

  const [promptIndex, setPromptIndex] = useState(0);
  const [displayedPrefix, setDisplayedPrefix] = useState('');
  const [displayedHighlight, setDisplayedHighlight] = useState('');
  const [phase, setPhase] = useState<'typingPrefix' | 'typingHighlight' | 'holding' | 'deletingHighlight' | 'deletingPrefix'>('typingPrefix');

  const currentPrompt = prompts[promptIndex];

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const typeSpeed = 50;     // Fast, crisp typing
    const deleteSpeed = 24;   // Swift backspacing
    const holdDuration = promptIndex === 0 ? 2800 : 2500; // Hold longer on user's name

    if (phase === 'typingPrefix') {
      if (displayedPrefix.length < currentPrompt.prefix.length) {
        timeout = setTimeout(() => {
          setDisplayedPrefix(currentPrompt.prefix.slice(0, displayedPrefix.length + 1));
        }, typeSpeed);
      } else {
        setPhase('typingHighlight');
      }
    } else if (phase === 'typingHighlight') {
      if (displayedHighlight.length < currentPrompt.highlight.length) {
        timeout = setTimeout(() => {
          setDisplayedHighlight(currentPrompt.highlight.slice(0, displayedHighlight.length + 1));
        }, typeSpeed);
      } else {
        setPhase('holding');
      }
    } else if (phase === 'holding') {
      timeout = setTimeout(() => {
        setPhase('deletingHighlight');
      }, holdDuration);
    } else if (phase === 'deletingHighlight') {
      if (displayedHighlight.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedHighlight(displayedHighlight.slice(0, -1));
        }, deleteSpeed);
      } else {
        setPhase('deletingPrefix');
      }
    } else if (phase === 'deletingPrefix') {
      if (displayedPrefix.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedPrefix(displayedPrefix.slice(0, -1));
        }, deleteSpeed);
      } else {
        setPromptIndex((prev) => (prev + 1) % prompts.length);
        setPhase('typingPrefix');
      }
    }

    return () => clearTimeout(timeout);
  }, [phase, displayedPrefix, displayedHighlight, currentPrompt, prompts.length, promptIndex]);

  const handleClick = () => {
    if (currentPrompt.category && onSelectPrompt) {
      onSelectPrompt(currentPrompt.category);
    }
  };

  return (
    <span
      onClick={handleClick}
      className={`relative inline-flex flex-wrap items-baseline transition-opacity duration-200 ${
        currentPrompt.category ? 'cursor-pointer group' : ''
      } ${className}`}
      title={currentPrompt.category ? `Click to find ${currentPrompt.category}` : undefined}
    >
      <span className="text-[#1A1A1A] dark:text-white mr-2">
        {displayedPrefix}
      </span>
      <span className="text-brand-interactive font-black">
        {displayedHighlight}
      </span>
      {/* Obvious glowing Royal Violet typewriter caret */}
      <span
        aria-hidden="true"
        className="inline-block w-[3.5px] h-[0.82em] ml-1.5 bg-brand-interactive dark:bg-brand-accent rounded-sm shadow-[0_0_12px_rgba(108,53,166,0.9)] animate-pulse align-baseline"
      />
    </span>
  );
};

export default HeroPsychologyTypewriter;
