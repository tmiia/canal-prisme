"use client";

import { useEffect, useRef, useState } from "react";

export default function CursorFollower() {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (spanRef.current) {
        spanRef.current.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 12}px) transition-all duration-300 ease-in-out`;
      }
    };

    const onPlaneHover = () => setIsHovering(true);
    const onPlaneHoverLeave = () => setIsHovering(false);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("planehover", onPlaneHover);
    window.addEventListener("planehoverleave", onPlaneHoverLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("planehover", onPlaneHover);
      window.removeEventListener("planehoverleave", onPlaneHoverLeave);
    };
  }, []);

  return (
    <span
      ref={spanRef}
      className="fixed top-0 left-0 pointer-events-none bg-black text-white text-xs p-1 px-1.5 z-50 font-canal-light-italic hidden md:block"
    >
      {isHovering ? "[ Click ]" : "[ Scroll ]"}
    </span>
  );
}
