import { useState, useEffect } from 'react';

export default function TypewriterText({ text, isActive }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setDisplayedText("");
      setIsComplete(false);
      return;
    }

    if (!text) {
      setIsComplete(true);
      return;
    }

    let i = 0;
    let timeoutId;

    const typeChar = () => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;

        let delay = 15 + (Math.random() * 20); // Medium-slow elegant pacing
        const char = text[i - 1];
        if (['.', '?', '!'].includes(char)) delay += 100;
        else if (char === ',') delay += 40;

        timeoutId = setTimeout(typeChar, delay);
      } else {
        setIsComplete(true);
      }
    };

    // Slight delay before typing begins
    timeoutId = setTimeout(typeChar, 200);

    return () => clearTimeout(timeoutId);
  }, [text, isActive]);

  // Fallback safety: ensures complete full text render if typing finishes or if text exists but animation is skipped
  if (isActive && isComplete) {
    return <>{text}</>;
  }

  return (
    <>
      {displayedText}
      {!isComplete && isActive && (
        <span className="typing-cursor" />
      )}
    </>
  );
}
