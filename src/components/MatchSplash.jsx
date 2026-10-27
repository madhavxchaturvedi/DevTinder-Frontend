import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MessageSquare, Compass, Sparkles } from "lucide-react";
import { DEFAULT_AVATAR } from "../utils/constants";

const MatchSplash = ({ matchedUser, onClose }) => {
  const navigate = useNavigate();
  const currentUser = useSelector((store) => store.user);

  if (!currentUser || !matchedUser) return null;

  const getInitials = (first, last) => {
    return `${(first || "?")[0]}${(last || "")[0] || ""}`.toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <Motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="glass-card relative w-full max-w-sm bg-[#111113] border border-white/[0.07] rounded-2xl p-6 sm:p-8 flex flex-col items-center overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)]"
      >
        {/* Glow accents */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#ccff00]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#b266ff]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Sparkle badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-[#ccff00] text-[10px] font-mono font-bold uppercase tracking-widest mb-6">
          <Sparkles className="w-3 h-3" />
          <span>It's a Match</span>
        </div>

        {/* Avatars side by side with neon rings */}
        <div className="flex items-center justify-center mb-6 -space-x-4">
          {currentUser.photoUrl ? (
            <img
              src={currentUser.photoUrl}
              alt="You"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.35)] z-10"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_AVATAR;
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ccff00] to-[#88b300] flex items-center justify-center text-lg font-bold text-black ring-2 ring-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.35)] z-10">
              {getInitials(currentUser.firstName, currentUser.lastName)}
            </div>
          )}

          {matchedUser.photoUrl ? (
            <img
              src={matchedUser.photoUrl}
              alt={matchedUser.firstName}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#b266ff] shadow-[0_0_20px_rgba(178,102,255,0.35)]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_AVATAR;
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#b266ff] to-[#6d28d9] flex items-center justify-center text-lg font-bold text-white ring-2 ring-[#b266ff] shadow-[0_0_20px_rgba(178,102,255,0.35)]">
              {getInitials(matchedUser.firstName, matchedUser.lastName)}
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold text-[#f0f0f0] mb-1.5 text-center tracking-tight">
          Connected with {matchedUser.firstName}
        </h2>
        <p className="text-xs text-[#52525b] text-center mb-6 leading-relaxed max-w-xs">
          You and {matchedUser.firstName} can now message each other directly and collaborate on real-time projects.
        </p>

        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              onClose?.();
              navigate(`/chat/${matchedUser._id}`);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#ccff00] hover:bg-[#d9ff33] text-black font-bold text-xs sm:text-sm rounded-lg transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)]"
          >
            <MessageSquare className="w-4 h-4" /> Send Message
          </button>
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/[0.04] text-[#a0a0a0] hover:text-[#f0f0f0] font-medium text-xs sm:text-sm rounded-lg transition-colors border border-white/10 hover:border-white/20"
          >
            <Compass className="w-4 h-4" /> Keep Exploring
          </button>
        </div>
      </Motion.div>
    </div>
  );
};

export default MatchSplash;
