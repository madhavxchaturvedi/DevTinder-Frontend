import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Check, X } from "lucide-react";

const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2352525b'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

const RequestCard = ({ user, onAccept, onReject }) => {
  if (!user) return null;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card bg-[#111113] border border-white/[0.07] hover:border-white/[0.12] rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
    >
      <Link to={`/user/${user._id}`} className="flex items-center gap-3.5 cursor-pointer min-w-0">
        <div className="relative shrink-0">
          <img
            src={user.photoUrl || DEFAULT_AVATAR}
            alt={user.firstName}
            className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10 group-hover:ring-[#ccff00]/40 transition-all"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_AVATAR;
            }}
          />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold text-[#f0f0f0] group-hover:text-[#ccff00] transition-colors truncate">
              {user.firstName} {user.lastName}
            </h2>
            {user.age && (
              <span className="font-mono text-[11px] text-[#52525b]">
                , {user.age}
              </span>
            )}
          </div>
          <p className="text-[#52525b] text-xs font-normal mt-0.5 line-clamp-1">
            {user.headline || user.about || "Developer"}
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          onClick={onReject}
          aria-label="Decline request"
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          <span>Decline</span>
        </button>
        <button
          onClick={onAccept}
          aria-label="Accept request"
          className="border border-[#ccff00] text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-semibold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(204,255,0,0.1)] hover:shadow-[0_0_16px_rgba(204,255,0,0.25)]"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Accept</span>
        </button>
      </div>
    </Motion.div>
  );
};

export default RequestCard;
