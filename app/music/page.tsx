"use client";

import { useState, useEffect } from 'react';
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function MusicPage() {
  const [isClient, setIsClient] = useState(false);

  // This effect runs only in the browser, after hydration
  useEffect(() => {
    setIsClient(true);
    
    // Load the music component dynamically (only in browser)
    import('./components/MusicPageContent')
      .then(module => {
        const MusicPageContent = module.default;
        const appRoot = document.getElementById('music-app-root');
        
        if (appRoot) {
          // Create a new React root and render the music component
          const { createRoot } = require('react-dom/client');
          const root = createRoot(appRoot);
          root.render(<MusicPageContent />);
        }
      })
      .catch(error => {
        console.error('Failed to load music component:', error);
      });
  }, []);

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

      {/* Container for the dynamically loaded music component */}
      <div id="music-app-root" className="container mx-auto px-2 pt-24 pb-16 relative z-10">
        {!isClient && (
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-t-2 border-b-2 border-white rounded-full animate-spin mb-4 mx-auto" />
              <div className="text-white/70 uppercase">Loading N.AURORA Music Generator...</div>
            </div>
          </div>
        )}
      </div>

      <Footer />

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
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