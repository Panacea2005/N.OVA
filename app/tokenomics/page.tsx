"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowUpDown,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Copy,
  Clock,
  ChevronDown,
  X,
  AlertTriangle,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { usePhantom } from "@/hooks/use-phantom";
import { SwapService } from "@/lib/services/tokenomics/swapService";

const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

const Footer = dynamic(() => import("@/components/footer"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

const NTokenomicsBanner = dynamic(() => import("@/components/3d/ntokenomics-banner"), {
  ssr: false,
});

// Helper function to conditionally join classnames
const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(" ");
};

// Token data interface
const initialTokenData = {
  name: "N.OVA",
  symbol: "$N.OVA",
  price: 0.0235,
  marketCap: "12.5M",
  circulatingSupply: "42M",
  totalSupply: "100M",
  holders: "8,742",
  volume24h: "325K",
  priceChange24h: 5.8,
  priceChange7d: 12.3,
};

// Mock data for demonstration purposes
const topWallets = [
  {
    address: "J8NPQGCH...SJJU",
    holdings: "47,500,000",
    valueUsd: "$451,345",
    lastUpdated: "4 MINS AGO",
  },
  {
    address: "CLZES9YH...DJPY",
    holdings: "50,000,000",
    valueUsd: "$475,100",
    lastUpdated: "4 MINS AGO",
  },
  {
    address: "5IMXPYPM...MMEK",
    holdings: "50,000,000",
    valueUsd: "$475,100",
    lastUpdated: "4 MINS AGO",
  },
  {
    address: "AM35UNJK...VXND",
    holdings: "50,000,000",
    valueUsd: "$475,100",
    lastUpdated: "4 MINS AGO",
  },
  {
    address: "B7EAQ2WK...FZPR",
    holdings: "8,353,750",
    valueUsd: "$79,377.33",
    lastUpdated: "4 MINS AGO",
  },
  {
    address: "AHDGEAVV...OHXK",
    holdings: "0",
    valueUsd: "$0",
    lastUpdated: "4 MINS AGO",
  },
  {
    address: "CRUDUGEX...TAA3",
    holdings: "40,000,000",
    valueUsd: "$380,080",
    lastUpdated: "4 MINS AGO",
  },
  {
    address: "5THJ5DMM...K3QV",
    holdings: "0",
    valueUsd: "$0",
    lastUpdated: "4 MINS AGO",
  },
  {
    address: "495LWPH8...GNQ3",
    holdings: "100,000,000",
    valueUsd: "$950,200",
    lastUpdated: "4 MINS AGO",
  },
  {
    address: "CKN7IUYS...TNPC",
    holdings: "25,000,000.05",
    valueUsd: "$237,550",
    lastUpdated: "4 MINS AGO",
  },
];

// Daily distribution data for chart - more extensive for a better visualization
const dailyDistribution = Array(120)
  .fill(0)
  .map((_, i) => {
    const randomValue = Math.floor(Math.random() * 10000) + 5000;
    return { value: randomValue };
  });

// Token price history for chart visualization
const tokenPriceHistory = Array(120)
  .fill(0)
  .map((_, i) => {
    const baseValue = 0.01;
    const trend = Math.sin(i / 15) * 0.005; // Create wave pattern
    const noise = (Math.random() - 0.5) * 0.002; // Add small random variations
    return baseValue + trend + noise;
  });

// Transaction types
const transactionTypes = [
  {
    id: "buy",
    name: "Buy",
    amount: "50,000",
    value: "1.175",
    time: "15 MINS AGO",
    status: "COMPLETED",
    hash: "7PXfp...v4jM",
  },
  {
    id: "sell",
    name: "Sell",
    amount: "25,000",
    value: "0.588",
    time: "1 HOUR AGO",
    status: "COMPLETED",
    hash: "L8aMk...sF3z",
  },
  {
    id: "buy",
    name: "Buy",
    amount: "10,000",
    value: "0.235",
    time: "3 HOURS AGO",
    status: "COMPLETED",
    hash: "9rK3L...p7Vx",
  },
  {
    id: "buy",
    name: "Buy",
    amount: "75,000",
    value: "1.763",
    time: "1 DAY AGO",
    status: "COMPLETED",
    hash: "2jTbH...c8Pq",
  },
];

const NovaTokenomics = () => {
  const {
    walletAddress,
    publicKey,
    isConnected,
    balance: solBalance,
    novaBalance,
    isLoading,
    signAndSendTransaction,
    refreshBalances,
    connection,
  } = usePhantom();

  const [mounted, setMounted] = useState(false);
  const [tokenData, setTokenData] = useState(initialTokenData);
  const [fromAmount, setFromAmount] = useState("1");
  const [toAmount, setToAmount] = useState("42500");
  const [swapDirection, setSwapDirection] = useState("solToNova");
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [showSwapConfirmation, setShowSwapConfirmation] = useState(false);
  const [swapStatus, setSwapStatus] = useState<
    "pending" | "success" | "failed" | null
  >(null);
  const [swapError, setSwapError] = useState<string | null>(null);

  // Swap service initialization
  const swapService = mounted ? new SwapService(connection) : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulate token data fetch
  useEffect(() => {
    if (mounted) {
      setLocalLoading(true);
      setTimeout(() => {
        setLocalLoading(false);
      }, 1200);
    }
  }, [mounted]);

  // Check if the user has claimed today
  useEffect(() => {
    if (isConnected) {
      const lastClaimTime = localStorage.getItem(`lastClaim_${walletAddress}`);

      if (lastClaimTime) {
        const now = new Date().getTime();
        const lastClaim = parseInt(lastClaimTime);
        const timeElapsed = now - lastClaim;
        const hoursRemaining = 24 - timeElapsed / (1000 * 60 * 60);

        if (hoursRemaining > 0) {
          setTimeRemaining(hoursRemaining);
          const timer = setInterval(() => {
            setTimeRemaining((prev) => {
              if (prev === null || prev <= 0.0167) {
                // 1 minute in hours or if prev is null
                clearInterval(timer);
                setTimeRemaining(null);
                return null;
              }
              return prev - 0.0167; // Update every minute (0.0167 hours)
            });
          }, 60000);

          return () => clearInterval(timer);
        } else {
          setTimeRemaining(null);
        }
      } else {
        setTimeRemaining(null);
      }
    }
  }, [isConnected, walletAddress]);

  // Handle token claim
  const handleClaim = () => {
    setIsClaiming(true);

    // Simulate transaction delay
    setTimeout(() => {
      localStorage.setItem(
        `lastClaim_${walletAddress}`,
        new Date().getTime().toString()
      );
      setIsClaiming(false);
      setClaimSuccess(true);

      // Reset success message after 5 seconds
      setTimeout(() => {
        setClaimSuccess(false);
        setTimeRemaining(24);
      }, 5000);
    }, 2000);
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);

    // Calculate conversion based on swap direction
    const numValue = parseFloat(value) || 0;

    if (swapDirection === "solToNova") {
      setToAmount((numValue * 42500).toFixed(2));
    } else {
      setToAmount((numValue / 42500).toFixed(6));
    }
  };

  const toggleSwapDirection = () => {
    const newDirection =
      swapDirection === "solToNova" ? "novaToSol" : "solToNova";
    setSwapDirection(newDirection);

    // Recalculate amounts
    if (newDirection === "solToNova") {
      const solAmount = parseFloat(fromAmount) || 0;
      setToAmount((solAmount * 42500).toFixed(2));
    } else {
      const novaAmount = parseFloat(fromAmount) || 0;
      setToAmount((novaAmount / 42500).toFixed(6));
    }
  };

  const getFromTokenInfo = () => {
    return swapDirection === "solToNova"
      ? { symbol: "SOL", gradient: "from-orange-500 to-amber-500" }
      : { symbol: "N.OVA", gradient: "from-purple-500 to-blue-500" };
  };

  const getToTokenInfo = () => {
    return swapDirection === "solToNova"
      ? { symbol: "N.OVA", gradient: "from-purple-500 to-blue-500" }
      : { symbol: "SOL", gradient: "from-orange-500 to-amber-500" };
  };

  const handleSwap = () => {
    if (!isConnected) {
      return;
    }

    setSwapError(null);
    setShowSwapConfirmation(true);
  };

  const confirmSwap = async () => {
    if (!publicKey) {
      setSwapError("Wallet not connected");
      return;
    }

    setSwapStatus("pending");
    setLocalLoading(true);

    try {
      const fromAmountNum = parseFloat(fromAmount);

      // Validate the amount is valid
      if (isNaN(fromAmountNum) || fromAmountNum <= 0) {
        throw new Error("Invalid amount");
      }

      // Check if there's enough balance
      if (swapDirection === "solToNova" && fromAmountNum > solBalance) {
        throw new Error("Insufficient SOL balance");
      } else if (swapDirection === "novaToSol" && fromAmountNum > novaBalance) {
        throw new Error("Insufficient N.OVA balance");
      }

      // In a real implementation, this would call a smart contract
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSwapStatus("success");

      // Close modal after showing confirmation
      setTimeout(() => {
        setShowSwapConfirmation(false);
        setSwapStatus(null);
      }, 2000);
    } catch (error) {
      console.error("Swap error:", error);
      setSwapStatus("failed");
      setSwapError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setLocalLoading(false);
    }
  };

  // Show connect wallet screen if not connected
  if (!mounted) {
    return (
      <main className="relative min-h-screen bg-black text-white font-mono">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-black opacity-90 z-0" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-4xl font-bold mb-8">Loading...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-black text-white font-mono">
      {/* Background */}
      <div className="fixed inset-0 bg-black z-0" />

      {/* Navigation */}
      <Navigation />

      <div className="container mx-auto px-2 pt-24 pb-16 relative z-10">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* N.OVA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-10"
          >
            <NTokenomicsBanner />
          </motion.div>

          {/* Token Details Section */}
          <div className="border border-white/30 p-0.5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="border border-white/10 px-6 py-8"
            >
              <div className="mb-6">
                <h1 className="text-5xl font-light mb-6">N.OVA Details</h1>
                <p className="text-white/70 uppercase">
                  N.OVA OPERATES AS AN INDEX FUND, TRACKING{" "}
                  <span className="text-white font-medium">
                    SOLANA'S TOP 100 AI PROJECTS
                  </span>
                </p>
                <p className="text-white/70 uppercase">
                  THINK OF N.OVA AS THE S&P500 OF SOLANA-BASED AI PROJECTS,
                  INCLUDING AI INFRASTRUCTURE PROJECTS, AI AGENTS, AND AI MEME
                  TOKENS.
                </p>
              </div>

              {/* Token Stats */}
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <p className="uppercase text-white/50">TOTAL COINS MINTED</p>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="uppercase text-white/50">LIVE</p>
                </div>

                <div className="mb-12">
                  <h2 className="text-7xl font-light">999,996,325.24</h2>
                </div>

                {/* Chart visualization - More similar to the reference image */}
                <div className="w-full h-48 mb-12 border-b border-white/10">
                  <div className="relative h-full">
                    {/* Vertical lines grid */}
                    {Array(24)
                      .fill(0)
                      .map((_, index) => (
                        <div
                          key={`vline-${index}`}
                          className="absolute top-0 bottom-0 w-px bg-white/5"
                          style={{ left: `${(index / 23) * 100}%` }}
                        ></div>
                      ))}

                    {/* Horizontal lines grid */}
                    {Array(10)
                      .fill(0)
                      .map((_, index) => (
                        <div
                          key={`hline-${index}`}
                          className="absolute left-0 right-0 h-px bg-white/5"
                          style={{ top: `${(index / 9) * 100}%` }}
                        ></div>
                      ))}

                    {/* Chart line */}
                    <svg
                      className="absolute inset-0 h-full w-full overflow-visible"
                      preserveAspectRatio="none"
                    >
                      <path
                        d={`M 0,${
                          (1 - dailyDistribution[0].value / 15000) * 100
                        }% ${dailyDistribution
                          .map(
                            (point, i) =>
                              `L ${
                                (i / (dailyDistribution.length - 1)) * 100
                              }%,${(1 - point.value / 15000) * 100}%`
                          )
                          .join(" ")}`}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.3)"
                        strokeWidth="1"
                      />
                    </svg>
                  </div>
                </div>

                {/* Token stats grid */}
                <div className="grid grid-cols-1 md:grid-cols-3">
                  <div className="p-6 border border-white/30 m-0.5 bg-black">
                    <p className="uppercase text-white/50 mb-2">
                      CIRCULATING
                      <br />
                      SUPPLY VALUE
                    </p>
                    <p className="text-4xl font-light">
                      ${tokenData.circulatingSupply}
                    </p>
                  </div>
                  <div className="p-6 border border-white/30 m-0.5 bg-black">
                    <p className="uppercase text-white/50 mb-2">
                      TOTAL
                      <br />
                      ASSETS VALUE
                    </p>
                    <p className="text-4xl font-light">
                      ${tokenData.marketCap}
                    </p>
                  </div>
                  <div className="p-6 border border-white/30 m-0.5 bg-black">
                    <p className="uppercase text-white/50 mb-2">
                      RESERVE
                      <br />
                      RATIO
                    </p>
                    <p className="text-4xl font-light">96.19%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Swap (DEX) Section */}
          <div className="border border-white/30 p-0.5 mb-8">
            <div className="border border-white/10 bg-black px-6 py-8">
              <h2 className="text-5xl font-light mb-10">Swap Tokens</h2>

              {/* FROM input */}
              <div className="mb-1">
                <div className="flex justify-between items-center mb-2">
                  <div className="uppercase text-white/60 text-xs">FROM</div>
                  <div className="text-xs text-white/60">
                    Balance:{" "}
                    {swapDirection === "solToNova"
                      ? solBalance?.toFixed(4) || "0.0000"
                      : novaBalance?.toFixed(2) || "0.00"}{" "}
                    {getFromTokenInfo().symbol}
                  </div>
                </div>

                <div className="flex items-center p-5 border border-white/20 bg-black mb-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={fromAmount}
                      onChange={(e) => handleFromAmountChange(e.target.value)}
                      className="w-full bg-transparent text-2xl focus:outline-none"
                      placeholder="0.0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        swapDirection === "solToNova"
                          ? "/partners/solana.svg"
                          : "/images/logo.png"
                      }
                      alt={getFromTokenInfo().symbol}
                      className="w-7 h-7 rounded-full object-contain"
                    />
                    <span className="font-medium">
                      {getFromTokenInfo().symbol}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 mb-6">
                  {["25%", "50%", "75%", "MAX"].map((percent) => (
                    <button
                      key={percent}
                      className="px-3 py-1 text-xs bg-black border border-white/20 hover:bg-white/10 transition-colors"
                    >
                      {percent}
                    </button>
                  ))}
                </div>
              </div>

              {/* Switch Direction Button */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={toggleSwapDirection}
                  className="p-2 bg-black border border-white/20 rounded-md hover:bg-white/10 transition-colors"
                >
                  <ArrowUpDown className="h-5 w-5" />
                </button>
              </div>

              {/* TO input */}
              <div className="mb-7">
                <div className="flex justify-between items-center mb-2">
                  <div className="uppercase text-white/60 text-xs">TO</div>
                  <div className="text-xs text-white/60">
                    Balance:{" "}
                    {swapDirection === "solToNova"
                      ? novaBalance?.toFixed(2) || "0.00"
                      : solBalance?.toFixed(4) || "0.0000"}{" "}
                    {getToTokenInfo().symbol}
                  </div>
                </div>

                <div className="flex items-center p-5 border border-white/20 bg-black">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={toAmount}
                      readOnly
                      className="w-full bg-transparent text-2xl focus:outline-none"
                      placeholder="0.0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        swapDirection === "solToNova"
                          ? "/images/logo.png"
                          : "/partners/solana.svg"
                      }
                      alt={getToTokenInfo().symbol}
                      className="w-7 h-7 rounded-full object-contain"
                    />
                    <span className="font-medium">
                      {getToTokenInfo().symbol}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-7">
                <div className="uppercase text-white/60 text-xs mb-2">
                  PRICE
                </div>
                <div className="p-4 border border-white/20 bg-black">
                  <div className="flex items-center justify-end gap-1">
                    <span>1</span>
                    <img
                      src="/partners/solana.svg"
                      alt="SOL"
                      className="w-4 h-4 rounded-full object-contain"
                    />
                    <span>= 1,000,000</span>
                    <img
                      src="/images/logo.png"
                      alt="N.OVA"
                      className="w-4 h-4 rounded-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                disabled={localLoading || !isConnected}
                className={`w-full bg-white text-black py-4 uppercase font-medium text-center hover:bg-white/90 transition-colors ${
                  localLoading || !isConnected
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {localLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    PROCESSING...
                  </span>
                ) : !isConnected ? (
                  "CONNECT WALLET"
                ) : (
                  "SWAP"
                )}
              </button>
            </div>
          </div>

          {/* Top Wallets Section */}
          <div className="border border-white/30 p-0.5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="border border-white/10 px-6 py-8"
            >
              <h2 className="text-5xl font-light mb-8">Top Wallets</h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left text-white/50 uppercase text-xs">
                      <th className="pb-4 pr-6">Wallet Address</th>
                      <th className="pb-4 px-6">Holdings</th>
                      <th className="pb-4 px-6">Value in USD</th>
                      <th className="pb-4 px-6">Last Updated</th>
                      <th className="pb-4 pl-6"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {topWallets.map((wallet, index) => (
                      <tr
                        key={index}
                        className="border-t border-white/10 hover:bg-white/5"
                      >
                        <td className="py-4 pr-6 font-mono">
                          {wallet.address}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full border border-white/30 mr-3 flex-shrink-0"></div>
                            {wallet.holdings}
                          </div>
                        </td>
                        <td className="py-4 px-6">{wallet.valueUsd}</td>
                        <td className="py-4 px-6 text-white/50">
                          {wallet.lastUpdated}
                        </td>
                        <td className="py-4 pl-6">
                          <button className="text-white hover:text-white/70 transition-colors uppercase text-xs flex items-center">
                            VIEW ASSETS <ArrowRight className="h-3 w-3 ml-1" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Recent Transactions */}
          <div className="border border-white/30 p-0.5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="border border-white/10 px-6 py-8"
            >
              <h2 className="text-5xl font-light mb-8">Recent Transactions</h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left text-white/50 uppercase text-xs">
                      <th className="pb-4 pr-6">Type</th>
                      <th className="pb-4 px-6">Amount</th>
                      <th className="pb-4 px-6">Value in SOL</th>
                      <th className="pb-4 px-6">Time</th>
                      <th className="pb-4 px-6">Status</th>
                      <th className="pb-4 pl-6">TX Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionTypes.map((tx, index) => (
                      <tr
                        key={index}
                        className="border-t border-white/10 hover:bg-white/5"
                      >
                        <td className="py-4 pr-6 font-mono">
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                                tx.id === "buy" ? "bg-green-500" : "bg-red-500"
                              }`}
                            ></div>
                            {tx.name}
                          </div>
                        </td>
                        <td className="py-4 px-6">{tx.amount} N.OVA</td>
                        <td className="py-4 px-6">{tx.value} SOL</td>
                        <td className="py-4 px-6 text-white/50">{tx.time}</td>
                        <td className="py-4 px-6">{tx.status}</td>
                        <td className="py-4 pl-6">
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{tx.hash}</span>
                            <button className="text-white hover:text-white/70 transition-colors">
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Faucet Section */}
          {/* Faucet Section with Bento Grid Layout */}
          <div className="border border-white/30 p-0.5 mb-8">
            <div className="border border-white/10 bg-black p-8">
              <h2 className="text-5xl font-light mb-10">Get N.OVA Tokens</h2>

              {/* Bento Grid Layout */}
              <div className="grid grid-cols-12 gap-4">
                {/* Contract Address - Span full width */}
                <div className="col-span-12 border border-white/30">
                  <div className="p-4">
                    <div className="uppercase text-white/60 text-sm mb-2">
                      SOLANA CONTRACT ADDRESS
                    </div>
                    <div className="flex items-center">
                      <div className="font-mono flex-1">
                        H2LhfTsiT2RWKpbyDLstZALcvVyUcaZmM2T7GtQoGJCu
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            "H2LhfTsiT2RWKpbyDLstZALcvVyUcaZmM2T7GtQoGJCu"
                          )
                        }
                        className="bg-black text-white border border-white/30 px-4 py-2 ml-4 whitespace-nowrap"
                      >
                        COPY ADDRESS
                      </button>
                    </div>
                  </div>
                </div>

                {/* Available to Claim - Left side, tall */}
                <div className="col-span-6 md:col-span-5 row-span-2 border border-white/30">
                  <div className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="uppercase text-white/60 text-sm mb-3">
                        AVAILABLE TO CLAIM
                      </div>
                      <div className="flex items-baseline">
                        <div className="text-7xl font-light">5</div>
                        <div className="text-2xl text-purple-400 ml-2">
                          N.OVA
                        </div>
                      </div>
                    </div>
                    <div className="self-end">
                      <div className="px-4 py-2 border border-white/20 text-xs text-white/70 uppercase">
                        DAILY LIMIT
                      </div>
                    </div>
                  </div>
                </div>

                {/* Claim Button - Right top */}
                <div className="col-span-6 md:col-span-7 border border-white/30">
                  <div className="p-6">
                    <div className="uppercase text-white/60 text-sm mb-4 text-center">
                      CLAIM YOUR TOKENS
                    </div>

                    {timeRemaining !== null ? (
                      <div className="border border-white/30 p-5 flex items-center justify-center gap-3">
                        <Clock className="h-5 w-5 text-white/70" />
                        <span className="uppercase">NEXT CLAIM IN 23H 1M</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleClaim}
                        disabled={isClaiming || !isConnected}
                        className="w-full bg-white text-black py-4 uppercase font-medium text-center"
                      >
                        {isClaiming ? (
                          <span className="flex items-center justify-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            PROCESSING...
                          </span>
                        ) : !isConnected ? (
                          "CONNECT WALLET"
                        ) : (
                          "CLAIM NOW"
                        )}
                      </button>
                    )}

                    {/* Success Message */}
                    {claimSuccess && (
                      <div className="mt-4 p-4 border border-green-500/30 flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                        <span className="text-green-300 uppercase">
                          TOKENS CLAIMED SUCCESSFULLY!
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Boost Info - Right bottom */}
                <div className="col-span-6 md:col-span-7 border border-white/30">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span className="uppercase text-white/80 text-sm">
                        BOOST YOUR REWARDS
                      </span>
                    </div>
                    <p className="text-white/70">
                      Use N.AI or N.IDENTITY to earn up to 3x more tokens with
                      each claim.
                    </p>
                  </div>
                </div>

                {/* Token Info - Bottom span */}
                <div className="col-span-12 border border-white/30">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src="/images/logo.png"
                        alt="N.OVA Token"
                        className="w-8 h-8 rounded-full object-contain"
                      />
                      <div className="text-xl">N.OVA Token</div>
                    </div>
                    <div className="flex flex-col md:flex-row">
                      <p className="text-white/70 flex-1 mb-4 md:mb-0 md:pr-6">
                        Utility token powering the N.OVA ecosystem. Use for
                        governance, staking, and access to premium features.
                      </p>
                      <div className="flex gap-4">
                        <div className="border border-white/10 p-4 min-w-[100px]">
                          <div className="text-white/60 mb-1">PRICE</div>
                          <div>$0.0235</div>
                        </div>
                        <div className="border border-white/10 p-4 min-w-[100px]">
                          <div className="text-white/60 mb-1">SUPPLY</div>
                          <div>100M</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* N.OVA Ecosystem Section */}
          <div className="border border-white/30 p-0.5 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="border border-white/10 px-8 py-10 bg-black"
            >
              <h2 className="text-5xl font-light mb-10">N.OVA Ecosystem</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* N.AI Card */}
                <div className="border border-white/30 p-0.5 group">
                  <div className="border border-white/10 p-8 h-full bg-black group-hover:border-blue-500/30 transition-colors duration-300">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-light">N.AI</h3>
                    </div>
                    <p className="text-white/70 mb-8 h-24">
                      Advanced AI assistant that analyzes on-chain data and
                      provides personalized insights for your crypto portfolio.
                    </p>
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center border-t border-white/10 pt-4">
                        <span className="text-white/60">REWARD BOOST</span>
                        <span className="font-medium text-blue-400">
                          3x TOKENS
                        </span>
                      </div>
                      <button className="bg-white text-black py-3 w-full uppercase hover:bg-white/90 transition-colors">
                        Try N.AI
                      </button>
                    </div>
                  </div>
                </div>

                {/* N.IDENTITY Card */}
                <div className="border border-white/30 p-0.5 group">
                  <div className="border border-white/10 p-8 h-full bg-black group-hover:border-purple-500/30 transition-colors duration-300">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-400 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-light">N.IDENTITY</h3>
                    </div>
                    <p className="text-white/70 mb-8 h-24">
                      Generate a unique visual representation of your Web3
                      identity based on your on-chain activity and wallet
                      behavior.
                    </p>
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center border-t border-white/10 pt-4">
                        <span className="text-white/60">REWARD BOOST</span>
                        <span className="font-medium text-purple-400">
                          2x TOKENS
                        </span>
                      </div>
                      <button className="bg-white text-black py-3 w-full uppercase hover:bg-white/90 transition-colors">
                        Generate ID
                      </button>
                    </div>
                  </div>
                </div>

                {/* N.DAO Card */}
                <div className="border border-white/30 p-0.5 group">
                  <div className="border border-white/10 p-8 h-full bg-black group-hover:border-amber-500/30 transition-colors duration-300">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-pink-400 flex items-center justify-center">
                        <Info className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-light">N.DAO</h3>
                    </div>
                    <p className="text-white/70 mb-8 h-24">
                      Participate in governance decisions and vote on future
                      developments. Stake your tokens for additional rewards.
                    </p>
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center border-t border-white/10 pt-4">
                        <span className="text-white/60">STATUS</span>
                        <span className="font-medium text-amber-400 border border-amber-500/30 px-2 py-1 text-xs">
                          COMING SOON
                        </span>
                      </div>
                      <button className="border border-white/30 text-white py-3 w-full uppercase hover:bg-white/10 transition-colors">
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Swap Confirmation Modal */}
      {showSwapConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !swapStatus && setShowSwapConfirmation(false)}
          ></div>
          <div className="relative z-10 w-full max-w-sm bg-black border border-white/30 overflow-hidden animate-scaleIn">
            <div className="border border-white/10">
              <div className="px-6 py-8">
                {swapStatus === null && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl uppercase">Confirm Swap</h3>
                      <button
                        onClick={() => setShowSwapConfirmation(false)}
                        className="p-2 border border-white/20 hover:bg-white/10 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="border border-white/20 p-5 mb-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <span className="text-sm text-white/60 uppercase">
                            From
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className={`w-6 h-6 rounded-full bg-gradient-to-r ${
                                getFromTokenInfo().gradient
                              } flex items-center justify-center text-xs font-bold`}
                            >
                              {getFromTokenInfo().symbol === "SOL" ? "S" : "N"}
                            </div>
                            <span className="text-xl font-light">
                              {fromAmount} {getFromTokenInfo().symbol}
                            </span>
                          </div>
                        </div>
                        <ArrowUpDown className="h-5 w-5 text-white/40" />
                        <div>
                          <span className="text-sm text-white/60 uppercase">
                            To
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className={`w-6 h-6 rounded-full bg-gradient-to-r ${
                                getToTokenInfo().gradient
                              } flex items-center justify-center text-xs font-bold`}
                            >
                              {getToTokenInfo().symbol === "SOL" ? "S" : "N"}
                            </div>
                            <span className="text-xl font-light">
                              {toAmount} {getToTokenInfo().symbol}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-white/10">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60 uppercase">Rate</span>
                          <span>1 SOL = 42,500 N.OVA</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60 uppercase">
                            Network Fee
                          </span>
                          <span>~0.00025 SOL</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={confirmSwap}
                      disabled={localLoading}
                      className={`w-full py-3 bg-white text-black uppercase font-medium hover:bg-white/90 transition-all duration-300 ${
                        localLoading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {localLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        "Confirm Swap"
                      )}
                    </button>
                  </>
                )}

                {swapStatus === "pending" && (
                  <div className="py-8 flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-white/50 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <h3 className="text-xl uppercase mb-2">Processing Swap</h3>
                    <p className="text-white/60 text-center">
                      Please wait while we process your transaction...
                    </p>
                  </div>
                )}

                {swapStatus === "success" && (
                  <div className="py-6 flex flex-col items-center">
                    <div className="w-16 h-16 bg-black border-4 border-green-500/50 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="h-10 w-10 text-green-400" />
                    </div>
                    <h3 className="text-xl uppercase mb-2">Swap Successful</h3>
                    <p className="text-white/60 text-center mb-5">
                      You've successfully swapped {fromAmount}{" "}
                      {getFromTokenInfo().symbol} for {toAmount}{" "}
                      {getToTokenInfo().symbol}.
                    </p>
                    <button
                      onClick={() => {
                        setShowSwapConfirmation(false);
                        setSwapStatus(null);
                      }}
                      className="px-6 py-2 bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}

                {swapStatus === "failed" && (
                  <div className="py-6 flex flex-col items-center">
                    <div className="w-16 h-16 bg-black border-4 border-red-500/50 rounded-full flex items-center justify-center mb-6">
                      <AlertTriangle className="h-10 w-10 text-red-400" />
                    </div>
                    <h3 className="text-xl uppercase mb-2">Swap Failed</h3>
                    <p className="text-white/60 text-center mb-2">
                      The swap transaction failed.
                    </p>
                    {swapError && (
                      <div className="bg-black border border-red-500/30 p-3 mb-5 w-full">
                        <p className="text-red-400 text-sm">{swapError}</p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowSwapConfirmation(false);
                          setSwapStatus(null);
                          setSwapError(null);
                        }}
                        className="px-6 py-2 bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          setSwapStatus(null);
                          setSwapError(null);
                        }}
                        className="px-6 py-2 bg-white text-black"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </main>
  );
};

export default NovaTokenomics;
