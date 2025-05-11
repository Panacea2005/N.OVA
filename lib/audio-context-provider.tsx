"use client";

import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  currentTrack: any | null;
  togglePlayPause: () => void;
  playTrack: (track: any) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  addUserTrack: (track: any) => void;
  removeUserTrack: (trackId: string) => void;
  getDefaultTracks: () => any[];
  getUserTracks: () => any[];
  switchToTab: (tab: 'default' | 'uploaded') => void;
  currentTab: string;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Default tracks
const defaultTracks = [
  {
    id: "1",
    title: "Ambient Cyberpunk",
    artist: "N.OVA",
    duration: 180, // in seconds
    src: "/audio/ambient_cyberpunk.mp3"
  },
  {
    id: "2",
    title: "Digital Dreams",
    artist: "N.OVA",
    duration: 240,
    src: "/audio/digital_dreams.mp3"
  },
  {
    id: "3",
    title: "Quantum Resonance",
    artist: "N.OVA",
    duration: 210,
    src: "/audio/quantum_resonance.mp3"
  }
];

export const AudioProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [userTracks, setUserTracks] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState('default');
  const [volume, setVolumeState] = useState(70);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Create audio element on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if audio already exists (for hot module replacement)
      const existingAudio = document.getElementById('global-audio-player') as HTMLAudioElement;
      if (existingAudio) {
        audioRef.current = existingAudio;
      } else {
        const audioElement = document.createElement('audio');
        audioElement.id = 'global-audio-player';
        document.body.appendChild(audioElement);
        audioRef.current = audioElement;
      }
      
      // Load saved state from localStorage
      try {
        const savedVolume = localStorage.getItem('audioPlayerVolume');
        if (savedVolume) {
          setVolumeState(parseInt(savedVolume));
          if (audioRef.current) {
            audioRef.current.volume = parseInt(savedVolume) / 100;
          }
        }
        
        const savedUserTracks = localStorage.getItem('userTracks');
        if (savedUserTracks) {
          setUserTracks(JSON.parse(savedUserTracks));
        }
        
        const savedCurrentTab = localStorage.getItem('audioCurrentTab');
        if (savedCurrentTab) {
          setCurrentTab(savedCurrentTab);
        }
        
        const savedCurrentTrackIndex = localStorage.getItem('audioCurrentTrackIndex');
        if (savedCurrentTrackIndex) {
          setCurrentTrackIndex(parseInt(savedCurrentTrackIndex));
        }
      } catch (error) {
        console.error('Error loading audio state:', error);
      }
      
      setIsInitialized(true);
    }
    
    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);
  
  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleEnded = () => {
      nextTrack();
    };
    
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('audioPlayerVolume', volume.toString());
      localStorage.setItem('userTracks', JSON.stringify(userTracks));
      localStorage.setItem('audioCurrentTab', currentTab);
      localStorage.setItem('audioCurrentTrackIndex', currentTrackIndex.toString());
    }
  }, [volume, userTracks, currentTab, currentTrackIndex]);
  
  // Set current track when track index or tab changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const tracks = currentTab === 'default' ? defaultTracks : userTracks;
    if (tracks.length === 0) {
      setCurrentTrack(null);
      return;
    }
    
    // Validate track index
    const validIndex = Math.min(currentTrackIndex, tracks.length - 1);
    if (validIndex !== currentTrackIndex) {
      setCurrentTrackIndex(validIndex);
      return;
    }
    
    const track = tracks[validIndex];
    setCurrentTrack(track);
    
    // Update audio source if playing
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = track.src;
      audioRef.current.load();
      
      if (wasPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Audio play error:", error);
            setIsPlaying(false);
          });
        }
      }
    }
  }, [currentTrackIndex, currentTab, userTracks, isInitialized]);
  
  // Get current tracks array based on active tab
  const getCurrentTracks = () => {
    return currentTab === 'default' ? defaultTracks : userTracks;
  };
  
  // Toggle play/pause
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (!currentTrack) {
      // If no track is selected, play the first track
      const tracks = getCurrentTracks();
      if (tracks.length === 0) return;
      
      setCurrentTrackIndex(0);
      audio.src = tracks[0].src;
      audio.load();
    }
    
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
  
  // Play a specific track
  const playTrack = (track: any) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const tracks = getCurrentTracks();
    const trackIndex = tracks.findIndex(t => t.id === track.id);
    
    if (trackIndex !== -1) {
      setCurrentTrackIndex(trackIndex);
      audio.src = track.src;
      audio.load();
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio play error:", error);
          setIsPlaying(false);
        });
      }
      
      setIsPlaying(true);
    }
  };
  
  // Play next track
  const nextTrack = () => {
    const tracks = getCurrentTracks();
    if (tracks.length === 0) return;
    
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
  };
  
  // Play previous track
  const previousTrack = () => {
    const tracks = getCurrentTracks();
    if (tracks.length === 0) return;
    
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
  };
  
  // Set volume
  const setVolume = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
    setVolumeState(newVolume);
  };
  
  // Add user track
  const addUserTrack = (track: any) => {
    setUserTracks(prev => [...prev, track]);
  };
  
  // Remove user track
  const removeUserTrack = (trackId: string) => {
    setUserTracks(prev => {
      const updatedTracks = prev.filter(track => track.id !== trackId);
      
      // If removing current track, adjust current index
      if (currentTab === 'uploaded') {
        const trackIndex = prev.findIndex(track => track.id === trackId);
        if (trackIndex === currentTrackIndex) {
          // If it's the last track, go to first track or switch to default tab
          if (updatedTracks.length === 0) {
            setCurrentTab('default');
            setCurrentTrackIndex(0);
          } else if (trackIndex >= updatedTracks.length) {
            setCurrentTrackIndex(0);
          }
        } else if (trackIndex < currentTrackIndex) {
          setCurrentTrackIndex(currentTrackIndex - 1);
        }
      }
      
      return updatedTracks;
    });
  };
  
  // Get default tracks
  const getDefaultTracks = () => defaultTracks;
  
  // Get user tracks
  const getUserTracks = () => userTracks;
  
  // Switch active tab
  const switchToTab = (tab: 'default' | 'uploaded') => {
    const targetTracks = tab === 'default' ? defaultTracks : userTracks;
    
    // Check if there are tracks in the target tab
    if (targetTracks.length === 0) {
      return; // Don't switch to an empty tab
    }
    
    setCurrentTab(tab);
    setCurrentTrackIndex(0); // Reset to first track in new tab
  };
  
  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentTrack,
        togglePlayPause,
        playTrack,
        nextTrack,
        previousTrack,
        setVolume,
        addUserTrack,
        removeUserTrack,
        getDefaultTracks,
        getUserTracks,
        switchToTab,
        currentTab
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};