import { useState } from "react";
import { calculateReputationScore, ReputationScore } from "@/lib/services/ai/reputationScore";

// For tracking API request attempts to avoid flooding
const requestAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 3;
const ATTEMPT_RESET_TIME = 5 * 60 * 1000; // 5 minutes

export function useReputationScore() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reputationScore, setReputationScore] = useState<ReputationScore | null>(null);

  // Normalize wallet address to avoid case-sensitivity issues
  const normalizeWallet = (wallet: string): string => {
    return wallet.trim();
  };

  // Check if we've tried this wallet too many times recently
  const checkRateLimit = (wallet: string): boolean => {
    const normalized = normalizeWallet(wallet);
    const now = Date.now();
    const attempts = requestAttempts.get(normalized);

    if (!attempts) {
      requestAttempts.set(normalized, { count: 1, lastAttempt: now });
      return false; // Not rate limited
    }

    // Reset attempts if it's been a while
    if (now - attempts.lastAttempt > ATTEMPT_RESET_TIME) {
      requestAttempts.set(normalized, { count: 1, lastAttempt: now });
      return false; // Not rate limited
    }

    // Check if we've tried too many times
    if (attempts.count >= MAX_ATTEMPTS) {
      return true; // Rate limited
    }

    // Increment attempt count
    requestAttempts.set(normalized, { 
      count: attempts.count + 1, 
      lastAttempt: now 
    });
    return false; // Not rate limited
  };

  const handleWalletInput = async (walletAddress: string) => {
    const normalized = normalizeWallet(walletAddress);
    
    // Don't process empty wallet addresses
    if (!normalized) {
      setError("Please enter a valid wallet address");
      return null;
    }
    
    // Check if we're rate limited
    if (checkRateLimit(normalized)) {
      setError("Too many requests for this wallet. Please try again later.");
      return null;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Add a small random delay to avoid overwhelming APIs
      const delay = Math.floor(Math.random() * 500);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const score = await calculateReputationScore(normalized);
      
      if (!score) {
        setError("Unable to calculate reputation score. Please check the wallet address.");
        setReputationScore(null);
        return null;
      }
      
      setReputationScore(score);
      return score;
    } catch (err) {
      console.error("Error in handleWalletInput:", err);
      setError("Error processing wallet. Please try again later.");
      setReputationScore(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to directly set a reputation score (for AI integration with mock data)
  const setManualReputationScore = (score: ReputationScore) => {
    setReputationScore(score);
    setError(null);
  };

  return {
    handleWalletInput,
    setManualReputationScore, // Added for AI integration
    isLoading,
    error,
    reputationScore,
  };
}