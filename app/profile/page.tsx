"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Copy,
  RefreshCw,
  Wallet,
  History,
  Layers,
  ExternalLink,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader,
  ChevronDown,
  Database,
  Sparkles,
  Settings,
  Image,
  PieChart,
  BarChart,
  LineChart as LineChartIcon,
  Clock,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  DollarSign,
  CreditCard,
  Search,
  Filter,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePhantom } from "@/hooks/use-phantom";
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  ParsedTransactionWithMeta,
  clusterApiUrl,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Import React components for charts
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartBarChart,
  Bar,
  PieChart as RechartPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

// Import for NFT data fetching
import axios from "axios";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
});

const Footer = dynamic(() => import("@/components/footer"), {
  ssr: false,
});

// Tab enum for better readability
const TABS = {
  DASHBOARD: "dashboard",
  ASSETS: "assets",
  TRANSACTIONS: "transactions",
  SETTINGS: "settings",
};

// Asset types
const ASSET_TYPES = {
  TOKENS: "tokens",
  NFTS: "nfts",
};

// Chart colors for consistency
const CHART_COLORS = [
  "#8884d8", // Purple
  "#82ca9d", // Green
  "#ffc658", // Yellow
  "#ff8042", // Orange
  "#0088FE", // Blue
  "#00C49F", // Teal
  "#FFBB28", // Gold
  "#FF8042", // Coral
];

// Transaction types mapping
const TRANSACTION_TYPES = {
  send: {
    label: "SENT",
    color: "text-blue-400 border-blue-500/30",
    icon: <Send className="w-3 h-3 mr-1" />,
  },
  receive: {
    label: "RECEIVED",
    color: "text-green-400 border-green-500/30",
    icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
  },
  swap: {
    label: "SWAP",
    color: "text-purple-400 border-purple-500/30",
    icon: <RefreshCw className="w-3 h-3 mr-1" />,
  },
  error: {
    label: "FAILED",
    color: "text-red-400 border-red-500/30",
    icon: <AlertTriangle className="w-3 h-3 mr-1" />,
  },
  pending: {
    label: "PENDING",
    color: "text-yellow-400 border-yellow-500/30",
    icon: <Clock className="w-3 h-3 mr-1" />,
  },
};

// Helper to truncate address
const truncateAddress = (address: string | any[]) => {
  if (!address) return "";
  return `${address.slice(0, 8)}...${address.slice(-5)}`;
};

// Helper to format balance
const formatBalance = (balance: number, decimals = 9) => {
  if (typeof balance === "bigint") {
    balance = Number(balance);
  }

  const divisor = Math.pow(10, decimals);
  const decimalValue = balance / divisor;

  return decimalValue.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
  });
};

// Helper to format date
const formatDate = (dateString: string | number | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper to get time ago
const getTimeAgo = (timestamp: number) => {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// Helper to format currency values
const formatCurrency = (value: ValueType) => {
  if (!value && value !== 0) return "$0.00";

  if (typeof value === "number" && value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (typeof value === "number" && value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else {
    return typeof value === "number" ? `$${value.toFixed(2)}` : "$0.00";
  }
};

// Helper to get explorer url
const getExplorerUrl = (signature: any, cluster = "mainnet-beta") => {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
};

// Helper to get token or NFT icon URL
const getTokenIconUrl = (address: string | number) => {
  if (!address) return "/images/unknown-token.png";

  // Try to get token logo from the Solana token list or other sources
  // For known tokens, hardcode some icons
  const knownTokens: Record<string, string> = {
    So11111111111111111111111111111111111111112: "/images/solana-logo.png", // SOL
    H2LhfTsiT2RWKpbyDLstZALcvVyUcaZmM2T7GtQoGJCu: "/images/logo.png", // NOVA
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "/images/usdc-logo.png", // USDC
    Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "/images/usdt-logo.png", // USDT
  };

  if (knownTokens[address as string]) {
    return knownTokens[address];
  }

  // Try Jupiter Aggregator token list API
  return `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${address}/logo.png`;
};

// Tab component
interface TabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const Tab: React.FC<TabProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center py-3 px-4 border-b-2 transition-colors",
      active
        ? "border-white text-white"
        : "border-transparent text-white/60 hover:text-white hover:border-white/30"
    )}
  >
    {icon}
    <span className="ml-2">{label}</span>
  </button>
);

// DashboardCard component for consistent styling
interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  children,
  className,
}) => (
  <div className="border border-white/30 p-0.5">
    <div className={cn("border border-white/10 p-6 h-full", className)}>
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-light">{title}</h2>
        <div className="bg-white/10 p-2 rounded-full">{icon}</div>
      </div>
      {children}
    </div>
  </div>
);

// NFT Card Component
interface NFT {
  name: string;
  image: string;
  collection?: string;
  floorPrice?: number;
  priceChange?: number;
  owner?: string;
  description?: string;
  attributes?: any[];
  mint?: string;
  marketplaceUrl?: string;
}

