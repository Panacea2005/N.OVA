"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import LoadingScreen from "@/components/loading-screen";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Link from "next/link";
import { usePhantom } from "@/hooks/use-phantom";
import { ConnectWalletButton } from "@/components/ui/connect-wallet-button";

// Dynamically import components to reduce initial load time
const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

const Footer = dynamic(() => import("@/components/footer"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

const ParticleBackground = dynamic(
  () => import("@/components/3d/particle-background"),
  {
    ssr: false,
  }
);

const ScrollProgress = dynamic(
  () => import("@/components/ui/scroll-progress"),
  {
    ssr: false,
  }
);

// Dynamically import 3D models
const ParticleRing = dynamic(() => import("@/components/3d/particle-ring"), {
  ssr: false,
});

const HolographicSphere = dynamic(
  () => import("@/components/3d/holographic-sphere"),
  {
    ssr: false,
  }
);

const TechnologySection = dynamic(
  () => import("@/components/sections/technology-section"),
  {
    ssr: false,
  }
);

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading assets
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    setMounted(true);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen bg-black text-white font-mono">
      {/* Loading Screen */}
      <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>

      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-purple-950 opacity-80 z-0" />

      {/* Particle Background */}
      <ParticleBackground />

      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="relative z-10" ref={containerRef}>
        {/* Enhanced Hero Section */}
        <section className="min-h-screen flex flex-col justify-center relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 z-0">
            {/* Animated grid background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(138, 75, 255, 0.15) 1px, transparent 1px), linear-gradient(to right, rgba(138, 75, 255, 0.05) 1px, transparent 1px)",
                backgroundSize: "40px 40px, 40px 40px",
                backgroundPosition: "0 0, 0 0",
              }}
            />

            {/* Animated scan lines */}
            <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <motion.div
                    key={`scan-${i}`}
                    className="absolute w-full h-[1px] bg-purple-400/30"
                    style={{ top: `${i * 10}%` }}
                    animate={{
                      opacity: [0.2, 0.5, 0.2],
                      scaleY: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: 2 + (i % 3),
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  />
                ))}
            </div>

            {/* Animated particles */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              {Array(20)
                .fill(0)
                .map((_, i) => (
                  <motion.div
                    key={`particle-${i}`}
                    className="absolute w-[1px] h-[1px] bg-purple-300 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0, 0.8, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
            </div>
          </div>

          {/* 3D Sphere in center */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <Suspense fallback={null}>
                <HolographicSphere />
                <Environment preset="night" />
              </Suspense>
            </Canvas>
          </div>

          {/* Split text layout - left and right of sphere */}
          <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full items-center">
              {/* Left side - "ON" */}
              <div className="text-right lg:pr-16 hidden lg:block">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="relative inline-block"
                >
                  <span className="text-[7rem] xl:text-[10rem] font-bold tracking-tighter text-white leading-none">
                    YOUR
                  </span>
                  <motion.div
                    className="absolute bottom-0 right-0 w-[80%] h-[2px]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 1.3 }}
                    style={{
                      background:
                        "linear-gradient(to right, transparent, rgba(138, 75, 255, 0.7))",
                      transformOrigin: "right",
                    }}
                  />
                </motion.div>
              </div>

              {/* Right side - "CHAIN AI" */}
              <div className="text-left lg:pl-16 hidden lg:block">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="relative inline-block"
                >
                  <span className="text-[7rem] xl:text-[10rem] font-bold tracking-tighter text-white leading-none">
                    ONCHAIN AI
                  </span>
                  <motion.div
                    className="absolute bottom-0 left-0 w-[80%] h-[2px]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 1.3 }}
                    style={{
                      background:
                        "linear-gradient(to left, transparent, rgba(138, 75, 255, 0.7))",
                      transformOrigin: "left",
                    }}
                  />
                </motion.div>
              </div>

              {/* Mobile version - stacked layout */}
              <div className="lg:hidden text-center col-span-1 relative">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="mb-24 pt-16" // Space for sphere above
                >
                  <motion.h1
                    className="text-[5rem] sm:text-[6.5rem] font-bold tracking-tighter leading-none"
                    animate={{
                      textShadow: [
                        "0 0 5px rgba(138, 75, 255, 0.5)",
                        "0 0 10px rgba(138, 75, 255, 0.3)",
                        "0 0 5px rgba(138, 75, 255, 0.5)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    ONCHAIN
                  </motion.h1>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="mt-24" // Space for sphere below
                >
                  <motion.h1
                    className="text-[5rem] sm:text-[6.5rem] font-bold tracking-tighter leading-none"
                    animate={{
                      textShadow: [
                        "0 0 5px rgba(138, 75, 255, 0.5)",
                        "0 0 10px rgba(138, 75, 255, 0.3)",
                        "0 0 5px rgba(138, 75, 255, 0.5)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                  >
                    AI
                  </motion.h1>
                </motion.div>
              </div>
            </div>

            {/* Futuristic code-like elements */}
            <motion.div
              className="absolute top-[20%] left-[5%] z-20 hidden lg:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 1, delay: 1.5 }}
            >
              <div className="font-mono text-xs text-purple-300/70">
                <div>// instance.init()</div>
                <div>// quantum.sequence [active]</div>
                <div>
                  // <span className="text-blue-300/70">protocol</span>:
                  sovereign
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-[20%] right-[5%] z-20 hidden lg:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 1, delay: 1.8 }}
            >
              <div className="font-mono text-xs text-purple-300/70 text-right">
                <div>
                  // <span className="text-green-300/70">status</span>: online
                </div>
                <div>// shard.connect [neural:9230]</div>
                <div>// ai.sovereign = true</div>
              </div>
            </motion.div>
          </div>

          {/* Animated subtitle with glitch effect */}
          <motion.div
            className="absolute top-[5%] left-0 right-0 text-center z-20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="inline-block relative px-6 py-2">
              <span className="text-xs sm:text-sm tracking-[0.2em] text-white/80 font-light">
                NEXT GENERATION SOVEREIGN AI SYSTEM
              </span>
              <div className="absolute bottom-0 left-1/2 w-[40px] h-[1px] -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            </div>
          </motion.div>

          {/* Enhanced footer indicators */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-4 backdrop-blur-sm z-20">
            <div className="container mx-auto px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              <motion.div
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 2 }}
              >
                <div className="w-7 h-[2px] bg-gradient-to-r from-purple-500/40 to-transparent mr-2"></div>
                <span className="text-xs text-white/60 mr-3 font-mono">
                  00:1
                </span>
                <span className="text-xs text-white/60 mr-3 font-mono">
                  N.OVA
                </span>
                <div className="w-2 h-2 rounded-full bg-purple-500/40 mr-3 animate-pulse"></div>
                <span className="text-xs text-white/60 font-mono">
                  SOVEREIGN SUPER AI
                </span>
              </motion.div>

              <motion.div
                className="flex items-center"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 2.2 }}
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-white/60 text-xs">N.OVA</span>
                  <motion.div
                    className="w-10 h-[1px] bg-white/20"
                    animate={{
                      width: ["10px", "40px", "10px"],
                      backgroundColor: [
                        "rgba(255,255,255,0.2)",
                        "rgba(168,85,247,0.4)",
                        "rgba(255,255,255,0.2)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  ></motion.div>
                  <span className="font-mono text-white/60 text-xs">
                    SOVEREIGN SUPER AI
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Additional corner decorations */}
          <div className="absolute top-0 left-0 w-[50px] h-[50px] border-l border-t border-white/10 z-20"></div>
          <div className="absolute top-0 right-0 w-[50px] h-[50px] border-r border-t border-white/10 z-20"></div>
          <div className="absolute bottom-0 left-0 w-[50px] h-[50px] border-l border-b border-white/10 z-20"></div>
          <div className="absolute bottom-0 right-0 w-[50px] h-[50px] border-r border-b border-white/10 z-20"></div>
        </section>

        {/* Enhanced Mission Section */}
        {/* Enhanced Mission Section with Futuristic Icons */}
        <section
          id="mission"
          className="min-h-screen flex flex-col justify-center relative border-t border-white/10 overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
            {/* Animated grid pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            ></div>

            {/* Subtle radial gradient overlay */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(139, 92, 246, 0.2) 0%, rgba(0, 0, 0, 0) 70%)",
              }}
            ></div>

            {/* Animated horizontal light beams */}
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <motion.div
                  key={`beam-${i}`}
                  className="absolute h-[1px] left-0 right-0 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
                  style={{ top: `${15 + i * 25}%` }}
                  animate={{
                    x: ["-100%", "100%"],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 8 + i * 4,
                    repeat: Infinity,
                    delay: i * 2,
                    ease: "linear",
                  }}
                />
              ))}
          </div>

          {/* 3D Particle Ring */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <Suspense fallback={null}>
                <ParticleRing />
                <Environment preset="night" />
              </Suspense>
            </Canvas>
          </div>

          {/* Floating Elements */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Subtle floating particles */}
            {Array(30)
              .fill(0)
              .map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: i % 5 === 0 ? "3px" : "1px",
                    height: i % 5 === 0 ? "3px" : "1px",
                    backgroundColor:
                      i % 7 === 0
                        ? "rgba(139, 92, 246, 0.8)"
                        : "rgba(255, 255, 255, 0.5)",
                    boxShadow:
                      i % 7 === 0 ? "0 0 3px rgba(139, 92, 246, 0.8)" : "none",
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -Math.random() * 50 - 20],
                    opacity: [0, Math.random() * 0.7 + 0.3, 0],
                  }}
                  transition={{
                    duration: Math.random() * 5 + 5,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                  }}
                />
              ))}
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-4 md:px-6 py-20 relative z-20">
            <div className="flex flex-col items-center">
              {/* Decorative element above title */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "120px" }}
                transition={{ duration: 1, ease: "easeOut" }}
                viewport={{ once: true }}
                className="h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-12"
              />

              {/* Enhanced Title with Staggered Animation */}
              <div className="overflow-hidden mb-12">
                <motion.div
                  initial={{ y: 100 }}
                  whileInView={{ y: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="block text-lg md:text-xl uppercase tracking-widest text-purple-400 font-light mb-4"
                  >
                    Defining Our Purpose
                  </motion.span>

                  <h2 className="text-[4rem] md:text-[6rem] lg:text-[8rem] font-bold tracking-tighter leading-none text-center">
                    <motion.span
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.4 }}
                      viewport={{ once: true }}
                      className="block bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/70 pb-2"
                    >
                      OUR OBJECTIVE:
                    </motion.span>

                    <motion.span
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.6 }}
                      viewport={{ once: true }}
                      className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-blue-300 to-purple-300"
                    >
                      EMPOWER HUMANITY
                    </motion.span>
                  </h2>
                </motion.div>
              </div>

              {/* Enhanced Description with Background */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                viewport={{ once: true }}
                className="relative max-w-3xl"
              >
                {/* Glowing background for text */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-blue-900/10 to-purple-900/10 rounded-lg blur-xl transform scale-110 -z-10"></div>

                <p className="text-xl md:text-2xl text-white/80 text-center px-8 py-6 leading-relaxed">
                  N.OVA exists to create a future where super intelligence
                  serves humanity, not controls it. We are building the
                  foundations of a
                  <span className="text-purple-300">
                    {" "}
                    sovereign AI ecosystem{" "}
                  </span>
                  that ensures human values and freedoms remain at the core of
                  technological progress.
                </p>

                <motion.div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
                  initial={{ width: "0%", opacity: 0 }}
                  whileInView={{ width: "50%", opacity: 1 }}
                  transition={{ duration: 1, delay: 1.2 }}
                  viewport={{ once: true }}
                />
              </motion.div>

              {/* Mission Points with Futuristic SVG Icons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
                {[
                  {
                    icon: (
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mb-4"
                      >
                        <rect
                          x="14"
                          y="24"
                          width="20"
                          height="14"
                          rx="2"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M16 24V18C16 13.5817 19.5817 10 24 10C28.4183 10 32 13.5817 32 18V24"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx="24"
                          cy="31"
                          r="3"
                          fill="#4C1D95"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M24 31V35"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <rect
                          x="4"
                          y="10"
                          width="40"
                          height="28"
                          rx="4"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                          strokeOpacity="0.5"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="16"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                          strokeOpacity="0.3"
                        />
                      </svg>
                    ),
                    title: "Sovereignty",
                    description:
                      "Building AI with human freedom as the primary directive",
                    delay: 0.9,
                  },
                  {
                    icon: (
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mb-4"
                      >
                        <circle
                          cx="24"
                          cy="24"
                          r="14"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                          strokeOpacity="0.5"
                        />
                        <path
                          d="M24 10V38"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                          strokeOpacity="0.5"
                        />
                        <path
                          d="M38 24H10"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                          strokeOpacity="0.5"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="4"
                          fill="#4C1D95"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx="24"
                          cy="16"
                          r="2"
                          fill="#4C1D95"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx="24"
                          cy="32"
                          r="2"
                          fill="#4C1D95"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx="16"
                          cy="24"
                          r="2"
                          fill="#4C1D95"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx="32"
                          cy="24"
                          r="2"
                          fill="#4C1D95"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M26 18L26.9 17.1C27.3 16.7 27.9 16.7 28.3 17.1L30.9 19.7C31.3 20.1 31.3 20.7 30.9 21.1L30 22"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M26 30L26.9 30.9C27.3 31.3 27.9 31.3 28.3 30.9L30.9 28.3C31.3 27.9 31.3 27.3 30.9 26.9L30 26"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M18 18L17.1 17.1C16.7 16.7 16.1 16.7 15.7 17.1L13.1 19.7C12.7 20.1 12.7 20.7 13.1 21.1L14 22"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M18 30L17.1 30.9C16.7 31.3 16.1 31.3 15.7 30.9L13.1 28.3C12.7 27.9 12.7 27.3 13.1 26.9L14 26"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                        />
                      </svg>
                    ),
                    title: "Decentralization",
                    description:
                      "Ensuring no single entity can control the future of intelligence",
                    delay: 1.1,
                  },
                  {
                    icon: (
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mb-4"
                      >
                        <path
                          d="M24 16V32"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M16 24H32"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="14"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                          strokeOpacity="0.5"
                        />
                        <path
                          d="M34 14L14 34"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeOpacity="0.5"
                        />
                        <path
                          d="M14 14L34 34"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeOpacity="0.5"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="6"
                          fill="#4C1D95"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M36 24C36 30.6274 30.6274 36 24 36C17.3726 36 12 30.6274 12 24C12 17.3726 17.3726 12 24 12C30.6274 12 36 17.3726 36 24Z"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                          strokeDasharray="1 3"
                        />
                        <path
                          d="M24 4V8"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M24 40V44"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M44 24H40"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M8 24H4"
                          stroke="#A78BFA"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <circle cx="24" cy="8" r="1" fill="#A78BFA" />
                        <circle cx="24" cy="40" r="1" fill="#A78BFA" />
                        <circle cx="8" cy="24" r="1" fill="#A78BFA" />
                        <circle cx="40" cy="24" r="1" fill="#A78BFA" />
                      </svg>
                    ),
                    title: "Empowerment",
                    description:
                      "Creating tools that enhance human creativity and capability",
                    delay: 1.3,
                  },
                ].map((point, index) => (
                  <motion.div
                    key={`point-${index}`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: point.delay }}
                    viewport={{ once: true }}
                    className="relative bg-black/30 backdrop-blur-sm border border-white/5 rounded-lg p-6 group hover:border-purple-500/30 transition-colors duration-300"
                  >
                    {/* Decorative corner elements */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>

                    {/* Icon */}
                    <div className="mb-4 flex justify-center items-center">
                      <motion.div
                        animate={{
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        {point.icon}
                      </motion.div>
                    </div>

                    <h3 className="text-xl font-semibold mb-2 text-purple-300 text-center">
                      {point.title}
                    </h3>
                    <p className="text-white/70 text-center">
                      {point.description}
                    </p>

                    {/* Subtle glow effect on hover */}
                    <motion.div
                      className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                      style={{
                        background:
                          "radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Call to Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.5 }}
                viewport={{ once: true }}
                className="mt-16"
              >
                <button className="relative bg-black/40 backdrop-blur-sm border border-purple-500/50 px-8 py-3 rounded-sm group overflow-hidden">
                  <span className="relative z-10 font-medium tracking-wide">
                    JOIN OUR MISSION
                  </span>

                  {/* Button hover animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Animated scan line */}
                  <motion.div
                    className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100"
                    animate={{
                      background: [
                        "linear-gradient(to right, transparent, rgba(139, 92, 246, 0.5) 50%, transparent 100%)",
                        "linear-gradient(to right, transparent, rgba(139, 92, 246, 0) 50%, transparent 100%)",
                      ],
                    }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </button>
              </motion.div>
            </div>
          </div>

          {/* Enhanced Footer Bar */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-4 backdrop-blur-sm z-30">
            <div className="container mx-auto px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              <motion.div
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="w-7 h-[1px] bg-gradient-to-r from-purple-500/40 to-transparent mr-3"></div>
                <span className="text-xs font-mono text-white/60 mr-3">
                  00:2
                </span>
                <span className="text-xs font-mono text-white/60 uppercase tracking-wider">
                  Mission Overview
                </span>
              </motion.div>

              <motion.div
                className="flex items-center"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-white/60 text-xs flex items-center">
                    <span className="w-1 h-1 rounded-full bg-purple-500 mr-2"></span>
                    <span>N.OVA —</span>
                  </span>
                  <span className="font-mono text-white/60 text-xs uppercase tracking-wider">
                    More Than Just An AI
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-16 h-16 border-l border-t border-white/10 z-20"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-r border-t border-white/10 z-20"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-l border-b border-white/10 z-20"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-r border-b border-white/10 z-20"></div>
        </section>

        {/* Technology Section */}
        <TechnologySection />

        {/* Ecosystem Section */}
        {/* Enhanced Ecosystem Section */}
<section
  id="ecosystem"
  className="min-h-screen flex flex-col justify-center relative border-t border-white/10 overflow-hidden"
>
  {/* Minimal background elements */}
  <div className="absolute inset-0 z-0">
    {/* Grid pattern */}
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />

    {/* Subtle radial gradient overlay */}
    <div
      className="absolute inset-0 opacity-20"
      style={{
        background:
          "radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 70%)",
      }}
    />

    {/* Minimal scan lines */}
    {Array(3)
      .fill(0)
      .map((_, i) => (
        <motion.div
          key={`scan-${i}`}
          className="absolute w-full h-[1px] bg-white/10"
          style={{ top: `${(i + 1) * 25}%` }}
          animate={{
            opacity: [0.05, 0.1, 0.05],
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 15 + (i % 3),
            repeat: Infinity,
            delay: i * 2,
          }}
        />
      ))}
  </div>

  <div className="container mx-auto px-4 md:px-6 py-20 relative z-10">
    <div className="flex flex-col items-center mb-16">
      {/* Minimalist header */}
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-white/60 mb-4">
          N.OVA Ecosystem
        </div>
        <h2 className="text-7xl font-light mb-6 text-center">
          OUR PRODUCTS
        </h2>
        <div className="w-16 h-px bg-white/20 mx-auto"></div>
      </div>

      <p className="text-lg text-white/70 max-w-2xl text-center">
        Explore the complete suite of N.OVA technologies powering the next generation 
        of decentralized artificial intelligence.
      </p>
    </div>

    {/* Interactive Products Grid - More flexible layout with 3 columns on larger screens */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {/* N.TOKENOMICS Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        viewport={{ once: true }}
        className="relative border border-white/10 p-6 group hover:border-white/30 transition-all duration-300 flex flex-col h-full"
      >
        {/* Dotted arch figure */}
        <div className="relative h-40 mb-6 overflow-hidden">
          <svg 
            className="absolute inset-0 w-full"
            viewBox="0 0 200 160" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 150C138.66 150 170 118.66 170 80C170 41.34 138.66 10 100 10C61.34 10 30 41.34 30 80C30 118.66 61.34 150 100 150Z"
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="1"
              strokeDasharray="2 2"
              fill="none"
            />
            <path
              d="M100 130C127.614 130 150 107.614 150 80C150 52.386 127.614 30 100 30C72.386 30 50 52.386 50 80C50 107.614 72.386 130 100 130Z"
              stroke="white"
              strokeOpacity="0.3"
              strokeWidth="1"
              strokeDasharray="2 2"
              fill="none"
            />
            <circle cx="100" cy="80" r="15" fill="#FFFFFF" fillOpacity="0.03" stroke="white" strokeOpacity="0.3" />
            <circle cx="100" cy="80" r="5" fill="#FFFFFF" fillOpacity="0.2" />
            {/* Animated dots along the path */}
            <motion.circle 
              cx="100" 
              cy="10" 
              r="2" 
              fill="white"
              animate={{
                cx: [100, 170, 100, 30, 100],
                cy: [10, 80, 150, 80, 10],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.circle 
              cx="140" 
              cy="35" 
              r="2" 
              fill="white"
              animate={{
                cx: [140, 140, 100, 60, 60, 100, 140],
                cy: [35, 125, 150, 125, 35, 10, 35],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear",
                delay: 2
              }}
            />
            {/* Dollar sign */}
            <text x="95" y="85" fill="white" fontSize="14">$</text>
          </svg>
        </div>

        {/* Content */}
        <div className="flex items-center mb-3">
          <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center mr-3 group-hover:border-white/40 transition-colors">
            <span className="text-xs text-white/70">$</span>
          </div>
          <h3 className="text-xl font-light text-white/90">
            N.TOKENOMICS
          </h3>
        </div>

        <p className="text-white/60 mb-6 flex-grow text-sm">
          The economic foundation of our ecosystem with innovative token mechanics providing 
          incentives for contributors, validators, and users of the network.
        </p>

        <div className="flex items-center mt-auto">
          <div className="w-1 h-1 rounded-full bg-white animate-pulse mr-2"></div>
          <div className="text-xs text-white/50 uppercase">
            ACTIVE
          </div>
        </div>

        {/* Interactive overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 backdrop-blur-sm transition-all duration-300">
          <button className="px-4 py-2 border border-white/20 text-white/90 text-sm hover:bg-white/10 transition-colors">
            EXPLORE
          </button>
        </div>
      </motion.div>

      {/* N.AI Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
        className="relative border border-white/10 p-6 group hover:border-white/30 transition-all duration-300 flex flex-col h-full"
      >
        {/* Dotted arch figure - brain network */}
        <div className="relative h-40 mb-6 overflow-hidden">
          <svg 
            className="absolute inset-0 w-full"
            viewBox="0 0 200 160" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="80" r="50" stroke="white" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 2" fill="none" />
            <circle cx="100" cy="80" r="35" stroke="white" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="2 2" fill="none" />
            
            {/* Neural network nodes */}
            <circle cx="100" cy="80" r="4" fill="#FFFFFF" fillOpacity="0.2" />
            <circle cx="70" cy="60" r="3" fill="#FFFFFF" fillOpacity="0.1" />
            <circle cx="130" cy="60" r="3" fill="#FFFFFF" fillOpacity="0.1" />
            <circle cx="80" cy="110" r="3" fill="#FFFFFF" fillOpacity="0.1" />
            <circle cx="120" cy="110" r="3" fill="#FFFFFF" fillOpacity="0.1" />
            <circle cx="60" cy="90" r="3" fill="#FFFFFF" fillOpacity="0.1" />
            <circle cx="140" cy="90" r="3" fill="#FFFFFF" fillOpacity="0.1" />
            
            {/* Connection lines */}
            <line x1="100" y1="80" x2="70" y2="60" stroke="white" strokeOpacity="0.2" strokeDasharray="2 2" />
            <line x1="100" y1="80" x2="130" y2="60" stroke="white" strokeOpacity="0.2" strokeDasharray="2 2" />
            <line x1="100" y1="80" x2="80" y2="110" stroke="white" strokeOpacity="0.2" strokeDasharray="2 2" />
            <line x1="100" y1="80" x2="120" y2="110" stroke="white" strokeOpacity="0.2" strokeDasharray="2 2" />
            <line x1="100" y1="80" x2="60" y2="90" stroke="white" strokeOpacity="0.2" strokeDasharray="2 2" />
            <line x1="100" y1="80" x2="140" y2="90" stroke="white" strokeOpacity="0.2" strokeDasharray="2 2" />
            
            {/* Animated data flow */}
            <motion.circle 
              r="2" 
              fill="white"
              animate={{
                cx: [100, 70, 100, 130, 100],
                cy: [80, 60, 80, 60, 80],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.circle 
              r="2" 
              fill="white"
              animate={{
                cx: [100, 80, 100, 120, 100],
                cy: [80, 110, 80, 110, 80],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
                delay: 1
              }}
            />
            <motion.circle 
              r="2" 
              fill="white"
              animate={{
                cx: [100, 60, 100, 140, 100],
                cy: [80, 90, 80, 90, 80],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
                delay: 2
              }}
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex items-center mb-3">
          <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center mr-3 group-hover:border-white/40 transition-colors">
            <span className="text-xs text-white/70">AI</span>
          </div>
          <h3 className="text-xl font-light text-white/90">
            N.AI
          </h3>
        </div>

        <p className="text-white/60 mb-6 flex-grow text-sm">
          Our core intelligence layer powered by advanced neural networks, designed 
          for decentralized autonomous operation while maintaining alignment with human values.
        </p>

        <div className="flex items-center mt-auto">
          <div className="w-1 h-1 rounded-full bg-white animate-pulse mr-2"></div>
          <div className="text-xs text-white/50 uppercase">
            ACTIVE
          </div>
        </div>

        {/* Interactive overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 backdrop-blur-sm transition-all duration-300">
          <button className="px-4 py-2 border border-white/20 text-white/90 text-sm hover:bg-white/10 transition-colors">
            EXPLORE
          </button>
        </div>
      </motion.div>

      {/* N.IDENTITY Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        viewport={{ once: true }}
        className="relative border border-white/10 p-6 group hover:border-white/30 transition-all duration-300 flex flex-col h-full"
      >
        {/* Dotted arch figure - identity verification */}
        <div className="relative h-40 mb-6 overflow-hidden">
          <svg 
            className="absolute inset-0 w-full"
            viewBox="0 0 200 160" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="60" y="40" width="80" height="80" rx="4" stroke="white" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 2" fill="none" />
            <circle cx="100" cy="65" r="15" stroke="white" strokeOpacity="0.2" strokeWidth="1" fill="none" />
            <path d="M85 95C85 87.268 91.268 81 99 81H101C108.732 81 115 87.268 115 95V110H85V95Z" stroke="white" strokeOpacity="0.2" strokeWidth="1" fill="none" />
            
            {/* Shield outline */}
            <path d="M100 130C120 120 130 100 130 80H70C70 100 80 120 100 130Z" stroke="white" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 2" fill="none" />
            
            {/* Animated verification checkmark */}
            <motion.path 
              d="M90 80L95 85L110 70" 
              stroke="white" 
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="30"
              initial={{ strokeDashoffset: 30 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 3
              }}
            />
            
            {/* Animated scan line */}
            <motion.line 
              x1="60" 
              y1="60" 
              x2="140" 
              y2="60" 
              stroke="white" 
              strokeOpacity="0.5"
              animate={{
                y1: [60, 100, 60],
                y2: [60, 100, 60],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex items-center mb-3">
          <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center mr-3 group-hover:border-white/40 transition-colors">
            <span className="text-xs text-white/70">ID</span>
          </div>
          <h3 className="text-xl font-light text-white/90">
            N.IDENTITY
          </h3>
        </div>

        <p className="text-white/60 mb-6 flex-grow text-sm">
          Secure, sovereign, and privacy-preserving digital identity system enabling 
          seamless verification without compromising personal data.
        </p>

        <div className="flex items-center mt-auto">
          <div className="w-1 h-1 rounded-full bg-white animate-pulse mr-2"></div>
          <div className="text-xs text-white/50 uppercase">
            ACTIVE
          </div>
        </div>

        {/* Interactive overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 backdrop-blur-sm transition-all duration-300">
          <button className="px-4 py-2 border border-white/20 text-white/90 text-sm hover:bg-white/10 transition-colors">
            EXPLORE
          </button>
        </div>
      </motion.div>

      {/* N.AURORA Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true }}
        className="relative border border-white/10 p-6 group hover:border-white/30 transition-all duration-300 flex flex-col h-full"
      >
        {/* Dotted arch figure - aurora waves */}
        <div className="relative h-40 mb-6 overflow-hidden">
          <svg 
            className="absolute inset-0 w-full"
            viewBox="0 0 200 160" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Wave lines */}
            <motion.path 
              d="M30 80 Q60 60, 100 80 Q140 100, 170 80" 
              stroke="white" 
              strokeOpacity="0.15" 
              strokeWidth="1"
              fill="none"
              animate={{
                d: [
                  "M30 80 Q60 60, 100 80 Q140 100, 170 80",
                  "M30 80 Q60 100, 100 80 Q140 60, 170 80",
                  "M30 80 Q60 60, 100 80 Q140 100, 170 80"
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.path 
              d="M30 90 Q60 70, 100 90 Q140 110, 170 90" 
              stroke="white" 
              strokeOpacity="0.2" 
              strokeWidth="1"
              fill="none"
              animate={{
                d: [
                  "M30 90 Q60 70, 100 90 Q140 110, 170 90",
                  "M30 90 Q60 110, 100 90 Q140 70, 170 90",
                  "M30 90 Q60 70, 100 90 Q140 110, 170 90"
                ]
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.1
              }}
            />
            <motion.path 
              d="M30 100 Q60 80, 100 100 Q140 120, 170 100" 
              stroke="white" 
              strokeOpacity="0.25" 
              strokeWidth="1"
              fill="none"
              animate={{
                d: [
                  "M30 100 Q60 80, 100 100 Q140 120, 170 100",
                  "M30 100 Q60 120, 100 100 Q140 80, 170 100",
                  "M30 100 Q60 80, 100 100 Q140 120, 170 100"
                ]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2
              }}
            />
            
            {/* Animated particles along the waves */}
            <motion.circle 
              r="1.5" 
              fill="white"
              animate={{
                cx: [30, 100, 170, 100, 30],
                cy: [80, 80, 80, 80, 80],
                opacity: [0, 1, 0, 1, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.circle 
              r="1.5" 
              fill="white"
              animate={{
                cx: [30, 100, 170, 100, 30],
                cy: [90, 90, 90, 90, 90],
                opacity: [0, 1, 0, 1, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
                delay: 1
              }}
            />
            <motion.circle 
              r="1.5" 
              fill="white"
              animate={{
                cx: [30, 100, 170, 100, 30],
                cy: [100, 100, 100, 100, 100],
                opacity: [0, 1, 0, 1, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
                delay: 2
              }}
            />
            
            {/* Aurora glow */}
            <circle cx="100" cy="90" r="40" fill="url(#aurora-gradient)" fillOpacity="0.1" />
            <defs>
              <radialGradient id="aurora-gradient" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Content */}
        <div className="flex items-center mb-3">
          <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center mr-3 group-hover:border-white/40 transition-colors">
            <span className="text-xs text-white/70">A</span>
          </div>
          <h3 className="text-xl font-light text-white/90">
            N.AURORA
          </h3>
        </div>

        <p className="text-white/60 mb-6 flex-grow text-sm">
          AI-powered music generation platform creating unique compositions for the metaverse, 
          with full NFT ownership rights for creators.
        </p>

        <div className="flex items-center mt-auto">
          <div className="w-1 h-1 rounded-full bg-white animate-pulse mr-2"></div>
          <div className="text-xs text-white/50 uppercase">
            ACTIVE
          </div>
        </div>

        {/* Interactive overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 backdrop-blur-sm transition-all duration-300">
          <button className="px-4 py-2 border border-white/20 text-white/90 text-sm hover:bg-white/10 transition-colors">
            EXPLORE
          </button>
        </div>
      </motion.div>

      {/* N.DASHBOARD Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        viewport={{ once: true }}
        className="relative border border-white/10 p-6 group hover:border-white/30 transition-all duration-300 flex flex-col h-full"
      >
        {/* Dotted arch figure - dashboard metrics */}
        <div className="relative h-40 mb-6 overflow-hidden">
          <svg 
            className="absolute inset-0 w-full"
            viewBox="0 0 200 160" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Dashboard frame */}
            <rect x="40" y="40" width="120" height="80" rx="2" stroke="white" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 2" fill="none" />
            
            {/* Top bar */}
            <rect x="40" y="40" width="120" height="10" stroke="white" strokeOpacity="0.2" strokeWidth="1" fill="none" />
            
            {/* Dashboard elements */}
            <rect x="50" y="60" width="30" height="20" rx="1" stroke="white" strokeOpacity="0.2" strokeWidth="1" fill="none" />
            <rect x="85" y="60" width="30" height="20" rx="1" stroke="white" strokeOpacity="0.2" strokeWidth="1" fill="none" />
            <rect x="120" y="60" width="30" height="20" rx="1" stroke="white" strokeOpacity="0.2" strokeWidth="1" fill="none" />
            
            {/* Chart elements */}
            <rect x="50" y="90" width="100" height="20" rx="1" stroke="white" strokeOpacity="0.2" strokeWidth="1" fill="none" />
            
            {/* Animated chart line */}
            <motion.path 
              d="M55 100 L65 95 L75 98 L85 92 L95 97 L105 93 L115 96 L125 91 L135 94 L145 90" 
              stroke="white" 
              strokeOpacity="0.4" 
              strokeWidth="1"
              fill="none"
              animate={{
                d: [
                  "M55 100 L65 95 L75 98 L85 92 L95 97 L105 93 L115 96 L125 91 L135 94 L145 90",
                  "M55 98 L65 93 L75 96 L85 94 L95 91 L105 95 L115 92 L125 97 L135 93 L145 95",
                  "M55 95 L65 97 L75 93 L85 97 L95 92 L105 98 L115 94 L125 96 L135 91 L145 93",
                  "M55 100 L65 95 L75 98 L85 92 L95 97 L105 93 L115 96 L125 91 L135 94 L145 90"
                ]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            {/* Animated dot */}
            <motion.circle 
              r="2" 
              fill="white"
              animate={{
                cx: [55, 75, 95, 115, 135, 145, 125, 105, 85, 65, 55],
                cy: [100, 98, 97, 96, 94, 90, 91, 93, 92, 95, 100],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex items-center mb-3">
          <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center mr-3 group-hover:border-white/40 transition-colors">
            <span className="text-xs text-white/70">D</span>
          </div>
          <h3 className="text-xl font-light text-white/90">
            N.DASHBOARD
          </h3>
        </div>

        <p className="text-white/60 mb-6 flex-grow text-sm">
          Complete analytics and management interface for your N.OVA assets, 
          activities, and rewards, with real-time network metrics.
        </p>

        <div className="flex items-center mt-auto">
          <div className="w-1 h-1 rounded-full bg-white animate-pulse mr-2"></div>
          <div className="text-xs text-white/50 uppercase">
            ACTIVE
          </div>
        </div>

        {/* Interactive overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 backdrop-blur-sm transition-all duration-300">
          <button className="px-4 py-2 border border-white/20 text-white/90 text-sm hover:bg-white/10 transition-colors">
            EXPLORE
          </button>
        </div>
      </motion.div>

      {/* N.DAO Card (Coming Soon) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        viewport={{ once: true }}
        className="relative border border-white/10 p-6 group hover:border-white/30 transition-all duration-300 flex flex-col h-full bg-black/20"
      >
        {/* Dotted arch figure - governance/voting */}
        <div className="relative h-40 mb-6 overflow-hidden">
          <svg 
            className="absolute inset-0 w-full"
            viewBox="0 0 200 160" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Governance circle with dots around circumference */}
            <circle cx="100" cy="80" r="40" stroke="white" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="2 2" fill="none" />
            
            {/* Nodes representing DAO participants */}
            <circle cx="100" cy="40" r="3" fill="white" fillOpacity="0.15" />
            <circle cx="140" cy="80" r="3" fill="white" fillOpacity="0.15" />
            <circle cx="100" cy="120" r="3" fill="white" fillOpacity="0.15" />
            <circle cx="60" cy="80" r="3" fill="white" fillOpacity="0.15" />
            <circle cx="126" cy="54" r="3" fill="white" fillOpacity="0.15" />
            <circle cx="126" cy="106" r="3" fill="white" fillOpacity="0.15" />
            <circle cx="74" cy="106" r="3" fill="white" fillOpacity="0.15" />
            <circle cx="74" cy="54" r="3" fill="white" fillOpacity="0.15" />
            
            {/* Center node */}
            <circle cx="100" cy="80" r="5" fill="white" fillOpacity="0.25" />
            
            {/* Connection lines */}
            <line x1="100" y1="80" x2="100" y2="40" stroke="white" strokeOpacity="0.1" strokeDasharray="2 2" />
            <line x1="100" y1="80" x2="140" y2="80" stroke="white" strokeOpacity="0.1" strokeDasharray="2 2" />
            <line x1="100" y1="80" x2="100" y2="120" stroke="white" strokeOpacity="0.1" strokeDasharray="2 2" />
            <line x1="100" y1="80" x2="60" y2="80" stroke="white" strokeOpacity="0.1" strokeDasharray="2 2" />
            <line x1="100" y1="80" x2="126" y2="54" stroke="white" strokeOpacity="0.1" strokeDasharray="2 2" />
            <line x1="100" y1="80" x2="126" y2="106" stroke="white" strokeOpacity="0.1" strokeDasharray="2 2" />
            <line x1="100" y1="80" x2="74" y2="106" stroke="white" strokeOpacity="0.1" strokeDasharray="2 2" />
            <line x1="100" y1="80" x2="74" y2="54" stroke="white" strokeOpacity="0.1" strokeDasharray="2 2" />
            
            {/* Voting animation */}
            <motion.circle 
              r="2" 
              fill="white"
              animate={{
                cx: [100, 74, 100, 126, 100],
                cy: [80, 54, 80, 54, 80],
                opacity: [0.3, 1, 0.3, 1, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.circle 
              r="2" 
              fill="white"
              animate={{
                cx: [100, 60, 100, 140, 100],
                cy: [80, 80, 80, 80, 80],
                opacity: [0.3, 1, 0.3, 1, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
                delay: 1
              }}
            />
            <motion.circle 
              r="2" 
              fill="white"
              animate={{
                cx: [100, 74, 100, 126, 100],
                cy: [80, 106, 80, 106, 80],
                opacity: [0.3, 1, 0.3, 1, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
                delay: 2
              }}
            />
            <motion.circle 
              r="2" 
              fill="white"
              animate={{
                cx: [100, 100, 100, 100, 100],
                cy: [80, 40, 80, 120, 80],
                opacity: [0.3, 1, 0.3, 1, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
                delay: 3
              }}
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex items-center mb-3">
          <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center mr-3 group-hover:border-white/40 transition-colors">
            <span className="text-xs text-white/70">DAO</span>
          </div>
          <h3 className="text-xl font-light text-white/90">
            N.DAO
          </h3>
        </div>

        <p className="text-white/60 mb-6 flex-grow text-sm">
          Decentralized governance system where humans and AI collaborate to guide the
          future of the N.OVA ecosystem through transparent decision-making.
        </p>

        <div className="flex items-center mt-auto">
          <div className="w-1 h-1 rounded-full bg-white animate-pulse mr-2"></div>
          <div className="text-xs text-white/50 uppercase">
            COMING Q2 2025
          </div>
        </div>

        {/* Disabled interactive overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="px-4 py-2 border border-white/20 text-white/40 text-sm cursor-not-allowed">
            COMING SOON
          </div>
        </div>
      </motion.div>
    </div>
  </div>

  {/* Minimal bottom info bar */}
  <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-3 z-10">
    <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
      <div className="text-xs text-white/60 uppercase">
        N.OVA Ecosystem
      </div>
      <div className="text-xs text-white/60 uppercase">
        Integrated Products
      </div>
    </div>
  </div>
</section>

        {/* Partners Section */}
        <section className="py-24 relative border-t border-white/10 overflow-hidden">
          {/* Enhanced background elements */}
          <div className="absolute inset-0 z-0">
            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Subtle radial gradient overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(139, 92, 246, 0.3) 0%, rgba(0, 0, 0, 0) 70%)",
              }}
            />

            {/* Animated horizontal light beams */}
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <motion.div
                  key={`beam-${i}`}
                  className="absolute h-[1px] left-0 right-0 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
                  style={{ top: `${25 + i * 25}%` }}
                  animate={{
                    x: ["-100%", "100%"],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 8 + i * 4,
                    repeat: Infinity,
                    delay: i * 2,
                    ease: "linear",
                  }}
                />
              ))}
          </div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              {/* Decorative element above title */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "120px" }}
                transition={{ duration: 1, ease: "easeOut" }}
                viewport={{ once: true }}
                className="h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mb-8"
              />

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-sm uppercase tracking-[0.3em] text-purple-400 font-light text-center mb-4"
              >
                Collaborative Intelligence
              </motion.div>

              <h2 className="text-[3rem] md:text-[4rem] lg:text-[5rem] font-bold tracking-tighter mb-8 leading-none">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.7 }}
                  viewport={{ once: true }}
                  className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-white to-purple-300"
                >
                  BUILT BY THE BRIGHTEST
                </motion.span>
                <br />
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.7 }}
                  viewport={{ once: true }}
                  className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-200"
                >
                  MINDS IN AI
                </motion.span>
              </h2>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                viewport={{ once: true }}
                className="text-lg text-white/80 max-w-2xl mx-auto"
              >
                Discover the world's first sovereign super intelligence, powered
                by contributors from the leading institutions and organizations
                in AI research:
              </motion.p>

              <motion.div
                className="w-32 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-10"
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: "8rem", opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                viewport={{ once: true }}
              />
            </motion.div>

            {/* Partner Showcase Section */}
            <div className="relative max-w-5xl mx-auto">
  {/* Border frame */}
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 0.8, delay: 0.2 }}
    viewport={{ once: true }}
    className="absolute -inset-4 border border-white/10 rounded-sm -z-10"
  />

  <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-white/10">
    {[
      {
        name: "Solana",
        logo: "/partners/solana.svg",
        description: "High-performance blockchain supporting NOVA",
      },
      {
        name: "Phantom",
        logo: "/partners/phantom.svg",
        description: "Premier wallet for NOVA integration",
      },
      {
        name: "Magic Eden",
        logo: "/partners/magic-eden.png",
        description: "NFT marketplace partner",
      },
      {
        name: "Jupiter",
        logo: "/partners/jupiter.svg",
        description: "Liquidity aggregation protocol",
      },
      {
        name: "Orca",
        logo: "/partners/orca.svg",
        description: "DEX for token swaps",
      },
      {
        name: "Pyth Network",
        logo: "/partners/pyth.svg",
        description: "Oracle data provider",
      },
      {
        name: "Metaplex",
        logo: "/partners/metaplex.png",
        description: "NFT standard creator",
      },
      {
        name: "Superteam VN",
        logo: "/partners/superteam.jpg",
        description: "DAO & developer community",
      },
    ].map((partner, index) => (
      <motion.div
        key={partner.name}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          boxShadow: "0 0 15px rgba(139, 92, 246, 0.2)",
        }}
        transition={{
          duration: 0.5,
          delay: index * 0.1,
          ease: "easeOut",
        }}
        viewport={{ once: true, margin: "-50px" }}
        className="flex items-center justify-center p-6 aspect-square bg-black/60 backdrop-blur-sm relative group"
      >
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/0 group-hover:border-purple-500/50 transition-colors"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/0 group-hover:border-purple-500/50 transition-colors"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/0 group-hover:border-purple-500/50 transition-colors"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/0 group-hover:border-purple-500/50 transition-colors"></div>

        <motion.div
          className="relative w-full h-full flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          {/* Partner logo with effects matching the team member styles */}
          <div className="relative aspect-square w-full h-full overflow-hidden flex items-center justify-center">
            {/* Base image with futuristic filter effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/30 to-black/80 mix-blend-multiply z-10"></div>

            {/* Logo container with improved centering */}
            <div className="relative z-5 w-full h-full flex items-center justify-center">
              <img
                src={partner.logo}
                alt={partner.name}
                className="w-auto h-auto max-w-[70%] max-h-[70%] grayscale group-hover:grayscale-0 transition-all duration-500 object-contain"
                onError={(e) => {
                  // Fallback in case the image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-logo.svg";
                }}
              />
            </div>

            {/* Futuristic overlay effects */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>

            {/* Tech grid overlay */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none z-20"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(167, 139, 250, 0.1) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(167, 139, 250, 0.1) 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            ></div>

            {/* Digital noise overlay */}
            <div className="absolute inset-0 opacity-30 mix-blend-overlay z-20 pointer-events-none">
              <div
                className="w-full h-full opacity-40"
                style={{
                  backgroundImage:
                    'url(\'data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noiseFilter)"/%3E%3C/svg%3E\')',
                  backgroundSize: "150px",
                }}
              ></div>
            </div>

            {/* Bottom label that appears on hover */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm py-2 px-3 z-30 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <div className="text-xs font-mono text-purple-300">
                {partner.name}
              </div>
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mt-1"></div>
            </div>
          </div>

          {/* Hover effect */}
          <motion.div
            className="absolute -inset-4 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
            style={{
              background:
                "radial-gradient(circle at center, rgba(139, 92, 246, 0.2) 0%, transparent 70%)",
            }}
          />
        </motion.div>
      </motion.div>
    ))}
  </div>

  {/* Scanning effect line - matches team member effect */}
  <motion.div
    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"
    animate={{
      top: ["0%", "100%"],
      opacity: [0, 0.7, 0],
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
      ease: "linear",
    }}
  />
</div>

            {/* Additional stats with futuristic styling */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { label: "INSTITUTIONS", value: "20+", icon: "🏢" },
                { label: "RESEARCHERS", value: "150+", icon: "👨‍🔬" },
                { label: "COUNTRIES", value: "18", icon: "🌎" },
              ].map((stat, index) => (
                <motion.div
                  key={`stat-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.2 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center justify-center p-6 bg-black/30 backdrop-blur-sm border border-white/10 rounded-sm relative group hover:border-purple-500/30 transition-all duration-300"
                >
                  {/* Decorative corner elements */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>

                  <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-white to-purple-300 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm uppercase tracking-widest text-white/70 font-light">
                    {stat.label}
                  </div>

                  {/* Hover effect */}
                  <motion.div
                    className="absolute -inset-0.5 -z-10 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl"
                    style={{
                      background:
                        "radial-gradient(circle at center, rgba(139, 92, 246, 0.8) 0%, transparent 70%)",
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-10 left-10 w-16 h-16 border-l border-t border-white/10 z-10"></div>
          <div className="absolute top-10 right-10 w-16 h-16 border-r border-t border-white/10 z-10"></div>
          <div className="absolute bottom-10 left-10 w-16 h-16 border-l border-b border-white/10 z-10"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 border-r border-b border-white/10 z-10"></div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative border-t border-white/10 overflow-hidden">
  {/* Minimalist background elements */}
  <div className="absolute inset-0 z-0">
    {/* Grid pattern */}
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />

    {/* Subtle radial gradient */}
    <div
      className="absolute inset-0 opacity-20"
      style={{
        background:
          "radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
      }}
    />

    {/* Animated particles - simplified and more elegant */}
    <div className="absolute inset-0 pointer-events-none">
      {Array(15)
        .fill(0)
        .map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: i % 5 === 0 ? "2px" : "1px",
              height: i % 5 === 0 ? "2px" : "1px",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -Math.random() * 30 - 10],
              opacity: [0, Math.random() * 0.5 + 0.3, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
    </div>
    
    {/* Minimal horizontal line animations */}
    <motion.div
      className="absolute w-full h-[1px] bg-white/5"
      style={{ top: '30%' }}
      animate={{
        scaleX: [0, 1],
        opacity: [0, 0.2, 0],
        x: ['-100%', '100%'],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear",
      }}
    />
    <motion.div
      className="absolute w-full h-[1px] bg-white/5"
      style={{ top: '70%' }}
      animate={{
        scaleX: [0, 1],
        opacity: [0, 0.2, 0],
        x: ['100%', '-100%'],
      }}
      transition={{
        duration: 18,
        repeat: Infinity,
        ease: "linear",
        delay: 2,
      }}
    />
  </div>

  {/* Creative 3D text effect container */}
  <div className="absolute inset-0 flex items-center justify-center z-0 opacity-5 overflow-hidden">
    <div className="relative" style={{ transform: 'perspective(500px) rotateX(20deg)' }}>
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-[30vw] font-bold tracking-tighter text-white opacity-5"
      >
        N
      </motion.div>
    </div>
  </div>

  <div className="container mx-auto px-4 md:px-6 relative z-10">
    <div className="max-w-5xl mx-auto">
      {/* Minimalist decorative elements */}
      <div className="relative mb-16 flex flex-col items-center">
        <div className="h-[1px] w-16 bg-white/20 mb-10" />
        <div className="text-xs uppercase tracking-widest text-white/60 mb-8">
          Join the Future
        </div>
      </div>

      {/* Main CTA content with cleaner animations */}
      <div className="text-center">
        <h2 className="text-7xl sm:text-8xl font-light tracking-tighter mb-8 leading-none">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative inline-block"
          >
            BECOME
          </motion.div>
          <br />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative inline-block"
          >
            <span>SOVEREIGN</span>
            <motion.div
              className="absolute -bottom-2 left-0 right-0 h-[1px] bg-white/30"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              viewport={{ once: true }}
            />
          </motion.div>
        </h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-lg text-white/70 mb-16 max-w-2xl mx-auto leading-relaxed"
        >
          Join the vanguard of human-centered AI development. Our early 
          members shape the future of integrated intelligence while 
          gaining exclusive benefits and privileges.
        </motion.p>

        {/* Innovative CTA button with interaction */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="relative inline-block group"
        >
          <Link
            href="#"
            className="relative z-10 px-10 py-5 bg-white text-black text-lg uppercase tracking-widest group-hover:bg-white/90 transition-colors inline-block overflow-hidden"
          >
            <span className="relative z-10">Connect Wallet</span>

            {/* Minimal scan line effect */}
            <motion.div 
              className="absolute top-0 -right-20 w-20 h-full bg-black/5 skew-x-12" 
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            />
          </Link>

          {/* Outline effect that expands on hover */}
          <div className="absolute -inset-px border border-white/0 group-hover:border-white/30 transition-colors duration-300"></div>
          <div className="absolute -inset-px border border-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          <div className="absolute -inset-px border border-white/20 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
        </motion.div>
      </div>

      {/* Feature list with innovative design */}
      <div className="relative mt-32 grid grid-cols-1 md:grid-cols-3 gap-1 max-w-5xl mx-auto">
        {[
          {
            title: "Early Token Access",
            description: "Priority allocation of governance tokens",
            icon: "$",
          },
          {
            title: "Ecosystem Governance",
            description: "Direct input on feature development priorities",
            icon: "◎",
          },
          {
            title: "Exclusive Benefits",
            description: "Premium access to all N.OVA products and services",
            icon: "★",
          },
        ].map((feature, index) => (
          <motion.div
            key={`feature-${index}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 + (index * 0.1) }}
            viewport={{ once: true }}
            className="border-t border-l border-r border-b border-white/10 p-8 relative group hover:border-white/20 transition-colors"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 border border-white/20 flex items-center justify-center mb-6 group-hover:border-white/40 transition-colors">
                <span className="text-white/80">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-light mb-3 text-white">
                {feature.title}
              </h3>
              <p className="text-white/60 text-sm">
                {feature.description}
              </p>
            </div>
            
            {/* Animated highlight on hover */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors duration-300"></div>
          </motion.div>
        ))}
      </div>

      {/* Membership statistics */}
      <div className="mt-32 flex justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-12 border-t border-white/10 pt-10"
        >
          {[
            { value: "7,500+", label: "MEMBERS" },
            { value: "92", label: "COUNTRIES" },
            { value: "Q2 2025", label: "LAUNCH" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-light text-white mb-1">{stat.value}</div>
              <div className="text-xs text-white/50 uppercase">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Final message with elegant design */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        viewport={{ once: true }}
        className="mt-32 text-center"
      >
        <div className="inline-block border-t border-white/10 pt-4">
          <p className="text-sm text-white/60 uppercase tracking-wide">
            Limited membership — Join the waitlist today
          </p>
        </div>
      </motion.div>
    </div>
  </div>

  {/* Minimal corner elements */}
  <div className="absolute top-12 left-12 w-12 h-12 border-l border-t border-white/10 z-10"></div>
  <div className="absolute top-12 right-12 w-12 h-12 border-r border-t border-white/10 z-10"></div>
  <div className="absolute bottom-12 left-12 w-12 h-12 border-l border-b border-white/10 z-10"></div>
  <div className="absolute bottom-12 right-12 w-12 h-12 border-r border-b border-white/10 z-10"></div>
  
  {/* Simple bottom bar */}
  <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-3 z-10">
    <div className="container mx-auto px-4 flex justify-between items-center">
      <div className="text-xs text-white/40 uppercase">
        N.OVA
      </div>
      <div className="text-xs text-white/40 uppercase">
        Join the Sovereign AI Revolution
      </div>
    </div>
  </div>
</section>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
