export const dynamic = 'force-dynamic';

export default function MusicPageShell() {
  return (
    <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
      <div id="music-app-root">
        {/* This is intentionally empty - the client script will mount the app here */}
        <noscript>
          <div className="text-center p-8">
            <div className="mb-4">JavaScript is required to use the Music Generator</div>
            <div className="text-sm opacity-70">Please enable JavaScript in your browser</div>
          </div>
        </noscript>
      </div>
      
      {/* Client-side script to inject the app once hydrated */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Only run in the browser
              if (typeof window === 'undefined') return;
              
              function loadApp() {
                const root = document.getElementById('music-app-root');
                if (!root) return;
                
                // First, show loading state
                root.innerHTML = \`
                  <div class="text-center">
                    <div class="w-16 h-16 border-t-2 border-b-2 border-white rounded-full animate-spin mb-4 mx-auto"></div>
                    <div class="text-white/70 uppercase">Loading N.AURORA Music Generator...</div>
                  </div>
                \`;
                
                // Dynamic import the app component
                import('/music/components/client')
                  .then(module => {
                    const App = module.default;
                    // Create a container for the app
                    const appContainer = document.createElement('div');
                    root.innerHTML = '';
                    root.appendChild(appContainer);
                    
                    // Render the app
                    App(appContainer);
                  })
                  .catch(error => {
                    console.error('Failed to load music app:', error);
                    root.innerHTML = \`
                      <div class="text-center text-red-500 p-8">
                        <div class="mb-4">Failed to load the Music Generator</div>
                        <div class="text-sm opacity-70">Please try refreshing the page</div>
                      </div>
                    \`;
                  });
              }
              
              // Load app when DOM is ready
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', loadApp);
              } else {
                loadApp();
              }
            })();
          `,
        }}
      />
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}