"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * MinimalCustomCursor - A single component custom cursor solution
 * 
 * Features:
 * - Minimal dot/ring design that follows cursor
 * - Changes appearance on hover and click
 * - Click effects for interactive feedback
 * - Handles mobile detection (disabled on mobile)
 * - All styles contained in the component
 */
const MinimalCustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [tracerPoints, setTracerPoints] = useState<{ id: number; x: number; y: number }[]>([]);
  const [nextId, setNextId] = useState(0);
  const [isMobile, setIsMobile] = useState(true); // Default to true until we check

  // Check if we're on desktop or mobile
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(mobileCheck);
      if (!mobileCheck) {
        // Only enable custom cursor on desktop
        document.body.style.cursor = "none";
        setIsVisible(true);
      }
    };

    checkDevice();

    return () => {
      // Restore default cursor on unmount
      document.body.style.cursor = "auto";
    };
  }, []);

  // Track cursor position and interactions
  useEffect(() => {
    if (isMobile) return; // Don't run on mobile

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Check if hovering over clickable elements
      const target = e.target as HTMLElement;
      const isClickable =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.onclick !== null ||
        target.closest("a") !== null ||
        target.closest("button") !== null ||
        window.getComputedStyle(target).cursor === "pointer";

      setIsHovered(isClickable);
    };

    const handleMouseDown = () => {
      setIsClicked(true);

      // Create a tracer effect on click
      const newPoint = {
        id: nextId,
        x: position.x,
        y: position.y
      };

      setTracerPoints(prev => [...prev, newPoint]);
      setNextId(prev => prev + 1);

      // Remove the tracer point after animation completes
      setTimeout(() => {
        setTracerPoints(prev => prev.filter(point => point.id !== newPoint.id));
      }, 800);
    };

    const handleMouseUp = () => setIsClicked(false);
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Cleanup event listeners
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isMobile, nextId, position.x, position.y]);

  // Don't render anything on mobile or when cursor is off-screen
  if (isMobile || !isVisible) return null;

  return (
    <>
      {/* CSS Styles */}
      <style jsx global>{`
        /* Hide default cursor on desktop */
        html, body, a, button, [role="button"], [type="button"], 
        [type="submit"], [type="reset"], input[type="checkbox"], 
        input[type="radio"], select, summary, .clickable {
          cursor: none !important;
        }
        
        /* Style for text inputs */
        input, textarea, [contenteditable="true"] {
          cursor: text !important;
        }
      `}</style>

      {/* Main cursor elements */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
        {/* Dot cursor */}
        <motion.div
          animate={{
            x: position.x - 4,
            y: position.y - 4,
            scale: isClicked ? 0.5 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 1000,
            damping: 40,
            mass: 0.1,
          }}
          style={{
            position: "fixed",
            width: "8px",
            height: "8px",
            backgroundColor: "white",
            borderRadius: "50%",
            mixBlendMode: "difference",
            pointerEvents: "none",
          }}
        />

        {/* Ring cursor */}
        <motion.div
          animate={{
            x: position.x - 16,
            y: position.y - 16,
            scale: isHovered ? 1.5 : 1,
            opacity: isHovered ? 0.8 : 0.4,
            borderWidth: isClicked ? "2px" : "1px",
          }}
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 20,
          }}
          style={{
            position: "fixed",
            width: "32px",
            height: "32px",
            border: "1px solid white",
            borderRadius: "50%",
            mixBlendMode: "difference",
            pointerEvents: "none",
          }}
        />

        {/* Click tracer effects */}
        <AnimatePresence>
          {tracerPoints.map(point => (
            <motion.div
              key={point.id}
              initial={{
                opacity: 0.7,
                scale: 0.3,
                x: point.x - 15,
                y: point.y - 15
              }}
              animate={{
                opacity: 0,
                scale: 1
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                position: "absolute",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                mixBlendMode: "difference",
                pointerEvents: "none",
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default MinimalCustomCursor;