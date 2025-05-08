"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

const CustomCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // Motion values for cursor position
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Spring animations for smoother following
  const springConfig = { damping: 25, stiffness: 200 };
  const trailingX = useSpring(cursorX, springConfig);
  const trailingY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Show cursor when mouse moves
    const handleMouseMove = (e: { clientX: number; clientY: number; }) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      if (!isVisible) {
        setIsVisible(true);
      }
    };
    
    // Handle mouse down/up events for click animations
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    
    // Handle hover states for interactive elements
    const handleMouseOver = (e: { target: any; }) => {
      const target = e.target;
      if (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.tagName.toLowerCase() === "input" ||
        target.tagName.toLowerCase() === "select" ||
        target.tagName.toLowerCase() === "textarea" ||
        target.closest("[role='button']") ||
        target.closest(".clickable")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };
    
    // Hide cursor when it leaves the window
    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseleave", handleMouseLeave);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible, cursorX, cursorY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Main cursor dot */}
          <motion.div
            className="fixed pointer-events-none z-[100] mix-blend-difference"
            style={{
              x: cursorX,
              y: cursorY,
              translateX: "-50%",
              translateY: "-50%",
            }}
            animate={{
              width: isClicking ? 8 : isHovering ? 0 : 8,
              height: isClicking ? 8 : isHovering ? 0 : 8,
              opacity: 1
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="w-full h-full rounded-full bg-white" />
          </motion.div>
          
          {/* Trailing ring effect */}
          <motion.div
            className="fixed pointer-events-none z-[99] mix-blend-difference"
            style={{
              x: trailingX,
              y: trailingY,
              translateX: "-50%",
              translateY: "-50%",
            }}
            animate={{
              width: isClicking ? 16 : isHovering ? 64 : 24,
              height: isClicking ? 16 : isHovering ? 64 : 24,
              opacity: isHovering ? 0.8 : 0.5,
              borderWidth: isHovering ? "1px" : "1px"
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-full h-full rounded-full border border-white" />
          </motion.div>
          
          {/* Hover indicator that appears on interactive elements */}
          {isHovering && (
            <motion.div
              className="fixed pointer-events-none z-[98] mix-blend-difference"
              style={{
                x: cursorX,
                y: cursorY,
                translateX: "-50%",
                translateY: "-50%",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 0.15,
                scale: 1,
                width: 80,
                height: 80
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full h-full rounded-full bg-white" />
            </motion.div>
          )}
          
          {/* Click ripple effect */}
          {isClicking && (
            <motion.div
              className="fixed pointer-events-none z-[97] mix-blend-difference"
              style={{
                x: cursorX,
                y: cursorY,
                translateX: "-50%",
                translateY: "-50%",
              }}
              initial={{ opacity: 0.5, scale: 0 }}
              animate={{ opacity: 0, scale: 2 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 rounded-full border border-white" />
            </motion.div>
          )}
        </>
      )}
      
      {/* Global style to hide default cursor */}
      <style jsx global>{`
        body, a, button, input, select, textarea, [role="button"], .clickable {
          cursor: none !important;
        }
      `}</style>
    </AnimatePresence>
  );
};

export default CustomCursor;
