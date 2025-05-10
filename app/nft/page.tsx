"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Download,
  Share,
  RefreshCw,
  ChevronDown,
  Sparkles,
  Save,
  Upload,
  ImagePlus,
  Camera,
  Copy,
  Check,
  Edit3,
  Shield,
  History,
  RotateCw,
} from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { CardBackgroundService } from "@/app/nft/cardService";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import dynamic from "next/dynamic";
import { usePhantom } from "@/hooks/use-phantom";
import { toast } from "@/components/ui/use-toast";

const NIdentityBanner = dynamic(() => import("@/components/3d/nidentity-banner"), {
  ssr: false,
});

export default function IdentityCardGenerator() {
  const {
    walletAddress,
    isConnected,
    novaBalance,
    connection,
  } = usePhantom();

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("cyberpunk");
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // ID Card specific state
  const [userName, setUserName] = useState("N.OVA User");
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [userAvatar, setUserAvatar] = useState("/placeholder.svg?height=100&width=100");

  // QR Code state
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to determine rank based on token balance
  const determineRank = (novaBalance: number | null | undefined) => {
    if (novaBalance === null || novaBalance === undefined)
      return { name: "ECHO", color: "border-gray-500", gradient: "from-gray-400 to-gray-600" };

    // Convert raw balance by removing 9 decimals (standard for Solana tokens)
    const convertedBalance = novaBalance / Math.pow(10, 9);

    if (convertedBalance >= 100000)
      return { name: "SOVEREIGN", color: "border-amber-500", gradient: "from-amber-400 to-amber-600" };
    if (convertedBalance >= 20000)
      return { name: "ORACLE", color: "border-pink-500", gradient: "from-pink-400 to-pink-600" };
    if (convertedBalance >= 5000)
      return { name: "NEXUS", color: "border-purple-500", gradient: "from-purple-400 to-purple-600" };
    if (convertedBalance >= 1500)
      return { name: "CIPHER", color: "border-teal-500", gradient: "from-teal-400 to-teal-600" };
    if (convertedBalance >= 500)
      return { name: "SIGNAL", color: "border-cyan-500", gradient: "from-cyan-400 to-cyan-600" };
    if (convertedBalance >= 100)
      return { name: "PULSE", color: "border-blue-500", gradient: "from-blue-400 to-blue-600" };
    return { name: "ECHO", color: "border-gray-500", gradient: "from-gray-400 to-gray-600" };
  };

  // Save user data to local storage whenever it changes
  useEffect(() => {
    if (mounted) {
      const userData = {
        userName,
        userAddress: walletAddress || "",
        userRank: determineRank(novaBalance).name,
        userAvatar,
        dateVerified: new Date().toLocaleDateString(),
      };
      localStorage.setItem("identityCardData", JSON.stringify(userData));
    }
  }, [userName, walletAddress, novaBalance, userAvatar, mounted]);

  // Generate QR code
  useEffect(() => {
    if (mounted) {
      const generateQrCode = async () => {
        try {
          const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
          const scanUrl = `${baseUrl}/nft/scan`;
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
    }
  }, [mounted]);

  // Load user data from local storage
  useEffect(() => {
    if (mounted) {
      const savedData = localStorage.getItem("identityCardData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setUserName(parsedData.userName || "N.OVA User");
        setUserAvatar(parsedData.userAvatar || "/placeholder.svg?height=100&width=100");
      }
    }
  }, [mounted]);

  // Load previous preview image if available
  useEffect(() => {
    if (mounted) {
      const savedPreview = localStorage.getItem("previewImage");
      if (savedPreview) {
        setPreviewImage(savedPreview);
      }
    }
  }, [mounted]);

  // Cleanup preview image URL on unmount
  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setErrorMessage("");

    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const blob = await CardBackgroundService.generateCardBackground(
        prompt,
        selectedStyle
      );
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreviewImage(dataUrl);
        localStorage.setItem("previewImage", dataUrl);
      };
      reader.readAsDataURL(blob);

      setGenerationHistory((prev) => [prompt, ...prev].slice(0, 10));
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

  const savePrompt = () => {
    if (!prompt.trim()) return;
    alert("Prompt saved to your collection");
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const downloadCard = async () => {
    if (!previewImage || !canvasRef.current) {
      setErrorMessage(
        "No card available to download. Please generate a card first."
      );
      return;
    }

    try {
      const cardElement = canvasRef.current.querySelector(".card-container");
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
      link.download = "NOVA-Identity-Card.png";
      link.click();
    } catch (error) {
      console.error("Error downloading card:", error);
      setErrorMessage("Failed to download card. Please try again.");
    }
  };

  // Update the profile banner with the current card
  const updateProfileBanner = async () => {
    if (!previewImage) {
      setErrorMessage(
        "No card available to update. Please generate a card first."
      );
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // For a real implementation, we might make API calls here
      // But for now, we simply need to ensure the card is in localStorage
      // which is already handled by the generate function
      
      // Trigger a reload of any components that use the card data
      const event = new CustomEvent('identityCardUpdated', { 
        detail: { 
          timestamp: new Date().getTime() 
        } 
      });
      window.dispatchEvent(event);
      
      // Show success message
      toast({
        title: "Identity Card Updated",
        description: "Your identity card has been set as your active profile",
        duration: 3000
      });
    } catch (error) {
      console.error("Error updating profile banner:", error);
      setErrorMessage("Failed to update profile banner. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const styles = [
    { id: "cyberpunk", name: "CYBERPUNK", description: "Neon city vibes" },
    { id: "quantum", name: "QUANTUM", description: "Abstract patterns" },
    { id: "neural", name: "NEURAL", description: "AI visualization" },
    { id: "digital", name: "DIGITAL", description: "Virtual reality" },
    { id: "cosmic", name: "COSMIC", description: "Space and galaxies" },
    { id: "matrix", name: "MATRIX", description: "Digital code rain" },
  ];

  const truncatedAddress = walletAddress
    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
    : "Not connected";

  // Get the current rank based on NOVA balance
  const userRank = determineRank(novaBalance);
  
  // Format NOVA balance for display
  const formattedNovaBalance = novaBalance ? (novaBalance / Math.pow(10, 9)).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  }) : "0";

  return (
    <main className="relative min-h-screen bg-black text-white font-mono">
      <div className="fixed inset-0 bg-black z-0" />
      <div
        className="fixed inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <Navigation />

      <div className="container mx-auto px-2 pt-24 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-10"
          >
            <NIdentityBanner />
          </motion.div>

          <div className="mb-16">
            <h1 className="text-8xl font-light mb-6">N.IDENTITY</h1>
            <p className="text-white/70 uppercase max-w-4xl">
              GENERATE YOUR UNIQUE AI-POWERED SOVEREIGN IDENTITY CARD
            </p>
            <p className="text-white/70 uppercase max-w-4xl mt-2">
              EACH NOVA TOKEN HOLDER RECEIVES A CRYPTOGRAPHICALLY SECURED IDENTITY CARD THAT SERVES AS THEIR DIGITAL PASSPORT.
            </p>
          </div>

          {/* Current Rank Display */}
          <div className="border border-white/30 p-0.5 mb-8">
            <div className="border border-white/10 px-6 py-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-white/60 uppercase text-sm">Current Balance:</div>
                  <div className="text-lg font-light">{formattedNovaBalance} NOVA</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-white/60 uppercase text-sm">Rank:</div>
                  <div className={`px-2 py-1 bg-black ${userRank.color}/30 text-xs uppercase border ${userRank.color}`}>
                    {userRank.name}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-white/30 p-0.5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="border border-white/10 px-6 py-8"
            >
              <h2 className="text-5xl font-light mb-10">Card Generator</h2>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="border border-white/20 p-5">
                    <label className="block text-xs uppercase text-white/60 mb-2 flex items-center">
                      <Sparkles className="w-3 h-3 mr-1 text-white/80" />
                      Background Prompt
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the background for your identity card..."
                      className="w-full h-32 bg-black text-white/90 border border-white/10 p-3 focus:outline-none focus:border-white/30 resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-white/40">
                        {prompt.length} / 500
                      </div>
                      <div className="space-x-2">
                        <button
                          className="p-1 text-white/60 hover:text-white transition-colors"
                          onClick={savePrompt}
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-white/60 hover:text-white transition-colors"
                          onClick={() => setPrompt("")}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border border-white/20 p-5">
                    <label className="block text-xs uppercase text-white/60 mb-3 flex items-center">
                      <ImagePlus className="w-3 h-3 mr-1 text-white/80" />
                      Background Style
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {styles.map((style) => (
                        <button
                          key={style.id}
                          className={`p-2 text-xs flex flex-col items-center justify-center transition-colors ${
                            selectedStyle === style.id
                              ? "bg-white/5 border border-white/30 text-white"
                              : "bg-black border border-white/10 text-white/70 hover:border-white/20"
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

                  <div className="border border-white/20 p-5">
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-xs uppercase text-white/60 flex items-center">
                        <Shield className="w-3 h-3 mr-1 text-white/80" />
                        Identity Information
                      </label>
                      <button
                        className="text-xs text-white/60 hover:text-white transition-colors flex items-center"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        {isEditing ? "SAVE" : "EDIT"}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-white/60 block mb-1 uppercase">
                          Display Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full bg-black text-white/90 border border-white/10 p-2 focus:outline-none focus:border-white/30"
                          />
                        ) : (
                          <div className="bg-black text-white/90 border border-white/10 p-2 font-mono">
                            {userName}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-xs text-white/60 block mb-1 uppercase flex justify-between">
                          <span>Wallet Address</span>
                          <button
                            className="text-white/60 hover:text-white transition-colors flex items-center"
                            onClick={copyAddress}
                          >
                            {isCopied ? (
                              <span className="flex items-center">
                                <Check className="w-3 h-3 mr-1" />
                                COPIED
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <Copy className="w-3 h-3 mr-1" />
                                COPY
                              </span>
                            )}
                          </button>
                        </label>
                        <div className="bg-black text-white/90 border border-white/10 p-2 font-mono text-xs truncate">
                          {walletAddress ? truncatedAddress : "Not connected"}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-white/60 block mb-1 uppercase">
                          Sovereign Rank (Based on NOVA Balance)
                        </label>
                        <div className={`bg-black text-white/90 border ${userRank.color}/30 p-2 font-mono`}>
                          {userRank.name}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-white/60 block mb-1 uppercase">
                          Profile Image
                        </label>
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-black border border-white/10 overflow-hidden">
                            <img
                              src={userAvatar}
                              alt="User avatar"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {isEditing && (
                            <label className="cursor-pointer px-3 py-1 border border-white/10 text-xs text-white/70 hover:border-white/30 hover:text-white transition-colors flex items-center">
                              <Upload className="w-3 h-3 mr-1" />
                              UPLOAD
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

                  <div className="border border-white/20 p-5">
                    <button
                      className="w-full flex justify-between items-center"
                      onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    >
                      <div className="text-sm uppercase">
                        Advanced Settings
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
                            <div className="bg-black border border-white/10 p-2">
                              <label className="text-xs text-white/60 block mb-1 uppercase">
                                Encryption Level
                              </label>
                              <select className="w-full bg-black border border-white/10 p-1 text-sm focus:outline-none focus:border-white/30">
                                <option value="standard">STANDARD</option>
                                <option value="advanced">ADVANCED</option>
                                <option value="quantum">QUANTUM</option>
                              </select>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    className="w-full py-3 bg-white text-black uppercase font-medium text-lg"
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim() || !isConnected}
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-black"
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
                        GENERATING CARD...
                      </span>
                    ) : !isConnected ? (
                      "CONNECT WALLET FIRST"
                    ) : (
                      "GENERATE IDENTITY CARD"
                    )}
                  </button>

                  {errorMessage && (
                    <div className="border border-red-500/30 p-4">
                      <p className="text-xs text-red-400 text-center">
                        {errorMessage}
                      </p>
                    </div>
                  )}

                  <div className="border border-white/20 p-5">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-xs uppercase text-white/60 flex items-center">
                        <History className="w-3 h-3 mr-1 text-white/80" />
                        Recent Cards
                      </label>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {generationHistory.length > 0 ? (
                        <div className="space-y-2">
                          {generationHistory.map((historyPrompt, index) => (
                            <div
                              key={index}
                              className="text-xs p-2 bg-black border border-white/10 hover:border-white/30 cursor-pointer transition-colors"
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
                  <div
                    ref={canvasRef}
                    className="border border-white/20 p-5 h-full flex flex-col"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse mr-2" />
                        <span className="text-sm font-mono text-white/70 uppercase">
                          Identity Card Preview
                        </span>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          className={`p-1.5 text-xs ${
                            previewImage
                              ? "text-white hover:bg-white/5"
                              : "text-white/20"
                          } transition-colors flex items-center uppercase`}
                          onClick={downloadCard}
                          disabled={previewImage === null}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          <span>SAVE</span>
                        </button>
                        <button
                          className={`p-1.5 text-xs ${
                            previewImage
                              ? "text-white hover:bg-white/5"
                              : "text-white/20"
                          } transition-colors flex items-center uppercase`}
                          disabled={previewImage === null}
                        >
                          <Share className="w-3 h-3 mr-1" />
                          <span>SHARE</span>
                        </button>
                        {/* New "Update" button added here */}
                        <button
                          className={`p-1.5 text-xs ${
                            previewImage
                              ? "text-white hover:bg-white/5"
                              : "text-white/20"
                          } transition-colors flex items-center uppercase`}
                          onClick={updateProfileBanner}
                          disabled={previewImage === null || isUpdating}
                        >
                          <RotateCw className={`w-3 h-3 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
                          <span>{isUpdating ? "UPDATING..." : "UPDATE"}</span>
                        </button>
                        <Link href="/nft/scan">
                          <button
                            className={`p-1.5 text-xs ${
                              previewImage
                                ? "text-white hover:bg-white/5"
                                : "text-white/20"
                              } transition-colors flex items-center uppercase`}
                            disabled={previewImage === null}
                          >
                            <Camera className="w-3 h-3 mr-1" />
                            <span>SCAN</span>
                          </button>
                        </Link>
                      </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center bg-black border border-white/10 relative overflow-hidden min-h-[550px]">
                      {isGenerating ? (
                        <div className="text-center">
                          <div className="w-16 h-16 border-t-2 border-b-2 border-white rounded-full animate-spin mb-4 mx-auto" />
                          <div className="text-white/70 animate-pulse uppercase">
                            Generating your identity card...
                          </div>
                          <div className="text-xs text-white/40 mt-2 uppercase">
                            Creating sovereign credentials
                          </div>
                        </div>
                      ) : previewImage ? (
                        <div className="card-container relative w-full max-w-md mx-auto my-10">
                          {/* Redesigned Card with Minimal Layout */}
                          <div className="relative aspect-[1.58/1] overflow-hidden border border-white/20">
                            {/* Background Image Layer */}
                            <div className="absolute inset-0 z-0">
                              <img
                                src={previewImage}
                                alt="Card background"
                                className="w-full h-full object-cover opacity-30"
                              />
                              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
                              <div
                                className="absolute inset-0 pointer-events-none opacity-10"
                                style={{
                                  backgroundImage:
                                    "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                                  backgroundSize: "20px 20px",
                                }}
                              />
                              {/* Animated Scan Line */}
                              <motion.div
                                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
                                animate={{
                                  top: ["0%", "100%"],
                                  opacity: [0, 0.3, 0],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              />
                            </div>

                            {/* Card Content Layer */}
                            <div className="absolute inset-0 z-10 p-5 flex flex-col">
                              {/* Header Section */}
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <div className="text-xs text-white/80 font-mono mb-1 uppercase">
                                    N.IDENTITY
                                  </div>
                                  <div className="text-xl font-light text-white uppercase tracking-wider">
                                    Sovereign Card
                                  </div>
                                </div>
                                <div className={`px-2 py-1 bg-black ${userRank.color}/30 text-xs uppercase border ${userRank.color}`}>
                                  {userRank.name}
                                </div>
                              </div>

                              {/* Main Content Section */}
                              <div className="flex space-x-4 mb-6">
                                <div className="w-16 h-16 overflow-hidden border border-white/20">
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
                                  <div className="flex items-center gap-2">
                                    <div className="text-[10px] text-white/50 font-mono uppercase">
                                      BALANCE: {formattedNovaBalance} NOVA
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                  </div>
                                  <div className="text-[10px] text-white/50 font-mono uppercase mt-1">
                                    VERIFIED: {new Date().toLocaleDateString()}
                                  </div>
                                </div>
                              </div>

                              {/* Privileges Section */}
                              <div className="flex-1 flex flex-col">
                                <div className="relative flex-1">
                                  <div className="text-xs text-white/80 font-mono mb-2 uppercase">
                                    Rank Privileges
                                  </div>
                                  <div className="grid grid-cols-1 gap-1 mb-4">
                                    {userRank.name === "ECHO" && (
                                      <>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">N.IDENTITY Creation</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">Daily Token Claims</span>
                                        </div>
                                      </>
                                    )}
                                    {userRank.name === "PULSE" && (
                                      <>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">N.IDENTITY Creation</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">Daily Token Claims</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">N.AI Basic Access</span>
                                        </div>
                                      </>
                                    )}
                                    {userRank.name === "SIGNAL" && (
                                      <>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">N.IDENTITY Creation</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">Daily Token Claims</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">N.AI Basic Access</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">Advanced Analytics</span>
                                        </div>
                                      </>
                                    )}
                                    {userRank.name === "CIPHER" && (
                                      <>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">N.IDENTITY Creation</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">Daily Token Claims</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">N.AI Basic Access</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">Advanced Analytics</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">Custom Identity Cards</span>
                                        </div>
                                      </>
                                    )}
                                    {userRank.name === "NEXUS" && (
                                      <>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">N.IDENTITY Creation</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">Daily Token Claims</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">N.AI Premium Features</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">Advanced Analytics</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">Custom Identity Cards</span>
                                        </div>
                                      </>
                                    )}
                                    {userRank.name === "ORACLE" && (
                                      <>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">N.IDENTITY Creation</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">Daily Token Claims</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">N.AI Premium Features</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">Advanced Analytics</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">Custom Identity Cards</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">DAO Voting Rights</span>
                                        </div>
                                      </>
                                    )}
                                    {userRank.name === "SOVEREIGN" && (
                                      <>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">N.IDENTITY Creation</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">Daily Token Claims</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">N.AI Premium Features</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">Advanced Analytics</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">Custom Identity Cards</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">DAO Voting Rights</span>
                                        </div>
                                        <div className="text-[10px] text-white/80 flex items-center">
                                          <div className="w-1 h-1 bg-white mr-1.5" />
                                          <span className="uppercase">Full Ecosystem Control</span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  
                                  {/* QR Code */}
                                  <div className="absolute bottom-0 right-0">
                                    {qrCodeUrl && (
                                      <img
                                        src={qrCodeUrl}
                                        alt="QR Code"
                                        className="w-20 h-20 bg-white p-1"
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Visual Accent Elements */}
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white z-20" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-white/50 uppercase">
                          {!isConnected ? (
                            <>
                              <p>Connect your wallet</p>
                              <p className="text-xs mt-2">Wallet connection required to generate identity card</p>
                            </>
                          ) : (
                            <>
                              <p>Generate your identity card</p>
                              <p className="text-xs mt-2">Enter a prompt and click generate</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Rest of the component remains the same */}
          {/* ... */}
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 0;
        }

        ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.5);
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }
      `}</style>
    </main>
  );
}