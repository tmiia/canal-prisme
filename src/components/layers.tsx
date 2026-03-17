"use client";

import { useEffect, useRef, useState } from "react";
import listData from "@/data/listData";

const MOBILE_BREAKPOINT = 768;

function getImagesPerLayer() {
  if (typeof window === "undefined") return 4;
  return window.innerWidth < MOBILE_BREAKPOINT ? 2 : 4;
}

const Layer = () => {
  const [nbSection, setNbSection] = useState(0);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const ticking = useRef(false);

  useEffect(() => {
    setNbSection(Math.ceil(listData.length / getImagesPerLayer()));
  }, []);

  useEffect(() => {
    if (nbSection === 0) return;

    const handleScroll = () => {
      const exp = (window as any).experience;
      const sm = exp?.sceneManager;

      const defaultScene = sm?.sceneInstances?.default;
      if (defaultScene) {
        const firstEl = sectionsRef.current[0];
        const lastEl = sectionsRef.current[nbSection - 1];
        if (firstEl && lastEl) {
          const startY = firstEl.offsetTop;
          const totalHeight = lastEl.offsetTop + lastEl.offsetHeight - startY;
          const relativeOffset = Math.max(0, window.scrollY - startY);
          defaultScene.setScrollOffset?.(relativeOffset, totalHeight);
        }
      }

      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        try {
          const lastEl = sectionsRef.current[nbSection - 1];
          if (lastEl && sm) {
            const rect = lastEl.getBoundingClientRect();
            const vh = window.innerHeight;
            const headStart = vh * 7;
            const progress = Math.max(0, Math.min(1, (vh - rect.top + headStart) / (rect.height + headStart)));

            window.dispatchEvent(
              new CustomEvent("lastSectionProgress", { detail: progress }),
            );

            if (progress >= 1 && sm.currentSceneKey !== "list") {
              sm.setScene("list");
            } else if (progress < 1 && sm.currentSceneKey === "list") {
              sm.setScene("default");
            }
          }
        } finally {
          ticking.current = false;
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [nbSection]);

  return (
    <>
      {Array.from({ length: nbSection }, (_, i) => (
        <section
          key={i}
          ref={(el) => {
            sectionsRef.current[i] = el;
          }}
          data-id={i}
          className="h-[400dvh]"
        />
      ))}
    </>
  );
};

export default Layer;
