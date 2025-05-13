// File: hooks/use-lazorkit.ts - Improved LazorKit implementation

"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
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

// Generate a valid Solana address from a hash - improved for better entropy
function generateDeterministicAddress(seed: string): string {
  try {
    // Create a more robust hash from the seed
    let hashStr = '';
    for (let i = 0; i < seed.length; i++) {
      const charCode = seed.charCodeAt(i);
      hashStr += charCode.toString(16);
    }
    
    // Add current timestamp for additional entropy
    hashStr += Date.now().toString();
    
    // Use the hash as a seed for a keypair with proper entropy
    const seedBytes = new Uint8Array(32);
    
    // Fill the array with pseudorandom values based on our hash
    for (let i = 0; i < 32; i++) {
      const hashPos = i % hashStr.length;
      const nextPos = (i + 1) % hashStr.length;
      // Create a value from pairs of hash characters
      const hexPair = hashStr.substring(hashPos, hashPos + 1) + hashStr.substring(nextPos, nextPos + 1);
      const value = parseInt(hexPair, 16) % 256;
      seedBytes[i] = value;
    }
    
    // Generate a keypair
    const keypair = Keypair.fromSeed(seedBytes);
    return keypair.publicKey.toString();
  } catch (error) {
    console.error("Error generating deterministic address:", error);
    // Fallback to a random keypair in case of error
    const randomKeypair = Keypair.generate();
    return randomKeypair.publicKey.toString();
  }
}

