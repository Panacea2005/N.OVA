"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Send,
  Wallet,
  Search,
  ExternalLink,
  Loader,
  Flame,
  Database,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { usePhantom } from "@/hooks/use-phantom";
import { useRouter } from "next/navigation";
import { 
  Transaction, 
  SystemProgram, 
  PublicKey, 
  LAMPORTS_PER_SOL, 
  TransactionInstruction 
} from "@solana/web3.js";
import { 
  createTransferInstruction, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  createBurnInstruction,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";

const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

const Footer = dynamic(() => import("@/components/footer"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

const NTransferBanner = dynamic(() => import("@/components/3d/ntransfer-banner"), {
  ssr: false,
});

// Helper function to conditionally join classnames
const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(" ");
};

// Helper to validate Solana addresses
const isValidSolanaAddress = (address: string) => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

// Helper to truncate address
const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 8)}...${address.slice(-5)}`;
};

// Helper to format balance with appropriate decimals and commas
const formatBalance = (balance: number | bigint, decimals: number = 9) => {
  if (typeof balance === 'bigint') {
    balance = Number(balance);
  }
  
  // Convert to decimal value
  const divisor = Math.pow(10, decimals);
  const decimalValue = balance / divisor;
  
  // Format with proper commas
  return decimalValue.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
  });
};

// Helper to get explorer URL based on network
const getExplorerUrl = (signature: string, cluster: string = 'mainnet-beta') => {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
};

// Known burnable tokens - in a real app, this would come from a database or API
const BURNABLE_TOKENS = [
  "H2LhfTsiT2RWKpbyDLstZALcvVyUcaZmM2T7GtQoGJCu", // NOVA token
];

interface Token {
  symbol: string;
  name: string;
  balance: number | bigint;
  decimals: number;
  price: number;
  change24h: number;
  logo: string;
  mint: string;
  tokenAccount?: string;
  isBurnable: boolean;
}

interface TransactionHistoryItem {
  id: string;
  date: string;
  token: string;
  tokenMint: string;
  amount: number;
  recipient: string;
  status: "completed" | "pending" | "failed";
  type: "transfer" | "burn";
}

const TokenTransfer = () => {
  const router = useRouter();
  const transferSectionRef = useRef<HTMLDivElement>(null);
  
  const {
    walletAddress,
    publicKey,
    isConnected,
    balance: solBalance,
    novaBalance,
    isLoading: walletLoading,
    connectWallet,
    signAndSendTransaction,
    refreshBalances,
    connection,
  } = usePhantom();

  const [mounted, setMounted] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientAddressError, setRecipientAddressError] = useState("");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showBurnConfirmation, setShowBurnConfirmation] = useState(false);
  const [burnToken, setBurnToken] = useState<Token | null>(null);
  const [burnAmount, setBurnAmount] = useState("");
  const [transferStatus, setTransferStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [transferHistory, setTransferHistory] = useState<TransactionHistoryItem[]>([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState(0);
  const [network, setNetwork] = useState<string>("mainnet-beta");
  
  // User tokens state
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll to transfer section when a token is selected from the list
  useEffect(() => {
    if (selectedToken && transferSectionRef.current) {
      transferSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedToken]);

  // Fetch token data when wallet is connected
  useEffect(() => {
    if (mounted && isConnected && publicKey) {
      fetchUserTokens();
      detectNetwork();
    }
  }, [mounted, isConnected, publicKey]);

  // Calculate portfolio value whenever user tokens change
  useEffect(() => {
    let value = 0;
    for (const token of userTokens) {
      const tokenAmount = typeof token.balance === 'bigint' 
        ? Number(token.balance) / Math.pow(10, token.decimals) 
        : token.balance / Math.pow(10, token.decimals);
      value += tokenAmount * token.price;
    }
    
    setPortfolioValue(value);
    
    // Calculate weighted average change
    const totalValue = value;
    let weightedChange = 0;
    
    for (const token of userTokens) {
      const tokenAmount = typeof token.balance === 'bigint' 
        ? Number(token.balance) / Math.pow(10, token.decimals) 
        : token.balance / Math.pow(10, token.decimals);
      const tokenValue = tokenAmount * token.price;
      const weight = totalValue > 0 ? tokenValue / totalValue : 0;
      weightedChange += token.change24h * weight;
    }
    
    setPortfolioChange(totalValue > 0 ? weightedChange : 0);
  }, [userTokens]);

  // Validate amount whenever it changes
  useEffect(() => {
    if (!amount || !selectedToken) {
      setAmountError("");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError("Please enter a valid amount");
      return;
    }

    const tokenDecimals = selectedToken.decimals;
    const tokenAmount = parsedAmount * Math.pow(10, tokenDecimals);
    
    let balance: number;
    if (typeof selectedToken.balance === 'bigint') {
      balance = Number(selectedToken.balance);
    } else {
      balance = selectedToken.balance;
    }
    
    if (tokenAmount > balance) {
      setAmountError("Insufficient balance");
      return;
    }

    setAmountError("");
  }, [amount, selectedToken]);

  // Validate recipient address whenever it changes
  useEffect(() => {
    if (!recipientAddress) {
      setRecipientAddressError("");
      return;
    }

    if (!isValidSolanaAddress(recipientAddress)) {
      setRecipientAddressError("Invalid Solana address");
      return;
    }

    setRecipientAddressError("");
  }, [recipientAddress]);

  // Detect network - mainnet, testnet, or devnet
  const detectNetwork = async () => {
    if (!connection) return;
    
    try {
      // Get genesis hash to determine network
      const genesisHash = await connection.getGenesisHash();
      
      // These are the known genesis hashes
      const MAINNET_GENESIS = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";
      const TESTNET_GENESIS = "4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY";
      const DEVNET_GENESIS = "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG";
      
      if (genesisHash === MAINNET_GENESIS) {
        setNetwork("mainnet-beta");
      } else if (genesisHash === TESTNET_GENESIS) {
        setNetwork("testnet");
      } else if (genesisHash === DEVNET_GENESIS) {
        setNetwork("devnet");
      } else {
        setNetwork("custom");
      }
    } catch (error) {
      console.error("Failed to detect network:", error);
      setNetwork("mainnet-beta"); // Fallback
    }
  };

  // Function to fetch token prices from an API (simulated)
  const fetchTokenPrices = async (mintAddresses: string[]) => {
    // In a real app, you would fetch from a price API like CoinGecko or a custom backend
    // For this example, we'll return mock prices
    
    // Default prices for known tokens (in USD)
    const knownPrices: Record<string, {price: number, change24h: number}> = {
      "So11111111111111111111111111111111111111112": { price: 123.45, change24h: 2.8 }, // SOL
      "H2LhfTsiT2RWKpbyDLstZALcvVyUcaZmM2T7GtQoGJCu": { price: 0.87, change24h: 5.3 }, // NOVA
    };
    
    // Create a result object with prices for each mint
    const result: Record<string, {price: number, change24h: number}> = {};
    
    mintAddresses.forEach(mint => {
      if (knownPrices[mint]) {
        result[mint] = knownPrices[mint];
      } else {
        // For unknown tokens, generate a random price between $0.001 and $5
        const randomPrice = 0.001 + Math.random() * 4.999;
        const randomChange = Math.random() * 20 - 10; // -10% to +10%
        
        result[mint] = {
          price: parseFloat(randomPrice.toFixed(6)),
          change24h: parseFloat(randomChange.toFixed(2))
        };
      }
    });
    
    return result;
  };

  // Function to fetch user tokens
  const fetchUserTokens = async () => {
    if (!publicKey || !connection) return;
    
    try {
      setTokenLoading(true);
      
      // Fetch SOL token first
      const solTokenAmount = await connection.getBalance(publicKey);
      
      // Create token list starting with SOL
      const solToken: Token = {
        symbol: "SOL",
        name: "Solana",
        balance: solTokenAmount,
        decimals: 9,
        price: 0, // Will be updated
        change24h: 0, // Will be updated
        logo: "/partners/solana.svg",
        mint: "So11111111111111111111111111111111111111112", // Native SOL mint address
        isBurnable: false // SOL can't be burned
      };
      
      const tokenList: Token[] = [solToken];
      
      // Fetch token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );
      
      // Process each token account and gather all mint addresses
      const mintAddresses: string[] = [solToken.mint];
      
      for (const { account, pubkey } of tokenAccounts.value) {
        const parsedAccountInfo = account.data.parsed.info;
        const mintAddress = parsedAccountInfo.mint;
        const tokenBalance = parsedAccountInfo.tokenAmount.amount;
        const tokenDecimals = parsedAccountInfo.tokenAmount.decimals;
        
        // Skip tokens with zero balance
        if (parsedAccountInfo.tokenAmount.uiAmount === 0) continue;
        
        // Skip NFTs (tokens with 0 decimals and typically low supply)
        if (tokenDecimals === 0) continue;
        
        // Add to list of mint addresses to fetch prices for
        mintAddresses.push(mintAddress);
        
        // Add token to list with placeholder info
        tokenList.push({
          symbol: mintAddress.slice(0, 4).toUpperCase(),
          name: `Token ${mintAddress.slice(0, 8)}...`,
          balance: tokenBalance,
          decimals: tokenDecimals,
          price: 0, // Will be updated
          change24h: 0, // Will be updated
          logo: "/images/unknown-token.png",
          mint: mintAddress,
          tokenAccount: pubkey.toBase58(),
          isBurnable: BURNABLE_TOKENS.includes(mintAddress)
        });
      }
      
      // Update token names and symbols for known tokens
      const knownTokens: Record<string, {symbol: string, name: string, logo: string}> = {
        "H2LhfTsiT2RWKpbyDLstZALcvVyUcaZmM2T7GtQoGJCu": {
          symbol: "NOVA",
          name: "N.OVA",
          logo: "/images/logo.png"
        },
        // Add more known tokens here
      };
      
      for (const token of tokenList) {
        if (knownTokens[token.mint]) {
          token.symbol = knownTokens[token.mint].symbol;
          token.name = knownTokens[token.mint].name;
          token.logo = knownTokens[token.mint].logo;
        }
      }
      
      // Fetch prices for all tokens
      const prices = await fetchTokenPrices(mintAddresses);
      
      // Update token list with prices
      for (const token of tokenList) {
        if (prices[token.mint]) {
          token.price = prices[token.mint].price;
          token.change24h = prices[token.mint].change24h;
        }
      }
      
      setUserTokens(tokenList);
      
      // Fetch transaction history
      fetchTransactionHistory();
      
    } catch (error) {
      console.error("Error fetching token data:", error);
    } finally {
      setTokenLoading(false);
    }
  };
  
  // Function to fetch transaction history
  const fetchTransactionHistory = async () => {
    if (!publicKey || !connection) return;
    
    try {
      setLocalLoading(true);
      
      // Get recent transactions for the wallet
      const signatures = await connection.getSignaturesForAddress(
        publicKey,
        { limit: 10 }
      );
      
      const history: TransactionHistoryItem[] = [];
      
      // Process each transaction
      for (const { signature, slot, err } of signatures) {
        try {
          // Get transaction details
          const tx = await connection.getParsedTransaction(signature, {
            maxSupportedTransactionVersion: 0,
          });
          
          if (!tx || !tx.meta) continue;
          
          // Skip failed transactions
          if (tx.meta.err !== null) {
            // You could add these as failed transactions if desired
            continue;
          }
          
          // Process transaction instructions
          const instructions = tx.transaction.message.instructions;
          
          for (const ix of instructions) {
            let isTransfer = false;
            let isBurn = false;
            let amount = 0;
            let recipient = '';
            let tokenMint = '';
            let tokenSymbol = '';
            
            if ('parsed' in ix && ix.parsed.type === 'transfer') {
              // SOL transfer
              if (ix.program === 'system') {
                isTransfer = true;
                amount = ix.parsed.info.lamports / LAMPORTS_PER_SOL;
                recipient = ix.parsed.info.destination;
                tokenMint = 'So11111111111111111111111111111111111111112';
                tokenSymbol = 'SOL';
              } 
              // SPL token transfer
              else if (ix.program === 'spl-token' && ix.parsed.info.authority === publicKey.toString()) {
                isTransfer = true;
                amount = ix.parsed.info.amount;
                recipient = ix.parsed.info.destination;
                
                // Try to find the mint from user tokens
                for (const token of userTokens) {
                  if (token.tokenAccount === ix.parsed.info.source) {
                    tokenMint = token.mint;
                    tokenSymbol = token.symbol;
                    amount = Number(amount) / Math.pow(10, token.decimals);
                    break;
                  }
                }
                
                // If token not found, use generic label
                if (!tokenSymbol) {
                  tokenSymbol = 'TOKEN';
                }
              }
            }
            // Burn instruction
            else if ('parsed' in ix && ix.parsed.type === 'burn' && ix.program === 'spl-token') {
              isBurn = true;
              amount = ix.parsed.info.amount;
              tokenMint = ix.parsed.info.mint;
              
              // Find token info
              for (const token of userTokens) {
                if (token.mint === tokenMint) {
                  tokenSymbol = token.symbol;
                  amount = Number(amount) / Math.pow(10, token.decimals);
                  break;
                }
              }
              
              // If token not found, use generic label
              if (!tokenSymbol) {
                tokenSymbol = 'TOKEN';
              }
            }
            
            if (isTransfer || isBurn) {
              history.push({
                id: signature,
                date: new Date(tx.blockTime! * 1000).toISOString(),
                token: tokenSymbol,
                tokenMint,
                amount,
                recipient: isTransfer ? recipient : 'Burned',
                status: 'completed',
                type: isTransfer ? 'transfer' : 'burn'
              });
            }
          }
        } catch (error) {
          console.error(`Error processing transaction ${signature}:`, error);
        }
      }
      
      setTransferHistory(history);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Filter tokens based on search query
  const filteredTokens = userTokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Select token for transfer
  const handleSelectToken = (token: Token) => {
    setSelectedToken(token);
    // Scroll to transfer section
    if (transferSectionRef.current) {
      transferSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle transfer submission
  const handleTransfer = () => {
    // Reset errors
    setAmountError("");
    setRecipientAddressError("");
    setStatusMessage("");
    
    if (!selectedToken) {
      setStatusMessage("Please select a token");
      return;
    }
    
    if (!recipientAddress) {
      setRecipientAddressError("Please enter a recipient address");
      return;
    }
    
    if (!amount) {
      setAmountError("Please enter an amount");
      return;
    }
    
    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError("Please enter a valid amount");
      return;
    }
    
    // Convert to token amount with decimals
    const tokenDecimals = selectedToken.decimals;
    const tokenAmount = parsedAmount * Math.pow(10, tokenDecimals);
    
    let balance: number;
    if (typeof selectedToken.balance === 'bigint') {
      balance = Number(selectedToken.balance);
    } else {
      balance = selectedToken.balance;
    }
    
    if (tokenAmount > balance) {
      setAmountError("Insufficient balance");
      return;
    }
    
    // Validate recipient address
    if (!isValidSolanaAddress(recipientAddress)) {
      setRecipientAddressError("Invalid Solana address");
      return;
    }
    
    // Show confirmation modal
    setShowConfirmation(true);
  };

  // Show burn confirmation modal
  const handleBurnToken = (token: Token) => {
    setBurnToken(token);
    setBurnAmount("");
    setShowBurnConfirmation(true);
  };

  // Execute burn
  const confirmBurn = async () => {
    if (!burnToken || !publicKey || !connection) return;
    
    setTransferStatus("loading");
    setShowBurnConfirmation(false);
    
    try {
      const parsedAmount = parseFloat(burnAmount);
      
      // Validate amount
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Please enter a valid amount");
      }
      
      // Convert to token amount with decimals
      const tokenAmount = BigInt(Math.floor(parsedAmount * Math.pow(10, burnToken.decimals)));
      
      let balance: bigint;
      if (typeof burnToken.balance === 'bigint') {
        balance = burnToken.balance;
      } else {
        balance = BigInt(burnToken.balance);
      }
      
      if (tokenAmount > balance) {
        throw new Error("Insufficient balance");
      }
      
      // Create transaction
      let transaction = new Transaction();
      
      // Get token account
      if (!burnToken.tokenAccount) {
        throw new Error("Token account not found");
      }
      
      const tokenAccountPubkey = new PublicKey(burnToken.tokenAccount);
      const mintPubkey = new PublicKey(burnToken.mint);
      
      // Add burn instruction
      transaction.add(
        createBurnInstruction(
          tokenAccountPubkey,
          mintPubkey,
          publicKey,
          tokenAmount
        )
      );
      
      // Sign and send transaction
      const signature = await signAndSendTransaction(transaction);
      
      // Update status
      setTransferStatus("success");
      setStatusMessage(`Successfully burned ${parsedAmount} ${burnToken.symbol}`);
      
      // Add to history
      setTransferHistory([
        {
          id: signature,
          date: new Date().toISOString(),
          token: burnToken.symbol,
          tokenMint: burnToken.mint,
          amount: parsedAmount,
          recipient: "Burned",
          status: "completed",
          type: "burn"
        },
        ...transferHistory,
      ]);
      
      // Refresh token balances
      await refreshBalances();
      await fetchUserTokens();
      
      // Reset form
      setBurnToken(null);
      setBurnAmount("");
      
    } catch (error) {
      console.error("Burn error:", error);
      setTransferStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Transaction failed. Please try again.");
    }
    
    // Reset status after delay for success
    if (transferStatus === "success") {
      setTimeout(() => {
        setTransferStatus("idle");
        setStatusMessage("");
      }, 5000);
    }
  };

  // Confirm and execute transfer
  const confirmTransfer = async () => {
    if (!selectedToken || !publicKey || !connection) return;
    
    setTransferStatus("loading");
    setShowConfirmation(false);
    
    try {
      const parsedAmount = parseFloat(amount);
      const tokenDecimals = selectedToken.decimals;
      const tokenAmount = Math.floor(parsedAmount * Math.pow(10, tokenDecimals));
      const recipientPubkey = new PublicKey(recipientAddress);
      
      // Create transaction
      let transaction = new Transaction();
      
      // Handle SOL transfer differently
      if (selectedToken.symbol === "SOL") {
        // For native SOL
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipientPubkey,
            lamports: tokenAmount
          })
        );
      } else {
        // For SPL tokens
        const mintPubkey = new PublicKey(selectedToken.mint);
        
        // Get source token account
        const sourceTokenAccount = await getAssociatedTokenAddress(
          mintPubkey,
          publicKey
        );
        
        // Get destination token account
        const destinationTokenAccount = await getAssociatedTokenAddress(
          mintPubkey,
          recipientPubkey
        );
        
        // Check if destination token account exists
        let destinationAccountExists = false;
        try {
          await connection.getTokenAccountBalance(destinationTokenAccount);
          destinationAccountExists = true;
        } catch (error) {
          destinationAccountExists = false;
        }
        
        // If it doesn't exist, add instruction to create it
        if (!destinationAccountExists) {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              publicKey,
              destinationTokenAccount,
              recipientPubkey,
              mintPubkey
            )
          );
        }
        
        // Add transfer instruction
        transaction.add(
          createTransferInstruction(
            sourceTokenAccount,
            destinationTokenAccount,
            publicKey,
            BigInt(tokenAmount)
          )
        );
      }
      
      // Sign and send transaction
      const signature = await signAndSendTransaction(transaction);
      
      // Update status
      setTransferStatus("success");
      setStatusMessage(`Successfully transferred ${parsedAmount} ${selectedToken.symbol} to ${truncateAddress(recipientAddress)}`);
      
      // Add to history
      setTransferHistory([
        {
          id: signature,
          date: new Date().toISOString(),
          token: selectedToken.symbol,
          tokenMint: selectedToken.mint,
          amount: parsedAmount,
          recipient: recipientAddress,
          status: "completed",
          type: "transfer"
        },
        ...transferHistory,
      ]);
      
      // Refresh token balances
      await refreshBalances();
      await fetchUserTokens();
      
      // Reset form
      setSelectedToken(null);
      setRecipientAddress("");
      setAmount("");
      
    } catch (error) {
      console.error("Transfer error:", error);
      setTransferStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Transaction failed. Please try again.");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Handle max amount button click
  const handleMaxAmount = () => {
    if (!selectedToken) return;
    
    let maxAmount: number;
    
    if (typeof selectedToken.balance === 'bigint') {
      maxAmount = Number(selectedToken.balance) / Math.pow(10, selectedToken.decimals);
    } else {
      maxAmount = selectedToken.balance / Math.pow(10, selectedToken.decimals);
    }
    
    // For SOL, keep some for fees
    if (selectedToken.symbol === "SOL") {
      const adjustedMax = Math.max(0, maxAmount - 0.01); // Leave 0.01 SOL for fees
      setAmount(adjustedMax.toString());
    } else {
      setAmount(maxAmount.toString());
    }
  };
  
  // Handle max amount for burn
  const handleMaxBurnAmount = () => {
    if (!burnToken) return;
    
    let maxAmount: number;
    
    if (typeof burnToken.balance === 'bigint') {
      maxAmount = Number(burnToken.balance) / Math.pow(10, burnToken.decimals);
    } else {
      maxAmount = burnToken.balance / Math.pow(10, burnToken.decimals);
    }
    
    setBurnAmount(maxAmount.toString());
  };
  
  // Handle connect wallet click
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Connect wallet error:", error);
    }
  };

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
          {/* N.TRANSFER Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-10"
          >
            <NTransferBanner />
          </motion.div>

          {/* Main Header */}
          <div className="mb-16">
            <h1 className="text-8xl font-light mb-6">TRANSFER</h1>
            <p className="text-white/70 uppercase max-w-4xl">
              TRANSFER YOUR TOKENS SECURELY TO ANY SOLANA WALLET ADDRESS.
            </p>
            <p className="text-white/70 uppercase max-w-4xl mt-2">
              TRACK YOUR TRANSACTION HISTORY AND MANAGE YOUR PORTFOLIO EFFECTIVELY.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Wallet Overview */}
            <div className="border border-white/30 p-0.5 col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="border border-white/10 p-6 h-full"
              >
                <h2 className="text-2xl font-light mb-6">WALLET OVERVIEW</h2>
                
                {!isConnected ? (
                  <div className="flex flex-col items-center justify-center py-8 border border-white/10">
                    <Wallet className="w-12 h-12 mb-4 text-white/50" />
                    <p className="text-white/70 mb-4">No wallet connected</p>
                    <button 
                      onClick={handleConnectWallet}
                      className="bg-white text-black px-6 py-2 uppercase hover:bg-white/90 transition-colors"
                    >
                      CONNECT WALLET
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <p className="text-white/60 uppercase text-xs mb-2">YOUR ADDRESS</p>
                      <div className="flex items-center justify-between bg-white/5 p-3 border border-white/10">
                        <span className="font-mono text-sm overflow-hidden text-ellipsis">{truncateAddress(walletAddress || "")}</span>
                        <button 
                          onClick={() => copyToClipboard(walletAddress || "")}
                          className="text-white/70 hover:text-white transition-colors ml-2 flex-shrink-0"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      {copySuccess && (
                        <p className="text-green-400 text-xs mt-1">Address copied</p>
                      )}
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-white/60 uppercase text-xs">PORTFOLIO VALUE</p>
                        <div className="flex items-center">
                          <span className="text-white/60 text-xs mr-2">{network}</span>
                          <button 
                            onClick={refreshBalances}
                            className="text-white/70 hover:text-white transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-3xl font-light mb-1 overflow-hidden text-ellipsis">
                        ${portfolioValue.toLocaleString(undefined, {maximumFractionDigits: 2})}
                      </p>
                      <p className={cn(
                        portfolioChange >= 0 ? "text-green-400" : "text-red-400",
                        "text-sm"
                      )}>
                        {portfolioChange >= 0 ? "+" : ""}{portfolioChange.toFixed(2)}% past 24h
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-white/60 uppercase text-xs">TOKEN COUNT</p>
                        <span className="text-white/90">{userTokens.length}</span>
                      </div>
                      
                      {userTokens.find(t => t.symbol === "SOL") && (
                        <div className="flex justify-between items-center border border-white/10 p-2 rounded">
                          <div className="flex items-center">
                            <img 
                              src="/partners/solana.svg" 
                              alt="SOL" 
                              className="w-5 h-5 rounded-full mr-2" 
                            />
                            <p className="text-white/90 text-sm">SOL</p>
                          </div>
                          <span className="text-white/90 text-sm font-mono overflow-hidden text-ellipsis max-w-32 text-right">
                            {formatBalance(userTokens.find(t => t.symbol === "SOL")?.balance || 0)}
                          </span>
                        </div>
                      )}
                      
                      {userTokens.find(t => t.symbol === "NOVA") && (
                        <div className="flex justify-between items-center border border-white/10 p-2 rounded">
                          <div className="flex items-center">
                            <img 
                              src="/images/logo.png" 
                              alt="NOVA" 
                              className="w-5 h-5 rounded-full mr-2" 
                            />
                            <p className="text-white/90 text-sm">NOVA</p>
                          </div>
                          <span className="text-white/90 text-sm font-mono overflow-hidden text-ellipsis max-w-32 text-right">
                            {formatBalance(userTokens.find(t => t.symbol === "NOVA")?.balance || 0, 9)}
                          </span>
                        </div>
                      )}
                      
                      {userTokens.length > 2 && (
                        <div className="flex justify-between items-center border border-white/10 p-2 rounded">
                          <div className="flex items-center">
                            <Database className="w-5 h-5 mr-2 text-white/50" />
                            <p className="text-white/60 text-sm">Other Tokens</p>
                          </div>
                          <span className="text-white/60 text-sm">
                            {userTokens.length - 2}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Transfer Form */}
            <div className="border border-white/30 p-0.5 col-span-2" ref={transferSectionRef}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="border border-white/10 p-6 h-full"
              >
                <h2 className="text-2xl font-light mb-6">TRANSFER TOKENS</h2>

                {!isConnected ? (
                  <div className="flex flex-col items-center justify-center py-8 border border-white/10">
                    <p className="text-white/70 mb-4">Connect your wallet to transfer tokens</p>
                    <button 
                      onClick={handleConnectWallet}
                      className="bg-white text-black px-6 py-2 uppercase hover:bg-white/90 transition-colors"
                    >
                      CONNECT WALLET
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Token Selection */}
                    <div className="mb-6">
                      <label className="text-white/60 uppercase text-xs mb-2 block">SELECT TOKEN</label>
                      <div 
                        className={cn(
                          "border border-white/20 p-4",
                          selectedToken ? "bg-white/5" : "",
                        )}
                      >
                        {selectedToken ? (
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <img 
                                src={selectedToken.logo} 
                                alt={selectedToken.name} 
                                className="w-8 h-8 rounded-full mr-3"
                              />
                              <div>
                                <div className="font-medium">{selectedToken.symbol}</div>
                                <div className="text-white/60 text-sm">{selectedToken.name}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono overflow-hidden text-ellipsis max-w-32">
                                {formatBalance(selectedToken.balance, selectedToken.decimals)}
                              </div>
                              <div className="text-white/60 text-sm">
                                ${(amount && !isNaN(parseFloat(amount)) 
                                  ? (selectedToken.price * parseFloat(amount)).toLocaleString(undefined, { maximumFractionDigits: 2 })
                                  : '0.00')}
                              </div>
                            </div>
                            <button 
                              onClick={() => setSelectedToken(null)}
                              className="ml-4 text-white/70 hover:text-white transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => document.getElementById('token-list')?.scrollIntoView({ behavior: 'smooth' })}
                            className="flex justify-between items-center w-full"
                          >
                            <span className="text-white/80">Select a token</span>
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Recipient Address */}
                    <div className="mb-6">
                      <label className="text-white/60 uppercase text-xs mb-2 block">RECIPIENT ADDRESS</label>
                      <input
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="Enter Solana wallet address"
                        className="w-full bg-transparent border border-white/20 p-4 font-mono text-white/90 focus:outline-none focus:border-white/50"
                      />
                      {recipientAddressError && (
                        <p className="text-red-400 text-xs mt-1">{recipientAddressError}</p>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="mb-8">
                      <label className="text-white/60 uppercase text-xs mb-2 block">AMOUNT</label>
                      <div className="flex border border-white/20">
                        <input
                          type="text"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.0"
                          className="flex-1 bg-transparent p-4 font-mono text-white/90 focus:outline-none"
                          disabled={!selectedToken}
                        />
                        {selectedToken && (
                          <div className="flex items-center px-4">
                            <button 
                              onClick={handleMaxAmount}
                              className="text-white/60 hover:text-white text-xs uppercase transition-colors"
                            >
                              MAX
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {amountError && (
                        <p className="text-red-400 text-xs mt-1">{amountError}</p>
                      )}

                      {selectedToken && (
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-white/60">
                            Available: {formatBalance(selectedToken.balance, selectedToken.decimals)} {selectedToken.symbol}
                          </span>
                          <span className="text-white/60">
                            ≈ ${amount && !isNaN(parseFloat(amount)) ? 
                              (parseFloat(amount) * selectedToken.price).toLocaleString(undefined, {maximumFractionDigits: 2}) : 
                              '0.00'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Transfer Button */}
                    <div>
                      {statusMessage && (
                        <div className={cn(
                          "p-3 mb-4 text-sm border flex items-center",
                          transferStatus === "success" ? "border-green-500/30 text-green-400" : 
                          transferStatus === "error" ? "border-red-500/30 text-red-400" : 
                          "border-yellow-500/30 text-yellow-400"
                        )}>
                          {transferStatus === "success" ? (
                            <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
                          ) : transferStatus === "error" ? (
                            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                          ) : (
                            <Info className="w-4 h-4 mr-2 flex-shrink-0" />
                          )}
                          <span className="flex-1">{statusMessage}</span>
                        </div>
                      )}
                      
                      <button
                        onClick={handleTransfer}
                        disabled={!selectedToken || !recipientAddress || !amount || !!recipientAddressError || !!amountError || transferStatus === "loading"}
                        className={cn(
                          "w-full py-4 uppercase font-medium text-center flex justify-center items-center",
                          !selectedToken || !recipientAddress || !amount || !!recipientAddressError || !!amountError || transferStatus === "loading"
                            ? "bg-white/20 text-white/50 cursor-not-allowed"
                            : "bg-white text-black hover:bg-white/90 transition-colors"
                        )}
                      >
                        {transferStatus === "loading" ? (
                          <>
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            PROCESSING...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            TRANSFER TOKENS
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Your Tokens Section */}
          <div className="border border-white/30 p-0.5 mb-8" id="token-list">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="border border-white/10 px-6 py-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-5xl font-light">Your Tokens</h2>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tokens"
                    className="bg-transparent border border-white/20 py-2 pl-10 pr-4 w-64 text-white/90 focus:outline-none focus:border-white/50"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                </div>
              </div>

              {tokenLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader className="w-8 h-8 animate-spin text-white/50" />
                </div>
              ) : !isConnected ? (
                <div className="flex flex-col items-center justify-center py-12 border border-white/10">
                  <Wallet className="w-12 h-12 mb-4 text-white/50" />
                  <p className="text-white/70 mb-4">Connect your wallet to view your tokens</p>
                  <button 
                    onClick={handleConnectWallet}
                    className="bg-white text-black px-6 py-2 uppercase hover:bg-white/90 transition-colors"
                  >
                    CONNECT WALLET
                  </button>
                </div>
              ) : filteredTokens.length === 0 ? (
                <div className="text-center py-12 border border-white/10">
                  <p className="text-white/70 mb-2">No tokens found</p>
                  <p className="text-white/50 text-sm">Try a different search term or refresh your wallet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left text-white/50 uppercase text-xs">
                        <th className="pb-4 pl-4">TOKEN</th>
                        <th className="pb-4 px-6">BALANCE</th>
                        <th className="pb-4 px-6">PRICE</th>
                        <th className="pb-4 px-6">VALUE</th>
                        <th className="pb-4 px-6">24H</th>
                        <th className="pb-4 pr-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTokens.map((token, index) => {
                        // Calculate actual decimal value
                        const tokenBalance = typeof token.balance === 'bigint' 
                          ? Number(token.balance) / Math.pow(10, token.decimals) 
                          : token.balance / Math.pow(10, token.decimals);
                        
                        // Calculate USD value
                        const usdValue = tokenBalance * token.price;
                        
                        return (
                          <tr
                            key={index}
                            className="border-t border-white/10 hover:bg-white/5 cursor-pointer"
                            onClick={() => handleSelectToken(token)}
                          >
                            <td className="py-6 pl-4">
                              <div className="flex items-center">
                                <img
                                  src={token.logo}
                                  alt={token.name}
                                  className="w-8 h-8 rounded-full mr-3"
                                />
                                <div>
                                  <div className="font-medium">{token.symbol}</div>
                                  <div className="text-white/60 text-sm">{token.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-6 px-6">
                              <div className="font-mono overflow-hidden text-ellipsis">
                                {formatBalance(token.balance, token.decimals)}
                              </div>
                            </td>
                            <td className="py-6 px-6">
                              <div className="font-mono">${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</div>
                            </td>
                            <td className="py-6 px-6">
                              <div className="font-mono">${usdValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                            </td>
                            <td className="py-6 px-6">
                              <div className={token.change24h >= 0 ? "text-green-400" : "text-red-400"}>
                                {token.change24h >= 0 ? "+" : ""}{token.change24h}%
                              </div>
                            </td>
                            <td className="py-6 pr-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <button 
                                  className="bg-white/10 text-white hover:bg-white/20 transition-colors px-4 py-2 uppercase text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectToken(token);
                                  }}
                                >
                                  TRANSFER
                                </button>
                                
                                {token.isBurnable && (
                                  <button 
                                    className="bg-red-500/30 text-white hover:bg-red-500/50 transition-colors px-4 py-2 uppercase text-xs flex items-center"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleBurnToken(token);
                                    }}
                                  >
                                    <Flame className="w-3 h-3 mr-1" />
                                    BURN
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>

          {/* Transfer History Section */}
          <div className="border border-white/30 p-0.5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="border border-white/10 px-6 py-8"
            >
              <h2 className="text-5xl font-light mb-8">Transfer History</h2>

              {localLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader className="w-8 h-8 animate-spin text-white/50" />
                </div>
              ) : !isConnected ? (
                <div className="flex flex-col items-center justify-center py-12 border border-white/10">
                  <Wallet className="w-12 h-12 mb-4 text-white/50" />
                  <p className="text-white/70 mb-4">Connect your wallet to view your transfer history</p>
                  <button 
                    onClick={handleConnectWallet}
                    className="bg-white text-black px-6 py-2 uppercase hover:bg-white/90 transition-colors"
                  >
                    CONNECT WALLET
                  </button>
                </div>
              ) : transferHistory.length === 0 ? (
                <div className="text-center py-12 border border-white/10">
                  <p className="text-white/70 mb-2">No transfer history found</p>
                  <p className="text-white/50 text-sm">Your recent transfers will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left text-white/50 uppercase text-xs">
                        <th className="pb-4 pl-4">DATE</th>
                        <th className="pb-4 px-6">TOKEN</th>
                        <th className="pb-4 px-6">AMOUNT</th>
                        <th className="pb-4 px-6">RECIPIENT</th>
                        <th className="pb-4 px-6">TYPE</th>
                        <th className="pb-4 px-6">STATUS</th>
                        <th className="pb-4 pr-4 text-right">EXPLORER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transferHistory.map((tx, index) => (
                        <tr
                          key={index}
                          className="border-t border-white/10 hover:bg-white/5"
                        >
                          <td className="py-4 pl-4">
                            <div className="text-sm">{formatDate(tx.date)}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium">{tx.token}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-mono">{tx.amount.toLocaleString(undefined, {maximumFractionDigits: 9})}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-mono">
                              {tx.type === "burn" ? (
                                <span className="flex items-center text-red-400">
                                  <Flame className="w-3 h-3 mr-1" />
                                  Burned
                                </span>
                              ) : (
                                truncateAddress(tx.recipient)
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className={cn(
                              "inline-flex items-center px-2 py-1 text-xs",
                              tx.type === "transfer" ? "border border-blue-500/30 text-blue-400" : 
                                                       "border border-red-500/30 text-red-400"
                            )}>
                              {tx.type === "transfer" ? (
                                <Send className="w-3 h-3 mr-1" />
                              ) : (
                                <Flame className="w-3 h-3 mr-1" />
                              )}
                              {tx.type.toUpperCase()}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className={cn(
                              "inline-flex items-center px-2 py-1 text-xs",
                              tx.status === "completed" ? "border border-green-500/30 text-green-400" : 
                              tx.status === "pending" ? "border border-yellow-500/30 text-yellow-400" : 
                              "border border-red-500/30 text-red-400"
                            )}>
                              {tx.status === "completed" ? (
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                              ) : tx.status === "pending" ? (
                                <Clock className="w-3 h-3 mr-1" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 mr-1" />
                              )}
                              {tx.status.toUpperCase()}
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-right">
                            <a 
                              href={getExplorerUrl(tx.id, network)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-white hover:text-white/70 transition-colors uppercase text-xs flex items-center ml-auto"
                            >
                              VIEW <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>

          {/* Security Tips */}
          <div className="border border-white/30 p-0.5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="border border-white/10 px-6 py-8"
            >
              <h2 className="text-3xl font-light mb-6">Security Tips</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-white/20 p-5 bg-gradient-to-r from-transparent to-white/5">
                  <div className="flex items-center mb-4">
                    <div className="bg-yellow-500/20 p-2 rounded-full mr-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-light">Double-Check Addresses</h3>
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    Always verify the recipient's entire address before confirming. Use the wallet's
                    address book feature for frequent transfers and consider whitelisting trusted addresses.
                  </p>
                  <p className="text-white/60 text-xs italic">
                    Pro tip: Send a test transaction with a minimal amount first before transferring large sums.
                  </p>
                </div>
                
                <div className="border border-white/20 p-5 bg-gradient-to-r from-transparent to-white/5">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                      <Wallet className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-light">Use Hardware Wallets</h3>
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    For large holdings, consider using a hardware wallet like Ledger or Trezor. These devices 
                    keep your private keys offline, protecting them from online threats and malware.
                  </p>
                  <p className="text-white/60 text-xs italic">
                    Pro tip: Set up a separate "hot wallet" with limited funds for daily transactions.
                  </p>
                </div>
                
                <div className="border border-white/20 p-5 bg-gradient-to-r from-transparent to-white/5">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-500/20 p-2 rounded-full mr-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-xl font-light">Verify Site Authenticity</h3>
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    Always ensure you're on the correct website by checking the URL carefully. 
                    Bookmark official sites and avoid clicking links in emails or messages. 
                    Be wary of sites asking for your seed phrase or private keys.
                  </p>
                  <p className="text-white/60 text-xs italic">
                    Pro tip: Enable browser extensions that check for phishing sites.
                  </p>
                </div>
                
                <div className="border border-white/20 p-5 bg-gradient-to-r from-transparent to-white/5">
                  <div className="flex items-center mb-4">
                    <div className="bg-red-500/20 p-2 rounded-full mr-3">
                      <Flame className="w-5 h-5 text-red-400" />
                    </div>
                    <h3 className="text-xl font-light">Beware of Token Approvals</h3>
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    When interacting with DApps, be cautious of token approval requests. Limit approval amounts
                    and regularly revoke unused permissions to protect your assets from potential exploits.
                  </p>
                  <p className="text-white/60 text-xs italic">
                    Pro tip: Use approval management tools to audit and revoke unnecessary permissions.
                  </p>
                </div>
                
                <div className="border border-white/20 p-5 bg-gradient-to-r from-transparent to-white/5">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-500/20 p-2 rounded-full mr-3">
                      <Info className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-light">Private Key Security</h3>
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    Never share your seed phrase or private keys with anyone. Store backup copies offline 
                    in secure, encrypted storage, preferably in multiple locations to prevent loss from 
                    disasters or theft.
                  </p>
                  <p className="text-white/60 text-xs italic">
                    Pro tip: Consider using a metal backup solution resistant to fire and water damage.
                  </p>
                </div>
                
                <div className="border border-white/20 p-5 bg-gradient-to-r from-transparent to-white/5">
                  <div className="flex items-center mb-4">
                    <div className="bg-orange-500/20 p-2 rounded-full mr-3">
                      <Send className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-light">Multisig For High Value</h3>
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    For high-value transactions, consider using multisignature wallets that require 
                    approval from multiple devices or parties, adding an extra layer of security
                    against unauthorized transfers.
                  </p>
                  <p className="text-white/60 text-xs italic">
                    Pro tip: Set transaction limits that require additional verification for large amounts.
                  </p>
                </div>
              </div>
              
              <div className="border border-white/10 mt-6 p-5">
                <h3 className="text-lg font-light mb-3 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-yellow-400" />
                  Remember
                </h3>
                <p className="text-white/80 text-sm">
                  In the crypto space, security is your responsibility. Always stay vigilant, keep your 
                  software updated, and use strong, unique passwords with two-factor authentication for 
                  all your accounts.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Confirmation Modal */}
      {showConfirmation && selectedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowConfirmation(false)}
          ></div>
          <div className="relative z-10 w-full max-w-md bg-black border border-white/30 overflow-hidden animate-scaleIn">
            <div className="border border-white/10 flex flex-col">
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
                <h3 className="text-xl uppercase">Confirm Transfer</h3>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="p-2 border border-white/20 hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-6 py-6">
                <div className="space-y-6">
                  <div>
                    <p className="text-white/60 uppercase text-xs mb-2">SENDING</p>
                    <div className="flex items-center p-4 bg-white/5 border border-white/10">
                      <img
                        src={selectedToken.logo}
                        alt={selectedToken.name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div className="mr-auto">
                        <div className="font-medium">{amount} {selectedToken.symbol}</div>
                        <div className="text-white/60 text-sm">≈ ${(parseFloat(amount) * selectedToken.price).toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-white/60 uppercase text-xs mb-2">TO</p>
                    <div className="p-4 bg-white/5 border border-white/10 font-mono text-sm break-all">
                      {recipientAddress}
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/60 text-sm">Transaction Fee</span>
                      <span className="font-mono">~0.000005 SOL</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 text-sm">Network</span>
                      <span>{network}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 space-y-3">
                <button
                  onClick={confirmTransfer}
                  className="w-full py-3 bg-white text-black uppercase font-medium hover:bg-white/90 transition-colors"
                >
                  CONFIRM TRANSFER
                </button>
                
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="w-full py-3 bg-transparent border border-white/30 text-white uppercase font-medium hover:bg-white/10 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Burn Confirmation Modal */}
      {showBurnConfirmation && burnToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowBurnConfirmation(false)}
          ></div>
          <div className="relative z-10 w-full max-w-md bg-black border border-white/30 overflow-hidden animate-scaleIn">
            <div className="border border-white/10 flex flex-col">
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
                <h3 className="text-xl uppercase text-red-400 flex items-center">
                  <Flame className="h-4 w-4 mr-2" />
                  Burn {burnToken.symbol}
                </h3>
                <button
                  onClick={() => setShowBurnConfirmation(false)}
                  className="p-2 border border-white/20 hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-6 py-6">
                <div className="space-y-6">
                  <div className="bg-red-500/10 p-4 border border-red-500/30 text-white/90 text-sm">
                    <p className="font-medium mb-2">Warning: Token burning is irreversible</p>
                    <p>Burned tokens are permanently removed from circulation and cannot be recovered.</p>
                  </div>

                  <div>
                    <p className="text-white/60 uppercase text-xs mb-2">TOKEN</p>
                    <div className="flex items-center p-4 bg-white/5 border border-white/10">
                      <img
                        src={burnToken.logo}
                        alt={burnToken.name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        <div className="font-medium">{burnToken.symbol}</div>
                        <div className="text-white/60 text-sm">{burnToken.name}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-white/60 uppercase text-xs mb-2">AMOUNT TO BURN</p>
                    <div className="flex border border-white/20">
                      <input
                        type="text"
                        value={burnAmount}
                        onChange={(e) => setBurnAmount(e.target.value)}
                        placeholder="0.0"
                        className="flex-1 bg-transparent p-4 font-mono text-white/90 focus:outline-none"
                      />
                      <div className="flex items-center px-4">
                        <button 
                          onClick={handleMaxBurnAmount}
                          className="text-white/60 hover:text-white text-xs uppercase transition-colors"
                        >
                          MAX
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-white/60">
                        Available: {formatBalance(burnToken.balance, burnToken.decimals)} {burnToken.symbol}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 space-y-3">
                <button
                  onClick={confirmBurn}
                  disabled={!burnAmount || isNaN(parseFloat(burnAmount)) || parseFloat(burnAmount) <= 0}
                  className={cn(
                    "w-full py-3 uppercase font-medium flex items-center justify-center",
                    !burnAmount || isNaN(parseFloat(burnAmount)) || parseFloat(burnAmount) <= 0
                      ? "bg-red-500/30 text-white/50 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600 transition-colors"
                  )}
                >
                  <Flame className="h-4 w-4 mr-2" />
                  CONFIRM BURN
                </button>
                
                <button
                  onClick={() => setShowBurnConfirmation(false)}
                  className="w-full py-3 bg-transparent border border-white/30 text-white uppercase font-medium hover:bg-white/10 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
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
          animation:戳 fadeIn 0.5s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </main>
  );
};

export default TokenTransfer;