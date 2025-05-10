"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BarChart from "@/components/charts/bar-chart";
import PieChart from "@/components/charts/pie-chart";
import { motion } from "framer-motion";
import { getNewsAndSentiment, analyzeSentiment, getTokenSentimentData, detectEvents, createOrderBookWebSocket, OrderBookData, OrderBookEntry } from "./api-service";
import { ExternalLink, Clock, ThumbsUp, ThumbsDown, MessageSquare, BarChart3, Filter } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

// Types for news items from CryptoPanic
interface NewsItem {
    id: string;
    title: string;
    url: string;
    source: {
        title: string;
        domain: string;
        path: string;
    };
    domain: string;
    published_at: string;
    created_at: string;
    votes: {
        negative: number;
        positive: number;
        important: number;
        liked: number;
        disliked: number;
        lol: number;
        toxic: number;
        saved: number;
        comments: number;
    };
    metadata?: {
        description?: string;
        image?: string;
    };
    currencies?: Array<{
        code: string;
        title: string;
        slug: string;
        url: string;
    }>;
}

interface CryptoPanicResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: NewsItem[];
}

// Types for sentiment data
interface TokenSentiment {
    name: string;
    score: number;
    change: string;
    status: string;
    mentions: number;
    chartData: Array<{ name: string; value: number }>;
}

interface PlatformSentiment {
    name: string;
    positive: number;
    neutral: number;
    negative: number;
}

interface Event {
    title: string;
    description: string;
    impact: string;
    timestamp: string;
    source: string;
}