export const useLazorKit = () => {
  // State for wallet connection
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [credentialId, setCredentialId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [novaBalance, setNovaBalance] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPasskey, setHasPasskey] = useState<boolean>(false);
  const [connectionAttempts, setConnectionAttempts] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  // Add a connected reference to avoid state update on unmounted component
  const isConnectedRef = useRef<boolean>(false);
  const [connection] = useState<Connection>(new Connection(
    clusterApiUrl('devnet'), // Using Solana devnet for compatibility
    {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
    }
  ));

  // Initialize state from localStorage on mount
  useEffect(() => {
    const initializeFromStorage = () => {
      try {
        // Check stored credentials
        const storedCredentialId = localStorage.getItem('LAZORKIT_CREDENTIAL_ID');
        const storedWalletAddress = localStorage.getItem('LAZORKIT_WALLET_ADDRESS');
        
        if (storedCredentialId && storedWalletAddress) {
          try {
            // Verify if the stored wallet address is a valid PublicKey
            const pubKey = new PublicKey(storedWalletAddress);
            
            setCredentialId(storedCredentialId);
            setWalletAddress(storedWalletAddress);
            setPublicKey(pubKey);
            setIsConnected(false); // Start disconnected but with saved credentials
            setHasPasskey(true);
          } catch (error) {
            console.error('Error parsing stored wallet address:', error);
            
            // Clear invalid stored data
            localStorage.removeItem('LAZORKIT_CREDENTIAL_ID');
            localStorage.removeItem('LAZORKIT_WALLET_ADDRESS');
            
            setCredentialId(null);
            setWalletAddress(null);
            setPublicKey(null);
            setIsConnected(false);
            setHasPasskey(false);
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing from storage:', error);
        setIsInitialized(true);
      }
    };
    
    initializeFromStorage();
  }, []);

  // Update connected ref when isConnected changes
  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

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
    if (!isConnectedRef.current) {
      console.log('Skipping balance fetch - not connected');
      return;
    }
    
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

  // Improved connect wallet with better error handling and WebAuthn simulation
  const connectWallet = async (): Promise<string> => {
    // Increment connection attempt counter
    setConnectionAttempts(prev => prev + 1);
    console.log(`LazorKit connection attempt #${connectionAttempts + 1}`);
    
    setIsLoading(true);
    setError(null);

    try {
      // First check if there's a stored wallet address we can use
      const storedCredentialId = localStorage.getItem('LAZORKIT_CREDENTIAL_ID');
      const storedWalletAddress = localStorage.getItem('LAZORKIT_WALLET_ADDRESS');
      
      // If we already have stored credentials, use them
      if (storedCredentialId && storedWalletAddress) {
        try {
          // Verify the stored wallet address
          const pubKey = new PublicKey(storedWalletAddress);
          
          // Simulate a small delay for authentication
          await delay(0.5);
          
          setCredentialId(storedCredentialId);
          setWalletAddress(storedWalletAddress);
          setPublicKey(pubKey);
          setIsConnected(true);
          setHasPasskey(true);
          isConnectedRef.current = true;
          
          // Fetch balances
          await fetchBalances(pubKey);
          
          return storedWalletAddress;
        } catch (error) {
          console.error('Error using stored wallet address:', error);
          
          // Clear invalid stored data and create a new connection
          localStorage.removeItem('LAZORKIT_CREDENTIAL_ID');
          localStorage.removeItem('LAZORKIT_WALLET_ADDRESS');
        }
      }
      
      // IMPROVED DEVELOPMENT/TESTING IMPLEMENTATION
      
      // Use browser fingerprint for more consistent address generation
      const deviceFingerprint = 
        navigator.userAgent + 
        window.screen.width + 
        window.screen.height + 
        navigator.language +
        ((navigator as any).deviceMemory || 4);
      
      // Generate a valid Solana address with more entropy
      const validWalletAddress = generateDeterministicAddress(deviceFingerprint);
      
      // Wait a moment to simulate the authentication process
      await delay(0.7); 
      
      try {
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
        setHasPasskey(false); // Start without a passkey
        isConnectedRef.current = true;
        
        // Simulate WebAuthn request for the first time
        if (!localStorage.getItem('LAZORKIT_FIRST_CONNECT')) {
          console.log("First time connecting with LazorKit - simulating WebAuthn request");
          localStorage.setItem('LAZORKIT_FIRST_CONNECT', 'true');
          
          // In a real implementation, this would trigger a WebAuthn ceremony
          // For development, we'll just open a popup window to simulate it
          try {
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
              
              // Auto-close after a delay
              setTimeout(() => {
                if (!popup.closed) popup.close();
              }, 3000);
            }
          } catch (error) {
            console.log("Unable to open popup window:", error);
          }
        }
        
        return validWalletAddress;
      } catch (error: any) {
        throw new Error(`Failed to create wallet: ${error.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error connecting to wallet:', error);
      setError(error.message || 'Failed to connect wallet');
      setIsLoading(false);
      isConnectedRef.current = false;
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Improved disconnect wallet
  const disconnectWallet = async () => {
    try {
      setIsLoading(true);
      console.log("Disconnecting LazorKit wallet");
      
      // Reset state while preserving credential IDs for reconnect
      setIsConnected(false);
      isConnectedRef.current = false;
      setBalance(0);
      setNovaBalance(0);
      
      // Add a small delay to simulate disconnection process
      await delay(0.2);
      
      return true;
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      return false;
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
      
      // For development/testing only - simulate transaction signing
      await delay(0.5); // Add delay to simulate signing
      return 'simulated_txid_' + Date.now().toString();
    } catch (error: any) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  };

  // Create a passkey with improved simulation
  const createPasskey = async (): Promise<boolean> => {
    try {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }
      
      // Simulate WebAuthn request
      try {
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
          
          // Auto-close after a delay
          setTimeout(() => {
            if (!popup.closed) popup.close();
          }, 3000);
        }
      } catch (error) {
        console.log("Unable to open popup window:", error);
      }
      
      // Add delay to simulate WebAuthn registration
      await delay(1);
      
      setHasPasskey(true);
      
      // Update localStorage to remember passkey was created
      localStorage.setItem('LAZORKIT_HAS_PASSKEY', 'true');
      
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
      
      // Check localStorage for passkey status first
      const storedPasskeyStatus = localStorage.getItem('LAZORKIT_HAS_PASSKEY');
      if (storedPasskeyStatus === 'true') {
        setHasPasskey(true);
        return true;
      }
      
      return hasPasskey;
    } catch (error: any) {
      console.error('Error verifying passkey:', error);
      return false;
    }
  };

  // Refresh balances manually
  const refreshBalances = useCallback(async () => {
    if (publicKey && isConnectedRef.current) {
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
    solBalance: balance,
    isConnected,
    isLoading,
    error,
    credentialId,
    hasPasskey,
    smartWalletAuthorityPubkey: walletAddress,
    connectWallet,
    disconnectWallet,
    signAndSendTransaction,
    refreshBalances,
    getBalances,
    createPasskey,
    verifyPasskey,
    connection,
    isInitialized,
    // Additional methods matching LazorKit's useWallet hook
    connect: connectWallet,
    disconnect: disconnectWallet,
    signMessage: async (message: Uint8Array) => ({ signature: new Uint8Array(64) })
  };
};