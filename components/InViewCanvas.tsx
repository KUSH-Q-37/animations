"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";

/**
 * Drop-in replacement for R3F's <Canvas> that pauses its render loop
 * (frameloop="never") whenever it's scrolled off-screen. Three.js keeps
 * showing the last painted frame, so nothing visually changes — the
 * animation just stops burning CPU/GPU while nobody can see it, and
 * resumes the instant it's back in the viewport.
 */
export default function InViewCanvas({
  children,
  rootMargin = "150px",
  ...props
}: CanvasProps & { rootMargin?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Canvas frameloop={inView ? "always" : "never"} {...props}>
        {children}
      </Canvas>
    </div>
  );
}
