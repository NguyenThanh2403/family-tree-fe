"use client";

import { useState, useEffect } from "react";
import { BREAKPOINTS } from "@/lib/constants";

/**
 * Hook to detect current window size and responsive breakpoint.
 * Platform-specific: Web only.
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    ...windowSize,
    isMobile: windowSize.width < BREAKPOINTS.MD,
    isTablet:
      windowSize.width >= BREAKPOINTS.MD && windowSize.width < BREAKPOINTS.LG,
    isDesktop: windowSize.width >= BREAKPOINTS.LG,
  };
}
