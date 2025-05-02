// src/components/nova-token-analytics.tsx
"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  Users, 
  BarChart2, 
  DollarSign, 
  Clock, 
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TokenData {
  name: string;
  symbol: string;
  price: number;
  marketCap: string;
  circulatingSupply: string;
  totalSupply: string;
  holders: string;
  volume24h: string;
  priceChange24h: number;
  priceChange7d: number;
}

interface NovaTokenAnalyticsProps {
  tokenData: TokenData;
}

export const NovaTokenAnalytics: React.FC<NovaTokenAnalyticsProps> = ({ tokenData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-black/80 to-purple-900/10 backdrop-blur-lg shadow-xl shadow-purple-900/20 mb-8">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-1/4 left-1/4 w-60 h-60 rounded-full bg-purple-600/10 filter blur-3xl animate-pulse" />
        <div 
          className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-blue-600/10 filter blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      {/* Header with expand control */}
      <div 
        className="relative z-10 p-4 flex justify-between items-center cursor-pointer border-b border-white/5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-900/20">
            N
          </div>
          <div>
            <h2 className="text-xl font-medium">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                {tokenData.name} Analytics
              </span>
            </h2>
            <p className="text-white/60 text-xs">Real-time token performance metrics</p>
          </div>
        </div>
        <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>
      
      {/* Main token metrics - always visible */}
      <div className="relative z-10 p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Price */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-white/60">Price</span>
            </div>
            <div className={`text-xs px-2 py-0.5 rounded-full ${
              tokenData.priceChange24h >= 0 
                ? "bg-green-500/20 text-green-400" 
                : "bg-red-500/20 text-red-400"
            }`}>
              {tokenData.priceChange24h >= 0 ? "+" : ""}{tokenData.priceChange24h}%
            </div>
          </div>
          <p className="text-xl font-bold">${tokenData.price}</p>
        </div>
        
        {/* Market Cap */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-white/60">Market Cap</span>
          </div>
          <p className="text-xl font-bold">${tokenData.marketCap}</p>
        </div>
        
        {/* Holders */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-cyan-400" />
            <span className="text-xs text-white/60">Holders</span>
          </div>
          <p className="text-xl font-bold">{tokenData.holders}</p>
        </div>
        
        {/* 24h Volume */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-xs text-white/60">24h Volume</span>
          </div>
          <p className="text-xl font-bold">${tokenData.volume24h}</p>
        </div>
      </div>
      
      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="relative z-10 px-4 pb-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-2">
                <h3 className="text-sm font-medium mb-4 text-white/80">Supply & Distribution</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Supply metrics */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-white/60">Circulating Supply</span>
                        <span className="text-xs">{tokenData.circulatingSupply} {tokenData.symbol}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-600 to-blue-600" 
                          style={{ width: `42%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-white/60">Total Supply</span>
                        <span className="text-xs">{tokenData.totalSupply} {tokenData.symbol}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-600 to-blue-600" 
                          style={{ width: `100%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Price chart placeholder */}
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10 min-h-[120px] flex flex-col justify-center items-center">
                    <p className="text-xs text-white/60 mb-2">7-Day Price Chart</p>
                    <div className="w-full h-12 flex items-end justify-between gap-1">
                      {[30, 45, 38, 52, 48, 60, 58].map((height, i) => (
                        <div 
                          key={i} 
                          className="w-full bg-gradient-to-t from-purple-600 to-blue-400 rounded-sm" 
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between w-full">
                      <span className="text-[10px] text-white/40">7d</span>
                      <span className="text-[10px] text-white/40">Now</span>
                    </div>
                  </div>
                </div>
                
                {/* Token info */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h3 className="text-sm font-medium mb-3 text-white/80">Token Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/60">Token Name</span>
                        <span>{tokenData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Token Symbol</span>
                        <span>{tokenData.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Contract Address</span>
                        <span className="font-mono">H2L...GJCu</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/60">Blockchain</span>
                        <span>Solana</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Token Standard</span>
                        <span>SPL Token</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Token Type</span>
                        <span>Utility</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-purple-500/30 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-purple-500/30 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-purple-500/30 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-purple-500/30 rounded-br-lg" />
    </div>
  );
};