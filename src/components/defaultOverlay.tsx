"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface ArtData {
  id?: number;
  title?: string;
  authorName?: string;
  description?: string;
  originalUrl?: string;
}

function fakeDuration(id: number): string {
  const minutes = 3 + ((id * 7 + 2) % 8);
  return `${minutes} min`;
}

export default function DefaultOverlay() {
  const [artData, setArtData] = useState<ArtData | null>(null);
  const [activeHalfVh, setActiveHalfVh] = useState<number | null>(null);
  const [activeHalfVw, setActiveHalfVw] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const onFocus = (
      e: CustomEvent<{
        sceneKey: string;
        activeHalfVh: number;
        activeHalfVw: number;
        artData: ArtData;
      }>,
    ) => {
      if (e.detail.sceneKey !== "default") return;
      setArtData(e.detail.artData);
      setActiveHalfVh(e.detail.activeHalfVh);
      setActiveHalfVw(e.detail.activeHalfVw);
      requestAnimationFrame(() => setVisible(true));
    };

    const onUnfocus = () => {
      setVisible(false);
      const timeout = setTimeout(() => {
        setArtData(null);
        setActiveHalfVh(null);
        setActiveHalfVw(null);
      }, 600);
      return () => clearTimeout(timeout);
    };

    window.addEventListener("planefocus", onFocus as EventListener);
    window.addEventListener("planeunfocus", onUnfocus);
    return () => {
      window.removeEventListener("planefocus", onFocus as EventListener);
      window.removeEventListener("planeunfocus", onUnfocus);
    };
  }, []);

  useEffect(() => {
    if (!textRef.current) return;
    const lines = textRef.current.children;
    const img = imageRef.current;

    if (visible) {
      gsap.set(lines, { opacity: 0, y: 12 });
      if (img) gsap.set(img, { clipPath: "inset(100% 0 0 0)" });

      tlRef.current = gsap.timeline({ delay: 0.65 });
      tlRef.current.to(lines, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: "power2.out",
        stagger: 0.02,
      });
      if (img) {
        tlRef.current.to(
          img,
          {
            clipPath: "inset(0% 0 0 0)",
            duration: 0.6,
            ease: "power2.out",
          },
          0.1,
        );
      }
    } else {
      tlRef.current?.kill();
      gsap.to(lines, {
        opacity: 0,
        y: 12,
        duration: 0.25,
        ease: "power2.in",
      });
      if (img) {
        gsap.to(img, {
          clipPath: "inset(100% 0 0 0)",
          duration: 0.3,
          ease: "power2.in",
        });
      }
    }

    return () => {
      tlRef.current?.kill();
    };
  }, [visible]);

  if (!artData) return null;

  const halfVh =
    activeHalfVh != null ? `${activeHalfVh}vh` : "15vh";
  const halfVw =
    activeHalfVw != null ? `${activeHalfVw}vw` : "20vw";

  const hasOriginal = !!artData.originalUrl;
  const hasAuthor = !!artData.authorName;
  const hasDescription = !!artData.description;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 3 }}
    >
      <div
        ref={textRef}
        className="absolute"
        style={{
          left: `calc(50% - ${halfVw})`,
          top: `calc(50% + ${halfVh} + 8px)`,
        }}
      >
        <p className="text-sm font-canal-light-romain text-foreground whitespace-nowrap">
          {artData.title}
          {hasAuthor && (
            <>
              {" "}
              by{" "}
              <span className="font-canal-demi-romain font-semibold">
                {artData.authorName}
              </span>
            </>
          )}
        </p>
        <p className="text-xs font-canal-light-romain text-foreground/60 mt-0.5">
          {fakeDuration(artData.id ?? 1)}
        </p>
        {hasDescription && (
          <p className="text-xs font-canal-light-romain text-foreground/80 mt-1 max-w-md">
            {artData.description}
          </p>
        )}
        <p className="text-[10px] font-canal-light-romain text-foreground/40 mt-1">
          Available more than 6 month
        </p>
      </div>

      {hasOriginal && (
        <div
          ref={imageRef}
          className="absolute"
          style={{
            left: `calc(50% + ${halfVw} + 16px)`,
            bottom: `calc(50% - ${halfVh})`,
            clipPath: "inset(100% 0 0 0)",
          }}
        >
          <img
            src={artData.originalUrl}
            alt={artData.title ?? ""}
            className="h-28 w-auto rounded-sm shadow-lg object-cover"
          />
        </div>
      )}
    </div>
  );
}
