// src/components/transaction-history.tsx
"use client";

import React, { useState } from "react";
import { 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  ExternalLink, 
  Filter,
  Check,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Transaction {
  id: string;
  type: "buy" | "sell";
  amount: string;
  token: string;
  value: string;
  status: "completed" | "pending" | "failed";
  timestamp: string;
  txHash: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  isConnected: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  transactions, 
  isConnected 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  
  // Apply filters
  const filteredTransactions = transactions.filter(tx => {
    if (statusFilter && tx.status !== statusFilter) return false;
    if (typeFilter && tx.type !== typeFilter) return false;
    return true;
  });

  if (!isConnected) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-black/80 to-purple-900/10 backdrop-blur-lg shadow-xl shadow-purple-900/20 mt-10 mb-8">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/3 w-40 h-40 rounded-full bg-cyan-600/10 filter blur-3xl animate-pulse" />
        <div 
          className="absolute bottom-1/3 left-1/3 w-60 h-60 rounded-full bg-purple-600/10 filter blur-3xl animate-pulse"
          style={{ animationDelay: "1.2s" }}
        />
      </div>

      {/* Header with expand control */}
      <div 
        className="relative z-10 p-4 flex justify-between items-center cursor-pointer border-b border-white/5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shadow-inner shadow-black/20">
            <Clock className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                Transaction History
              </span>
            </h2>
            <p className="text-white/60 text-xs">Your recent NOVA swap transactions</p>
          </div>
        </div>
        <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>
      
      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="relative z-10 p-4">
              {/* Filters */}
              <div className="flex items-center gap-3 mb-4 overflow-x-auto hide-scrollbar pb-2">
                <div className="flex items-center gap-1 text-white/60 text-xs">
                  <Filter className="h-3 w-3" /> 
                  <span>Filter:</span>
                </div>
                
                {/* Status filters */}
                <div className="flex gap-1">
                  {["completed", "pending", "failed"].map((status) => (
                    <button 
                      key={status}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                        statusFilter === status 
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" 
                          : "bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatusFilter(statusFilter === status ? null : status);
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
                
                {/* Type filters */}
                <div className="flex gap-1">
                  <button 
                    className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                      typeFilter === "buy" 
                        ? "bg-gradient-to-r from-green-600 to-green-500 text-white" 
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTypeFilter(typeFilter === "buy" ? null : "buy");
                    }}
                  >
                    Buy
                  </button>
                  <button 
                    className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                      typeFilter === "sell" 
                        ? "bg-gradient-to-r from-red-600 to-red-500 text-white" 
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTypeFilter(typeFilter === "sell" ? null : "sell");
                    }}
                  >
                    Sell
                  </button>
                </div>
                
                {/* Reset filters */}
                {(statusFilter || typeFilter) && (
                  <button 
                    className="px-2 py-1 text-xs bg-white/5 text-white/70 rounded-lg hover:bg-white/10 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatusFilter(null);
                      setTypeFilter(null);
                    }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
              
              {/* Transactions list */}
              <div className="space-y-2">
                {filteredTransactions.length === 0 ? (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center text-white/60 text-sm">
                    No transactions found
                  </div>
                ) : (
                  filteredTransactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center"
                    >
                      {/* Transaction icon */}
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 ${
                        tx.type === "buy" 
                          ? "bg-green-500/20" 
                          : "bg-red-500/20"
                      } flex items-center justify-center mr-3`}>
                        {tx.type === "buy" ? (
                          <ArrowDownRight className={`h-4 w-4 ${
                            tx.status === "completed" ? "text-green-400" : "text-white/40"
                          }`} />
                        ) : (
                          <ArrowUpRight className={`h-4 w-4 ${
                            tx.status === "completed" ? "text-red-400" : "text-white/40"
                          }`} />
                        )}
                      </div>
                      
                      {/* Transaction details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <p className="text-sm font-medium">{tx.type === "buy" ? "Buy" : "Sell"} {tx.token}</p>
                            <p className="text-xs text-white/60">{tx.timestamp}</p>
                          </div>
                          <div className="flex items-center">
                            {/* Status indicator */}
                            <div className={`px-2 py-0.5 rounded-full text-xs ${
                              tx.status === "completed" ? "bg-green-500/20 text-green-400" :
                              tx.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-red-500/20 text-red-400"
                            } mr-2`}>
                              {tx.status === "completed" ? (
                                <span className="flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Success
                                </span>
                              ) : tx.status === "pending" ? (
                                <span className="flex items-center gap-1">
                                  <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" /> Pending
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <X className="h-3 w-3" /> Failed
                                </span>
                              )}
                            </div>
                            
                            {/* View transaction link */}
                            <a 
                              href={`https://solscan.io/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">{tx.amount}</span>
                          <span className="text-sm">${tx.value}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* View all link */}
              <div className="mt-4 text-center">
                <a 
                  href="#"
                  className="text-purple-400 hover:text-purple-300 text-xs transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  View all transactions
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-cyan-500/30 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-cyan-500/30 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-cyan-500/30 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-cyan-500/30 rounded-br-lg" />
    </div>
  );
};