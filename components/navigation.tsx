"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { Environment, SpotLight } from "@react-three/drei";
import dynamic from "next/dynamic";

const HolographicSphere = dynamic(
  () => import("@/components/3d/holographic-sphere"),
  {
    ssr: false,
  }
);

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the menu AND not on the menu button
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle menu function to ensure proper toggling
  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
  };

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "AI", href: "/ai" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <>
      {/* Always visible navigation bar */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-lg bg-black/30 border-b border-purple-900/30"
            : ""
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <Link href="#" className="text-xl font-bold tracking-tighter group">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-900 relative">
              N.XYZ
              <span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-purple-600 to-purple-900 transition-all duration-300"></span>
            </span>
          </Link>

          <button
            ref={menuButtonRef}
            className="text-white p-2 z-50 hover:bg-gradient-to-br hover:from-purple-900/20 hover:to-purple-600/20 rounded-full transition-all duration-300 border border-purple-900/30"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-purple-500"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-purple-500"
              >
                <path
                  d="M4 8H13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M6 12H18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M11 16H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </motion.nav>

      {/* Full Screen Menu - toggle with menu button */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-40 flex"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-purple-800 to-transparent opacity-30"></div>
              <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-purple-600 to-transparent opacity-30"></div>
              <div className="absolute left-0 h-full w-px bg-gradient-to-b from-transparent via-purple-800 to-transparent opacity-30"></div>
              <div className="absolute right-0 h-full w-px bg-gradient-to-b from-transparent via-purple-600 to-transparent opacity-30"></div>

              {/* Futuristic Grid Background */}
              <div className="absolute inset-0 opacity-5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute h-px w-full bg-purple-800"
                    style={{ top: `${5 * i}%` }}
                  ></div>
                ))}
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute w-px h-full bg-purple-600"
                    style={{ left: `${5 * i}%` }}
                  ></div>
                ))}
              </div>
            </div>

            <div className="w-full md:w-1/2 h-full flex flex-col justify-start items-start p-8 md:p-16 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none z-10"></div>
              <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-purple-900/10 to-transparent pointer-events-none"></div>
              <div
                ref={scrollContainerRef}
                className="w-full h-full overflow-y-auto pr-4 no-scrollbar"
              >
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: i * 0.1 }}
                    className="mb-12 relative group"
                    onMouseEnter={() => setActiveItem(i)}
                    onMouseLeave={() => setActiveItem(null)}
                  >
                    <div className="absolute -left-6 w-1 h-0 bg-gradient-to-b from-purple-800 to-purple-600 group-hover:h-full transition-all duration-500 ease-out"></div>
                    <div
                      className={`absolute -left-12 w-3 h-3 rounded-full ${
                        activeItem === i ? "bg-purple-600" : "bg-white/20"
                      } transition-all duration-300`}
                    ></div>

                    <Link
                      href={item.href}
                      className="group flex items-center"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="text-sm font-mono uppercase tracking-widest text-white/40 mr-4 w-16 group-hover:text-purple-600 transition-colors duration-300">
                        {`0${i + 1}`.slice(-2)}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-6xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 group-hover:from-purple-600 group-hover:to-purple-900 transition-all duration-300">
                          {item.name}
                        </span>
                        <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-purple-600 to-purple-900 transition-all duration-500 mt-1"></div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden md:block w-1/2 h-full relative"
            >
              <div className="absolute -top-10 -left-10 -right-10 -bottom-10 blur-xl opacity-30 z-0">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-800"></div>
                <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-purple-600"></div>
                <div className="absolute bottom-1/4 left-1/3 w-36 h-36 rounded-full bg-purple-900"></div>
              </div>

              <div className="absolute inset-0 z-10">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                  <Suspense fallback={null}>
                    <HolographicSphere />
                    <Environment preset="night" />
                  </Suspense>
                </Canvas>
              </div>

              <div className="absolute inset-20 border border-white/10 rounded-full animate-pulse"></div>
              <div
                className="absolute inset-40 border border-purple-800/20 rounded-full animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute inset-60 border border-purple-600/20 rounded-full animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom CSS for hiding scrollbar and animations */}
      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }

        @keyframes pulse-glow {
          0% {
            box-shadow: 0 0 10px 0 rgba(126, 34, 206, 0.3);
          }
          50% {
            box-shadow: 0 0 20px 5px rgba(126, 34, 206, 0.5);
          }
          100% {
            box-shadow: 0 0 10px 0 rgba(126, 34, 206, 0.3);
          }
        }

        @keyframes floating {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </>
  );
}
