import React, { useState } from 'react';
import { FiPlay, FiSquare, FiExternalLink, FiZap } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const LiveSnippet = ({ code, language }) => {
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();

  // Heuristic to fix wrong language selection by users (e.g. pasting Java but leaving dropdown on JS)
  let effectiveLang = language?.toLowerCase() || 'javascript';
  if (effectiveLang === 'javascript' || effectiveLang === 'js') {
    if (code.includes('public class ') || code.includes('public static void main') || code.includes('System.out.println')) {
      effectiveLang = 'java';
    } else if (code.includes('def ') && code.includes('print(') && !code.includes('function')) {
      effectiveLang = 'python';
    } else if (code.includes('#include')) {
      effectiveLang = 'cpp';
    }
  }

  // We only execute web languages directly
  const isRunnable = ['javascript', 'js', 'html', 'css'].includes(effectiveLang);
  const isBackend = ['python', 'java', 'cpp', 'c', 'c++', 'typescript', 'ts', 'go', 'rust'].includes(effectiveLang);

  const handleOpenSandbox = () => {
    const roomId = `snippet_${Math.random().toString(36).substring(2, 9)}`;
    let mappedLang = effectiveLang;
    if (mappedLang === 'js') mappedLang = 'javascript';
    if (mappedLang === 'ts') mappedLang = 'typescript';
    if (mappedLang === 'c++') mappedLang = 'cpp';
    
    navigate(`/sandbox/${roomId}`, { 
      state: { 
        initialCode: code, 
        initialLanguage: mappedLang 
      } 
    });
  };

  const handleRun = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleOpenNewTab = () => {
    const htmlContent = getExecutableHTML();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
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
          <button
            onClick={handleOpenNewTab}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[#a3a3a3] bg-white/5 border border-white/10 px-3 py-1.5 rounded hover:bg-white/10 hover:text-white transition-colors"
          >
            <FiExternalLink /> Open in New Tab
          </button>
        </div>
      )}

      {isBackend && (
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={handleOpenSandbox}
            className="group relative flex items-center gap-2 text-xs font-medium text-white bg-[#151515] border border-white/10 px-4 py-2 rounded-lg hover:border-[#a855f7]/50 hover:bg-[#1a1a1a] transition-all duration-300 overflow-hidden shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#a855f7]/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out" />
            <FiZap className="text-[#a855f7] relative z-10" /> 
            <span className="relative z-10 tracking-wide">Run in Sandbox</span>
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#a855f7]/10 border border-[#a855f7]/20">
            <div className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse" />
            <span className="text-[9px] font-bold text-[#d8b4fe] uppercase tracking-widest">Pro Only</span>
          </div>
        </div>
      )}

      {isRunning && (
        <div className="w-full border border-white/20 rounded-xl overflow-hidden bg-white mt-2 flex flex-col transition-all h-[280px]">
          {/* Mini-Browser Header */}
          <div className="bg-[#1e1e1e] border-b border-white/10 px-3 py-2 flex items-center justify-between">
            {/* Traffic Lights */}
            <div className="flex items-center gap-1.5 w-12">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
            
            {/* Address Bar / Title */}
            <div className="flex-1 flex justify-center">
              <div className="bg-black/50 rounded px-3 py-0.5 flex items-center justify-center max-w-[150px] w-full border border-white/5">
                <span className="text-[9px] text-white/50 font-mono flex items-center gap-1.5 tracking-wider">
                  <FiPlay size={8} className="text-[#ccff00]" /> localhost
                </span>
              </div>
            </div>

            {/* Spacer for centering */}
            <div className="w-12" />
          </div>
          
          {/* Content iframe */}
          <div className="flex-1 bg-white relative w-full h-full">
            <iframe
              className="w-full h-full absolute inset-0 border-none"
              // CRITICAL SECURITY FIX: 
              // We only use allow-scripts. We DO NOT use allow-same-origin.
              // This guarantees the iframe runs in a unique origin, completely isolated from our app's cookies/storage.
              sandbox="allow-scripts"
              srcDoc={getExecutableHTML()}
              title="Live Code Snippet"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSnippet;
