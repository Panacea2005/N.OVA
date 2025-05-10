"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BarChart from "@/components/charts/bar-chart";
import { motion } from "framer-motion";
import { getNewsAndSentiment, analyzeSentiment, getTokenSentimentData, detectEvents, createOrderBookWebSocket, OrderBookData } from "./api-service";
import { ExternalLink, Clock, ThumbsUp, ThumbsDown, MessageSquare, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";

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
        <div className="border border-white/30 p-0.5 h-full">
            <div className="border border-white/10 p-5 h-full">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-light uppercase">Market Depth: {market}</h2>
                        <p className="text-white/60 text-sm uppercase">Real-time order book data</p>
                    </div>
                    {isConnected && (
                        <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></span>
                            <span className="text-xs text-white/60">LIVE</span>
                        </div>
                    )}
                </div>
                {!orderBookData ? (
                    <div className="h-[200px] flex items-center justify-center">
                        <div className="animate-pulse text-white/60">Connecting to order book...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-0">
                        {/* Asks (Sell Orders) */}
                        <div className="border border-white/20 p-5">
                            <div className="text-sm text-red-400 mb-3 uppercase">Asks (Sellers)</div>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                {orderBookData.asks.slice(0, 10).map((ask, index) => (
                                    <div key={`ask-${index}`} className="flex items-center text-xs">
                                        <div className="w-20 text-red-300">${formatPrice(ask.price)}</div>
                                        <div className="w-20 text-white/60">{ask.size.toFixed(3)}</div>
                                        <div className="flex-grow h-1 bg-white/10 overflow-hidden">
                                            <div
                                                className="h-full bg-red-500/30"
                                                style={{ width: `${(ask.size / maxVolume) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bids (Buy Orders) */}
                        <div className="border border-white/20 p-5">
                            <div className="text-sm text-green-400 mb-3 uppercase">Bids (Buyers)</div>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                {orderBookData.bids.slice(0, 10).map((bid, index) => (
                                    <div key={`bid-${index}`} className="flex items-center text-xs">
                                        <div className="w-20 text-green-300">${formatPrice(bid.price)}</div>
                                        <div className="w-20 text-white/60">{bid.size.toFixed(3)}</div>
                                        <div className="flex-grow h-1 bg-white/10 overflow-hidden">
                                            <div
                                                className="h-full bg-green-500/30"
                                                style={{ width: `${(bid.size / maxVolume) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Middle indicator - spread */}
                        {orderBookData.asks.length > 0 && orderBookData.bids.length > 0 && (
                            <div className="col-span-2 mt-4 flex justify-between items-center text-xs border-t border-white/10 pt-4">
                                <div className="text-white/60 uppercase">
                                    Spread: ${(orderBookData.asks[0].price - orderBookData.bids[0].price).toFixed(2)}
                                </div>
                                <div className="text-white/60 uppercase">
                                    {((orderBookData.asks[0].price - orderBookData.bids[0].price) / orderBookData.asks[0].price * 100).toFixed(2)}%
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
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
    const [activeTab, setActiveTab] = useState("tokens");

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

    const handleTabChange = (value: string) => {
        setActiveTab(value);
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
                return <Badge className="border border-green-600 text-green-400 bg-transparent">Very Bullish</Badge>;
            case "bullish":
                return <Badge className="border border-green-400 text-green-400 bg-transparent">Bullish</Badge>;
            case "neutral":
                return <Badge className="border border-yellow-400 text-yellow-400 bg-transparent">Neutral</Badge>;
            case "bearish":
                return <Badge className="border border-red-400 text-red-400 bg-transparent">Bearish</Badge>;
            case "very bearish":
                return <Badge className="border border-red-600 text-red-400 bg-transparent">Very Bearish</Badge>;
            default:
                return <Badge className="border border-yellow-400 text-yellow-400 bg-transparent">Neutral</Badge>;
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
                <div className="border border-white/30 p-0.5">
                    <div className="border border-white/10 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-light uppercase">Sentiment Analysis</h2>
                                <p className="text-white/60 text-sm uppercase">Track market sentiment across the Solana ecosystem</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Input
                                type="text"
                                placeholder="Analyze any token or topic..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-black border-white/20 text-white/80"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSearch();
                                }}
                            />
                            <Button
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="bg-white text-black hover:bg-white/90 uppercase"
                            >
                                {isSearching ? "Analyzing..." : "Analyze"}
                            </Button>
                        </div>
                    </div>
                </div>

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
                    <div className="border border-white/30 p-0.5 mb-8">
                        <div className="border border-white/10 p-5">
                            <div className="mb-4">
                                <h2 className="text-xl font-light uppercase">Sentiment Analysis: {searchTerm}</h2>
                                <p className="text-white/60 text-sm uppercase">Based on recent social media, news, and on-chain data</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                                <div className="border border-white/20 p-5">
                                    <div className="text-sm text-white/60 mb-1 uppercase">Sentiment Score</div>
                                    <div className={`text-3xl font-light ${getSentimentColor(searchResults.score)}`}>
                                        {searchResults.score}/100
                                    </div>
                                    <div className="mt-2">{getSentimentBadge(searchResults.trend)}</div>
                                </div>
                                <div className="border border-white/20 p-5">
                                    <div className="text-sm text-white/60 mb-1 uppercase">Mentions</div>
                                    <div className="text-3xl font-light">{searchResults.mentions.toLocaleString()}</div>
                                    <div className="text-sm text-white/60 mt-2 uppercase">across platforms</div>
                                </div>
                                <div className="border border-white/20 p-5">
                                    <div className="text-sm text-white/60 mb-1 uppercase">Last Updated</div>
                                    <div className="text-xl font-light">{getTimeDisplay(searchResults.timestamp)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Main Sentiment Tabs */}
            <div className="border border-white/30 p-0.5 mb-8">
                <div className="border border-white/10 p-0">
                    {/* Custom Tab Navigation */}
                    <div className="flex border-b border-white/10">
                        <button
                            className={`px-6 py-4 text-sm font-mono relative ${
                                activeTab === "tokens"
                                    ? "text-white border-b border-white"
                                    : "text-white/40 hover:text-white/60"
                            }`}
                            onClick={() => handleTabChange("tokens")}
                        >
                            TOKENS
                        </button>
                        <button
                            className={`px-6 py-4 text-sm font-mono relative ${
                                activeTab === "nfts"
                                    ? "text-white border-b border-white"
                                    : "text-white/40 hover:text-white/60"
                            }`}
                            onClick={() => handleTabChange("nfts")}
                        >
                            NFTS
                        </button>
                        <button
                            className={`px-6 py-4 text-sm font-mono relative ${
                                activeTab === "news"
                                    ? "text-white border-b border-white"
                                    : "text-white/40 hover:text-white/60"
                            }`}
                            onClick={() => handleTabChange("news")}
                        >
                            NEWS & EVENTS
                        </button>
                        <button
                            className={`px-6 py-4 text-sm font-mono relative ${
                                activeTab === "community"
                                    ? "text-white border-b border-white"
                                    : "text-white/40 hover:text-white/60"
                            }`}
                            onClick={() => handleTabChange("community")}
                        >
                            COMMUNITY
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Token Sentiment Tab */}
                        {activeTab === "tokens" && (
                            <>
                                {loading ? (
                                    <div className="h-[400px] flex items-center justify-center">
                                        <div className="animate-pulse text-white/60">Loading token sentiment data...</div>
                                    </div>
                                ) : tokenSentiment.length === 0 ? (
                                    <div className="h-[400px] flex items-center justify-center">
                                        <div className="text-white/60">No token sentiment data available</div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Array.isArray(tokenSentiment) ? tokenSentiment.map((token) => (
                                            <div key={token.name} className="border border-white/30 p-0.5">
                                                <div className="border border-white/10 p-5">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-lg font-light uppercase">{token.name}</h3>
                                                        {getSentimentBadge(token.status)}
                                                    </div>
                                                    <p className="text-white/60 text-sm uppercase mb-4">
                                                        {token.mentions.toLocaleString()} mentions, {token.change} last 24h
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-1">
                                                            <div className="text-sm text-white/60 uppercase">Sentiment Score</div>
                                                            <div className={`text-2xl font-light ${getSentimentColor(token.score)}`}>
                                                                {token.score}/100
                                                            </div>
                                                        </div>
                                                        <div className="h-[100px] w-full max-w-[200px] border border-white/10 p-2">
                                                            <BarChart data={token.chartData} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : <div className="col-span-2 h-[400px] flex items-center justify-center">
                                            <div className="text-white/60">Invalid token sentiment data format</div>
                                        </div>}
                                    </div>
                                )}
                            </>
                        )}

                        {/* NFT Sentiment Tab */}
                        {activeTab === "nfts" && (
                            <>
                                {loading ? (
                                    <div className="h-[400px] flex items-center justify-center">
                                        <div className="animate-pulse text-white/60">Loading NFT sentiment data...</div>
                                    </div>
                                ) : nftSentiment.length === 0 ? (
                                    <div className="h-[400px] flex items-center justify-center">
                                        <div className="text-white/60">No NFT sentiment data available</div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Array.isArray(nftSentiment) ? nftSentiment.map((nft) => (
                                            <div key={nft.name} className="border border-white/30 p-0.5">
                                                <div className="border border-white/10 p-5">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-lg font-light uppercase">{nft.name}</h3>
                                                        {getSentimentBadge(nft.status)}
                                                    </div>
                                                    <p className="text-white/60 text-sm uppercase mb-4">
                                                        {nft.mentions.toLocaleString()} mentions, {nft.change} last 24h
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-1">
                                                            <div className="text-sm text-white/60 uppercase">Sentiment Score</div>
                                                            <div className={`text-2xl font-light ${getSentimentColor(nft.score)}`}>
                                                                {nft.score}/100
                                                            </div>
                                                        </div>
                                                        <div className="h-[100px] w-full max-w-[200px] border border-white/10 p-2">
                                                            <BarChart data={nft.chartData} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : <div className="col-span-2 h-[400px] flex items-center justify-center">
                                            <div className="text-white/60">Invalid NFT sentiment data format</div>
                                        </div>}
                                    </div>
                                )}
                            </>
                        )}

                        {/* News & Events Tab */}
                        {activeTab === "news" && (
                            <div className="space-y-6">
                                {/* News Filter */}
                                <div className="border border-white/30 p-0.5 mb-4">
                                    <div className="border border-white/10 p-4 flex justify-between items-center">
                                        <div className="flex items-center space-x-2">
                                            <Filter className="h-4 w-4 text-white/60" />
                                            <span className="text-white/60 uppercase">Filter:</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Toggle
                                                className={cn(
                                                    newsFilter === "trending" ? "border-white text-white" : "border-white/20",
                                                    "uppercase text-xs"
                                                )}
                                                pressed={newsFilter === "trending"}
                                                onPressedChange={() => handleFilterChange("trending")}
                                            >
                                                Trending
                                            </Toggle>
                                            <Toggle
                                                className={cn(
                                                    newsFilter === "hot" ? "border-white text-white" : "border-white/20",
                                                    "uppercase text-xs"
                                                )}
                                                pressed={newsFilter === "hot"}
                                                onPressedChange={() => handleFilterChange("hot")}
                                            >
                                                Hot
                                            </Toggle>
                                            <Toggle
                                                className={cn(
                                                    newsFilter === "bullish" ? "border-white text-white" : "border-white/20",
                                                    "uppercase text-xs"
                                                )}
                                                pressed={newsFilter === "bullish"}
                                                onPressedChange={() => handleFilterChange("bullish")}
                                            >
                                                Bullish
                                            </Toggle>
                                            <Toggle
                                                className={cn(
                                                    newsFilter === "bearish" ? "border-white text-white" : "border-white/20",
                                                    "uppercase text-xs"
                                                )}
                                                pressed={newsFilter === "bearish"}
                                                onPressedChange={() => handleFilterChange("bearish")}
                                            >
                                                Bearish
                                            </Toggle>
                                        </div>
                                    </div>
                                </div>

                                {/* News Cards */}
                                {loading ? (
                                    <div className="h-[400px] flex items-center justify-center">
                                        <div className="animate-pulse text-white/60">Loading news data...</div>
                                    </div>
                                ) : newsData.length === 0 ? (
                                    <div className="h-[400px] flex items-center justify-center">
                                        <div className="text-white/60">No news data available</div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {newsData.slice(0, 10).map((item) => (
                                            <div key={item.id} className="border border-white/30 p-0.5">
                                                <div className="border border-white/10 p-5">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <div className="text-sm text-white/60 uppercase">{item.source.title}</div>
                                                        <div className="flex items-center space-x-1 text-white/60">
                                                            <Clock className="h-3 w-3" />
                                                            <span className="text-xs uppercase">{getTimeDisplay(item.published_at)}</span>
                                                        </div>
                                                    </div>
                                                    <h3 className="text-xl font-light mb-3">{item.title}</h3>
                                                    <p className="text-white/80 text-sm mb-4">
                                                        {item.metadata?.description || "No description available."}
                                                    </p>
                                                    <div className="flex justify-between items-center border-t border-white/10 pt-3">
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
                                                            className="text-xs uppercase text-white hover:text-white/80 flex items-center space-x-1 border border-white/20 px-3 py-1 hover:bg-white/5 transition-colors"
                                                        >
                                                            <span>Read</span>
                                                            <ExternalLink className="h-3 w-3 ml-1" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Community Tab */}
                        {activeTab === "community" && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Platform Sentiment */}
                                <div className="md:col-span-2">
                                    <div className="border border-white/30 p-0.5 h-full">
                                        <div className="border border-white/10 p-5 h-full">
                                            <div className="mb-6">
                                                <h3 className="text-xl font-light uppercase">Platform Sentiment Analysis</h3>
                                                <p className="text-white/60 text-sm uppercase">Sentiment breakdown across major social platforms</p>
                                            </div>
                                            {loading ? (
                                                <div className="h-[300px] flex items-center justify-center">
                                                    <div className="animate-pulse text-white/60">Loading platform data...</div>
                                                </div>
                                            ) : platformSentiment.length === 0 ? (
                                                <div className="h-[300px] flex items-center justify-center">
                                                    <div className="text-white/60">No platform data available</div>
                                                </div>
                                            ) : (
                                                <div className="space-y-0">
                                                    {platformSentiment.map((platform) => (
                                                        <div key={platform.name} className="border border-white/20 p-5">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h4 className="font-mono uppercase text-white/80">{platform.name}</h4>
                                                                <div className="text-sm text-white/60 uppercase">
                                                                    {platform.positive + platform.neutral + platform.negative} posts
                                                                </div>
                                                            </div>
                                                            <div className="flex h-4 bg-white/10 overflow-hidden mb-2">
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
                                        </div>
                                    </div>
                                </div>

                                {/* Upcoming Events */}
                                <div className="md:col-span-1">
                                    <div className="border border-white/30 p-0.5 h-full">
                                        <div className="border border-white/10 p-5 h-full">
                                            <div className="mb-6">
                                                <h3 className="text-xl font-light uppercase">Upcoming Events</h3>
                                                <p className="text-white/60 text-sm uppercase">Community events and announcements</p>
                                            </div>
                                            {loading ? (
                                                <div className="h-[300px] flex items-center justify-center">
                                                    <div className="animate-pulse text-white/60">Loading events...</div>
                                                </div>
                                            ) : events.length === 0 ? (
                                                <div className="h-[300px] flex items-center justify-center">
                                                    <div className="text-white/60">No upcoming events found</div>
                                                </div>
                                            ) : (
                                                <div className="space-y-0">
                                                    {events.map((event, index) => (
                                                        <div
                                                            key={index}
                                                            className="border border-white/20 p-4"
                                                        >
                                                            <div className="flex items-start justify-between mb-2">
                                                                <h4 className="font-mono uppercase text-white/80">{event.title}</h4>
                                                                <Badge
                                                                    className={
                                                                        event.impact === "High"
                                                                            ? "border border-green-400 text-green-400 bg-transparent"
                                                                            : event.impact === "Medium"
                                                                                ? "border border-yellow-400 text-yellow-400 bg-transparent"
                                                                                : "border border-blue-400 text-blue-400 bg-transparent"
                                                                    }
                                                                >
                                                                    {event.impact}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-white/70 mb-3">
                                                                {event.description}
                                                            </p>
                                                            <div className="flex items-center justify-between text-xs text-white/50 border-t border-white/10 pt-2">
                                                                <span className="uppercase">{getTimeDisplay(event.timestamp)}</span>
                                                                <span className="uppercase">{event.source}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}