const NFTCard: React.FC<{ nft: NFT; onClick: (nft: NFT) => void }> = ({
  nft,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="border border-white/10 hover:border-white/30 transition-colors bg-white/5 cursor-pointer"
      onClick={() => onClick(nft)}
    >
      <div className="aspect-square bg-black relative overflow-hidden">
        <img
          src={nft.image || "/images/unknown-nft.png"}
          alt={nft.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/unknown-nft.png";
          }}
        />
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm p-1.5 rounded-full">
          <Heart className="w-4 h-4" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium mb-1">{nft.name || "Unnamed NFT"}</h3>
        <p className="text-white/60 text-sm mb-3">
          {nft.collection || "Unknown Collection"}
        </p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white/60 text-xs">Floor</p>
            <p className="font-mono">{nft.floorPrice || "??"} SOL</p>
          </div>
          {nft.priceChange && (
            <div
              className={cn(
                "text-sm",
                nft.priceChange >= 0 ? "text-green-400" : "text-red-400"
              )}
            >
              {nft.priceChange >= 0 ? "+" : ""}
              {nft.priceChange}%
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// NFT Detail Modal
interface NFTDetailModalProps {
  nft: NFT | null;
  onClose: () => void;
}

const NFTDetailModal: React.FC<NFTDetailModalProps> = ({ nft, onClose }) => {
  if (!nft) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-auto"
      >
        <div className="flex flex-col lg:flex-row">
          {/* NFT Image */}
          <div className="lg:w-1/2 p-6">
            <div className="aspect-square bg-black/30 relative overflow-hidden">
              <img
                src={nft.image || "/images/unknown-nft.png"}
                alt={nft.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/images/unknown-nft.png";
                }}
              />
            </div>
          </div>

          {/* NFT Details */}
          <div className="lg:w-1/2 p-6 border-t lg:border-t-0 lg:border-l border-white/10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-light">
                  {nft.name || "Unnamed NFT"}
                </h2>
                <p className="text-white/60">
                  {nft.collection || "Unknown Collection"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Ownership Info */}
              <div className="border border-white/10 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white/60 text-sm">Owner</p>
                    <p className="font-mono text-sm">
                      {truncateAddress(nft.owner || "")}
                    </p>
                  </div>
                  {nft.floorPrice && (
                    <div>
                      <p className="text-white/60 text-sm">Floor Price</p>
                      <p className="text-xl font-light">{nft.floorPrice} SOL</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {nft.description && (
                <div>
                  <h3 className="text-lg font-light mb-2">Description</h3>
                  <p className="text-white/70">{nft.description}</p>
                </div>
              )}

              {/* Attributes */}
              {nft.attributes && nft.attributes.length > 0 && (
                <div>
                  <h3 className="text-lg font-light mb-2">Attributes</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {nft.attributes.map(
                      (
                        attr: {
                          trait_type:
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactElement<
                                any,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | React.ReactPortal
                            | Promise<React.AwaitedReactNode>
                            | null
                            | undefined;
                          value:
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactElement<
                                any,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | React.ReactPortal
                            | Promise<React.AwaitedReactNode>
                            | null
                            | undefined;
                        },
                        index: React.Key | null | undefined
                      ) => (
                        <div key={index} className="border border-white/10 p-3">
                          <p className="text-white/60 text-xs">
                            {attr.trait_type}
                          </p>
                          <p className="font-medium">{attr.value}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://explorer.solana.com/address/${nft.mint}?cluster=mainnet-beta`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center border border-white/20 hover:border-white/40 p-3 transition-colors"
                >
                  <ExternalLink className="w-5 h-5 mb-1" />
                  <span className="text-xs">View on Explorer</span>
                </a>
                <a
                  href={
                    nft.marketplaceUrl ||
                    `https://magiceden.io/item-details/${nft.mint}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center border border-white/20 hover:border-white/40 p-3 transition-colors"
                >
                  <DollarSign className="w-5 h-5 mb-1" />
                  <span className="text-xs">View on Marketplace</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Transaction interface for the transaction detail modal
interface TransactionDetailProps {
  transaction: {
    signature: string;
    blockTime: number;
    type: string;
    amount: number;
    token: string;
    tokenMint: string | null;
    status: string;
    fromAddress: string | null;
    toAddress: string | null;
  } | null;
  onClose: () => void;
  network: string;
}

// Transaction Detail Modal
const TransactionDetailModal: React.FC<TransactionDetailProps> = ({
  transaction,
  onClose,
  network,
}) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black border border-white/20 max-w-3xl w-full max-h-[90vh] overflow-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-light mb-2">Transaction Details</h2>
              <p className="text-white/60">
                {new Date(transaction.blockTime * 1000).toLocaleString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Transaction Type and Status */}
            <div className="flex flex-wrap gap-3">
              <div
                className={cn(
                  "inline-flex items-center px-3 py-1.5 text-sm border",
                  TRANSACTION_TYPES[
                    transaction.type as keyof typeof TRANSACTION_TYPES
                  ]?.color || "text-white/70 border-white/30"
                )}
              >
                {TRANSACTION_TYPES[
                  transaction.type as keyof typeof TRANSACTION_TYPES
                ]?.icon || <History className="w-3 h-3 mr-1" />}
                {TRANSACTION_TYPES[
                  transaction.type as keyof typeof TRANSACTION_TYPES
                ]?.label || transaction.type.toUpperCase()}
              </div>

              <div
                className={cn(
                  "inline-flex items-center px-3 py-1.5 text-sm border",
                  transaction.status === "success"
                    ? "text-green-400 border-green-500/30"
                    : transaction.status === "pending"
                    ? "text-yellow-400 border-yellow-500/30"
                    : "text-red-400 border-red-500/30"
                )}
              >
                {transaction.status === "success" ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : transaction.status === "pending" ? (
                  <Clock className="w-3 h-3 mr-1" />
                ) : (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                )}
                {transaction.status === "success"
                  ? "CONFIRMED"
                  : transaction.status === "pending"
                  ? "PENDING"
                  : "FAILED"}
              </div>
            </div>

            {/* Transaction Amount */}
            <div className="border border-white/10 p-4">
              <p className="text-white/60 text-sm mb-1">Amount</p>
              <div className="flex items-center">
                <img
                  src={getTokenIconUrl(transaction.tokenMint || "")}
                  alt={transaction.token}
                  className="w-6 h-6 rounded-full mr-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/images/unknown-token.png";
                  }}
                />
                <p
                  className={cn(
                    "text-2xl font-light",
                    transaction.type === "receive"
                      ? "text-green-400"
                      : "text-white"
                  )}
                >
                  {transaction.type === "receive" ? "+" : "-"}
                  {transaction.amount.toLocaleString(undefined, {
                    maximumFractionDigits: 9,
                  })}{" "}
                  {transaction.token}
                </p>
              </div>
            </div>

            {/* Transaction Details Table */}
            <div className="border border-white/10">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4 text-white/60">Transaction ID</td>
                    <td className="py-3 px-4 font-mono text-sm break-all">
                      <div className="flex items-center">
                        {transaction.signature}
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(transaction.signature)
                          }
                          className="ml-2 text-white/50 hover:text-white transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4 text-white/60">From</td>
                    <td className="py-3 px-4 font-mono text-sm">
                      {transaction.fromAddress || "Unknown"}
                    </td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4 text-white/60">To</td>
                    <td className="py-3 px-4 font-mono text-sm">
                      {transaction.toAddress || "Unknown"}
                    </td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4 text-white/60">Block Time</td>
                    <td className="py-3 px-4">
                      {new Date(transaction.blockTime * 1000).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-white/60">Network</td>
                    <td className="py-3 px-4">{network}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              <a
                href={getExplorerUrl(transaction.signature, network)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center bg-white/10 hover:bg-white/20 px-4 py-2 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Filter Component for Assets
interface AssetFiltersProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  assetType: string;
}
const AssetFilters: React.FC<AssetFiltersProps> = ({
  activeFilter,
  setActiveFilter,
  assetType,
}) => {
  const filters =
    assetType === ASSET_TYPES.TOKENS
      ? [
          { id: "all", label: "All Tokens" },
          { id: "value", label: "Highest Value" },
          { id: "gainers", label: "Top Gainers" },
          { id: "losers", label: "Top Losers" },
        ]
      : [
          { id: "all", label: "All NFTs" },
          { id: "collections", label: "By Collection" },
          { id: "value", label: "Highest Value" },
        ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => setActiveFilter(filter.id)}
          className={cn(
            "px-4 py-2 text-sm",
            activeFilter === filter.id
              ? "bg-white text-black"
              : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

// Filter Component for Transactions
interface TransactionFiltersProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  onDateRangeChange: (range: { from: Date | null; to: Date | null }) => void;
  dateRange: { from: Date | null; to: Date | null };
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  activeFilter,
  setActiveFilter,
  onDateRangeChange,
  dateRange,
}) => {
  const filters = [
    { id: "all", label: "All" },
    { id: "send", label: "Sent" },
    { id: "receive", label: "Received" },
    { id: "swap", label: "Swaps" },
  ];

  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className="flex flex-col space-y-4 mb-4">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "px-4 py-2 text-sm",
                activeFilter === filter.id
                  ? "bg-white text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center bg-white/10 hover:bg-white/20 px-4 py-2 text-sm transition-colors"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {dateRange.from && dateRange.to
              ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
              : "Date Range"}
          </button>

          <button
            onClick={() => onDateRangeChange({ from: null, to: null })}
            className="flex items-center bg-white/10 hover:bg-white/20 px-4 py-2 text-sm transition-colors"
            disabled={!dateRange.from && !dateRange.to}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </button>
        </div>
      </div>

      {showDatePicker && (
        <div className="flex flex-wrap gap-4 border border-white/10 p-4 bg-black/50">
          <div>
            <label className="block text-white/60 text-sm mb-1">From</label>
            <input
              type="date"
              className="bg-white/10 border border-white/20 text-white p-2"
              value={
                dateRange.from ? dateRange.from.toISOString().split("T")[0] : ""
              }
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                onDateRangeChange({ ...dateRange, from: date });
              }}
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-1">To</label>
            <input
              type="date"
              className="bg-white/10 border border-white/20 text-white p-2"
              value={
                dateRange.to ? dateRange.to.toISOString().split("T")[0] : ""
              }
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                onDateRangeChange({ ...dateRange, to: date });
              }}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowDatePicker(false)}
              className="bg-white text-black px-4 py-2 text-sm"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProfilePage() {
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

  // States
  const [mounted, setMounted] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [network, setNetwork] = useState("mainnet-beta");
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [activeAssetType, setActiveAssetType] = useState(ASSET_TYPES.TOKENS);
  const [activeAssetFilter, setActiveAssetFilter] = useState("all");
  const [activeTransactionFilter, setActiveTransactionFilter] = useState("all");
  const [transactionDateRange, setTransactionDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });

  const [loadingTokens, setLoadingTokens] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [loadingChartData, setLoadingChartData] = useState(false);

  interface Token {
    symbol: string;
    name: string;
    balance: number | bigint;
    decimals: number;
    price: number;
    change24h: number;
    logo: string;
    mint: string;
    tokenAccount: string | null;
  }

  const [tokens, setTokens] = useState<Token[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [nfts, setNfts] = useState<any[]>([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [topToken, setTopToken] = useState<Token | null>(null);

  // Chart data states
  const [portfolioHistoryData, setPortfolioHistoryData] = useState<
    { date: string; value: number }[]
  >([]);
  const [tokenAllocationData, setTokenAllocationData] = useState<
    { name: string; value: number }[]
  >([]);
  const [dailyVolumeData, setDailyVolumeData] = useState<
    { date: string; volume: number }[]
  >([]);
  const [transactionTypesData, setTransactionTypesData] = useState<
    { name: string; value: number }[]
  >([]);
  const [tokenPerformanceData, setTokenPerformanceData] = useState<{
    data: { [key: string]: any }[];
    tokens: string[];
  }>({ data: [], tokens: [] });

  // Modal states
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Settings states
  interface Wallet {
    name: string;
    address: string;
  }

  const [savedWallets, setSavedWallets] = useState<Wallet[]>([]);
  const [defaultWallet, setDefaultWallet] = useState<string | null>(null);
  const [username, setUsername] = useState("NOVA User");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletAddress, setNewWalletAddress] = useState("");

  // Pagination states
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsPerPage] = useState(10);

  // Set mounted state
  useEffect(() => {
    setMounted(true);

    // Load saved settings from localStorage if available
    const storedWallets = localStorage.getItem("novaWallets");
    const storedDefaultWallet = localStorage.getItem("novaDefaultWallet");
    const storedUsername = localStorage.getItem("novaUsername");

    if (storedWallets) setSavedWallets(JSON.parse(storedWallets));
    if (storedDefaultWallet) setDefaultWallet(storedDefaultWallet);
    if (storedUsername) setUsername(storedUsername);
  }, []);

  // Detect network
  const detectNetwork = useCallback(async () => {
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
  }, [connection]);

  // Fetch token prices from CoinGecko or similar API
  const fetchTokenPrices = async (mintAddresses: any[]) => {
    try {
      // In a real implementation, you would fetch from a price API like CoinGecko
      // Here we're simulating the API call response

      // For SOL, we can get the real price
      let solPrice = { price: 0, change24h: 0 };
      try {
        // Use a real API service like CoinGecko
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true"
        );
        const data = await response.json();
        solPrice = {
          price: data.solana.usd,
          change24h: data.solana.usd_24h_change,
        };
      } catch (error) {
        console.error("Error fetching SOL price:", error);
        // Fallback
        solPrice = { price: 100.0, change24h: 2.5 };
      }

      // Default prices for known tokens (in USD)
      const knownPrices: Record<string, { price: number; change24h: number }> =
        {
          So11111111111111111111111111111111111111112: solPrice, // SOL
          EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
            price: 1.0,
            change24h: 0.01,
          }, // USDC
          Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: {
            price: 1.0,
            change24h: 0.02,
          }, // USDT
          H2LhfTsiT2RWKpbyDLstZALcvVyUcaZmM2T7GtQoGJCu: {
            price: 0.87,
            change24h: 5.3,
          }, // NOVA
        };

      // Create a result object with prices for each mint
      const result: Record<string, { price: number; change24h: number }> = {};

      mintAddresses.forEach((mint: string | number) => {
        if (knownPrices[mint as string]) {
          result[mint] = knownPrices[mint];
        } else {
          // For unknown tokens, generate a random price
          // In a real implementation, this would be replaced with actual API data
          const randomPrice = 0.001 + Math.random() * 4.999;
          const randomChange = Math.random() * 20 - 10; // -10% to +10%

          result[mint] = {
            price: parseFloat(randomPrice.toFixed(6)),
            change24h: parseFloat(randomChange.toFixed(2)),
          };
        }
      });

      return result;
    } catch (error) {
      console.error("Error fetching token prices:", error);
      // Return default values on error
      return mintAddresses.reduce(
        (
          acc: { [x: string]: { price: number; change24h: number } },
          mint: string | number
        ) => {
          acc[mint] = { price: 1.0, change24h: 0.0 };
          return acc;
        },
        {}
      );
    }
  };

  // Fetch token balances
  const fetchTokenBalances = useCallback(async () => {
    if (!publicKey || !connection) return;

    try {
      setLoadingTokens(true);

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
        logo: "/images/solana-logo.png",
        mint: "So11111111111111111111111111111111111111112", // Native SOL mint address
        tokenAccount: null,
      };

      const tokenList: Token[] = [solToken];

      // Fetch token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      // Process each token account and gather all mint addresses
      const mintAddresses = [solToken.mint];

      for (const { account, pubkey } of tokenAccounts.value) {
        const parsedAccountInfo = account.data.parsed.info;
        const mintAddress = parsedAccountInfo.mint;
        const tokenBalance = parsedAccountInfo.tokenAmount.amount;
        const tokenDecimals = parsedAccountInfo.tokenAmount.decimals;

        // Skip tokens with zero balance
        if (parsedAccountInfo.tokenAmount.uiAmount === 0) continue;

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
          logo: getTokenIconUrl(mintAddress),
          mint: mintAddress,
          tokenAccount: pubkey.toBase58(),
        });
      }

      // Update token names and symbols for known tokens
      const knownTokens: Record<
        string,
        { symbol: string; name: string; logo: string }
      > = {
        EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
          symbol: "USDC",
          name: "USD Coin",
          logo: "/images/usdc-logo.png",
        },
        Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: {
          symbol: "USDT",
          name: "Tether USD",
          logo: "/images/usdt-logo.png",
        },
        H2LhfTsiT2RWKpbyDLstZALcvVyUcaZmM2T7GtQoGJCu: {
          symbol: "NOVA",
          name: "N.OVA",
          logo: "/images/logo.png",
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

      setTokens(tokenList);

      // Calculate portfolio total value
      let totalValue = 0;
      let weightedChange = 0;

      for (const token of tokenList) {
        const tokenAmount =
          typeof token.balance === "bigint"
            ? Number(token.balance) / Math.pow(10, token.decimals)
            : token.balance / Math.pow(10, token.decimals);

        const tokenValue = tokenAmount * token.price;
        totalValue += tokenValue;

        // Calculate weighted change contribution
        const weight = totalValue > 0 ? tokenValue / totalValue : 0;
        weightedChange += token.change24h * weight;
      }

      setPortfolioValue(totalValue);
      setPortfolioChange(weightedChange);

      // Set top token by value
      const sortedTokens = [...tokenList].sort((a, b) => {
        const aValue =
          (typeof a.balance === "bigint"
            ? Number(a.balance) / Math.pow(10, a.decimals)
            : a.balance / Math.pow(10, a.decimals)) * a.price;
        const bValue =
          (typeof b.balance === "bigint"
            ? Number(b.balance) / Math.pow(10, b.decimals)
            : b.balance / Math.pow(10, b.decimals)) * b.price;
        return bValue - aValue;
      });

      if (sortedTokens.length > 0) {
        setTopToken(sortedTokens[0]);
      }

      // Generate token allocation data for pie chart
      const allocationData = tokenList.map((token) => {
        const tokenAmount =
          typeof token.balance === "bigint"
            ? Number(token.balance) / Math.pow(10, token.decimals)
            : token.balance / Math.pow(10, token.decimals);

        const value = tokenAmount * token.price;

        return {
          name: token.symbol,
          value: value,
        };
      });

      setTokenAllocationData(allocationData);

      // Generate token performance data
      await fetchTokenPerformanceData(tokenList.slice(0, 3));
    } catch (error) {
      console.error("Error fetching token data:", error);
    } finally {
      setLoadingTokens(false);
    }
  }, [publicKey, connection]);

  // Fetch NFTs for the wallet
  const fetchNFTs = useCallback(async () => {
    if (!publicKey) return;

    try {
      setLoadingNFTs(true);

      // In a real implementation, you would use an NFT API service like Helius, Shyft, Metaplex, etc.
      // For demonstration purposes, we're simulating the API call

      let nftList = [];

      try {
        // Try to make a real API call to fetch NFTs
        // Example using a hypothetical API (replace with actual working endpoint)
        const response = await fetch(
          `https://api.helius.xyz/v0/addresses/${publicKey.toString()}/nfts?api-key=YOUR_API_KEY`
        );

        if (response.ok) {
          const data = await response.json();
          nftList = data.map(
            (nft: {
              mint: any;
              name: any;
              symbol: any;
              image: any;
              collectionName: any;
              description: any;
              attributes: any;
              floorPrice: any;
              priceChange24h: any;
              marketplaceUrl: any;
            }) => ({
              mint: nft.mint,
              name: nft.name,
              symbol: nft.symbol,
              image: nft.image,
              collection: nft.collectionName,
              description: nft.description,
              attributes: nft.attributes,
              owner: publicKey.toString(),
              floorPrice: nft.floorPrice,
              priceChange: nft.priceChange24h,
              marketplaceUrl: nft.marketplaceUrl,
            })
          );
        } else {
          throw new Error("Failed to fetch NFTs from API");
        }
      } catch (error) {
        console.error(
          "Error fetching NFTs from API, using fallback data:",
          error
        );

        // Fallback to simulated data
        nftList = [
          {
            mint: "AFjGCUvQmCugQXz76zoCJYAKSxVaCjvHMHr9HKfScdas",
            name: "NOVA Genesis #1248",
            collection: "NOVA Genesis",
            image: "/images/nft1.png",
            description:
              "A unique NFT from the NOVA Genesis collection featuring futuristic cyber designs and advanced AI elements.",
            attributes: [
              { trait_type: "Background", value: "Cosmic Blue" },
              { trait_type: "Body", value: "Diamond" },
              { trait_type: "Eyes", value: "Laser" },
              { trait_type: "Outfit", value: "Cyber Armor" },
            ],
            owner: publicKey.toString(),
            floorPrice: 1.5,
            priceChange: 3.2,
          },
          {
            mint: "BHe1afUQMyCgSSm12Ufkp4vFQbBGZKQFSP8ksp5o7zUg",
            name: "Solana Monkey #6843",
            collection: "SMB",
            image: "/images/nft2.png",
            description:
              "One of the rarest Solana Monkeys with unique traits that make it highly collectible.",
            attributes: [
              { trait_type: "Background", value: "Jungle" },
              { trait_type: "Fur", value: "Golden" },
              { trait_type: "Eyes", value: "Hypnotic" },
              { trait_type: "Hat", value: "Crown" },
            ],
            owner: publicKey.toString(),
            floorPrice: 14.8,
            priceChange: -1.2,
          },
        ];
      }

      setNfts(nftList);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      setNfts([]);
    } finally {
      setLoadingNFTs(false);
    }
  }, [publicKey]);

  // Parse transaction data
  const parseTransactionData = (tx: ParsedTransactionWithMeta | null) => {
    try {
      if (!tx || !tx.meta) return null;

      // Determine if transaction was successful
      const status = tx.meta.err ? "error" : "success";

      // Get transaction timestamp
      const blockTime = tx.blockTime || 0;

      // Default transaction info
      let transactionInfo = {
        signature: tx.transaction.signatures[0],
        blockTime,
        type: "unknown",
        amount: 0,
        token: "Unknown",
        tokenMint: null as string | null,
        status,
        fromAddress: null,
        toAddress: null,
      };

      // Check if we have a parsed message
      if (tx.transaction.message.instructions.length > 0) {
        // Check for different transaction types
        const instructions = tx.transaction.message.instructions;

        for (const ix of instructions) {
          // SOL transfer
          if (
            "program" in ix &&
            ix.program === "system" &&
            "parsed" in ix &&
            ix.parsed.type === "transfer"
          ) {
            const info = ix.parsed.info;
            transactionInfo = {
              ...transactionInfo,
              type: info.source === walletAddress ? "send" : "receive",
              amount: info.lamports / LAMPORTS_PER_SOL,
              token: "SOL",
              tokenMint: "So11111111111111111111111111111111111111112",
              fromAddress: info.source,
              toAddress: info.destination,
            };
            return transactionInfo;
          }

          // SPL token transfer
          if (
            "program" in ix &&
            ix.program === "spl-token" &&
            "parsed" in ix &&
            (ix.parsed.type === "transfer" ||
              ix.parsed.type === "transferChecked")
          ) {
            const info = ix.parsed.info;
            // Find token details from our token list
            const tokenMint =
              ix.parsed.type === "transferChecked" ? info.mint : null;
            const matchingToken = tokens.find(
              (token) =>
                token.tokenAccount === info.source ||
                token.tokenAccount === info.destination ||
                (tokenMint && token.mint === tokenMint)
            );

            transactionInfo = {
              ...transactionInfo,
              type:
                info.authority === walletAddress ||
                info.source === info.authority
                  ? "send"
                  : "receive",
              amount: parseFloat(info.amount || info.tokenAmount || 0),
              token: matchingToken ? matchingToken.symbol : "Token",
              tokenMint:
                tokenMint || (matchingToken ? matchingToken.mint : null),
              fromAddress: info.source,
              toAddress: info.destination,
            };

            // Apply decimals if we found the token
            if (matchingToken) {
              transactionInfo.amount =
                transactionInfo.amount / Math.pow(10, matchingToken.decimals);
            }

            return transactionInfo;
          }

          // Look for swap instructions
          if (
            "program" in ix &&
            (ix.program === "Jupiter" ||
              ix.program === "Raydium" ||
              ix.program.includes("swap") ||
              ix.program.includes("Swap"))
          ) {
            transactionInfo = {
              ...transactionInfo,
              type: "swap",
            };
            // For swaps, we might need additional processing to extract exact amounts
            // This is a simplified version
            return transactionInfo;
          }
        }
      }

      return transactionInfo;
    } catch (error) {
      console.error("Error parsing transaction:", error);
      return null;
    }
  };

  // Fetch transaction history
  const fetchTransactionHistory = useCallback(async () => {
    if (!publicKey || !connection) return;

    try {
      setLoadingTransactions(true);

      // Get recent signatures
      const signatures = await connection.getSignaturesForAddress(
        publicKey,
        { limit: 50 } // Fetch more to account for filtering
      );

      setTransactionCount(signatures.length);

      // Generate transaction types data for pie chart
      const txTypes = {
        send: 0,
        receive: 0,
        swap: 0,
        other: 0,
      };

      // Get transaction details
      const transactions = [];
      const volumeByDay: Record<string, number> = {};

      for (const sigInfo of signatures) {
        try {
          // Get full transaction data
          const tx = await connection.getParsedTransaction(sigInfo.signature, {
            maxSupportedTransactionVersion: 0,
          });

          // Parse transaction data
          const parsedTx = parseTransactionData(tx);

          if (parsedTx) {
            // Add to transactions list
            transactions.push(parsedTx);

            // Update transaction types count
            if (parsedTx.type === "send") txTypes.send++;
            else if (parsedTx.type === "receive") txTypes.receive++;
            else if (parsedTx.type === "swap") txTypes.swap++;
            else txTypes.other++;

            // Update volume by day data for chart
            if (parsedTx.blockTime) {
              const date = new Date(parsedTx.blockTime * 1000);
              const day = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              if (!volumeByDay[day]) {
                volumeByDay[day] = 0;
              }

              // Add transaction amount to daily volume
              // For simplicity, we're not converting to USD here, but in a real implementation you would
              volumeByDay[day] += parsedTx.amount;
            }
          }
        } catch (error) {
          console.error(
            `Error fetching transaction ${sigInfo.signature}:`,
            error
          );
        }
      }

      // Set transactions
      setTransactions(transactions);

      // Set transaction types data for pie chart
      setTransactionTypesData([
        { name: "Sent", value: txTypes.send },
        { name: "Received", value: txTypes.receive },
        { name: "Swaps", value: txTypes.swap },
        { name: "Other", value: txTypes.other },
      ]);

      // Set daily volume data for chart
      const volumeData = Object.entries(volumeByDay)
        .map(([date, volume]) => ({
          date,
          volume,
        }))
        .sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });

      setDailyVolumeData(volumeData);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    } finally {
      setLoadingTransactions(false);
    }
  }, [publicKey, connection, tokens, walletAddress]);

  // Fetch portfolio history data
  const fetchPortfolioHistory = useCallback(async () => {
    if (!publicKey) return;

    try {
      setLoadingChartData(true);

      // In a real implementation, you would use historical price data from an API
      // For demonstration purposes, we're generating simulated data

      const data = [];
      const now = new Date();

      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Create some realistic data based on current portfolio value
        const baseValue = portfolioValue * 0.7; // Start at 70% of current value
        const trend = Math.sin(i / 5) * (portfolioValue * 0.1); // Add a sine wave pattern
        const random = (Math.random() - 0.5) * (portfolioValue * 0.05); // Add some randomness
        const growth = portfolioValue * 0.3 * (i / 30); // Add gradual growth

        const value = baseValue + trend + random + growth;

        data.push({
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          value: Math.max(value, baseValue * 0.8), // Ensure we don't go too low
        });
      }

      setPortfolioHistoryData(data);
    } catch (error) {
      console.error("Error fetching portfolio history:", error);
    } finally {
      setLoadingChartData(false);
    }
  }, [publicKey, portfolioValue]);

  // Fetch token performance data
  const fetchTokenPerformanceData = async (tokensToTrack: any[]) => {
    try {
      setLoadingChartData(true);

      // In a real implementation, you would use historical price data from an API
      // For demonstration purposes, we're generating simulated data

      const data = [];
      const now = new Date();
      const tokenSymbols = tokensToTrack.map(
        (token: { symbol: any }) => token.symbol
      );

      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        const dataPoint: { date: string; [key: string]: number | string } = {
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        };

        // Create performance data for each token
        tokenSymbols.forEach((symbol: string | number, index: number) => {
          const token = tokensToTrack[index];

          // Create different patterns for each token
          const basePerformance = token.change24h > 0 ? 5 : -5; // Starting point based on current trend
          const trend = Math.sin((i + index * 2) / 5) * 10;
          const random = (Math.random() - 0.5) * 3;

          // Calculate percentage change relative to start
          const dayPerformance = basePerformance + trend + random + i * 0.3;

          dataPoint[String(symbol)] = parseFloat(dayPerformance.toFixed(1));
        });

        data.push(dataPoint);
      }

      setTokenPerformanceData({
        data,
        tokens: tokenSymbols,
      });
    } catch (error) {
      console.error("Error fetching token performance data:", error);
    } finally {
      setLoadingChartData(false);
    }
  };

  // Initialize data
  useEffect(() => {
    if (mounted && isConnected && publicKey) {
      detectNetwork();
      fetchTokenBalances();
      fetchNFTs();
    }
  }, [
    mounted,
    isConnected,
    publicKey,
    detectNetwork,
    fetchTokenBalances,
    fetchNFTs,
  ]);

  // Fetch transactions after tokens are loaded
  useEffect(() => {
    if (tokens.length > 0 && publicKey) {
      fetchTransactionHistory();
    }
  }, [tokens, publicKey, fetchTransactionHistory]);

  // Fetch portfolio history after portfolio value is calculated
  useEffect(() => {
    if (portfolioValue > 0) {
      fetchPortfolioHistory();
    }
  }, [portfolioValue, fetchPortfolioHistory]);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Handle refresh
  const handleRefresh = async () => {
    await refreshBalances();
    await fetchTokenBalances();
    await fetchTransactionHistory();
    await fetchNFTs();
  };

  // Handle connect wallet
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Connect wallet error:", error);
    }
  };

  // Handle saving a new wallet
  const handleAddWallet = () => {
    if (!newWalletAddress || !newWalletName) return;

    const newWallet = {
      name: newWalletName,
      address: newWalletAddress,
    };

    const updatedWallets = [...savedWallets, newWallet];
    setSavedWallets(updatedWallets);
    localStorage.setItem("novaWallets", JSON.stringify(updatedWallets));

    // Set as default if it's the first wallet
    if (savedWallets.length === 0) {
      setDefaultWallet(newWalletAddress);
      localStorage.setItem("novaDefaultWallet", newWalletAddress);
    }

    // Reset form
    setNewWalletName("");
    setNewWalletAddress("");
  };

  // Handle removing a wallet
  const handleRemoveWallet = (addressToRemove: string) => {
    const updatedWallets = savedWallets.filter(
      (w) => w.address !== addressToRemove
    );
    setSavedWallets(updatedWallets);
    localStorage.setItem("novaWallets", JSON.stringify(updatedWallets));

    // Update default wallet if needed
    if (defaultWallet === addressToRemove) {
      const newDefault =
        updatedWallets.length > 0 ? updatedWallets[0].address : null;
      setDefaultWallet(newDefault);
      localStorage.setItem("novaDefaultWallet", newDefault || "");
    }
  };

  // Handle setting default wallet
  const handleSetDefaultWallet = (address: string) => {
    setDefaultWallet(address);
    localStorage.setItem("novaDefaultWallet", address);
  };

  // Handle username changes
  const handleUsernameEdit = () => {
    setIsEditingUsername(true);
    setNewUsername(username);
  };

  const handleUsernameSave = () => {
    if (newUsername.trim()) {
      setUsername(newUsername);
      localStorage.setItem("novaUsername", newUsername);
    }
    setIsEditingUsername(false);
  };

  const handleUsernameCancelEdit = () => {
    setIsEditingUsername(false);
  };

  // Filter transactions based on active filter and date range
  const filteredTransactions = transactions.filter((tx) => {
    // Filter by transaction type
    if (
      activeTransactionFilter !== "all" &&
      tx.type !== activeTransactionFilter
    ) {
      return false;
    }

    // Filter by date range
    if (transactionDateRange.from || transactionDateRange.to) {
      const txDate = new Date(tx.blockTime * 1000);

      if (transactionDateRange.from && txDate < transactionDateRange.from) {
        return false;
      }

      if (transactionDateRange.to) {
        // Set the end of the day for the to date
        const toDateEnd = new Date(transactionDateRange.to);
        toDateEnd.setHours(23, 59, 59, 999);

        if (txDate > toDateEnd) {
          return false;
        }
      }
    }

    return true;
  });

  // Paginate transactions
  const paginatedTransactions = filteredTransactions.slice(
    (transactionsPage - 1) * transactionsPerPage,
    transactionsPage * transactionsPerPage
  );

  // Filter tokens based on active filter
  const filteredTokens = tokens
    .filter((token) => {
      if (activeAssetFilter === "all") return true;
      if (activeAssetFilter === "value") {
        const tokenValue =
          (typeof token.balance === "bigint"
            ? Number(token.balance) / Math.pow(10, token.decimals)
            : token.balance / Math.pow(10, token.decimals)) * token.price;

        return tokenValue > 100; // Example threshold
      }
      if (activeAssetFilter === "gainers") return token.change24h > 0;
      if (activeAssetFilter === "losers") return token.change24h < 0;
      return true;
    })
    .sort((a, b) => {
      if (activeAssetFilter === "value") {
        const aValue =
          (typeof a.balance === "bigint"
            ? Number(a.balance) / Math.pow(10, a.decimals)
            : a.balance / Math.pow(10, a.decimals)) * a.price;
        const bValue =
          (typeof b.balance === "bigint"
            ? Number(b.balance) / Math.pow(10, b.decimals)
            : b.balance / Math.pow(10, b.decimals)) * b.price;
        return bValue - aValue;
      }
      if (activeAssetFilter === "gainers") {
        return b.change24h - a.change24h;
      }
      if (activeAssetFilter === "losers") {
        return a.change24h - b.change24h;
      }
      return 0;
    });

  // Filter NFTs based on active filter
  const filteredNFTs = nfts.filter((nft) => {
    if (activeAssetFilter === "all") return true;
    if (activeAssetFilter === "collections") {
      // Group by collection would be implemented here
      return true;
    }
    if (activeAssetFilter === "value") {
      return nft.floorPrice > 5; // Example threshold
    }
    return true;
  });

  if (!mounted) {
    return (
      <main className="relative min-h-screen bg-black text-white font-mono">
        <div className="fixed inset-0 bg-black z-0" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-4xl font-bold mb-8">Loading...</h1>
        </div>
      </main>
    );
  }

  if (!isConnected) {
    return (
      <main className="relative min-h-screen bg-black text-white font-mono">
        <div className="fixed inset-0 bg-black z-0" />
        <Navigation />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-4xl font-bold mb-8">Wallet Not Connected</h1>
          <p className="text-xl text-white/60 mb-8 text-center max-w-md">
            Connect your wallet to view your profile dashboard and manage your
            assets.
          </p>
          <button
            onClick={handleConnectWallet}
            className="px-6 py-3 bg-white text-black font-medium hover:bg-white/90 transition-colors"
          >
            CONNECT WALLET
          </button>
        </div>
        <Footer />
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
          {/* Main Header */}
          <div className="mb-8">
            <h1 className="text-8xl font-light mb-6">PROFILE</h1>
            <p className="text-white/70 uppercase max-w-4xl">
              MONITOR YOUR PORTFOLIO, TRACK ASSETS, AND MANAGE YOUR CRYPTO
              HOLDINGS.
            </p>
          </div>

          {/* Profile Header with Wallet Info */}
          <div className="border border-white/30 p-0.5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="border border-white/10 p-6"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                {/* Avatar and Wallet Info */}
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 border-2 border-white/20 rounded-full overflow-hidden">
                    <img
                      src="/images/logo.png"
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h2 className="text-2xl font-light mb-2">
                      {username || truncateAddress(walletAddress || "")}
                    </h2>
                    <div className="flex items-center text-white/60 text-sm">
                      <span>Network: {network}</span>
                      <span className="mx-2">•</span>
                      <span>Transactions: {transactionCount}</span>
                    </div>
                  </div>
                </div>

                {/* Wallet Actions */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center bg-white/5 px-4 py-2 border border-white/10">
                    <span className="font-mono text-sm mr-2">
                      {truncateAddress(walletAddress || "")}
                    </span>
                    <button
                      onClick={() => copyToClipboard(walletAddress || "")}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {copySuccess && (
                      <span className="text-green-400 text-xs ml-2">
                        Copied!
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleRefresh}
                    className="flex items-center bg-white/5 hover:bg-white/10 px-4 py-2 border border-white/10 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    <span>Refresh</span>
                  </button>

                  <Link
                    href="/transfer"
                    className="flex items-center bg-white text-black hover:bg-white/90 px-4 py-2 transition-colors"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    <span>Transfer</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="border border-white/30 p-0.5 mb-8">
            <div className="border border-white/10 p-1">
              <div className="flex flex-wrap overflow-x-auto">
                <Tab
                  active={activeTab === TABS.DASHBOARD}
                  onClick={() => setActiveTab(TABS.DASHBOARD)}
                  icon={<PieChart className="w-4 h-4" />}
                  label="DASHBOARD"
                />
                <Tab
                  active={activeTab === TABS.ASSETS}
                  onClick={() => setActiveTab(TABS.ASSETS)}
                  icon={<Database className="w-4 h-4" />}
                  label="ASSETS"
                />
                <Tab
                  active={activeTab === TABS.TRANSACTIONS}
                  onClick={() => setActiveTab(TABS.TRANSACTIONS)}
                  icon={<History className="w-4 h-4" />}
                  label="TRANSACTIONS"
                />
                <Tab
                  active={activeTab === TABS.SETTINGS}
                  onClick={() => setActiveTab(TABS.SETTINGS)}
                  icon={<Settings className="w-4 h-4" />}
                  label="SETTINGS"
                />
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            {/* DASHBOARD TAB */}
            {activeTab === TABS.DASHBOARD && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Portfolio Value and Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  {/* Portfolio Value */}
                  <DashboardCard
                    title="PORTFOLIO VALUE"
                    icon={<Wallet className="w-5 h-5" />}
                  >
                    {loadingTokens ? (
                      <div className="flex justify-center items-center h-24">
                        <Loader className="w-8 h-8 animate-spin text-white/50" />
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <h3 className="text-4xl font-light mb-2">
                            {formatCurrency(portfolioValue)}
                          </h3>
                          <p
                            className={cn(
                              "flex items-center",
                              portfolioChange >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            )}
                          >
                            <span>
                              {portfolioChange >= 0 ? "+" : ""}
                              {portfolioChange.toFixed(2)}%
                            </span>
                            <span className="text-white/60 ml-2">24h</span>
                          </p>
                        </div>

                        <div className="border-t border-white/10 pt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">Tokens</span>
                            <span>{tokens.length}</span>
                          </div>
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-white/60">NFTs</span>
                            <span>{nfts.length}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </DashboardCard>

                  {/* Top Asset */}
                  <DashboardCard
                    title="TOP ASSET"
                    icon={<Sparkles className="w-5 h-5" />}
                  >
                    {loadingTokens ? (
                      <div className="flex justify-center items-center h-24">
                        <Loader className="w-8 h-8 animate-spin text-white/50" />
                      </div>
                    ) : topToken ? (
                      <>
                        <div className="flex items-center gap-4 mb-4">
                          <img
                            src={topToken.logo}
                            alt={topToken.symbol}
                            className="w-12 h-12 rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/images/unknown-token.png";
                            }}
                          />
                          <div>
                            <h3 className="text-2xl font-light">
                              {topToken.symbol}
                            </h3>
                            <p className="text-white/60">{topToken.name}</p>
                          </div>
                        </div>

                        <div className="border-t border-white/10 pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-white/60 text-sm">Balance</p>
                              <p className="font-mono text-lg">
                                {formatBalance(
                                  typeof topToken.balance === "bigint"
                                    ? Number(topToken.balance)
                                    : topToken.balance,
                                  topToken.decimals
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-white/60 text-sm">Value</p>
                              <p className="font-mono text-lg">
                                {formatCurrency(
                                  (typeof topToken.balance === "bigint"
                                    ? Number(topToken.balance) /
                                      Math.pow(10, topToken.decimals)
                                    : topToken.balance /
                                      Math.pow(10, topToken.decimals)) *
                                    topToken.price
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-24 text-white/60">
                        <p>No assets found</p>
                      </div>
                    )}
                  </DashboardCard>

                  {/* Recent Transaction */}
                  <DashboardCard
                    title="RECENT ACTIVITY"
                    icon={<History className="w-5 h-5" />}
                  >
                    {loadingTransactions ? (
                      <div className="flex justify-center items-center h-24">
                        <Loader className="w-8 h-8 animate-spin text-white/50" />
                      </div>
                    ) : transactions.length > 0 ? (
                      <div className="space-y-4">
                        {transactions.slice(0, 1).map((tx, index) => (
                          <div key={index} className="group">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <div
                                  className={cn(
                                    "w-2 h-2 rounded-full mr-2",
                                    tx.type === "receive"
                                      ? "bg-green-500"
                                      : "bg-blue-500"
                                  )}
                                ></div>
                                <p className="font-medium">
                                  {tx.type === "receive" ? "Received" : "Sent"}
                                </p>
                              </div>
                              <p className="text-white/60 text-sm">
                                {getTimeAgo(tx.blockTime)}
                              </p>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                              <p
                                className={cn(
                                  "text-lg font-mono",
                                  tx.type === "receive"
                                    ? "text-green-400"
                                    : "text-white"
                                )}
                              >
                                {tx.type === "receive" ? "+" : "-"}
                                {tx.amount.toLocaleString(undefined, {
                                  maximumFractionDigits: 9,
                                })}{" "}
                                {tx.token}
                              </p>
                            </div>

                            <a
                              href={getExplorerUrl(tx.signature, network)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-white/60 hover:text-white transition-colors"
                            >
                              View on Explorer
                              <ExternalLink className="ml-1 w-3 h-3" />
                            </a>
                          </div>
                        ))}

                        <div className="border-t border-white/10 pt-4 text-center">
                          <button
                            onClick={() => setActiveTab(TABS.TRANSACTIONS)}
                            className="text-sm text-white/60 hover:text-white transition-colors"
                          >
                            View all transactions
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-24 text-white/60">
                        <p>No transactions found</p>
                      </div>
                    )}
                  </DashboardCard>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Portfolio History Chart */}
                  <div className="border border-white/30 p-0.5">
                    <div className="border border-white/10 p-6 h-full">
                      <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-light">
                          PORTFOLIO HISTORY
                        </h2>
                        <div className="bg-white/10 p-2 rounded-full">
                          <LineChartIcon className="w-5 h-5" />
                        </div>
                      </div>

                      {loadingChartData ? (
                        <div className="flex justify-center items-center h-48">
                          <Loader className="w-8 h-8 animate-spin text-white/50" />
                        </div>
                      ) : portfolioHistoryData.length > 0 ? (
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={portfolioHistoryData}>
                              <defs>
                                <linearGradient
                                  id="colorValue"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="5%"
                                    stopColor="#8884d8"
                                    stopOpacity={0.8}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor="#8884d8"
                                    stopOpacity={0}
                                  />
                                </linearGradient>
                              </defs>
                              <XAxis
                                dataKey="date"
                                tick={{ fill: "#aaa", fontSize: 12 }}
                                axisLine={{ stroke: "#333" }}
                              />
                              <YAxis
                                tickFormatter={(value) => formatCurrency(value)}
                                width={80}
                                tick={{ fill: "#aaa", fontSize: 12 }}
                                axisLine={{ stroke: "#333" }}
                              />
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#333"
                              />
                              <Tooltip
                                formatter={(value) => [
                                  formatCurrency(value),
                                  "Value",
                                ]}
                                contentStyle={{
                                  backgroundColor: "#121212",
                                  borderColor: "#333",
                                  color: "white",
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#8884d8"
                                fillOpacity={1}
                                fill="url(#colorValue)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-white/60">
                          <p>No portfolio history data available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Token Allocation Chart */}
                  <div className="border border-white/30 p-0.5">
                    <div className="border border-white/10 p-6 h-full">
                      <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-light">TOKEN ALLOCATION</h2>
                        <div className="bg-white/10 p-2 rounded-full">
                          <PieChart className="w-5 h-5" />
                        </div>
                      </div>

                      {loadingTokens ? (
                        <div className="flex justify-center items-center h-48">
                          <Loader className="w-8 h-8 animate-spin text-white/50" />
                        </div>
                      ) : tokenAllocationData.length > 0 ? (
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartPieChart>
                              <Pie
                                data={tokenAllocationData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                  `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {tokenAllocationData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      CHART_COLORS[index % CHART_COLORS.length]
                                    }
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value) => [
                                  formatCurrency(value),
                                  "Value",
                                ]}
                                contentStyle={{
                                  backgroundColor: "#121212",
                                  borderColor: "#333",
                                  color: "white",
                                }}
                              />
                              <Legend />
                            </RechartPieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-white/60">
                          <p>No token data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Daily Volume Chart */}
                  <div className="border border-white/30 p-0.5">
                    <div className="border border-white/10 p-6 h-full">
                      <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-light">DAILY VOLUME</h2>
                        <div className="bg-white/10 p-2 rounded-full">
                          <BarChart className="w-5 h-5" />
                        </div>
                      </div>

                      {loadingTransactions ? (
                        <div className="flex justify-center items-center h-48">
                          <Loader className="w-8 h-8 animate-spin text-white/50" />
                        </div>
                      ) : dailyVolumeData.length > 0 ? (
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartBarChart data={dailyVolumeData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#333"
                              />
                              <XAxis
                                dataKey="date"
                                tick={{ fill: "#aaa", fontSize: 12 }}
                                axisLine={{ stroke: "#333" }}
                              />
                              <YAxis
                                tick={{ fill: "#aaa", fontSize: 12 }}
                                axisLine={{ stroke: "#333" }}
                                width={80}
                              />
                              <Tooltip
                                formatter={(value) => [
                                  typeof value === "number"
                                    ? value.toFixed(4)
                                    : value,
                                  "Volume",
                                ]}
                                contentStyle={{
                                  backgroundColor: "#121212",
                                  borderColor: "#333",
                                  color: "white",
                                }}
                              />
                              <Legend />
                              <Bar dataKey="volume" fill="#82ca9d" />
                            </RechartBarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-white/60">
                          <p>No volume data available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transaction Types Chart */}
                  <div className="border border-white/30 p-0.5">
                    <div className="border border-white/10 p-6 h-full">
                      <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-light">
                          TRANSACTION TYPES
                        </h2>
                        <div className="bg-white/10 p-2 rounded-full">
                          <PieChart className="w-5 h-5" />
                        </div>
                      </div>

                      {loadingTransactions ? (
                        <div className="flex justify-center items-center h-48">
                          <Loader className="w-8 h-8 animate-spin text-white/50" />
                        </div>
                      ) : transactionTypesData.length > 0 &&
                        transactionTypesData.some((item) => item.value > 0) ? (
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartPieChart>
                              <Pie
                                data={transactionTypesData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {transactionTypesData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      CHART_COLORS[index % CHART_COLORS.length]
                                    }
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value) => [
                                  `${value} transactions`,
                                  "Count",
                                ]}
                                contentStyle={{
                                  backgroundColor: "#121212",
                                  borderColor: "#333",
                                  color: "white",
                                }}
                              />
                              <Legend />
                            </RechartPieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-white/60">
                          <p>No transaction data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Token Performance Chart */}
                <div className="border border-white/30 p-0.5 mb-8">
                  <div className="border border-white/10 p-6 h-full">
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-xl font-light">TOKEN PERFORMANCE</h2>
                      <div className="bg-white/10 p-2 rounded-full">
                        <LineChartIcon className="w-5 h-5" />
                      </div>
                    </div>

                    {loadingChartData ? (
                      <div className="flex justify-center items-center h-64">
                        <Loader className="w-8 h-8 animate-spin text-white/50" />
                      </div>
                    ) : tokenPerformanceData.data.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={tokenPerformanceData.data}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#333"
                            />
                            <XAxis
                              dataKey="date"
                              tick={{ fill: "#aaa", fontSize: 12 }}
                              axisLine={{ stroke: "#333" }}
                            />
                            <YAxis
                              tickFormatter={(value) => `${value}%`}
                              width={60}
                              tick={{ fill: "#aaa", fontSize: 12 }}
                              axisLine={{ stroke: "#333" }}
                            />
                            <Tooltip
                              formatter={(value) => [
                                `${value}%`,
                                "Performance",
                              ]}
                              contentStyle={{
                                backgroundColor: "#121212",
                                borderColor: "#333",
                                color: "white",
                              }}
                            />
                            <Legend />
                            {tokenPerformanceData.tokens.map((token, index) => (
                              <Line
                                key={token}
                                type="monotone"
                                dataKey={token}
                                stroke={
                                  CHART_COLORS[index % CHART_COLORS.length]
                                }
                                activeDot={{ r: 6 }}
                                strokeWidth={2}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-white/60">
                        <p>No token performance data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ASSETS TAB */}
            {activeTab === TABS.ASSETS && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Asset Type Tabs */}
                <div className="border border-white/30 p-0.5 mb-8">
                  <div className="border border-white/10 p-1">
                    <div className="flex flex-wrap overflow-x-auto">
                      <Tab
                        active={activeAssetType === ASSET_TYPES.TOKENS}
                        onClick={() => setActiveAssetType(ASSET_TYPES.TOKENS)}
                        icon={<Database className="w-4 h-4" />}
                        label="TOKENS"
                      />
                      <Tab
                        active={activeAssetType === ASSET_TYPES.NFTS}
                        onClick={() => setActiveAssetType(ASSET_TYPES.NFTS)}
                        icon={<Image className="w-4 h-4" />}
                        label="NFTs"
                      />
                    </div>
                  </div>
                </div>

                {/* Token List */}
                {activeAssetType === ASSET_TYPES.TOKENS && (
                  <div className="border border-white/30 p-0.5 mb-8">
                    <div className="border border-white/10 px-6 py-8">
                      <div className="flex flex-wrap justify-between items-center mb-6">
                        <h2 className="text-3xl font-light mb-2 md:mb-0">
                          Tokens
                        </h2>

                        <AssetFilters
                          activeFilter={activeAssetFilter}
                          setActiveFilter={setActiveAssetFilter}
                          assetType={ASSET_TYPES.TOKENS}
                        />
                      </div>

                      {loadingTokens ? (
                        <div className="flex justify-center items-center py-10">
                          <Loader className="w-8 h-8 animate-spin text-white/50" />
                        </div>
                      ) : filteredTokens.length === 0 ? (
                        <div className="text-center py-12 border border-white/10">
                          <p className="text-white/70 mb-2">No tokens found</p>
                          <p className="text-white/50 text-sm">
                            Connect your wallet to view your assets
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="text-left text-white/50 uppercase text-xs">
                                <th className="pb-4 pl-4">Token</th>
                                <th className="pb-4 px-6">Balance</th>
                                <th className="pb-4 px-6">Price</th>
                                <th className="pb-4 px-6">Value</th>
                                <th className="pb-4 px-6">24h</th>
                                <th className="pb-4 pr-4 text-right">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredTokens.map((token, index) => {
                                // Calculate actual decimal value
                                const tokenBalance =
                                  typeof token.balance === "bigint"
                                    ? Number(token.balance) /
                                      Math.pow(10, token.decimals)
                                    : token.balance /
                                      Math.pow(10, token.decimals);

                                // Calculate USD value
                                const usdValue = tokenBalance * token.price;

                                return (
                                  <tr
                                    key={index}
                                    className="border-t border-white/10 hover:bg-white/5"
                                  >
                                    <td className="py-6 pl-4">
                                      <div className="flex items-center">
                                        <img
                                          src={token.logo}
                                          alt={token.name}
                                          className="w-8 h-8 rounded-full mr-3"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                              "/images/unknown-token.png";
                                          }}
                                        />
                                        <div>
                                          <div className="font-medium">
                                            {token.symbol}
                                          </div>
                                          <div className="text-white/60 text-sm">
                                            {token.name}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-6 px-6">
                                      <div className="font-mono overflow-hidden text-ellipsis">
                                        {formatBalance(
                                          typeof token.balance === "bigint"
                                            ? Number(token.balance)
                                            : token.balance,
                                          token.decimals
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-6 px-6">
                                      <div className="font-mono">
                                        $
                                        {token.price.toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 8,
                                        })}
                                      </div>
                                    </td>
                                    <td className="py-6 px-6">
                                      <div className="font-mono">
                                        $
                                        {usdValue.toLocaleString(undefined, {
                                          maximumFractionDigits: 2,
                                        })}
                                      </div>
                                    </td>
                                    <td className="py-6 px-6">
                                      <div
                                        className={
                                          token.change24h >= 0
                                            ? "text-green-400"
                                            : "text-red-400"
                                        }
                                      >
                                        {token.change24h >= 0 ? "+" : ""}
                                        {token.change24h.toFixed(2)}%
                                      </div>
                                    </td>
                                    <td className="py-6 pr-4 text-right">
                                      <Link
                                        href={{
                                          pathname: "/transfer",
                                          query: { token: token.mint },
                                        }}
                                        className="bg-white/10 text-white hover:bg-white/20 transition-colors px-4 py-2 uppercase text-xs inline-flex items-center"
                                      >
                                        <Send className="w-3 h-3 mr-2" />
                                        Transfer
                                      </Link>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* NFTs */}
                {activeAssetType === ASSET_TYPES.NFTS && (
                  <div className="border border-white/30 p-0.5 mb-8">
                    <div className="border border-white/10 px-6 py-8">
                      <div className="flex flex-wrap justify-between items-center mb-6">
                        <h2 className="text-3xl font-light mb-2 md:mb-0">
                          NFTs
                        </h2>

                        <AssetFilters
                          activeFilter={activeAssetFilter}
                          setActiveFilter={setActiveAssetFilter}
                          assetType={ASSET_TYPES.NFTS}
                        />
                      </div>

                      {loadingNFTs ? (
                        <div className="flex justify-center items-center py-10">
                          <Loader className="w-8 h-8 animate-spin text-white/50" />
                        </div>
                      ) : filteredNFTs.length === 0 ? (
                        <div className="text-center py-12 border border-white/10">
                          <p className="text-white/70 mb-2">No NFTs found</p>
                          <p className="text-white/50 text-sm">
                            Your NFTs will appear here
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {filteredNFTs.map((nft, index) => (
                            <NFTCard
                              key={index}
                              nft={nft}
                              onClick={(
                                nft: React.SetStateAction<NFT | null>
                              ) => setSelectedNft(nft)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TRANSACTIONS TAB */}
            {activeTab === TABS.TRANSACTIONS && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="border border-white/30 p-0.5 mb-8">
                  <div className="border border-white/10 px-6 py-8">
                    <h2 className="text-3xl font-light mb-6">
                      Transaction History
                    </h2>

                    <TransactionFilters
                      activeFilter={activeTransactionFilter}
                      setActiveFilter={setActiveTransactionFilter}
                      onDateRangeChange={setTransactionDateRange}
                      dateRange={transactionDateRange}
                    />

                    {loadingTransactions ? (
                      <div className="flex justify-center items-center py-10">
                        <Loader className="w-8 h-8 animate-spin text-white/50" />
                      </div>
                    ) : filteredTransactions.length === 0 ? (
                      <div className="text-center py-12 border border-white/10">
                        <p className="text-white/70 mb-2">
                          No transaction history found
                        </p>
                        <p className="text-white/50 text-sm">
                          Your recent transactions will appear here
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="text-left text-white/50 uppercase text-xs">
                                <th className="pb-4 pl-4">Time</th>
                                <th className="pb-4 px-6">Type</th>
                                <th className="pb-4 px-6">Amount</th>
                                <th className="pb-4 px-6">Token</th>
                                <th className="pb-4 px-6">From/To</th>
                                <th className="pb-4 pr-4 text-right">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedTransactions.map((tx, index) => (
                                <tr
                                  key={index}
                                  className="border-t border-white/10 hover:bg-white/5 cursor-pointer"
                                  onClick={() => setSelectedTransaction(tx)}
                                >
                                  <td className="py-4 pl-4">
                                    <div className="text-sm">
                                      {new Date(
                                        tx.blockTime * 1000
                                      ).toLocaleString()}
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <div
                                      className={cn(
                                        "inline-flex items-center px-2 py-1 text-xs border",
                                        TRANSACTION_TYPES[
                                          tx.type as keyof typeof TRANSACTION_TYPES
                                        ]?.color ||
                                          "text-white/70 border-white/30"
                                      )}
                                    >
                                      {TRANSACTION_TYPES[
                                        tx.type as keyof typeof TRANSACTION_TYPES
                                      ]?.icon || (
                                        <History className="w-3 h-3 mr-1" />
                                      )}
                                      {TRANSACTION_TYPES[
                                        tx.type as keyof typeof TRANSACTION_TYPES
                                      ]?.label || String(tx.type).toUpperCase()}
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <div
                                      className={cn(
                                        "font-mono",
                                        tx.type === "receive"
                                          ? "text-green-400"
                                          : "text-white"
                                      )}
                                    >
                                      {tx.type === "receive" ? "+" : "-"}
                                      {tx.amount.toLocaleString(undefined, {
                                        maximumFractionDigits: 9,
                                      })}
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="font-medium">
                                      {tx.token}
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="font-mono text-sm text-white/70">
                                      {tx.type === "receive"
                                        ? tx.fromAddress
                                          ? truncateAddress(tx.fromAddress)
                                          : "Unknown"
                                        : tx.toAddress
                                        ? truncateAddress(tx.toAddress)
                                        : "Unknown"}
                                    </div>
                                  </td>
                                  <td className="py-4 pr-4 text-right">
                                    <a
                                      href={getExplorerUrl(
                                        tx.signature,
                                        network
                                      )}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-white hover:text-white/70 transition-colors uppercase text-xs flex items-center ml-auto"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      View{" "}
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        {filteredTransactions.length > transactionsPerPage && (
                          <div className="flex justify-between items-center mt-6 px-4">
                            <button
                              onClick={() =>
                                setTransactionsPage((prev) =>
                                  Math.max(prev - 1, 1)
                                )
                              }
                              disabled={transactionsPage === 1}
                              className={cn(
                                "flex items-center",
                                transactionsPage === 1
                                  ? "text-white/30 cursor-not-allowed"
                                  : "text-white hover:text-white/70"
                              )}
                            >
                              <ChevronLeft className="w-4 h-4 mr-2" />
                              Previous
                            </button>

                            <div className="text-white/60">
                              Page {transactionsPage} of{" "}
                              {Math.ceil(
                                filteredTransactions.length /
                                  transactionsPerPage
                              )}
                            </div>

                            <button
                              onClick={() =>
                                setTransactionsPage((prev) =>
                                  Math.min(
                                    prev + 1,
                                    Math.ceil(
                                      filteredTransactions.length /
                                        transactionsPerPage
                                    )
                                  )
                                )
                              }
                              disabled={
                                transactionsPage >=
                                Math.ceil(
                                  filteredTransactions.length /
                                    transactionsPerPage
                                )
                              }
                              className={cn(
                                "flex items-center",
                                transactionsPage >=
                                  Math.ceil(
                                    filteredTransactions.length /
                                      transactionsPerPage
                                  )
                                  ? "text-white/30 cursor-not-allowed"
                                  : "text-white hover:text-white/70"
                              )}
                            >
                              Next
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === TABS.SETTINGS && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="border border-white/30 p-0.5 mb-8">
                  <div className="border border-white/10 px-6 py-8">
                    <h2 className="text-3xl font-light mb-6">
                      Profile Settings
                    </h2>

                    <div className="space-y-8">
                      {/* Username Setting */}
                      <div className="border border-white/10 p-6">
                        <h3 className="text-xl font-light mb-4">Username</h3>

                        {isEditingUsername ? (
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={newUsername}
                              onChange={(e) => setNewUsername(e.target.value)}
                              className="bg-white/5 border border-white/20 text-white p-2 flex-grow"
                              placeholder="Enter username"
                            />
                            <button
                              onClick={handleUsernameSave}
                              className="bg-white/10 hover:bg-white/20 p-2"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleUsernameCancelEdit}
                              className="bg-white/10 hover:bg-white/20 p-2"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <p className="text-lg">{username}</p>
                            <button
                              onClick={handleUsernameEdit}
                              className="bg-white/10 hover:bg-white/20 p-2"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Saved Wallets */}
                      <div className="border border-white/10 p-6">
                        <h3 className="text-xl font-light mb-4">
                          Saved Wallets
                        </h3>

                        {savedWallets.length === 0 ? (
                          <p className="text-white/60 mb-4">
                            No wallets saved yet. Add a wallet below.
                          </p>
                        ) : (
                          <div className="mb-6 space-y-3">
                            {savedWallets.map((wallet, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between border border-white/10 p-3"
                              >
                                <div>
                                  <p className="font-medium">{wallet.name}</p>
                                  <p className="text-white/60 text-sm">
                                    {truncateAddress(wallet.address)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {defaultWallet === wallet.address ? (
                                    <span className="text-green-400 text-xs uppercase border border-green-400/30 px-2 py-1">
                                      Default
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleSetDefaultWallet(wallet.address)
                                      }
                                      className="text-xs uppercase border border-white/30 hover:border-white px-2 py-1 text-white/70 hover:text-white"
                                    >
                                      Set Default
                                    </button>
                                  )}
                                  <button
                                    onClick={() =>
                                      handleRemoveWallet(wallet.address)
                                    }
                                    className="text-white/70 hover:text-white"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add New Wallet Form */}
                        <div className="border border-white/10 p-4">
                          <h4 className="text-lg font-light mb-3">
                            Add New Wallet
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-white/60 text-sm mb-1">
                                Wallet Name
                              </label>
                              <input
                                type="text"
                                value={newWalletName}
                                onChange={(e) =>
                                  setNewWalletName(e.target.value)
                                }
                                className="w-full bg-white/5 border border-white/20 text-white p-2"
                                placeholder="Enter a name for this wallet"
                              />
                            </div>
                            <div>
                              <label className="block text-white/60 text-sm mb-1">
                                Wallet Address
                              </label>
                              <input
                                type="text"
                                value={newWalletAddress}
                                onChange={(e) =>
                                  setNewWalletAddress(e.target.value)
                                }
                                className="w-full bg-white/5 border border-white/20 text-white p-2"
                                placeholder="Enter Solana wallet address"
                              />
                            </div>
                            <button
                              onClick={handleAddWallet}
                              disabled={!newWalletName || !newWalletAddress}
                              className={cn(
                                "w-full py-2 px-4 flex items-center justify-center",
                                !newWalletName || !newWalletAddress
                                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                                  : "bg-white/10 hover:bg-white/20 text-white"
                              )}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Wallet
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Network Settings */}
                      <div className="border border-white/10 p-6">
                        <h3 className="text-xl font-light mb-4">
                          Network Settings
                        </h3>

                        <div className="space-y-4">
                          <div className="flex flex-col">
                            <label className="block text-white/60 text-sm mb-2">
                              Network
                            </label>
                            <select
                              value={network}
                              onChange={(e) => setNetwork(e.target.value)}
                              className="bg-white/10 border border-white/20 px-3 py-2 text-white"
                            >
                              <option value="mainnet-beta">Mainnet Beta</option>
                              <option value="testnet">Testnet</option>
                              <option value="devnet">Devnet</option>
                            </select>
                          </div>

                          <div className="flex flex-col">
                            <label className="block text-white/60 text-sm mb-2">
                              RPC Endpoint
                            </label>
                            <div className="flex">
                              <input
                                type="text"
                                value={`https://api.${network}.solana.com`}
                                disabled
                                className="w-full bg-white/5 border border-white/20 text-white p-2"
                              />
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    `https://api.${network}.solana.com`
                                  )
                                }
                                className="bg-white/10 hover:bg-white/20 p-2 ml-2"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* App Settings */}
                      <div className="border border-white/10 p-6">
                        <h3 className="text-xl font-light mb-4">
                          App Settings
                        </h3>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Dark Mode</p>
                              <p className="text-white/60 text-sm">
                                Toggle between light and dark themes
                              </p>
                            </div>
                            <div className="bg-white/10 h-6 w-12 rounded-full relative">
                              <div className="absolute top-1 right-1 h-4 w-4 bg-white rounded-full"></div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Notifications</p>
                              <p className="text-white/60 text-sm">
                                Enable or disable transaction notifications
                              </p>
                            </div>
                            <div className="bg-white/10 h-6 w-12 rounded-full relative">
                              <div className="absolute top-1 left-1 h-4 w-4 bg-white rounded-full"></div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Chart Animations</p>
                              <p className="text-white/60 text-sm">
                                Enable or disable chart animations
                              </p>
                            </div>
                            <div className="bg-white/10 h-6 w-12 rounded-full relative">
                              <div className="absolute top-1 right-1 h-4 w-4 bg-white rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Data Export */}
                      <div className="border border-white/10 p-6">
                        <h3 className="text-xl font-light mb-4">Data Export</h3>

                        <div className="space-y-4">
                          <div className="flex flex-col">
                            <p className="text-white/60 text-sm mb-2">
                              Export your transaction history and portfolio data
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <button className="bg-white/10 hover:bg-white/20 px-4 py-2 text-sm flex items-center">
                                <Download className="w-4 h-4 mr-2" />
                                Export Transactions (CSV)
                              </button>
                              <button className="bg-white/10 hover:bg-white/20 px-4 py-2 text-sm flex items-center">
                                <Download className="w-4 h-4 mr-2" />
                                Export Portfolio Data (JSON)
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Analysis Settings */}
                      <div className="border border-white/10 p-6">
                        <h3 className="text-xl font-light mb-4">AI Analysis</h3>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Portfolio Insights</p>
                              <p className="text-white/60 text-sm">
                                Enable AI-powered portfolio analysis
                              </p>
                            </div>
                            <div className="bg-white/10 h-6 w-12 rounded-full relative">
                              <div className="absolute top-1 right-1 h-4 w-4 bg-white rounded-full"></div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Smart Alerts</p>
                              <p className="text-white/60 text-sm">
                                Receive AI-generated price alerts
                              </p>
                            </div>
                            <div className="bg-white/10 h-6 w-12 rounded-full relative">
                              <div className="absolute top-1 left-1 h-4 w-4 bg-white rounded-full"></div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                Transaction Categorization
                              </p>
                              <p className="text-white/60 text-sm">
                                Automatically categorize transactions
                              </p>
                            </div>
                            <div className="bg-white/10 h-6 w-12 rounded-full relative">
                              <div className="absolute top-1 right-1 h-4 w-4 bg-white rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          network={network}
        />
      )}

      {/* NFT Detail Modal */}
      {selectedNft && (
        <NFTDetailModal
          nft={selectedNft}
          onClose={() => setSelectedNft(null)}
        />
      )}
    </main>
  );
}
