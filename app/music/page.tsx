"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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

// Pixel Art Cover component for generating pixel art covers
const PixelArtCover = ({
  trackId,
  size = 280,
}: {
  trackId: string;
  size?: number;
}) => {
  // Generate a deterministic but random-looking pattern based on track ID
  const pixelData = useMemo(() => {
    // Use track ID as seed for consistent generation per track
    const seed = trackId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Generate color palette (primary, secondary, accent)
    const generateColor = (base: number) => {
      const r = (base * 1231) % 256;
      const g = (base * 3571) % 256;
      const b = (base * 5783) % 256;
      return `rgb(${r}, ${g}, ${b})`;
    };

    // Generate a more vibrant primary color
    const primaryHue = seed % 360;
    const primaryColor = `hsl(${primaryHue}, 70%, 50%)`;
    
    // Generate complementary colors
    const secondaryHue = (primaryHue + 180) % 360;
    const secondaryColor = `hsl(${secondaryHue}, 60%, 40%)`;
    
    // Generate an accent color
    const accentHue = (primaryHue + 120) % 360;
    const accentColor = `hsl(${accentHue}, 80%, 60%)`;
    
    // Darker background
    const backgroundColor = `hsl(${primaryHue}, 30%, 15%)`;

    // Generate a 8x8 pixel grid
    const grid = [];
    const mirrorSize = 4; // Half the grid for mirroring

    for (let y = 0; y < mirrorSize; y++) {
      for (let x = 0; x < 8; x++) {
        // We'll mirror the left side to the right for symmetry
        const isMirrored = x >= 4;
        const actualX = isMirrored ? 7 - x : x;

        // Deterministic but random-looking pattern
        const value = (seed + y * 13 + actualX * 7) % 100;

        let color = "transparent";
        if (value < 25) color = primaryColor;
        else if (value < 45) color = secondaryColor;
        else if (value < 55) color = accentColor;
        else if (value < 70) color = backgroundColor;
        else color = "transparent"; // More transparent areas for visual interest

        // Add some animation to specific pixels
        const shouldAnimate = value > 90;

        grid.push({ x, y, color, animate: shouldAnimate });
      }
    }

    // Mirror the top half to bottom half
    for (let y = 0; y < mirrorSize; y++) {
      for (let x = 0; x < 8; x++) {
        const mirroredY = 7 - y;
        const originalIndex = y * 8 + x;
        grid.push({ 
          x, 
          y: mirroredY, 
          color: grid[originalIndex].color,
          animate: grid[originalIndex].animate 
        });
      }
    }

    return { grid, backgroundColor, primaryColor };
  }, [trackId]);

  const pixelSize = size / 8;

  return (
    <div
      className="relative rounded-sm overflow-hidden"
      style={{
        width: size,
        height: size,
        background: pixelData.backgroundColor,
        boxShadow: `0 0 30px ${pixelData.primaryColor}20 inset`,
      }}
    >
      {/* Gradient overlay for depth */}
      <div 
        className="absolute inset-0 z-0" 
        style={{
          background: `radial-gradient(circle at 30% 30%, transparent 0%, ${pixelData.backgroundColor} 80%)`,
        }}
      />
      
      {/* Grid of pixels */}
      {pixelData.grid.map((pixel, index) => (
        <div
          key={index}
          className={pixel.animate ? "pixel-animate" : ""}
          style={{
            position: "absolute",
            left: pixel.x * pixelSize,
            top: pixel.y * pixelSize,
            width: pixelSize,
            height: pixelSize,
            backgroundColor: pixel.color,
            zIndex: 1,
          }}
        />
      ))}
      
      {/* Subtle scanlines effect */}
      <div 
        className="absolute inset-0 z-2 pointer-events-none opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${pixelData.primaryColor}10, ${pixelData.primaryColor}10 1px, transparent 1px, transparent 2px)`,
        }}
      />
    </div>
  );
};

