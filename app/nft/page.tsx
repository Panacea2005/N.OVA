"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { LucideProps } from "lucide-react";
import {
  Download,
  Share,
  Zap,
  RefreshCw,
  ChevronDown,
  Sparkles,
  Save,
  Upload,
  ImagePlus,
  Sliders,
  Camera,
  Copy,
  Check,
  Edit3,
  Shield,
  Key,
  History,
} from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { CardBackgroundService } from "@/app/nft/cardService";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import dynamic from "next/dynamic";

const NIdentityBanner = dynamic(() => import("@/components/3d/nidentity-banner"), {
  ssr: false,
});

export default function IdentityCardGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("cyberpunk");
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);

  // ID Card specific state
  const [userName, setUserName] = useState("Mai Anh");
  const [userAddress, setUserAddress] = useState(
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  );
  const [userRank, setUserRank] = useState("ARCHITECT");
  const [userAvatar, setUserAvatar] = useState(
    "/placeholder.svg?height=100&width=100"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // QR Code state
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // Simulated wallet data
  const [walletData, setWalletData] = useState({
    balance: "3427 $O",
    nftCount: 5,
  });

  // Save user data to local storage whenever it changes
  useEffect(() => {
    const userData = {
      userName,
      userAddress,
      userRank,
      userAvatar,
      walletData,
      privileges: [
        "DAO VOTING RIGHTS",
        "EARLY ACCESS",
        "TOKEN REWARDS",
        "AGENT STATUS",
      ],
      dateVerified: new Date().toLocaleDateString(),
    };
    localStorage.setItem("identityCardData", JSON.stringify(userData));
  }, [userName, userAddress, userRank, userAvatar, walletData]);

  // Generate QR code with a static URL to /nft/scan
  useEffect(() => {
    const generateQrCode = async () => {
      try {
        const baseUrl =
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000";
        const scanUrl = `${baseUrl}/nft/scan`;
        console.log("QR Code URL:", scanUrl);

        const qrCodeImageUrl = await QRCode.toDataURL(scanUrl, {
          width: 80,
          margin: 1,
          errorCorrectionLevel: "H",
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCodeUrl(qrCodeImageUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
        setQrCodeUrl("");
      }
    };

    generateQrCode();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setErrorMessage("");

    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      console.log("Generating card background with:", {
        prompt,
        selectedStyle,
      });
      const blob = await CardBackgroundService.generateCardBackground(
        prompt,
        selectedStyle
      );

      // Convert blob to Data URL
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreviewImage(dataUrl);
        localStorage.setItem("previewImage", dataUrl); // Save Data URL to local storage
      };
      reader.readAsDataURL(blob);

      setGenerationHistory((prev) => [prompt, ...prev].slice(0, 10));

      // Save user data to local storage after generation
      const userData = {
        userName,
        userAddress,
        userRank,
        userAvatar,
        walletData,
        privileges: [
          "DAO VOTING RIGHTS",
          "EARLY ACCESS",
          "TOKEN REWARDS",
          "AGENT STATUS",
        ],
        dateVerified: new Date().toLocaleDateString(),
      };
      localStorage.setItem("identityCardData", JSON.stringify(userData));
    } catch (error: any) {
      console.error("Error generating card background:", error);
      const displayError = error.message.includes("Authentication error")
        ? "API Error: Invalid API key or permissions"
        : error.message.includes("Rate limit exceeded")
        ? "API Error: Rate limit exceeded, try again later"
        : error.message.includes("Stability API error")
        ? `API Error: ${
            error.message.split(" - ")[1] || "Invalid request parameters"
          }`
        : "Failed to generate card background";
      setErrorMessage(displayError);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUserAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const savePrompt = () => {
    if (!prompt.trim()) return;
    alert("Prompt saved to your collection");
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(userAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadCard = async () => {
    if (!previewImage || !canvasRef.current) {
      setErrorMessage(
        "No card available to download. Please generate a card first."
      );
      return;
    }

    try {
      const cardElement = canvasRef.current.querySelector(
        ".relative.w-full.max-w-md.mx-auto.my-10"
      );
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const canvas = await html2canvas(cardElement as HTMLElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "O-XYZ-Identity-Card.png";
      link.click();
    } catch (error) {
      console.error("Error downloading card:", error);
      setErrorMessage("Failed to download card. Please try again.");
    }
  };

  // Example styles for the generator
  const styles = [
    { id: "cyberpunk", name: "Cyberpunk", description: "Neon city vibes" },
    { id: "quantum", name: "Quantum Field", description: "Abstract patterns" },
    { id: "neural", name: "Neural Network", description: "AI visualization" },
    { id: "digital", name: "Digital Space", description: "Virtual reality" },
    { id: "cosmic", name: "Cosmic", description: "Space and galaxies" },
    { id: "matrix", name: "Matrix", description: "Digital code rain" },
  ];

  // Truncate wallet address for display
  const truncatedAddress = `${userAddress.substring(
    0,
    6
  )}...${userAddress.substring(userAddress.length - 4)}`;

  return (
    <>
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(circle at center, rgba(139, 92, 246, 0.2) 0%, rgba(0, 0, 0, 0) 70%)",
            }}
          />
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <motion.div
                key={`scan-${i}`}
                className="absolute w-full h-[1px] bg-purple-400/10"
                style={{ top: `${i * 25}%` }}
                animate={{
                  opacity: [0.1, 0.2, 0.1],
                  scaleY: [1, 1.5, 1],
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 15 + (i % 3),
                  repeat: Infinity,
                  delay: i * 1.5,
                }}
              />
            ))}
        </div>

        <Navigation />

        <main className="container mx-auto px-4 pt-20 pb-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-10"
          >
            <NIdentityBanner />
          </motion.div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-300">
              N.IDENTITY
            </h1>
            <p className="text-white/70">
              Generate your unique AI-powered Sovereign Identity Card
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-sm p-4 group hover:border-purple-500/30 transition-all duration-300">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />

                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1 text-purple-400" />
                  Background Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the background for your identity card..."
                  className="w-full h-32 bg-black/30 text-white/90 border border-white/10 rounded-sm p-3 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                />

                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-white/40">
                    {prompt.length} / 500
                  </div>
                  <div className="space-x-2">
                    <button
                      className="p-1 text-white/60 hover:text-purple-400 transition-colors"
                      onClick={savePrompt}
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-white/60 hover:text-purple-400 transition-colors"
                      onClick={() => setPrompt("")}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-sm p-4 group hover:border-purple-500/30 transition-all duration-300">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />

                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-3 flex items-center">
                  <ImagePlus className="w-3 h-3 mr-1 text-purple-400" />
                  Background Style
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      className={`p-2 rounded-sm text-xs flex flex-col items-center justify-center transition-colors ${
                        selectedStyle === style.id
                          ? "bg-purple-500/20 border border-purple-500/50 text-white"
                          : "bg-black/30 border border-white/10 text-white/70 hover:border-purple-500/30"
                      }`}
                      onClick={() => setSelectedStyle(style.id)}
                    >
                      <span className="font-medium">{style.name}</span>
                      <span className="text-[10px] mt-1 opacity-70">
                        {style.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-sm p-4 group hover:border-purple-500/30 transition-all duration-300">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />

                <div className="flex justify-between items-center mb-4">
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 flex items-center">
                    <Shield className="w-3 h-3 mr-1 text-purple-400" />
                    Identity Information
                  </label>

                  <button
                    className="text-xs text-white/60 hover:text-white/90 transition-colors flex items-center"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    {isEditing ? "Save" : "Edit"}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-white/60 block mb-1">
                      Display Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full bg-black/30 text-white/90 border border-white/10 rounded-sm p-2 focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                    ) : (
                      <div className="bg-black/30 text-white/90 border border-white/10 rounded-sm p-2 font-mono">
                        {userName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-white/60 block mb-1 flex justify-between">
                      <span>Wallet Address</span>
                      <button
                        className="text-purple-400 hover:text-purple-300 transition-colors flex items-center"
                        onClick={copyAddress}
                      >
                        {isCopied ? (
                          <span className="flex items-center">
                            <Check className="w-3 h-3 mr-1" />
                            Copied!
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </span>
                        )}
                      </button>
                    </label>
                    <div className="bg-black/30 text-white/90 border border-white/10 rounded-sm p-2 font-mono text-xs truncate">
                      {userAddress}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/60 block mb-1">
                      Sovereign Rank
                    </label>
                    {isEditing ? (
                      <select
                        value={userRank}
                        onChange={(e) => setUserRank(e.target.value)}
                        className="w-full bg-black/30 text-white/90 border border-white/10 rounded-sm p-2 focus:outline-none focus:border-purple-500/50 transition-colors"
                      >
                        <option value="INITIATE">INITIATE</option>
                        <option value="AGENT">AGENT</option>
                        <option value="ADVANCED">ADVANCED</option>
                        <option value="SOVEREIGN">SOVEREIGN</option>
                        <option value="ARCHITECT">ARCHITECT</option>
                      </select>
                    ) : (
                      <div className="bg-black/30 text-white/90 border border-white/10 rounded-sm p-2 font-mono">
                        {userRank}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-white/60 block mb-1">
                      Profile Image
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-black/50 border border-white/10 rounded-sm overflow-hidden">
                        <img
                          src={userAvatar}
                          alt="User avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {isEditing && (
                        <label className="cursor-pointer px-3 py-1 border border-white/10 rounded-sm text-xs text-white/70 hover:border-purple-500/30 hover:text-white transition-colors flex items-center">
                          <Upload className="w-3 h-3 mr-1" />
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-sm p-4 group hover:border-purple-500/30 transition-all duration-300">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />

                <button
                  className="w-full flex justify-between items-center"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                >
                  <div className="flex items-center">
                    <Sliders className="w-4 h-4 mr-2 text-purple-400" />
                    <span className="text-sm font-medium">
                      Advanced Settings
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-white/60 transition-transform ${
                      showAdvancedSettings ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showAdvancedSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-black/30 border border-white/10 rounded-sm p-2">
                            <label className="text-xs text-white/60 block mb-1">
                              Card Design
                            </label>
                            <select className="w-full bg-black/50 border border-white/10 rounded-sm p-1 text-sm focus:outline-none focus:border-purple-500/50">
                              <option value="standard">Standard</option>
                              <option value="premium">Premium</option>
                              <option value="founder">Founder</option>
                            </select>
                          </div>
                          <div className="bg-black/30 border border-white/10 rounded-sm p-2">
                            <label className="text-xs text-white/60 block mb-1">
                              Encryption Level
                            </label>
                            <select className="w-full bg-black/50 border border-white/10 rounded-sm p-1 text-sm focus:outline-none focus:border-purple-500/50">
                              <option value="standard">Standard</option>
                              <option value="advanced">Advanced</option>
                              <option value="quantum">Quantum</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-black/30 border border-white/10 rounded-sm text-sm">
                          <span className="text-xs text-white/60 flex items-center">
                            <Key className="w-3 h-3 mr-1 text-purple-400" />
                            Enable Secret Key Access
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-9 h-5 bg-black/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600" />
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative group">
                <button
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-sm font-medium text-lg relative z-10 overflow-hidden group"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isGenerating ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Generating Card...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Zap className="mr-2 h-5 w-5" />
                        Generate Identity Card
                      </span>
                    )}
                  </span>
                  <motion.div className="absolute top-0 -right-40 w-32 h-full bg-white transform rotate-12 translate-x-0 -translate-y-0 opacity-20 group-hover:translate-x-80 transition-transform duration-1000" />
                </button>
                <motion.div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-sm blur-lg opacity-30 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              </div>

              {errorMessage && (
                <div className="relative bg-red-900/30 border border-red-500/50 rounded-sm p-4">
                  <p className="text-xs text-red-400 text-center">
                    {errorMessage}
                  </p>
                </div>
              )}

              <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-sm p-4 group hover:border-purple-500/30 transition-all duration-300">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />

                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 flex items-center">
                    <History className="w-3 h-3 mr-1 text-purple-400" />
                    Recent Cards
                  </label>
                </div>
                <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent">
                  {generationHistory.length > 0 ? (
                    <div className="space-y-2">
                      {generationHistory.map((historyPrompt, index) => (
                        <div
                          key={index}
                          className="text-xs p-2 bg-black/30 border border-white/10 rounded-sm hover:border-purple-500/30 cursor-pointer transition-colors"
                          onClick={() => setPrompt(historyPrompt)}
                        >
                          {historyPrompt.length > 60
                            ? historyPrompt.substring(0, 60) + "..."
                            : historyPrompt}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-white/40 text-xs py-4">
                      No generation history yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-sm p-4 h-full group hover:border-purple-500/30 transition-all duration-300">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse mr-2" />
                    <span className="text-sm font-mono text-white/70">
                      {previewImage
                        ? "IDENTITY CARD PREVIEW"
                        : "IDENTITY CARD PREVIEW"}
                    </span>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      className={`p-1.5 rounded-sm ${
                        previewImage
                          ? "text-white/80 hover:bg-white/5"
                          : "text-white/20"
                      } transition-colors flex items-center text-xs`}
                      onClick={downloadCard}
                      disabled={previewImage === null}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      <span>SAVE</span>
                    </button>
                    <button
                      className={`p-1.5 rounded-sm ${
                        previewImage
                          ? "text-white/80 hover:bg-white/5"
                          : "text-white/20"
                      } transition-colors flex items-center text-xs`}
                      disabled={previewImage === null}
                    >
                      <Share className="w-3 h-3 mr-1" />
                      <span>SHARE</span>
                    </button>
                  </div>
                </div>

                <div
                  ref={canvasRef}
                  className="flex items-center justify-center bg-black/60 border border-white/5 rounded-sm relative overflow-hidden"
                  style={{ minHeight: "550px" }}
                >
                  {isGenerating ? (
                    <div className="text-center">
                      <div className="w-16 h-16 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin mb-4 mx-auto" />
                      <div className="text-white/70 animate-pulse">
                        Generating your identity card...
                      </div>
                      <div className="text-xs text-white/40 mt-2">
                        Creating sovereign credentials
                      </div>
                    </div>
                  ) : errorMessage ? (
                    <div className="text-center">
                      <div className="text-white/70">Error generating card</div>
                      <div className="text-xs text-red-400 mt-2">
                        {errorMessage}
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full max-w-md mx-auto my-10">
                      <div className="relative aspect-[1.58/1] rounded-lg overflow-hidden border-2 border-white/10 shadow-lg shadow-purple-900/20">
                        <div className="absolute inset-0 z-0">
                          {previewImage ? (
                            <img
                              src={previewImage}
                              alt="Card background"
                              className="w-full h-full object-cover opacity-60"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-900/40 via-black/60 to-indigo-900/40" />
                          )}
                          <div
                            className="absolute inset-0 pointer-events-none opacity-10"
                            style={{
                              backgroundImage:
                                "linear-gradient(to right, rgba(139, 92, 246, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.5) 1px, transparent 1px)",
                              backgroundSize: "20px 20px",
                            }}
                          />
                          <motion.div
                            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                            animate={{
                              top: ["0%", "100%"],
                              opacity: [0, 0.7, 0],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                        </div>

                        <div className="absolute inset-0 z-10 p-5 flex flex-col">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="text-xs text-white/80 font-mono mb-1">
                                N.IDENTITY
                              </div>
                              <div className="text-xl font-bold text-white">
                                SOVEREIGN CARD
                              </div>
                            </div>
                            <div className="px-2 py-1 bg-purple-500/20 border border-purple-500/40 rounded-sm">
                              <div className="text-xs text-white/80 font-mono">
                                {userRank}
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-4 mb-6">
                            <div className="w-16 h-16 rounded-md overflow-hidden border border-white/20">
                              <img
                                src={userAvatar}
                                alt="User"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-bold text-white mb-1">
                                {userName}
                              </div>
                              <div className="text-xs text-white/70 font-mono mb-1 truncate">
                                {truncatedAddress}
                              </div>
                              <div className="text-[9px] text-white/50 font-mono">
                                VERIFIED: {new Date().toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col">
                            <div className="relative flex-1">
                              <div className="text-xs text-white/60 font-mono mb-1">
                                PRIVILEGES
                              </div>
                              <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="text-[10px] text-white/80 flex items-center">
                                  <div className="w-1 h-1 rounded-full bg-purple-400 mr-1" />
                                  <span>DAO VOTING RIGHTS</span>
                                </div>
                                <div className="text-[10px] text-white/80 flex items-center">
                                  <div className="w-1 h-1 rounded-full bg-purple-400 mr-1" />
                                  <span>EARLY ACCESS</span>
                                </div>
                                <div className="text-[10px] text-white/80 flex items-center">
                                  <div className="w-1 h-1 rounded-full bg-purple-400 mr-1" />
                                  <span>TOKEN REWARDS</span>
                                </div>
                                <div className="text-[10px] text-white/80 flex items-center">
                                  <div className="w-1 h-1 rounded-full bg-purple-400 mr-1" />
                                  <span>AGENT STATUS</span>
                                </div>
                              </div>
                              <div className="absolute bottom-0 right-0">
                                {qrCodeUrl && (
                                  <img
                                    src={qrCodeUrl}
                                    alt="QR Code"
                                    className="w-20 h-20 bg-white p-1 rounded-sm shadow-lg"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none z-20" />
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 z-20" />
                      </div>
                      <div className="absolute -bottom-4 left-4 right-4 h-4 bg-black blur-xl" />
                      <div className="absolute -bottom-10 left-0 right-0 text-center">
                        <div className="text-xs text-white/50 font-mono">
                          BLOCKCHAIN ID: #
                          {Math.floor(Math.random() * 10000)
                            .toString()
                            .padStart(4, "0")}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-sm p-4 group hover:border-purple-500/30 transition-all duration-300">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />

              <h3 className="text-lg font-medium mb-2 text-purple-300">
                Soulbound Identity
              </h3>
              <p className="text-white/70 text-sm">
                Your N.IDENTITY card is cryptographically bound to your wallet
                and cannot be transferred or duplicated.
              </p>
            </div>

            <div className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-sm p-4 group hover:border-purple-500/30 transition-all duration-300">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />

              <h3 className="text-lg font-medium mb-2 text-purple-300">
                Quantum Security
              </h3>
              <p className="text-white/70 text-sm">
                Advanced cryptographic protection ensures your identity remains
                secure even against quantum computing attacks.
              </p>
            </div>

            <div className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-sm p-4 group hover:border-purple-500/30 transition-all duration-300">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500/30 group-hover:border-purple-500/70 transition-colors" />

              <h3 className="text-lg font-medium mb-2 text-purple-300">
                DAO Access
              </h3>
              <p className="text-white/70 text-sm">
                Your identity card grants you voting rights in the N.DAO
                governance system and access to exclusive ecosystem features.
              </p>
            </div>
          </div>
        </main>

        <Footer />

        <div className="fixed top-10 left-10 w-16 h-16 border-l border-t border-white/10 z-10" />
        <div className="fixed top-10 right-10 w-16 h-16 border-r border-t border-white/10 z-10" />
        <div className="fixed bottom-10 left-10 w-16 h-16 border-l border-b border-white/10 z-10" />
        <div className="fixed bottom-10 right-10 w-16 h-16 border-r border-b border-white/10 z-10" />
      </div>

      <style jsx global>
        {`
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }

          ::-webkit-scrollbar-track {
            background: transparent;
          }

          ::-webkit-scrollbar-thumb {
            background-color: rgba(139, 92, 246, 0.3);
            border-radius: 3px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background-color: rgba(139, 92, 246, 0.5);
          }

          * {
            scrollbar-width: thin;
            scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
          }
        `}
      </style>
    </>
  );
}
