// This is the updated useWalletSummary hook that needs to be modified to ensure we get 
// the raw summary object instead of just the text summary

import { useState } from 'react';
import { usePhantom } from './use-phantom';
import { walletSummarizer } from '@/lib/services/chatbot/walletSummarizer';

export const useWalletSummary = () => {
  const { walletAddress: publicKey, isConnected } = usePhantom();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textSummary, setTextSummary] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);

  const summarizeWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isConnected || !publicKey) {
        setError('Wallet not connected');
        return null;
      }
      
      // Get the wallet summary as a raw object
      const summaryData = await walletSummarizer.summarizeWalletActivity(publicKey);
      
      // Store the raw summary object
      setSummary(summaryData);
      
      // Generate text summary for fallback only
      const summaryText = walletSummarizer.generateTextSummary(summaryData);
      setTextSummary(summaryText);
      
      console.log("Raw summary object:", summaryData);
      
      // Return the raw object for direct use
      return summaryData;
    } catch (error) {
      console.error('Error summarizing wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    summarizeWallet,
    isLoading,
    error,
    textSummary,
    summary, // Raw summary object
  };
};