// Component for displaying real-time order book data
function OrderBook({ market = "SOL/USDC" }: { market?: string }) {
    const [orderBookData, setOrderBookData] = useState<OrderBookData | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const orderBookSocketRef = useRef<ReturnType<typeof createOrderBookWebSocket> | null>(null);

    useEffect(() => {
        // Set up order book WebSocket
        orderBookSocketRef.current = createOrderBookWebSocket(
            market,
            (data: OrderBookData) => {
                setOrderBookData(data);
                setIsConnected(true);
            }
        );

        return () => {
            if (orderBookSocketRef.current) {
                orderBookSocketRef.current.disconnect();
            }
        };
    }, [market]);

    const maxVolume = Math.max(
        ...([...(orderBookData?.asks || []), ...(orderBookData?.bids || [])].map(item => item.size) || [0])
    );

    // Format price with appropriate decimals
    const formatPrice = (price: number) => {
        return price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    return (
        <Card className="glassmorphic border-glow h-full">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Market Depth: {market}</CardTitle>
                    {isConnected && (
                        <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></span>
                            <span className="text-xs text-gray-400">Live</span>
                        </div>
                    )}
                </div>
                <CardDescription>Real-time order book data</CardDescription>
            </CardHeader>
            <CardContent>
                {!orderBookData ? (
                    <div className="h-[200px] flex items-center justify-center">
                        <div className="animate-pulse text-purple-400">Connecting to order book...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {/* Asks (Sell Orders) */}
                        <div>
                            <div className="text-sm text-red-400 mb-1 font-semibold">Asks (Sellers)</div>
                            <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2">
                                {orderBookData.asks.slice(0, 10).map((ask, index) => (
                                    <div key={`ask-${index}`} className="flex items-center text-xs">
                                        <div className="w-20 text-red-300">${formatPrice(ask.price)}</div>
                                        <div className="w-20 text-gray-400">{ask.size.toFixed(3)}</div>
                                        <div className="flex-grow h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-500/30 rounded-full"
                                                style={{ width: `${(ask.size / maxVolume) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bids (Buy Orders) */}
                        <div>
                            <div className="text-sm text-green-400 mb-1 font-semibold">Bids (Buyers)</div>
                            <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2">
                                {orderBookData.bids.slice(0, 10).map((bid, index) => (
                                    <div key={`bid-${index}`} className="flex items-center text-xs">
                                        <div className="w-20 text-green-300">${formatPrice(bid.price)}</div>
                                        <div className="w-20 text-gray-400">{bid.size.toFixed(3)}</div>
                                        <div className="flex-grow h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500/30 rounded-full"
                                                style={{ width: `${(bid.size / maxVolume) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Middle indicator - spread */}
                        {orderBookData.asks.length > 0 && orderBookData.bids.length > 0 && (
                            <div className="col-span-2 mt-2 flex justify-between items-center text-xs">
                                <div className="text-gray-400">
                                    Spread: ${(orderBookData.asks[0].price - orderBookData.bids[0].price).toFixed(2)}
                                </div>
                                <div className="text-gray-400">
                                    {((orderBookData.asks[0].price - orderBookData.bids[0].price) / orderBookData.asks[0].price * 100).toFixed(2)}%
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function SentimentTab() {
    const [searchTerm, setSearchTerm] = useState("");
    const [newsFilter, setNewsFilter] = useState("trending");
    const [isSearching, setIsSearching] = useState(false);
    const [newsData, setNewsData] = useState<NewsItem[]>([]);
    const [tokenSentiment, setTokenSentiment] = useState<TokenSentiment[]>([]);
    const [nftSentiment, setNftSentiment] = useState<TokenSentiment[]>([]);
    const [platformSentiment, setPlatformSentiment] = useState<PlatformSentiment[]>([]);
    const [searchResults, setSearchResults] = useState<{
        score: number;
        mentions: number;
        trend: string;
        timestamp: string;
    } | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    // Function to fetch platform sentiment data from news data
    const calculatePlatformSentiment = useCallback((newsItems: NewsItem[]) => {
        // Extract domains and categorize by platform
        const domains = newsItems.map(item => item.domain);
        const platforms: Record<string, { positive: number, neutral: number, negative: number }> = {
            "twitter.com": { positive: 0, neutral: 0, negative: 0 },
            "reddit.com": { positive: 0, neutral: 0, negative: 0 },
            "discord.com": { positive: 0, neutral: 0, negative: 0 },
            "telegram.org": { positive: 0, neutral: 0, negative: 0 }
        };

        // Map other domains to platforms or classify as "Other"
        newsItems.forEach(item => {
            let platform = "Other";

            if (item.domain.includes("twitter") || item.domain.includes("x.com")) {
                platform = "Twitter";
            } else if (item.domain.includes("reddit")) {
                platform = "Reddit";
            } else if (item.domain.includes("discord")) {
                platform = "Discord";
            } else if (item.domain.includes("telegram")) {
                platform = "Telegram";
            }

            // If platform is not tracked yet, add it
            if (!platforms[platform]) {
                platforms[platform] = { positive: 0, neutral: 0, negative: 0 };
            }

            // Classify sentiment based on votes
            if (item.votes.positive > item.votes.negative) {
                platforms[platform].positive++;
            } else if (item.votes.negative > item.votes.positive) {
                platforms[platform].negative++;
            } else {
                platforms[platform].neutral++;
            }
        });

        // Convert to array format
        return Object.entries(platforms)
            .filter(([name, _]) => name !== "Other") // Remove "Other" category
            .map(([name, data]) => ({
                name,
                positive: data.positive,
                neutral: data.neutral,
                negative: data.negative
            }));
    }, []);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch news and sentiment
                const newsResponse = await getNewsAndSentiment('SOL,BTC,ETH', newsFilter);
                setNewsData(newsResponse.results || []); // Handle empty results

                // If news data is empty, create mock data
                if (!newsResponse.results || newsResponse.results.length === 0) {
                    const mockNewsItems: NewsItem[] = [
                        {
                            id: "news1",
                            title: "Solana TVL reaches new high of $3.5 billion",
                            url: "https://example.com/solana-tvl",
                            source: {
                                title: "Solana News",
                                domain: "solanews.com",
                                path: "/tvl-record"
                            },
                            domain: "solanews.com",
                            published_at: new Date(Date.now() - 25 * 60000).toISOString(), // 25 minutes ago
                            created_at: new Date(Date.now() - 25 * 60000).toISOString(),
                            votes: {
                                negative: 2,
                                positive: 45,
                                important: 12,
                                liked: 38,
                                disliked: 2,
                                lol: 0,
                                toxic: 0,
                                saved: 15,
                                comments: 7
                            },
                            metadata: {
                                description: "Solana's Total Value Locked has reached a new all-time high, showcasing growing adoption.",
                                image: "https://picsum.photos/seed/sol1/800/400"
                            },
                            currencies: [
                                {
                                    code: "SOL",
                                    title: "Solana",
                                    slug: "solana",
                                    url: "#"
                                }
                            ]
                        },
                        {
                            id: "news2",
                            title: "Jupiter DEX volume surpasses $500M in single day",
                            url: "https://example.com/jupiter-volume",
                            source: {
                                title: "Crypto Daily",
                                domain: "cryptodaily.io",
                                path: "/jupiter-volume"
                            },
                            domain: "cryptodaily.io",
                            published_at: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
                            created_at: new Date(Date.now() - 120 * 60000).toISOString(),
                            votes: {
                                negative: 1,
                                positive: 32,
                                important: 8,
                                liked: 28,
                                disliked: 1,
                                lol: 0,
                                toxic: 0,
                                saved: 10,
                                comments: 5
                            },
                            metadata: {
                                description: "Jupiter, Solana's top DEX aggregator, has broken records with over $500M in 24h volume.",
                                image: "https://picsum.photos/seed/jup1/800/400"
                            },
                            currencies: [
                                {
                                    code: "JUP",
                                    title: "Jupiter",
                                    slug: "jupiter",
                                    url: "#"
                                }
                            ]
                        },
                        {
                            id: "news3",
                            title: "Solana Foundation announces $10M grant for developer ecosystem",
                            url: "https://example.com/solana-grants",
                            source: {
                                title: "Blockchain Times",
                                domain: "bctimes.com",
                                path: "/solana-grants"
                            },
                            domain: "bctimes.com",
                            published_at: new Date(Date.now() - 12 * 3600000).toISOString(), // 12 hours ago
                            created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
                            votes: {
                                negative: 0,
                                positive: 67,
                                important: 23,
                                liked: 62,
                                disliked: 0,
                                lol: 0,
                                toxic: 0,
                                saved: 28,
                                comments: 14
                            },
                            metadata: {
                                description: "New grant program aims to accelerate development of dApps on Solana blockchain.",
                                image: "https://picsum.photos/seed/sol3/800/400"
                            },
                            currencies: [
                                {
                                    code: "SOL",
                                    title: "Solana",
                                    slug: "solana",
                                    url: "#"
                                }
                            ]
                        },
                        {
                            id: "news4",
                            title: "BONK token surges 25% amid Solana ecosystem growth",
                            url: "https://example.com/bonk-surge",
                            source: {
                                title: "CoinMarket",
                                domain: "coinmarket.io",
                                path: "/bonk-surge"
                            },
                            domain: "coinmarket.io",
                            published_at: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
                            created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
                            votes: {
                                negative: 3,
                                positive: 89,
                                important: 35,
                                liked: 77,
                                disliked: 3,
                                lol: 5,
                                toxic: 0,
                                saved: 42,
                                comments: 28
                            },
                            metadata: {
                                description: "The meme coin BONK has seen significant gains as Solana ecosystem adoption continues to grow.",
                                image: "https://picsum.photos/seed/bonk1/800/400"
                            },
                            currencies: [
                                {
                                    code: "BONK",
                                    title: "Bonk",
                                    slug: "bonk",
                                    url: "#"
                                }
                            ]
                        },
                        {
                            id: "news5",
                            title: "Major Exchange announces SOL staking rewards of 8% APY",
                            url: "https://example.com/sol-staking",
                            source: {
                                title: "Crypto Pulse",
                                domain: "cryptopulse.com",
                                path: "/sol-staking-rewards"
                            },
                            domain: "cryptopulse.com",
                            published_at: new Date(Date.now() - 6 * 3600000).toISOString(), // 6 hours ago
                            created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
                            votes: {
                                negative: 1,
                                positive: 42,
                                important: 15,
                                liked: 36,
                                disliked: 1,
                                lol: 0,
                                toxic: 0,
                                saved: 20,
                                comments: 9
                            },
                            metadata: {
                                description: "Leading cryptocurrency exchange now offering competitive staking rewards for Solana holders.",
                                image: "https://picsum.photos/seed/stake1/800/400"
                            },
                            currencies: [
                                {
                                    code: "SOL",
                                    title: "Solana",
                                    slug: "solana",
                                    url: "#"
                                }
                            ]
                        }
                    ];
                    setNewsData(mockNewsItems);
                }

                // Fetch token sentiment data
                const tokenSentimentData = await getTokenSentimentData(['SOL', 'JTO', 'BONK', 'USDC']);
                setTokenSentiment(tokenSentimentData.tokens);

                // Fetch NFT sentiment data
                const nftSentimentData = await getTokenSentimentData(['Mad Lads', 'DeGods', 'Okay Bears', 'SMB']);
                setNftSentiment(nftSentimentData.tokens);

                // Set platform sentiment data from token sentiment response
                setPlatformSentiment(tokenSentimentData.platforms);

                // Fetch community events
                const eventsData = await detectEvents('Solana ecosystem');

                // If events data is empty, create mock data
                if (!eventsData || eventsData.length === 0) {
                    const mockEventsData: Event[] = [
                        {
                            title: "Solana Token 2025 Upgrade",
                            description: "Solana implementing Token 2025 program with enhanced token features",
                            impact: "Medium",
                            timestamp: new Date(Date.now() + 2 * 24 * 3600000).toISOString(), // 2 days in future
                            source: "Solana Foundation"
                        },
                        {
                            title: "Fed Interest Rate Decision",
                            description: "Federal Reserve expected to announce interest rate decision",
                            impact: "High",
                            timestamp: new Date(Date.now() + 5 * 24 * 3600000).toISOString(), // 5 days in future
                            source: "Federal Reserve"
                        },
                        {
                            title: "Jupiter DEX v7 Launch",
                            description: "Major upgrade to Jupiter DEX platform with new features",
                            impact: "Medium",
                            timestamp: new Date(Date.now() + 8 * 24 * 3600000).toISOString(), // 8 days in future
                            source: "Jupiter"
                        },
                        {
                            title: "Breakpoint 2025 Conference",
                            description: "Annual Solana conference featuring major ecosystem announcements",
                            impact: "High",
                            timestamp: new Date(Date.now() + 45 * 24 * 3600000).toISOString(), // 45 days in future
                            source: "Solana Foundation"
                        },
                        {
                            title: "BONK Token Burn Event",
                            description: "Scheduled token burn to reduce BONK supply and potentially increase value",
                            impact: "Medium",
                            timestamp: new Date(Date.now() + 3 * 24 * 3600000).toISOString(), // 3 days in future
                            source: "BONK DAO"
                        }
                    ];
                    setEvents(mockEventsData);
                } else {
                    setEvents(eventsData);
                }

            } catch (error) {
                console.error("Error fetching sentiment data:", error);

                // Mock news data in case of error
                const mockNewsItems: NewsItem[] = [
                    {
                        id: "news1",
                        title: "Solana TVL reaches new high of $3.5 billion",
                        url: "https://example.com/solana-tvl",
                        source: {
                            title: "Solana News",
                            domain: "solanews.com",
                            path: "/tvl-record"
                        },
                        domain: "solanews.com",
                        published_at: new Date(Date.now() - 25 * 60000).toISOString(), // 25 minutes ago
                        created_at: new Date(Date.now() - 25 * 60000).toISOString(),
                        votes: {
                            negative: 2,
                            positive: 45,
                            important: 12,
                            liked: 38,
                            disliked: 2,
                            lol: 0,
                            toxic: 0,
                            saved: 15,
                            comments: 7
                        },
                        metadata: {
                            description: "Solana's Total Value Locked has reached a new all-time high, showcasing growing adoption.",
                            image: "https://picsum.photos/seed/sol1/800/400"
                        },
                        currencies: [
                            {
                                code: "SOL",
                                title: "Solana",
                                slug: "solana",
                                url: "#"
                            }
                        ]
                    },
                    {
                        id: "news2",
                        title: "Jupiter DEX volume surpasses $500M in single day",
                        url: "https://example.com/jupiter-volume",
                        source: {
                            title: "Crypto Daily",
                            domain: "cryptodaily.io",
                            path: "/jupiter-volume"
                        },
                        domain: "cryptodaily.io",
                        published_at: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
                        created_at: new Date(Date.now() - 120 * 60000).toISOString(),
                        votes: {
                            negative: 1,
                            positive: 32,
                            important: 8,
                            liked: 28,
                            disliked: 1,
                            lol: 0,
                            toxic: 0,
                            saved: 10,
                            comments: 5
                        },
                        metadata: {
                            description: "Jupiter, Solana's top DEX aggregator, has broken records with over $500M in 24h volume.",
                            image: "https://picsum.photos/seed/jup1/800/400"
                        },
                        currencies: [
                            {
                                code: "JUP",
                                title: "Jupiter",
                                slug: "jupiter",
                                url: "#"
                            }
                        ]
                    }
                ];

                // Mock events data in case of error
                const mockEventsData: Event[] = [
                    {
                        title: "Solana Token 2025 Upgrade",
                        description: "Solana implementing Token 2025 program with enhanced token features",
                        impact: "Medium",
                        timestamp: new Date(Date.now() + 2 * 24 * 3600000).toISOString(), // 2 days in future
                        source: "Solana Foundation"
                    },
                    {
                        title: "Fed Interest Rate Decision",
                        description: "Federal Reserve expected to announce interest rate decision",
                        impact: "High",
                        timestamp: new Date(Date.now() + 5 * 24 * 3600000).toISOString(), // 5 days in future
                        source: "Federal Reserve"
                    }
                ];

                setNewsData(mockNewsItems);
                setTokenSentiment([]);
                setNftSentiment([]);
                setPlatformSentiment([]);
                setEvents(mockEventsData);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Set up interval to refresh data (every 3 minutes)
        const intervalId = setInterval(() => {
            fetchData();
        }, 180000);

        return () => clearInterval(intervalId);
    }, [newsFilter]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setIsSearching(true);
        try {
            const sentimentData = await analyzeSentiment(searchTerm);
            // Transform the returned data to match the expected format
            setSearchResults({
                score: Math.round(sentimentData.score * 100),
                mentions: Math.floor(Math.random() * 1000) + 100, // Random mock value for mentions
                trend: sentimentData.sentiment === "positive" ? "bullish" :
                    sentimentData.sentiment === "negative" ? "bearish" : "neutral",
                timestamp: new Date().toISOString()
            });

            // Also fetch related events
            const eventsData = await detectEvents(searchTerm);
            setEvents(eventsData);
        } catch (error) {
            console.error("Error analyzing sentiment:", error);
            setSearchResults(null);
            setEvents([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleFilterChange = (filter: string) => {
        setNewsFilter(filter);
    };

    const getSentimentColor = (score: number) => {
        if (score >= 75) return "text-green-500";
        if (score >= 60) return "text-green-400";
        if (score <= 25) return "text-red-500";
        if (score <= 40) return "text-red-400";
        return "text-yellow-400";
    };

    const getSentimentBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "very bullish":
                return <Badge className="bg-green-600">Very Bullish</Badge>;
            case "bullish":
                return <Badge className="bg-green-400">Bullish</Badge>;
            case "neutral":
                return <Badge className="bg-yellow-400 text-black">Neutral</Badge>;
            case "bearish":
                return <Badge className="bg-red-400">Bearish</Badge>;
            case "very bearish":
                return <Badge className="bg-red-600">Very Bearish</Badge>;
            default:
                return <Badge className="bg-yellow-400 text-black">Neutral</Badge>;
        }
    };

    const getTimeDisplay = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            return formatDistanceToNow(date, { addSuffix: true });
        } catch (e) {
            return "Unknown time";
        }
    };

    const formatVoteCount = (count: number) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Top row with sentiment search and market depth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Sentiment Analysis Card */}
                <Card className="glassmorphic border-glow">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Sentiment Analysis</CardTitle>
                                <CardDescription>
                                    Track market sentiment and news across the Solana ecosystem
                                </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="text"
                                    placeholder="Analyze any token or topic..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-[250px] bg-black/50"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSearch();
                                    }}
                                />
                                <Button
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                >
                                    {isSearching ? "Analyzing..." : "Analyze"}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Real-time Order Book */}
                <OrderBook market="SOL/USDC" />
            </div>

            {/* Search Results */}
            {searchResults && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="glassmorphic border-glow">
                        <CardHeader>
                            <CardTitle>Sentiment Analysis: {searchTerm}</CardTitle>
                            <CardDescription>
                                Based on recent social media, news, and on-chain data
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-400">Sentiment Score</div>
                                    <div className={`text-3xl font-bold ${getSentimentColor(searchResults.score)}`}>
                                        {searchResults.score}/100
                                    </div>
                                    <div>{getSentimentBadge(searchResults.trend)}</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-400">Mentions</div>
                                    <div className="text-3xl font-bold">{searchResults.mentions.toLocaleString()}</div>
                                    <div className="text-sm text-gray-400">across platforms</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-400">Last Updated</div>
                                    <div className="text-lg">{getTimeDisplay(searchResults.timestamp)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Main Sentiment Tabs */}
            <Tabs defaultValue="tokens" className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="tokens">Tokens</TabsTrigger>
                    <TabsTrigger value="nfts">NFTs</TabsTrigger>
                    <TabsTrigger value="news">News & Events</TabsTrigger>
                    <TabsTrigger value="community">Community</TabsTrigger>
                </TabsList>

                {/* Token Sentiment Tab */}
                <TabsContent value="tokens">
                    {loading ? (
                        <div className="h-[400px] flex items-center justify-center">
                            <div className="animate-pulse text-purple-400">Loading token sentiment data...</div>
                        </div>
                    ) : tokenSentiment.length === 0 ? (
                        <div className="h-[400px] flex items-center justify-center">
                            <div className="text-purple-400">No token sentiment data available</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Array.isArray(tokenSentiment) ? tokenSentiment.map((token) => (
                                <Card key={token.name} className="glassmorphic border-glow">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <CardTitle>{token.name}</CardTitle>
                                            {getSentimentBadge(token.status)}
                                        </div>
                                        <CardDescription>
                                            {token.mentions.toLocaleString()} mentions, {token.change} last 24h
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="space-y-1">
                                                <div className="text-sm text-gray-400">Sentiment Score</div>
                                                <div className={`text-2xl font-bold ${getSentimentColor(token.score)}`}>
                                                    {token.score}/100
                                                </div>
                                            </div>
                                            <div className="h-[100px] w-full max-w-[200px]">
                                                <BarChart data={token.chartData} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )) : <div className="col-span-2 h-[400px] flex items-center justify-center">
                                <div className="text-purple-400">Invalid token sentiment data format</div>
                            </div>}
                        </div>
                    )}
                </TabsContent>

                {/* NFT Sentiment Tab */}
                <TabsContent value="nfts">
                    {loading ? (
                        <div className="h-[400px] flex items-center justify-center">
                            <div className="animate-pulse text-purple-400">Loading NFT sentiment data...</div>
                        </div>
                    ) : nftSentiment.length === 0 ? (
                        <div className="h-[400px] flex items-center justify-center">
                            <div className="text-purple-400">No NFT sentiment data available</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Array.isArray(nftSentiment) ? nftSentiment.map((nft) => (
                                <Card key={nft.name} className="glassmorphic border-glow">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <CardTitle>{nft.name}</CardTitle>
                                            {getSentimentBadge(nft.status)}
                                        </div>
                                        <CardDescription>
                                            {nft.mentions.toLocaleString()} mentions, {nft.change} last 24h
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="space-y-1">
                                                <div className="text-sm text-gray-400">Sentiment Score</div>
                                                <div className={`text-2xl font-bold ${getSentimentColor(nft.score)}`}>
                                                    {nft.score}/100
                                                </div>
                                            </div>
                                            <div className="h-[100px] w-full max-w-[200px]">
                                                <BarChart data={nft.chartData} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )) : <div className="col-span-2 h-[400px] flex items-center justify-center">
                                <div className="text-purple-400">Invalid NFT sentiment data format</div>
                            </div>}
                        </div>
                    )}
                </TabsContent>

                {/* News & Events Tab */}
                <TabsContent value="news">
                    <div className="space-y-6">
                        {/* News Filter */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Filter className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-400">Filter:</span>
                            </div>
                            <div className="flex space-x-2">
                                <Toggle
                                    className={cn(
                                        newsFilter === "trending" ? "bg-purple-500/20 text-purple-300" : "",
                                        "data-[state=on]:bg-purple-500/20 data-[state=on]:text-purple-300"
                                    )}
                                    pressed={newsFilter === "trending"}
                                    onPressedChange={() => handleFilterChange("trending")}
                                >
                                    Trending
                                </Toggle>
                                <Toggle
                                    className={cn(
                                        newsFilter === "hot" ? "bg-purple-500/20 text-purple-300" : "",
                                        "data-[state=on]:bg-purple-500/20 data-[state=on]:text-purple-300"
                                    )}
                                    pressed={newsFilter === "hot"}
                                    onPressedChange={() => handleFilterChange("hot")}
                                >
                                    Hot
                                </Toggle>
                                <Toggle
                                    className={cn(
                                        newsFilter === "bullish" ? "bg-purple-500/20 text-purple-300" : "",
                                        "data-[state=on]:bg-purple-500/20 data-[state=on]:text-purple-300"
                                    )}
                                    pressed={newsFilter === "bullish"}
                                    onPressedChange={() => handleFilterChange("bullish")}
                                >
                                    Bullish
                                </Toggle>
                                <Toggle
                                    className={cn(
                                        newsFilter === "bearish" ? "bg-purple-500/20 text-purple-300" : "",
                                        "data-[state=on]:bg-purple-500/20 data-[state=on]:text-purple-300"
                                    )}
                                    pressed={newsFilter === "bearish"}
                                    onPressedChange={() => handleFilterChange("bearish")}
                                >
                                    Bearish
                                </Toggle>
                            </div>
                        </div>

                        {/* News Cards */}
                        {loading ? (
                            <div className="h-[400px] flex items-center justify-center">
                                <div className="animate-pulse text-purple-400">Loading news data...</div>
                            </div>
                        ) : newsData.length === 0 ? (
                            <div className="h-[400px] flex items-center justify-center">
                                <div className="text-purple-400">No news data available</div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {newsData.slice(0, 10).map((item) => (
                                    <Card key={item.id} className="glassmorphic border-glow">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                {item.metadata?.image && (
                                                    <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0 bg-gray-800">
                                                        <div className="relative w-full h-full">
                                                            <Image
                                                                src={item.metadata.image}
                                                                alt={item.title}
                                                                fill
                                                                style={{ objectFit: "cover" }}
                                                                className="rounded-md"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm text-gray-400">{item.source.title}</div>
                                                        <div className="flex items-center space-x-1 text-gray-400">
                                                            <Clock className="h-3 w-3" />
                                                            <span className="text-xs">{getTimeDisplay(item.published_at)}</span>
                                                        </div>
                                                    </div>
                                                    <h3 className="font-medium text-lg">{item.title}</h3>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex items-center space-x-1">
                                                                <ThumbsUp className="h-3 w-3 text-green-400" />
                                                                <span className="text-xs">{formatVoteCount(item.votes.positive)}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <ThumbsDown className="h-3 w-3 text-red-400" />
                                                                <span className="text-xs">{formatVoteCount(item.votes.negative)}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <MessageSquare className="h-3 w-3 text-blue-400" />
                                                                <span className="text-xs">{formatVoteCount(item.votes.comments)}</span>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                                                        >
                                                            <span>Read</span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Community Tab */}
                <TabsContent value="community">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Platform Sentiment */}
                        <div className="md:col-span-2">
                            <Card className="glassmorphic border-glow h-full">
                                <CardHeader>
                                    <CardTitle>Platform Sentiment Analysis</CardTitle>
                                    <CardDescription>
                                        Sentiment breakdown across major social platforms
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="h-[300px] flex items-center justify-center">
                                            <div className="animate-pulse text-purple-400">Loading platform data...</div>
                                        </div>
                                    ) : platformSentiment.length === 0 ? (
                                        <div className="h-[300px] flex items-center justify-center">
                                            <div className="text-purple-400">No platform data available</div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {platformSentiment.map((platform) => (
                                                <div key={platform.name} className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="font-medium">{platform.name}</h3>
                                                        <div className="text-sm text-gray-400">
                                                            {platform.positive + platform.neutral + platform.negative} posts
                                                        </div>
                                                    </div>
                                                    <div className="flex h-4 rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-green-500"
                                                            style={{
                                                                width: `${(platform.positive /
                                                                    (platform.positive + platform.neutral + platform.negative)) *
                                                                    100
                                                                    }%`,
                                                            }}
                                                        />
                                                        <div
                                                            className="bg-yellow-500"
                                                            style={{
                                                                width: `${(platform.neutral /
                                                                    (platform.positive + platform.neutral + platform.negative)) *
                                                                    100
                                                                    }%`,
                                                            }}
                                                        />
                                                        <div
                                                            className="bg-red-500"
                                                            style={{
                                                                width: `${(platform.negative /
                                                                    (platform.positive + platform.neutral + platform.negative)) *
                                                                    100
                                                                    }%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex text-xs justify-between">
                                                        <div className="text-green-400">
                                                            Positive: {platform.positive}
                                                        </div>
                                                        <div className="text-yellow-400">
                                                            Neutral: {platform.neutral}
                                                        </div>
                                                        <div className="text-red-400">
                                                            Negative: {platform.negative}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Upcoming Events */}
                        <div className="md:col-span-1">
                            <Card className="glassmorphic border-glow h-full">
                                <CardHeader>
                                    <CardTitle>Upcoming Events</CardTitle>
                                    <CardDescription>
                                        Community events and announcements
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="h-[300px] flex items-center justify-center">
                                            <div className="animate-pulse text-purple-400">Loading events...</div>
                                        </div>
                                    ) : events.length === 0 ? (
                                        <div className="h-[300px] flex items-center justify-center">
                                            <div className="text-purple-400">No upcoming events found</div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {events.map((event, index) => (
                                                <div
                                                    key={index}
                                                    className="p-3 rounded-lg bg-purple-900/20 border border-purple-500/20"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <h3 className="font-medium text-purple-300">{event.title}</h3>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                event.impact === "High"
                                                                    ? "bg-green-900/20 text-green-400 border-green-400/30"
                                                                    : event.impact === "Medium"
                                                                        ? "bg-yellow-900/20 text-yellow-400 border-yellow-400/30"
                                                                        : "bg-blue-900/20 text-blue-400 border-blue-400/30"
                                                            }
                                                        >
                                                            {event.impact}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {event.description}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                                        <span>{getTimeDisplay(event.timestamp)}</span>
                                                        <span>{event.source}</span>
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
            </Tabs>
        </motion.div>
    );
}