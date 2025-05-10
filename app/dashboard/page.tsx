"use client";

import { useState, useEffect } from "react";
import { usePhantom } from "@/hooks/use-phantom";
import { ConnectWalletButton } from "@/components/ui/connect-wallet-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

// Dynamically load tab components
const CopyTradingTab = dynamic(() => import("./copy-trading-tab"), {
    ssr: false,
    loading: () => <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-white/70">Loading Copy Trading...</div>
    </div>
});

const SentimentTab = dynamic(() => import("@/app/dashboard/sentiment-tab"), {
    ssr: false,
    loading: () => <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-white/70">Loading Sentiment Analysis...</div>
    </div>
});

const AIInsightsTab = dynamic(() => import("@/app/dashboard/ai-insights-tab"), {
    ssr: false,
    loading: () => <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-white/70">Loading AI Insights...</div>
    </div>
});

// Add the new Solana Metrics Tab
const SolanaMetricsTab = dynamic(() => import("@/app/dashboard/solana-metrics-tab"), {
    ssr: false,
    loading: () => <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-white/70">Loading Solana Metrics...</div>
    </div>
});

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const { isConnected } = usePhantom();
    const [activeTab, setActiveTab] = useState("solana-metrics");

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (!isConnected) {
        return (
            <main className="relative min-h-screen bg-black text-white font-mono">
                <div className="fixed inset-0 bg-black z-0" />
                <div className="fixed inset-0 z-0 opacity-10"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />
                <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
                    <h1 className="text-4xl font-light mb-8">NOVA Dashboard</h1>
                    <p className="text-white/70 uppercase mb-8">
                        Connect your Phantom wallet to access the dashboard
                    </p>
                    <ConnectWalletButton />
                </div>
            </main>
        );
    }

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    return (
        <main className="relative min-h-screen bg-black text-white font-mono">
            {/* Background */}
            <div className="fixed inset-0 bg-black z-0" />
            <div className="fixed inset-0 z-0 opacity-10"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Navigation */}
            <Navigation />

            <div className="container mx-auto px-2 pt-24 pb-16 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="mb-16"
                    >
                        <h1 className="text-8xl font-light mb-6">DASHBOARD</h1>
                        <p className="text-white/70 uppercase max-w-4xl">
                            REAL-TIME ANALYTICS AND INSIGHTS FOR YOUR SOLANA WALLET
                        </p>
                    </motion.div>

                    {/* Main Dashboard Content */}
                    <div className="border border-white/30 p-0.5 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="border border-white/10 p-0"
                        >
                            {/* Custom Tab Navigation - Elegant Minimal Style */}
                            <div className="flex border-b border-white/10">
                                <button
                                    className={`px-6 py-4 text-sm font-mono relative ${
                                        activeTab === "solana-metrics"
                                            ? "text-white border-b border-white"
                                            : "text-white/40 hover:text-white/60"
                                    }`}
                                    onClick={() => handleTabChange("solana-metrics")}
                                >
                                    SOLANA METRICS
                                </button>
                                <button
                                    className={`px-6 py-4 text-sm font-mono relative ${
                                        activeTab === "sentiment"
                                            ? "text-white border-b border-white"
                                            : "text-white/40 hover:text-white/60"
                                    }`}
                                    onClick={() => handleTabChange("sentiment")}
                                >
                                    MARKET SENTIMENT
                                </button>
                                <button
                                    className={`px-6 py-4 text-sm font-mono relative ${
                                        activeTab === "ai-insights"
                                            ? "text-white border-b border-white"
                                            : "text-white/40 hover:text-white/60"
                                    }`}
                                    onClick={() => handleTabChange("ai-insights")}
                                >
                                    AI INSIGHTS
                                </button>
                                <button
                                    className={`px-6 py-4 text-sm font-mono relative ${
                                        activeTab === "copy-trading"
                                            ? "text-white border-b border-white"
                                            : "text-white/40 hover:text-white/60"
                                    }`}
                                    onClick={() => handleTabChange("copy-trading")}
                                >
                                    COPY TRADING
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {activeTab === "solana-metrics" && <SolanaMetricsTab />}
                                {activeTab === "sentiment" && <SentimentTab />}
                                {activeTab === "ai-insights" && <AIInsightsTab />}
                                {activeTab === "copy-trading" && <CopyTradingTab />}
                            </div>
                        </motion.div>
                    </div>

                    <div className="text-xs text-white/40 text-center">
                        <p>Data provided by Solana RPC and CoinGecko</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </main>
    );
}