"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Canvas,
  type CanvasProps,
} from "@react-three/fiber";

interface InViewCanvasProps
  extends CanvasProps {
  rootMargin?: string;

  onVisibilityChange?: (
    visible: boolean,
  ) => void;
}

/**
 * InViewCanvas
 *
 * IMPORTANT:
 *
 * The WebGL/R3F render loop intentionally stays alive.
 *
 * We do NOT use:
 *
 * frameloop={inView ? "always" : "never"}
 *
 * because interactive 3D games can become unstable
 * when the WebGL render loop is stopped and restarted
 * during page scrolling.
 *
 * Instead, the game receives visibility information
 * and pauses its own simulation.
 */
export default function InViewCanvas({
  children,
  rootMargin = "150px",
  onVisibilityChange,
  ...props
}: InViewCanvasProps) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const [inView, setInView] =
    useState(true);

  useEffect(() => {
    const element =
      containerRef.current;

    if (
      !element ||
      typeof IntersectionObserver ===
        "undefined"
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          const visible =
            entry.isIntersecting;

          setInView(visible);

          onVisibilityChange?.(
            visible,
          );
        },
        {
          rootMargin,
          threshold: 0.01,
        },
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    rootMargin,
    onVisibilityChange,
  ]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      data-in-view={inView}
    >
      <Canvas
        /**
         * DO NOT pause the R3F render loop.
         *
         * The game itself controls simulation updates.
         */
        frameloop="always"
        {...props}
      >
        {children}
      </Canvas>
    </div>
  );
}
