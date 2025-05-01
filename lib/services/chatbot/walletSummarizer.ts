// lib/services/wallet-summarizer.ts
import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import axios from 'axios';

// Types for transaction data and summary output
interface TokenTransfer {
  amount: number;
  mint: string;
  tokenName?: string;
  tokenSymbol?: string;
}

interface TransactionData {
  signature: string;
  slot: number;
  timestamp: number;
  success: boolean;
  fee: number;
  type: string;
  tokenTransfers?: TokenTransfer[];
  solTransfer?: number;
  programId?: string;
  description?: string;
}

interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
  tokenName?: string;
  tokenSymbol?: string;
}

interface NFT {
  mint: string;
  name: string;
  image: string;
  collection?: string;
}

export interface WalletSummary {
  period: string;
  transactionCount: number;
  uniqueProgramsInteracted: string[];
  totalFees: number;
  tokenBalances: TokenBalance[];
  recentTransactions: TransactionData[];
  nfts: NFT[];
  totalSolReceived: number;
  totalSolSent: number;
  uniqueWalletsInteracted: number;
  mostFrequentActivity?: string;
  suggestedActions?: string[];
  network: string;
  rpcErrors?: string[]; // New field to track any RPC errors that occurred
}

type NetworkType = 'mainnet-beta' | 'devnet' | 'testnet';

// Configurable rate limits to prevent 429 errors
const BATCH_SIZE = 5; // Number of transactions to process at once
const BATCH_DELAY_MS = 500; // Milliseconds to wait between batches

export class WalletSummarizer {
  private connection: Connection | null = null;
  private heliusApiKey: string;
  private network: NetworkType = 'devnet'; // Default to devnet for development
  private rpcErrors: string[] = []; // Track any RPC errors
  
  constructor() {
    // Use a custom RPC endpoint or fallback to Solana's default
    this.heliusApiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY || '';
  }
  
