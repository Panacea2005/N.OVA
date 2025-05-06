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
  const { isConnected } = usePhantom();

  useEffect(() => {
    // Simulate loading assets
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    setMounted(true);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <main className="relative min-h-screen bg-black text-white font-mono">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-purple-950 opacity-80 z-0" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-4xl font-bold mb-8">Welcome to NOVA</h1>
          <p className="text-xl text-gray-400 mb-8">
            Connect your Phantom wallet to get started
          </p>
          <ConnectWalletButton />
        </div>
      </main>
    );
  }

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
        <section
          id="ecosystem"
          className="min-h-screen flex flex-col justify-center relative border-t border-white/10 overflow-hidden"
        >
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

            {/* Animated scan lines */}
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <motion.div
                  key={`scan-${i}`}
                  className="absolute w-full h-[1px] bg-purple-400/10"
                  style={{ top: `${i * 20}%` }}
                  animate={{
                    opacity: [0.1, 0.2, 0.1],
                    scaleY: [1, 1.5, 1],
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 15 + (i % 3),
                    repeat: Infinity,
                    delay: i * 1.5,
                  }}
                />
              ))}
          </div>

          <div className="container mx-auto px-4 md:px-6 py-20 relative z-10">
            <div className="flex flex-col items-center mb-20">
              {/* Enhanced header with animations */}
              <div className="relative mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "120px" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent absolute -top-6 left-1/2 transform -translate-x-1/2"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="text-sm uppercase tracking-[0.3em] text-purple-400 font-light text-center mb-2"
                >
                  Decentralized Innovation
                </motion.div>
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="text-[4rem] md:text-[6rem] lg:text-[7rem] font-bold tracking-tighter leading-none text-center mb-8"
              >
                <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60">
                  INTRODUCING
                </span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-white to-purple-300">
                  THE N.OVA
                </span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white/60 via-white to-white">
                  ECOSYSTEM
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-xl md:text-2xl text-white/80 max-w-3xl text-center leading-relaxed"
              >
                From fractional ownership of real-world assets to transparent
                ecosystem analytics, N.OVA is driving the future of
                decentralized AI through a suite of revolutionary products.
              </motion.p>

              <motion.div
                className="w-32 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-10"
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: "8rem", opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                viewport={{ once: true }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto">
              {/* Product Card 1 - O.AGENTS */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="relative bg-black/30 backdrop-blur-sm border border-white/10 p-8 rounded-sm group hover:border-purple-500/30 transition-all duration-300"
              >
                {/* Decorative corner elements */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>

                {/* Content */}
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full border border-purple-500/30 flex items-center justify-center mr-3 group-hover:border-purple-500 transition-colors">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.93 6 15.5 7.57 15.5 9.5C15.5 11.43 13.93 13 12 13C10.07 13 8.5 11.43 8.5 9.5C8.5 7.57 10.07 6 12 6ZM12 20C9.97 20 8.1 19.33 6.66 18.12C6.25 17.78 6 17.28 6 16.75C6 14.58 7.8 12.75 10 12.75H14C16.2 12.75 18 14.58 18 16.75C18 17.28 17.75 17.78 17.34 18.12C15.9 19.33 14.03 20 12 20Z"
                        fill="#A78BFA"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-medium text-purple-300">
                    N.AGENTS
                  </h3>
                </div>

                <h4 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-200">
                  Become an AI Agent
                </h4>

                <p className="text-white/80 mb-8 leading-relaxed">
                  Get involved, contribute your ideas, and earn exclusive
                  rewards as we build something revolutionary together. Join our
                  decentralized autonomous workforce powering the future of AI.
                </p>

                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse mr-2"></div>
                  <div className="text-sm uppercase tracking-widest text-white/60 font-light">
                    COMING SOON
                  </div>
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

              {/* Product Visual - Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
                className="relative bg-black/30 backdrop-blur-sm border border-white/10 p-0 rounded-sm overflow-hidden group hover:border-purple-500/30 transition-all duration-300"
              >
                {/* Decorative corner elements */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors z-10"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors z-10"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors z-10"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors z-10"></div>

                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 bg-black/60 backdrop-blur-sm py-2 px-4 border-b border-white/10 flex items-center justify-between z-10">
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse mr-2"></div>
                    <span className="text-xs text-white/60 font-mono">
                      N.OVA // DASHBOARD
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-white/10 border border-white/20"></div>
                    <div className="w-3 h-3 rounded-full bg-white/10 border border-white/20"></div>
                    <div className="w-3 h-3 rounded-full bg-white/10 border border-white/20"></div>
                  </div>
                </div>

                {/* Main image */}
                <div className="relative pt-10">
                  <img
                    src="/placeholder.svg?height=300&width=500"
                    alt="Dashboard"
                    className="w-full h-auto"
                  />

                  {/* Scanning line effect */}
                  <motion.div
                    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                    animate={{
                      top: ["0%", "100%"],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>

                {/* Bottom bar with status */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm py-2 px-4 border-t border-white/10 flex items-center justify-between z-10">
                  <span className="text-xs text-white/60 font-mono">
                    STATUS: DEVELOPMENT
                  </span>
                  <span className="text-xs text-white/60 font-mono">
                    02.27.2025
                  </span>
                </div>
              </motion.div>

              {/* Additional Products - O.INFRASTRUCTURE */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                viewport={{ once: true }}
                className="relative bg-black/30 backdrop-blur-sm border border-white/10 p-8 rounded-sm group hover:border-purple-500/30 transition-all duration-300"
              >
                {/* Decorative corner elements */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>

                {/* Content */}
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full border border-purple-500/30 flex items-center justify-center mr-3 group-hover:border-purple-500 transition-colors">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 12.5C21 17.75 17.2 22 12.5 22C10.26 22 8.17 21.17 6.5 19.67C5.3 18.67 3 17.3 3 15V11.5C3 10.4 3.4 9.36 4.11 8.54C4.39 8.21 4.8 8 5.25 8H11.5C12.1 8 12.6 8.5 12.6 9.1C12.6 9.63 12.19 10.08 11.68 10.16L11.5 10.18C10.96 10.29 10.3 10.68 10.08 11.54C10 11.85 10.3 12.1 10.6 12.06C14.69 11.22 17.3 11.75 18.95 12.72C19.55 13.09 19.97 13.77 19.97 14.45V14.88C19.99 14.08 21 13.29 21 12.5ZM9 2H15C15.55 2 16 2.45 16 3V7C16 7.55 15.55 8 15 8H9C8.45 8 8 7.55 8 7V3C8 2.45 8.45 2 9 2Z"
                        fill="#A78BFA"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-medium text-purple-300">
                    N.INFRASTRUCTURE
                  </h3>
                </div>

                <h4 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-200">
                  Unstoppable Computing
                </h4>

                <p className="text-white/80 mb-8 leading-relaxed">
                  Our revolutionary decentralized computing network ensures AI
                  operations remain censorship-resistant, transparent and
                  autonomous. Built for maximum resilience and scalability.
                </p>

                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse mr-2"></div>
                  <div className="text-sm uppercase tracking-widest text-white/60 font-light">
                    IN DEVELOPMENT
                  </div>
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

              {/* Additional Products - O.DAO */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                viewport={{ once: true }}
                className="relative bg-black/30 backdrop-blur-sm border border-white/10 p-8 rounded-sm group hover:border-purple-500/30 transition-all duration-300"
              >
                {/* Decorative corner elements */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors"></div>

                {/* Content */}
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full border border-purple-500/30 flex items-center justify-center mr-3 group-hover:border-purple-500 transition-colors">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 9V3H15V9H21ZM15 21V15H9V21H15ZM9 9V3H3V9H9ZM21 21V15H15V21H21ZM9 15V9H3V15H9Z"
                        stroke="#A78BFA"
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-medium text-purple-300">
                    N.DAO
                  </h3>
                </div>

                <h4 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-200">
                  Decentralized Governance
                </h4>

                <p className="text-white/80 mb-8 leading-relaxed">
                  Our revolutionary governance framework where humans and AI
                  collaborate to guide the future of the O ecosystem through
                  transparent, verifiable decision-making protocols.
                </p>

                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse mr-2"></div>
                  <div className="text-sm uppercase tracking-widest text-white/60 font-light">
                    LAUNCHING Q2 2025
                  </div>
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
            </div>
          </div>

          {/* Enhanced footer bar */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-3 backdrop-blur-sm z-10">
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
              <motion.div
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="w-7 h-[1px] bg-gradient-to-r from-purple-500/40 to-transparent mr-3"></div>
                <span className="text-xs font-mono text-white/60 mr-3">
                  00:4
                </span>
                <span className="text-xs font-mono text-white/60 uppercase tracking-wider">
                  Ecosystem
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
                    Products
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-6 left-6 w-16 h-16 border-l border-t border-white/10 z-10"></div>
          <div className="absolute top-6 right-6 w-16 h-16 border-r border-t border-white/10 z-10"></div>
          <div className="absolute bottom-6 left-6 w-16 h-16 border-l border-b border-white/10 z-10"></div>
          <div className="absolute bottom-6 right-6 w-16 h-16 border-r border-b border-white/10 z-10"></div>
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
        name: "Superteam",
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
        {/* Enhanced CTA Section */}
        <section className="py-32 relative border-t border-white/10 overflow-hidden">
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

            {/* Radial gradient overlay with stronger effect */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(139, 92, 246, 0.4) 0%, rgba(0, 0, 0, 0) 70%)",
              }}
            />

            {/* Animated particles */}
            <div className="absolute inset-0 pointer-events-none">
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
                        i % 7 === 0
                          ? "0 0 3px rgba(139, 92, 246, 0.8)"
                          : "none",
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
          </div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {/* Decorative element */}
              <div className="relative mb-16 flex flex-col items-center">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "120px" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-10"
                />

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="text-sm uppercase tracking-[0.3em] text-purple-400 font-light text-center mb-8"
                >
                  Begin Your Journey
                </motion.div>
              </div>

              {/* Main CTA content with staggered animations */}
              <div className="text-center">
                <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="relative inline-block"
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-white to-purple-300">
                      JOIN THE
                    </span>
                  </motion.div>
                  <br />
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="relative inline-block"
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-200">
                      REVOLUTION
                    </span>
                    <motion.div
                      className="absolute bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                      initial={{ scaleX: 0, opacity: 0 }}
                      whileInView={{ scaleX: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: 1.2 }}
                      viewport={{ once: true }}
                    />
                  </motion.div>
                </h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  viewport={{ once: true }}
                  className="text-xl md:text-2xl text-white/80 mb-16 max-w-2xl mx-auto leading-relaxed"
                >
                  Be part of the future where sovereign intelligence empowers
                  humanity. Sign up now for early access and help shape the dawn
                  of a new era.
                </motion.p>

                {/* Enhanced CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  viewport={{ once: true }}
                  className="relative inline-block group"
                >
                  <Link
                    href="#"
                    className="relative z-10 px-10 py-5 bg-purple-600 text-white text-lg uppercase tracking-widest group-hover:bg-purple-700 transition-colors inline-block rounded-sm overflow-hidden"
                  >
                    <span className="relative z-10">Get Early Access</span>

                    {/* Button animations */}
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Light scan effect */}
                    <motion.div className="absolute top-0 -right-40 w-32 h-full bg-white transform rotate-12 translate-x-0 -translate-y-0 opacity-20 group-hover:translate-x-80 transition-transform duration-1000" />
                  </Link>

                  {/* Button glow effect */}
                  <motion.div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-sm blur-lg opacity-30 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                  {/* Pulse effect ring */}
                  <motion.div
                    className="absolute -inset-4 rounded-sm border border-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                    animate={{ scale: [1, 1.05, 1], opacity: [0, 0.2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </div>

              {/* Additional features list */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                viewport={{ once: true }}
                className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center"
              >
                {[
                  {
                    title: "Early Token Access",
                    description: "Be first in line for $O token allocation",
                  },
                  {
                    title: "Governance Rights",
                    description: "Shape the future of sovereign intelligence",
                  },
                  {
                    title: "Exclusive Benefits",
                    description: "Special access to all N.OVA products",
                  },
                ].map((feature, index) => (
                  <div
                    key={`feature-${index}`}
                    className="flex flex-col items-center p-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-black/60 border border-purple-500/30 flex items-center justify-center mb-4">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-white/70 text-sm">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </motion.div>

              {/* Final message */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.3 }}
                viewport={{ once: true }}
                className="mt-16 text-center"
              >
                <div className="inline-block px-6 py-2 border border-white/10 rounded-sm bg-black/30 backdrop-blur-sm">
                  <p className="text-sm text-white/60 font-mono tracking-wide">
                    <span className="text-purple-400 mr-2">→</span>
                    LIMITED SPOTS AVAILABLE FOR INITIAL ACCESS
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-10 left-10 w-16 h-16 border-l border-t border-white/10 z-10"></div>
          <div className="absolute top-10 right-10 w-16 h-16 border-r border-t border-white/10 z-10"></div>
          <div className="absolute bottom-10 left-10 w-16 h-16 border-l border-b border-white/10 z-10"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 border-r border-b border-white/10 z-10"></div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
