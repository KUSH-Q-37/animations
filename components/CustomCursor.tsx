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

  useEffect(() => {
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

    const handleMouseLeave = () => setIsInside(false);
    const handleMouseEnter = () => setIsInside(true);

    // Passive listeners prevent scroll blocking
    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('mouseout', handleMouseOut, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY]);

  const size = isGame ? 32 : isDrag ? 15 : 12;

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