import React, { useState } from 'react';
import { FiPlay, FiSquare } from 'react-icons/fi';

const LiveSnippet = ({ code, language }) => {
  const [isRunning, setIsRunning] = useState(false);

  // We only execute web languages directly
  const isRunnable = ['javascript', 'js', 'html', 'css'].includes(language?.toLowerCase());

  const handleRun = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  // Wrap the code into a basic HTML structure if it's purely JS or CSS
  const getExecutableHTML = () => {
    if (language === 'html') return code;
    if (language === 'css') return `<style>${code}</style><div class="preview-text">Preview</div>`;
    
    // For JS, we catch console logs to display them on screen if needed, 
    // or just let them run. For simplicity in V1, we just run the JS.
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: monospace; color: #fff; background: #0a0a0a; padding: 8px; margin: 0; }
            .log-line { border-bottom: 1px solid #333; padding: 4px 0; }
            .log-error { color: #ff5555; }
          </style>
        </head>
        <body>
          <script>
            // Intercept console.log and console.error to show them in the DOM
            (function(){
              var oldLog = console.log;
              var oldError = console.error;
              console.log = function(...args) {
                var output = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
                document.body.innerHTML += '<div class="log-line">' + output + '</div>';
                oldLog.apply(console, args);
              };
              console.error = function(...args) {
                var output = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
                document.body.innerHTML += '<div class="log-line log-error">' + output + '</div>';
                oldError.apply(console, args);
              };
              window.onerror = function(message, source, lineno, colno, error) {
                document.body.innerHTML += '<div class="log-line log-error">' + message + '</div>';
                return true;
              };
            })();
          </script>
          <script>
            try {
              ${code}
            } catch(e) {
              console.error(e.message);
            }
          </script>
        </body>
      </html>
    `;
  };

  return (
    <div className="w-full flex flex-col mt-3">
      {isRunnable && (
        <div className="flex items-center gap-2 mb-2">
          {!isRunning ? (
            <button
              onClick={handleRun}
              className="flex items-center gap-1.5 text-xs font-bold text-[#0a0a0a] bg-[#ccff00] px-3 py-1.5 rounded hover:bg-[#b3e600] transition-colors"
            >
              <FiPlay /> Run Snippet
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-red-500/20 border border-red-500/50 px-3 py-1.5 rounded hover:bg-red-500/30 transition-colors"
            >
              <FiSquare className="text-red-500" /> Stop
            </button>
          )}
        </div>
      )}

      {isRunning && (
        <div className="w-full border border-[#ccff00]/30 rounded-lg overflow-hidden bg-[#0a0a0a] min-h-[150px] mb-2 relative">
          <div className="absolute top-0 left-0 w-full bg-[#ccff00]/10 border-b border-[#ccff00]/20 px-3 py-1 flex items-center justify-between">
            <span className="text-[10px] text-[#ccff00] font-mono uppercase tracking-wider">Live Preview Sandbox</span>
          </div>
          <iframe
            className="w-full h-full min-h-[150px] mt-6 border-none"
            // CRITICAL SECURITY FIX: 
            // We only use allow-scripts. We DO NOT use allow-same-origin.
            // This guarantees the iframe runs in a unique origin, completely isolated from our app's cookies/storage.
            sandbox="allow-scripts"
            srcDoc={getExecutableHTML()}
            title="Live Code Snippet"
          />
        </div>
      )}
    </div>
  );
};

export default LiveSnippet;
