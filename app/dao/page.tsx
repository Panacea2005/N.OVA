"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowUpDown,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Copy,
  Clock,
  ChevronDown,
  X,
  AlertTriangle,
  Info,
  Vote,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { usePhantom } from "@/hooks/use-phantom";
import { useRouter } from "next/navigation";

const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

const Footer = dynamic(() => import("@/components/footer"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

const NDaoBanner = dynamic(() => import("@/components/3d/ndao-banner"), {
  ssr: false,
});

// Helper function to conditionally join classnames
const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(" ");
};

const NovaDAO = () => {
  const router = useRouter();
  const {
    walletAddress,
    publicKey,
    isConnected,
    balance: solBalance,
    novaBalance,
    isLoading,
    signAndSendTransaction,
    refreshBalances,
    connection,
  } = usePhantom();

  const [mounted, setMounted] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  interface Proposal {
    id: string;
    title: string;
    status: string;
    votes: {
      for: number;
      against: number;
      abstain: number;
    };
    timeRemaining: string;
    quorumMet: boolean;
    description: string;
    author: string;
    fundingRequest: string;
  }

  const [activeProposal, setActiveProposal] = useState<Proposal | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulate token data fetch
  useEffect(() => {
    if (mounted) {
      setLocalLoading(true);
      setTimeout(() => {
        setLocalLoading(false);
      }, 1200);
    }
  }, [mounted]);

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Handle viewing proposal details
  const handleViewProposal = (proposal: Proposal) => {
    setActiveProposal(proposal);
    setShowProposalModal(true);
  };

  // Navigate to proposal page
  const navigateToProposal = (id: any) => {
    // In a real implementation, this would navigate to the proposal page
    console.log(`Navigating to proposal ${id}`);
    setShowProposalModal(false);
    // router.push(`/dao/proposals/${id}`);
  };

  // Mock data for DAO distribution
  const daoDistribution = [
    {
      id: "01",
      name: "SOL 100M LPs",
      title: "Treasury DAO (30%)",
      allocation: "300,000,000",
      percentage: "30%",
      description:
        "The allocations are distributed among over 50 LPs, with each LP contributing over $2M to the DAO Fund smart wallet. These projects invest in us, just as we invest in them through the index.",
      features: [
        "• Managed by community DAO governance",
        "• Used to fund ecosystem projects, vote on proposals, support builders",
        "• Transparent on-chain treasury management",
        "• Multi-signature wallet security",
      ],
    },
    {
      id: "02",
      name: "Index Unlocked Treasury",
      title: "Incentives & Airdrop (20%)",
      allocation: "200,000,000",
      percentage: "20%",
      description:
        "Are wallets that hold the NOVA coins for the purpose of contributing its value inside the main fund smart wallet to grow it, a proportion of the allocation trading decisions should be governed by community voting, and a proportion should be automated by missO and the market makers.",
      features: [
        "• Rewards for early users, data contributors, card creators, AI users",
        "• Retroactive airdrop, Echo missions, badge unlocks",
        "• User acquisition and retention incentives",
        "• Early adopter rewards program",
      ],
    },
    {
      id: "03",
      name: "NOVA Ventures",
      title: "Team & Core Contributors (15%)",
      allocation: "150,000,000",
      percentage: "15%",
      description:
        "NOVA Ventures introduces a revolutionary investment model where artificial intelligence meets community-driven venture capital. As a decentralized investment vehicle powered by MissO (the world's first AI CEO) and governed by NOVA token holders, NOVA Ventures represents a paradigm shift in how venture capital operates in the Web3 space.",
      features: [
        "• Founders, developers, designers allocation",
        "• 24-36 month vesting schedule with anti-dumping mechanisms",
        "• 10% unlocked at TGE (Token Generation Event)",
        "• Linear vesting for remaining tokens",
      ],
    },
    {
      id: "04",
      name: "Ecosystem & OBOT Treasury",
      title: "Ecosystem Fund (15%)",
      allocation: "150,000,000",
      percentage: "15%",
      description:
        "Funding allocated to support the greater Solana ecosystem, focusing on projects that enhance N.OVA's capabilities, reach, and utility. The Ecosystem Fund ensures continuous innovation and strategic growth through carefully selected partnerships.",
      features: [
        "• Strategic partnerships, developer grants, partner integrations",
        "• Example: support for AI plugin projects, NFT art initiatives",
        "• R&D initiatives for ecosystem expansion",
        "• Technical infrastructure improvements",
      ],
    },
    {
      id: "05",
      name: "NOVA CHARITY",
      title: "Community Rewards (10%)",
      allocation: "100,000,000",
      percentage: "10%",
      description:
        "NOVA introduces NOVA CHARITY, a revolutionary approach to charitable giving where our community and AI work together to create meaningful social impact. 3% of all NOVA fund management fees are automatically allocated to charitable causes, with recipients chosen through community voting and vetted by MissO AI.",
      features: [
        "• Staking programs, DAO voting, content contribution rewards",
        "• Advanced badge unlocks, AI character creation incentives",
        "• Community growth activities and governance participation",
        "• 8-12% APY for long-term staking participants",
      ],
    },
    {
      id: "06",
      name: "Exchange & Liquidity",
      title: "Liquidity & DEX (2%)",
      allocation: "20,000,000",
      percentage: "2%",
      description:
        "Allocation dedicated to ensuring sufficient market liquidity for NOVA tokens across decentralized exchanges. This allocation helps maintain a healthy trading environment with minimal slippage for all market participants.",
      features: [
        "• Creating pools on DEXs (SOL ↔ NOVA)",
        "• Used for test swaps and listings",
        "• Market making provisions",
        "• Trading pair establishment",
      ],
    },
    {
      id: "07",
      name: "Emergency Reserve",
      title: "Reserve (8%)",
      allocation: "80,000,000",
      percentage: "8%",
      description:
        "Strategic reserve held for contingencies and unexpected opportunities. Managed by the DAO with strict multi-signature requirements to ensure funds are only used when absolutely necessary or when exceptional growth opportunities arise.",
      features: [
        "• Contingency for emergencies, security audits",
        "• Managed by DAO governance",
        "• Requires multi-signature authorization (4/7)",
        "• Bi-annual security audits",
      ],
    },
  ];

  // Mock data for active proposals
  const activeProposals = [
    {
      id: "NIP-001",
      title: "N.AI Infrastructure Upgrade",
      status: "Active",
      votes: {
        for: 65,
        against: 15,
        abstain: 20,
      },
      timeRemaining: "3D 12H",
      quorumMet: true,
      description:
        "Enhance N.AI infrastructure to analyze on-chain data more efficiently and provide users with deeper insights. The upgrade will include new data processing pipelines and advanced ML models.",
      author: "GZN35rw1vV...nJGFXZ",
      fundingRequest: "5,000,000 NOVA",
    },
    {
      id: "NIP-002",
      title: "Solana Saga Partnership Program",
      status: "Active",
      votes: {
        for: 78,
        against: 14,
        abstain: 8,
      },
      timeRemaining: "1D 8H",
      quorumMet: true,
      description:
        "Establish partnership program with Solana Saga to integrate mobile wallet solutions. This partnership will extend N.OVA's reach to mobile users and create a seamless cross-device experience.",
      author: "2jvMnXpQ...3tFzK",
      fundingRequest: "3,500,000 NOVA",
    },
    {
      id: "NIP-003",
      title: "N.IDENTITY Badge System Upgrade",
      status: "Passed",
      votes: {
        for: 92,
        against: 5,
        abstain: 3,
      },
      timeRemaining: "ENDED",
      quorumMet: true,
      description:
        "Implement new badge system for identity cards with achievement tracking capabilities. The upgraded system will allow users to display their on-chain achievements and create unique visual identities.",
      author: "J8NPQGCH...SJJU",
      fundingRequest: "2,000,000 NOVA",
    },
    {
      id: "NIP-004",
      title: "Treasury DAO Reallocation",
      status: "Failed",
      votes: {
        for: 32,
        against: 60,
        abstain: 8,
      },
      timeRemaining: "ENDED",
      quorumMet: true,
      description:
        "Adjust Treasury allocations to increase funding for AI research grants. The proposal aimed to redirect 5% of ecosystem funding toward specialized AI research initiatives.",
      author: "CLZES9YH...DJPY",
      fundingRequest: "12,000,000 NOVA",
    },
  ];

  if (!mounted) {
    return (
      <main className="relative min-h-screen bg-black text-white font-mono">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-black opacity-90 z-0" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-4xl font-bold mb-8">Loading...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-black text-white font-mono">
      {/* Background */}
      <div className="fixed inset-0 bg-black z-0" />

      {/* Navigation */}
      <Navigation />

      <div className="container mx-auto px-2 pt-24 pb-16 relative z-10">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* NOVA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-10"
          >
            <NDaoBanner />
          </motion.div>

          {/* Main Header */}
          <div className="mb-16">
            <h1 className="text-8xl font-light mb-6">DAO</h1>
            <p className="text-white/70 uppercase max-w-4xl">
              N.OVA DAO IS A DECENTRALIZED GOVERNANCE SYSTEM OPERATED BY THE
              NOVA TOKEN HOLDING COMMUNITY.
            </p>
            <p className="text-white/70 uppercase max-w-4xl mt-2">
              EACH NOVA TOKEN HOLDER HAS VOTING RIGHTS TO DETERMINE THE FUTURE
              DIRECTION OF THE WEB3 AI PLATFORM.
            </p>
          </div>

          {/* Tokenomics Section */}
          <div className="border border-white/30 p-0.5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="border border-white/10 px-6 py-8"
            >
              <h2 className="text-5xl font-light mb-10">Tokenomics</h2>
              <p className="text-white/70 uppercase mb-6">
                TOTAL SUPPLY: 1,000,000,000 NOVA
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left text-white/50 uppercase text-xs">
                      <th className="pb-4 pr-6">TREASURY</th>
                      <th className="pb-4 px-6">ALLOCATION</th>
                      <th className="pb-4 px-6">PERCENTAGE</th>
                      <th className="pb-4 pl-6">VIEW ON SOLSCAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daoDistribution.map((item, index) => (
                      <tr
                        key={index}
                        className="border-t border-white/10 hover:bg-white/5"
                      >
                        <td className="py-4 pr-6 font-mono">{item.name}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <img
                              src="/images/logo.png"
                              alt="NOVA"
                              className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                            />
                            {item.allocation}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {/* Progress bar styled like in the reference */}
                          <div className="flex items-center">
                            <div className="h-2 bg-white/10 w-32 mr-3">
                              <div
                                className="h-full bg-white/50"
                                style={{ width: item.percentage }}
                              ></div>
                            </div>
                            {item.percentage}
                          </div>
                        </td>
                        <td className="py-4 pl-6">
                          <button className="text-white hover:text-white/70 transition-colors uppercase text-xs flex items-center">
                            VIEW ON SOLSCAN{" "}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Token distribution visualization - tabular approach */}
              <div className="mt-16 mb-10">
                <h3 className="text-2xl font-light mb-6">
                  Distribution Visualization
                </h3>

                {/* Visualization bar */}
                <div className="flex h-12 w-full bg-black overflow-hidden mb-6">
                  <div
                    className="bg-purple-500 h-full"
                    style={{ width: "30%" }}
                  ></div>
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: "20%" }}
                  ></div>
                  <div
                    className="bg-green-500 h-full"
                    style={{ width: "15%" }}
                  ></div>
                  <div
                    className="bg-yellow-500 h-full"
                    style={{ width: "15%" }}
                  ></div>
                  <div
                    className="bg-red-500 h-full"
                    style={{ width: "10%" }}
                  ></div>
                  <div
                    className="bg-cyan-500 h-full"
                    style={{ width: "2%" }}
                  ></div>
                  <div
                    className="bg-amber-500 h-full"
                    style={{ width: "8%" }}
                  ></div>
                </div>

                {/* Distribution table instead of inline labels */}
                <div className="grid grid-cols-7 gap-2 text-xs">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-purple-500 mb-1"></div>
                    <div className="text-white/60 text-center">
                      TREASURY DAO
                    </div>
                    <div className="text-white/80 font-bold">30%</div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-blue-500 mb-1"></div>
                    <div className="text-white/60 text-center">INCENTIVES</div>
                    <div className="text-white/80 font-bold">20%</div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-green-500 mb-1"></div>
                    <div className="text-white/60 text-center">TEAM</div>
                    <div className="text-white/80 font-bold">15%</div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-yellow-500 mb-1"></div>
                    <div className="text-white/60 text-center">ECOSYSTEM</div>
                    <div className="text-white/80 font-bold">15%</div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-red-500 mb-1"></div>
                    <div className="text-white/60 text-center">REWARDS</div>
                    <div className="text-white/80 font-bold">10%</div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-cyan-500 mb-1"></div>
                    <div className="text-white/60 text-center">LIQUIDITY</div>
                    <div className="text-white/80 font-bold">2%</div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-amber-500 mb-1"></div>
                    <div className="text-white/60 text-center">RESERVE</div>
                    <div className="text-white/80 font-bold">8%</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Individual Treasury Sections */}
          {daoDistribution.map((item) => (
            <div key={item.id} className="border border-white/30 p-0.5 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="border border-white/10 px-6 py-8"
              >
                <div className="flex items-start mb-8">
                  <div className="text-white/60 font-mono mr-4">
                    [{item.id}]
                  </div>
                  <div>
                    <h2 className="text-5xl font-light mb-2">{item.name}</h2>
                    <p className="text-purple-400 text-xl">{item.title}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <p className="text-white/80 mb-6">{item.description}</p>
                    <div className="space-y-2">
                      {item.features.map((feature, idx) => (
                        <p key={idx} className="text-white/80">
                          {feature}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="border border-white/20 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <div className="text-white/60 text-sm uppercase mb-1">
                          ALLOCATION
                        </div>
                        <div className="text-3xl font-light">
                          {item.allocation}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60 text-sm uppercase mb-1">
                          PERCENTAGE
                        </div>
                        <div className="text-3xl font-light">
                          {item.percentage}
                        </div>
                      </div>
                    </div>

                    <div className="h-2 bg-white/10 w-full mb-6">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: item.percentage }}
                      ></div>
                    </div>

                    {item.id === "01" && (
                      <div>
                        <h4 className="uppercase text-white/70 mb-4">
                          GOVERNANCE STRUCTURE
                        </h4>
                        <p className="mb-2 text-sm text-white/80">
                          • Proposals require 100,000 NOVA to create
                        </p>
                        <p className="mb-2 text-sm text-white/80">
                          • 7-day voting period for all proposals
                        </p>
                        <p className="mb-2 text-sm text-white/80">
                          • Minimum 15% quorum requirement
                        </p>
                        <p className="mb-2 text-sm text-white/80">
                          • Automatic execution via smart contracts
                        </p>
                      </div>
                    )}

                    {item.id === "02" && (
                      <div>
                        <h4 className="uppercase text-white/70 mb-4">
                          INCENTIVE BREAKDOWN
                        </h4>
                        <div className="flex items-center mb-2">
                          <div className="w-24 h-2 bg-white/10 mr-3">
                            <div
                              className="h-full bg-white/50"
                              style={{ width: "40%" }}
                            ></div>
                          </div>
                          <span className="text-sm">40% Data contributors</span>
                        </div>
                        <div className="flex items-center mb-2">
                          <div className="w-24 h-2 bg-white/10 mr-3">
                            <div
                              className="h-full bg-white/50"
                              style={{ width: "30%" }}
                            ></div>
                          </div>
                          <span className="text-sm">30% Early adopters</span>
                        </div>
                        <div className="flex items-center mb-2">
                          <div className="w-24 h-2 bg-white/10 mr-3">
                            <div
                              className="h-full bg-white/50"
                              style={{ width: "20%" }}
                            ></div>
                          </div>
                          <span className="text-sm">20% Badge unlocks</span>
                        </div>
                        <div className="flex items-center mb-2">
                          <div className="w-24 h-2 bg-white/10 mr-3">
                            <div
                              className="h-full bg-white/50"
                              style={{ width: "10%" }}
                            ></div>
                          </div>
                          <span className="text-sm">
                            10% Ecosystem activity
                          </span>
                        </div>
                      </div>
                    )}

                    {(item.id === "03" ||
                      item.id === "04" ||
                      item.id === "05" ||
                      item.id === "06" ||
                      item.id === "07") && (
                      <div>
                        <h4 className="uppercase text-white/70 mb-4">
                          ALLOCATION PURPOSE
                        </h4>
                        <div className="flex justify-between items-center mb-2 text-sm">
                          <span className="text-white/80">KEY METRICS</span>
                          <span className="text-white/80">VALUE</span>
                        </div>
                        {item.id === "03" && (
                          <>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>Initial unlock</span>
                              <span>10%</span>
                            </div>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>Vesting period</span>
                              <span>36 months</span>
                            </div>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>Cliff period</span>
                              <span>6 months</span>
                            </div>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>Linear release</span>
                              <span>70% of tokens</span>
                            </div>
                          </>
                        )}
                        {item.id === "04" && (
                          <>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>Development grants</span>
                              <span>40%</span>
                            </div>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>Strategic partnerships</span>
                              <span>30%</span>
                            </div>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>Infrastructure</span>
                              <span>20%</span>
                            </div>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>Community initiatives</span>
                              <span>10%</span>
                            </div>
                          </>
                        )}
                        {item.id === "05" && (
                          <>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>Staking rewards</span>
                              <span>50%</span>
                            </div>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>Governance participation</span>
                              <span>25%</span>
                            </div>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>Content creation</span>
                              <span>15%</span>
                            </div>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>Badge system</span>
                              <span>10%</span>
                            </div>
                          </>
                        )}
                        {item.id === "06" && (
                          <>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>Initial DEX liquidity</span>
                              <span>50%</span>
                            </div>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>LP incentives</span>
                              <span>30%</span>
                            </div>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>Market making</span>
                              <span>20%</span>
                            </div>
                          </>
                        )}
                        {item.id === "07" && (
                          <>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>Emergency fund</span>
                              <span>40%</span>
                            </div>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>Security audits</span>
                              <span>30%</span>
                            </div>
                            <div className="flex justify-between items-center mb-2 text-sm border-t border-white/10 pt-2">
                              <span>Unexpected opportunities</span>
                              <span>30%</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          ))}

          {/* Buy NOVA Section */}
          <div className="border border-white/30 p-0.5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="border border-white/10 px-6 py-12 flex flex-col items-center justify-center"
            >
              <h2 className="text-6xl font-light mb-8 text-center">
                Buy $N.OVA
              </h2>

              <button className="w-64 bg-white text-black uppercase font-medium text-center py-4 hover:bg-white/90 transition-colors mb-12">
                BUY NOW
              </button>

              <div className="border border-white/30 p-0.5 w-full max-w-3xl">
                <div className="border border-white/10 px-6 py-4 flex justify-between items-center">
                  <div className="uppercase text-white/60 text-sm mr-4">
                    SOLANA CONTRACT ADDRESS
                  </div>
                  <div className="flex items-center flex-1">
                    <div className="font-mono flex-1">
                      H2LhfTsiT2RWKpbyDLstZALcvVyUcaZmM2T7GtQoGJCu
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          "H2LhfTsiT2RWKpbyDLstZALcvVyUcaZmM2T7GtQoGJCu"
                        )
                      }
                      className="bg-black text-white border border-white/30 px-4 py-2 whitespace-nowrap"
                    >
                      COPY ADDRESS
                    </button>
                  </div>
                </div>
              </div>

              {copySuccess && (
                <div className="mt-2 text-green-400 text-sm">
                  Address copied to clipboard
                </div>
              )}

              <div className="text-center text-white/50 text-xs leading-relaxed mt-12 max-w-4xl">
                DISCLAIMER: CRYPTOCURRENCIES ARE HIGHLY SPECULATIVE AND INVOLVE
                SIGNIFICANT RISKS. THE VALUE OF NOVA TOKENS MAY FLUCTUATE
                RAPIDLY, AND PARTICIPANTS SHOULD BE FULLY AWARE OF THE RISKS
                INVOLVED IN CRYPTOCURRENCY INVESTMENTS BEFORE PARTICIPATING.
                NOVA IS NOT AVAILABLE TO U.S. PERSONS OR ENTITIES, AS DEFINED
                UNDER U.S. SECURITIES LAWS AND REGULATIONS. IT IS THE
                RESPONSIBILITY OF PARTICIPANTS TO ENSURE THAT THEIR JURISDICTION
                ALLOWS PARTICIPATION BEFORE GETTING INVOLVED.
              </div>
            </motion.div>
          </div>

          {/* Active Proposals Section */}
          <div className="border border-white/30 p-0.5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="border border-white/10 px-6 py-8"
            >
              <h2 className="text-5xl font-light mb-10">Active Proposals</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="border border-white/20 p-5 hover:border-white/30 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            proposal.status === "Active"
                              ? "bg-blue-500"
                              : proposal.status === "Passed"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span className="font-mono">{proposal.id}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs border ${
                          proposal.status === "Active"
                            ? "border-blue-500/30 text-blue-400"
                            : proposal.status === "Passed"
                            ? "border-green-500/30 text-green-400"
                            : "border-red-500/30 text-red-400"
                        }`}
                      >
                        {proposal.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-light mb-3">
                      {proposal.title}
                    </h3>
                    <p className="text-white/60 text-sm line-clamp-2 mb-4">
                      {proposal.description}
                    </p>

                    <div className="mb-4">
                      <div className="h-1.5 w-full bg-white/10 flex overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${proposal.votes.for}%` }}
                        ></div>
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${proposal.votes.against}%` }}
                        ></div>
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${proposal.votes.abstain}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-green-400">
                          For: {proposal.votes.for}%
                        </span>
                        <span className="text-red-400">
                          Against: {proposal.votes.against}%
                        </span>
                        <span className="text-blue-400">
                          Abstain: {proposal.votes.abstain}%
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-white/60">
                      <div>Funding: {proposal.fundingRequest}</div>
                      <div>Time: {proposal.timeRemaining}</div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleViewProposal(proposal)}
                        className="text-white hover:text-white/70 transition-colors uppercase text-xs flex items-center"
                      >
                        VIEW DETAILS <ArrowRight className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <button className="bg-white text-black px-6 py-3 uppercase hover:bg-white/90 transition-colors">
                  SUBMIT NEW PROPOSAL
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Proposal Modal */}
      {showProposalModal && activeProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowProposalModal(false)}
          ></div>
          <div className="relative z-10 w-full max-w-2xl max-h-[80vh] my-8 bg-black border border-white/30 overflow-hidden animate-scaleIn">
            <div className="border border-white/10 flex flex-col max-h-[80vh]">
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
                <h3 className="text-xl uppercase">
                  {activeProposal.id}: {activeProposal.title}
                </h3>
                <button
                  onClick={() => setShowProposalModal(false)}
                  className="p-2 border border-white/20 hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-y-auto scrollbar-hide px-6 py-5 flex-grow">
                <div className="space-y-6">
                  <div className="border border-white/20 p-5">
                    <h4 className="uppercase text-sm text-white/60 mb-2">
                      DESCRIPTION
                    </h4>
                    <p className="text-white/90">
                      {activeProposal.description}
                    </p>

                    {/* Additional content can be very long */}
                    <div className="mt-4">
                      <h5 className="uppercase text-xs text-white/50 mb-2">
                        BACKGROUND
                      </h5>
                      <p className="text-white/80 text-sm mb-2">
                        The N.AI platform has been experiencing increased demand
                        for on-chain data analysis capabilities. Our current
                        infrastructure can handle approximately 10,000 requests
                        per hour, but we're now seeing peaks of over 15,000
                        requests.
                      </p>
                      <p className="text-white/80 text-sm mb-2">
                        The proposed technical stack includes Rust-based data
                        processing pipelines, advanced machine learning models
                        for pattern detection, and enhanced visualization
                        capabilities.
                      </p>
                    </div>

                    <div className="mt-4">
                      <h5 className="uppercase text-xs text-white/50 mb-2">
                        IMPLEMENTATION PLAN
                      </h5>
                      <p className="text-white/80 text-sm mb-2">
                        Phase 1 (2 weeks): Infrastructure setup and deployment
                      </p>
                      <p className="text-white/80 text-sm mb-2">
                        Phase 2 (4 weeks): Development and testing
                      </p>
                      <p className="text-white/80 text-sm mb-2">
                        Phase 3 (3 weeks): ML model training
                      </p>
                      <p className="text-white/80 text-sm mb-2">
                        Phase 4 (3 weeks): UI/UX integration
                      </p>
                    </div>
                  </div>

                  <div className="border border-white/20 p-5">
                    <h4 className="uppercase text-sm text-white/60 mb-4">
                      VOTING STATUS
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>For</span>
                          <span>{activeProposal.votes.for}%</span>
                        </div>
                        <div className="h-2 bg-white/10 w-full">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${activeProposal.votes.for}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Against</span>
                          <span>{activeProposal.votes.against}%</span>
                        </div>
                        <div className="h-2 bg-white/10 w-full">
                          <div
                            className="h-full bg-red-500"
                            style={{
                              width: `${activeProposal.votes.against}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Abstain</span>
                          <span>{activeProposal.votes.abstain}%</span>
                        </div>
                        <div className="h-2 bg-white/10 w-full">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${activeProposal.votes.abstain}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-white/20 p-5">
                    <h4 className="uppercase text-sm text-white/60 mb-4">
                      DETAILS
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-white/60 text-xs">AUTHOR</div>
                        <div className="font-mono">{activeProposal.author}</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-xs">
                          TIME REMAINING
                        </div>
                        <div>{activeProposal.timeRemaining}</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-xs">STATUS</div>
                        <div
                          className={`inline-block px-2 py-1 text-xs 
                    ${
                      activeProposal.status === "Active"
                        ? "border border-blue-500/30 text-blue-400"
                        : activeProposal.status === "Passed"
                        ? "border border-green-500/30 text-green-400"
                        : "border border-red-500/30 text-red-400"
                    }`}
                        >
                          {activeProposal.status}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60 text-xs">QUORUM</div>
                        <div>
                          {activeProposal.quorumMet
                            ? "MET (15%+)"
                            : "NOT MET (<15%)"}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60 text-xs">
                          FUNDING REQUESTED
                        </div>
                        <div>{activeProposal.fundingRequest}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-white/20 p-5">
                    <h4 className="uppercase text-sm text-white/60 mb-4">
                      DISCUSSIONS
                    </h4>
                    <div className="space-y-4">
                      <div className="border-b border-white/10 pb-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-mono text-xs">
                            GZN35r...nJGFXZ
                          </div>
                          <div className="text-white/50 text-xs">
                            2 days ago
                          </div>
                        </div>
                        <p className="text-sm text-white/80">
                          Great proposal! I believe this infrastructure upgrade
                          is essential for us to keep up with demand.
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-mono text-xs">CLZES9...DJPY</div>
                          <div className="text-white/50 text-xs">1 day ago</div>
                        </div>
                        <p className="text-sm text-white/80">
                          The budget seems excessive. Could we first upgrade
                          just the data processing pipelines?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 border-t border-white/10">
                {activeProposal.status === "Active" ? (
                  <>
                    <div className="flex gap-4 mb-4">
                      <button className="flex-1 py-3 bg-green-500 text-black uppercase font-medium hover:bg-green-400 transition-colors">
                        VOTE FOR
                      </button>
                      <button className="flex-1 py-3 bg-red-500 text-black uppercase font-medium hover:bg-red-400 transition-colors">
                        VOTE AGAINST
                      </button>
                      <button className="flex-1 py-3 bg-blue-500 text-black uppercase font-medium hover:bg-blue-400 transition-colors">
                        ABSTAIN
                      </button>
                    </div>

                    <div className="border border-white/10 p-4 text-center text-white/60 text-sm">
                      <p>
                        Your voting power:{" "}
                        {isConnected ? (novaBalance || 0).toFixed(2) : 0} NOVA
                      </p>
                      <p className="mt-1">
                        Stake NOVA to increase your voting power up to 3x
                      </p>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => navigateToProposal(activeProposal.id)}
                    className="w-full py-3 bg-white text-black uppercase font-medium hover:bg-white/90 transition-colors"
                  >
                    VIEW FULL PROPOSAL DETAILS
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for hiding scrollbars while maintaining scroll functionality */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </main>
  );
};

export default NovaDAO;
