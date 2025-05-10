"use client"

import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey, Transaction, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

// Define your token addresses - Replace with actual addresses
const NOVA_TOKEN_ADDRESS = new PublicKey('H2LhfTsiT2RWKpbyDLstZALcvVyUcaZmM2T7GtQoGJCu');
const POOL_ID = new PublicKey('4Kp5kkpSjcxk2cKKJu1SLS6mev6AL5PZxy1a4MWjkRV7');
const POOL_AUTHORITY = new PublicKey('GZN35rw1vVgPgdGB5xsK1ZxsNm49RbMxdcw92PnJGfXZ');

declare global {
    interface Window {
        solana?: any;
    }
}

export const usePhantom = () => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
    const [balance, setBalance] = useState<number>(0);
    const [novaBalance, setNovaBalance] = useState<number>(0);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [connection] = useState<Connection>(new Connection(clusterApiUrl('devnet'))); // Use devnet for testing, change to mainnet for production

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

    useEffect(() => {
        const checkIfWalletIsConnected = async () => {
            try {
                const { solana } = window;
                if (solana && solana.isPhantom) {
                    const response = await solana.connect({ onlyIfTrusted: true });
                    const publicKeyObj = new PublicKey(response.publicKey.toString());

                    setWalletAddress(response.publicKey.toString());
                    setPublicKey(publicKeyObj);
                    setIsConnected(true);

                    // Fetch balances
                    await fetchBalances(publicKeyObj);
                }
            } catch (error) {
                console.error('Error checking wallet connection:', error);
                // Reset state if there's an error
                setWalletAddress(null);
                setPublicKey(null);
                setIsConnected(false);
                setBalance(0);
                setNovaBalance(0);
            }
        };

        const handleDisconnect = () => {
            setWalletAddress(null);
            setPublicKey(null);
            setIsConnected(false);
            setBalance(0);
            setNovaBalance(0);
        };

        // Add event listeners for Phantom wallet
        if (window.solana) {
            window.solana.on('disconnect', handleDisconnect);
            window.solana.on('accountChanged', checkIfWalletIsConnected);
        }

        checkIfWalletIsConnected();

        // Cleanup event listeners
        return () => {
            if (window.solana) {
                window.solana.removeListener('disconnect', handleDisconnect);
                window.solana.removeListener('accountChanged', checkIfWalletIsConnected);
            }
        };
    }, []);

    const connectWallet = async () => {
        try {
            setIsLoading(true);
            const { solana } = window;
            if (solana && solana.isPhantom) {
                const response = await solana.connect();
                const publicKeyObj = new PublicKey(response.publicKey.toString());

                setWalletAddress(response.publicKey.toString());
                setPublicKey(publicKeyObj);
                setIsConnected(true);

                // Fetch balances
                await fetchBalances(publicKeyObj);

                return response.publicKey.toString();
            } else {
                window.open('https://phantom.app/', '_blank');
                throw new Error('Phantom wallet not installed');
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            // Reset state if there's an error
            setWalletAddress(null);
            setPublicKey(null);
            setIsConnected(false);
            setBalance(0);
            setNovaBalance(0);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const disconnectWallet = async () => {
        try {
            setIsLoading(true);
            const { solana } = window;
            if (solana) {
                await solana.disconnect();
                setWalletAddress(null);
                setPublicKey(null);
                setIsConnected(false);
                setBalance(0);
                setNovaBalance(0);
            }
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            // Still reset state even if there's an error
            setWalletAddress(null);
            setPublicKey(null);
            setIsConnected(false);
            setBalance(0);
            setNovaBalance(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Sign and send a transaction
    const signAndSendTransaction = async (transaction: Transaction): Promise<string> => {
        try {
            if (!publicKey) throw new Error('Wallet not connected');

            const { solana } = window;
            if (solana && solana.isPhantom) {
                transaction.feePayer = publicKey;
                transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

                // Sign the transaction
                const signedTransaction = await solana.signTransaction(transaction);

                // Send the transaction
                const signature = await connection.sendRawTransaction(signedTransaction.serialize());

                // Wait for confirmation
                await connection.confirmTransaction(signature);

                // Refresh balances after transaction
                await fetchBalances(publicKey);

                return signature;
            } else {
                throw new Error('Phantom wallet not installed');
            }
        } catch (error) {
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
        connectWallet,
        disconnectWallet,
        signAndSendTransaction,
        refreshBalances,
        getBalances,
        connection
    };
};