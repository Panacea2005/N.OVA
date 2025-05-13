"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Send,
  Clipboard,
  ExternalLink,
  Trash,
  Plus,
  Search,
  Clock,
  Pin,
  X,
  CheckIcon,
  Menu,
  ChevronLeft,
  ChevronRight,
  Cpu,
  BookOpen,
  Wallet,
  Coins,
  BarChart,
  Paperclip,
  AlertCircle,
} from "lucide-react";
import { Canvas } from "@react-three/fiber";
import {
  chatService,
  Message as ChatServiceMessage,
} from "@/lib/services/ai/chatService";
import { contractAnalyzer } from "@/lib/services/ai/contractAnalyzer";
import {
  chatStore,
  Message as BaseMessage,
  ChatHistory,
} from "@/lib/services/ai/chatStore";
import AnalysisResultDisplay from "./components/analysis-result-display";
import TokenInsightsDisplay from "./components/token-insights-display";
import ReputationScoreDisplay from "./components/reputation-score-display";
import WalletSummaryDisplay from "./components/wallet-summary-display";
import { useTokenInsights } from "@/hooks/use-token-insights";
import { useReputationScore } from "@/hooks/use-reputation-score";
import { useWalletSummary } from "@/hooks/use-wallet-summary";
import { usePhantom } from "@/hooks/use-phantom";

import ReactMarkdown from "react-markdown";

// Import the Navigation component
const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
});

// Import the 3D dot arch visualization component
const DynamicDotArchVisualization = dynamic(
  () => import("@/components/3d/dot-arch-visualization"),
  {
    ssr: false,
  }
);

// Model options for the dropdown
const modelOptions: Record<
  string,
  { name: string; tag: string; gradient: string }
> = {
  "llama3-8b-8192": {
    name: "N.ECHO",
    tag: "Balanced & Fast",
    gradient: "bg-gradient-to-r from-yellow-500 to-orange-500",
  },
  "mistral-saba-24b": {
    name: "N.CIPHER",
    tag: "Blazing Fast UX",
    gradient: "bg-gradient-to-r from-pink-500 to-red-500",
  },
  "llama3-70b-8192": {
    name: "N.ORACLE",
    tag: "Advanced Reasoning",
    gradient: "bg-gradient-to-r from-blue-500 to-purple-500",
  },
};

