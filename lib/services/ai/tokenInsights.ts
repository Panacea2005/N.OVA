// lib/services/token-insights-service.ts
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, AccountLayout, MintLayout } from '@solana/spl-token';
import axios from 'axios';

// Define types for token data and insights
export interface TokenSupplyData {
  total: number;
  circulatingPercent: number;
  decimals: number;
  nonCirculating: number;
}

export interface TokenHolderData {
  address: string;
  amount: number;
  percentage: number;
}

export interface TokenPriceData {
  price: number | null;
  change24h: number | null;
  volume24h: number | null;
  marketCap: number | null;
}

export interface TokenMetadata {
  name: string | null;
  symbol: string | null;
  image: string | null;
  website: string | null;
  twitter: string | null;
  description: string | null;
  tags: string[];
}

export interface TokenInsights {
  address: string;
  metadata: TokenMetadata;
  supply: TokenSupplyData;
  topHolders: TokenHolderData[];
  price: TokenPriceData;
  network: string;
  created: string | null;
  isVerified: boolean;
  isProgrammable: boolean;
  recentActivity: {
    transferCount24h: number;
    uniqueWallets24h: number;
    largeTransactions24h: number;
  };
  riskScore: {
    score: number; // 0-100, where 0 is low risk and 100 is high risk
    factors: string[];
  };
  status: 'success' | 'error';
  error?: string;
}

type NetworkType = 'mainnet-beta' | 'devnet' | 'testnet';

export class TokenInsightsService {
  private connection: Connection | null = null;
  private jupiterApiKey: string;
  private heliusApiKey: string;
  private network: NetworkType = 'mainnet-beta';
  
  constructor() {
    this.jupiterApiKey = process.env.NEXT_PUBLIC_JUPITER_API_KEY || '';
    this.heliusApiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY || '';
  }
  
  /**
   * Initialize connection based on user's wallet network
   */
  private async initializeConnection(networkOverride?: NetworkType): Promise<void> {
    try {
      // If network is explicitly provided, use it
      if (networkOverride) {
        this.network = networkOverride;
      } 
      // Otherwise try to detect from Phantom wallet
      else if (window.phantom?.solana) {
        try {
          const resp = await window.phantom.solana.request({ method: 'getNetwork' });
          if (resp.network) {
            this.network = this.mapPhantomNetworkToSolanaNetwork(resp.network);
          }
        } catch (error) {
          console.warn("Could not detect network from Phantom, using mainnet-beta:", error);
          this.network = 'mainnet-beta';
        }
      } else {
        console.warn("Phantom wallet not detected, using mainnet-beta");
        this.network = 'mainnet-beta';
      }
      
      console.log(`Using Solana ${this.network} for token insights`);
      
      // Get appropriate RPC endpoint based on the network
      let endpoint: string;
      
      if (this.network === 'devnet') {
        endpoint = process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL || 
                  'https://api.devnet.solana.com';
      } else if (this.network === 'testnet') {
        endpoint = process.env.NEXT_PUBLIC_SOLANA_TESTNET_RPC_URL || 
                  'https://api.testnet.solana.com';
      } else {
        endpoint = process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL || 
                  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
                  'https://api.mainnet-beta.solana.com';
      }
      
      // Create connection with confirmed commitment level
      this.connection = new Connection(endpoint, 'confirmed');
    } catch (error) {
      console.error('Error initializing connection:', error);
      // Fallback to mainnet with default endpoint
      this.connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
      this.network = 'mainnet-beta';
    }
  }
  
  /**
   * Map Phantom network names to Solana network names
   */
  private mapPhantomNetworkToSolanaNetwork(phantomNetwork: string): NetworkType {
    switch (phantomNetwork.toLowerCase()) {
      case 'mainnet-beta':
      case 'mainnet':
        return 'mainnet-beta';
      case 'testnet':
        return 'testnet';
      case 'devnet':
      default:
        return 'devnet';
    }
  }
  
