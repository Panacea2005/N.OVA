"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CheckIcon } from "lucide-react";
import { usePhantom } from "@/hooks/use-phantom";
import { useRouter } from "next/navigation";

export function ConnectWalletButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { isConnected, connectWallet, disconnectWallet, walletAddress } = usePhantom();
  const router = useRouter();

  const handleWalletAction = async () => {
    if (isConnected) {
      await disconnectWallet();
    } else {
      setIsConnecting(true);
      try {
        await connectWallet();
        router.push('/profile');
      } catch (error) {
        console.error("Connection error:", error);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  return (
    <motion.button
      className="relative overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleWalletAction}
      disabled={isConnecting}
      whileTap={{ scale: 0.98 }}
    >
      {/* Futuristic border with animated gradients */}
      <div className="absolute inset-0 rounded-md overflow-hidden">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0"></div>
        
        {/* Top border */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-600 to-transparent"
          animate={{
            backgroundPosition: isHovered ? ['0% center', '100% center'] : '0% center',
            opacity: isHovered ? 0.9 : 0.5
          }}
          transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
        />
        
        {/* Bottom border */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"
          animate={{
            backgroundPosition: isHovered ? ['100% center', '0% center'] : '100% center',
            opacity: isHovered ? 0.9 : 0.5
          }}
          transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
        />
        
        {/* Left border */}
        <motion.div 
          className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-600 to-transparent"
          animate={{
            backgroundPosition: isHovered ? ['center 0%', 'center 100%'] : 'center 0%',
            opacity: isHovered ? 0.9 : 0.5
          }}
          transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
        />
        
        {/* Right border */}
        <motion.div 
          className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent"
          animate={{
            backgroundPosition: isHovered ? ['center 100%', 'center 0%'] : 'center 100%',
            opacity: isHovered ? 0.9 : 0.5
          }}
          transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
        />
      </div>
      
      {/* Button inner content */}
      <div className="relative z-10 px-4 py-2 flex items-center gap-2">
        {/* Wallet icon with glowing effect */}
        <motion.div
          className="relative flex items-center justify-center"
          animate={{ 
            scale: isConnecting ? [1, 1.1, 1] : 1,
          }}
          transition={{ 
            duration: 1.5, 
            repeat: isConnecting ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {isConnected ? (
            <CheckIcon size={16} className="text-green-400" />
          ) : (
            <Wallet size={16} className="text-purple-400" />
          )}
          
          {/* Pulse effect when connecting */}
          <AnimatePresence>
            {isConnecting && (
              <motion.div
                className="absolute inset-0 rounded-full bg-purple-600"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.5, 1.8] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Text with data stream effect */}
        <div className="font-mono text-xs relative overflow-hidden">
          <motion.div
            className="relative z-10 text-white"
            animate={{ 
              y: isConnecting ? [0, -20] : 0,
              opacity: isConnecting ? [1, 0] : 1
            }}
            transition={{ duration: 0.5, ease: "easeIn" }}
          >
            {isConnected ? (
              <span className="truncate max-w-[100px]">
                {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
              </span>
            ) : (
              "Connect Wallet"
            )}
          </motion.div>
          
          {/* Connection animation */}
          <AnimatePresence>
            {isConnecting && (
              <motion.div 
                className="absolute inset-0 text-xs flex flex-col items-center justify-center text-purple-300"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <span className="flex gap-1">
                  <span className="inline-block animate-pulse delay-100">.</span>
                  <span className="inline-block animate-pulse delay-200">.</span>
                  <span className="inline-block animate-pulse delay-300">.</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Status indicator */}
        <motion.div 
          className={`w-1.5 h-1.5 rounded-full ${
            isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-purple-500'
          }`}
          animate={{
            scale: isConnecting ? [1, 1.5, 1] : 1,
            boxShadow: isConnected 
              ? '0 0 0 rgba(34, 197, 94, 0.6)' 
              : isHovered 
                ? [
                    '0 0 0px rgba(168, 85, 247, 0.2)',
                    '0 0 6px rgba(168, 85, 247, 0.7)',
                    '0 0 0px rgba(168, 85, 247, 0.2)'
                  ] 
                : '0 0 0px rgba(168, 85, 247, 0.2)'
          }}
          transition={{ 
            duration: isConnecting ? 1 : 1.5, 
            repeat: (isConnecting || isHovered) ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Background glow effect on hover */}
      <motion.div 
        className="absolute inset-0 pointer-events-none rounded-md opacity-0"
        animate={{
          opacity: isHovered ? 0.15 : 0,
          background: isConnected 
            ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.7) 0%, rgba(59, 130, 246, 0.7) 100%)' 
            : 'linear-gradient(90deg, rgba(124, 58, 237, 0.7) 0%, rgba(59, 130, 246, 0.7) 100%)'
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Data circuit pattern */}
      <div className="absolute inset-0 overflow-hidden rounded-md opacity-20 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0">
          <pattern
            id="circuitPattern"
            patternUnits="userSpaceOnUse"
            width="30"
            height="30"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="15"
              x2="30"
              y2="15"
              stroke="currentColor"
              strokeWidth="0.5"
              className={isConnected ? "text-green-500" : "text-purple-500"}
            />
            <line
              x1="15"
              y1="0"
              x2="15"
              y2="30"
              stroke="currentColor"
              strokeWidth="0.5"
              className={isConnected ? "text-green-500" : "text-purple-500"}
            />
            <circle
              cx="15"
              cy="15"
              r="2"
              fill="currentColor"
              className={isConnected ? "text-green-600" : "text-purple-600"}
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#circuitPattern)" />
        </svg>
      </div>
    </motion.button>
  );
}