"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";

interface CustomCursorProps {
  isGame?: boolean;
  isDrag?: boolean;
}

export default function CustomCursor({
  isGame = false,
  isDrag = false,
}: CustomCursorProps) {
  /* =========================================================
     CURSOR POSITION
     ========================================================= */

  // MotionValues bypass React state for zero-lag updates
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Hardware-accelerated springs
  const springConfig = {
    damping: 25,
    stiffness: 300,
    mass: 0.5,
  };

  const cursorXSpring = useSpring(
    cursorX,
    springConfig,
  );

  const cursorYSpring = useSpring(
    cursorY,
    springConfig,
  );

  /* =========================================================
     STATE
     ========================================================= */

  const [isHovering, setIsHovering] =
    useState(false);

  const [isInside, setIsInside] =
    useState(true);

  // Starts true so the cursor never flashes
  // before the media query check runs.
  const [isTouchDevice, setIsTouchDevice] =
    useState(true);

  /* =========================================================
     RESET HOVER STATE
     ========================================================= */

  /*
   * IMPORTANT:
   *
   * When PLAY AGAIN is clicked, the GAME OVER button
   * disappears and React replaces the game state.
   *
   * The mouse may still be physically sitting where
   * the button was, so the browser does not necessarily
   * fire another mouseout event.
   *
   * Resetting isHovering whenever the cursor mode changes
   * prevents the cursor from remaining at scale(2).
   */

  useEffect(() => {
    setIsHovering(false);
  }, [isGame, isDrag]);

  /* =========================================================
     TOUCH / MOUSE DEVICE DETECTION
     ========================================================= */

  useEffect(() => {
    const mql = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );

    const updateIsTouchDevice = () => {
      setIsTouchDevice(!mql.matches);
    };

    updateIsTouchDevice();

    mql.addEventListener(
      "change",
      updateIsTouchDevice,
    );

    return () => {
      mql.removeEventListener(
        "change",
        updateIsTouchDevice,
      );
    };
  }, []);

  /* =========================================================
     MOUSE TRACKING
     ========================================================= */

  useEffect(() => {
    if (isTouchDevice) return;

    /* -------------------------------------------------------
       POSITION
       ------------------------------------------------------- */

    const updateMousePosition = (
      e: MouseEvent,
    ) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    /* -------------------------------------------------------
       INTERACTIVE ELEMENT HOVER
       ------------------------------------------------------- */

    const handleMouseOver = (
      e: MouseEvent,
    ) => {
      const target =
        e.target as HTMLElement;

      /*
       * closest() is more reliable than checking
       * target.tagName directly.
       *
       * This also handles elements nested inside
       * buttons and links.
       */

      const interactive =
        target.closest(
          "a, button, [role='button']",
        );

      setIsHovering(
        !!interactive,
      );
    };

    const handleMouseOut = (
      e: MouseEvent,
    ) => {
      const target =
        e.target as HTMLElement;

      const relatedTarget =
        e.relatedTarget as
          | HTMLElement
          | null;

      const interactive =
        target.closest(
          "a, button, [role='button']",
        );

      /*
       * If we're not leaving an interactive
       * element, make sure hover is reset.
       */

      if (!interactive) {
        setIsHovering(false);
        return;
      }

      /*
       * Moving between children inside the same
       * button/link should NOT remove hover state.
       */

      if (
        relatedTarget &&
        interactive.contains(
          relatedTarget,
        )
      ) {
        return;
      }

      setIsHovering(false);
    };

    /* -------------------------------------------------------
       WINDOW BOUNDARY
       ------------------------------------------------------- */

    /*
     * document mouseleave/mouseenter can fire when
     * crossing the scrollbar.
     *
     * Checking the actual pointer coordinates keeps
     * the custom cursor visible over the scrollbar.
     */

    const handleWindowMouseOut = (
      e: MouseEvent,
    ) => {
      if (
        e.clientY <= 0 ||
        e.clientX <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        setIsInside(false);
      }
    };

    const handleWindowMouseOver = () => {
      setIsInside(true);
    };

    /* =====================================================
       EVENT LISTENERS
       ===================================================== */

    window.addEventListener(
      "mousemove",
      updateMousePosition,
      {
        passive: true,
      },
    );

    /*
     * pointerover / pointerout are more reliable
     * for dynamic React elements than mouseover/mouseout.
     */

    window.addEventListener(
      "pointerover",
      handleMouseOver,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "pointerout",
      handleMouseOut,
      {
        passive: true,
      },
    );

    document.addEventListener(
      "mouseout",
      handleWindowMouseOut,
    );

    document.addEventListener(
      "mouseover",
      handleWindowMouseOver,
    );

    /* =====================================================
       CLEANUP
       ===================================================== */

    return () => {
      window.removeEventListener(
        "mousemove",
        updateMousePosition,
      );

      window.removeEventListener(
        "pointerover",
        handleMouseOver,
      );

      window.removeEventListener(
        "pointerout",
        handleMouseOut,
      );

      document.removeEventListener(
        "mouseout",
        handleWindowMouseOut,
      );

      document.removeEventListener(
        "mouseover",
        handleWindowMouseOver,
      );
    };
  }, [
    cursorX,
    cursorY,
    isTouchDevice,
  ]);

  /* =========================================================
     CURSOR SIZE
     ========================================================= */

  const size = isGame
    ? 32
    : isDrag
      ? 15
      : 12;

  /* =========================================================
     MOBILE / TOUCH
     ========================================================= */

  if (isTouchDevice) {
    return null;
  }

  /* =========================================================
     CURSOR
     ========================================================= */

  return (
    <motion.div
      className="
        fixed
        top-0
        left-0
        rounded-full
        pointer-events-none
        z-9999
        flex
        flex-col
        items-center
        justify-center
      "
      style={{
        x: cursorXSpring,
        y: cursorYSpring,

        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        /* ---------------------------------------------------
           SIZE
           --------------------------------------------------- */

        width: size,
        height: size,

        /* ---------------------------------------------------
           BORDER
           --------------------------------------------------- */

        border:
          isGame || isDrag
            ? "none"
            : "1.5px solid #00ff33",

        /* ---------------------------------------------------
           BACKGROUND
           --------------------------------------------------- */

        backgroundColor: isDrag
          ? "#00ff33"
          : "rgba(0, 255, 51, 0)",

        /* ---------------------------------------------------
           OPACITY
           --------------------------------------------------- */

        opacity: isGame
          ? 0
          : isInside
            ? 1
            : 0,

        /* ---------------------------------------------------
           HOVER SCALE
           --------------------------------------------------- */

        /*
         * IMPORTANT:
         *
         * isGame is explicitly included here.
         *
         * Even if isHovering somehow remains true while
         * the game transitions, the cursor cannot become
         * enlarged while the game cursor mode is active.
         */

        scale:
          isHovering &&
          !isDrag &&
          !isGame
            ? 2
            : 1,
      }}
      transition={{
        type: "tween",
        duration: 0.15,
      }}
    >
      {/* ===================================================
          DRAG LABEL
          =================================================== */}

      <AnimatePresence>
        {isDrag && (
          <motion.div
            initial={{
              opacity: 0,
              y: 5,
            }}
            animate={{
              opacity: 1,
              y: 22,
            }}
            exit={{
              opacity: 0,
              y: 5,
            }}
            className="
              absolute
              text-[#00ff33]
              text-[10px]
              font-bold
              font-mono
              tracking-widest
              whitespace-nowrap
            "
          >
            DRAG
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
