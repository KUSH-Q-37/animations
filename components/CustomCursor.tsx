'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

interface CustomCursorProps {
  isGame?: boolean;
  isDrag?: boolean;
}

export default function CustomCursor({ isGame = false, isDrag = false }: CustomCursorProps) {
  // 1. MotionValues bypass React state for zero-lag updates
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // 2. Hardware-accelerated springs
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const [isHovering, setIsHovering] = useState(false);
  const [isInside, setIsInside] = useState(true);
  // Starts true so the cursor never flashes on screen for mobile visitors
  // before the media query check below has a chance to run.
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  useEffect(() => {
    // Devices without a fine (mouse/trackpad) pointer never get the custom
    // cursor — there's no mouse position to track, and a stray dot stuck
    // wherever the last tap landed just looks broken.
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateIsTouchDevice = () => setIsTouchDevice(!mql.matches);
    updateIsTouchDevice();
    mql.addEventListener('change', updateIsTouchDevice);
    return () => mql.removeEventListener('change', updateIsTouchDevice);
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    const updateMousePosition = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON') setIsHovering(true);
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON') setIsHovering(false);
    };

    // `document`'s mouseleave/mouseenter fire the instant the pointer
    // crosses onto the scrollbar too — it's native browser chrome, not
    // part of the document's own hit-testing box, even though it's still
    // visually inside the window. That made the cursor vanish over the
    // scrollbar. Checking the pointer's coordinates against the actual
    // window bounds instead means it only hides when the pointer truly
    // leaves the viewport, and stays visible over the scrollbar gutter.
    const handleWindowMouseOut = (e: MouseEvent) => {
      if (
        e.clientY <= 0 ||
        e.clientX <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        setIsInside(false);
      }
    };
    const handleWindowMouseOver = () => setIsInside(true);

    // Passive listeners prevent scroll blocking
    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('mouseout', handleMouseOut, { passive: true });
    document.addEventListener('mouseout', handleWindowMouseOut);
    document.addEventListener('mouseover', handleWindowMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mouseout', handleWindowMouseOut);
      document.removeEventListener('mouseover', handleWindowMouseOver);
    };
  }, [cursorX, cursorY, isTouchDevice]);

  const size = isGame ? 32 : isDrag ? 15 : 12;

  if (isTouchDevice) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-9999 flex flex-col items-center justify-center"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        width: size,
        height: size,
        border: (isGame || isDrag) ? "none" : "1.5px solid #00ff33",
        backgroundColor: isDrag ? "#00ff33" : "rgba(0, 255, 51, 0)",
        opacity: isGame ? 0 : (isInside ? 1 : 0),
        scale: isHovering && !isDrag ? 2 : 1,
      }}
      transition={{ type: 'tween', duration: 0.15 }}
    >
      <AnimatePresence>
        {isDrag && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 22 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute text-[#00ff33] text-[10px] font-bold font-mono tracking-widest whitespace-nowrap"
          >
            DRAG
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}