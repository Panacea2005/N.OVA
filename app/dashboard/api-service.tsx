// Mock API Service for Dashboard
import { useEffect } from "react";

// Types for order book data
export interface OrderBookEntry {
    price: number;
    size: number;
}

export interface OrderBookData {
    asks: OrderBookEntry[];
    bids: OrderBookEntry[];
}

// Interface for news item
export interface NewsItem {
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

// Interface for chart data point
interface ChartDataPoint {
    name: string;
    value: number;
}

// Mock function to get news and sentiment data
export const getNewsAndSentiment = async (
    symbols: string,
    filter: string = "trending"
): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: NewsItem[];
}> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Generate mock news items
    const generateMockNews = (count: number): NewsItem[] => {
        const results: NewsItem[] = [];
        const sources = [
            { title: "Crypto News", domain: "cryptonews.com" },
            { title: "Solana Times", domain: "solanatimes.io" },
            { title: "Twitter", domain: "twitter.com" },
            { title: "Reddit", domain: "reddit.com" },
            { title: "BlockWorks", domain: "blockworks.co" },
        ];

        const titles = [
            "Solana reaches new all-time high in daily transactions",
            "Jupiter introduces new swap protocol on Solana",
            "Solana DeFi ecosystem surpasses $10B in TVL",
            "New NFT collection launches on Solana, sells out in minutes",
            "Ethereum bridge to Solana sees increased activity",
            "Major exchange adds support for JTO and BONK tokens",
            "Analysts predict bullish Q3 for Solana ecosystem",
            "Developers flock to Solana for new DeFi applications",
            "SOL price breaks through key resistance level",
            "Solana Foundation announces new developer grants",
            "Community votes on key protocol upgrade for Solana",
            "Mad Lads NFT floor price surges after new utility announcement",
        ];

        const descriptions = [
            "The Solana blockchain has set a new record for daily transactions, surpassing previous highs with over 50 million transactions in 24 hours.",
            "Jupiter, the leading aggregator on Solana, has released a new swap protocol that improves execution and reduces slippage.",
            "Solana's DeFi ecosystem has grown significantly, now exceeding $10 billion in total value locked across various protocols.",
            "A new collection of NFTs on the Solana blockchain sold out within minutes of launch, demonstrating continued demand.",
            "The bridge between Ethereum and Solana has seen increased activity as users move assets between the two blockchains.",
            "A major cryptocurrency exchange has added support for JTO and BONK tokens, two popular tokens in the Solana ecosystem.",
            "Several market analysts have released reports predicting a bullish third quarter for the Solana ecosystem.",
            "Developer activity on Solana continues to grow as more teams build DeFi applications on the high-performance blockchain.",
            "The price of SOL has broken through a key resistance level, potentially signaling a new bullish trend.",
            "The Solana Foundation has announced a new round of developer grants to support projects building on the blockchain.",
            "The Solana community is voting on a key protocol upgrade that aims to improve performance and stability.",
            "The floor price for Mad Lads NFTs has increased significantly following an announcement of new utility features."
        ];

        for (let i = 0; i < count; i++) {
            const sourceIndex = Math.floor(Math.random() * sources.length);
            const titleIndex = Math.floor(Math.random() * titles.length);
            const source = sources[sourceIndex];
            const title = titles[titleIndex];
            const description = descriptions[titleIndex];

            const positiveVotes = Math.floor(Math.random() * 1000) + 50;
            const negativeVotes = Math.floor(Math.random() * 500);

            const hoursAgo = Math.floor(Math.random() * 48);
            const publishedDate = new Date();
            publishedDate.setHours(publishedDate.getHours() - hoursAgo);

            results.push({
                id: `news-${i}`,
                title,
                url: `https://${source.domain}/article-${i}`,
                source: {
                    title: source.title,
                    domain: source.domain,
                    path: `/article-${i}`,
                },
                domain: source.domain,
                published_at: publishedDate.toISOString(),
                created_at: publishedDate.toISOString(),
                votes: {
                    negative: negativeVotes,
                    positive: positiveVotes,
                    important: Math.floor(Math.random() * 100) + 10,
                    liked: Math.floor(Math.random() * 200) + 20,
                    disliked: Math.floor(Math.random() * 50) + 5,
                    lol: Math.floor(Math.random() * 30),
                    toxic: Math.floor(Math.random() * 20),
                    saved: Math.floor(Math.random() * 150) + 15,
                    comments: Math.floor(Math.random() * 200) + 10,
                },
                metadata: {
                    description: description,
                    image: `https://picsum.photos/seed/solana${i}/200/200`,
                },
                currencies: [
                    {
                        code: "SOL",
                        title: "Solana",
                        slug: "solana",
                        url: "https://solana.com",
                    },
                ],
            });
        }

        return results;
    };

    // Always generate at least 10 news items regardless of filter
    let results = generateMockNews(20);

    // Apply filter
    if (filter === "hot") {
        results = results.sort((a, b) => b.votes.positive - a.votes.positive);
    } else if (filter === "bullish") {
        results = results.filter(item => item.votes.positive > item.votes.negative * 1.5);
    } else if (filter === "bearish") {
        results = results.filter(item => item.votes.negative > item.votes.positive * 0.8);
    }

    // Ensure we always have at least 5 results regardless of filter
    if (results.length < 5) {
        const additionalItems = generateMockNews(10);
        results = [...results, ...additionalItems].slice(0, 10);
    }

    return {
        count: results.length,
        next: null,
        previous: null,
        results: results,
    };
};

