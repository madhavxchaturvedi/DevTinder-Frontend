import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";

const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2352525b'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

const ConnectionCard = ({ user }) => {
  if (!user) return null;

  return (
    <Link to={`/chat/${user._id}`}>
      <Motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#111113] border border-white/[0.07] hover:border-[#ccff00]/40 hover:bg-white/[0.03] transition-all cursor-pointer group mb-3"
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={user.photoUrl || DEFAULT_AVATAR}
            alt={user.firstName}
            className="w-14 h-14 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-[#ccff00] transition-all"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_AVATAR;
            }}
          />
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-[#09090b]" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-sm font-bold text-[#f0f0f0] truncate group-hover:text-[#ccff00] transition-colors">
              {user.firstName} {user.lastName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-xs text-[#52525b] truncate group-hover:text-[#a0a0a0] transition-colors">
              {user.headline || "Tap to chat with your match"}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {(user.skills || []).slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/[0.07] text-[#f0f0f0]/80"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Motion.div>
    </Link>
  );
};

export default ConnectionCard;
