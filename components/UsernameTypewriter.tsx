import React, { useState, useEffect } from 'react';

interface UsernameTypewriterProps {
  name: string;
  speed?: number; // Delay in milliseconds between characters
}

export const UsernameTypewriter: React.FC<UsernameTypewriterProps> = ({
  name,
  speed = 70,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!name) return;

    // Reset for the one-time load typing sequence
    setDisplayedText('');
    setIsTypingComplete(false);
    setShowCursor(true);

    let charIndex = 0;
    // Brief 220ms pause after page mounts so the user clearly notices the typing start
    const startTimeout = setTimeout(() => {
      const timer = setInterval(() => {
        if (charIndex < name.length) {
          charIndex++;
          setDisplayedText(name.slice(0, charIndex));
        } else {
          clearInterval(timer);
          setIsTypingComplete(true);

          // Let the blinking cursor linger for 1.4 seconds before gracefully fading out
          setTimeout(() => {
            setShowCursor(false);
          }, 1400);
        }
      }, speed);

      return () => clearInterval(timer);
    }, 220);

    return () => clearTimeout(startTimeout);
  }, [name, speed]);

  return (
    <span className="relative inline-flex items-baseline text-brand-interactive font-black">
      <span>{displayedText}</span>
      {showCursor && (
        <span
          aria-hidden="true"
          className={`inline-block w-[3.5px] h-[0.82em] ml-1 bg-brand-interactive dark:bg-brand-accent rounded-sm shadow-[0_0_10px_rgba(108,53,166,0.85)] ${
            isTypingComplete ? 'animate-pulse opacity-75' : 'opacity-100 animate-pulse'
          }`}
        />
      )}
    </span>
  );
};

export default UsernameTypewriter;
