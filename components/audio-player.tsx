"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Music, 
  Upload, 
  X, 
  SkipForward, 
  SkipBack,
  Disc,
  List,
  Heart,
  Share2,
  MoreHorizontal
} from "lucide-react";

interface AudioPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Default tracks with enhanced metadata including cover art
const defaultTracks = [
  {
    id: "1",
    title: "Ocean",
    artist: "N.AURORA",
    duration: 217, // in seconds
    src: "/audio/default-track.mp3",
    coverArt: "/images/audio/default-track.png", 
    color: "#7928CA", 
    description: "An oceanic journey through sound.",
  },
];

// Audio visualization component
const AudioVisualizer = ({ 
  isPlaying, 
  color = "#FFFFFF" 
}: { 
  isPlaying: boolean, 
  color?: string 
}) => {
  return (
    <div className="flex items-center justify-center h-4 space-x-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ 
            backgroundColor: color,
            opacity: isPlaying ? 0.8 : 0.3,
          }}
          animate={{
            height: isPlaying 
              ? [4, 12, 4, 18, 4, 8, 4][i % 7] 
              : 4
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Generate a fallback cover image based on track info
const GeneratedCover = ({ 
  title, 
  artist, 
  color = "#7928CA"
}: { 
  title: string, 
  artist: string,
  color?: string
}) => {
  // Extract initials from title
  const initials = title
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
    
  return (
    <div 
      className="w-full h-full flex items-center justify-center text-white font-bold text-2xl"
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}66)`,
        boxShadow: `0 0 20px ${color}33 inset`
      }}
    >
      {initials}
      <div className="absolute bottom-2 right-2 text-xs opacity-50">{artist}</div>
    </div>
  );
};

const AudioPlayerButton = ({ onClick, isPlaying }: { onClick: () => void, isPlaying: boolean }) => {
  return (
    <button
      onClick={onClick}
      className="text-white p-2 hover:bg-white/5 transition-all duration-300 border border-white/10 relative"
      aria-label="Audio Player"
    >
      <div className="relative">
        <Music className="w-5 h-5" />
        {isPlaying && (
          <motion.div 
            className="absolute -right-1 -top-1"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </motion.div>
        )}
      </div>
    </button>
  );
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const AudioPlayer = ({ isOpen, onClose }: AudioPlayerProps) => {
  const [tracks, setTracks] = useState(defaultTracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [activeTab, setActiveTab] = useState("default"); // default or uploaded
  const [userTracks, setUserTracks] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [likedTracks, setLikedTracks] = useState<string[]>([]);
  const [isVisualizing, setIsVisualizing] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const previousVolume = useRef(volume);

  useEffect(() => {
    // Load saved tracks and settings from localStorage when available
    if (typeof window !== 'undefined') {
      try {
        const savedVolume = localStorage.getItem('audioPlayerVolume');
        if (savedVolume) {
          setVolume(parseInt(savedVolume));
        }
        
        const savedMuted = localStorage.getItem('audioPlayerMuted');
        if (savedMuted) {
          setIsMuted(savedMuted === 'true');
        }
        
        const savedUserTracks = localStorage.getItem('userTracks');
        if (savedUserTracks) {
          setUserTracks(JSON.parse(savedUserTracks));
        }
        
        const savedCurrentTrack = localStorage.getItem('currentTrackIndex');
        if (savedCurrentTrack) {
          setCurrentTrackIndex(parseInt(savedCurrentTrack));
        }
        
        const savedActiveTab = localStorage.getItem('activeTab');
        if (savedActiveTab) {
          setActiveTab(savedActiveTab);
        }
        
        const savedLikedTracks = localStorage.getItem('likedTracks');
        if (savedLikedTracks) {
          setLikedTracks(JSON.parse(savedLikedTracks));
        }
      } catch (error) {
        console.error('Error loading audio player settings:', error);
      }
    }
    
    // Setup audio element
    const audio = audioRef.current;
    if (!audio) return;
    
    // Event handlers
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleDurationChange = () => {
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      // Go to next track when current one ends
      handleNext();
    };
    
    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    
    // Set volume
    audio.volume = volume / 100;
    
    // Cleanup
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('audioPlayerVolume', volume.toString());
      localStorage.setItem('audioPlayerMuted', isMuted.toString());
      localStorage.setItem('userTracks', JSON.stringify(userTracks));
      localStorage.setItem('currentTrackIndex', currentTrackIndex.toString());
      localStorage.setItem('activeTab', activeTab);
      localStorage.setItem('likedTracks', JSON.stringify(likedTracks));
    }
  }, [volume, isMuted, userTracks, currentTrackIndex, activeTab, likedTracks]);
  
  // Set up audio source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Get current track
    const currentTracks = activeTab === 'default' ? tracks : userTracks;
    if (currentTracks.length === 0) return;
    
    const track = currentTracks[currentTrackIndex];
    if (!track) {
      // If track doesn't exist (e.g., if we deleted the last track), reset to first track
      setCurrentTrackIndex(0);
      return;
    }
    
    // Set up new track
    audio.src = track.src;
    audio.load();
    
    // Auto-play if already playing
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio play error:", error);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrackIndex, activeTab, tracks, userTracks]);
  
  // Update document title with current track
  useEffect(() => {
    if (isPlaying) {
      const currentTracks = activeTab === 'default' ? tracks : userTracks;
      if (currentTracks.length === 0) return;
      
      const track = currentTracks[currentTrackIndex];
      if (track) {
        document.title = `♫ ${track.title} - ${track.artist}`;
      }
    } else {
      // Reset title when not playing
      document.title = "N.OVA";
    }
    
    return () => {
      document.title = "N.OVA";
    };
  }, [isPlaying, currentTrackIndex, activeTab, tracks, userTracks]);
  
  // Global audio control functions
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio play error:", error);
        });
      }
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handlePrevious = () => {
    const currentTracks = activeTab === 'default' ? tracks : userTracks;
    if (currentTracks.length === 0) return;
    
    // If we're more than 3 seconds into the track, restart it instead of going previous
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      return;
    }
    
    setCurrentTrackIndex(prevIndex => 
      prevIndex === 0 ? currentTracks.length - 1 : prevIndex - 1
    );
  };
  
  const handleNext = () => {
    const currentTracks = activeTab === 'default' ? tracks : userTracks;
    if (currentTracks.length === 0) return;
    
    setCurrentTrackIndex(prevIndex => 
      prevIndex === currentTracks.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newTime = (offsetX / rect.width) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume / 100;
    }
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };
  
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      // Unmute
      setIsMuted(false);
      setVolume(previousVolume.current);
      audio.volume = previousVolume.current / 100;
    } else {
      // Mute
      setIsMuted(true);
      previousVolume.current = volume;
      setVolume(0);
      audio.volume = 0;
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Process each uploaded file
    Array.from(files).forEach(file => {
      // Create object URL for the file
      const objectUrl = URL.createObjectURL(file);
      
      // Create a temporary audio element to get duration
      const tempAudio = new Audio();
      tempAudio.src = objectUrl;
      
      tempAudio.onloadedmetadata = () => {
        // Generate a random color for the track
        const hue = Math.floor(Math.random() * 360);
        const color = `hsl(${hue}, 70%, 50%)`;
        
        // Create new track
        const newTrack = {
          id: Date.now().toString(),
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          artist: "User Upload",
          duration: tempAudio.duration,
          src: objectUrl,
          coverArt: "", // Will use generated cover
          color,
          description: "User uploaded track"
        };
        
        // Add to user tracks
        setUserTracks(prev => [...prev, newTrack]);
        
        // Switch to uploaded tab
        setActiveTab('uploaded');
        
        // If first upload, set as current track
        if (userTracks.length === 0) {
          setCurrentTrackIndex(0);
        }
      };
      
      tempAudio.onerror = () => {
        console.error("Error loading audio file:", file.name);
        // Revoke the URL to prevent memory leaks
        URL.revokeObjectURL(objectUrl);
      };
    });
    
    // Reset file input
    e.target.value = '';
  };
  
  const toggleLike = (trackId: string) => {
    setLikedTracks(prev => {
      if (prev.includes(trackId)) {
        return prev.filter(id => id !== trackId);
      } else {
        return [...prev, trackId];
      }
    });
  };
  
  const removeUserTrack = (trackId: string) => {
    setUserTracks(prev => {
      const updatedTracks = prev.filter(track => track.id !== trackId);
      
      // If removing current track, adjust current index
      if (activeTab === 'uploaded') {
        const trackIndex = prev.findIndex(track => track.id === trackId);
        if (trackIndex === currentTrackIndex) {
          // If it's the last track, go to first track
          if (updatedTracks.length === 0) {
            setActiveTab('default');
            setCurrentTrackIndex(0);
          } else if (trackIndex >= updatedTracks.length) {
            setCurrentTrackIndex(0);
          }
        } else if (trackIndex < currentTrackIndex) {
          setCurrentTrackIndex(prevIndex => prevIndex - 1);
        }
      }
      
      return updatedTracks;
    });
    
    // Also remove from liked tracks if present
    if (likedTracks.includes(trackId)) {
      setLikedTracks(prev => prev.filter(id => id !== trackId));
    }
  };
  
  const getCurrentTrack = () => {
    const currentTracks = activeTab === 'default' ? tracks : userTracks;
    if (currentTracks.length === 0) return null;
    
    return currentTracks[currentTrackIndex];
  };
  
  const currentTrack = getCurrentTrack();
  const coverArt = currentTrack?.coverArt;
  const trackColor = currentTrack?.color || "#7928CA";
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} />
    
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`fixed top-16 right-24 bg-black/90 backdrop-blur-lg border border-white/10 shadow-2xl z-40 ${isExpanded ? 'w-96' : 'w-80'} overflow-hidden rounded-sm`}
            style={{
              boxShadow: `0 10px 25px -5px ${trackColor}33, 0 8px 10px -6px ${trackColor}22`
            }}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-mono uppercase text-white/70">N.AUDIO</h3>
                <div className="flex items-center space-x-2">
                  {/* Toggle expand button */}
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {isExpanded ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 3v4a1 1 0 0 1-1 1H3m13-5v4a1 1 0 0 0 1 1h4m0 13h-4a1 1 0 0 1-1-1v-4m-9 5h4a1 1 0 0 0 1-1v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  
                  <button 
                    onClick={onClose}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Album Cover and Track Info */}
              <div className="mb-6 flex flex-col items-center">
                <div className={`${isExpanded ? 'w-64 h-64' : 'w-56 h-56'} mb-4 relative overflow-hidden rounded-sm transition-all duration-300 bg-black`}>
                  {coverArt ? (
                    <img 
                      src={coverArt}
                      alt={currentTrack?.title || "Album cover"}
                      className="w-full h-full object-cover"
                    />
                  ) : currentTrack ? (
                    <GeneratedCover 
                      title={currentTrack.title} 
                      artist={currentTrack.artist}
                      color={trackColor}
                    />
                  ) : (
                    <div className="w-full h-full bg-black/50 flex items-center justify-center">
                      <Disc className="w-16 h-16 text-white/20" />
                    </div>
                  )}
                  
                  {/* Overlay gradient */}
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `linear-gradient(135deg, transparent 0%, ${trackColor} 150%)`
                    }}
                  />
                  
                  {/* Visualizer overlay (conditionally shown) */}
                  {isPlaying && isVisualizing && (
                    <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center">
                      <AudioVisualizer isPlaying={isPlaying} color={trackColor} />
                    </div>
                  )}

                  {/* Like button */}
                  {currentTrack && (
                    <button 
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm"
                      onClick={() => toggleLike(currentTrack.id)}
                    >
                      <Heart 
                        className="w-4 h-4" 
                        fill={likedTracks.includes(currentTrack.id) ? "white" : "none"}
                        color="white"
                      />
                    </button>
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-medium">
                    {currentTrack ? currentTrack.title : "No track selected"}
                  </h3>
                  <p className="text-sm text-white/60">
                    {currentTrack ? currentTrack.artist : ""}
                  </p>
                  
                  {/* Track description (only shown when expanded) */}
                  {isExpanded && currentTrack?.description && (
                    <p className="text-xs text-white/50 mt-2 max-w-xs mx-auto">
                      {currentTrack.description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div 
                  ref={progressRef}
                  className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer relative"
                  onClick={handleSeek}
                >
                  {/* Progress fill */}
                  <div 
                    className="h-full absolute left-0 top-0 transition-all duration-100"
                    style={{ 
                      width: `${progress}%`,
                      background: `linear-gradient(to right, ${trackColor}, white)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-between mb-6">
                {/* Previous button */}
                <button 
                  onClick={handlePrevious}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                
                {/* Play/Pause button */}
                <button 
                  onClick={togglePlayPause}
                  className="p-4 bg-white text-black rounded-full hover:bg-white/90 transition-colors shadow-lg"
                  style={{
                    boxShadow: `0 0 20px ${trackColor}33`
                  }}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </button>
                
                {/* Next button */}
                <button 
                  onClick={handleNext}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
              
              {/* Volume Control */}
              <div className="flex items-center space-x-2 mb-6">
                <button 
                  onClick={toggleMute}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : volume < 50 ? (
                    <Volume1 className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${trackColor} ${volume}%, rgba(255, 255, 255, 0.1) 0%)`
                  }}
                />
                
                {/* Toggle visualizer button */}
                <button
                  onClick={() => setIsVisualizing(!isVisualizing)}
                  className={`text-xs border border-white/10 px-2 py-1 rounded-sm ${isVisualizing ? 'bg-white/10 text-white' : 'text-white/60'}`}
                >
                  VIZ
                </button>
              </div>
              
              {/* Tabs & Playlist Toggle */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex">
                  <button
                    className={`text-xs px-3 py-1 ${activeTab === 'default' ? 'bg-white/10 text-white' : 'text-white/60'} rounded-l-sm`}
                    onClick={() => setActiveTab('default')}
                  >
                    Default
                  </button>
                  <button
                    className={`text-xs px-3 py-1 ${activeTab === 'uploaded' ? 'bg-white/10 text-white' : 'text-white/60'} rounded-r-sm`}
                    onClick={() => setActiveTab('uploaded')}
                  >
                    Uploaded
                  </button>
                </div>
                
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className="text-xs text-white/60 hover:text-white flex items-center space-x-1"
                >
                  <List className="w-3 h-3" />
                  <span>Playlist</span>
                </button>
              </div>
              
              {/* Playlist */}
              <AnimatePresence>
                {showPlaylist && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border border-white/10 max-h-40 overflow-y-auto rounded-sm backdrop-blur-lg">
                      {activeTab === 'default' ? (
                        tracks.length > 0 ? (
                          <div className="divide-y divide-white/5">
                            {tracks.map((track, index) => (
                              <div 
                                key={track.id}
                                className={`p-2 hover:bg-white/5 cursor-pointer flex items-center ${index === currentTrackIndex && activeTab === 'default' ? 'bg-white/10' : ''}`}
                                onClick={() => {
                                  setCurrentTrackIndex(index);
                                  setActiveTab('default');
                                }}
                              >
                                {/* Mini album art */}
                                <div className="w-8 h-8 mr-2 overflow-hidden rounded-sm">
                                  {track.coverArt ? (
                                    <img 
                                      src={track.coverArt} 
                                      alt={track.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <GeneratedCover 
                                      title={track.title} 
                                      artist={track.artist} 
                                      color={track.color} 
                                    />
                                  )}
                                </div>
                                
                                <div className="w-4 mr-2 text-center">
                                  {index === currentTrackIndex && activeTab === 'default' && isPlaying ? (
                                    <div className="flex space-x-0.5">
                                      {[1, 2, 3].map(i => (
                                        <div 
                                          key={i}
                                          className="w-0.5 h-3 bg-white/80 animate-pulse"
                                          style={{
                                            animationDelay: `${i * 0.2}s`,
                                            animationDuration: '0.8s'
                                          }}
                                        ></div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-white/40">{index + 1}</span>
                                  )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <div className="text-xs truncate">
                                    {track.title}
                                  </div>
                                  <div className="text-xs text-white/40 truncate">
                                    {track.artist}
                                  </div>
                                </div>
                                <div className="text-xs text-white/40">
                                  {formatTime(track.duration)}
                                </div>
                                
                                {/* Like indicator */}
                                {likedTracks.includes(track.id) && (
                                  <Heart className="w-3 h-3 ml-2 fill-white text-white" />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 text-center text-white/40 text-xs">
                            No default tracks available
                          </div>
                        )
                      ) : (
                        userTracks.length > 0 ? (
                          <div className="divide-y divide-white/5">
                            {userTracks.map((track, index) => (
                              <div 
                                key={track.id}
                                className={`p-2 hover:bg-white/5 flex items-center ${index === currentTrackIndex && activeTab === 'uploaded' ? 'bg-white/10' : ''}`}
                              >
                                {/* Mini color block or cover */}
                                <div className="w-8 h-8 mr-2 overflow-hidden rounded-sm">
                                  <GeneratedCover 
                                    title={track.title} 
                                    artist={track.artist} 
                                    color={track.color || "#7928CA"} 
                                  />
                                </div>
                                
                                <div 
                                  className="flex-1 overflow-hidden cursor-pointer"
                                  onClick={() => {
                                    setCurrentTrackIndex(index);
                                    setActiveTab('uploaded');
                                  }}
                                >
                                  <div className="flex items-center">
                                    <div className="w-4 mr-2 text-center">
                                      {index === currentTrackIndex && activeTab === 'uploaded' && isPlaying ? (
                                        <div className="flex space-x-0.5">
                                          {[1, 2, 3].map(i => (
                                            <div 
                                              key={i}
                                              className="w-0.5 h-3 bg-white/80 animate-pulse"
                                              style={{
                                                animationDelay: `${i * 0.2}s`,
                                                animationDuration: '0.8s'
                                              }}
                                            ></div>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-xs text-white/40">{index + 1}</span>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-xs truncate">
                                        {track.title}
                                      </div>
                                      <div className="text-xs text-white/40 truncate">
                                        {track.artist}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-white/40">
                                    {formatTime(track.duration)}
                                  </span>
                                  
                                  {/* Like button */}
                                  <button 
                                    className="text-white/40 hover:text-white/80"
                                    onClick={() => toggleLike(track.id)}
                                  >
                                    <Heart 
                                      className="w-3 h-3" 
                                      fill={likedTracks.includes(track.id) ? "white" : "none"}
                                    />
                                  </button>
                                  
                                  <button 
                                    className="text-white/40 hover:text-white/80"
                                    onClick={() => removeUserTrack(track.id)}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 text-center text-white/40 text-xs">
                            No uploaded tracks. Upload your own music below.
                          </div>
                        )
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Upload Button - only show on uploaded tab */}
              {activeTab === 'uploaded' && (
                <div className="mt-3">
                  <label className="flex items-center justify-center p-2 border border-white/10 cursor-pointer hover:bg-white/5 transition-colors text-white/70 hover:text-white rounded-sm">
                    <Upload className="w-3 h-3 mr-2" />
                    <span className="text-xs">Upload MP3</span>
                    <input 
                      type="file"
                      accept="audio/mp3,audio/mpeg"
                      className="hidden"
                      onChange={handleFileUpload}
                      multiple
                    />
                  </label>
                </div>
              )}
              
              {/* Social sharing/info buttons - shown when expanded */}
              {isExpanded && currentTrack && (
                <div className="mt-4 flex justify-center space-x-4">
                  <button className="p-2 text-white/60 hover:text-white transition-colors rounded-full border border-white/10">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-white/60 hover:text-white transition-colors rounded-full border border-white/10">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export { AudioPlayer, AudioPlayerButton };