// Custom minimal audio player slider component
const MinimalAudioSlider = ({
  currentTime,
  duration,
  onSeek,
  isPlaying,
}: {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isPlaying: boolean;
}) => {
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;
    const seekTime = percentage * duration;
    onSeek(seekTime);
  };

  return (
    <div
      className="relative h-1 bg-white/10 w-full cursor-pointer group"
      onClick={handleSeek}
    >
      {/* Progress bar */}
      <div
        className="absolute h-full bg-white left-0 transition-all duration-300"
        style={{
          width: `${(currentTime / duration) * 100}%`,
        }}
      />

      {/* Draggable handle */}
      <div
        className="absolute h-3 w-3 bg-white rounded-full -top-1 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          left: `calc(${(currentTime / duration) * 100}% - 3px)`,
        }}
      />

      {/* Audio wave animation for playing tracks */}
      {isPlaying && (
        <div className="absolute right-0 top-0 transform translate-x-full -translate-y-3 flex space-x-0.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-0.5 h-3 bg-white/80 animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${0.7 + i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isBrowser, setIsBrowser] = useState(false);

  // Set isBrowser to true when component mounts on client
  useEffect(() => {
    setIsBrowser(true);
    
    // Load saved tracks from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const savedTracks = localStorage.getItem('generatedMusicTracks');
        if (savedTracks) {
          setGeneratedTracks(JSON.parse(savedTracks));
        }
        
        const savedHistory = localStorage.getItem('musicGenerationHistory');
        if (savedHistory) {
          setGenerationHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save tracks to localStorage when they change
  useEffect(() => {
    if (isBrowser && generatedTracks.length > 0) {
      try {
        localStorage.setItem('generatedMusicTracks', JSON.stringify(generatedTracks));
      } catch (error) {
        console.error('Error saving tracks to localStorage:', error);
      }
    }
  }, [generatedTracks, isBrowser]);

  // Save history to localStorage when it changes
  useEffect(() => {
    if (isBrowser && generationHistory.length > 0) {
      try {
        localStorage.setItem('musicGenerationHistory', JSON.stringify(generationHistory));
      } catch (error) {
        console.error('Error saving history to localStorage:', error);
      }
    }
  }, [generationHistory, isBrowser]);

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

  useEffect(() => {
    // When adding a new track, set the current index to 0 (the newest track)
    if (generatedTracks.length > 0) {
      setCurrentTrackIndex(0);
    }
  }, [generatedTracks.length]);

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
  
      // Create a temporary audio element to get the duration (if possible)
      let duration = 60; // Default fallback duration
      try {
        const tempAudio = new Audio();
        tempAudio.src = trackDetails.audio_url;
        
        // Wait for the audio metadata to load or timeout after 5 seconds
        await Promise.race([
          new Promise<void>((resolve) => {
            tempAudio.onloadedmetadata = () => {
              if (tempAudio.duration && !isNaN(tempAudio.duration)) {
                duration = tempAudio.duration;
              }
              resolve();
            };
          }),
          new Promise<void>((resolve) => {
            tempAudio.onerror = () => {
              console.warn("Error loading audio metadata");
              resolve();
            };
          }),
          new Promise<void>((resolve) => {
            setTimeout(() => {
              console.warn("Timeout waiting for audio metadata");
              resolve();
            }, 5000);
          }),
        ]);
      } catch (error) {
        console.warn("Could not get audio duration, using default", error);
        // Continue with default duration
      }
  
      // Generate a track name if one is not provided in custom mode
      const trackTitle = customMode
        ? title
        : prompt.length > 30
        ? prompt.substring(0, 30) + "..."
        : prompt;
  
      // Create new track object
      const newTrack = {
        id: crypto.randomUUID(),
        title: trackTitle,
        genre: customMode ? selectedGenre : "Generic",
        duration: duration,
        dateCreated: new Date().toISOString(),
        complexity: model === "V4" ? "Advanced" : "Standard",
        prompt,
        audioUrl: trackDetails.audio_url,
        instrumental,
      };
  
      // Add the new track and update state
      setGeneratedTracks((prev) => [newTrack, ...prev]);
      setCurrentTrackIndex(0); // Show the new track
      setGenerationHistory((prev) => [prompt, ...prev].slice(0, 10));
      
      // Reset inputs if needed
      if (!customMode) {
        setPrompt("");
      }
      
      // Reset any playing state to prepare for the new track
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      
      // Automatically select the new track
      setCurrentTrack(newTrack);
    } catch (error: any) {
      console.error("Error generating music:", error);
      setErrorMessage(error.message || "Failed to generate music. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = (
    track: {
      id: string;
      title: string;
      genre: string;
      duration: number;
      dateCreated: string;
      complexity: string;
      prompt: string;
      audioUrl: string;
      instrumental: boolean;
    } | null
  ) => {
    if (!track) return;
  
    if (currentTrack && currentTrack.id === track.id) {
      // Same track - toggle play/pause
      setIsPlaying(!isPlaying);
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        // Ensure the audio element has the source set
        if (audioRef.current) {
          if (!audioRef.current.src || !audioRef.current.src.includes(track.audioUrl)) {
            audioRef.current.src = track.audioUrl;
            audioRef.current.load();
          }
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.error('Error playing audio:', err);
              setIsPlaying(false);
            });
          }
        }
      }
    } else {
      // New track selected
      setCurrentTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
      
      // Set new track source and play
      if (audioRef.current) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.load();
        audioRef.current.volume = volume / 100;
        
        // Play with error handling
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error('Error playing audio:', err);
            setIsPlaying(false);
          });
        }
      }
    }
  };

  // New function to handle seeking to a specific time
  const handleSeek = (time: number) => {
    if (audioRef.current && currentTrack) {
      // Make sure we don't seek beyond the track duration
      const clampedTime = Math.min(Math.max(0, time), currentTrack.duration);
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
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

  // Enhanced download function to save MP3 to device
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
    if (track.audioUrl) {
      const link = document.createElement("a");
      link.href = track.audioUrl;
      link.download = `${track.title.replace(/[^\w\s]/gi, "")}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(
        `Unable to download track "${track.title}". Audio URL not available.`
      );
    }
  };

  const genres = [
    { id: "ambient", name: "AMBIENT", description: "Atmospheric sounds" },
    { id: "techno", name: "TECHNO", description: "Electronic beats" },
    { id: "lofi", name: "LO-FI", description: "Relaxing beats" },
    { id: "cyberpunk", name: "CYBERPUNK", description: "Dystopian electronic" },
    { id: "synthwave", name: "SYNTHWAVE", description: "80s retro vibes" },
    { id: "quantum", name: "QUANTUM", description: "Glitchy textures" },
  ];

  // Render function for track cards
  const renderTrackCard = (
    track: {
      id: string;
      title: string;
      genre: string;
      duration: number;
      dateCreated: string;
      complexity: string;
      prompt: string;
      audioUrl: string;
      instrumental: boolean;
    } | null
  ) => {
    if (!track) return null;
  
    const isCurrentTrack = currentTrack && currentTrack.id === track.id;
  
    return (
      <div
        key={track.id}
        className="border border-white/10 hover:border-white/20 bg-black/40 backdrop-blur-sm transition-colors group rounded-sm max-w-md mx-auto"
      >
        {/* Image Cover */}
        <div className="aspect-square w-full relative">
          <PixelArtCover trackId={track.id} size={400} />
          
          {/* Floating genre tag */}
          <div className="absolute top-3 right-3 text-xs bg-black/60 backdrop-blur-sm px-2 py-1 rounded-sm border border-white/10">
            {track.genre.toUpperCase()}
          </div>
  
          {/* Play button overlay */}
          <button
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => togglePlayback(track)}
          >
            <div className="w-16 h-16 flex items-center justify-center border border-white/60 hover:bg-white/20 transition-all backdrop-blur-sm rounded-full">
              {isPlaying && isCurrentTrack ? (
                <Pause className="w-7 h-7" />
              ) : (
                <Play className="w-7 h-7 ml-1" />
              )}
            </div>
          </button>
        </div>
  
        {/* Track details and controls */}
        <div className="p-4">
          {/* Track title and metadata */}
          <div className="mb-4">
            <h3 className="text-white font-medium text-lg truncate">{track.title}</h3>
            <div className="text-xs text-white/60 mt-1">
              {new Date(track.dateCreated).toLocaleDateString()} • {track.instrumental ? "Instrumental" : "With Lyrics"}
            </div>
          </div>
  
          {/* Inline player controls with play button at the start */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2">
              {/* Play/Pause button */}
              <button
                onClick={() => togglePlayback(track)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                {isPlaying && isCurrentTrack ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>
              
              {/* Current time */}
              <span className="text-xs text-white/60 min-w-[40px]">
                {isCurrentTrack ? formatTime(currentTime) : "0:00"}
              </span>
              
              {/* Progress bar */}
              <div className="relative h-1 bg-white/10 flex-grow rounded-full cursor-pointer group" onClick={(e) => {
                if (!audioRef.current) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const offsetX = e.clientX - rect.left;
                const percentage = offsetX / rect.width;
                handleSeek(percentage * track.duration);
              }}>
                {/* Progress */}
                <div
                  className="absolute h-full bg-white left-0 rounded-full transition-all duration-300"
                  style={{
                    width: `${isCurrentTrack ? (currentTime / track.duration) * 100 : 0}%`,
                  }}
                />
                
                {/* Handle */}
                <div 
                  className="absolute h-3 w-3 bg-white rounded-full -top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    left: `calc(${isCurrentTrack ? (currentTime / track.duration) * 100 : 0}% - 3px)`,
                  }}
                />
              </div>
              
              {/* Duration */}
              <span className="text-xs text-white/60 min-w-[40px] text-right">
                {formatTime(track.duration)}
              </span>
            </div>
          </div>
  
          {/* Action buttons */}
          <div className="flex justify-between items-center">
            {/* Track metadata */}
            <div className="text-white/60 text-xs">
              Neural Audio • {track.complexity}
            </div>
            
            <div className="flex space-x-2">
              <button
                className="p-2 text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-sm"
                onClick={() => saveTrack(track)}
                title="Save to collection"
              >
                <Save className="w-4 h-4" />
              </button>
  
              <button
                className="p-2 text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-sm"
                onClick={() => downloadTrack(track)}
                title="Save MP3 to device"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              GENERATE UNIQUE AI-POWERED MUSIC COMPOSITIONS FOR YOUR METAVERSE
              EXPERIENCES
            </p>
            <p className="text-white/70 uppercase max-w-4xl mt-2">
              EACH NOVA TOKEN HOLDER RECEIVES CREDITS TO CREATE AND OWN THEIR
              GENERATED MUSIC AS NFTs.
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
                      placeholder={
                        customMode && instrumental
                          ? "Optional: Describe the music vibe..."
                          : "Describe the music or lyrics you want..."
                      }
                      className="w-full h-32 bg-black text-white/90 border border-white/10 p-3 focus:outline-none focus:border-white/30 resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-white/40">
                        {prompt.length} / {customMode ? 3000 : 400}
                      </div>
                      <div className="space-x-2">
                        <button
                          className="p-1 text-white/60 hover:text-white transition-colors"
                          onClick={() =>
                            alert("Prompt saved to your collection")
                          }
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
                        <span className="text-xs">
                          Custom Mode (Advanced Settings)
                        </span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={instrumental}
                          onChange={(e) => setInstrumental(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-xs">
                          Instrumental (No Lyrics)
                        </span>
                      </div>
                      <div className="flex items-center">
                        <select
                          value={model}
                          onChange={(e) =>
                            setModel(e.target.value as "V3_5" | "V4")
                          }
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

                    <div className="flex-1 bg-black border border-white/10 relative overflow-hidden min-h-[550px] flex items-center justify-center">
                      {isGenerating ? (
                        <div className="flex items-center justify-center h-full w-full">
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
                        <div className="p-6 w-full h-full overflow-y-auto flex flex-col items-center"> 
                          {/* Single centered track card */}
                          {renderTrackCard(generatedTracks[currentTrackIndex])}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full w-full">
                          <div className="text-center text-white/50 uppercase">
                            <Music className="w-12 h-12 mb-4 mx-auto opacity-30" />
                            <p>No tracks generated yet</p>
                            <p className="text-xs mt-2">
                              Enter a prompt and click generate
                            </p>
                          </div>
                        </div>
                      )}

                      <audio 
                        ref={audioRef} 
                        onError={(e) => {
                          console.error('Audio error:', e);
                          setIsPlaying(false);
                          setErrorMessage("Error playing audio. Please try again.");
                        }}
                        onLoadedMetadata={() => {
                          // Update duration if the metadata has been loaded
                          if (audioRef.current && currentTrack) {
                            // If the audio has a valid duration, update the track's duration
                            if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
                              setGeneratedTracks(tracks => 
                                tracks.map(t => 
                                  t.id === currentTrack.id 
                                    ? {...t, duration: audioRef.current?.duration || t.duration} 
                                    : t
                                )
                              );
                            }
                          }
                        }}
                      />
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
                  <h3 className="uppercase text-xl font-light mb-4">
                    {feature.title}
                  </h3>
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
                Purchase additional music generation credits to create your own
                sonic universe
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

        /* Custom audio player styles */
        @keyframes pixelFade {
          0% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.7;
          }
        }

        .pixel-animate {
          animation: pixelFade 3s infinite;
        }
      `}</style>
    </main>
  );
}