"use client";
import { useCallback, useEffect, useRef } from "react";

import { useRouter } from "next/navigation";
import Experience from "../Experience/Experience";

declare global {
  interface Window {
    experience: Experience | undefined;
  }
}

const ThreeJSExperience = () => {
  const canvasRef = useRef(null);
  const router = useRouter();

  const routerReplace = useCallback(
    (path: string) => {
      router.replace(path);
    },
    [router]
  );

  useEffect(() => {
    if (window.experience) {
      Experience.resetInstance();
    }

    let experience = null;

    if (canvasRef.current) {
      try {
        experience = new Experience(canvasRef.current, routerReplace);
      } catch (error) {
        console.error("Erreur lors de l'initialisation de Three.js:", error);
      }
    }

    return () => {
      if (experience) {
        experience.destroy();
      }
    };
  }, [routerReplace]);

  return (
    <>
      <div
        id="scrollContainer"
        style={{
          width: "100%",
          height: "100vh",
          position: "relative",
        }}
      >
        <canvas ref={canvasRef} className="sticky top-0 left-0" />
      </div>
    </>
  );
};

export default ThreeJSExperience;