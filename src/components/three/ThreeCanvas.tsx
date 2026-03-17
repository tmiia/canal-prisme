"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

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
  const [currentScene, setCurrentScene] = useState("default");

  const routerReplace = useCallback(
    (path: string) => {
      router.replace(path);
    },
    [router]
  );

  useEffect(() => {
    const onSceneChange = (e: CustomEvent<{ scene: string }>) => {
      setCurrentScene(e.detail.scene);
    };
    window.addEventListener("scenechange", onSceneChange as EventListener);
    return () => {
      window.removeEventListener(
        "scenechange",
        onSceneChange as EventListener
      );
    };
  }, []);

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
        className="fixed inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-700"
        style={{
          zIndex: 0,
          opacity: currentScene === "list" ? 0.1 : 1,
        }}
      >
        <Image
          src="/logos/prisme_logo.svg"
          alt="Prisme logo"
          width={200}
          height={200}
          priority
          className="object-contain"
        />
      </div>
      <div
        id="scrollContainer"
        style={{
          width: "100%",
          height: "100vh",
          position: "fixed",
          zIndex: 1,
        }}
      >
        <canvas ref={canvasRef} className="sticky top-0 left-0" />
      </div>
    </>
  );
};

export default ThreeJSExperience;
