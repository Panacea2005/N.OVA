// hooks/use-token-insights.ts
import { useState } from 'react';
import { tokenInsightsService, TokenInsights } from '@/lib/services/ai/tokenInsights';
import { PublicKey } from '@solana/web3.js';

type NetworkType = 'mainnet-beta' | 'devnet' | 'testnet';

export const useTokenInsights = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenInsights, setTokenInsights] = useState<TokenInsights | null>(null);
  const [textSummary, setTextSummary] = useState<string | null>(null);

  /**
   * Validate if a string is a valid Solana public key
   */
  const isValidSolanaAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * Analyze a token by its mint address
   */
  const analyzeToken = async (tokenAddress: string, network?: NetworkType): Promise<TokenInsights | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate token address
      if (!isValidSolanaAddress(tokenAddress)) {
        throw new Error('Invalid Solana token address');
      }
      
      // Get token insights using the service
      const insights = await tokenInsightsService.getTokenInsights(tokenAddress, network);
      
      // Store the insights
      setTokenInsights(insights);
      
      // Generate text summary
      const summary = tokenInsightsService.generateTextSummary(insights);
      setTextSummary(summary);
      
      console.log("Token insights:", insights);
      
      // Return the insights for direct use
      return insights;
    } catch (error) {
      console.error('Error analyzing token:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Detect and handle token address from various formats
   * Supports:
   * - Full URLs from explorers
   * - Addresses with or without protocol
   * - Raw addresses
   */
  const handleTokenInput = async (input: string, network?: NetworkType): Promise<TokenInsights | null> => {
    try {
      // Remove whitespace
      const trimmedInput = input.trim();
      
      // Try to extract address from common explorer URLs
      let tokenAddress = trimmedInput;
      
      // Handle Solscan URLs
      if (trimmedInput.includes('solscan.io/token/')) {
        const match = trimmedInput.match(/token\/([A-Za-z0-9]{32,44})/);
        if (match && match[1]) {
          tokenAddress = match[1];
        }
      }
      // Handle Solana Explorer URLs
      else if (trimmedInput.includes('explorer.solana.com/address/')) {
        const match = trimmedInput.match(/address\/([A-Za-z0-9]{32,44})/);
        if (match && match[1]) {
          tokenAddress = match[1];
        }
      }
      // Handle Solana FM URLs
      else if (trimmedInput.includes('solana.fm/address/')) {
        const match = trimmedInput.match(/address\/([A-Za-z0-9]{32,44})/);
        if (match && match[1]) {
          tokenAddress = match[1];
        }
      }
      
      // Detect network from URL if not explicitly provided
      let detectedNetwork = network;
      if (!detectedNetwork) {
        if (trimmedInput.includes('devnet')) {
          detectedNetwork = 'devnet';
        } else if (trimmedInput.includes('testnet')) {
          detectedNetwork = 'testnet';
        } 
        // Default stays as null (service will auto-detect from wallet)
      }
      
      // Now analyze the extracted token address
      return await analyzeToken(tokenAddress, detectedNetwork);
    } catch (error) {
      console.error('Error handling token input:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      return null;
    }
  };

  return {
    analyzeToken,
    handleTokenInput,
    isLoading,
    error,
    tokenInsights,
    textSummary,
    isValidSolanaAddress
  };
};