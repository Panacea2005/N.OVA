"use client";

import { useEffect, useState, useRef, SetStateAction, Suspense } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { Environment, useGLTF, useTexture } from "@react-three/drei";
import {
  ArrowRight,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import * as THREE from "three";

// Dynamically import components to reduce initial load time
const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
});

const Footer = dynamic(() => import("@/components/footer"), {
  ssr: false,
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

// Custom Team Member Image with Futuristic Effects
interface TeamMemberImageProps {
  image: string;
  alias: string;
}

const TeamMemberImage = ({ image, alias }: TeamMemberImageProps) => {
  return (
    <div className="relative aspect-square overflow-hidden border border-white/10 group-hover:border-purple-500/50 transition-colors duration-300">
      {/* Base image with futuristic filter effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/30 to-black/80 mix-blend-multiply z-10"></div>

      <img
        src={image}
        alt={alias}
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
      />

      {/* Futuristic overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>

      {/* Scan line effect */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent z-30"
        animate={{
          top: ["0%", "100%"],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Digital noise overlay */}
      <div className="absolute inset-0 opacity-30 mix-blend-overlay z-20 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" opacity="0.4" />
        </svg>
      </div>

      {/* Tech grid overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none z-20"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(167, 139, 250, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(167, 139, 250, 0.1) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* Hexagonal pattern overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none z-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5.61l21.2 12.25v24.5L30 54.61 8.8 42.36v-24.5L30 5.62m0-3.25l-24 13.86v27.71l24 13.86 24-13.86V16.22L30 2.37z' fill='%23a78bfa' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: "30px 30px",
        }}
      ></div>

      {/* Top interface elements */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-2 z-30">
        <div className="text-xs font-mono text-purple-300 bg-black/50 px-2 py-1 rounded-sm">
          ID:{Math.floor(Math.random() * 9000) + 1000}
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-purple-300 opacity-60"></div>
        </div>
      </div>

      {/* Bottom data indicators */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm py-2 px-3 z-30 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex justify-between items-center">
          <div className="text-xs font-mono text-purple-300">{alias}</div>
          <div className="text-xs font-mono text-white/60">ACTIVE</div>
        </div>
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mt-1"></div>
      </div>
    </div>
  );
};

// Data visualization component
const TechStackVisualizer = () => {
  const meshRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (meshRef.current) {
      const interval = setInterval(() => {
        if (meshRef.current) {
          meshRef.current.rotation.y += 0.003;
        }
      }, 16);
      return () => clearInterval(interval);
    }
  }, []);

  const technologies: {
    name: string;
    color: string;
    position: [number, number, number];
  }[] = [
    { name: "React", color: "#61DAFB", position: [2, 0, 0] },
    { name: "Web3", color: "#F16822", position: [-1, 1.5, 1] },
    { name: "AI", color: "#a78bfa", position: [0, -2, -1] },
    { name: "NextJS", color: "#FFFFFF", position: [-2, 0, 0] },
    { name: "Solana", color: "#14F195", position: [1, -1.5, 1] },
    { name: "Python", color: "#FFDE57", position: [0, 2, -1] },
    { name: "TensorFlow", color: "#FF6F00", position: [1, 1, 2] },
    { name: "TypeScript", color: "#007ACC", position: [-1, -1, 2] },
  ];

  return (
    <group ref={meshRef}>
      {technologies.map((tech, index) => (
        <group key={index} position={tech.position}>
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial
              color={tech.color}
              emissive={tech.color}
              emissiveIntensity={0.5}
              roughness={0.2}
            />
          </mesh>
          <line>
            <bufferGeometry
              attach="geometry"
              onUpdate={(self) => {
                const points = [
                  new THREE.Vector3(0, 0, 0),
                  new THREE.Vector3(0, 0, 0).sub(
                    new THREE.Vector3(...tech.position)
                  ),
                ];
                self.setFromPoints(points);
              }}
            />
            <lineBasicMaterial
              attach="material"
              color={tech.color}
              opacity={0.7}
              transparent
            />
          </line>
        </group>
      ))}
    </group>
  );
};

// Gradient text component for consistent styling
const GradientText: React.FC<{
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}> = ({
  children,
  className,
  gradient = "from-white via-white to-purple-200",
}) => (
  <span
    className={`bg-clip-text text-transparent bg-gradient-to-r ${gradient} ${
      className || ""
    }`}
  >
    {children}
  </span>
);

export default function AboutPage() {
  const [cursorVariant, setCursorVariant] = useState("default");
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("mission");
  const aboutRef = useRef(null);
  const missionRef = useRef(null);
  const teamRef = useRef(null);
  const techRef = useRef(null);
  const journeyRef = useRef(null);

  // FAQ State
  const [expandedFaq, setExpandedFaq] = useState(null);

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

    const sections = [aboutRef, missionRef, teamRef, techRef, journeyRef];

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

  if (!mounted) return null;

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

  return (
    <main className="relative min-h-screen bg-black text-white font-mono">
      {/* Removed custom cursor */}

      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-purple-950 opacity-80 z-0" />

      {/* Animated grid background */}
      <div
        className="fixed inset-0 opacity-20 z-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(138, 75, 255, 0.15) 1px, transparent 1px), linear-gradient(to right, rgba(138, 75, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px, 40px 40px",
          backgroundPosition: "0 0, 0 0",
        }}
      />

      {/* Animated scan lines */}
      <div className="fixed inset-0 overflow-hidden opacity-10 pointer-events-none z-0">
        {Array(10)
          .fill(0)
          .map((_, i) => (
            <motion.div
              key={`scan-${i}`}
              className="absolute w-full h-[1px] bg-purple-400/30"
              style={{ top: `${i * 10}%` }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scaleY: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + (i % 3),
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
      </div>

      {/* Particle Background */}
      <ParticleBackground />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="relative z-10 pt-20">
        {/* Hero Section */}
        <section
          id="about"
          ref={aboutRef}
          className="min-h-[100vh] flex flex-col justify-center relative border-b border-white/10"
        >
          <div className="container mx-auto px-4 md:px-6 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="flex flex-col"
                >
                  <div className="mb-8 inline-flex items-center">
                    <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mr-4"></div>
                    <span className="text-sm uppercase tracking-[0.3em] text-purple-400 font-light">
                      Our Story
                    </span>
                  </div>

                  <h1 className="text-[5rem] md:text-[7rem] font-bold tracking-tighter leading-none mb-8">
                    <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
                      THE
                    </span>
                    <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-white to-purple-300">
                      NOVA
                    </span>
                    <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white/60 via-white to-white">
                      VISION
                    </span>
                  </h1>

                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "120px" }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                    viewport={{ once: true }}
                    className="h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-8"
                  />

                  <p className="text-xl text-white/70 mb-6">
                    NOVA transforms any Web3 wallet into a smart, visual, and
                    conversational identity that empowers users to truly
                    understand and leverage their on-chain data.
                  </p>

                  <p className="text-xl text-white/70 mb-10">
                    Our multi-agent AI system analyzes your crypto presence and
                    provides actionable insights through an intuitive interface
                    that makes blockchain data accessible to everyone.
                  </p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    viewport={{ once: true }}
                  >
                    <a
                      href="#mission"
                      className="group relative inline-flex items-center font-medium"
                      onMouseEnter={() => setCursorVariant("hover")}
                      onMouseLeave={() => setCursorVariant("default")}
                    >
                      <span className="mr-4 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-purple-400 after:origin-left after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:duration-300">
                        DISCOVER OUR MISSION
                      </span>
                      <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center overflow-hidden group-hover:border-purple-400 transition-colors duration-300">
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </a>
                  </motion.div>
                </motion.div>
              </div>

              <div className="h-[60vh] relative">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                  <Suspense fallback={null}>
                    <HolographicSphere />
                    <Environment preset="night" />
                  </Suspense>
                </Canvas>

                {/* Animated overlays */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  {/* Futuristic grid lines */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-purple-500/70 to-transparent"></div>
                    <div className="absolute top-1/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
                    <div className="absolute top-2/3 left-0 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>

                    <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-purple-500/50 to-transparent"></div>
                    <div className="absolute top-0 left-1/3 w-[1px] h-3/4 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"></div>
                    <div className="absolute top-0 left-2/3 w-[1px] h-1/2 bg-gradient-to-b from-transparent via-purple-500/70 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-purple-500/40 to-transparent"></div>
                  </div>

                  {/* Code snippets */}
                  <div className="absolute bottom-10 left-0 text-[10px] font-mono text-white/40 opacity-60">
                    <div>// nova.analyze(wallet)</div>
                    <div>// visualize.render(insights)</div>
                    <div>// agent.connect(solana.mainnet)</div>
                  </div>

                  <div className="absolute top-10 right-0 text-[10px] font-mono text-white/40 text-right opacity-60">
                    <div>// identity.generate()</div>
                    <div>// dashboard.update()</div>
                    <div>// ml.predict(trends)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-4 backdrop-blur-sm">
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-xs text-white/60 mr-2">01:1</span>
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2 animate-pulse"></div>
                <span className="text-xs text-white/60 uppercase tracking-wider">
                  ABOUT NOVA
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-[1px] bg-gradient-to-r from-purple-500/40 to-transparent mr-3"></div>
                <span className="text-xs text-white/60 font-mono">
                  INNOVATING THE FUTURE OF WEB3 IDENTITY
                </span>
              </div>
            </div>
          </div>

          {/* Corner borders */}
          <div className="absolute top-0 left-0 w-[100px] h-[100px] border-l border-t border-white/10"></div>
          <div className="absolute top-0 right-0 w-[100px] h-[100px] border-r border-t border-white/10"></div>
          <div className="absolute bottom-0 left-0 w-[100px] h-[100px] border-l border-b border-white/10"></div>
          <div className="absolute bottom-0 right-0 w-[100px] h-[100px] border-r border-b border-white/10"></div>
        </section>

        {/* Mission Section */}
        <section
          id="mission"
          ref={missionRef}
          className="min-h-screen flex flex-col justify-center relative border-b border-white/10 py-20"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-16 text-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center justify-center"
                >
                  <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mr-4"></div>
                  <span className="text-sm uppercase tracking-[0.3em] text-purple-400 font-light">
                    Our Purpose
                  </span>
                  <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent ml-4"></div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  className="text-[3.5rem] md:text-[5rem] font-bold tracking-tighter mt-6 mb-8"
                >
                  <GradientText gradient="from-purple-300 via-white to-purple-300">
                    OUR MISSION
                  </GradientText>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto"
                >
                  We're building the bridge between complex blockchain data and
                  human understanding through AI-powered insights and
                  visualizations.
                </motion.p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20">
                {[
                  {
                    icon: (
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="24"
                          cy="24"
                          r="10"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M24 14V34"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M14 24H34"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="18"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                          strokeOpacity="0.3"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="23"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                          strokeOpacity="0.1"
                        />
                      </svg>
                    ),
                    title: "Accessibility",
                    description:
                      "Making blockchain data intuitive and accessible to everyone regardless of technical expertise.",
                    delay: 0.3,
                  },
                  {
                    icon: (
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="14"
                          y="14"
                          width="20"
                          height="20"
                          rx="2"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M14 22H34"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M22 34V22"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                        />
                        <circle cx="18" cy="18" r="2" fill="#4C1D95" />
                        <path
                          d="M24 6V10"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeOpacity="0.5"
                        />
                        <path
                          d="M34 6L31 10"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeOpacity="0.5"
                        />
                        <path
                          d="M42 16L38 19"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeOpacity="0.5"
                        />
                        <path
                          d="M42 32L38 29"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeOpacity="0.5"
                        />
                        <path
                          d="M34 42L31 38"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeOpacity="0.5"
                        />
                        <path
                          d="M24 42V38"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeOpacity="0.5"
                        />
                        <path
                          d="M14 42L17 38"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeOpacity="0.5"
                        />
                        <path
                          d="M6 32L10 29"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeOpacity="0.5"
                        />
                        <path
                          d="M6 16L10 19"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeOpacity="0.5"
                        />
                        <path
                          d="M14 6L17 10"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeOpacity="0.5"
                        />
                      </svg>
                    ),
                    title: "Intelligence",
                    description:
                      "Using advanced AI to analyze blockchain data and provide personalized insights and recommendations.",
                    delay: 0.5,
                  },
                  {
                    icon: (
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 16L24 6L38 16V32L24 42L10 32V16Z"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M24 6V42"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                          strokeOpacity="0.5"
                        />
                        <path
                          d="M10 16L38 32"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                          strokeOpacity="0.5"
                        />
                        <path
                          d="M38 16L10 32"
                          stroke="#a78bfa"
                          strokeWidth="1.5"
                          strokeOpacity="0.5"
                        />
                        <circle
                          cx="24"
                          cy="6"
                          r="2"
                          fill="#4C1D95"
                          stroke="#a78bfa"
                          strokeWidth="1"
                        />
                        <circle
                          cx="10"
                          cy="16"
                          r="2"
                          fill="#4C1D95"
                          stroke="#a78bfa"
                          strokeWidth="1"
                        />
                        <circle
                          cx="10"
                          cy="32"
                          r="2"
                          fill="#4C1D95"
                          stroke="#a78bfa"
                          strokeWidth="1"
                        />
                        <circle
                          cx="24"
                          cy="42"
                          r="2"
                          fill="#4C1D95"
                          stroke="#a78bfa"
                          strokeWidth="1"
                        />
                        <circle
                          cx="38"
                          cy="32"
                          r="2"
                          fill="#4C1D95"
                          stroke="#a78bfa"
                          strokeWidth="1"
                        />
                        <circle
                          cx="38"
                          cy="16"
                          r="2"
                          fill="#4C1D95"
                          stroke="#a78bfa"
                          strokeWidth="1"
                        />
                      </svg>
                    ),
                    title: "Expression",
                    description:
                      "Creating unique visual identities that represent users' on-chain activity and crypto persona.",
                    delay: 0.7,
                  },
                ].map((item, index) => (
                  <motion.div
                    key={`mission-${index}`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: item.delay }}
                    viewport={{ once: true }}
                    whileHover={{ y: -10 }}
                    className="flex flex-col items-center p-8 bg-black/20 backdrop-blur-sm border border-white/5 rounded-sm group hover:border-purple-500/30 transition-all duration-300"
                  >
                    {/* Top edge highlight */}
                    <motion.div
                      className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
                      initial={{ opacity: 0, scaleX: 0 }}
                      whileInView={{ opacity: 1, scaleX: 1 }}
                      transition={{ duration: 1, delay: item.delay + 0.3 }}
                      viewport={{ once: true }}
                    />

                    <div className="mb-6">{item.icon}</div>

                    <h3 className="text-2xl font-semibold mb-4 text-purple-300 text-center">
                      {item.title}
                    </h3>

                    <p className="text-white/70 text-center leading-relaxed">
                      {item.description}
                    </p>

                    {/* Bottom edge highlight */}
                    <motion.div
                      className="absolute bottom-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
                      initial={{ opacity: 0, scaleX: 0 }}
                      whileInView={{ opacity: 1, scaleX: 1 }}
                      transition={{ duration: 1, delay: item.delay + 0.3 }}
                      viewport={{ once: true }}
                    />

                    {/* Hover glow effect */}
                    <motion.div
                      className="absolute -inset-0.5 -z-10 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"
                      style={{
                        background:
                          "radial-gradient(circle at center, rgba(139, 92, 246, 0.8) 0%, transparent 70%)",
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Vision statement */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                viewport={{ once: true }}
                className="mt-24 max-w-4xl mx-auto text-center relative bg-black/30 backdrop-blur-sm border border-white/10 p-10 rounded-sm"
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black px-6 py-2 border border-white/10">
                  <span className="text-sm uppercase tracking-[0.2em] text-purple-400">
                    Our Vision
                  </span>
                </div>

                <p className="text-2xl md:text-3xl text-white/90 italic font-light leading-relaxed">
                  "A world where blockchain technology is{" "}
                  <GradientText>accessible to everyone</GradientText>, not just
                  the technically savvy, through intuitive interfaces powered by{" "}
                  <GradientText>intelligent AI systems</GradientText>."
                </p>

                <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-8" />
              </motion.div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-4 backdrop-blur-sm">
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-xs text-white/60 mr-2">01:2</span>
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2 animate-pulse"></div>
                <span className="text-xs text-white/60 uppercase tracking-wider">
                  MISSION
                </span>
              </div>
              <div className="flex items-center">
                <motion.div
                  animate={{
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <span className="text-xs text-white/60 font-mono">
                    BRIDGING BLOCKCHAIN AND HUMAN UNDERSTANDING
                  </span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Corner borders */}
          <div className="absolute top-0 left-0 w-[100px] h-[100px] border-l border-t border-white/10"></div>
          <div className="absolute top-0 right-0 w-[100px] h-[100px] border-r border-t border-white/10"></div>
          <div className="absolute bottom-0 left-0 w-[100px] h-[100px] border-l border-b border-white/10"></div>
          <div className="absolute bottom-0 right-0 w-[100px] h-[100px] border-r border-b border-white/10"></div>
        </section>

        {/* Team Section with 3D elements */}
        <section
          id="team"
          ref={teamRef}
          className="min-h-screen py-20 relative border-b border-white/10"
        >
          <div className="container mx-auto px-4 md:px-6 relative">
            <div className="mb-16 text-center">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-flex items-center justify-center"
              >
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mr-4"></div>
                <span className="text-sm uppercase tracking-[0.3em] text-purple-400 font-light">
                  The Builders
                </span>
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent ml-4"></div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="text-[3.5rem] md:text-[5rem] font-bold tracking-tighter mt-6 mb-8"
              >
                <GradientText gradient="from-purple-300 via-white to-purple-300">
                  OUR TEAM
                </GradientText>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto"
              >
                A dedicated group of innovators at the intersection of AI,
                blockchain, and human experience.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20">
              {team.map((member, index) => (
                <motion.div
                  key={`team-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 * index }}
                  viewport={{ once: true }}
                  className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-sm overflow-hidden group"
                  onMouseEnter={() => setCursorVariant("hover")}
                  onMouseLeave={() => setCursorVariant("default")}
                >
                  {/* Animated border effects */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                  <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-transparent via-purple-500/50 to-transparent"></div>
                  <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-transparent via-purple-500/50 to-transparent"></div>

                  <div className="aspect-square overflow-hidden relative">
                    {/* Futuristic 2D team member image with effects */}
                    <TeamMemberImage
                      image={member.image}
                      alias={member.alias}
                    />

                    {/* Member information overlay - appears on hover */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 py-4 px-6 text-center bg-black/60 backdrop-blur-sm transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                      initial={{ y: 0 }}
                      whileInView={{ y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
                      viewport={{ once: true }}
                    >
                      <h3 className="text-2xl font-bold text-purple-300 mb-1">
                        {member.alias}
                      </h3>
                      <p className="text-white/90 text-lg mb-1">
                        {member.name}
                      </p>
                      <p className="text-purple-400/80 text-sm mb-4">
                        {member.role}
                      </p>

                      <div className="flex justify-center space-x-4">
                        <a
                          href={member.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/70 hover:text-purple-400 transition-colors"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                        <a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/70 hover:text-purple-400 transition-colors"
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                        <a
                          href={member.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/70 hover:text-purple-400 transition-colors"
                        >
                          <Twitter className="w-5 h-5" />
                        </a>
                      </div>
                    </motion.div>
                  </div>

                  <div className="p-6">
                    <p className="text-white/80 text-sm leading-relaxed">
                      {member.bio}
                    </p>

                    <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                      <div className="text-xs text-white/60 font-mono uppercase tracking-wider">
                        {member.role}
                      </div>
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Banner */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              className="mt-24 max-w-5xl mx-auto relative bg-black/40 backdrop-blur-sm border border-white/10 p-10 rounded-sm overflow-hidden"
            >
              <div className="absolute inset-0 opacity-30">
                <Canvas>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <ParticleRing />
                </Canvas>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0">
                  <h4 className="text-2xl font-bold mb-2 text-white">
                    Join Our Team
                  </h4>
                  <p className="text-white/70">
                    We're expanding our team of blockchain and AI innovators
                  </p>
                </div>

                <a
                  href="#"
                  className="group relative inline-flex items-center bg-black/50 border border-purple-500/50 px-6 py-3 rounded-sm overflow-hidden"
                >
                  <span className="relative z-10 font-medium mr-2">
                    View Open Positions
                  </span>
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />

                  {/* Light scan effect */}
                  <motion.div className="absolute top-0 -right-40 w-32 h-full bg-white transform rotate-12 translate-x-0 -translate-y-0 opacity-20 group-hover:translate-x-80 transition-transform duration-1000" />
                </a>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-4 backdrop-blur-sm">
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-xs text-white/60 mr-2">01:3</span>
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2 animate-pulse"></div>
                <span className="text-xs text-white/60 uppercase tracking-wider">
                  TEAM
                </span>
              </div>
              <div className="flex items-center">
                <motion.div
                  animate={{
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <span className="text-xs text-white/60 font-mono">
                    AI ENGINEERS & BLOCKCHAIN SPECIALISTS
                  </span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Corner borders */}
          <div className="absolute top-0 left-0 w-[100px] h-[100px] border-l border-t border-white/10"></div>
          <div className="absolute top-0 right-0 w-[100px] h-[100px] border-r border-t border-white/10"></div>
          <div className="absolute bottom-0 left-0 w-[100px] h-[100px] border-l border-b border-white/10"></div>
          <div className="absolute bottom-0 right-0 w-[100px] h-[100px] border-r border-b border-white/10"></div>
        </section>

        {/* Technology Stack Section */}
        <section
          id="tech"
          ref={techRef}
          className="min-h-screen py-20 relative border-b border-white/10"
        >
          <div className="container mx-auto px-4 md:px-6 relative">
            <div className="mb-16 text-center">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-flex items-center justify-center"
              >
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mr-4"></div>
                <span className="text-sm uppercase tracking-[0.3em] text-purple-400 font-light">
                  Our Tools
                </span>
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent ml-4"></div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="text-[3.5rem] md:text-[5rem] font-bold tracking-tighter mt-6 mb-8"
              >
                <GradientText gradient="from-purple-300 via-white to-purple-300">
                  TECHNOLOGY
                </GradientText>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto"
              >
                A powerful combination of cutting-edge technologies that deliver
                intelligent insights and beautiful visuals.
              </motion.p>
            </div>

            {/* 3D Tech Stack Visualization */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="h-[50vh] mb-20"
            >
              <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <TechStackVisualizer />
                <Environment preset="city" />
              </Canvas>
            </motion.div>

            {/* Technology Stack Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {technologies.map((category, catIndex) => (
                <motion.div
                  key={`tech-${catIndex}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 * catIndex }}
                  viewport={{ once: true }}
                  className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-sm overflow-hidden"
                >
                  {/* Category title */}
                  <div className="relative border-b border-white/10 p-6">
                    <h3 className="text-2xl font-bold text-purple-300">
                      {category.category}
                    </h3>
                    <div className="absolute bottom-0 left-0 w-1/3 h-[1px] bg-gradient-to-r from-purple-500 to-transparent"></div>
                  </div>

                  {/* Technology list */}
                  <div className="p-6 space-y-4">
                    {category.items.map((tech, techIndex) => (
                      <motion.div
                        key={`tech-item-${catIndex}-${techIndex}`}
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.1 * techIndex + 0.3 * catIndex,
                        }}
                        viewport={{ once: true }}
                        className="flex items-center group"
                      >
                        <div className="w-8 h-8 rounded-full bg-black/50 border border-purple-500/30 flex items-center justify-center mr-4 group-hover:border-purple-500 transition-colors">
                          <span>{tech.icon}</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-white/90">
                            {tech.name}
                          </h4>
                          <p className="text-sm text-white/60">
                            {tech.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 p-2 text-[10px] text-white/40 font-mono opacity-60">
                    <div>// {category.category.toLowerCase()}.init()</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature Highlight */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              className="mt-24 max-w-5xl mx-auto relative bg-black/40 backdrop-blur-sm border border-white/10 p-10 rounded-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h4 className="text-2xl font-bold mb-4 text-purple-300">
                    Multi-Agent Intelligence
                  </h4>
                  <p className="text-white/80 mb-6 leading-relaxed">
                    Our system employs multiple AI agents that work in concert
                    to analyze blockchain data, identify patterns, and deliver
                    personalized insights to users.
                  </p>

                  <ul className="space-y-2">
                    {[
                      "Data Collection Agent",
                      "Analysis Agent",
                      "Visualization Agent",
                      "Interaction Agent",
                    ].map((agent, idx) => (
                      <motion.li
                        key={`agent-${idx}`}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 * idx }}
                        viewport={{ once: true }}
                        className="flex items-center text-white/70"
                      >
                        <div className="w-2 h-2 rounded-full bg-purple-500 mr-3"></div>
                        {agent}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent rounded-sm"></div>

                  <div className="p-6 border border-white/10 rounded-sm h-full font-mono text-sm text-white/70">
                    <div className="mb-4 text-purple-400">
                      // Multi-Agent System Architecture
                    </div>
                    <div className="space-y-2">
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
                      <div>
                        &nbsp;&nbsp;&nbsp;&nbsp;this.initializeAgents(config);
                      </div>
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
                      <div>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <span className="text-purple-400">
                          // Agent coordination logic
                        </span>
                        <div>
                          &nbsp;&nbsp;&nbsp;&nbsp;
                          <span className="text-blue-400">for</span> (
                          <span className="text-blue-400">const</span> agent of
                          this.agents) {`{`}
                        </div>
                        <div>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;results[agent.name]
                          = <span className="text-blue-400">await</span>{" "}
                          agent.process(walletData);
                        </div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;{`}`}</div>
                        <div>
                          &nbsp;&nbsp;&nbsp;&nbsp;
                          <span className="text-blue-400">return</span>{" "}
                          this.synthesizeResults(results);
                        </div>
                        <div>&nbsp;&nbsp;{`}`}</div>
                        <div>{`}`}</div>
                      </div>

                      <div className="absolute bottom-4 right-4 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                        <span className="text-[10px] text-green-400">
                          SYSTEM ONLINE
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-4 backdrop-blur-sm">
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-xs text-white/60 mr-2">01:4</span>
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2 animate-pulse"></div>
                <span className="text-xs text-white/60 uppercase tracking-wider">
                  TECHNOLOGY
                </span>
              </div>
              <div className="flex items-center">
                <motion.div
                  animate={{
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <span className="text-xs text-white/60 font-mono">
                    CUTTING-EDGE AI AND BLOCKCHAIN INTEGRATION
                  </span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Corner borders */}
          <div className="absolute top-0 left-0 w-[100px] h-[100px] border-l border-t border-white/10"></div>
          <div className="absolute top-0 right-0 w-[100px] h-[100px] border-r border-t border-white/10"></div>
          <div className="absolute bottom-0 left-0 w-[100px] h-[100px] border-l border-b border-white/10"></div>
          <div className="absolute bottom-0 right-0 w-[100px] h-[100px] border-r border-b border-white/10"></div>
        </section>

        {/* Journey Timeline Section */}
        <section
          id="journey"
          ref={journeyRef}
          className="min-h-screen py-20 relative border-b border-white/10"
        >
          <div className="container mx-auto px-4 md:px-6 relative">
            {/* Enhanced CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              viewport={{ once: true }}
              className="mt-24 relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-sm overflow-hidden"
            >
              <div className="absolute inset-0 opacity-30">
                <Canvas>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <HolographicSphere />
                </Canvas>
              </div>

              <div className="relative z-10 p-10 md:p-16 flex flex-col items-center text-center">
                <h3 className="text-3xl md:text-4xl font-bold mb-6">
                  <GradientText>Join The NOVA Evolution</GradientText>
                </h3>

                <p className="text-xl text-white/80 max-w-2xl mb-10">
                  Be part of our journey as we redefine how users interact with
                  blockchain technology. Sign up for early access and help shape
                  the future of NOVA.
                </p>

                <a
                  href="#"
                  className="group relative inline-flex items-center bg-purple-600 px-8 py-4 rounded-sm overflow-hidden"
                >
                  <span className="relative z-10 font-medium tracking-wide">
                    GET EARLY ACCESS
                  </span>

                  {/* Button animation effects */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <motion.div className="absolute top-0 -right-40 w-32 h-full bg-white transform rotate-12 translate-x-0 opacity-20 group-hover:translate-x-80 transition-transform duration-1000" />
                </a>

                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center mt-8">
                  <motion.div
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      <span className="text-xs text-white/60 uppercase tracking-wider">
                        Limited Spots Available
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-4 backdrop-blur-sm">
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-xs text-white/60 mr-2">01:5</span>
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2 animate-pulse"></div>
                <span className="text-xs text-white/60 uppercase tracking-wider">
                  JOURNEY
                </span>
              </div>
              <div className="flex items-center">
                <motion.div
                  animate={{
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <span className="text-xs text-white/60 font-mono">
                    FROM CONCEPT TO REALITY
                  </span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Corner borders */}
          <div className="absolute top-0 left-0 w-[100px] h-[100px] border-l border-t border-white/10"></div>
          <div className="absolute top-0 right-0 w-[100px] h-[100px] border-r border-t border-white/10"></div>
          <div className="absolute bottom-0 left-0 w-[100px] h-[100px] border-l border-b border-white/10"></div>
          <div className="absolute bottom-0 right-0 w-[100px] h-[100px] border-r border-b border-white/10"></div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 relative border-b border-white/10">
          <div className="container mx-auto px-4 md:px-6 relative">
            <div className="mb-16 text-center">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-flex items-center justify-center"
              >
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mr-4"></div>
                <span className="text-sm uppercase tracking-[0.3em] text-purple-400 font-light">
                  Common Questions
                </span>
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent ml-4"></div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="text-[3.5rem] md:text-[5rem] font-bold tracking-tighter mt-6 mb-8"
              >
                <GradientText gradient="from-purple-300 via-white to-purple-300">
                  FAQ
                </GradientText>
              </motion.h2>
            </div>

            {/* FAQ Items */}
            <div className="max-w-4xl mx-auto space-y-6">
              {[
                {
                  question: "What is NOVA?",
                  answer:
                    "NOVA is a multi-agent AI platform that transforms any Web3 wallet into a smart, visual, and conversational identity. It combines a chatbot that analyzes on-chain data and contracts, a dashboard that visualizes wallet behavior, and an AI-generated identity card that turns activity into personalized art.",
                },
                {
                  question: "Which blockchains does NOVA support?",
                  answer:
                    "Currently, NOVA supports Solana as our primary blockchain, with plans to expand to Ethereum and other major chains in upcoming releases.",
                },
                {
                  question: "How does NOVA protect user privacy?",
                  answer:
                    "NOVA is designed with privacy at its core. While we analyze on-chain data, which is public by nature, we implement advanced encryption for any personal settings, preferences, or custom configurations you create within the platform.",
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
              ].map((faq, index) => (
                <motion.div
                  key={`faq-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-sm overflow-hidden"
                >
                  <div className="p-6 border-b border-white/10">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-white/90">
                        {faq.question}
                      </h3>
                      <div className="w-6 h-6 rounded-full bg-black/60 border border-purple-500/50 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-white/70 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Contact prompt */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              className="mt-16 text-center"
            >
              <p className="text-white/70 mb-4">Still have questions?</p>
              <a
                href="mailto:info@nova.ai"
                className="text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center"
              >
                <span className="mr-2">Contact our team</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