export default function AIPage() {
  // You can replace this with actual auth later
  const userId = "anonymous-user";

  // State management
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  type Message = BaseMessage & {
    walletSummary?: any;
    analysisResult?: any;
    tokenInsights?: any;
    reputationScore?: any;
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInitialMessage, setShowInitialMessage] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileContent, setUploadedFileContent] = useState<string | null>(
    null
  );
  const [selectedModel, setSelectedModel] =
    useState<keyof typeof modelOptions>("llama3-8b-8192");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedSuggestions, setCopiedSuggestions] = useState(false);
  const [activeChat, setActiveChat] = useState<number | null>(null); // For hover state
  const [isLoadingChats, setIsLoadingChats] = useState(true); // Add loading state for chats
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isConnected } = usePhantom();
  const {
    handleTokenInput,
    isLoading: isAnalyzingToken,
    error: tokenError,
    tokenInsights,
  } = useTokenInsights();

  const {
    handleWalletInput,
    isLoading: isCalculatingReputation,
    error: reputationError,
    reputationScore,
  } = useReputationScore();

  const {
    summarizeWallet,
    isLoading: isSummarizing,
    error: summaryError,
    textSummary,
  } = useWalletSummary();

  // Effects
  useEffect(() => {
    setMounted(true);

    // Load chat history from Supabase on component mount
    const loadChatHistory = async () => {
      try {
        setIsLoadingChats(true);
        const history = await chatStore.getChatHistory(userId);
        setChatHistory(history);
      } catch (error) {
        console.error("Error loading chat history:", error);
      } finally {
        setIsLoadingChats(false);
      }
    };

    loadChatHistory();

    return () => {
      // Cleanup any event listeners or animations
    };
  }, [userId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Event handlers
  const handleSend = async () => {
    if ((!input.trim() && !uploadedFile) || isLoading) return;

    if (showInitialMessage) setShowInitialMessage(false);

    try {
      setIsLoading(true);
      const userMessage: Message = {
        role: "user",
        // Include file information in the message content for proper display
        content: uploadedFile
          ? input.trim()
            ? `${input}\n\nFile: ${uploadedFile.name}`
            : `File: ${uploadedFile.name}`
          : input,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setUploadedFile(null);

      // Add temporary loading message
      setMessages((prev) => [...prev, { role: "assistant", content: "..." }]);

      let codeContent = uploadedFileContent || input;
      const isSolana = chatService.detectSolanaCode(codeContent);
      let displayedResponse = "";

      if (isSolana) {
        const analysis = await contractAnalyzer.analyzeContract(
          codeContent,
          selectedModel
        );
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: "", analysisResult: analysis },
        ]);
        setUploadedFileContent(null);
      } else {
        const response = await chatService.sendMessage(
          [userMessage as ChatServiceMessage],
          selectedModel
        );

        // Simulate typewriter effect
        const words = response.split(" ");
        for (let i = 0; i < words.length; i++) {
          displayedResponse += words[i] + " ";
          setMessages((prev) =>
            prev.slice(0, -1).concat({
              role: "assistant",
              content: displayedResponse,
              timestamp: new Date(),
              speed: "2.3x FASTER",
              tokens: Math.floor(displayedResponse.length / 4), // Rough token estimate
            })
          );
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
              chatContainerRef.current.scrollHeight;
          }
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }

      // Save the chat after the message exchange
      const updatedMessages: Message[] = [
        ...messages,
        userMessage,
        {
          role: "assistant" as "assistant",
          content: displayedResponse || "",
          timestamp: new Date(),
        },
      ];

      if (currentChatId === null) {
        // New chat
        const title = chatStore.generateChatTitle(updatedMessages as Message[]);
        const newChat: ChatHistory = {
          id: Date.now(), // Temporary ID, will be replaced by Supabase
          title: title,
          date: new Date().toLocaleDateString(),
          messages: updatedMessages.map((msg) => ({
            ...msg,
            role: msg.role as "user" | "assistant" | "system",
          })),
          user_id: userId, // Changed to snake_case
        };

        const savedChat = await chatStore.saveChat(newChat);
        if (savedChat) {
          setCurrentChatId(savedChat.id);
        }
      } else {
        // Update existing chat
        await chatStore.updateChat(currentChatId, {
          messages: updatedMessages.map((msg) => ({
            ...msg,
            role: msg.role as "user" | "assistant" | "system",
          })),
        });
      }

      // Refresh chat history
      const history = await chatStore.getChatHistory(userId);
      setChatHistory(history);
    } catch (error) {
      console.error("Error in handleSend:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content:
            "I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const fileContent = await file.text();
      setUploadedFileContent(fileContent);
    }
  };

  const handleCopyText = (
    text: string,
    type: "full" | "suggestions" = "full"
  ) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "full") {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setCopiedSuggestions(true);
        setTimeout(() => setCopiedSuggestions(false), 2000);
      }
    });
  };

  const handleLoadChat = async (chatId: number) => {
    // Get the specific chat from history
    const chat = chatHistory.find((c) => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chat.id);
      setShowInitialMessage(false);
      if (window.innerWidth < 768) {
        setSidebarOpen(false); // Close sidebar on mobile after selection
      }
    }
  };

  const handleDeleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the chat selection
    await chatStore.deleteChat(chatId);
    const updatedHistory = await chatStore.getChatHistory(userId);
    setChatHistory(updatedHistory);

    if (currentChatId === chatId) {
      setMessages([]);
      setShowInitialMessage(true);
      setCurrentChatId(null);
    }
  };

  const handlePinChat = async (
    chatId: number,
    currentPinned: boolean,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent triggering the chat selection
    await chatStore.pinChat(chatId, currentPinned);
    const updatedHistory = await chatStore.getChatHistory(userId);
    setChatHistory(updatedHistory);
  };

  const handleNewChat = () => {
    setMessages([]);
    setShowInitialMessage(true);
    setCurrentChatId(null);
    if (window.innerWidth < 768) {
      setSidebarOpen(false); // Close sidebar on mobile
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAnalyzeContract = async () => {
    setShowInitialMessage(false);
    if (!uploadedFile || !uploadedFileContent) return;

    if (showInitialMessage) setShowInitialMessage(false);

    try {
      setIsLoading(true);
      const userMessage: Message = {
        role: "user",
        content: `Analyze this Solana contract: File: ${uploadedFile.name}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Add temporary loading message
      setMessages((prev) => [...prev, { role: "assistant", content: "..." }]);

      // Use the contract analyzer directly
      const analysis = await contractAnalyzer.analyzeContract(
        uploadedFileContent,
        selectedModel
      );

      // Update the assistant message with the analysis result
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "", analysisResult: analysis },
      ]);

      // Clear the uploaded file after analysis is complete
      setUploadedFile(null);
      setUploadedFileContent(null);

      // Save the chat after the message exchange
      const updatedMessages: Message[] = [
        ...messages,
        userMessage,
        {
          role: "assistant" as "assistant",
          content: "",
          analysisResult: analysis,
          timestamp: new Date(),
        },
      ];

      if (currentChatId === null) {
        // New chat
        const title = chatStore.generateChatTitle(
          updatedMessages.map((msg) => ({
            ...msg,
            role: msg.role as "user" | "assistant" | "system",
          }))
        );
        const newChat: ChatHistory = {
          id: Date.now(), // Temporary ID, will be replaced by Supabase
          title: title,
          date: new Date().toLocaleDateString(),
          messages: updatedMessages.map((msg) => ({
            ...msg,
            role: msg.role as "user" | "assistant" | "system",
          })),
          user_id: userId, // Changed to snake_case
        };

        const savedChat = await chatStore.saveChat(newChat);
        if (savedChat) {
          setCurrentChatId(savedChat.id);
        }
      } else {
        // Update existing chat
        await chatStore.updateChat(currentChatId, {
          messages: updatedMessages.map((msg) => ({
            ...msg,
            role: msg.role as "assistant" | "user" | "system",
          })),
        });
      }

      // Refresh chat history
      const history = await chatStore.getChatHistory(userId);
      setChatHistory(history);
    } catch (error) {
      console.error("Error in handleAnalyzeContract:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content:
            "I encountered an error analyzing the contract. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render helper functions
  const renderAnalysisResult = (analysis: any) => {
    return (
      <AnalysisResultDisplay
        analysis={analysis}
        onCopy={handleCopyText}
        copiedState={{
          full: copied,
          suggestions: copiedSuggestions,
        }}
      />
    );
  };

  const handleTokenInsights = async () => {
    setShowInitialMessage(false);
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      const userMessage: Message = {
        role: "user",
        content: `Get insights for token: ${input}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setMessages((prev) => [...prev, { role: "assistant", content: "..." }]);

      const insights = await handleTokenInput(input);
      if (!insights) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            content:
              tokenError ||
              "Could not retrieve token insights. Please check the token address and try again.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: "",
          tokenInsights: insights,
          timestamp: new Date(),
        },
      ]);

      setInput("");

      const updatedMessages: Message[] = [
        ...messages,
        userMessage,
        {
          role: "assistant" as "assistant",
          content: "",
          tokenInsights: insights,
          timestamp: new Date(),
        },
      ];

      if (currentChatId === null) {
        const title = chatStore.generateChatTitle(
          updatedMessages.map((msg) => ({
            ...msg,
            role: msg.role as "user" | "assistant" | "system",
          }))
        );
        const newChat: ChatHistory = {
          id: Date.now(),
          title: title,
          date: new Date().toLocaleDateString(),
          messages: updatedMessages.map((msg) => ({
            ...msg,
            role: msg.role as "user" | "assistant" | "system",
            tokenInsights: msg.tokenInsights || undefined,
          })),
          user_id: userId,
        };

        const savedChat = await chatStore.saveChat(newChat);
        if (savedChat) {
          setCurrentChatId(savedChat.id);
        }
      } else {
        await chatStore.updateChat(currentChatId, {
          messages: updatedMessages.map((msg) => ({
            ...msg,
            role: msg.role as "assistant" | "user" | "system",
            tokenInsights: msg.tokenInsights || undefined,
          })),
        });
      }

      const history = await chatStore.getChatHistory(userId);
      setChatHistory(history);
    } catch (error) {
      console.error("Error in handleTokenInsights:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content:
            "I encountered an error retrieving token insights. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTokenInsights = (insights: any) => {
    return (
      <TokenInsightsDisplay
        insights={insights}
        isLoading={isAnalyzingToken}
        onCopy={handleCopyText}
      />
    );
  };

  const handleReputationScore = async () => {
    setShowInitialMessage(false);
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      const userMessage: Message = {
        role: "user",
        content: `Calculate reputation score for wallet: ${input}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setMessages((prev) => [...prev, { role: "assistant", content: "..." }]);

      const score = await handleWalletInput(input);
      if (!score) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            content:
              reputationError ||
              "Could not calculate reputation score. Please check the wallet address and try again.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: "",
          reputationScore: score,
          timestamp: new Date(),
        },
      ]);

      setInput("");

      const updatedMessages: Message[] = [
        ...messages,
        userMessage,
        {
          role: "assistant" as "assistant",
          content: "",
          reputationScore: score,
          timestamp: new Date(),
        },
      ];

      if (currentChatId === null) {
        const title = chatStore.generateChatTitle(
          updatedMessages.map((msg) => ({
            ...msg,
            role: msg.role as "user" | "assistant" | "system",
          }))
        );
        const newChat: ChatHistory = {
          id: Date.now(),
          title: title,
          date: new Date().toLocaleDateString(),
          messages: updatedMessages.map((msg) => ({
            ...msg,
            role: msg.role as "user" | "assistant" | "system",
            reputationScore: msg.reputationScore || undefined,
          })),
          user_id: userId,
        };

        const savedChat = await chatStore.saveChat(newChat);
        if (savedChat) {
          setCurrentChatId(savedChat.id);
        }
      } else {
        await chatStore.updateChat(currentChatId, {
          messages: updatedMessages.map((msg) => ({
            ...msg,
            role: msg.role as "assistant" | "user" | "system",
            reputationScore: msg.reputationScore || undefined,
          })),
        });
      }

      const history = await chatStore.getChatHistory(userId);
      setChatHistory(history);
    } catch (error) {
      console.error("Error in handleReputationScore:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content:
            "I encountered an error calculating the reputation score. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderReputationScore = (score: any) => {
    return (
      <ReputationScoreDisplay
        score={score}
        isLoading={isCalculatingReputation}
        onCopy={handleCopyText}
      />
    );
  };

  const handleSummarize = async () => {
    setShowInitialMessage(false);
    try {
      if (!isConnected) {
        // If wallet is not connected, inform the user
        const userMessage: Message = {
          role: "user",
          content: "Summarize my wallet activity",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I can't summarize your wallet activity because you haven't connected your wallet yet. Please connect your Phantom wallet using the 'Connect Wallet' button in the navigation bar.",
            timestamp: new Date(),
          },
        ]);

        // Save chat using existing functionality
        if (currentChatId === null) {
          // New chat
          const updatedMessages = [
            ...messages,
            userMessage,
            {
              role: "assistant",
              content:
                "I can't summarize your wallet activity because you haven't connected your wallet yet. Please connect your Phantom wallet using the 'Connect Wallet' button in the navigation bar.",
              timestamp: new Date(),
            },
          ];

          const title = chatStore.generateChatTitle(
            updatedMessages.map((msg) => ({
              ...msg,
              role: msg.role as "user" | "assistant" | "system",
            }))
          );
          const newChat: ChatHistory = {
            id: Date.now(),
            title: title,
            date: new Date().toLocaleDateString(),
            messages: updatedMessages.map((msg) => ({
              ...msg,
              role: msg.role as "user" | "assistant" | "system",
            })),
            user_id: userId,
          };

          const savedChat = await chatStore.saveChat(newChat);
          if (savedChat) {
            setCurrentChatId(savedChat.id);
          }
        } else {
          // Update existing chat
          await chatStore.updateChat(currentChatId, {
            messages: [
              ...messages,
              userMessage,
              {
                role: "assistant",
                content:
                  "I can't summarize your wallet activity because you haven't connected your wallet yet. Please connect your Phantom wallet using the 'Connect Wallet' button in the navigation bar.",
                timestamp: new Date(),
              },
            ],
          });
        }

        // Refresh chat history
        const history = await chatStore.getChatHistory(userId);
        setChatHistory(history);

        return;
      }

      // Add user request message
      const userMessage: Message = {
        role: "user",
        content: "Summarize my wallet activity for the past 24 hours",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Add loading message
      setMessages((prev) => [...prev, { role: "assistant", content: "..." }]);

      // Trigger the wallet summary and get the raw summary data
      const summaryData = await summarizeWallet();
      console.log("Summary data received from summarizeWallet:", summaryData);

      // If no summary data was returned (e.g., due to an error), provide fallback content
      if (!summaryData) {
        setMessages((prev) => [
          ...prev.slice(0, -1), // Remove loading message
          {
            role: "assistant",
            content:
              "I couldn't retrieve your wallet summary at this time. Please try again later.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      // Replace loading message with summary using the raw summary object
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove loading message
        {
          role: "assistant",
          content: "", // Empty content since we're using walletSummary
          walletSummary: summaryData, // Use the raw summary object directly
          timestamp: new Date(),
        },
      ]);

      // Save chat using existing functionality
      if (currentChatId === null) {
        // New chat
        const updatedMessages = [
          ...messages,
          userMessage,
          {
            role: "assistant",
            content: "", // Empty content since we're using walletSummary
            walletSummary: summaryData,
            timestamp: new Date(),
          },
        ];

        const title = chatStore.generateChatTitle(
          updatedMessages.map((msg) => ({
            ...msg,
            role: msg.role as "user" | "assistant" | "system",
          }))
        );
        const newChat: ChatHistory = {
          id: Date.now(),
          title: title,
          date: new Date().toLocaleDateString(),
          messages: updatedMessages.map((msg) => ({
            ...msg,
            role: msg.role as "assistant" | "user" | "system",
            // Ensure walletSummary is included in saved messages
            walletSummary: msg.walletSummary || undefined,
          })),
          user_id: userId,
        };

        const savedChat = await chatStore.saveChat(newChat);
        if (savedChat) {
          setCurrentChatId(savedChat.id);
        }
      } else {
        // Update existing chat
        await chatStore.updateChat(currentChatId, {
          messages: [
            ...messages,
            userMessage,
            {
              role: "assistant",
              content: "", // Empty content since we're using walletSummary
              walletSummary: summaryData,
              timestamp: new Date(),
            },
          ],
        });
      }

      // Refresh chat history
      const history = await chatStore.getChatHistory(userId);
      setChatHistory(history);
    } catch (error) {
      console.error("Error in handleSummarize:", error);

      // Show error message
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove loading message
        {
          role: "assistant",
          content:
            "I encountered an error while summarizing your wallet activity. Please make sure your wallet is connected and try again.",
          timestamp: new Date(),
        },
      ]);

      // Still save the error message to chat history
      if (currentChatId !== null) {
        await chatStore.updateChat(currentChatId, {
          messages: [
            ...messages,
            {
              role: "user",
              content: "Summarize my wallet activity for the past 24 hours",
              timestamp: new Date(),
            },
            {
              role: "assistant",
              content:
                "I encountered an error while summarizing your wallet activity. Please make sure your wallet is connected and try again.",
              timestamp: new Date(),
            },
          ],
        });

        // Refresh chat history
        const history = await chatStore.getChatHistory(userId);
        setChatHistory(history);
      }
    }
  };

  const renderWalletSummary = (summary: any) => {
    return (
      <WalletSummaryDisplay
        summary={summary}
        onCopy={handleCopyText}
        copiedState={{
          full: copied,
        }}
      />
    );
  };

  // Filter and sort chat history
  const filteredHistory = chatHistory.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen bg-black text-white font-mono">
      {/* Background with grid pattern - Matches N.IDENTITY style */}
      <div className="fixed inset-0 bg-black z-0" />
      <div
        className="fixed inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Navigation */}
      <Navigation />

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed z-30 top-20 left-4 md:hidden bg-black/50 p-2 border border-white/10"
      >
        <Menu className="w-5 h-5 text-white/70" />
      </button>

      {/* Sidebar - Redesigned to match N.IDENTITY style */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-64 bg-black z-20 border-r border-white/10 pt-16 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full py-2 px-3 text-sm flex items-center justify-between border border-white/30 hover:border-white transition-colors"
          >
            <span className="uppercase">New Chat</span>
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/30" />
            <input
              placeholder="SEARCH CHATS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-white/30 py-2 pl-8 pr-2 text-sm focus:outline-none focus:border-white transition-colors uppercase"
            />
          </div>
        </div>

        <div className="px-4 overflow-y-auto h-[calc(100vh-400px)]">
          {isLoadingChats ? (
            <div className="flex justify-center py-8">
              <div className="w-16 h-16 border-t-2 border-b-2 border-white rounded-full animate-spin" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-sm uppercase">
              No chats yet
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="relative group"
                  onMouseEnter={() => setActiveChat(chat.id)}
                  onMouseLeave={() => setActiveChat(null)}
                >
                  <button
                    className={`w-full text-left py-2 px-2 text-sm hover:bg-white/5 flex items-center gap-2 transition-colors ${
                      currentChatId === chat.id
                        ? "bg-white/10 border-l border-white"
                        : ""
                    }`}
                    onClick={() => handleLoadChat(chat.id)}
                  >
                    {chat.pinned ? (
                      <Pin className="w-3 h-3 text-white" />
                    ) : (
                      <Clock className="w-3 h-3 text-white/50" />
                    )}
                    <div className="flex-1 truncate pr-4">
                      <div className="text-white/80 truncate uppercase">{chat.title}</div>
                      <div className="text-xs text-white/30">{chat.date}</div>
                    </div>
                  </button>

                  {/* Action buttons - visible only on hover or for active chat */}
                  <div
                    className={`absolute right-0 top-0 bottom-0 flex items-center mr-1 transition-opacity duration-200 ${
                      activeChat === chat.id || currentChatId === chat.id
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    <button
                      onClick={(e) => handlePinChat(chat.id, !!chat.pinned, e)}
                      className="p-1 text-white/30 hover:text-white/90"
                      title={chat.pinned ? "Unpin chat" : "Pin chat"}
                    >
                      <Pin
                        className={`w-3 h-3 ${
                          chat.pinned ? "text-white" : ""
                        }`}
                      />
                    </button>

                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="p-1 text-white/30 hover:text-white"
                      title="Delete chat"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Models Selector in Sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 bg-black">
          <h3 className="text-xs text-white/50 mb-2 uppercase">Model</h3>
          <div className="space-y-2">
            {Object.entries(modelOptions).map(([modelKey, modelData]) => (
              <button
                key={modelKey}
                onClick={() =>
                  setSelectedModel(modelKey as keyof typeof modelOptions)
                }
                className={`w-full text-left py-2 px-2 text-sm border ${
                  selectedModel === modelKey
                    ? "border-white bg-white/5"
                    : "border-white/20 hover:border-white/40"
                } transition-colors`}
              >
                <div className="flex flex-col">
                  <span className="text-white/80 text-xs uppercase">
                    {modelData.name}
                  </span>
                  <span className="text-white/50 text-xs">
                    {modelData.tag}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed z-30 transition-all duration-300 ${
          sidebarOpen
            ? "left-64 top-1/2 -translate-y-1/2 h-16 w-6"
            : "left-0 top-1/2 -translate-y-1/2 h-16 w-6"
        } hidden md:flex items-center justify-center bg-black border-r border-t border-b border-white/30`}
        style={{
          borderLeft: sidebarOpen
            ? "none"
            : "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-4 h-4 text-white/70" />
        ) : (
          <ChevronRight className="w-4 h-4 text-white/70" />
        )}
      </button>

      {/* Dark overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content - Adjust padding to accommodate sidebar */}
      <div
        className={`relative z-10 pt-16 min-h-screen ${
          sidebarOpen ? "md:pl-64" : "md:pl-0"
        } transition-all duration-300`}
      >
        {/* Welcome Visualization State */}
        {showInitialMessage && (
          <motion.div
            className="flex-1 flex items-center justify-center fixed inset-0 z-10 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              left: sidebarOpen ? "264px" : 0,
              right: 0,
              top: "65px",
              bottom: "75px",
              margin: "auto",
            }}
          >
            <div className="w-[80%] h-[80%] mx-auto relative">
              <Canvas
                camera={{ position: [0, 0, 10], fov: 45 }}
                style={{
                  width: "100%",
                  height: "100%",
                  maxWidth: "800px",
                  maxHeight: "800px",
                  margin: "0 auto",
                }}
                dpr={[1, 2]}
              >
                <ambientLight intensity={0.6} />
                <DynamicDotArchVisualization
                  greeting="//Hi, I'm N.OVA AI."
                  dotSize={0.02}
                  dotOpacity={0.8}
                  dotColor="#FFFFFF"
                  arcWidth={10}
                  arcHeight={5}
                  arcDepth={2}
                  rows={40}
                  dotsPerRow={80}
                  animated={true}
                />
              </Canvas>
            </div>
          </motion.div>
        )}

        {/* Chat Interface */}
        <AnimatePresence>
          {(!showInitialMessage || messages.length > 0) && (
            <motion.div
              className={`absolute inset-0 flex flex-col pt-16 ${
                sidebarOpen ? "md:pl-64" : "md:pl-0"
              } transition-all duration-300`}
              initial={{ opacity: messages.length > 0 ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Chat Messages Container */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-4 py-4 pb-28"
              >
                <div className="max-w-3xl mx-auto">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className={`mb-6 ${
                          message.role === "user" ? "ml-auto" : "ml-0"
                        }`}
                        style={{ maxWidth: "95%" }}
                      >
                        {message.role === "user" ? (
                          /* User message - right aligned */
                          <div className="flex items-start gap-3 justify-end ml-auto">
                            <div className="bg-black border border-white/30 p-3 break-words">
                              {message.content}
                            </div>
                            <div className="w-8 h-8 flex items-center justify-center shrink-0 border border-white/30 overflow-hidden">
                              <Image
                                src="/images/user.png"
                                alt="User"
                                width={32}
                                height={32}
                                className="object-cover"
                              />
                            </div>
                          </div>
                        ) : (
                          /* Assistant message - left aligned */
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 flex items-center justify-center shrink-0 border border-white/30 overflow-hidden">
                              <Image
                                src="/images/logo.png"
                                alt="NOVA"
                                width={32}
                                height={32}
                                className="object-cover"
                              />
                            </div>

                            <div className="flex-1 overflow-hidden">
                              {/* Performance metrics */}
                              {message.tokens && (
                                <div className="flex items-center text-xs text-white/50 mb-1">
                                  <span className="flex items-center">
                                    <span className="opacity-50 mr-1">|</span>{" "}
                                    {message.tokens} T/C
                                  </span>
                                </div>
                              )}

                              {/* Message content or results display */}
                              {message.analysisResult ? (
                                renderAnalysisResult(message.analysisResult)
                              ) : message.walletSummary ? (
                                renderWalletSummary(message.walletSummary)
                              ) : message.tokenInsights ? (
                                renderTokenInsights(message.tokenInsights)
                              ) : message.reputationScore ? (
                                renderReputationScore(message.reputationScore)
                              ) : (
                                <div className="text-white break-words overflow-wrap-anywhere">
                                  {message.content === "..." ? (
                                    <div className="w-16 h-16 border-t-2 border-b-2 border-white rounded-full animate-spin mb-4"></div>
                                  ) : (
                                    <div className="markdown-content">
                                      <ReactMarkdown
                                        components={{
                                          h1: ({ node, ...props }) => (
                                            <h1
                                              className="text-xl font-light my-3 uppercase"
                                              {...props}
                                            />
                                          ),
                                          h2: ({ node, ...props }) => (
                                            <h2
                                              className="text-lg font-light my-2 uppercase"
                                              {...props}
                                            />
                                          ),
                                          h3: ({ node, ...props }) => (
                                            <h3
                                              className="text-md font-light my-2 uppercase"
                                              {...props}
                                            />
                                          ),
                                          p: ({ node, ...props }) => (
                                            <p className="mb-3" {...props} />
                                          ),
                                          ul: ({ node, ...props }) => (
                                            <ul
                                              className="list-disc pl-5 mb-3"
                                              {...props}
                                            />
                                          ),
                                          ol: ({ node, ...props }) => (
                                            <ol
                                              className="list-decimal pl-5 mb-3"
                                              {...props}
                                            />
                                          ),
                                          li: ({ node, ...props }) => (
                                            <li className="mb-1" {...props} />
                                          ),
                                          a: ({ node, ...props }) => (
                                            <a
                                              className="text-white hover:underline flex items-center"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              {...props}
                                            >
                                              {props.children}
                                              <ExternalLink className="w-3 h-3 ml-1" />
                                            </a>
                                          ),
                                          strong: ({ node, ...props }) => (
                                            <strong
                                              className="font-medium"
                                              {...props}
                                            />
                                          ),
                                          em: ({ node, ...props }) => (
                                            <em className="italic" {...props} />
                                          ),
                                          blockquote: ({ node, ...props }) => (
                                            <blockquote
                                              className="border-l-2 border-white pl-4 italic my-3 text-white/80"
                                              {...props}
                                            />
                                          ),
                                        }}
                                      >
                                        {message.content}
                                      </ReactMarkdown>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Action buttons */}
                              {message.content !== "..." && (
                                <div className="flex space-x-2 mt-3">
                                  <button
                                    className="text-xs text-white/50 hover:text-white border border-white/30 hover:border-white px-2 py-1 transition-colors flex items-center uppercase"
                                    onClick={() =>
                                      handleCopyText(message.content)
                                    }
                                  >
                                    {copied ? (
                                      <>
                                        <CheckIcon className="w-3 h-3 mr-1" />
                                        <span>Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Clipboard className="w-3 h-3 mr-1" />
                                        Copy
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area - Always at bottom */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-20 border-t border-white/30 bg-black ${
            sidebarOpen ? "md:pl-64" : "md:pl-0"
          } transition-all duration-300`}
        >
          <div className="max-w-4xl mx-auto relative">
            {/* Uploaded file display */}
            {uploadedFile && (
              <div className="px-6 pt-2 pb-0">
                <div className="flex items-center gap-2 p-2 border border-white/30 bg-black text-white/80 text-sm relative overflow-hidden">
                  <div className="w-6 h-6 flex items-center justify-center shrink-0 border border-white/30 overflow-hidden">
                    <Paperclip className="w-3 h-3 text-white" />
                  </div>

                  <div className="flex-1 truncate">
                    <div className="font-light truncate uppercase">
                      {uploadedFile.name}
                    </div>
                    <div className="text-xs text-white/50">
                      {uploadedFile.size
                        ? `${Math.round(uploadedFile.size / 1024)} KB`
                        : "File uploaded"}
                    </div>
                  </div>

                  <button
                    onClick={() => setUploadedFile(null)}
                    className="text-white/50 hover:text-white w-6 h-6 flex items-center justify-center border border-white/30 hover:border-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="px-6 py-2 border-b border-white/30">
              <div className="grid grid-cols-4 gap-1 w-full">
                {/* Analyze Button */}
                <button
                  className="p-0.5 border border-white/30 transition-colors hover:border-white"
                  onClick={handleAnalyzeContract}
                  disabled={isLoading}
                >
                  <div className="py-2 flex flex-col items-center">
                    <div className="w-6 h-6 flex items-center justify-center border border-white/30 mb-1">
                      <AlertCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-[10px] text-white uppercase">
                      Analyze
                    </span>
                  </div>
                </button>

                {/* Token Button */}
                <button
                  className="p-0.5 border border-white/30 transition-colors hover:border-white"
                  onClick={handleTokenInsights}
                >
                  <div className="py-2 flex flex-col items-center">
                    <div className="w-6 h-6 flex items-center justify-center border border-white/30 mb-1">
                      <Coins className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-[10px] text-white uppercase">
                      Insights
                    </span>
                  </div>
                </button>

                {/* Reputation Button */}
                <button
                  className="p-0.5 border border-white/30 transition-colors hover:border-white"
                  onClick={handleReputationScore}
                >
                  <div className="py-2 flex flex-col items-center">
                    <div className="w-6 h-6 flex items-center justify-center border border-white/30 mb-1">
                      <BarChart className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-[10px] text-white uppercase">
                      Reputation
                    </span>
                  </div>
                </button>

                {/* Summarize Button */}
                <button
                  className="p-0.5 border border-white/30 transition-colors hover:border-white"
                  onClick={handleSummarize}
                >
                  <div className="py-2 flex flex-col items-center">
                    <div className="w-6 h-6 flex items-center justify-center border border-white/30 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-[10px] text-white uppercase">
                      Summarize
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Text Input Area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  messages.length > 0 ? "Message NOVA..." : "Ask NOVA..."
                }
                className="w-full bg-transparent px-6 py-4 pr-24 focus:outline-none placeholder-white/30 text-white"
                onKeyDown={handleKeyDown}
              />

              {/* White line when typing */}
              {input && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/30"
                ></div>
              )}

              {/* Action buttons */}
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex items-center gap-3">
                {/* File upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".rs,.txt,.sol"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={isLoading || (!input.trim() && !uploadedFile)}
                  className={`${
                    !isLoading && (input.trim() || uploadedFile)
                      ? "text-white"
                      : "text-white/30"
                  } transition-colors`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Footer control bar */}
            <div className="px-6 py-2.5 flex justify-between items-center border-t border-white/30 text-xs text-white/40">
              <div className="flex items-center space-x-8">
                <span className="flex items-center uppercase">
                  <span className="opacity-70 mr-1">Press</span>
                  <span className="bg-black border border-white/30 px-1">Enter</span>
                  <span className="ml-2">to send</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for styling */}
      <style jsx global>{`
        .overflow-wrap-anywhere {
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        /* Improve code blocks */
        pre {
          white-space: pre-wrap;
          word-break: break-word;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 1rem;
          background-color: rgba(0, 0, 0, 0.5);
        }

        /* Styling for code blocks */
        .max-h-64 {
          max-height: 16rem;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 0;
        }

        ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.5);
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }
      `}</style>
    </main>
  );
}