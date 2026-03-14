"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import listData from "@/data/listData";

export default function List() {
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [direction, setDirection] = useState<"column" | "row">("column");
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const sentinelRef = useRef<HTMLElement | null>(null);
  const hasLooped = useRef(false);

  const handleToggleDirection = useCallback(() => {
    const exp = (window as any).experience;
    const scene = exp?.sceneManager?.currentScene;
    const idx = scene?.toggleDirection?.() ?? 0;

    const newDir = scene?.flexGroup?.direction;
    if (newDir === "column" || newDir === "row") {
      setDirection(newDir);
    }

    requestAnimationFrame(() => {
      const section = sectionsRef.current[idx];
      if (section) {
        window.scrollTo({
          left: 0,
          top: section.offsetTop,
          behavior: "instant" as ScrollBehavior,
        });
      }
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const exp = (window as any).experience;
      const sm = exp?.sceneManager;

      if (sm?.currentSceneKey === "list" && sm.currentScene) {
        const sections = sectionsRef.current;
        const firstSection = sections[0];
        if (firstSection) {
          const relativeOffset = Math.max(
            0,
            -firstSection.getBoundingClientRect().top,
          );
          sm.currentScene.setScrollOffset?.(relativeOffset);

          const stride =
            sections[1] && sections[0]
              ? sections[1].offsetTop - sections[0].offsetTop
              : firstSection.offsetHeight;
          const activeIdx = Math.min(
            listData.length - 1,
            Math.max(0, Math.round(relativeOffset / stride)),
          );
          setActiveTitle(listData[activeIdx].title);
        }
      } else {
        setActiveTitle(null);
      }

      const sentinel = sentinelRef.current;
      if (sentinel) {
        const rect = sentinel.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = Math.max(0, Math.min(1, (vh - rect.top) / rect.height));

        window.dispatchEvent(
          new CustomEvent("lastListSectionProgress", { detail: progress }),
        );

        if (progress >= 1 && !hasLooped.current) {
          hasLooped.current = true;
          const sm = (window as any).experience?.sceneManager;
          sm?.setScene("default", { resetScroll: true });
          window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
          requestAnimationFrame(() => {
            hasLooped.current = false;
          });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isRow = direction === "row";

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none flex flex-col items-center justify-center space-x-2.5 pr-2.5"
        style={{ zIndex: 2 }}
      >
        <h2
          className="text-sm font-normal font-canal-light-romain text-foreground transition-opacity duration-300"
          style={{
            opacity: activeTitle ? 1 : 0,
            transform: "translateY(calc(-1 * var(--plane-half-vh, 15vh) - 0.4rem))",
          }}
        >
          {activeTitle}
        </h2>
        <span
          className="text-[10px] font-normal font-canal-light-romain text-foreground transition-opacity duration-300"
          style={{
            opacity: activeTitle ? 1 : 0,
            transform: "translateY(calc(var(--plane-half-vh, 15vh) + 0.4rem))",
          }}
        >
          {listData.findIndex((d) => d.title === activeTitle) + 1}
        </span>
      </div>

      <div
        className="relative flex flex-col space-y-2.5"
        style={{ zIndex: 0 }}
      >
        {listData.map((item, i) => (
          <section
            key={item.id}
            ref={(el) => {
              sectionsRef.current[i] = el;
            }}
            data-id={item.id}
            style={{ height: "var(--section-h, 38vh)" }}
          />
        ))}
      </div>
    </>
  );
}