  /**
   * Get complete insights for a token
   * @param tokenAddress The Solana token mint address to analyze
   * @param networkOverride Optional network override (mainnet-beta, devnet, testnet)
   */
  async getTokenInsights(tokenAddress: string, networkOverride?: NetworkType): Promise<TokenInsights> {
    try {
      await this.initializeConnection(networkOverride);
      
      if (!this.connection) {
        throw new Error("Failed to initialize connection");
      }
      
      // Validate token address
      const mintPublicKey = new PublicKey(tokenAddress);
      
      // Get token data in parallel
      const [
        metadataResult,
        supplyData,
        topHolders,
        priceData,
        creationInfo,
        isProgrammable,
        recentActivity
      ] = await Promise.all([
        this.fetchTokenMetadata(mintPublicKey),
        this.fetchTokenSupply(mintPublicKey),
        this.fetchTopHolders(mintPublicKey),
        this.fetchTokenPrice(mintPublicKey),
        this.fetchTokenCreationInfo(mintPublicKey),
        this.checkForProgrammableToken(mintPublicKey),
        this.getRecentTokenActivity(mintPublicKey)
      ]);
      
      // Calculate risk score based on available data
      const riskScore = this.calculateRiskScore({
        topHolders,
        isProgrammable,
        metadata: metadataResult,
        supply: supplyData,
        recentActivity
      });
      
      // Construct the insights object
      const insights: TokenInsights = {
        address: tokenAddress,
        metadata: metadataResult,
        supply: supplyData,
        topHolders,
        price: priceData,
        network: this.network,
        created: creationInfo,
        isVerified: metadataResult.name !== null, // Basic verification check - has metadata
        isProgrammable,
        recentActivity,
        riskScore,
        status: 'success'
      };
      
      return insights;
    } catch (error) {
      console.error('Error getting token insights:', error);
      
      // Return a basic error response
      return {
        address: tokenAddress,
        metadata: {
          name: null,
          symbol: null,
          image: null,
          website: null,
          twitter: null,
          description: null,
          tags: []
        },
        supply: {
          total: 0,
          circulatingPercent: 0,
          decimals: 0,
          nonCirculating: 0
        },
        topHolders: [],
        price: {
          price: null,
          change24h: null,
          volume24h: null,
          marketCap: null
        },
        network: this.network,
        created: null,
        isVerified: false,
        isProgrammable: false,
        recentActivity: {
          transferCount24h: 0,
          uniqueWallets24h: 0,
          largeTransactions24h: 0
        },
        riskScore: {
          score: 100, // High risk score for unknown tokens
          factors: ['Could not analyze token data']
        },
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error analyzing token'
      };
    }
  }
  
