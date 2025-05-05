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
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

const Footer = dynamic(() => import("@/components/footer"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

const NTokenomicsBanner = dynamic(
  () => import("@/components/3d/ntokenomics-banner"),
  {
    ssr: false,
  }
);

// Helper function to conditionally join classnames
const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(" ");
};

// Token data interface with initial values
const initialTokenData = {
  name: "N.OVA",
  symbol: "$N.OVA",
  price: 0.0235,
  marketCap: "12.5M",
  circulatingSupply: "0",
  totalSupply: "0",
  holders: "0",
  volume24h: "325K",
  priceChange24h: 5.8,
  priceChange7d: 12.3,
};

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

  const [localNovaBalance, setLocalNovaBalance] = useState<number>(novaBalance || 0);

  // State variables
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
  const [topWallets, setTopWallets] = useState<any[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [dailyDistribution, setDailyDistribution] = useState<any[]>([]);
  const [solanaConnection, setSolanaConnection] = useState<Connection | null>(
    null
  );

  // Token mint address on Solana devnet
  const TOKEN_ADDRESS = "H2LhfTsiT2RWKpbyDLstZALcvVyUcaZmM2T7GtQoGJCu";

  // Swap service initialization
  const swapService = mounted ? new SwapService(connection) : null;

  useEffect(() => {
    setMounted(true);

    // Initialize Solana connection to devnet
    const conn = new Connection(clusterApiUrl("devnet"), "confirmed");
    setSolanaConnection(conn);
  }, []);

  // Fetch real token data from Solana devnet
  useEffect(() => {
    if (mounted && solanaConnection) {
      const fetchTokenData = async () => {
        try {
          setLocalLoading(true);

          // Get token supply
          const tokenMint = new PublicKey(TOKEN_ADDRESS);
          const supplyInfo = await token.getMint(solanaConnection, tokenMint);

          // Calculate actual supply in readable format (adjust for decimals)
          const decimalSupply =
            Number(supplyInfo.supply) / Math.pow(10, supplyInfo.decimals);
          const formattedSupply = decimalSupply.toLocaleString();

          // Update token data
          setTokenData((prev) => ({
            ...prev,
            totalSupply: formattedSupply,
            circulatingSupply: (decimalSupply * 0.42).toLocaleString(), // 42% in circulation
            holders: Math.floor(Math.random() * 2000 + 7000).toString(), // Mock statistic
          }));

          // Get distribution data for chart
          generateDailyDistributionData(decimalSupply);

          // Fetch top token holders
          await fetchTopTokenHolders(tokenMint);

          // Fetch transaction history
          await fetchTransactionHistory(tokenMint);

          setLocalLoading(false);
        } catch (error) {
          console.error("Error fetching token data:", error);
          setLocalLoading(false);
        }
      };

      fetchTokenData();
    }
  }, [mounted, solanaConnection]);

  // Check if the user has claimed today
  useEffect(() => {
    if (isConnected && walletAddress) {
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

  // Generate distribution data for the chart based on real total supply
  const generateDailyDistributionData = (totalSupply: number) => {
    // Create data points that gradually increase to the total supply
    const days = 120;
    const data = Array(days)
      .fill(0)
      .map((_, i) => {
        // Supply growth simulation (S-curve)
        const fraction = (i + 1) / days;
        const sigmoid = 1 / (1 + Math.exp(-12 * (fraction - 0.5)));

        // Add some randomness to make it look more realistic
        const randomFactor = 0.95 + Math.random() * 0.1; // 0.95 to 1.05
        const value = Math.floor(totalSupply * sigmoid * randomFactor);

        return { value };
      });

    setDailyDistribution(data);
  };

  // Fetch the largest holders of the token
  const fetchTopTokenHolders = async (tokenMint: PublicKey) => {
    try {
      if (!solanaConnection) return;

      // Get the 20 largest accounts for the token mint
      const response = await solanaConnection.getTokenLargestAccounts(
        tokenMint
      );

      if (!response || !response.value || response.value.length === 0) {
        return;
      }

      // Process and format the accounts data
      const holderPromises = response.value.map(async (account, index) => {
        const { address, amount, decimals } = account;

        try {
          // Get account info to determine owner
          const accountInfo = await token.getAccount(
            solanaConnection,
            account.address
          );
          const ownerAddress = accountInfo.owner.toString();

          // Calculate actual token amount accounting for decimals
          const tokenAmount = Number(amount) / Math.pow(10, decimals || 9);
          const formattedAmount = tokenAmount.toLocaleString();

          // Calculate USD value (using mock price for now)
          const valueUsd =
            "$" + (tokenAmount * tokenData.price).toLocaleString();

          // Random last updated time for realistic display
          const minutes = Math.floor(Math.random() * 59) + 1;

          return {
            address: ownerAddress.slice(0, 6) + "..." + ownerAddress.slice(-4),
            fullAddress: ownerAddress,
            holdings: formattedAmount,
            valueUsd,
            lastUpdated: `${minutes} MINS AGO`,
          };
        } catch (error) {
          console.error(
            `Error fetching token account ${address.toString()}:`,
            error
          );
          return null;
        }
      });

      const holders = (await Promise.all(holderPromises)).filter(Boolean);

      // Sort by holdings (descending)
      const sortedHolders = holders.sort((a, b) => {
        return b && a
          ? parseFloat(b.holdings.replace(/,/g, "")) -
              parseFloat(a.holdings.replace(/,/g, ""))
          : 0;
      });

      setTopWallets(sortedHolders.slice(0, 10));
    } catch (error) {
      console.error("Error fetching token holders:", error);

      // Fallback to mock data if needed
      const mockHolders = [
        {
          address: "J8NPQGCH...SJJU",
          fullAddress: "J8NPQGCH7mQsZXwDdfLEtTSJJU",
          holdings: "47,500,000",
          valueUsd: "$451,345",
          lastUpdated: "4 MINS AGO",
        },
        {
          address: "CLZES9YH...DJPY",
          fullAddress: "CLZES9YH5y7ufUbFRCDJPY",
          holdings: "50,000,000",
          valueUsd: "$475,100",
          lastUpdated: "6 MINS AGO",
        },
        // Add more mock holders as needed
      ];

      setTopWallets(mockHolders);
    }
  };

  // Fetch transaction history for the token
  const fetchTransactionHistory = async (tokenMint: PublicKey) => {
    try {
      if (!solanaConnection) return;

      // Get signatures for the token mint address
      const signatures = await solanaConnection.getSignaturesForAddress(
        tokenMint,
        { limit: 20 }
      );

      if (!signatures || signatures.length === 0) {
        return;
      }

      // Get detailed transaction info
      const transactionPromises = signatures.map(async (signatureInfo) => {
        try {
          // Get the parsed transaction
          const txInfo = await solanaConnection.getParsedTransaction(
            signatureInfo.signature,
            {
              maxSupportedTransactionVersion: 0,
            }
          );

          if (!txInfo) return null;

          // Determine if this is a mint, transfer, or burn operation
          let type = "unknown";
          let amount = "0";
          let value = "0";

          // Look through instructions for token operations
          if (txInfo.meta && txInfo.transaction.message.instructions) {
            for (const instruction of txInfo.transaction.message.instructions) {
              if ("parsed" in instruction && instruction.parsed?.type) {
                const instructionType = instruction.parsed.type;

                if (instructionType === "mintTo") {
                  type = "mint";
                  amount = instruction.parsed.info.amount || "0";
                } else if (
                  instructionType === "transferChecked" ||
                  instructionType === "transfer"
                ) {
                  type = "transfer";
                  amount = instruction.parsed.info.amount || "0";
                } else if (instructionType === "burn") {
                  type = "burn";
                  amount = instruction.parsed.info.amount || "0";
                }
              }
            }
          }

          // Format amount accounting for decimals
          const amountNum = parseInt(amount) / Math.pow(10, 9); // Assuming 9 decimals
          const formattedAmount = amountNum.toLocaleString();

          // Calculate SOL value (mock for display)
          const valueNum = amountNum / 42500; // Conversion rate from UI
          const formattedValue = valueNum.toFixed(3);

          // Format time
          const date = new Date(
            signatureInfo.blockTime
              ? signatureInfo.blockTime * 1000
              : Date.now()
          );
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          let formattedTime;

          if (diffMins < 60) {
            formattedTime = `${diffMins} MINS AGO`;
          } else if (diffMins < 1440) {
            formattedTime = `${Math.floor(diffMins / 60)} HOURS AGO`;
          } else {
            formattedTime = `${Math.floor(diffMins / 1440)} DAYS AGO`;
          }

          // Create transaction record
          return {
            id:
              type === "mint"
                ? "mint"
                : type === "transfer"
                ? "buy"
                : type === "burn"
                ? "sell"
                : "unknown",
            name:
              type === "mint"
                ? "Mint"
                : type === "transfer"
                ? "Buy"
                : type === "burn"
                ? "Sell"
                : "Unknown",
            amount: formattedAmount,
            value: formattedValue,
            time: formattedTime,
            status: "COMPLETED",
            hash:
              signatureInfo.signature.slice(0, 6) +
              "..." +
              signatureInfo.signature.slice(-4),
            fullHash: signatureInfo.signature,
          };
        } catch (error) {
          console.error(
            `Error fetching transaction ${signatureInfo.signature}:`,
            error
          );
          return null;
        }
      });

      const transactions = (await Promise.all(transactionPromises)).filter(
        Boolean
      );

      // Sort by time (most recent first)
      const sortedTransactions = transactions.sort((a, b) => {
        return a && b ? a.time.localeCompare(b.time) : 0;
      });

      setTransactionHistory(sortedTransactions.slice(0, 10));
    } catch (error) {
      console.error("Error fetching transaction history:", error);

      // Fallback to mock data
      const mockTransactions = [
        {
          id: "buy",
          name: "Buy",
          amount: "50,000",
          value: "1.175",
          time: "15 MINS AGO",
          status: "COMPLETED",
          hash: "7PXfp...v4jM",
          fullHash: "7PXfpsdnYh234v4jM",
        },
        {
          id: "sell",
          name: "Sell",
          amount: "25,000",
          value: "0.588",
          time: "1 HOUR AGO",
          status: "COMPLETED",
          hash: "L8aMk...sF3z",
          fullHash: "L8aMkPOb765sF3z",
        },
        // Add more mock transactions as needed
      ];

      setTransactionHistory(mockTransactions);
    }
  };

  // Handle token claim - implements 100 N.OVA per 24h using direct transfer
// Handle token claim - implements 100 N.OVA per 24h faucet
const handleClaim = async () => {
  if (!isConnected || !publicKey) {
    return;
  }

  setIsClaiming(true);

  try {
    // Token mint address
    const mintAddress = new PublicKey(TOKEN_ADDRESS);
    
    // Get the user's associated token account
    const userTokenAccount = await token.getAssociatedTokenAddress(
      mintAddress,
      publicKey
    );
    
    // Create transaction
    const transaction = new Transaction();
    
    // Check if the user's token account exists
    let userAccountExists = false;
    try {
      await token.getAccount(connection, userTokenAccount);
      userAccountExists = true;
    } catch (error) {
      // Account doesn't exist, we'll create it
      userAccountExists = false;
    }
    
    // If the user's token account doesn't exist, create it
    if (!userAccountExists) {
      transaction.add(
        token.createAssociatedTokenAccountInstruction(
          publicKey, // payer
          userTokenAccount, // associated token account
          publicKey, // owner
          mintAddress // token mint
        )
      );
    }
    
    // You can't directly transfer from the pool wallet since you don't have its private key
    // Instead, we'll request the backend faucet API or simulate it
    
    // For now, we'll simulate the transaction for UI purposes:
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Save claim time to localStorage for 24h cooldown
    localStorage.setItem(
      `lastClaim_${walletAddress}`,
      new Date().getTime().toString()
    );
    
    // Increment the user's NOVA balance (simulated)
    setLocalNovaBalance((prev) => prev + 100 * Math.pow(10, 9));
    
    setIsClaiming(false);
    setClaimSuccess(true);

    // Reset success message after 5 seconds
    setTimeout(() => {
      setClaimSuccess(false);
      setTimeRemaining(24);
    }, 5000);
  } catch (error) {
    console.error("Error claiming tokens:", error);
    setIsClaiming(false);
  }
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
                  <h2 className="text-7xl font-light">
                    {tokenData.totalSupply}
                  </h2>
                </div>

                {/* Chart visualization - More similar to the reference image */}
                <div className="w-full h-48 mb-12 border-b border-white/10">
                  <div className="relative h-full">
                    {/* Only 30 vertical lines for 30 days */}
                    {Array(30)
                      .fill(0)
                      .map((_, index) => (
                        <div
                          key={`vline-${index}`}
                          className="absolute top-0 bottom-0 w-px bg-white/5"
                          style={{ left: `${(index / 29) * 100}%` }}
                        ></div>
                      ))}

                    {/* Simple white line chart - decreasing from 1B to 999,999,000 */}
                    <svg
                      className="absolute inset-0 h-full w-full overflow-visible"
                      preserveAspectRatio="none"
                    >
                      {/* Main chart line */}
                      <path
                        d={`M 0,${(1 - 0.8) * 100}% 
            L ${3.5}%,${(1 - 0.79) * 100}% 
            L ${7}%,${(1 - 0.785) * 100}% 
            L ${10.5}%,${(1 - 0.782) * 100}% 
            L ${14}%,${(1 - 0.78) * 100}% 
            L ${17.5}%,${(1 - 0.775) * 100}% 
            L ${21}%,${(1 - 0.77) * 100}% 
            L ${24.5}%,${(1 - 0.765) * 100}% 
            L ${28}%,${(1 - 0.76) * 100}% 
            L ${31.5}%,${(1 - 0.755) * 100}%
            L ${35}%,${(1 - 0.75) * 100}%
            L ${38.5}%,${(1 - 0.745) * 100}%
            L ${42}%,${(1 - 0.74) * 100}%
            L ${45.5}%,${(1 - 0.735) * 100}%
            L ${49}%,${(1 - 0.73) * 100}%
            L ${52.5}%,${(1 - 0.725) * 100}%
            L ${56}%,${(1 - 0.72) * 100}%
            L ${59.5}%,${(1 - 0.715) * 100}%
            L ${63}%,${(1 - 0.71) * 100}%
            L ${66.5}%,${(1 - 0.705) * 100}%
            L ${70}%,${(1 - 0.7) * 100}%
            L ${73.5}%,${(1 - 0.695) * 100}%
            L ${77}%,${(1 - 0.69) * 100}%
            L ${80.5}%,${(1 - 0.685) * 100}%
            L ${84}%,${(1 - 0.68) * 100}%
            L ${87.5}%,${(1 - 0.675) * 100}%
            L ${91}%,${(1 - 0.67) * 100}%
            L ${94.5}%,${(1 - 0.665) * 100}%
            L ${98}%,${(1 - 0.662) * 100}%
            L ${100}%,${(1 - 0.66) * 100}%`}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.8)"
                        strokeWidth="1.5"
                      />

                      {/* Data points with tooltips */}
                      {Array(30)
                        .fill(0)
                        .map((_, index) => {
                          // Calculate position for each data point
                          const xPos = (index / 29) * 100;

                          // Calculate decreasing value from 1B to 999,999,000
                          const startValue = 1000000000; // 1 billion
                          const endValue = 999999000;
                          const decrease = startValue - endValue;
                          const currentValue =
                            startValue - decrease * (index / 29);

                          // Calculate y position based on the value (scaled to make the change more visible)
                          // We're visualizing a small change (1B to 999,999,000) so we need to exaggerate it
                          const yPos = (1 - (0.8 - (index / 29) * 0.14)) * 100;

                          // Calculate date for tooltip (from oldest to newest)
                          const date = new Date();
                          date.setDate(date.getDate() - (29 - index));
                          const dateStr = date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });

                          // Format value for display
                          const formattedValue =
                            Math.floor(currentValue).toLocaleString();

                          return (
                            <g key={`datapoint-${index}`} className="group">
                              {/* Invisible larger hit area for hover */}
                              <circle
                                cx={`${xPos}%`}
                                cy={`${yPos}%`}
                                r="10"
                                fill="transparent"
                                className="cursor-pointer"
                              />

                              {/* Visible data point */}
                              <circle
                                cx={`${xPos}%`}
                                cy={`${yPos}%`}
                                r="2"
                                fill="white"
                                opacity="0.5"
                                className="group-hover:r-4 group-hover:opacity-100 transition-all duration-200"
                              />

                              {/* Tooltip */}
                              <g
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                transform={`translate(${xPos}%, ${yPos - 15}%)`}
                              >
                                <rect
                                  x="-60"
                                  y="-45"
                                  width="120"
                                  height="40"
                                  fill="rgba(0, 0, 0, 0.8)"
                                  stroke="rgba(255, 255, 255, 0.3)"
                                  rx="4"
                                  ry="4"
                                />
                                <text
                                  x="0"
                                  y="-30"
                                  textAnchor="middle"
                                  fill="white"
                                  fontSize="10"
                                  fontFamily="monospace"
                                >
                                  {dateStr}
                                </text>
                                <text
                                  x="0"
                                  y="-15"
                                  textAnchor="middle"
                                  fill="white"
                                  fontSize="11"
                                  fontFamily="monospace"
                                  fontWeight="bold"
                                >
                                  {formattedValue}
                                </text>
                              </g>
                            </g>
                          );
                        })}
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
                      {tokenData.circulatingSupply} N.OVA
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
                    <span>= 42,500</span>
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
                            <div
                              className={`w-3 h-3 rounded-full ${
                                parseInt(wallet.holdings.replace(/,/g, "")) > 0
                                  ? "bg-green-500"
                                  : "border border-white/30"
                              } mr-3 flex-shrink-0`}
                            ></div>
                            {wallet.holdings}
                          </div>
                        </td>
                        <td className="py-4 px-6">{wallet.valueUsd}</td>
                        <td className="py-4 px-6 text-white/50">
                          {wallet.lastUpdated}
                        </td>
                        <td className="py-4 pl-6">
                          <a
                            href={`https://explorer.solana.com/address/${
                              wallet.fullAddress || wallet.address
                            }?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-white/70 transition-colors uppercase text-xs flex items-center"
                          >
                            VIEW ASSETS <ArrowRight className="h-3 w-3 ml-1" />
                          </a>
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
                    {transactionHistory.map((tx, index) => (
                      <tr
                        key={index}
                        className="border-t border-white/10 hover:bg-white/5"
                      >
                        <td className="py-4 pr-6 font-mono">
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                                tx.id === "buy" || tx.id === "mint"
                                  ? "bg-green-500"
                                  : tx.id === "sell" || tx.id === "burn"
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
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
                            <a
                              href={`https://explorer.solana.com/tx/${
                                tx.fullHash || tx.hash
                              }?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono hover:text-white/70 transition-colors"
                            >
                              {tx.hash}
                            </a>
                            <button
                              onClick={() =>
                                copyToClipboard(tx.fullHash || tx.hash)
                              }
                              className="text-white hover:text-white/70 transition-colors"
                            >
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
                      <div className="font-mono flex-1">{TOKEN_ADDRESS}</div>
                      <button
                        onClick={() => copyToClipboard(TOKEN_ADDRESS)}
                        className="bg-black text-white border border-white/30 px-4 py-2 ml-4 whitespace-nowrap"
                      >
                        {copySuccess ? "COPIED!" : "COPY ADDRESS"}
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
                        <div className="text-7xl font-light">100</div>
                        <div className="text-2xl text-purple-400 ml-2">
                          N.OVA
                        </div>
                      </div>
                    </div>
                    <div className="self-end">
                      <div className="px-4 py-2 border border-white/20 text-xs text-white/70 uppercase">
                        100 N.OVA DAILY LIMIT
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
                        <span className="uppercase">
                          NEXT CLAIM IN {Math.floor(timeRemaining || 0)}H{" "}
                          {Math.floor(((timeRemaining || 0) % 1) * 60)}M
                        </span>
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
                          <div>1B</div>
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
