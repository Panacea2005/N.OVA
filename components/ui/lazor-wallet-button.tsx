"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, CheckIcon, LogOut, Copy, Check } from "lucide-react";
import { useLazorKit } from "@/hooks/use-lazorkit";
import { useRouter } from "next/navigation";

export function LazorWalletButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const {
    isConnected,
    isLoading,
    connectWallet,
    disconnectWallet,
    walletAddress,
    smartWalletAuthorityPubkey
  } = useLazorKit();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const truncatedAddress = smartWalletAuthorityPubkey
    ? `${smartWalletAuthorityPubkey.slice(0, 4)}...${smartWalletAuthorityPubkey.slice(-4)}`
    : "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleWalletAction = () => {
    if (isConnected) {
      setIsOpen(!isOpen);
    } else {
      handleConnect();
    }
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
      router.push('/profile');
    } catch (error) {
      console.error("Connection error:", error);
    }
  };
  
  const handleDisconnect = async () => {
    setIsOpen(false);
    await disconnectWallet();
  };

  const copyAddress = () => {
    if (smartWalletAuthorityPubkey) {
      navigator.clipboard.writeText(smartWalletAuthorityPubkey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Main Button */}
      <motion.button
        className="relative overflow-hidden group border border-white/30 p-0.5"
        onClick={handleWalletAction}
        disabled={isLoading}
        whileTap={{ scale: 0.98 }}
      >
        <div className="border border-white/10 backdrop-blur-sm">
          {/* Button inner content */}
          <div className="relative z-10 px-4 py-2 flex items-center gap-2">
            {/* Wallet icon */}
            <motion.div
              className="relative flex items-center justify-center"
              animate={{ 
                scale: isLoading ? [1, 1.1, 1] : 1,
              }}
              transition={{ 
                duration: 1.5, 
                repeat: isLoading ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              {isConnected ? (
                <CheckIcon size={16} className="text-green-400" />
              ) : (
                <Zap size={16} className="text-blue-400" />
              )}
              
              {/* Pulse effect when loading */}
              {isLoading && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-blue-600"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.5, 1.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>
            
            {/* Text */}
            <div className="font-mono text-xs relative overflow-hidden">
              <motion.div
                className="relative z-10 text-white"
                animate={{ 
                  y: isLoading ? [0, -20] : 0,
                  opacity: isLoading ? [1, 0] : 1
                }}
                transition={{ duration: 0.5, ease: "easeIn" }}
              >
                {isConnected ? truncatedAddress : "Connect Lazor"}
              </motion.div>
              
              {/* Connection animation */}
              {isLoading && (
                <motion.div 
                  className="absolute inset-0 text-xs flex flex-col items-center justify-center text-blue-300"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <span className="flex gap-1">
                    <span className="inline-block animate-pulse delay-100">.</span>
                    <span className="inline-block animate-pulse delay-200">.</span>
                    <span className="inline-block animate-pulse delay-300">.</span>
                  </span>
                </motion.div>
              )}
            </div>
            
            {/* Status indicator */}
            <motion.div 
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? 'bg-green-500' : isLoading ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              animate={{
                scale: isLoading ? [1, 1.5, 1] : 1,
              }}
              transition={{ 
                duration: isLoading ? 1 : 1.5, 
                repeat: isLoading ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>
      </motion.button>
      
      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-64 bg-black/90 backdrop-blur-md border border-white/30 overflow-hidden z-50"
          >
            <div className="border border-white/10">
              <div className="p-4 border-b border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs font-mono text-white/70">
                    SMART WALLET
                  </div>
                  <div className="px-2 py-0.5 bg-blue-900/30 rounded-sm text-[10px] text-blue-400 font-mono">
                    LAZOR
                  </div>
                </div>
                <div className="text-sm font-mono text-white/90 break-all">
                  {smartWalletAuthorityPubkey}
                </div>
                <button
                  onClick={copyAddress}
                  className="mt-2 flex items-center text-xs text-white/60 hover:text-white transition-colors"
                >
                  {isCopied ? (
                    <span className="flex items-center">
                      <Check className="w-3 h-3 mr-1" />
                      COPIED
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Copy className="w-3 h-3 mr-1" />
                      COPY ADDRESS
                    </span>
                  )}
                </button>
              </div>
              
              <div className="p-2">
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center justify-between p-3 text-white/70 hover:text-white hover:bg-blue-900/20 transition-colors"
                >
                  <span className="text-sm">Disconnect Wallet</span>
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}