  /**
   * Fetch token metadata (name, symbol, etc.)
   */
  private async fetchTokenMetadata(mintPublicKey: PublicKey): Promise<TokenMetadata> {
    try {
      // Try to use Metaplex to get token metadata
      if (this.network === 'mainnet-beta' && this.heliusApiKey) {
        try {
          const response = await axios.post<any[]>(`https://api.helius.xyz/v0/tokens/metadata`, {
            mintAccounts: [mintPublicKey.toString()],
            includeOffChain: true,
            api_key: this.heliusApiKey
          });
          
          const tokenData = response.data[0];
          
          if (tokenData) {
            return {
              name: tokenData.name || null,
              symbol: tokenData.symbol || null,
              image: tokenData.image || null,
              website: tokenData.offChainData?.website || null,
              twitter: tokenData.offChainData?.twitter || null,
              description: tokenData.description || null,
              tags: tokenData.offChainData?.tags || []
            };
          }
        } catch (error) {
          console.warn('Error fetching metadata from Helius, falling back to basic data:', error);
        }
      }
      
      // Fallback for devnet or if Helius failed - basic token info
      try {
        const mintInfo = await this.connection!.getAccountInfo(mintPublicKey);
        
        if (!mintInfo) {
          throw new Error('Token mint account not found');
        }
        
        const mintData = MintLayout.decode(mintInfo.data);
        
        // For devnet/testnet or tokens without metadata, use placeholder info
        return {
          name: null,
          symbol: null,
          image: null,
          website: null,
          twitter: null,
          description: null,
          tags: []
        };
      } catch (error) {
        console.error('Error fetching basic token info:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      return {
        name: null,
        symbol: null,
        image: null,
        website: null,
        twitter: null,
        description: null,
        tags: []
      };
    }
  }
  
  /**
   * Fetch token supply information
   */
  private async fetchTokenSupply(mintPublicKey: PublicKey): Promise<TokenSupplyData> {
    try {
      const mintInfo = await this.connection!.getAccountInfo(mintPublicKey);
      
      if (!mintInfo) {
        throw new Error('Token mint account not found');
      }
      
      const mintData = MintLayout.decode(mintInfo.data);
      const decimals = mintData.decimals;
      
      // Get the total supply
      const rawSupply = await this.connection!.getTokenSupply(mintPublicKey);
      const totalSupply = parseFloat(rawSupply.value.uiAmount!.toString());
      
      // For a proper implementation, you would calculate non-circulating tokens
      // by looking at frozen accounts, token accounts owned by the team, etc.
      // This is a simplified version
      const nonCirculating = 0; // In a real implementation, calculate this
      const circulatingPercent = nonCirculating > 0 
        ? ((totalSupply - nonCirculating) / totalSupply) * 100
        : 100;
      
      return {
        total: totalSupply,
        circulatingPercent,
        decimals,
        nonCirculating
      };
    } catch (error) {
      console.error('Error fetching token supply:', error);
      return {
        total: 0,
        circulatingPercent: 0,
        decimals: 0,
        nonCirculating: 0
      };
    }
  }
  
  /**
   * Fetch top token holders
   */
  private async fetchTopHolders(mintPublicKey: PublicKey): Promise<TokenHolderData[]> {
    try {
      // Get all token accounts for this mint
      const tokenAccounts = await this.connection!.getTokenLargestAccounts(mintPublicKey);
      
      if (!tokenAccounts || !tokenAccounts.value || tokenAccounts.value.length === 0) {
        return [];
      }
      
      // Get mint info to calculate percentages
      const mintInfo = await this.connection!.getAccountInfo(mintPublicKey);
      
      if (!mintInfo) {
        throw new Error('Token mint account not found');
      }
      
      const mintData = MintLayout.decode(mintInfo.data);
      const decimals = mintData.decimals;
      
      const supplyData = await this.fetchTokenSupply(mintPublicKey);
      const totalSupply = supplyData.total;
      
      // Map token accounts to holder data
      const holders = tokenAccounts.value.map(account => {
        const amount = account.uiAmount || 0;
        const percentage = totalSupply > 0 ? (amount / totalSupply) * 100 : 0;
        
        return {
          address: account.address.toString(),
          amount,
          percentage
        };
      });
      
      // Sort by amount descending and take top 5
      return holders
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
    } catch (error) {
      console.error('Error fetching top holders:', error);
      return [];
    }
  }
  
  /**
   * Fetch token price information (only available for mainnet tokens with liquidity)
   */
  private async fetchTokenPrice(mintPublicKey: PublicKey): Promise<TokenPriceData> {
    try {
      // Only attempt to get price data on mainnet
      if (this.network !== 'mainnet-beta') {
        return {
          price: null,
          change24h: null,
          volume24h: null,
          marketCap: null
        };
      }
      
      // Try Jupiter API for price data
      if (this.jupiterApiKey) {
        try {
          const response = await axios.get<any>(
            `https://price.jup.ag/v4/price?ids=${mintPublicKey.toString()}`
          );
          
          const priceData = response.data?.data?.[mintPublicKey.toString()];
          
          if (priceData) {
            return {
              price: priceData.price || null,
              change24h: priceData.price_24h_change_percentage || null,
              volume24h: priceData.volume_24h || null,
              marketCap: priceData.market_cap || null
            };
          }
        } catch (error) {
          console.warn('Error fetching price from Jupiter:', error);
        }
      }
      
      // Fallback to Coingecko if available or implement other price sources here
      
      // Return null data if no price sources available
      return {
        price: null,
        change24h: null,
        volume24h: null,
        marketCap: null
      };
    } catch (error) {
      console.error('Error fetching token price:', error);
      return {
        price: null,
        change24h: null,
        volume24h: null,
        marketCap: null
      };
    }
  }
  
  /**
   * Fetch token creation information
   */
  private async fetchTokenCreationInfo(mintPublicKey: PublicKey): Promise<string | null> {
    try {
      // Get account info
      const mintInfo = await this.connection!.getAccountInfo(mintPublicKey);
      
      if (!mintInfo) {
        return null;
      }
      
      // For a full implementation, you would need to get the transaction
      // that created this account, which requires more complex logic.
      // This simplified version just returns a placeholder.
      
      // If we had the real creation date, we would format it like:
      // return new Date(creationTimestamp * 1000).toISOString();
      
      return null;
    } catch (error) {
      console.error('Error fetching token creation info:', error);
      return null;
    }
  }
  
  /**
   * Check if the token is a programmable fungible token (PFT)
   */
  private async checkForProgrammableToken(mintPublicKey: PublicKey): Promise<boolean> {
    try {
      const mintInfo = await this.connection!.getAccountInfo(mintPublicKey);
      
      if (!mintInfo) {
        return false;
      }
      
      // This is a simplified check. 
      // For real implementation, check if this is a programmable token
      // by looking at the token's extension fields or checking the program owner
      
      // Normally would check if the program ID is the Token-2022 program
      return mintInfo.owner.toString() === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
    } catch (error) {
      console.error('Error checking for programmable token:', error);
      return false;
    }
  }
  
  /**
   * Get recent token activity metrics
   */
  private async getRecentTokenActivity(mintPublicKey: PublicKey): Promise<TokenInsights['recentActivity']> {
    try {
      // This would require scanning for recent transfers of this token,
      // which is computationally expensive without specialized indexing.
      // A production implementation would use a specialized API or database.
      
      // For mainnet with Helius API
      if (this.network === 'mainnet-beta' && this.heliusApiKey) {
        try {
          // Get 24h ago timestamp
          const oneDayAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
          
          const response = await axios.post<any[]>(`https://api.helius.xyz/v0/token-events`, {
            query: {
              tokenAddress: mintPublicKey.toString(),
              eventTypes: ['transfer'],
              startTime: oneDayAgo
            },
            api_key: this.heliusApiKey
          });
          
          const events: any[] = response.data || [];
          
          // Count unique wallets
          const uniqueWallets = new Set<string>();
          let largeTransactions = 0;
          
          events.forEach((event: any) => {
            if (event.sender) uniqueWallets.add(event.sender);
            if (event.recipient) uniqueWallets.add(event.recipient);
            
            // Consider a transaction "large" if it's more than 1% of total supply
            // This is a simplified heuristic
            if (event.amount && event.amount > 0) {
              // In a real implementation, compare to total supply percentage
              if (event.amount > 1000) {
                largeTransactions++;
              }
            }
          });
          
          return {
            transferCount24h: events.length,
            uniqueWallets24h: uniqueWallets.size,
            largeTransactions24h: largeTransactions
          };
        } catch (error) {
          console.warn('Error fetching token events from Helius:', error);
        }
      }
      
      // Return placeholder data if we can't get real data
      return {
        transferCount24h: 0,
        uniqueWallets24h: 0,
        largeTransactions24h: 0
      };
    } catch (error) {
      console.error('Error fetching recent token activity:', error);
      return {
        transferCount24h: 0,
        uniqueWallets24h: 0,
        largeTransactions24h: 0
      };
    }
  }
  
  /**
   * Calculate risk score based on token data
   */
  private calculateRiskScore(data: {
    topHolders: TokenHolderData[];
    isProgrammable: boolean;
    metadata: TokenMetadata;
    supply: TokenSupplyData;
    recentActivity: TokenInsights['recentActivity'];
  }): TokenInsights['riskScore'] {
    const riskFactors: string[] = [];
    let baseScore = 50; // Start at medium risk
    
    // Check for concentrated ownership
    if (data.topHolders.length > 0) {
      const topHolderPercentage = data.topHolders[0].percentage;
      if (topHolderPercentage > 50) {
        riskFactors.push('Single holder owns more than 50% of supply');
        baseScore += 30;
      } else if (topHolderPercentage > 20) {
        riskFactors.push('Single holder owns more than 20% of supply');
        baseScore += 15;
      }
    }
    
    // Check for programmable token features
    if (data.isProgrammable) {
      riskFactors.push('Token has programmable features that may restrict transfers');
      baseScore += 10;
    }
    
    // Check for missing metadata
    if (!data.metadata.name || !data.metadata.symbol) {
      riskFactors.push('Token lacks basic metadata (name/symbol)');
      baseScore += 20;
    }
    
    // Check for very low activity
    if (data.recentActivity.transferCount24h === 0) {
      riskFactors.push('No recent transfer activity in the past 24 hours');
      baseScore += 10;
    }
    
    // Check if this is likely a test token (very small total supply)
    if (data.supply.total < 100 && this.network !== 'mainnet-beta') {
      riskFactors.push('Low total supply suggests test token');
      baseScore += 15;
    }
    
    // Network-specific risk factor
    if (this.network === 'devnet' || this.network === 'testnet') {
      riskFactors.push(`Token is on ${this.network} (not mainnet)`);
      baseScore += 25;
    }
    
    // Cap the score at 100
    const finalScore = Math.min(Math.max(baseScore, 0), 100);
    
    // If no risk factors identified but score is high, add a generic factor
    if (riskFactors.length === 0 && finalScore > 30) {
      riskFactors.push('Limited token data available for full risk assessment');
    }
    
    // If score is very low, provide positive factor
    if (finalScore < 30 && data.metadata.name) {
      riskFactors.push('Token appears to have standard attributes');
    }
    
    return {
      score: finalScore,
      factors: riskFactors
    };
  }
  
  /**
   * Generate a text summary of token insights
   */
  generateTextSummary(insights: TokenInsights): string {
    // Determine the token name display
    const tokenName = insights.metadata.name || 
                      insights.metadata.symbol || 
                      `Unknown Token (${insights.address.slice(0, 8)}...)`;
    
    let summary = `# Token Insights: ${tokenName}\n\n`;
    
    // Add network info with warning for devnet/testnet
    summary += `**Network**: ${insights.network.toUpperCase()}\n`;
    if (insights.network === 'devnet' || insights.network === 'testnet') {
      summary += `\n⚠️ **Warning**: This token exists on ${insights.network}. Assets on test networks have no real value.\n`;
    }
    
    // Basic token info
    summary += `\n## Basic Information\n`;
    summary += `- **Token Address**: \`${insights.address}\`\n`;
    if (insights.metadata.symbol) {
      summary += `- **Symbol**: ${insights.metadata.symbol}\n`;
    }
    if (insights.metadata.description) {
      summary += `- **Description**: ${insights.metadata.description}\n`;
    }
    summary += `- **Decimals**: ${insights.supply.decimals}\n`;
    summary += `- **Verified**: ${insights.isVerified ? 'Yes' : 'No'}\n`;
    if (insights.isProgrammable) {
      summary += `- **Token Type**: Programmable Token (PFT)\n`;
    }
    
    // Supply info
    summary += `\n## Supply Information\n`;
    summary += `- **Total Supply**: ${insights.supply.total.toLocaleString()}\n`;
    if (insights.supply.circulatingPercent < 100) {
      summary += `- **Circulating Supply**: ${insights.supply.circulatingPercent.toFixed(2)}%\n`;
    }
    
    // Holders info
    if (insights.topHolders.length > 0) {
      summary += `\n## Top Holders\n`;
      insights.topHolders.forEach((holder, index) => {
        summary += `- **#${index + 1}**: ${holder.address.slice(0, 8)}... (${holder.percentage.toFixed(2)}% of supply)\n`;
      });
    }
    
    // Price info if available
    if (insights.price.price) {
      summary += `\n## Market Data\n`;
      summary += `- **Price**: $${insights.price.price.toFixed(6)}\n`;
      if (insights.price.change24h) {
        const changePrefix = insights.price.change24h >= 0 ? '+' : '';
        summary += `- **24h Change**: ${changePrefix}${insights.price.change24h.toFixed(2)}%\n`;
      }
      if (insights.price.volume24h) {
        summary += `- **24h Volume**: $${insights.price.volume24h.toLocaleString()}\n`;
      }
      if (insights.price.marketCap) {
        summary += `- **Market Cap**: $${insights.price.marketCap.toLocaleString()}\n`;
      }
    }
    
    // Activity info
    if (insights.recentActivity.transferCount24h > 0) {
      summary += `\n## Recent Activity (24h)\n`;
      summary += `- **Transfers**: ${insights.recentActivity.transferCount24h}\n`;
      summary += `- **Unique Wallets**: ${insights.recentActivity.uniqueWallets24h}\n`;
      if (insights.recentActivity.largeTransactions24h > 0) {
        summary += `- **Large Transactions**: ${insights.recentActivity.largeTransactions24h}\n`;
      }
    }
    
    // Risk assessment
    summary += `\n## Risk Assessment\n`;
    summary += `- **Risk Score**: ${insights.riskScore.score}/100`;
    
    // Add risk interpretation
    if (insights.riskScore.score < 30) {
      summary += ` (Low Risk)\n`;
    } else if (insights.riskScore.score < 70) {
      summary += ` (Medium Risk)\n`;
    } else {
      summary += ` (High Risk)\n`;
    }
    
    // Add risk factors
    if (insights.riskScore.factors.length > 0) {
      summary += `- **Risk Factors**:\n`;
      insights.riskScore.factors.forEach(factor => {
        summary += `  • ${factor}\n`;
      });
    }
    
    // External links
    let hasLinks = false;
    if (insights.metadata.website || insights.metadata.twitter) {
      hasLinks = true;
      summary += `\n## External Links\n`;
      if (insights.metadata.website) {
        summary += `- **Website**: ${insights.metadata.website}\n`;
      }
      if (insights.metadata.twitter) {
        summary += `- **Twitter**: ${insights.metadata.twitter}\n`;
      }
    }
    
    // Add explorer link
    if (!hasLinks) summary += `\n## External Links\n`;
    const explorerDomain = insights.network === 'mainnet-beta' ? 'solscan.io' : `${insights.network}.solscan.io`;
    summary += `- **Explorer**: https://${explorerDomain}/token/${insights.address}\n`;
    
    // Add disclaimer
    summary += `\n---\n`;
    summary += `*Disclaimer: This analysis is provided for informational purposes only and should not be considered financial advice. Always do your own research before interacting with any token.*\n`;
    
    return summary;
  }
}

// Create service instance
export const tokenInsightsService = new TokenInsightsService();

// Added interface for TypeScript compatibility with window.phantom
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        request: (args: { method: string; params?: any }) => Promise<any>;
      };
    };
  }
}