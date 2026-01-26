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
  const onCompleteRef = useRef(onComplete);

  // Update ref when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Guard clause: if text is null/undefined/empty, don't render anything
  if (!text) {
    console.warn('[TYPEWRITER] Received null or empty text, rendering nothing');
    return null;
  }

  useEffect(() => {
    // If text changes, reset state
    if (text !== textRef.current) {
      textRef.current = text;
      setDisplayedText('');
      completedRef.current = false;
    } else if (completedRef.current) {
      // If same text and already completed, do nothing
      return;
    }

    let i = displayedText.length;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        if (!completedRef.current && onCompleteRef.current) {
          completedRef.current = true;
          onCompleteRef.current();
        }
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]); // Removed onComplete dependency

  return <div className={`whitespace-pre-wrap break-words ${className}`}>{displayedText}</div>;
};

export default Typewriter;
