"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LineChart from "@/components/charts/line-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { getPersonalizedRecommendations, getDefiOpportunities } from "./api-service";
import { createTokenPriceWebSocket, PriceUpdateData } from "./solana-api-service";

// Types for trading opportunities and insights
interface TradingOpportunity {
    title: string;
    description: string;
    type: string;
    confidence: number;
    riskLevel: string;
    timeHorizon: string;
    potentialReturn: string;
}

interface LearningResource {
    title: string;
    description: string;
    level: string;
    duration: string;
    url: string;
}

interface MarketAlert {
    title: string;
    description: string;
    timestamp: string;
    priority: string;
}

interface DefiOpportunity {
    protocol: string;
    name: string;
    apy: number;
    tvl: string;
    risk: string;
    link: string;
}

// API response type
interface PersonalizedRecommendationsResponse {
    tokens: any;
    protocols: any;
    strategies: {
        name: string;
        suitability: string;
        timeframe: string;
        description: string;
    }[];
}

// Price ticker component for real-time price updates
function PriceTicker() {
    const [priceData, setPriceData] = useState<Record<string, PriceUpdateData>>({});
    const [isConnected, setIsConnected] = useState(false);
    const tokenPriceSocketRef = useRef<ReturnType<typeof createTokenPriceWebSocket> | null>(null);

    // Tokens to track
    const tokens = ['SOL', 'JTO', 'BONK', 'JUP', 'RAY'];

    useEffect(() => {
        // Initialize with default values
        const initialPrices: Record<string, PriceUpdateData> = {};
        tokens.forEach(token => {
            initialPrices[token] = {
                symbol: token,
                price: 0,
                change24h: 0,
                volume24h: 0,
                marketCap: 0,
                timestamp: Date.now()
            };
        });
        setPriceData(initialPrices);

        // Set up WebSocket for real-time price updates
        tokenPriceSocketRef.current = createTokenPriceWebSocket(
            tokens,
            (data: Record<string, PriceUpdateData>) => {
                setPriceData(prevData => ({
                    ...prevData,
                    ...data
                }));
                setIsConnected(true);
            }
        );

        return () => {
            if (tokenPriceSocketRef.current) {
                tokenPriceSocketRef.current.disconnect();
            }
        };
    }, []);

    const getPriceChangeColor = (change: number) => {
        if (change > 0) return "text-green-400";
        if (change < 0) return "text-red-400";
        return "text-white/60";
    };

    const getPriceChangeArrow = (change: number) => {
        if (change > 0) return "↑";
        if (change < 0) return "↓";
        return "";
    };

    return (
        <div className="border border-white/30 p-0.5 mb-8">
            <div className="border border-white/10 p-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-light uppercase">Real-time Market Prices</h2>
                    {isConnected && (
                        <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></span>
                            <span className="text-xs text-white/60">LIVE</span>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-5 gap-0">
                    {tokens.map(token => {
                        const data = priceData[token];
                        const changeColor = getPriceChangeColor(data?.change24h || 0);
                        const arrow = getPriceChangeArrow(data?.change24h || 0);

                        return (
                            <div key={token} className="border border-white/20 p-5">
                                <div className="font-mono uppercase text-white/80 mb-1">{token}</div>
                                {data?.price ? (
                                    <>
                                        <div className="text-2xl font-light">
                                            ${data.price.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </div>
                                        <div className={`text-sm ${changeColor} mt-1`}>
                                            {arrow} {Math.abs(data.change24h).toFixed(2)}%
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-12 flex items-center">
                                        <div className="animate-pulse text-white/60 text-sm">Loading...</div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function AIInsightsTab() {
    const [tradingOpportunities, setTradingOpportunities] = useState<TradingOpportunity[]>([]);
    const [learningResources, setLearningResources] = useState<LearningResource[]>([]);
    const [marketAlerts, setMarketAlerts] = useState<MarketAlert[]>([]);
    const [defiOpportunities, setDefiOpportunities] = useState<DefiOpportunity[]>([]);
    const [pricePredictionData, setPricePredictionData] = useState<{ name: string, value: number }[]>([]);
    const [selectedOpportunity, setSelectedOpportunity] = useState<TradingOpportunity | null>(null);
    const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch data on component mount
    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                // Fetch personalized recommendations
                const recommendations: PersonalizedRecommendationsResponse = await getPersonalizedRecommendations("user123"); // In a real app, this would use the actual user ID

                // Map the strategies to trading opportunities
                const mappedOpportunities: TradingOpportunity[] = recommendations.strategies.map(strategy => ({
                    title: strategy.name,
                    description: strategy.description,
                    type: strategy.suitability.includes("Long") ? "Long-term" : "Short-term",
                    confidence: Math.floor(70 + Math.random() * 20), // Generate a random confidence score
                    riskLevel: strategy.suitability.includes("High") ? "High" :
                        strategy.suitability.includes("Low") ? "Low" : "Medium",
                    timeHorizon: strategy.timeframe,
                    potentialReturn: `+${Math.floor(15 + Math.random() * 40)}%` // Generate a random potential return
                }));

                setTradingOpportunities(mappedOpportunities);
                if (mappedOpportunities.length > 0) {
                    setSelectedOpportunity(mappedOpportunities[0]);
                }

                // Generate sample learning resources (would come from API in real app)
                const sampleResources: LearningResource[] = [
                    {
                        title: "Solana DeFi Explained",
                        description: "Learn how to maximize returns in Solana's DeFi ecosystem",
                        level: "Beginner",
                        duration: "15 min",
                        url: "#"
                    },
                    {
                        title: "NFT Trading Strategies",
                        description: "Advanced techniques for NFT trading on Magic Eden and Tensor",
                        level: "Intermediate",
                        duration: "25 min",
                        url: "#"
                    },
                    {
                        title: "Technical Analysis for SOL",
                        description: "Using TA indicators specifically for Solana trading",
                        level: "Advanced",
                        duration: "20 min",
                        url: "#"
                    }
                ];
                setLearningResources(sampleResources);

                // Generate sample market alerts (would come from API in real app)
                const sampleAlerts: MarketAlert[] = [
                    {
                        title: "SOL Breakout Alert",
                        description: "SOL approaching key resistance at $195, breakout imminent",
                        timestamp: "10 minutes ago",
                        priority: "High"
                    },
                    {
                        title: "JTO Whale Movement",
                        description: "Large wallet accumulated 2.5M JTO tokens in the past hour",
                        timestamp: "45 minutes ago",
                        priority: "Medium"
                    }
                ];
                setMarketAlerts(sampleAlerts);

                // Generate sample price prediction data (would come from API in real app)
                const samplePredictionData = [
                    { name: "Current", value: 100 },
                    { name: "Day 1", value: 102 },
                    { name: "Day 2", value: 104 },
                    { name: "Day 3", value: 103 },
                    { name: "Day 4", value: 106 },
                    { name: "Day 5", value: 109 },
                    { name: "Day 6", value: 112 },
                    { name: "Day 7", value: 115 }
                ];
                setPricePredictionData(samplePredictionData);

                // Fetch DeFi opportunities
                const defiData = await getDefiOpportunities();
                setDefiOpportunities(defiData.map(item => ({
                    protocol: item.protocol,
                    name: item.pool || 'Unknown Pool',
                    apy: parseFloat(item.apy),
                    tvl: item.tvl,
                    risk: item.risk,
                    link: '#' // Default link value
                })) || []);

            } catch (error) {
                console.error("Error fetching AI insights:", error);
                // Set empty arrays as fallback
                setTradingOpportunities([]);
                setLearningResources([]);
                setMarketAlerts([]);
                setDefiOpportunities([]);
                setPricePredictionData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, []);

    const handleGenerateInsight = () => {
        setIsGeneratingInsight(true);
        // In a real app, this would call an API to generate fresh insights
        setTimeout(() => {
            setIsGeneratingInsight(false);
        }, 2000);
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 85) return "text-green-400";
        if (confidence >= 70) return "text-lime-400";
        if (confidence >= 60) return "text-yellow-400";
        return "text-orange-400";
    };

    const getRiskBadge = (risk: string) => {
        switch (risk) {
            case "Low":
                return <Badge className="border border-green-500 text-green-400 bg-transparent uppercase text-xs">Low Risk</Badge>;
            case "Medium":
                return <Badge className="border border-yellow-500 text-yellow-400 bg-transparent uppercase text-xs">Medium Risk</Badge>;
            case "Medium-High":
                return <Badge className="border border-orange-500 text-orange-400 bg-transparent uppercase text-xs">Medium-High Risk</Badge>;
            case "High":
                return <Badge className="border border-red-500 text-red-400 bg-transparent uppercase text-xs">High Risk</Badge>;
            default:
                return <Badge className="border border-yellow-500 text-yellow-400 bg-transparent uppercase text-xs">Medium Risk</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "High":
                return <Badge className="border border-red-500 text-red-400 bg-transparent uppercase text-xs">High Priority</Badge>;
            case "Medium":
                return <Badge className="border border-yellow-500 text-yellow-400 bg-transparent uppercase text-xs">Medium Priority</Badge>;
            case "Low":
                return <Badge className="border border-blue-500 text-blue-400 bg-transparent uppercase text-xs">Low Priority</Badge>;
            default:
                return <Badge className="border border-yellow-500 text-yellow-400 bg-transparent uppercase text-xs">Medium Priority</Badge>;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Add the price ticker at the top */}
            <PriceTicker />

            {/* AI Insights Header */}
            <div className="border border-white/30 p-0.5 mb-8">
                <div className="border border-white/10 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-light uppercase">AI-Driven Trading Insights</h2>
                            <p className="text-white/60 text-sm uppercase">
                                Personalized recommendations based on your trading history and market conditions
                            </p>
                        </div>
                        <Button
                            onClick={handleGenerateInsight}
                            disabled={isGeneratingInsight}
                            className="bg-white text-black hover:bg-white/90 uppercase"
                        >
                            {isGeneratingInsight ? "Generating..." : "Refresh Insights"}
                        </Button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="h-[500px] flex items-center justify-center">
                    <div className="animate-pulse text-white/60">Loading AI insights data...</div>
                </div>
            ) : (
                <div className="border border-white/30 p-0.5 mb-8">
                    <div className="border border-white/10 p-5">
                        <Tabs defaultValue="opportunities" className="w-full">
                            <TabsList className="grid grid-cols-4 mb-6">
                                <TabsTrigger 
                                    value="opportunities" 
                                    className="py-3 data-[state=active]:bg-white/5 data-[state=active]:border-b data-[state=active]:border-white text-white/70 data-[state=active]:text-white uppercase"
                                >
                                    Trading Opportunities
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="predictions" 
                                    className="py-3 data-[state=active]:bg-white/5 data-[state=active]:border-b data-[state=active]:border-white text-white/70 data-[state=active]:text-white uppercase"
                                >
                                    Price Predictions
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="alerts" 
                                    className="py-3 data-[state=active]:bg-white/5 data-[state=active]:border-b data-[state=active]:border-white text-white/70 data-[state=active]:text-white uppercase"
                                >
                                    Market Alerts
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="resources" 
                                    className="py-3 data-[state=active]:bg-white/5 data-[state=active]:border-b data-[state=active]:border-white text-white/70 data-[state=active]:text-white uppercase"
                                >
                                    Learning Resources
                                </TabsTrigger>
                            </TabsList>

                            {/* Trading Opportunities Tab */}
                            <TabsContent value="opportunities">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Trading Opportunities List */}
                                    <div className="md:col-span-1">
                                        <div className="border border-white/30 p-0.5 h-full">
                                            <div className="border border-white/10 p-5 h-full">
                                                <div className="mb-4">
                                                    <h3 className="text-lg font-light uppercase">Top Opportunities</h3>
                                                    <p className="text-white/60 text-sm uppercase">AI-detected trading opportunities</p>
                                                </div>
                                                <div className="space-y-0">
                                                    {tradingOpportunities.length === 0 ? (
                                                        <div className="text-white/60 text-center py-6 border border-white/20 p-4">
                                                            No opportunities found at the moment
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            {Array.isArray(tradingOpportunities) ? tradingOpportunities.map((opportunity, index) => (
                                                                <div
                                                                    key={index}
                                                                    className={`p-4 cursor-pointer transition-colors duration-200 border ${selectedOpportunity?.title === opportunity.title
                                                                        ? "border-white bg-white/5"
                                                                        : "border-white/20 hover:border-white/30"
                                                                        }`}
                                                                    onClick={() => setSelectedOpportunity(opportunity)}
                                                                >
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <h4 className="font-mono uppercase text-white/80">{opportunity.title}</h4>
                                                                        <Badge className="border border-white/30 text-white/70 bg-transparent uppercase text-xs">
                                                                            {opportunity.type}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm text-white/60 mb-2 line-clamp-2">
                                                                        {opportunity.description}
                                                                    </p>
                                                                    <div className="flex justify-between">
                                                                        <span className={`text-sm ${getConfidenceColor(opportunity.confidence)}`}>
                                                                            {opportunity.confidence}% confidence
                                                                        </span>
                                                                        {getRiskBadge(opportunity.riskLevel)}
                                                                    </div>
                                                                </div>
                                                            )) : (
                                                                <div className="text-white/60 text-center py-6 border border-white/20 p-4">
                                                                    Invalid opportunity data format
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selected Opportunity Details */}
                                    <div className="md:col-span-2">
                                        {selectedOpportunity ? (
                                            <div className="border border-white/30 p-0.5 h-full">
                                                <div className="border border-white/10 p-5 h-full">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div>
                                                            <h3 className="text-xl font-light uppercase">{selectedOpportunity.title}</h3>
                                                            <p className="text-white/60 text-sm uppercase">
                                                                Detailed analysis and recommendation
                                                            </p>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <Badge className="border border-white/30 bg-transparent uppercase text-xs">
                                                                {selectedOpportunity.type}
                                                            </Badge>
                                                            {getRiskBadge(selectedOpportunity.riskLevel)}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-6">
                                                        <p className="text-white/80">{selectedOpportunity.description}</p>

                                                        <div className="grid grid-cols-3 gap-0">
                                                            <div className="border border-white/20 p-5">
                                                                <h4 className="text-sm text-white/60 mb-1 uppercase">Confidence</h4>
                                                                <p className={`text-2xl font-light ${getConfidenceColor(selectedOpportunity.confidence)}`}>
                                                                    {selectedOpportunity.confidence}%
                                                                </p>
                                                            </div>
                                                            <div className="border border-white/20 p-5">
                                                                <h4 className="text-sm text-white/60 mb-1 uppercase">Time Horizon</h4>
                                                                <p className="text-2xl font-light">{selectedOpportunity.timeHorizon}</p>
                                                            </div>
                                                            <div className="border border-white/20 p-5">
                                                                <h4 className="text-sm text-white/60 mb-1 uppercase">Potential Return</h4>
                                                                <p className="text-2xl font-light text-green-400">{selectedOpportunity.potentialReturn}</p>
                                                            </div>
                                                        </div>

                                                        <div className="border border-white/20 p-5">
                                                            <h4 className="text-sm text-white/60 mb-2 uppercase">AI Analysis</h4>
                                                            <p className="text-white/80">
                                                                This opportunity has been identified based on technical indicators, sentiment analysis, and on-chain metrics.
                                                                The {selectedOpportunity.confidence}% confidence score indicates a {selectedOpportunity.riskLevel.toLowerCase()} risk level with a potential return of {selectedOpportunity.potentialReturn} over {selectedOpportunity.timeHorizon}.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2 border-t border-white/10 pt-4 mt-6">
                                                        <Button variant="outline" className="uppercase border-white/20 text-white/70 hover:bg-white/5">
                                                            Save for Later
                                                        </Button>
                                                        <Button className="bg-white text-black hover:bg-white/90 uppercase">
                                                            Execute Trade
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border border-white/30 p-0.5 h-full">
                                                <div className="border border-white/10 p-5 h-full flex items-center justify-center">
                                                    <div className="text-center py-10 px-4">
                                                        <p className="text-white/60 uppercase">Select an opportunity from the list to view details</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Price Predictions Tab */}
                            <TabsContent value="predictions">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <div className="border border-white/30 p-0.5">
                                            <div className="border border-white/10 p-5">
                                                <div className="mb-4">
                                                    <h3 className="text-xl font-light uppercase">SOL Price Prediction (7 Day)</h3>
                                                    <p className="text-white/60 text-sm uppercase">
                                                        Based on technical analysis, sentiment, and on-chain metrics
                                                    </p>
                                                </div>
                                                {pricePredictionData.length === 0 ? (
                                                    <div className="h-[300px] flex items-center justify-center border border-white/10">
                                                        <div className="text-white/60">No prediction data available</div>
                                                    </div>
                                                ) : (
                                                    <div className="h-[300px] border border-white/10 p-4">
                                                        <LineChart data={pricePredictionData} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-1">
                                        <div className="border border-white/30 p-0.5 h-full">
                                            <div className="border border-white/10 p-5 h-full">
                                                <div className="mb-4">
                                                    <h3 className="text-xl font-light uppercase">DeFi Opportunities</h3>
                                                    <p className="text-white/60 text-sm uppercase">
                                                        Current highest yield opportunities
                                                    </p>
                                                </div>
                                                {defiOpportunities.length === 0 ? (
                                                    <div className="text-white/60 text-center py-6 border border-white/20 p-4">
                                                        No DeFi opportunities found
                                                    </div>
                                                ) : (
                                                    <div className="space-y-0">
                                                        {defiOpportunities.slice(0, 4).map((opportunity, index) => (
                                                            <div
                                                                key={index}
                                                                className="border border-white/20 p-4"
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <h4 className="font-mono uppercase text-white/80">{opportunity.protocol}</h4>
                                                                    <span className="text-green-400 font-medium">{opportunity.apy}% APY</span>
                                                                </div>
                                                                <p className="text-sm text-white/60 mb-2">{opportunity.name}</p>
                                                                <div className="flex justify-between">
                                                                    <span className="text-xs text-white/50 uppercase">TVL: {opportunity.tvl}</span>
                                                                    {getRiskBadge(opportunity.risk)}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Market Alerts Tab */}
                            <TabsContent value="alerts">
                                <div className="border border-white/30 p-0.5">
                                    <div className="border border-white/10 p-5">
                                        <div className="mb-6">
                                            <h3 className="text-xl font-light uppercase">Real-time Market Alerts</h3>
                                            <p className="text-white/60 text-sm uppercase">
                                                Important market events that require attention
                                            </p>
                                        </div>
                                        {marketAlerts.length === 0 ? (
                                            <div className="h-[200px] flex items-center justify-center border border-white/10 p-4">
                                                <div className="text-white/60">No alerts at the moment</div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                                                {marketAlerts.map((alert, index) => (
                                                    <div
                                                        key={index}
                                                        className="border border-white/20 p-5"
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h4 className="font-mono uppercase text-white/80">{alert.title}</h4>
                                                            {getPriorityBadge(alert.priority)}
                                                        </div>
                                                        <p className="text-white/80 mb-4">{alert.description}</p>
                                                        <p className="text-xs text-white/50 uppercase border-t border-white/10 pt-2">{alert.timestamp}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Learning Resources Tab */}
                            <TabsContent value="resources">
                                <div className="border border-white/30 p-0.5">
                                    <div className="border border-white/10 p-5">
                                        <div className="mb-6">
                                            <h3 className="text-xl font-light uppercase">Personalized Learning Resources</h3>
                                            <p className="text-white/60 text-sm uppercase">
                                                Tailored educational content to improve your trading skills
                                            </p>
                                        </div>
                                        {learningResources.length === 0 ? (
                                            <div className="h-[200px] flex items-center justify-center border border-white/10 p-4">
                                                <div className="text-white/60">No learning resources available</div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                                                {learningResources.map((resource, index) => (
                                                    <div key={index} className="border border-white/20 p-5">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h4 className="font-mono uppercase text-white/80">{resource.title}</h4>
                                                            <Badge className="border border-blue-500 text-blue-400 bg-transparent uppercase text-xs">
                                                                {resource.level}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-white/80 mb-4">{resource.description}</p>
                                                        <div className="flex justify-between items-center border-t border-white/10 pt-2">
                                                            <span className="text-xs text-white/50 uppercase">{resource.duration}</span>
                                                            <Button size="sm" variant="outline" className="text-white/70 border-white/20 uppercase text-xs hover:bg-white/5">
                                                                View Resource
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            )}
        </motion.div>
    );
}