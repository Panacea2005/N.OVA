"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Download,
  RefreshCw,
  Save,
  Play,
  Pause,
  Disc,
  Volume2,
  Volume1,
  VolumeX,
  Music,
  HistoryIcon,
} from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import dynamic from "next/dynamic";
import { generateMusic, getMusicGenerationDetails } from "./musicService";

const NAuroraBanner = dynamic(() => import("@/components/3d/naurora-banner"), {
  ssr: false,
});

export default function MusicGenerator() {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [negativeTags, setNegativeTags] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState<
    {
      id: string;
      title: string;
      genre: string;
      duration: number;
      dateCreated: string;
      complexity: string;
      prompt: string;
      audioUrl: string;
      instrumental: boolean;
    }[]
  >([]);
  const [selectedGenre, setSelectedGenre] = useState("ambient");
  const [instrumental, setInstrumental] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [model, setModel] = useState<"V3_5" | "V4">("V3_5");
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<{
    id: string;
    title: string;
    genre: string;
    duration: number;
    dateCreated: string;
    complexity: string;
    prompt: string;
    audioUrl: string;
    instrumental: boolean;
  } | null>(null);
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack]);

  const handleGenerate = async () => {
    if (!prompt.trim() && !instrumental) return;
    if (customMode && (!title.trim() || !selectedGenre)) return;

    setIsGenerating(true);
    setErrorMessage("");

    try {
      const generationResponse = await generateMusic({
        prompt,
        style: customMode ? selectedGenre : undefined,
        title: customMode ? title : undefined,
        instrumental,
        customMode,
        negativeTags: customMode ? negativeTags : undefined,
        model,
        callBackUrl: "http://localhost:3000/api/webhook",
      });

      const taskId = generationResponse.id;

      // Poll for the task status until audio_url is available
      let trackDetails;
      const maxAttempts = 160; // 160 attempts × 3 seconds = 480 seconds (8 minutes)
      let attempts = 0;

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds between attempts
        trackDetails = await getMusicGenerationDetails(taskId);

        if (trackDetails && trackDetails.audio_url) {
          break;
        }
        if (trackDetails && trackDetails.status === "failed") {
          throw new Error(trackDetails.errorMessage || "Music generation failed.");
        }
        attempts++;
      }

      if (attempts >= maxAttempts || !trackDetails) {
        throw new Error("Music generation timed out after 8 minutes.");
      }

      if (!trackDetails.audio_url) {
        throw new Error("Music generation completed, but no audio URL was provided.");
      }

      const newTrack = {
        id: crypto.randomUUID(),
        title: customMode ? title : prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt,
        genre: customMode ? selectedGenre : "Generic",
        duration: 60,
        dateCreated: new Date().toISOString(),
        complexity: "medium",
        prompt,
        audioUrl: trackDetails.audio_url,
        instrumental,
      };

      setGeneratedTracks((prev) => [newTrack, ...prev]);
      setGenerationHistory((prev) => [prompt, ...prev].slice(0, 10));
    } catch (error: any) {
      console.error("Error generating music:", error);
      setErrorMessage(error.message || "Failed to generate music. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = (track: {
    id: string;
    title: string;
    genre: string;
    duration: number;
    dateCreated: string;
    complexity: string;
    prompt: string;
    audioUrl: string;
    instrumental: boolean;
  } | null) => {
    if (track && currentTrack && currentTrack.id === track.id) {
      setIsPlaying(!isPlaying);
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
      if (audioRef.current && track) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.play();
      }
    }
  };

  const handleVolumeChange = (e: { target: { value: any } }) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const saveTrack = (track: {
    id?: string;
    title: any;
    genre?: string;
    duration?: number;
    dateCreated?: string;
    complexity?: string;
    prompt?: string;
    audioUrl?: string;
    instrumental?: boolean;
  }) => {
    alert(`Track "${track.title}" saved to your collection`);
  };

  const downloadTrack = (track: {
    id?: string;
    title: any;
    genre?: string;
    duration?: number;
    dateCreated?: string;
    complexity?: string;
    prompt?: string;
    audioUrl?: string;
    instrumental?: boolean;
  }) => {
    alert(`Downloading track "${track.title}"`);
  };

  const genres = [
    { id: "ambient", name: "AMBIENT", description: "Atmospheric sounds" },
    { id: "techno", name: "TECHNO", description: "Electronic beats" },
    { id: "lofi", name: "LO-FI", description: "Relaxing beats" },
    { id: "cyberpunk", name: "CYBERPUNK", description: "Dystopian electronic" },
    { id: "synthwave", name: "SYNTHWAVE", description: "80s retro vibes" },
    { id: "quantum", name: "QUANTUM", description: "Glitchy textures" },
  ];

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
            className="mb-10"
          >
            <NAuroraBanner />
          </motion.div>

          <div className="mb-16">
            <h1 className="text-8xl font-light mb-6">N.AURORA</h1>
            <p className="text-white/70 uppercase max-w-4xl">
              GENERATE UNIQUE AI-POWERED MUSIC COMPOSITIONS FOR YOUR METAVERSE EXPERIENCES
            </p>
            <p className="text-white/70 uppercase max-w-4xl mt-2">
              EACH NOVA TOKEN HOLDER RECEIVES CREDITS TO CREATE AND OWN THEIR GENERATED MUSIC AS NFTs.
            </p>
          </div>

          <div className="border border-white/30 p-0.5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="border border-white/10 px-6 py-8"
            >
              <h2 className="text-5xl font-light mb-10">Music Generator</h2>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="border border-white/20 p-5">
                    <label className="block text-xs uppercase text-white/60 mb-2 flex items-center">
                      <Music className="w-3 h-3 mr-1 text-white/80" />
                      Music Prompt
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={customMode && instrumental ? "Optional: Describe the music vibe..." : "Describe the music or lyrics you want..."}
                      className="w-full h-32 bg-black text-white/90 border border-white/10 p-3 focus:outline-none focus:border-white/30 resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-white/40">
                        {prompt.length} / {customMode ? 3000 : 400}
                      </div>
                      <div className="space-x-2">
                        <button
                          className="p-1 text-white/60 hover:text-white transition-colors"
                          onClick={() => alert("Prompt saved to your collection")}
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-white/60 hover:text-white transition-colors"
                          onClick={() => setPrompt("")}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {customMode && (
                    <>
                      <div className="border border-white/20 p-5">
                        <label className="block text-xs uppercase text-white/60 mb-2 flex items-center">
                          <Music className="w-3 h-3 mr-1 text-white/80" />
                          Track Title
                        </label>
                        <input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter track title..."
                          className="w-full bg-black text-white/90 border border-white/10 p-3 focus:outline-none focus:border-white/30"
                          maxLength={80}
                        />
                        <div className="text-xs text-white/40 mt-2">
                          {title.length} / 80
                        </div>
                      </div>

                      <div className="border border-white/20 p-5">
                        <label className="block text-xs uppercase text-white/60 mb-2 flex items-center">
                          <Music className="w-3 h-3 mr-1 text-white/80" />
                          Negative Tags (Optional)
                        </label>
                        <input
                          value={negativeTags}
                          onChange={(e) => setNegativeTags(e.target.value)}
                          placeholder="Styles to avoid (e.g., Heavy Metal, Upbeat Drums)"
                          className="w-full bg-black text-white/90 border border-white/10 p-3 focus:outline-none focus:border-white/30"
                          maxLength={200}
                        />
                        <div className="text-xs text-white/40 mt-2">
                          {negativeTags.length} / 200
                        </div>
                      </div>
                    </>
                  )}

                  <div className="border border-white/20 p-5">
                    <label className="block text-xs uppercase text-white/60 mb-3 flex items-center">
                      <Disc className="w-3 h-3 mr-1 text-white/80" />
                      Music Genre
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {genres.map((genre) => (
                        <button
                          key={genre.id}
                          className={`p-2 text-xs flex flex-col items-center justify-center transition-colors ${
                            selectedGenre === genre.id
                              ? "bg-white/5 border border-white/30 text-white"
                              : "bg-black border border-white/10 text-white/70 hover:border-white/20"
                          }`}
                          onClick={() => setSelectedGenre(genre.id)}
                          disabled={!customMode}
                        >
                          <span className="font-medium">{genre.name}</span>
                          <span className="text-[10px] mt-1 opacity-70">
                            {genre.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border border-white/20 p-5">
                    <label className="block text-xs uppercase text-white/60 mb-3 flex items-center">
                      <Disc className="w-3 h-3 mr-1 text-white/80" />
                      Generation Settings
                    </label>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={customMode}
                          onChange={(e) => setCustomMode(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-xs">Custom Mode (Advanced Settings)</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={instrumental}
                          onChange={(e) => setInstrumental(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-xs">Instrumental (No Lyrics)</span>
                      </div>
                      <div className="flex items-center">
                        <select
                          value={model}
                          onChange={(e) => setModel(e.target.value as "V3_5" | "V4")}
                          className="bg-black border border-white/10 p-2 text-xs"
                        >
                          <option value="V3_5">Model V3_5</option>
                          <option value="V4">Model V4</option>
                        </select>
                        <span className="text-xs ml-2">Model Version</span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-full py-3 bg-white text-black uppercase font-medium text-lg"
                    onClick={handleGenerate}
                    disabled={
                      isGenerating ||
                      (!prompt.trim() && !instrumental) ||
                      (customMode && (!title.trim() || !selectedGenre))
                    }
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        GENERATING MUSIC...
                      </span>
                    ) : (
                      "GENERATE MUSIC"
                    )}
                  </button>

                  {errorMessage && (
                    <div className="border border-red-500/30 p-4 flex justify-between items-center">
                      <p className="text-xs text-red-400">{errorMessage}</p>
                      <button
                        onClick={() => setErrorMessage("")}
                        className="text-red-400 text-xs hover:text-red-300"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  <div className="border border-white/20 p-5">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-xs uppercase text-white/60 flex items-center">
                        <HistoryIcon className="w-3 h-3 mr-1 text-white/80" />
                        Recent Prompts
                      </label>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {generationHistory.length > 0 ? (
                        <div className="space-y-2">
                          {generationHistory.map((historyPrompt) => (
                            <div
                              key={historyPrompt}
                              className="text-xs p-2 bg-black border border-white/10 hover:border-white/30 cursor-pointer transition-colors"
                              onClick={() => setPrompt(historyPrompt)}
                            >
                              {historyPrompt.length > 60
                                ? historyPrompt.substring(0, 60) + "..."
                                : historyPrompt}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-white/40 text-xs py-4">
                          No generation history yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="border border-white/20 p-5 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse mr-2" />
                        <span className="text-sm font-mono text-white/70 uppercase">
                          Generated Music
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {volume === 0 ? (
                            <VolumeX className="w-4 h-4 text-white/60" />
                          ) : volume < 50 ? (
                            <Volume1 className="w-4 h-4 text-white/60" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-white/60" />
                          )}
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-20 appearance-none h-1 bg-white/20 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 bg-black border border-white/10 relative overflow-hidden min-h-[550px]">
                      {isGenerating ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="w-16 h-16 border-t-2 border-b-2 border-white rounded-full animate-spin mb-4 mx-auto" />
                            <div className="text-white/70 animate-pulse uppercase">
                              Composing your music...
                            </div>
                            <div className="text-xs text-white/40 mt-2 uppercase">
                              Creating neural audio patterns
                            </div>
                          </div>
                        </div>
                      ) : generatedTracks.length > 0 ? (
                        <div className="p-4 h-full overflow-y-auto">
                          <div className="space-y-4">
                            {generatedTracks.map((track) => (
                              <div
                                key={track.id}
                                className="border border-white/10 hover:border-white/20 p-4 transition-colors"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h3 className="text-white font-medium">{track.title}</h3>
                                    <div className="text-xs text-white/60 mt-1">
                                      {new Date(track.dateCreated).toLocaleDateString()} •{" "}
                                      {track.genre.toUpperCase()} • {formatTime(track.duration)} •{" "}
                                      {track.instrumental ? "Instrumental" : "With Lyrics"}
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      className="p-1.5 text-white/60 hover:text-white transition-colors"
                                      onClick={() => saveTrack(track)}
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                    <button
                                      className="p-1.5 text-white/60 hover:text-white transition-colors"
                                      onClick={() => downloadTrack(track)}
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                  <button
                                    className="w-10 h-10 flex items-center justify-center border border-white/20 hover:bg-white/5 transition-colors"
                                    onClick={() => togglePlayback(track)}
                                  >
                                    {isPlaying && currentTrack && currentTrack.id === track.id ? (
                                      <Pause className="w-5 h-5" />
                                    ) : (
                                      <Play className="w-5 h-5" />
                                    )}
                                  </button>

                                  <div className="flex-1 space-y-2">
                                    <div className="h-1 bg-white/10 w-full relative">
                                      <div
                                        className="absolute h-full bg-white left-0"
                                        style={{
                                          width:
                                            currentTrack && currentTrack.id === track.id
                                              ? `${(currentTime / track.duration) * 100}%`
                                              : "0%",
                                        }}
                                      ></div>
                                    </div>

                                    <div className="flex justify-between text-xs text-white/40">
                                      <span>
                                        {currentTrack && currentTrack.id === track.id
                                          ? formatTime(currentTime)
                                          : "0:00"}
                                      </span>
                                      <span>{formatTime(track.duration)}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3 text-xs text-white/60">
                                  <div className="mb-1 uppercase">Prompt:</div>
                                  <div className="p-2 bg-black/50 border border-white/10 text-white/80">
                                    {track.prompt || "Instrumental track with no prompt"}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center text-white/50 uppercase">
                            <Music className="w-12 h-12 mb-4 mx-auto opacity-30" />
                            <p>No tracks generated yet</p>
                            <p className="text-xs mt-2">Enter a prompt and click generate</p>
                          </div>
                        </div>
                      )}

                      <audio ref={audioRef} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                title: "Unique Compositions",
                description:
                  "Each music piece is uniquely generated based on your prompt and can be minted as an NFT with full ownership rights.",
              },
              {
                title: "Neural Synthesis",
                description:
                  "Advanced AI models create high-quality compositions by analyzing thousands of musical patterns and styles.",
              },
              {
                title: "Metaverse Ready",
                description:
                  "Generated tracks are optimized for metaverse environments and can be used across NOVA ecosystem applications.",
              },
            ].map((feature, index) => (
              <div key={index} className="border border-white/30 p-0.5">
                <div className="border border-white/10 px-6 py-8">
                  <h3 className="uppercase text-xl font-light mb-4">{feature.title}</h3>
                  <p className="text-white/70 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-white/30 p-0.5">
            <div className="border border-white/10 px-6 py-12 flex flex-col items-center justify-center">
              <h2 className="text-6xl font-light mb-8 text-center uppercase">
                Get More Generation Credits
              </h2>
              <p className="text-white/70 mb-8 text-center max-w-xl uppercase">
                Purchase additional music generation credits to create your own sonic universe
              </p>
              <button className="w-64 bg-white text-black uppercase font-medium text-center py-4 hover:bg-white/90 transition-colors">
                BUY CREDITS
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
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