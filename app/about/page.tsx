"use client";

import { useEffect, useState, useRef, AwaitedReactNode, JSXElementConstructor, ReactElement, ReactNode, ReactPortal, SetStateAction } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import {
  ArrowRight,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Info,
  CheckCircle2,
  Sparkles,
  Users,
  Coins,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Dynamically import components to reduce initial load time
const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

const Footer = dynamic(() => import("@/components/footer"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

const ParticleBackground = dynamic(
  () => import("@/components/3d/particle-background"),
  {
    ssr: false,
  }
);

const HolographicSphere = dynamic(
  () => import("@/components/3d/holographic-sphere"),
  {
    ssr: false,
  }
);

const ParticleRing = dynamic(() => import("@/components/3d/particle-ring"), {
  ssr: false,
});

// Team Member Component
const TeamMember = ({ member, index }: { member: any, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 * index }}
      viewport={{ once: true }}
      className="relative border border-white/30 p-0.5"
    >
      <div className="border border-white/10 overflow-hidden bg-black/30">
        <div className="aspect-square overflow-hidden relative">
          {/* Image with overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80 mix-blend-multiply z-10"></div>
          <img
            src={member.image}
            alt={member.alias}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
          
          {/* Top section */}
          <div className="absolute top-3 left-3 z-20 flex items-center">
            <div className="text-white/70 font-mono text-xs uppercase mr-2">ID</div>
            <div className="bg-black/60 px-2 py-0.5 text-purple-400 text-xs font-mono">
              {index < 10 ? `0${index + 1}` : index + 1}
            </div>
          </div>
          
          {/* Scan line effect */}
          <motion.div
            className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/70 to-transparent z-30"
            animate={{
              top: ["0%", "100%"],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
        
        <div className="p-5">
          <h3 className="text-xl font-light text-white mb-1">
            {member.alias}
          </h3>
          <p className="text-white/60 font-mono text-xs uppercase mb-1">
            {member.name}
          </p>
          <p className="text-purple-400 text-xs mb-3 uppercase">
            {member.role}
          </p>

          <p className="text-white/70 text-sm leading-relaxed mb-4">
            {member.bio}
          </p>

          <div className="flex space-x-3 mt-4 pt-4 border-t border-white/10">
            <a
              href={member.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-purple-400 transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href={member.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-purple-400 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={member.social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-purple-400 transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Technology Box Component
const TechnologyBox = ({ category, items, index }: { category: any, items: any, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 * index }}
      viewport={{ once: true }}
      className="border border-white/30 p-0.5"
    >
      <div className="border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-xl font-light">{category.category}</h3>
        </div>
        
        <div className="p-5 space-y-3">
          {category.items.map((tech: { icon: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; name: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; description: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; }, techIndex: number) => (
            <motion.div
              key={`tech-item-${index}-${techIndex}`}
              initial={{ x: -10, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.1 * techIndex + 0.2 * index,
              }}
              viewport={{ once: true }}
              className="flex items-center group"
            >
              <div className="w-7 h-7 border border-white/20 flex items-center justify-center mr-3 group-hover:border-purple-500/50 transition-colors">
                <span>{tech.icon}</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white/90">
                  {tech.name}
                </h4>
                <p className="text-xs text-white/60">
                  {tech.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// FAQ Item Component
const FAQItem = ({ faq, index, isOpen, toggleFaq }: { faq: any, index: number, isOpen: boolean, toggleFaq: Function }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="border border-white/30 p-0.5 overflow-hidden"
    >
      <div className="border border-white/10">
        <div 
          className="px-5 py-4 border-b border-white/10 flex justify-between items-center cursor-pointer"
          onClick={() => toggleFaq(index)}
        >
          <h4 className="text-sm font-mono uppercase">
            {faq.question}
          </h4>
          <div className="text-white/60">
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
        
        {isOpen && (
          <div className="p-5">
            <p className="text-white/70 text-sm leading-relaxed">
              {faq.answer}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Section Header Component
const SectionHeader = ({ title, subtitle }: { title: string, subtitle: string }) => {
  return (
    <div className="mb-8">
      <h2 className="text-6xl font-light mb-4">{title}</h2>
      <p className="text-white/70 uppercase">{subtitle}</p>
    </div>
  );
};

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("mission");
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  const aboutRef = useRef(null);
  const missionRef = useRef(null);
  const teamRef = useRef(null);
  const techRef = useRef(null);
  const faqRef = useRef(null);

  const toggleFaq = (index: SetStateAction<null>) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  useEffect(() => {
    setMounted(true);

    // Set up scroll spy
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveSection(id);
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = [aboutRef, missionRef, teamRef, techRef, faqRef];

    sections.forEach((section) => {
      if (section.current) {
        observer.observe(section.current);
      }
    });

    return () => {
      sections.forEach((section) => {
        if (section.current) {
          observer.unobserve(section.current);
        }
      });
    };
  }, [mounted]);

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

  const team = [
    {
      alias: "Panacea",
      name: "Le Truong Thien Nguyen",
      role: "AI Engineer & Frontend Developer",
      bio: "AI specialist with expertise in neural networks and modern frontend development with React and Three.js.",
      image: "/Panacea.png",
      social: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
      },
    },
    {
      alias: "Menhmenh",
      name: "Minh Phuong Anh Mai",
      role: "AI Engineer",
      bio: "Machine learning researcher focusing on natural language processing and computer vision for blockchain applications.",
      image: "/Menhmenh.png",
      social: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
      },
    },
    {
      alias: "Lindsay",
      name: "Ngoc Huyen Truong",
      role: "Blockchain Specialist",
      bio: "Smart contract developer and cryptographic systems expert with experience across Solana, Ethereum, and Layer 2 solutions.",
      image: "/Lindsay.png",
      social: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
      },
    },
  ];

  // Tech stack categories
  const technologies = [
    {
      category: "Frontend",
      items: [
        { name: "React", icon: "⚛️", description: "Core UI library" },
        { name: "Next.js", icon: "▲", description: "React framework" },
        { name: "Three.js", icon: "🔮", description: "3D visualizations" },
        { name: "Framer Motion", icon: "🔄", description: "Animations" },
        { name: "Tailwind CSS", icon: "🎨", description: "Styling" },
      ],
    },
    {
      category: "AI & Backend",
      items: [
        { name: "TensorFlow", icon: "🧠", description: "ML framework" },
        { name: "PyTorch", icon: "🔥", description: "Deep learning" },
        { name: "OpenAI API", icon: "🤖", description: "NLP capabilities" },
        { name: "FastAPI", icon: "⚡", description: "API framework" },
        { name: "Node.js", icon: "📦", description: "Server runtime" },
      ],
    },
    {
      category: "Blockchain",
      items: [
        { name: "Solana", icon: "☀️", description: "Primary chain" },
        { name: "Ethereum", icon: "💎", description: "Support chain" },
        { name: "Web3.js", icon: "🕸️", description: "Blockchain interaction" },
        { name: "Anchor", icon: "⚓", description: "Solana framework" },
        { name: "The Graph", icon: "📊", description: "Data indexing" },
      ],
    },
  ];

  // Mission statements
  const mission = [
    {
      icon: <CheckCircle2 className="w-5 h-5 text-purple-400" />,
      title: "Accessibility",
      description:
        "Making blockchain data intuitive and accessible to everyone regardless of technical expertise.",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      title: "Intelligence",
      description:
        "Using advanced AI to analyze blockchain data and provide personalized insights and recommendations.",
    },
    {
      icon: <Info className="w-5 h-5 text-purple-400" />,
      title: "Expression",
      description:
        "Creating unique visual identities that represent users' on-chain activity and crypto persona.",
    },
  ];

  // FAQ items
  const faqItems = [
    {
      question: "What is NOVA?",
      answer:
        "NOVA is a multi-agent AI platform that transforms Web3 wallets into smart, visual identities. It analyzes on-chain data to provide insights and creates a personalized visual identity for your wallet.",
    },
    {
      question: "Which blockchains does NOVA support?",
      answer:
        "Currently, NOVA supports Solana as our primary blockchain, with plans to expand to Ethereum and other major chains in upcoming releases.",
    },
    {
      question: "How does NOVA protect user privacy?",
      answer:
        "NOVA is designed with privacy at its core. While we analyze on-chain data, which is public by nature, we implement advanced encryption for any personal settings or preferences you create within the platform.",
    },
    {
      question: "Is NOVA open source?",
      answer:
        "Parts of NOVA are open source, particularly our core visualization libraries and blockchain connectors. Our proprietary AI models and identity generation systems are currently closed source.",
    },
    {
      question: "How can I get early access to NOVA?",
      answer:
        "You can join our waitlist by signing up on our homepage. Early access invitations are being rolled out gradually, with priority given to active community members and blockchain early adopters.",
    },
  ];

  return (
    <main className="relative min-h-screen bg-black text-white font-mono">
      {/* Fixed background */}
      <div className="fixed inset-0 bg-black z-0" />
      
      {/* Minimal grid background */}
      <div
        className="fixed inset-0 opacity-10 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(138, 75, 255, 0.05) 1px, transparent 1px), linear-gradient(to right, rgba(138, 75, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Navigation */}
      <Navigation />

      <div className="container mx-auto px-2 pt-24 pb-16 relative z-10">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <section 
            id="about" 
            ref={aboutRef}
            className="min-h-[80vh] mb-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-8xl font-light mb-8">ABOUT</h1>
              
              <div className="border border-white/30 p-0.5 mb-8">
                <div className="border border-white/10 px-6 py-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <p className="text-white/70 uppercase mb-6">
                        N.OVA TRANSFORMS ANY WEB3 WALLET INTO A SMART, VISUAL, AND
                        CONVERSATIONAL IDENTITY THAT EMPOWERS USERS TO TRULY
                        UNDERSTAND AND LEVERAGE THEIR ON-CHAIN DATA.
                      </p>
                      <p className="text-white/70 uppercase mb-10">
                        OUR MULTI-AGENT AI SYSTEM ANALYZES YOUR CRYPTO PRESENCE AND
                        PROVIDES ACTIONABLE INSIGHTS THROUGH AN INTUITIVE INTERFACE
                        THAT MAKES BLOCKCHAIN DATA ACCESSIBLE TO EVERYONE.
                      </p>
                      
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "120px" }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                        viewport={{ once: true }}
                        className="h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-8"
                      />
                      
                      <a
                        href="#mission"
                        className="group flex items-center mt-4 hover:text-purple-400 transition-colors"
                      >
                        <span className="uppercase mr-2">Discover Our Mission</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                    
                    <div className="h-[40vh]">
                      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                        <HolographicSphere />
                        <Environment preset="night" />
                      </Canvas>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 w-full gap-0">
                <div className="border border-white/30 p-0.5">
                  <div className="border border-white/10 p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-white/50 text-xs">
                        ACCESSIBILITY
                      </div>
                      <div className="text-lg font-light">Cross-Platform</div>
                    </div>
                  </div>
                </div>

                <div className="border border-white/30 p-0.5">
                  <div className="border border-white/10 p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/30 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white/50 text-xs">AI-POWERED</div>
                      <div className="text-lg font-light">Multi-Agent System</div>
                    </div>
                  </div>
                </div>

                <div className="border border-white/30 p-0.5">
                  <div className="border border-white/10 p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white/50 text-xs">COMMUNITY</div>
                      <div className="text-lg font-light">User-Driven</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Mission Section */}
          <section
            id="mission"
            ref={missionRef}
            className="mb-16"
          >
            <div className="border border-white/30 p-0.5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="border border-white/10 px-6 py-8"
              >
                <SectionHeader 
                  title="Mission" 
                  subtitle="OUR PURPOSE AND VISION FOR THE FUTURE OF WEB3 IDENTITY"
                />

                <div className="grid grid-cols-3 gap-0 mb-8">
                  {mission.map((item, index) => (
                    <motion.div 
                      key={`mission-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.3 + index * 0.2 }}
                      viewport={{ once: true }}
                      className="border border-white/30 p-0.5"
                    >
                      <div className="border border-white/10 p-6 h-full flex flex-col">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 border border-white/20 flex items-center justify-center">
                            {item.icon}
                          </div>
                          <h3 className="text-xl font-light">{item.title}</h3>
                        </div>
                        <p className="text-white/70 text-sm">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Vision Statement */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.7 }}
                  viewport={{ once: true }}
                  className="border border-white/30 p-0.5 mt-12"
                >
                  <div className="border border-white/10 p-6 text-center">
                    <h3 className="text-2xl font-light mb-4">Our Vision</h3>
                    <p className="text-xl text-white/90 italic font-light">
                      "A world where blockchain technology is accessible to everyone, not just the technically savvy, 
                      through intuitive interfaces powered by intelligent AI systems."
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Team Section */}
          <section
            id="team"
            ref={teamRef}
            className="mb-16"
          >
            <div className="border border-white/30 p-0.5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="border border-white/10 px-6 py-8"
              >
                <SectionHeader 
                  title="Team" 
                  subtitle="THE BUILDERS BEHIND THE NOVA ECOSYSTEM"
                />
                
                <div className="grid grid-cols-3 gap-0">
                  {team.map((member, index) => (
                    <TeamMember 
                      key={`team-${index}`} 
                      member={member} 
                      index={index} 
                    />
                  ))}
                </div>
                
                {/* CTA Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.7 }}
                  viewport={{ once: true }}
                  className="border border-white/30 p-0.5 mt-8"
                >
                  <div className="border border-white/10 p-6 flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-2xl font-light mb-2">Join Our Team</h3>
                      <p className="text-white/70 text-sm">
                        We're expanding our team of blockchain and AI innovators
                      </p>
                    </div>
                    
                    <a
                      href="#"
                      className="border border-white/30 bg-white/5 hover:bg-white/10 px-4 py-3 text-sm uppercase transition-colors flex items-center space-x-2"
                    >
                      <span>View Open Positions</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Technology Section */}
          <section
            id="tech"
            ref={techRef}
            className="mb-16"
          >
            <div className="border border-white/30 p-0.5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="border border-white/10 px-6 py-8"
              >
                <SectionHeader 
                  title="Technology" 
                  subtitle="THE TOOLS AND FRAMEWORKS POWERING OUR PLATFORM"
                />
                
                <div className="grid grid-cols-3 gap-0">
                  {technologies.map((category, index) => (
                    <TechnologyBox 
                      key={`tech-${index}`} 
                      category={category} 
                      items={category.items} 
                      index={index} 
                    />
                  ))}
                </div>
                
                {/* Feature Highlight */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.7 }}
                  viewport={{ once: true }}
                  className="border border-white/30 p-0.5 mt-8"
                >
                  <div className="border border-white/10 p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-2xl font-light mb-4">Multi-Agent Intelligence</h3>
                      <p className="text-white/70 text-sm mb-4">
                        Our system employs multiple AI agents that work together to analyze 
                        blockchain data, identify patterns, and deliver personalized insights to users.
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-white/70 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></div>
                          <span>Data Collection Agent</span>
                        </div>
                        <div className="flex items-center text-white/70 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></div>
                          <span>Analysis Agent</span>
                        </div>
                        <div className="flex items-center text-white/70 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></div>
                          <span>Visualization Agent</span>
                        </div>
                        <div className="flex items-center text-white/70 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></div>
                          <span>Interaction Agent</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-white/10 p-4 bg-black/20 font-mono text-xs text-white/70">
                      <div className="mb-2 text-purple-400">
                        // Multi-Agent System
                      </div>
                      <div className="space-y-1">
                        <div>
                          <span className="text-blue-400">class</span>{" "}
                          <span className="text-yellow-400">
                            AgentCoordinator
                          </span>{" "}
                          {`{`}
                        </div>
                        <div>
                          &nbsp;&nbsp;
                          <span className="text-green-400">constructor</span>
                          (config) {`{`}
                        </div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;this.agents = [];</div>
                        <div>&nbsp;&nbsp;{`}`}</div>
                        <div>&nbsp;</div>
                        <div>
                          &nbsp;&nbsp;
                          <span className="text-green-400">async</span>{" "}
                          analyze(walletData) {`{`}
                        </div>
                        <div>
                          &nbsp;&nbsp;&nbsp;&nbsp;
                          <span className="text-blue-400">const</span> results ={" "}
                          {};
                        </div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;...</div>
                        <div>
                          &nbsp;&nbsp;&nbsp;&nbsp;
                          <span className="text-blue-400">return</span>{" "}
                          this.synthesize(results);
                        </div>
                        <div>&nbsp;&nbsp;{`}`}</div>
                        <div>{`}`}</div>
                      </div>
                      
                      <div className="mt-2 flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                        <span className="text-[10px] text-green-400">
                          SYSTEM ONLINE
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>
          
          {/* FAQ Section */}
          <section
            id="faq"
            ref={faqRef}
            className="mb-16"
          >
            <div className="border border-white/30 p-0.5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="border border-white/10 px-6 py-8"
              >
                <SectionHeader 
                  title="FAQ" 
                  subtitle="COMMON QUESTIONS ABOUT THE NOVA PLATFORM"
                />
                
                <div className="space-y-0">
                  {faqItems.map((faq, index) => (
                    <FAQItem 
                      key={`faq-${index}`} 
                      faq={faq} 
                      index={index} 
                      isOpen={expandedFaq === index}
                      toggleFaq={toggleFaq}
                    />
                  ))}
                </div>
                
                {/* Early Access */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.7 }}
                  viewport={{ once: true }}
                  className="border border-white/30 p-0.5 mt-12"
                >
                  <div className="border border-white/10 p-8 text-center">
                    <h3 className="text-3xl font-light mb-4">Join The NOVA Evolution</h3>
                    <p className="text-white/70 text-sm max-w-2xl mx-auto mb-6">
                      Be part of our journey as we redefine how users interact with blockchain technology. 
                      Sign up for early access and help shape the future of NOVA.
                    </p>
                    
                    <button className="bg-white text-black px-6 py-3 uppercase hover:bg-white/90 transition-colors">
                      GET EARLY ACCESS
                    </button>
                    
                    <div className="mt-6 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></div>
                      <span className="text-xs text-white/60 uppercase">
                        Limited Spots Available
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <Footer />
      
      {/* CSS for hiding scrollbars while maintaining scroll functionality */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>
    </main>
  );
}