import React, { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 30, onComplete, className }) => {
  const [displayedText, setDisplayedText] = useState('');
  const completedRef = useRef(false);
  const textRef = useRef('');

  useEffect(() => {
    // Prevent reset if text hasn't changed substantially
    if (text === textRef.current) return;

    textRef.current = text;
    setDisplayedText('');
    completedRef.current = false;

    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        if (!completedRef.current && onComplete) {
          completedRef.current = true;
          onComplete();
        }
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return <div className={`whitespace-pre-wrap break-words ${className}`}>{displayedText}</div>;
};

export default Typewriter;