// Interface for token sentiment data
export interface TokenSentiment {
    name: string;
    score: number;
    change: string;
    status: string;
    mentions: number;
    chartData: ChartDataPoint[];
}

// Interface for platform sentiment data
export interface PlatformSentiment {
    name: string;
    positive: number;
    neutral: number;
    negative: number;
}

// Mock function to get token sentiment data
export const getTokenSentimentData = async (tokens: string[]): Promise<{
    tokens: TokenSentiment[];
    platforms: PlatformSentiment[];
}> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Generate mock token sentiment data
    const generateTokenData = (): TokenSentiment[] => {
        return tokens.map(token => {
            const score = Math.floor(Math.random() * 100);
            let status, changeDirection;

            if (score >= 75) {
                status = "Very Bullish";
                changeDirection = "+";
            } else if (score >= 60) {
                status = "Bullish";
                changeDirection = "+";
            } else if (score <= 25) {
                status = "Very Bearish";
                changeDirection = "-";
            } else if (score <= 40) {
                status = "Bearish";
                changeDirection = "-";
            } else {
                status = "Neutral";
                changeDirection = Math.random() > 0.5 ? "+" : "-";
            }

            const changePercent = (Math.random() * 15).toFixed(2);
            const change = `${changeDirection}${changePercent}%`;
            const mentions = Math.floor(Math.random() * 50000) + 5000;

            // Generate chart data for the last 7 days
            const chartData: ChartDataPoint[] = [];
            for (let i = 6; i >= 0; i--) {
                const day = new Date();
                day.setDate(day.getDate() - i);
                const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
                chartData.push({
                    name: dayName,
                    value: Math.floor(Math.random() * 100)
                });
            }

            return {
                name: token,
                score,
                change,
                status,
                mentions,
                chartData
            };
        });
    };

    // Generate mock platform sentiment data
    const generatePlatformData = (): PlatformSentiment[] => {
        const platforms = [
            "Twitter",
            "Reddit",
            "Discord",
            "Telegram"
        ];

        return platforms.map(platform => {
            const total = Math.floor(Math.random() * 1000) + 200;
            const positive = Math.floor(Math.random() * (total * 0.6));
            const negative = Math.floor(Math.random() * (total * 0.4));
            const neutral = total - positive - negative;

            return {
                name: platform,
                positive,
                neutral,
                negative
            };
        });
    };

    return {
        tokens: generateTokenData(),
        platforms: generatePlatformData()
    };
};

// Interface for event data
export interface Event {
    title: string;
    description: string;
    impact: string;
    timestamp: string;
    source: string;
}

