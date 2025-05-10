"use client";

/**
 * Initializes a bridge between your custom LazorKit implementation and the standard wallet adapter
 */
export function initializeLazorKitBridge() {
  if (typeof window === 'undefined') return;
  
  // Import your custom hooks
  import('@/hooks/use-lazorkit').then(({ useLazorKit }) => {
    // Create a LazorKit bridge on the window object
    if (!window.lazorKit) {
      // Create an instance of the hook (this is a workaround since hooks can't be used outside components)
      const lazorKitInstance = {
        isLazorKit: true,
        isInitialized: false,
        isConnected: false,
        publicKey: null as any,
        
        // Initialize the LazorKit instance
        async init(config: any) {
          this.isInitialized = true;
          console.log("LazorKit initialized with config:", config);
          return Promise.resolve();
        },
        
        // Map our custom functions to the expected wallet adapter interface
        async connect() {
          try {
            // Use the stored instance if available
            if (window.__LAZORKIT_HOOK_INSTANCE__) {
              const address = await window.__LAZORKIT_HOOK_INSTANCE__.connectWallet();
              this.isConnected = true;
              
              // Create a publicKey object with toBytes method
              this.publicKey = {
                toString() { return address; },
                toBytes() { 
                  // Convert string to Uint8Array (32 bytes)
                  const bytes = new Uint8Array(32);
                  // This is simplified - in a real implementation you'd properly convert the base58 string
                  for (let i = 0; i < Math.min(address.length, 32); i++) {
                    bytes[i] = address.charCodeAt(i);
                  }
                  return bytes;
                }
              };
              
              return { publicKey: this.publicKey, address };
            }
            
            // Or create a new instance
            const lazorKit = useLazorKit();
            window.__LAZORKIT_HOOK_INSTANCE__ = lazorKit;
            
            const address = await lazorKit.connectWallet();
            this.isConnected = true;
            
            // Create a publicKey object with toBytes method
            this.publicKey = {
              toString() { return address; },
              toBytes() { 
                // Convert string to Uint8Array (32 bytes)
                const bytes = new Uint8Array(32);
                // Simplified conversion
                for (let i = 0; i < Math.min(address.length, 32); i++) {
                  bytes[i] = address.charCodeAt(i);
                }
                return bytes;
              }
            };
            
            return { publicKey: this.publicKey, address };
          } catch (error) {
            console.error("LazorKit connect error:", error);
            throw error;
          }
        },
        
        // Implement the rest of the interface
        async disconnect() {
          try {
            if (window.__LAZORKIT_HOOK_INSTANCE__) {
              await window.__LAZORKIT_HOOK_INSTANCE__.disconnectWallet();
            }
            this.isConnected = false;
            this.publicKey = null;
          } catch (error) {
            console.error("LazorKit disconnect error:", error);
            throw error;
          }
        },
        
        // Signing methods
        async signTransaction(transaction: { instructions: string | any[]; }) {
          if (!this.isConnected || !window.__LAZORKIT_HOOK_INSTANCE__) {
            throw new Error('Wallet not connected');
          }
          
          // Extract the first instruction from the transaction
          if (transaction.instructions && transaction.instructions.length > 0) {
            const instruction = transaction.instructions[0];
            const result = await window.__LAZORKIT_HOOK_INSTANCE__.signAndSendTransaction(instruction);
            // Return with signature property
            return { signature: result?.signature || 'signature-placeholder' };
          }
          
          // Return with required signature property
          return { signature: 'signature-placeholder' };
        },
        
        async signAllTransactions(transactions: any) {
          if (!this.isConnected || !window.__LAZORKIT_HOOK_INSTANCE__) {
            throw new Error('Wallet not connected');
          }
          
          // Sign each transaction
          for (const transaction of transactions) {
            if (transaction.instructions && transaction.instructions.length > 0) {
              const instruction = transaction.instructions[0];
              await window.__LAZORKIT_HOOK_INSTANCE__.signAndSendTransaction(instruction);
            }
          }
          
          // Return the transactions as is
          return transactions;
        },
        
        async signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }> {
          if (!this.isConnected || !window.__LAZORKIT_HOOK_INSTANCE__) {
            throw new Error('Wallet not connected');
          }
          
          // Use the signMessage method if available
          if (window.__LAZORKIT_HOOK_INSTANCE__.signMessage) {
            return await window.__LAZORKIT_HOOK_INSTANCE__.signMessage(message);
          }
          
          // Mock implementation as fallback
          return { signature: new Uint8Array(64) };
        },
        
        // Passkey methods
        async createPasskey(options: any): Promise<{ success: boolean }> {
          if (!this.isConnected || !window.__LAZORKIT_HOOK_INSTANCE__) {
            throw new Error('Wallet not connected');
          }
          
          if (window.__LAZORKIT_HOOK_INSTANCE__.createPasskey) {
            const success = await window.__LAZORKIT_HOOK_INSTANCE__.createPasskey();
            return { success };
          }
          
          return { success: true };
        },
        
        async verifyPasskey(): Promise<{ success: boolean }> {
          if (!this.isConnected || !window.__LAZORKIT_HOOK_INSTANCE__) {
            throw new Error('Wallet not connected');
          }
          
          if (window.__LAZORKIT_HOOK_INSTANCE__.verifyPasskey) {
            const success = await window.__LAZORKIT_HOOK_INSTANCE__.verifyPasskey();
            return { success };
          }
          
          return { success: true };
        }
      };
      
      // Expose the LazorKit interface to the window
      window.lazorKit = lazorKitInstance;
      
      // Flag to indicate our bridge is initialized
      window.__LAZORKIT_BRIDGE__ = true;
      
      console.log("LazorKit bridge initialized");
    }
  }).catch(error => {
    console.error("Failed to initialize LazorKit bridge:", error);
  });
}

// Define types for the window object
declare global {
  interface Window {
    lazorKit?: any;
    __LAZORKIT_BRIDGE__?: boolean;
    __LAZORKIT_HOOK_INSTANCE__?: any;
  }
}