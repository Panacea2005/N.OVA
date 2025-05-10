"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CheckIcon, LogOut, Copy, Check, Zap, Key, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

// Import both wallet adapter hooks and your custom hooks
import { useWallet, WalletProvider } from "@/hooks/use-wallet";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";

// Import default wallet styles first
import "@solana/wallet-adapter-react-ui/styles.css";

export function ConnectWalletButton() {
  const [isCopied, setIsCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [passkeyCreated, setPasskeyCreated] = useState<boolean | null>(null);
  const [checkingPasskey, setCheckingPasskey] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Use your custom wallet hook
  const {
    walletAddress,
    isConnected,
    connectWallet,
    disconnectWallet,
    activeProvider,
    createPasskey,
    verifyPasskey,
    error,
  } = useWallet();

  // Get the Solana wallet adapter state to detect connections
  const solanaWallet = useSolanaWallet();

  // Access the wallet modal controlled by the wallet adapter
  const { setVisible: setWalletModalVisible, visible: walletModalVisible } =
    useWalletModal();
    
  // When the Solana wallet adapter connects a wallet, we should update our activeProvider state
  useEffect(() => {
    if (solanaWallet.connected && solanaWallet.publicKey && (!activeProvider || activeProvider !== 'phantom')) {
      // This will update our wallet address from Solana adapter when it connects
      console.log("Standard wallet connected through wallet adapter");
      
      // Since our connectWallet doesn't accept an address parameter directly, we'll just
      // call it to set the phantom provider active, and the useWallet hook's internal logic
      // will detect the connected phantom wallet
      connectWallet("phantom");
    }
  }, [solanaWallet.connected, solanaWallet.publicKey, activeProvider, connectWallet]);

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "Not connected";

  // Apply custom styling to wallet modal
  useEffect(() => {
    // Function to apply our custom styles directly
    const applyCustomStyles = () => {
      setTimeout(() => {
        // Find the wallet modal wrapper
        const modal = document.querySelector(".wallet-adapter-modal-wrapper");
        if (modal) {
          // Force our styles by applying them directly
          modal.setAttribute(
            "style",
            `
            background-color: black !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            border-radius: 0 !important;
            max-width: 600px !important;
            padding: 0 !important;
          `
          );

          // Style the container
          const container = document.querySelector(
            ".wallet-adapter-modal-container"
          );
          if (container) {
            container.setAttribute(
              "style",
              `
              padding: 0 !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
            `
            );
          }

          // Style the title
          const title = document.querySelector(".wallet-adapter-modal-title");
          if (title) {
            title.setAttribute(
              "style",
              `
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
              font-weight: 300 !important;
              letter-spacing: 0.5px !important;
              margin: 0 !important;
              padding: 1.5rem !important;
              font-size: 1.25rem !important;
              text-transform: uppercase !important;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            `
            );
          }

          // Style the list
          const list = document.querySelector(".wallet-adapter-modal-list");
          if (list) {
            list.setAttribute(
              "style",
              `
              padding: 1rem !important;
              margin: 0 !important;
            `
            );

            // Style all buttons in the list
            const buttons = list.querySelectorAll("button");
            buttons.forEach((button) => {
              button.setAttribute(
                "style",
                `
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
                background-color: black !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 0 !important;
                color: rgba(255, 255, 255, 0.8) !important;
                font-weight: 400 !important;
                transition: all 0.2s ease !important;
                padding: 0.75rem 1rem !important;
                font-size: 0.875rem !important;
                height: auto !important;
                text-transform: uppercase !important;
                margin-bottom: 0.5rem !important;
                width: 100% !important;
                display: flex !important;
                align-items: center !important;
              `
              );

              // Add hover effect with event listeners
              button.addEventListener("mouseenter", () => {
                button.style.backgroundColor =
                  "rgba(255, 255, 255, 0.05) !important";
                button.style.borderColor =
                  "rgba(255, 255, 255, 0.3) !important";
                button.style.color = "white !important";
              });

              button.addEventListener("mouseleave", () => {
                button.style.backgroundColor = "black !important";
                button.style.borderColor =
                  "rgba(255, 255, 255, 0.2) !important";
                button.style.color = "rgba(255, 255, 255, 0.8) !important";
              });
            });
          }

          // Style the close button
          const closeButton = document.querySelector(
            ".wallet-adapter-modal-button-close"
          );
          if (closeButton) {
            closeButton.setAttribute(
              "style",
              `
              background-color: transparent !important;
              margin: 1rem !important;
              padding: 0 !important;
              border: 1px solid rgba(255, 255, 255, 0.2) !important;
              width: 2rem !important;
              height: 2rem !important;
            `
            );
          }
        }
      }, 50); // Small delay to ensure modal is fully rendered
    };

    // Set up an observer to detect when the modal appears
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          // Look for modal being added to the DOM
          const modal = document.querySelector(".wallet-adapter-modal-wrapper");
          if (modal) {
            applyCustomStyles();
          }
        }
      });
    });

    // Start observing the body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Apply styles if modal is already visible
    if (walletModalVisible) {
      applyCustomStyles();
    }

    // Override the original styles by adding a style tag
    const style = document.createElement("style");
    style.textContent = `
      .wallet-adapter-modal-wrapper {
  background-color: black !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 0 !important;
  max-width: 400px !important;
  padding: 0 !important;
}

.wallet-adapter-modal-wrapper .wallet-adapter-modal-container {
  padding: 0 !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.wallet-adapter-modal-wrapper .wallet-adapter-modal-title {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
  font-weight: 300 !important;
  letter-spacing: 0.5px !important;
  margin: 0 !important;
  padding: 1.5rem !important;
  font-size: 1.25rem !important;
  text-transform: uppercase !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.wallet-adapter-modal-wrapper .wallet-adapter-modal-list {
  padding: 1rem !important;
  margin: 0 !important;
}

.wallet-adapter-modal-wrapper .wallet-adapter-modal-list li {
  padding: 0 !important;
  margin-bottom: 0.5rem !important;
}

.wallet-adapter-modal-wrapper .wallet-adapter-button {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
  background-color: black !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 0 !important;
  color: rgba(255, 255, 255, 0.8) !important;
  font-weight: 400 !important;
  transition: all 0.2s ease !important;
  padding: 0.75rem 1rem !important;
  font-size: 0.875rem !important;
  height: auto !important;
  text-transform: uppercase !important;
}

.wallet-adapter-modal-wrapper .wallet-adapter-button:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: white !important;
}

.wallet-adapter-modal-wrapper .wallet-adapter-button-start-icon {
  margin-right: 0.75rem !important;
}

.wallet-adapter-modal-wrapper .wallet-adapter-modal-button-close {
  background-color: transparent !important;
  margin: 1rem !important;
  padding: 0 !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  width: 2rem !important;
  height: 2rem !important;
}

.wallet-adapter-modal-wrapper .wallet-adapter-modal-button-close:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
}

/* LazorKit button styling */
#lazorkit-wallet-option {
  background-color: black !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 0 !important;
  color: rgba(255, 255, 255, 0.8) !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
  font-weight: 400 !important;
  font-size: 0.875rem !important;
  text-transform: uppercase !important;
  padding: 0.75rem 1rem !important;
  display: flex !important;
  align-items: center !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
  margin-top: 0.5rem !important;
}

#lazorkit-wallet-option:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: white !important;
}

/* Wallet Button (in Navigation) */
.wallet-adapter-button {
  background-color: transparent !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
  font-size: 0.75rem !important;
  border-radius: 0 !important;
  padding: 0.5rem 1rem !important;
  transition: all 0.2s ease !important;
  text-transform: uppercase !important;
  height: auto !important;
}

.wallet-adapter-button:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
}

.wallet-adapter-button:active {
  transform: scale(0.98) !important;
}

.wallet-adapter-button-trigger {
  background-color: transparent !important;
}

.wallet-adapter-button-end-icon,
.wallet-adapter-button-start-icon,
.wallet-adapter-button-end-icon img,
.wallet-adapter-button-start-icon img {
  width: 1rem !important;
  height: 1rem !important;
  margin: 0 0.5rem !important;
}

/* Dropdown menu styling */
.wallet-adapter-dropdown-list {
  background-color: black !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 0 !important;
}

.wallet-adapter-dropdown-list-item {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
  font-size: 0.75rem !important;
  text-transform: uppercase !important;
  border-radius: 0 !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

.wallet-adapter-dropdown-list-item:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
  color: white !important;
}
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      observer.disconnect();
      document.head.removeChild(style);
    };
  }, [walletModalVisible]);

  // Check for existing passkey when using LazorKit
  useEffect(() => {
    const checkForPasskey = async () => {
      if (isConnected && activeProvider === 'lazorkit') {
        setCheckingPasskey(true);
        try {
          // Use the verifyPasskey function from your hook
          const hasPasskey = await verifyPasskey();
          console.log("Passkey verification result:", hasPasskey);
          setPasskeyCreated(hasPasskey);
        } catch (error) {
          console.error("Error checking passkey:", error);
          setPasskeyCreated(false);
        } finally {
          setCheckingPasskey(false);
        }
      } else if (activeProvider !== 'lazorkit') {
        // Clear passkey state when using other providers
        setPasskeyCreated(null);
      }
    };

    checkForPasskey();
  }, [isConnected, activeProvider, verifyPasskey]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle wallet details dropdown
      if (
        showDetails &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDetails(false);
      }

      // Handle wallet options dropdown
      if (
        showWalletOptions &&
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setShowWalletOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDetails, showWalletOptions]);

  const handleWalletAction = () => {
    if (isConnected) {
      setShowDetails(!showDetails);
      setShowWalletOptions(false);
    } else {
      // Show custom wallet options instead of standard modal
      setShowWalletOptions(!showWalletOptions);
    }
  };

  const handleConnectPhantom = async () => {
    setShowWalletOptions(false);
    
    try {
      // First ensure all wallets are disconnected
      await disconnectWallet();
      
      // Use the standard wallet adapter modal
      setWalletModalVisible(true);
      
      // The wallet connection itself will be handled by the wallet adapter
      // and our useEffect hook that detects changes in solanaWallet.connected
    } catch (error) {
      console.error("Error preparing for Phantom connection:", error);
    }
  };

  const handleConnectLazorKit = async () => {
    setShowWalletOptions(false);
    
    try {
      // First ensure all wallets are disconnected
      await disconnectWallet();
      
      // Use your custom hook to connect specifically to LazorKit
      await connectWallet("lazorkit");
    } catch (error) {
      console.error("Error connecting to LazorKit:", error);
    }
  };

  // Handle creating a passkey
  const handleCreatePasskey = async () => {
    if (!isConnected || activeProvider !== 'lazorkit') return;
    
    try {
      setCheckingPasskey(true);
      const success = await createPasskey();
      
      if (success) {
        setPasskeyCreated(true);
        
        // Display a success message
        const successTimeout = setTimeout(() => {
          clearTimeout(successTimeout);
        }, 2000);
      }
    } catch (error) {
      console.error("Error creating passkey:", error);
    } finally {
      setCheckingPasskey(false);
    }
  };

  const handleDisconnect = async () => {
    setShowDetails(false);
    await disconnectWallet();
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="relative z-50">
      {/* DAO style button */}
      {isConnected ? (
        // Connected state - DAO style
        <button
          onClick={handleWalletAction}
          className="border border-white/30 p-0.5"
          aria-label={`Connected wallet: ${truncatedAddress}`}
        >
          <div className="border border-white/10 px-4 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors">
            {activeProvider === 'lazorkit' ? (
              <Zap size={16} className="text-cyan-400" />
            ) : (
              <CheckIcon size={16} className="text-green-400" />
            )}
            <div className="font-mono text-xs">{truncatedAddress}</div>
          </div>
        </button>
      ) : (
        // Disconnected state - DAO style
        <button
          onClick={handleWalletAction}
          className="border border-white/30 p-0.5"
          aria-label="Connect wallet"
        >
          <div className="border border-white/10 px-4 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors">
            <Wallet size={16} className="text-white/70" />
            <div className="font-mono text-xs text-white/80">
              CONNECT WALLET
            </div>
          </div>
        </button>
      )}

      {/* Wallet options dropdown - Two options before entering wallet interface */}
      <AnimatePresence>
        {showWalletOptions && (
          <motion.div
            key="wallet-options-dropdown"
            ref={optionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-64 bg-black border border-white/30 z-50"
          >
            <div className="border border-white/10">
              <div className="p-3 border-b border-white/10">
                <div className="text-sm text-white/80 font-mono uppercase">
                  Select Wallet
                </div>
              </div>

              <div className="p-2 space-y-2">
                {/* Phantom wallet option with DAO styling */}
                <button
                  onClick={handleConnectPhantom}
                  className="w-full flex items-center p-3 text-white/70 hover:text-white hover:bg-white/5 transition-colors border border-white/20 hover:border-white/30"
                  aria-label="Connect with Phantom wallet"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <Wallet size={16} className="text-white/80" />
                    </div>
                    <span className="text-sm font-mono">Wallets</span>
                  </div>
                </button>

                {/* LazorKit wallet option with DAO styling */}
                <button
                  onClick={handleConnectLazorKit}
                  className="w-full flex items-center p-3 text-white/70 hover:text-white hover:bg-white/5 transition-colors border border-white/20 hover:border-white/30"
                  aria-label="Connect with LazorKit passkey"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <Key size={16} className="text-white/80" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-mono">Passkey (LazorKit)</span>
                      <span className="text-xs text-white/50">Secure WebAuthn login</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet details dropdown (for connected state) - DAO style */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            key="wallet-details-dropdown"
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-64 bg-black border border-white/30 z-50"
          >
            <div className="border border-white/10">
              <div className="p-4 border-b border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs font-mono text-white/70 flex items-center">
                    {activeProvider === "phantom" ? (
                      <span className="flex items-center">
                        <Wallet size={12} className="mr-1" />
                        PHANTOM WALLET
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Key size={12} className="mr-1" />
                        LAZORKIT WALLET
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm font-mono text-white/90 break-all">
                  {walletAddress}
                </div>
                <button
                  onClick={copyAddress}
                  className="mt-2 flex items-center text-xs text-white/60 hover:text-white transition-colors"
                  aria-label={isCopied ? "Address copied" : "Copy wallet address"}
                >
                  {isCopied ? (
                    <span className="flex items-center">
                      <Check className="w-3 h-3 mr-1" />
                      COPIED
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Copy className="w-3 h-3 mr-1" />
                      COPY ADDRESS
                    </span>
                  )}
                </button>
              </div>

              {/* Passkey section (only for LazorKit) */}
              {activeProvider === 'lazorkit' && (
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center mb-2">
                    <Shield size={14} className="mr-1 text-white/70" />
                    <div className="text-xs font-mono text-white/70">PASSKEY STATUS</div>
                  </div>
                  
                  {checkingPasskey ? (
                    <div className="flex items-center text-xs text-white/50">
                      <div className="w-3 h-3 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                      Checking passkey status...
                    </div>
                  ) : passkeyCreated ? (
                    <div className="bg-green-900/20 border border-green-500/30 p-2 text-xs">
                      <div className="flex items-center text-green-400 mb-1">
                        <CheckIcon size={12} className="mr-1" />
                        Passkey active
                      </div>
                      <p className="text-white/70">Your wallet is secured with WebAuthn</p>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-amber-900/20 border border-amber-500/30 p-2 text-xs mb-2">
                        <p className="text-white/70">No passkey found. Create one for enhanced security.</p>
                      </div>
                      <button 
                        onClick={handleCreatePasskey}
                        className="w-full py-2 border border-white/20 text-xs text-white/70 hover:text-white hover:bg-white/5 hover:border-white/30 transition-colors"
                        aria-label="Create new passkey"
                      >
                        <span className="flex items-center justify-center">
                          <Key size={12} className="mr-1" />
                          CREATE PASSKEY
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="p-2 space-y-2">
                {/* Switch wallet provider - Only show if not already using that provider */}
                {activeProvider === 'phantom' ? (
                  <button
                    onClick={handleConnectLazorKit}
                    className="w-full flex items-center justify-between p-3 text-white/70 hover:text-white hover:bg-white/5 transition-colors border border-white/20 hover:border-white/30"
                    aria-label="Switch to LazorKit passkey wallet"
                  >
                    <span className="text-sm font-mono">Switch to Passkey</span>
                    <Key size={14} />
                  </button>
                ) : (
                  <button
                    onClick={handleConnectPhantom}
                    className="w-full flex items-center justify-between p-3 text-white/70 hover:text-white hover:bg-white/5 transition-colors border border-white/20 hover:border-white/30"
                    aria-label="Switch to standard wallet"
                  >
                    <span className="text-sm font-mono">Switch to Standard</span>
                    <Wallet size={14} />
                  </button>
                )}

                {/* Disconnect button */}
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center justify-between p-3 text-white/70 hover:text-white hover:bg-white/5 transition-colors border border-white/20 hover:border-white/30"
                  aria-label="Disconnect wallet"
                >
                  <span className="text-sm font-mono">Disconnect Wallet</span>
                  <LogOut size={14} />
                </button>
              </div>

              {/* Error message if any */}
              {error && (
                <div className="p-3 border-t border-red-500/30 bg-red-900/20">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}