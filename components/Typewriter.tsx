import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

/** [plain text, accent text] — the accent part is rendered in the brand colour. */
export type TypewriterPhrase = [string, string];

interface TypewriterProps {
  phrases: TypewriterPhrase[];
  /** Cycle through phrases forever (type, hold, delete, next). Otherwise types the first phrase once. */
  loop?: boolean;
  typeSpeed?: number;
  deleteSpeed?: number;
  holdMs?: number;
  /** Wait until the element scrolls into view before typing. */
  startOnView?: boolean;
  accentClassName?: string;
  className?: string;
}

const Typewriter: React.FC<TypewriterProps> = ({
  phrases,
  loop = false,
  typeSpeed = 55,
  deleteSpeed = 28,
  holdMs = 2200,
  startOnView = false,
  accentClassName = 'text-brand-interactive',
  className = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const active = !startOnView || inView;

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const [plain, accent] = phrases[index];
  const total = plain.length + accent.length;
  const done = !loop && count >= total;

  useEffect(() => {
    if (!active || reduceMotion || done) return;

    let delay = deleting ? deleteSpeed : typeSpeed;
    if (!deleting && count === total) delay = holdMs; // hold finished phrase
    if (deleting && count === 0) delay = 350; // short beat before next phrase

    const t = setTimeout(() => {
      if (!deleting) {
        if (count < total) setCount(count + 1);
        else setDeleting(true);
      } else if (count > 0) {
        setCount(count - 1);
      } else {
        setDeleting(false);
        setIndex((index + 1) % phrases.length);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [active, reduceMotion, done, deleting, count, total, index, phrases.length, typeSpeed, deleteSpeed, holdMs]);

  const shown = reduceMotion ? total : count;
  const shownPlain = plain.slice(0, shown);
  const shownAccent = accent.slice(0, Math.max(0, shown - plain.length));

  return (
    <span ref={ref} className={`relative inline-block whitespace-pre-line ${className}`}>
      {/* Accessible text and layout reservation for one-shot typing */}
      <span className="sr-only">{phrases[0][0] + phrases[0][1]}</span>
      {!loop && (
        <span aria-hidden="true" className="invisible">
          {plain}
          <span>{accent}</span>
        </span>
      )}
      <span aria-hidden="true" className={loop ? '' : 'absolute inset-0'}>
        {shownPlain}
        <span className={accentClassName}>{shownAccent}</span>
        {!reduceMotion && !done && (
          <span className="inline-block w-[3px] h-[0.85em] ml-1 align-baseline bg-brand-interactive animate-pulse" />
        )}
      </span>
    </span>
  );
};

export default Typewriter;
