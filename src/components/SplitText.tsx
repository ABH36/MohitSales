'use client';

import React, { useEffect, useRef, useState } from 'react';

interface SplitTextProps {
  text: string;
  delay?: number;
}

export default function SplitText({ text, delay = 0 }: SplitTextProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const words = text.split(' ');

  return (
    <span ref={elementRef} className="split-text-wrapper">
      {words.map((word, wordIdx) => {
        const chars = Array.from(word);
        const previousWords = words.slice(0, wordIdx);
        const baseIndex = previousWords.join('').length + previousWords.length;

        return (
          <span
            key={wordIdx}
            className="word"
          >
            {chars.map((char, charIdx) => {
              const charGlobalIdx = baseIndex + charIdx;
              return (
                <span
                  key={charIdx}
                  className="char"
                  style={{
                    display: 'inline-block',
                    opacity: isVisible ? 1 : 0,
                    transition: isVisible
                      ? `opacity 0.8s cubic-bezier(.22, 1, .36, 1) ${delay + charGlobalIdx * 25}ms`
                      : 'none',
                  }}
                >
                  {char}
                </span>
              );
            })}
            {wordIdx < words.length - 1 && (
              <span className="word-space">&nbsp;</span>
            )}
          </span>
        );
      })}
    </span>
  );
}