  /**
   * Initialize connection based on user's wallet network
   */
  private async initializeConnection(): Promise<void> {
    try {
      // Try to detect the network from Phantom wallet
      if (window.phantom?.solana) {
        try {
          // Get the network from Phantom
          const resp = await window.phantom.solana.request({ method: 'getNetwork' });
          if (resp.network) {
            this.network = this.mapPhantomNetworkToSolanaNetwork(resp.network);
          }
        } catch (error) {
          console.warn("Could not detect network from Phantom, using devnet:", error);
          this.network = 'devnet';
        }
      } else {
        console.warn("Phantom wallet not detected, using devnet");
        this.network = 'devnet';
      }
      
      console.log(`Using Solana ${this.network} for wallet summary`);
      
      // Get a more reliable RPC endpoint based on the network
      let endpoint: string;
      
      // Use custom endpoint for each network if provided
      if (this.network === 'devnet') {
        // For devnet, try to use a reliable devnet endpoint
        endpoint = process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL || 
                  'https://api.devnet.solana.com';
      } else if (this.network === 'testnet') {
        endpoint = process.env.NEXT_PUBLIC_SOLANA_TESTNET_RPC_URL || 
                  'https://api.testnet.solana.com';
      } else {
        // For mainnet, use the provided RPC URL if available
        endpoint = process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL || 
                  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
                  'https://api.mainnet-beta.solana.com';
      }
      
      // Create connection with higher commitment level for better consistency
      this.connection = new Connection(endpoint, 'confirmed');
    } catch (error) {
      console.error('Error initializing connection:', error);
      // Fallback to devnet with default endpoint
      this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      this.network = 'devnet';
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
   * Summarize wallet activity for the past 24 hours
   */
  async summarizeWalletActivity(walletAddress: string): Promise<WalletSummary> {
    try {
      // Reset error tracking
      this.rpcErrors = [];
      
      // Initialize connection based on network
      await this.initializeConnection();
      
      if (!this.connection) {
        throw new Error("Failed to initialize connection");
      }
      
      // Validate wallet address
      const pubkey = new PublicKey(walletAddress);
      
      // Get current timestamp and 24 hours ago timestamp
      const now = new Date();
      const oneDayAgo = new Date();
      oneDayAgo.setHours(now.getHours() - 24);
      
      // Fetch all transaction signatures for the past 24 hours
      const signatures = await this.fetchTransactionSignatures(pubkey, oneDayAgo);
      
      // Fetch detailed transaction data with rate limiting
      const transactions = await this.fetchTransactionDetailsBatched(signatures);
      
      // Fetch token balances with retries on rate limits
      const tokenBalances = await this.fetchTokenBalancesWithRetry(pubkey);
      
      // Fetch NFTs
      let nfts: NFT[] = [];
      try {
        nfts = await this.fetchNFTs(pubkey);
      } catch (error) {
        console.warn('Error fetching NFTs, continuing without NFT data:', error);
        this.rpcErrors.push('NFT data could not be loaded due to rate limits');
      }
      
      // Process transaction data to extract stats
      const stats = this.processTransactionStats(transactions);
      
      // Generate suggested actions based on activity
      const suggestedActions = this.generateSuggestedActions(stats, tokenBalances, nfts);
      
      // Create summary object
      const summary: WalletSummary = {
        period: `${oneDayAgo.toLocaleDateString()} to ${now.toLocaleDateString()}`,
        transactionCount: transactions.length,
        uniqueProgramsInteracted: stats.uniquePrograms,
        totalFees: stats.totalFees,
        tokenBalances,
        recentTransactions: transactions.slice(0, 5), // Only include 5 most recent transactions
        nfts: nfts.slice(0, 5), // Only include 5 NFTs
        totalSolReceived: stats.totalSolReceived,
        totalSolSent: stats.totalSolSent,
        uniqueWalletsInteracted: stats.uniqueWallets.length,
        mostFrequentActivity: stats.mostFrequentActivity,
        suggestedActions,
        network: this.network,
        rpcErrors: this.rpcErrors.length > 0 ? this.rpcErrors : undefined
      };
      
      return summary;
    } catch (error) {
      console.error('Error summarizing wallet activity:', error);
      
      // Return a basic summary with error information
      return {
        period: `Last 24 hours`,
        transactionCount: 0,
        uniqueProgramsInteracted: [],
        totalFees: 0,
        tokenBalances: [],
        recentTransactions: [],
        nfts: [],
        totalSolReceived: 0,
        totalSolSent: 0,
        uniqueWalletsInteracted: 0,
        mostFrequentActivity: 'Unknown (data not available)',
        suggestedActions: [
          'Try again later when RPC services are less busy',
          'Consider using a different RPC endpoint in your app settings'
        ],
        network: this.network,
        rpcErrors: [`Couldn't complete wallet analysis: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }
  
  /**
   * Fetch transaction signatures for the past 24 hours with rate limit handling
   */
  private async fetchTransactionSignatures(pubkey: PublicKey, oneDayAgo: Date): Promise<string[]> {
    try {
      if (!this.connection) {
        throw new Error("Connection not initialized");
      }
      
      // Convert date to UNIX timestamp (in seconds)
      const oneDayAgoUnix = Math.floor(oneDayAgo.getTime() / 1000);
      
      // If we have a Helius API key and we're on mainnet, use their enhanced API
      if (this.heliusApiKey && this.network === 'mainnet-beta') {
        try {
          const response = await axios.post(`https://api.helius.xyz/v0/addresses/${pubkey.toString()}/transactions`, {
            api_key: this.heliusApiKey,
            until: oneDayAgoUnix
          });
          
          const transactions = response.data as { signature: string }[];
          return transactions.map((tx) => tx.signature);
        } catch (error) {
          console.warn('Helius API error, falling back to RPC:', error);
          this.rpcErrors.push('Helius API unavailable, using standard RPC');
        }
      }
      
      // Fallback to standard Solana RPC with limits
      const limit = this.network === 'devnet' ? 10 : 25; // Lower limit to avoid rate limits - reduced from previous values
      
      // Get signatures with a reasonable limit to avoid rate limits
      let signatures;
      try {
        signatures = await this.connection.getSignaturesForAddress(pubkey, {
          limit,
        });
      } catch (error) {
        console.error('Error fetching signatures:', error);
        this.rpcErrors.push('Could not load all transactions due to RPC limits');
        return []; // Return empty array on error
      }
      
      // Filter by timestamp
      const filteredSignatures = signatures.filter(sig => {
        return sig.blockTime && sig.blockTime >= oneDayAgoUnix;
      });
      
      return filteredSignatures.map(sig => sig.signature);
    } catch (error) {
      console.error('Error fetching transaction signatures:', error);
      this.rpcErrors.push('Transaction history may be incomplete due to RPC limits');
      return [];
    }
  }
  
