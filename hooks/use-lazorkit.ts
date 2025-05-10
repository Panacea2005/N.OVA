"use client"

import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey, Transaction, clusterApiUrl, LAMPORTS_PER_SOL, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

// Define token address
const NOVA_TOKEN_ADDRESS = new PublicKey('H2LhfTsiT2RWKpbyDLstZALcvVyUcaZmM2T7GtQoGJCu'); 

// Connection constants
const RPC_URL = 'https://rpc.lazorkit.xyz/';
const WS_ENDPOINT = 'https://rpc.lazorkit.xyz/ws/';
const WALLET_CONNECT_URL = 'https://w3s.link/ipfs/bafybeibvvxqef5arqj4uy22zwl3hcyvrthyfrjzoeuzyfcbizjur4yt6by/?action=connect';

// Helper function
function delay(seconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

export const useLazorKit = () => {
  // State for our wallet connection
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [credentialId, setCredentialId] = useState<string | null>(localStorage.getItem('CREDENTIAL_ID'));
  const [rawPublicKey, setRawPublicKey] = useState<string | null>(localStorage.getItem('PUBLIC_KEY'));
  const [balance, setBalance] = useState<number>(0);
  const [novaBalance, setNovaBalance] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connection] = useState<Connection>(new Connection(
    clusterApiUrl('devnet'), // Using Solana devnet for compatibility
    {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
    }
  ));

  // Set up wallet connection when component mounts
  useEffect(() => {
    const checkConnection = async () => {
      const storedCredentialId = localStorage.getItem('CREDENTIAL_ID');
      const storedPublicKey = localStorage.getItem('PUBLIC_KEY');
      const storedWalletAddress = localStorage.getItem('SMART_WALLET_ADDRESS');
      
      if (storedCredentialId && storedPublicKey && storedWalletAddress) {
        try {
          // Verify if the stored wallet address is a valid PublicKey
          const pubKey = new PublicKey(storedWalletAddress);
          
          setCredentialId(storedCredentialId);
          setRawPublicKey(storedPublicKey);
          setWalletAddress(storedWalletAddress);
          setPublicKey(pubKey);
          setIsConnected(true);
          
          // Fetch balances for the smart wallet
          await fetchBalances(pubKey);
        } catch (error) {
          console.error('Error restoring wallet connection:', error);
          // Clear local storage if there was an error
          localStorage.removeItem('CREDENTIAL_ID');
          localStorage.removeItem('PUBLIC_KEY');
          localStorage.removeItem('SMART_WALLET_ADDRESS');
          
          setCredentialId(null);
          setRawPublicKey(null);
          setWalletAddress(null);
          setPublicKey(null);
          setIsConnected(false);
        }
      }
    };
    
    checkConnection();
  }, []);

  // Fetch NOVA token balance
  const fetchNovaBalance = async (walletPublicKey: PublicKey) => {
    try {
      // Get NOVA token balance
      try {
        const tokenAccount = await getAssociatedTokenAddress(
          NOVA_TOKEN_ADDRESS,
          walletPublicKey
        );
        
        try {
          const tokenAccountInfo = await getAccount(connection, tokenAccount);
          setNovaBalance(Number(tokenAccountInfo.amount));
        } catch (error) {
          // Token account doesn't exist yet
          setNovaBalance(0);
        }
      } catch (error) {
        console.error('Error fetching NOVA balance:', error);
        setNovaBalance(0);
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
      setNovaBalance(0);
    }
  };

  // Fetch SOL and token balances
  const fetchBalances = async (walletPublicKey: PublicKey) => {
    try {
      setIsLoading(true);
      
      // Get SOL balance
      const solBalance = await connection.getBalance(walletPublicKey);
      setBalance(solBalance / LAMPORTS_PER_SOL);
      
      // Get NOVA token balance
      await fetchNovaBalance(walletPublicKey);
    } catch (error) {
      console.error('Error fetching balances:', error);
      setBalance(0);
      setNovaBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to wallet
  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate a valid placeholder PublicKey for testing
      // In a real implementation, this would come from the LazorKit wallet connection
      const dummyKeypair = PublicKey.unique();
      const smartWalletPubkey = dummyKeypair.toString();
      
      // Store values in localStorage
      localStorage.setItem('CREDENTIAL_ID', 'dummy-credential-id');
      localStorage.setItem('PUBLIC_KEY', 'dummy-public-key');
      localStorage.setItem('SMART_WALLET_ADDRESS', smartWalletPubkey);
      
      // Update state
      setCredentialId('dummy-credential-id');
      setRawPublicKey('dummy-public-key');
      setWalletAddress(smartWalletPubkey);
      setPublicKey(dummyKeypair);
      setIsConnected(true);
      setIsLoading(false);
      
      return smartWalletPubkey;
    } catch (error: any) {
      console.error('Error connecting to wallet:', error);
      setError(error.message || 'Failed to connect wallet');
      setIsLoading(false);
      throw error;
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      setIsLoading(true);
      
      // Clear local storage
      localStorage.removeItem('CREDENTIAL_ID');
      localStorage.removeItem('PUBLIC_KEY');
      localStorage.removeItem('SMART_WALLET_ADDRESS');
      
      // Reset state
      setCredentialId(null);
      setRawPublicKey(null);
      setWalletAddress(null);
      setPublicKey(null);
      setIsConnected(false);
      setBalance(0);
      setNovaBalance(0);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign and send a transaction
  const signAndSendTransaction = async (instruction: TransactionInstruction): Promise<string> => {
    try {
      if (!isConnected || !publicKey) {
        throw new Error('Wallet not connected');
      }
      
      // In a real implementation, this would open a popup and handle the signature process
      // For testing, we'll just return a simulated transaction ID
      return 'simulated_txid_' + Date.now().toString();
    } catch (error: any) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  };

  // Refresh balances manually
  const refreshBalances = useCallback(async () => {
    if (publicKey) {
      await fetchBalances(publicKey);
    }
  }, [publicKey]);

  // Get SOL and NOVA balances
  const getBalances = () => ({
    solBalance: balance,
    novaBalance: novaBalance
  });

  return {
    walletAddress,
    publicKey,
    balance,
    novaBalance,
    solBalance: balance, // Added for consistency
    isConnected,
    isLoading,
    error,
    credentialId,
    rawPublicKey,
    smartWalletAuthorityPubkey: walletAddress, // For compatibility with LazorKit API
    connectWallet,
    disconnectWallet,
    signAndSendTransaction,
    refreshBalances,
    getBalances,
    connection,
    // Additional methods matching LazorKit's useWallet hook
    connect: connectWallet,
    disconnect: disconnectWallet,
    signMessage: signAndSendTransaction
  };
};