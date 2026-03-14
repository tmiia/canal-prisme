"use client";

import { useEffect, useState } from "react";

interface ScrollTransitionProps {
  text?: string;
  eventName?: string;
}

const ScrollTransition = ({
  text = "Scroll Down to see interviews",
  eventName = "lastSectionProgress",
}: ScrollTransitionProps) => {
  const letters = Array.from(text);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onProgress = (e: any) => {
      const p = typeof e?.detail === "number" ? e.detail : 0;
      setProgress(p);
    };

    window.addEventListener(eventName, onProgress as EventListener);
    return () => window.removeEventListener(eventName, onProgress as EventListener);
  }, [eventName]);

  if (progress <= 0 || progress >= 1) return null;

  const fadeOut = progress > 0.8 ? 1 - (progress - 0.8) / 0.2 : 1;

  return (
    <div
      className="fixed bottom-10 left-[50%] -translate-x-[50%] pointer-events-none z-50"
      style={{ opacity: fadeOut }}
    >
      <strong className="font-mono font-normal text-sm uppercase">
        {letters.map((ch, i) => {
          const lettersCount = letters.length;
          const start = (i / Math.max(1, lettersCount - 1)) * 0.8;
          const w = 0.2;
          const p = Math.max(0, Math.min(1, (progress - start) / w));
          const opacity = 0.5 + 0.5 * p;

          return (
            <span key={i} className="inline-block" style={{ opacity, whiteSpace: "pre" }}>
              {ch}
            </span>
          );
        })}
      </strong>
    </div>
  );
};

export default ScrollTransition;
