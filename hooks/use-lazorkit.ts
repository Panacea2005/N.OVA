"use client"

import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey, Transaction, clusterApiUrl, LAMPORTS_PER_SOL, TransactionInstruction, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import * as bs58 from 'bs58';

// Define token address
const NOVA_TOKEN_ADDRESS = new PublicKey('H2LhfTsiT2RWKpbyDLstZALcvVyUcaZmM2T7GtQoGJCu'); 

// Connection constants
const RPC_URL = 'https://rpc.lazorkit.xyz/';
const WALLET_CONNECT_URL = 'https://w3s.link/ipfs/bafybeibvvxqef5arqj4uy22zwl3hcyvrthyfrjzoeuzyfcbizjur4yt6by/?action=connect';

// Helper function
function delay(seconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

// Generate a valid Solana address from a hash
function generateDeterministicAddress(seed: string): string {
  // Create a hash from the seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Use the hash as a seed for a keypair
  // This ensures we get a valid Solana address
  const seedBytes = new Uint8Array(32);
  const seedString = hash.toString();
  for (let i = 0; i < seedString.length && i < 32; i++) {
    seedBytes[i] = parseInt(seedString[i]);
  }
  
  // Ensure we have enough entropy in the seed
  for (let i = seedString.length; i < 32; i++) {
    seedBytes[i] = i;
  }
  
  // Generate a keypair
  const keypair = Keypair.fromSeed(seedBytes);
  return keypair.publicKey.toString();
}

export const useLazorKit = () => {
  // State for wallet connection
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [credentialId, setCredentialId] = useState<string | null>(localStorage.getItem('LAZORKIT_CREDENTIAL_ID'));
  const [balance, setBalance] = useState<number>(0);
  const [novaBalance, setNovaBalance] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPasskey, setHasPasskey] = useState<boolean>(false);
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
      // Important: Use the correct storage keys for passkey-based wallets
      const storedCredentialId = localStorage.getItem('LAZORKIT_CREDENTIAL_ID');
      const storedWalletAddress = localStorage.getItem('LAZORKIT_WALLET_ADDRESS');
      
      if (storedCredentialId && storedWalletAddress) {
        try {
          // Verify if the stored wallet address is a valid PublicKey
          const pubKey = new PublicKey(storedWalletAddress);
          
          setCredentialId(storedCredentialId);
          setWalletAddress(storedWalletAddress);
          setPublicKey(pubKey);
          setIsConnected(true);
          setHasPasskey(true);
          
          // Fetch balances for the wallet
          await fetchBalances(pubKey);
        } catch (error) {
          console.error('Error restoring wallet connection:', error);
          // Don't clear local storage on error - we'll try again on connect
          
          setCredentialId(null);
          setWalletAddress(null);
          setPublicKey(null);
          setIsConnected(false);
          setHasPasskey(false);
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

  // Connect to wallet - with fixed implementation for consistent addresses
  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First check if there's a stored wallet address we can use
      const storedCredentialId = localStorage.getItem('LAZORKIT_CREDENTIAL_ID');
      const storedWalletAddress = localStorage.getItem('LAZORKIT_WALLET_ADDRESS');
      
      // If we already have stored credentials, use them
      if (storedCredentialId && storedWalletAddress) {
        try {
          const pubKey = new PublicKey(storedWalletAddress);
          setCredentialId(storedCredentialId);
          setWalletAddress(storedWalletAddress);
          setPublicKey(pubKey);
          setIsConnected(true);
          setHasPasskey(true);
          
          // Fetch balances
          await fetchBalances(pubKey);
          
          return storedWalletAddress;
        } catch (error) {
          console.error('Error using stored wallet address:', error);
          // Clear invalid stored data and continue with new connection
          localStorage.removeItem('LAZORKIT_CREDENTIAL_ID');
          localStorage.removeItem('LAZORKIT_WALLET_ADDRESS');
        }
      }
      
      // FALLBACK FOR DEVELOPMENT/TESTING
      // This creates a consistent wallet address instead of a random one each time
      
      // Use a fixed address based on a hash of the device/browser info
      // This simulates a deterministic address derived from a passkey
      const deviceFingerprint = navigator.userAgent + window.screen.width + window.screen.height;
      
      // Generate a valid Solana address
      const validWalletAddress = generateDeterministicAddress(deviceFingerprint);
      
      // Create the public key
      const pubKey = new PublicKey(validWalletAddress);
      
      // Store the credential info for future use
      const credentialId = 'lazorkit-credential-' + Date.now();
      localStorage.setItem('LAZORKIT_CREDENTIAL_ID', credentialId);
      localStorage.setItem('LAZORKIT_WALLET_ADDRESS', validWalletAddress);
      
      setCredentialId(credentialId);
      setWalletAddress(validWalletAddress);
      setPublicKey(pubKey);
      setIsConnected(true);
      setHasPasskey(true);
      
      // Simulate WebAuthn request for the first time
      if (!localStorage.getItem('LAZORKIT_FIRST_CONNECT')) {
        console.log("First time connecting with LazorKit - simulating WebAuthn request");
        localStorage.setItem('LAZORKIT_FIRST_CONNECT', 'true');
        
        // In a real implementation, this would trigger a WebAuthn ceremony
        // For development, we'll just open a popup window to simulate it
        const popup = window.open('', 'WebAuthn Request', 'width=400,height=300');
        if (popup) {
          popup.document.write(`
            <html>
              <head>
                <title>WebAuthn Request</title>
                <style>
                  body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
                  .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                  h2 { margin-top: 0; }
                  button { background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h2>Create Passkey</h2>
                  <p>Use your device authentication to create a passkey for NOVA.</p>
                  <button onclick="window.close()">Authenticate</button>
                </div>
              </body>
            </html>
          `);
        }
      }
      
      return validWalletAddress;
    } catch (error: any) {
      console.error('Error connecting to wallet:', error);
      setError(error.message || 'Failed to connect wallet');
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      setIsLoading(true);
      
      // We Don't clear localStorage here to maintain the same wallet address
      // Only reset session state
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
      
      // For development/testing only
      return 'simulated_txid_' + Date.now().toString();
    } catch (error: any) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  };

  // Create a passkey
  const createPasskey = async (): Promise<boolean> => {
    try {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }
      
      // For development/testing only
      console.log('Creating passkey simulation');
      setHasPasskey(true);
      
      // Simulate WebAuthn request
      const popup = window.open('', 'WebAuthn Request', 'width=400,height=300');
      if (popup) {
        popup.document.write(`
          <html>
            <head>
              <title>WebAuthn Request</title>
              <style>
                body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
                .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h2 { margin-top: 0; }
                button { background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>Create Passkey</h2>
                <p>Use your device authentication to create a passkey for NOVA.</p>
                <button onclick="window.close()">Authenticate</button>
              </div>
            </body>
          </html>
        `);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error creating passkey:', error);
      return false;
    }
  };

  // Verify if a passkey exists
  const verifyPasskey = async (): Promise<boolean> => {
    try {
      if (!isConnected) {
        return false;
      }
      
      // For development/testing only - return the current state
      return hasPasskey;
    } catch (error: any) {
      console.error('Error verifying passkey:', error);
      return false;
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
    hasPasskey,
    smartWalletAuthorityPubkey: walletAddress, // For compatibility with LazorKit API
    connectWallet,
    disconnectWallet,
    signAndSendTransaction,
    refreshBalances,
    getBalances,
    createPasskey,
    verifyPasskey,
    connection,
    // Additional methods matching LazorKit's useWallet hook
    connect: connectWallet,
    disconnect: disconnectWallet,
    signMessage: async (message: Uint8Array) => ({ signature: new Uint8Array(64) }) // Mock implementation
  };
};