  /**
   * Fetch transaction details in batches to avoid rate limits
   */
  private async fetchTransactionDetailsBatched(signatures: string[]): Promise<TransactionData[]> {
    try {
      if (!this.connection) {
        throw new Error("Connection not initialized");
      }
      
      if (signatures.length === 0) {
        return [];
      }
      
      // If we have a Helius API key and we're on mainnet, try their enriched transaction API
      if (this.heliusApiKey && this.network === 'mainnet-beta') {
        try {
          // Helius can handle more transactions at once
          const enrichedTxns = await axios.post(`https://api.helius.xyz/v0/transactions`, {
            api_key: this.heliusApiKey,
            transactions: signatures.slice(0, 50) // Limit to 50 transactions
          });
          
          // Transform Helius enriched transaction data into our format
          const transactions = enrichedTxns.data as any[];
          return transactions.map((tx: any) => this.transformHeliusTransaction(tx));
        } catch (error) {
          console.warn('Helius API error, falling back to RPC for transaction details:', error);
          this.rpcErrors.push('Helius API unavailable for transaction details');
        }
      }
      
      // Process in smaller batches to avoid rate limits
      const allTransactions: TransactionData[] = [];
      const batches = this.chunkArray(signatures, BATCH_SIZE);
      
      for (let i = 0; i < batches.length; i++) {
        try {
          // Process each batch
          const batch = batches[i];
          console.log(`Processing batch ${i+1}/${batches.length}, signatures: ${batch.length}`);
          
          // Get transactions for this batch
          const batchTransactions = await this.connection.getParsedTransactions(batch, {
            maxSupportedTransactionVersion: 0
          });
          
          // Transform and add to results
          const transformedBatch = batchTransactions
            .filter((tx): tx is NonNullable<typeof tx> => tx !== null)
            .map(tx => this.transformTransaction(tx));
          
          allTransactions.push(...transformedBatch);
          
          // Add delay between batches to avoid rate limits
          if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
          }
        } catch (error) {
          console.error(`Error processing batch ${i+1}:`, error);
          this.rpcErrors.push(`Some transactions could not be loaded (batch ${i+1})`);
          
          // Wait longer on error before continuing
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS * 2));
        }
      }
      
      return allTransactions;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      this.rpcErrors.push('Transaction details may be incomplete due to RPC limits');
      return [];
    }
  }
  
  /**
   * Fetch token balances with retry on rate limits
   */
  private async fetchTokenBalancesWithRetry(pubkey: PublicKey, retries = 2): Promise<TokenBalance[]> {
    try {
      if (!this.connection) {
        throw new Error("Connection not initialized");
      }
      
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        pubkey,
        { programId: TOKEN_PROGRAM_ID }
      );
      
      return tokenAccounts.value.map(account => {
        const parsedInfo = account.account.data.parsed.info;
        const tokenBalance: TokenBalance = {
          mint: parsedInfo.mint,
          amount: parsedInfo.tokenAmount.uiAmount,
          decimals: parsedInfo.tokenAmount.decimals,
        };
        
        return this.enrichTokenMetadata(tokenBalance);
      });
    } catch (error) {
      if (retries > 0 && error instanceof Error && 
          (error.message.includes("429") || error.message.includes("Too many requests"))) {
        // Wait and retry on rate limit
        console.warn(`Rate limited when fetching token balances, retrying in ${BATCH_DELAY_MS*2}ms...`);
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS * 2));
        return this.fetchTokenBalancesWithRetry(pubkey, retries - 1);
      }
      
      console.error('Error fetching token balances:', error);
      this.rpcErrors.push('Token balances could not be completely loaded due to RPC limits');
      return [];
    }
  }
  
  /**
   * Fetch NFTs for the wallet
   */
  private async fetchNFTs(pubkey: PublicKey): Promise<NFT[]> {
    try {
      // If we have a Helius API key and we're on mainnet, use their NFT API
      if (this.heliusApiKey && this.network === 'mainnet-beta') {
        try {
          const response = await axios.post(`https://api.helius.xyz/v0/addresses/${pubkey.toString()}/nfts`, {
            api_key: this.heliusApiKey
          });
          
          return (response.data as any[]).map((nft: any) => ({
            mint: nft.mint,
            name: nft.name,
            image: nft.image,
            collection: nft.collection?.name
          }));
        } catch (error) {
          console.warn('Helius API error for NFT data, using simplified approach:', error);
          this.rpcErrors.push('Helius API unavailable for NFT data');
        }
      }
      
      // For devnet and testnet, use a basic approach to detect NFTs
      if (this.network === 'devnet' || this.network === 'testnet') {
        // On devnet, we'll just report devnet NFTs we've detected from token balances
        const tokenBalances = await this.fetchTokenBalancesWithRetry(pubkey);
        
        // Filter for potential NFTs (amount = 1 and decimals = 0)
        return tokenBalances
          .filter(token => token.amount === 1 && token.decimals === 0)
          .map(token => ({
            mint: token.mint,
            name: `NFT ${token.mint.slice(0, 8)}...`,
            image: '', // No image metadata available with this basic approach
            collection: 'Devnet NFT'
          }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      this.rpcErrors.push('NFT data could not be loaded');
      return [];
    }
  }
  
  /**
   * Transform Helius enriched transaction data into our format
   */
  private transformHeliusTransaction(tx: any): TransactionData {
    try {
      // Extract token transfers if any
      const tokenTransfers = tx.tokenTransfers?.map((transfer: any) => ({
        amount: transfer.amount,
        mint: transfer.mint,
        tokenName: transfer.tokenName,
        tokenSymbol: transfer.tokenSymbol
      })) || [];
      
      // Extract SOL transfer if any
      const solTransfer = tx.nativeTransfers?.reduce((total: number, transfer: any) => {
        return total + transfer.amount;
      }, 0) / 1e9 || 0; // Convert lamports to SOL
      
      return {
        signature: tx.signature,
        slot: tx.slot,
        timestamp: tx.timestamp,
        success: !tx.err,
        fee: tx.fee / 1e9, // Convert lamports to SOL
        type: tx.type || 'unknown',
        tokenTransfers,
        solTransfer,
        programId: tx.instructions?.[0]?.programId,
        description: tx.description
      };
    } catch (error) {
      console.error('Error transforming Helius transaction:', error);
      return {
        signature: tx.signature || 'unknown',
        slot: tx.slot || 0,
        timestamp: tx.timestamp || 0,
        success: !tx.err,
        fee: (tx.fee || 0) / 1e9,
        type: 'unknown'
      };
    }
  }
  
  /**
   * Transform standard Solana transaction data into our format
   */
  private transformTransaction(tx: any): TransactionData {
    try {
      // Extract basic transaction info
      const { signature, slot, blockTime } = tx.transaction.signatures[0];
      
      // Calculate fee
      const fee = tx.meta?.fee || 0;
      
      // Check if successful
      const success = tx.meta?.err === null;
      
      // Determine transaction type (simplified)
      let type = 'unknown';
      let programId = '';
      
      try {
        const instructions = tx.transaction.message.instructions;
        if (instructions.length > 0) {
          programId = instructions[0].programId.toString();
          
          if (programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
            type = 'tokenTransfer';
          } else if (programId === '11111111111111111111111111111111') {
            type = 'systemTransfer';
          } else if (tx.meta?.innerInstructions?.length) {
            type = 'programInteraction';
          }
        }
      } catch (error) {
        console.warn('Error determining transaction type:', error);
      }
      
      return {
        signature,
        slot,
        timestamp: blockTime || 0,
        success,
        fee: fee / 1e9, // Convert lamports to SOL
        type,
        programId
      };
    } catch (error) {
      console.error('Error transforming transaction:', error);
      return {
        signature: 'unknown',
        slot: 0,
        timestamp: 0,
        success: false,
        fee: 0,
        type: 'unknown'
      };
    }
  }
  
  /**
   * Process transaction data to extract statistics
   */
  private processTransactionStats(transactions: TransactionData[]) {
    // Initialize stats
    const uniquePrograms: string[] = [];
    let totalFees = 0;
    let totalSolSent = 0;
    let totalSolReceived = 0;
    const uniqueWallets = new Set<string>();
    const activityTypes: Record<string, number> = {};
    
    // Process each transaction
    transactions.forEach(tx => {
      // Add program ID to unique programs if it exists and isn't already included
      if (tx.programId && !uniquePrograms.includes(tx.programId)) {
        uniquePrograms.push(tx.programId);
      }
      
      // Add fees
      totalFees += tx.fee;
      
      // Add SOL transfers
      if (tx.solTransfer) {
        if (tx.solTransfer > 0) {
          totalSolReceived += tx.solTransfer;
        } else {
          totalSolSent += Math.abs(tx.solTransfer);
        }
      }
      
      // Count activity types
      const type = tx.type || 'unknown';
      activityTypes[type] = (activityTypes[type] || 0) + 1;
      
      // We would need wallet addresses from transaction data to count unique wallets
      // This is simplified and would need more detailed transaction parsing in production
    });
    
    // Determine most frequent activity
    let mostFrequentActivity = 'No activity';
    let maxCount = 0;
    
    Object.entries(activityTypes).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentActivity = this.formatActivityType(type);
      }
    });
    
    return {
      uniquePrograms,
      totalFees,
      totalSolSent,
      totalSolReceived,
      uniqueWallets: Array.from(uniqueWallets),
      mostFrequentActivity
    };
  }
  
  /**
   * Format activity type for display
   */
  private formatActivityType(type: string): string {
    switch (type) {
      case 'tokenTransfer':
        return 'Token Transfers';
      case 'systemTransfer':
        return 'SOL Transfers';
      case 'swap':
        return 'Token Swaps';
      case 'nftMint':
        return 'NFT Minting';
      case 'nftSale':
        return 'NFT Trading';
      case 'programInteraction':
        return 'DApp Interaction';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
    }
  }
  
  /**
   * Enrich token balance with metadata
   */
  private enrichTokenMetadata(tokenBalance: TokenBalance): TokenBalance {
    // Special case for wrapped SOL
    if (tokenBalance.mint === 'So11111111111111111111111111111111111111112') {
      return {
        ...tokenBalance,
        tokenName: 'Wrapped SOL',
        tokenSymbol: 'wSOL'
      };
    }
    
    // For devnet, use some dummy metadata for common test tokens
    if (this.network === 'devnet') {
      // This is just a placeholder. In a real app, you'd use a token list
      const devnetTokens: Record<string, { name: string, symbol: string }> = {
        // Add any known devnet tokens here
      };
      
      if (devnetTokens[tokenBalance.mint]) {
        return {
          ...tokenBalance,
          tokenName: devnetTokens[tokenBalance.mint].name,
          tokenSymbol: devnetTokens[tokenBalance.mint].symbol
        };
      }
    }
    
    return tokenBalance;
  }
  
  /**
   * Generate suggested actions based on activity
   */
  private generateSuggestedActions(
    stats: ReturnType<WalletSummarizer['processTransactionStats']>,
    tokenBalances: TokenBalance[],
    nfts: NFT[]
  ): string[] {
    const suggestions: string[] = [];
    
    // Add network-specific suggestions
    if (this.network === 'devnet') {
      suggestions.push('You are currently on Devnet. Remember that assets here have no real value.');
      
      if (stats.totalSolSent > 0 || stats.totalSolReceived > 0) {
        suggestions.push('Continue testing your app functionality on Devnet before moving to mainnet.');
      }
    } else if (this.network === 'testnet') {
      suggestions.push('You are on Testnet. Consider using Devnet for better tooling support.');
    }
    
    // Add suggestions based on RPC errors if any occurred
    if (this.rpcErrors.length > 0) {
      suggestions.push('Consider using a dedicated RPC endpoint to avoid rate limits.');
    }
    
    // Token diversification
    if (tokenBalances.length > 5) {
      suggestions.push('Your portfolio is diverse. Consider consolidating smaller token positions for better management.');
    } else if (tokenBalances.length <= 1) {
      suggestions.push('Consider diversifying your portfolio with additional tokens or yields.');
    }
    
    // NFT engagement
    if (nfts.length > 0) {
      suggestions.push('Check floor prices for your NFT collections to stay updated on their value.');
    }
    
    // SOL balance management
    if (stats.totalSolSent > 10 && tokenBalances.some(tb => tb.tokenSymbol === 'SOL' && tb.amount < 0.1)) {
      suggestions.push('Maintain a minimum SOL balance for transaction fees and rent exemption.');
    }
    
    // Add default suggestion if none were generated
    if (suggestions.length === 0) {
      suggestions.push('Keep monitoring your wallet activity regularly for security.');
    }
    
    return suggestions;
  }
  
  /**
   * Generate a text summary for display in the chat
   */
  generateTextSummary(summary: WalletSummary): string {
    let text = `# 🔮 Wallet Activity Summary (${summary.period})\n\n`;
    
    // Network information
    text += `**Network**: ${summary.network.toUpperCase()}\n\n`;
    
    // Include any RPC errors
    if (summary.rpcErrors && summary.rpcErrors.length > 0) {
      text += `> ⚠️ **Note**: ${summary.rpcErrors.join('. ')}\n\n`;
    }
    
    // Overall stats
    text += `## Activity Overview\n`;
    text += `- **Transactions**: ${summary.transactionCount} in the last 24 hours\n`;
    text += `- **Most frequent activity**: ${summary.mostFrequentActivity || 'N/A'}\n`;
    
    if (summary.uniqueProgramsInteracted.length > 0) {
      text += `- **Unique programs interacted with**: ${summary.uniqueProgramsInteracted.length}\n`;
    }
    
    text += `- **Unique wallets interacted with**: ${summary.uniqueWalletsInteracted}\n`;
    text += `- **Total fees paid**: ${summary.totalFees.toFixed(6)} SOL\n\n`;
    
    // SOL transfers
    text += `## SOL Transfers\n`;
    text += `- **Received**: ${summary.totalSolReceived.toFixed(4)} SOL\n`;
    text += `- **Sent**: ${summary.totalSolSent.toFixed(4)} SOL\n`;
    text += `- **Net flow**: ${(summary.totalSolReceived - summary.totalSolSent).toFixed(4)} SOL\n\n`;
    
    // Token balances (top 3)
    const tokenBalances = summary.tokenBalances.filter(t => t.amount > 0);
    if (tokenBalances.length > 0) {
      text += `## Top Token Balances\n`;
      tokenBalances.slice(0, 3).forEach(token => {
        text += `- **${token.tokenSymbol || token.mint.slice(0, 4)}**: ${token.amount.toFixed(4)} ${token.tokenSymbol || ''}\n`;
      });
      if (tokenBalances.length > 3) {
        text += `- *and ${tokenBalances.length - 3} more tokens*\n`;
      }
      text += '\n';
    }
    
    // NFTs (if any)
    if (summary.nfts.length > 0) {
      text += `## NFTs in Wallet\n`;
      text += `You own ${summary.nfts.length} NFTs`;
      if (summary.nfts[0].collection) {
        text += `, including items from ${summary.nfts[0].collection}`;
        if (summary.nfts.length > 1 && summary.nfts[1].collection && summary.nfts[1].collection !== summary.nfts[0].collection) {
          text += ` and ${summary.nfts[1].collection}`;
        }
      }
      text += '.\n\n';
    }
    
    // Recent transactions (top 3)
    if (summary.recentTransactions.length > 0) {
      text += `## Recent Transactions\n`;
      summary.recentTransactions.slice(0, 3).forEach(tx => {
        const date = new Date(tx.timestamp * 1000).toLocaleDateString();
        text += `- **${tx.type}** on ${date}: ${tx.description || tx.signature.slice(0, 8)}...\n`;
      });
      text += '\n';
    }
    
    // Suggested actions
    if (summary.suggestedActions && summary.suggestedActions.length > 0) {
      text += `## Suggested Actions\n`;
      summary.suggestedActions.forEach(suggestion => {
        text += `- ${suggestion}\n`;
      });
    }
    
    return text;
  }
  
  /**
   * Helper function to split array into chunks for batched processing
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

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

export const walletSummarizer = new WalletSummarizer();