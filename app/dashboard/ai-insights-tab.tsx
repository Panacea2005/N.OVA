"use client";

import { useState, useEffect, useRef } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
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
        return "text-gray-400";
    };

    const getPriceChangeArrow = (change: number) => {
        if (change > 0) return "↑";
        if (change < 0) return "↓";
        return "";
    };

    return (
        <Card className="glassmorphic border-glow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Real-time Market Prices</CardTitle>
                    {isConnected && (
                        <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></span>
                            <span className="text-xs text-gray-400">Live</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {tokens.map(token => {
                        const data = priceData[token];
                        const changeColor = getPriceChangeColor(data?.change24h || 0);
                        const arrow = getPriceChangeArrow(data?.change24h || 0);

                        return (
                            <div key={token} className="bg-black/30 p-3 rounded-lg border border-purple-900/30">
                                <div className="font-bold text-sm text-gray-300">{token}</div>
                                {data?.price ? (
                                    <>
                                        <div className="text-xl font-bold">
                                            ${data.price.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </div>
                                        <div className={`text-sm ${changeColor}`}>
                                            {arrow} {Math.abs(data.change24h).toFixed(2)}%
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-12 flex items-center justify-center">
                                        <div className="animate-pulse text-purple-400 text-sm">Loading...</div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
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
                return <Badge className="bg-green-900/20 text-green-400 border-green-500/30">Low Risk</Badge>;
            case "Medium":
                return <Badge className="bg-yellow-900/20 text-yellow-400 border-yellow-500/30">Medium Risk</Badge>;
            case "Medium-High":
                return <Badge className="bg-orange-900/20 text-orange-400 border-orange-500/30">Medium-High Risk</Badge>;
            case "High":
                return <Badge className="bg-red-900/20 text-red-400 border-red-500/30">High Risk</Badge>;
            default:
                return <Badge className="bg-yellow-900/20 text-yellow-400 border-yellow-500/30">Medium Risk</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "High":
                return <Badge className="bg-red-900/20 text-red-400 border-red-500/30">High Priority</Badge>;
            case "Medium":
                return <Badge className="bg-yellow-900/20 text-yellow-400 border-yellow-500/30">Medium Priority</Badge>;
            case "Low":
                return <Badge className="bg-blue-900/20 text-blue-400 border-blue-500/30">Low Priority</Badge>;
            default:
                return <Badge className="bg-yellow-900/20 text-yellow-400 border-yellow-500/30">Medium Priority</Badge>;
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
            <div className="grid grid-cols-1 gap-6">
                <Card className="glassmorphic border-glow">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>AI-Driven Trading Insights</CardTitle>
                                <CardDescription>
                                    Personalized recommendations based on your trading history and market conditions
                                </CardDescription>
                            </div>
                            <Button
                                onClick={handleGenerateInsight}
                                disabled={isGeneratingInsight}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                                {isGeneratingInsight ? "Generating..." : "Refresh Insights"}
                            </Button>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            {loading ? (
                <div className="h-[500px] flex items-center justify-center">
                    <div className="animate-pulse text-purple-400">Loading AI insights data...</div>
                </div>
            ) : (
                <Tabs defaultValue="opportunities" className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="opportunities">Trading Opportunities</TabsTrigger>
                        <TabsTrigger value="predictions">Price Predictions</TabsTrigger>
                        <TabsTrigger value="alerts">Market Alerts</TabsTrigger>
                        <TabsTrigger value="resources">Learning Resources</TabsTrigger>
                    </TabsList>

                    {/* Trading Opportunities Tab */}
                    <TabsContent value="opportunities">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Trading Opportunities List */}
                            <div className="md:col-span-1">
                                <Card className="glassmorphic border-glow h-full">
                                    <CardHeader>
                                        <CardTitle>Top Opportunities</CardTitle>
                                        <CardDescription>
                                            AI-detected trading opportunities
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="overflow-auto max-h-[400px]">
                                        {tradingOpportunities.length === 0 ? (
                                            <div className="text-gray-400 text-center py-6">
                                                No opportunities found at the moment
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {tradingOpportunities.map((opportunity, index) => (
                                                    <div
                                                        key={index}
                                                        className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${selectedOpportunity?.title === opportunity.title
                                                            ? "bg-purple-900/40 border border-purple-500/50"
                                                            : "bg-purple-900/20 border border-purple-500/20 hover:bg-purple-900/30"
                                                            }`}
                                                        onClick={() => setSelectedOpportunity(opportunity)}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <h3 className="font-medium text-purple-300">{opportunity.title}</h3>
                                                            <Badge variant="outline" className="bg-purple-900/20">
                                                                {opportunity.type}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                                            {opportunity.description}
                                                        </p>
                                                        <div className="flex justify-between mt-2">
                                                            <span className={`text-sm ${getConfidenceColor(opportunity.confidence)}`}>
                                                                {opportunity.confidence}% confidence
                                                            </span>
                                                            {getRiskBadge(opportunity.riskLevel)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Selected Opportunity Details */}
                            <div className="md:col-span-2">
                                {selectedOpportunity ? (
                                    <Card className="glassmorphic border-glow h-full">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle>{selectedOpportunity.title}</CardTitle>
                                                    <CardDescription>
                                                        Detailed analysis and recommendation
                                                    </CardDescription>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Badge variant="outline" className="bg-purple-900/20">
                                                        {selectedOpportunity.type}
                                                    </Badge>
                                                    {getRiskBadge(selectedOpportunity.riskLevel)}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                <p className="text-gray-300">{selectedOpportunity.description}</p>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/20">
                                                        <h3 className="text-sm text-purple-300 mb-1">Confidence</h3>
                                                        <p className={`text-2xl font-bold ${getConfidenceColor(selectedOpportunity.confidence)}`}>
                                                            {selectedOpportunity.confidence}%
                                                        </p>
                                                    </div>
                                                    <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/20">
                                                        <h3 className="text-sm text-purple-300 mb-1">Time Horizon</h3>
                                                        <p className="text-2xl font-bold">{selectedOpportunity.timeHorizon}</p>
                                                    </div>
                                                    <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/20">
                                                        <h3 className="text-sm text-purple-300 mb-1">Potential Return</h3>
                                                        <p className="text-2xl font-bold text-green-400">{selectedOpportunity.potentialReturn}</p>
                                                    </div>
                                                </div>

                                                <div className="p-4 rounded-lg bg-black/30 border border-purple-500/10">
                                                    <h3 className="text-sm text-purple-300 mb-2">AI Analysis</h3>
                                                    <p className="text-gray-400">
                                                        This opportunity has been identified based on technical indicators, sentiment analysis, and on-chain metrics.
                                                        The {selectedOpportunity.confidence}% confidence score indicates a {selectedOpportunity.riskLevel.toLowerCase()} risk level with a potential return of {selectedOpportunity.potentialReturn} over {selectedOpportunity.timeHorizon}.
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-end gap-2 border-t border-purple-500/10 pt-4">
                                            <Button variant="outline">Save for Later</Button>
                                            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                                                Execute Trade
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ) : (
                                    <Card className="glassmorphic border-glow h-full flex items-center justify-center">
                                        <div className="text-center py-10 px-4">
                                            <p className="text-gray-400">Select an opportunity from the list to view details</p>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Price Predictions Tab */}
                    <TabsContent value="predictions">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <Card className="glassmorphic border-glow">
                                    <CardHeader>
                                        <CardTitle>SOL Price Prediction (7 Day)</CardTitle>
                                        <CardDescription>
                                            Based on technical analysis, sentiment, and on-chain metrics
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {pricePredictionData.length === 0 ? (
                                            <div className="h-[300px] flex items-center justify-center">
                                                <div className="text-gray-400">No prediction data available</div>
                                            </div>
                                        ) : (
                                            <div className="h-[300px]">
                                                <LineChart data={pricePredictionData} />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="md:col-span-1">
                                <Card className="glassmorphic border-glow h-full">
                                    <CardHeader>
                                        <CardTitle>DeFi Opportunities</CardTitle>
                                        <CardDescription>
                                            Current highest yield opportunities
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {defiOpportunities.length === 0 ? (
                                            <div className="text-gray-400 text-center py-6">
                                                No DeFi opportunities found
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {defiOpportunities.slice(0, 4).map((opportunity, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-3 rounded-lg bg-purple-900/20 border border-purple-500/20"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <h3 className="font-medium text-purple-300">{opportunity.protocol}</h3>
                                                            <span className="text-green-400 font-medium">{opportunity.apy}% APY</span>
                                                        </div>
                                                        <p className="text-sm text-gray-400 mt-1">{opportunity.name}</p>
                                                        <div className="flex justify-between mt-2">
                                                            <span className="text-xs text-gray-500">TVL: {opportunity.tvl}</span>
                                                            {getRiskBadge(opportunity.risk)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Market Alerts Tab */}
                    <TabsContent value="alerts">
                        <div className="grid grid-cols-1 gap-6">
                            <Card className="glassmorphic border-glow">
                                <CardHeader>
                                    <CardTitle>Real-time Market Alerts</CardTitle>
                                    <CardDescription>
                                        Important market events that require attention
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {marketAlerts.length === 0 ? (
                                        <div className="h-[200px] flex items-center justify-center">
                                            <div className="text-gray-400">No alerts at the moment</div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {marketAlerts.map((alert, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/20"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-medium text-purple-300">{alert.title}</h3>
                                                        {getPriorityBadge(alert.priority)}
                                                    </div>
                                                    <p className="text-gray-300 mb-3">{alert.description}</p>
                                                    <p className="text-xs text-gray-500">{alert.timestamp}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Learning Resources Tab */}
                    <TabsContent value="resources">
                        <div className="grid grid-cols-1 gap-6">
                            <Card className="glassmorphic border-glow">
                                <CardHeader>
                                    <CardTitle>Personalized Learning Resources</CardTitle>
                                    <CardDescription>
                                        Tailored educational content to improve your trading skills
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {learningResources.length === 0 ? (
                                        <div className="h-[200px] flex items-center justify-center">
                                            <div className="text-gray-400">No learning resources available</div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {learningResources.map((resource, index) => (
                                                <Card key={index} className="glassmorphic border-glow-subtle">
                                                    <CardHeader className="pb-2">
                                                        <div className="flex justify-between items-start">
                                                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                                                            <Badge className="bg-blue-900/20 text-blue-400 border-blue-500/30">
                                                                {resource.level}
                                                            </Badge>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="pb-3">
                                                        <p className="text-gray-400 mb-3">{resource.description}</p>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs text-gray-500">{resource.duration}</span>
                                                            <Button size="sm" variant="link" className="text-purple-400">
                                                                View Resource
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </motion.div>
    );
} 