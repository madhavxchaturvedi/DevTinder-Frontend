import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Compass, Terminal } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh w-full flex flex-col items-center justify-center p-6 bg-[#09090b] text-[#f0f0f0] select-none">
      <div className="w-full max-w-md text-center">
        {/* Large 404 in muted mono */}
        <div className="font-mono text-8xl sm:text-9xl font-black text-white/10 tracking-widest mb-2 select-none">
          404
        </div>

        {/* 404 Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-xs font-mono font-bold uppercase tracking-widest mb-4">
          <Terminal className="h-3.5 w-3.5" />
          Route Not Found
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f0f0f0] mb-3">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-sm text-[#52525b] mb-8 leading-relaxed max-w-sm mx-auto">
          The route you are looking for does not exist or has been moved on OctoPair.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <button
            onClick={() => navigate("/feed")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#ccff00] text-black font-bold hover:bg-[#d9ff33] rounded-lg px-6 py-2.5 text-sm transition-all cursor-pointer shadow-[0_0_20px_rgba(204,255,0,0.15)]"
          >
            <Home className="h-4 w-4" />
            Return to Feed
          </button>

          <button
            onClick={() => navigate("/discover")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border border-white/10 text-[#a0a0a0] hover:border-white/20 hover:text-white rounded-lg px-6 py-2.5 text-sm transition-all cursor-pointer"
          >
            <Compass className="h-4 w-4" />
            Discover Devs
          </button>
        </div>

        <div className="mt-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-[#52525b] hover:text-[#f0f0f0] transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go back to previous page
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
