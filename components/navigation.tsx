"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import dynamic from "next/dynamic";
import { ConnectWalletButton } from "@/components/ui/connect-wallet-button";

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
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event: MouseEvent) => {
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

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
  };

  const navItems = [
    { name: "N.OVA", href: "/" },
    { name: "N.ABOUT", href: "/about" },
    { name: "N.TOKENOMICS", href: "/tokenomics" },
    { name: "N.AI", href: "/ai" },
    { name: "N.AURORA", href: "/music" },
    { name: "N.IDENTITY", href: "/nft" },
    { name: "N.DAO", href: "/dao" },
    { name: "N.TRANSFER", href: "/transfer" },
    { name: "N.DASHBOARD", href: "/dashboard" },
    { name: "N.PROFILE", href: "/profile" },
  ];

  return (
    <>
      {/* Fixed Navigation Bar */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black border-b border-white/10"
            : ""
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="relative group">
            <div className="flex items-center">
              <span className="text-xl font-mono font-light">N.OVA</span>
              <motion.div 
                className="absolute -bottom-1 left-0 h-px bg-white w-0 group-hover:w-full transition-all duration-300"
                initial={{ width: 0 }}
                animate={{ width: "0%" }}
                exit={{ width: 0 }}
              />
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {/* Connect Wallet Button */}
            <ConnectWalletButton />
            
            {/* Menu Button */}
            <button
              ref={menuButtonRef}
              className="text-white p-2 hover:bg-white/5 transition-all duration-300 border border-white/10"
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
        </div>
      </motion.nav>

      {/* Full Screen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40 flex overflow-hidden"
          >
            {/* Simple Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 w-full h-px bg-white/10"></div>
              <div className="absolute bottom-0 w-full h-px bg-white/10"></div>
              <div className="absolute left-0 h-full w-px bg-white/10"></div>
              <div className="absolute right-0 h-full w-px bg-white/10"></div>
            </div>

            {/* Menu Content - Split into two columns for desktop */}
            <div className="w-full md:w-1/2 h-full flex flex-col justify-start items-start p-8 md:p-16 relative overflow-auto">
              <div className="w-full flex flex-col mt-12">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.05 }}
                    className="mb-6 relative group"
                    onMouseEnter={() => setActiveItem(i)}
                    onMouseLeave={() => setActiveItem(null)}
                  >
                    <Link
                      href={item.href}
                      className="group flex items-center"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="text-sm font-mono uppercase text-white/40 mr-4 w-8 group-hover:text-white transition-colors duration-300">
                        {`0${i + 1}`.slice(-2)}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-7xl md:text-8xl font-light tracking-tighter text-white/90 group-hover:text-white transition-all duration-300">
                          {item.name}
                        </span>
                        <div 
                          className={`w-0 group-hover:w-full h-px bg-white transition-all duration-500 mt-1 ${
                            activeItem === i ? "w-full" : "w-0"
                          }`}
                        ></div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Holographic Sphere Area - Only visible on desktop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden md:block w-1/2 h-full relative"
            >
              {/* Simple sphere container */}
              <div className="absolute inset-0 z-10">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                  <Suspense fallback={null}>
                    <HolographicSphere />
                    <Environment preset="night" />
                  </Suspense>
                </Canvas>
              </div>
              
              {/* Minimalist circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border border-white/10 rounded-full"></div>
                <div className="absolute w-48 h-48 border border-white/5 rounded-full"></div>
                <div className="absolute w-32 h-32 border border-white/5 rounded-full"></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}