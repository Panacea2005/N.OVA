declare module '@/lib/api' {
    import { PublicKey } from '@solana/web3.js';

    export interface SentimentData {
        farcaster: {
            positive: number;
            negative: number;
            neutral: number;
        };
        twitter: {
            positive: number;
            negative: number;
            neutral: number;
        };
    }

    export interface Event {
        type: string;
        description: string;
        impact: string;
        timestamp: string;
    }

    export interface Trader {
        address: string;
        totalProfit: number;
        totalTrades: number;
        winningTrades: number;
    }

    export interface CopyTradingSetup {
        traderAddress: string;
        copyPercentage: number;
        stopLoss: number;
        maxTradeAmount: number;
        wallet: PublicKey;
    }

    export const solanaApi: {
        getTokenPrices: () => Promise<any>;
        getNFTMetadata: (address: string) => Promise<any>;
        getWalletTransactions: (address: string) => Promise<any>;
        getNetworkHealth: () => Promise<any>;
        getDeFiProtocols: () => Promise<any>;
        getPoolLiquidity: (poolAddress: string) => Promise<any>;
    };

    export const copyTradingApi: {
        getTopTraders: () => Promise<Trader[]>;
        getTraderPerformance: (address: string) => Promise<any>;
        setupCopyTrading: (setup: CopyTradingSetup) => Promise<string>;
        getCopyTradingStatus: (address: string) => Promise<any>;
        stopCopyTrading: (address: string) => Promise<string>;
    };

    export const sentimentApi: {
        analyzeSentiment: (query: string) => Promise<SentimentData>;
        getFarcasterData: (query: string) => Promise<any>;
        getTwitterData: (query: string) => Promise<any>;
        detectEvents: (query: string) => Promise<Event[]>;
    };

    export const ws: {
        connect: (url: string) => void;
    };
} 