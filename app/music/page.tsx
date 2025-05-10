"use client";

import dynamic from "next/dynamic";

// Create a simple loading component
const LoadingFallback = () => {
  return (
    <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-t-2 border-b-2 border-white rounded-full animate-spin mb-4 mx-auto" />
        <div className="text-white/70 uppercase">Loading N.AURORA...</div>
      </div>
    </div>
  );
};

// Completely disable SSR for the music page component
const MusicPageComponent = dynamic(() => import("./components/page"), {
  ssr: false,
  loading: () => <LoadingFallback />
});

export default function MusicPage() {
  return <MusicPageComponent />;
}