// Mock function to detect events
export const detectEvents = async (topic: string): Promise<Event[]> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 700));

    const events: Event[] = [
        {
            title: "Solana Breakpoint Conference",
            description: "Annual developer conference for the Solana ecosystem with keynotes, workshops, and networking events.",
            impact: "High",
            timestamp: "Sep 15, 2024",
            source: "Solana Foundation"
        },
        {
            title: "Jupiter Protocol Upgrade",
            description: "Major update to Jupiter DEX aggregator with new features including limit orders and improved routing.",
            impact: "Medium",
            timestamp: "Aug 28, 2024",
            source: "Jupiter"
        },
        {
            title: "Firedancer Mainnet Integration",
            description: "New validator client implementation goes live, promising improved throughput and stability for the network.",
            impact: "High",
            timestamp: "Oct 5, 2024",
            source: "Jump Crypto"
        },
        {
            title: "Drift Protocol V2 Launch",
            description: "Major update to Drift's perpetual futures platform with cross-margining and new markets.",
            impact: "Medium",
            timestamp: "Aug 12, 2024",
            source: "Drift Team"
        },
        {
            title: "Community AMA with Anatoly",
            description: "Live Q&A session with Solana's co-founder discussing upcoming features and roadmap.",
            impact: "Low",
            timestamp: "Aug 7, 2024",
            source: "Solana Twitter"
        },
        {
            title: "Tensor Trading Competition",
            description: "NFT trading competition with over $100k in prizes for participants.",
            impact: "Medium",
            timestamp: "Sep 1, 2024",
            source: "Tensor"
        },
        {
            title: "Solana Hackathon Finalists Announced",
            description: "The finalists for the global Solana hackathon have been announced with over 500 project submissions.",
            impact: "Medium",
            timestamp: "Aug 20, 2024",
            source: "Solana Foundation"
        },
        {
            title: "Marinade Finance Governance Update",
            description: "Important governance vote for Marinade Finance regarding validator commission adjustments.",
            impact: "Low",
            timestamp: "Aug 31, 2024",
            source: "Marinade Finance"
        }
    ];

    // If a specific topic is searched for, filter events to make them more relevant
    if (topic && topic.toLowerCase() !== "solana ecosystem") {
        const lowerTopic = topic.toLowerCase();
        return events.filter(event =>
            event.title.toLowerCase().includes(lowerTopic) ||
            event.description.toLowerCase().includes(lowerTopic)
        );
    }

    return events;
};

// Mock function to analyze sentiment
export const analyzeSentiment = async (term: string): Promise<{
    score: number;
    sentiment: string;
    trend: string;
}> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const score = Math.random();
    let sentiment;

    if (score > 0.7) {
        sentiment = "positive";
    } else if (score < 0.4) {
        sentiment = "negative";
    } else {
        sentiment = "neutral";
    }

    return {
        score,
        sentiment,
        trend: sentiment === "positive" ? "bullish" :
            sentiment === "negative" ? "bearish" : "neutral"
    };
};

// Mock order book WebSocket
export const createOrderBookWebSocket = (
    market: string,
    onUpdate: (data: OrderBookData) => void
) => {
    // Initial order book data
    const initialOrderBook = generateOrderBookData();

    // Update interval in ms
    const updateInterval = 1500;

    // Send initial data
    setTimeout(() => {
        onUpdate(initialOrderBook);
    }, 500);

    // Set up interval to simulate real-time updates
    const intervalId = setInterval(() => {
        onUpdate(updateOrderBookData(initialOrderBook));
    }, updateInterval);

    // Return mock WebSocket interface
    return {
        disconnect: () => {
            clearInterval(intervalId);
        }
    };
};

// Helper to generate order book data
function generateOrderBookData(): OrderBookData {
    const midPrice = 173.5; // Base price for SOL/USDC

    const asks: OrderBookEntry[] = [];
    const bids: OrderBookEntry[] = [];

    // Generate asks (higher than midPrice)
    for (let i = 0; i < 20; i++) {
        const priceGap = 0.2 + (Math.random() * 0.3); // Small random gap between price levels
        const price = midPrice + (i * priceGap);
        const size = 5 + Math.random() * 300; // Random size between 5 and 305

        asks.push({
            price,
            size
        });
    }

    // Sort asks ascending by price
    asks.sort((a, b) => a.price - b.price);

    // Generate bids (lower than midPrice)
    for (let i = 0; i < 20; i++) {
        const priceGap = 0.2 + (Math.random() * 0.3);
        const price = midPrice - (i * priceGap);
        const size = 5 + Math.random() * 300;

        bids.push({
            price,
            size
        });
    }

    // Sort bids descending by price
    bids.sort((a, b) => b.price - a.price);

    return { asks, bids };
}

// Helper to update order book data for simulating real-time changes
function updateOrderBookData(currentData: OrderBookData): OrderBookData {
    const updatedAsks = [...currentData.asks];
    const updatedBids = [...currentData.bids];

    // Modify a few random asks
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * updatedAsks.length);
        const sizeDelta = (Math.random() * 20) - 10; // Random change between -10 and +10
        updatedAsks[randomIndex].size = Math.max(1, updatedAsks[randomIndex].size + sizeDelta);
    }

    // Modify a few random bids
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * updatedBids.length);
        const sizeDelta = (Math.random() * 20) - 10;
        updatedBids[randomIndex].size = Math.max(1, updatedBids[randomIndex].size + sizeDelta);
    }

    return {
        asks: updatedAsks,
        bids: updatedBids
    };
} 