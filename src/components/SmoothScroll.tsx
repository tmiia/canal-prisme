"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const onFocus = () => lenis.stop();
    const onUnfocus = () => lenis.start();

    let pauseTimer: ReturnType<typeof setTimeout>;
    const onSceneChange = (e: Event) => {
      const { scene } = (e as CustomEvent).detail;
      if (scene === "list") {
        lenis.stop();
        pauseTimer = setTimeout(() => lenis.start(), 600);
      }
    };

    window.addEventListener("planefocus", onFocus);
    window.addEventListener("planeunfocus", onUnfocus);
    window.addEventListener("scenechange", onSceneChange);

    return () => {
      clearTimeout(pauseTimer);
      window.removeEventListener("planefocus", onFocus);
      window.removeEventListener("planeunfocus", onUnfocus);
      window.removeEventListener("scenechange", onSceneChange);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
