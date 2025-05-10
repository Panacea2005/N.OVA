"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Music, Plus } from "lucide-react";

export default function MusicPage() {
  const [mounted, setMounted] = useState(false);
  const [savedTracks, setSavedTracks] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    // Only access localStorage after the component has mounted (client-side)
    if (typeof window !== "undefined") {
      try {
        const tracks = localStorage.getItem("savedTracks");
        if (tracks) {
          setSavedTracks(JSON.parse(tracks));
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error);
      }
    }
  }, []);

  // If not mounted yet, return a minimal loading state for SSR
  if (!mounted) {
    return (
      <main className="relative min-h-screen bg-black text-white font-mono">
        <div className="fixed inset-0 bg-black z-0" />
        <div
          className="fixed inset-0 z-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <Navigation />
        <div className="container mx-auto px-2 pt-24 pb-16 relative z-10">
          <h1 className="text-8xl font-light mb-6">MUSIC</h1>
          <p className="text-white/70">Loading...</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-black text-white font-mono">
      <div className="fixed inset-0 bg-black z-0" />
      <div
        className="fixed inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <Navigation />

      <div className="container mx-auto px-2 pt-24 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <h1 className="text-8xl font-light mb-6">MUSIC</h1>
            <p className="text-white/70 uppercase max-w-4xl">
              AI-GENERATED MUSIC BASED ON YOUR BLOCKCHAIN ACTIVITY
            </p>
          </motion.div>

          <div className="border border-white/30 p-0.5 mb-8">
            <div className="border border-white/10 px-6 py-8">
              <h2 className="text-5xl font-light mb-10">Music Library</h2>
              
              {savedTracks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedTracks.map((track, index) => (
                    <div key={index} className="border border-white/20 p-4">
                      <h3 className="font-medium mb-2">{track.title}</h3>
                      <p className="text-white/70 text-sm mb-4">{track.description}</p>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/50">{track.duration}</span>
                        <Button variant="outline" size="sm" className="text-xs">
                          Play
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="inline-block p-8 border border-white/20 rounded-full mb-6">
                    <Music className="w-12 h-12 text-white/60" />
                  </div>
                  <p className="text-white/70 mb-6">No music tracks generated yet</p>
                  <Link href="/music/generate">
                    <Button className="bg-white text-black hover:bg-white/90 uppercase">
                      <Plus className="w-4 h-4 mr-2" />
                      Generate Music
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Feature blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                title: "AI Composition",
                description:
                  "Unique tracks composed by AI based on your on-chain activity patterns",
              },
              {
                title: "Blockchain Harmony",
                description:
                  "Melodies derived from transaction signatures and smart contract interactions",
              },
              {
                title: "Downloadable Tracks",
                description:
                  "Export your personalized tracks to use anywhere, royalty-free",
              },
            ].map((feature, index) => (
              <div key={index} className="border border-white/30 p-0.5">
                <div className="border border-white/10 px-6 py-8 h-full">
                  <h3 className="uppercase text-xl font-light mb-4">{feature.title}</h3>
                  <p className="text-white/70 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-white/30 p-0.5">
            <div className="border border-white/10 px-6 py-12 flex flex-col items-center justify-center">
              <h2 className="text-6xl font-light mb-8 text-center uppercase">
                Join The Nova Soundscape
              </h2>
              <p className="text-white/70 mb-8 text-center max-w-xl uppercase">
                Generate AI music tracks today and become part of the next generation of Web3 audio experiences
              </p>
              <Link href="/music/generate">
                <Button className="w-64 bg-white text-black uppercase font-medium text-center py-4 hover:bg-white/90 transition-colors">
                  Generate Music
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}