"use client";

import { useEffect, useState, useRef } from "react";

type TypingEffectProps = {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
};

export function TypingEffect({
  phrases,
  typingSpeed = 60,
  deletingSpeed = 35,
  pauseDuration = 2000,
  className,
}: TypingEffectProps) {
  const [currentText, setCurrentText] = useState("");
  const phrasesRef = useRef(phrases);

  useEffect(() => {
    phrasesRef.current = phrases;
  }, [phrases]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let charIndex = 0;
    let phraseIdx = 0;
    let deleting = false;
    let active = true;

    function step() {
      if (!active) return;
      const fullText = phrasesRef.current[phraseIdx] ?? "";

      if (!deleting) {
        charIndex++;
        setCurrentText(fullText.slice(0, charIndex));

        if (charIndex >= fullText.length) {
          deleting = true;
          timeout = setTimeout(step, pauseDuration);
          return;
        }
        timeout = setTimeout(step, typingSpeed);
      } else {
        charIndex--;
        setCurrentText(fullText.slice(0, charIndex));

        if (charIndex <= 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrasesRef.current.length;
          timeout = setTimeout(step, typingSpeed + 200);
          return;
        }
        timeout = setTimeout(step, deletingSpeed);
      }
    }

    step();
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={className}>
      {currentText}
      <span className="ml-0.5 inline-block h-4 w-[2px] bg-primary align-middle animate-cursor-blink" />
    </span>
  );
}
