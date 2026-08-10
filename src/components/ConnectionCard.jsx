import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ConnectionCard = ({ user }) => {
  if (!user) return null;

  return (
    <Link to={`/chat/${user._id}`}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#121212] border border-white/5 hover:border-[#ccff00]/50 hover:bg-[#1a1a1a] transition-all cursor-pointer group mb-3 shadow-md"
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={user.photoUrl || "https://geographyandyou.com/images/user-profile.png"}
            alt={user.firstName}
            className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-transparent group-hover:border-[#ccff00] transition-all"
          />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#ccff00] rounded-full border-2 border-[#121212]"></div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pb-2">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-bold text-[#e5e5e5] truncate group-hover:text-white transition-colors">
              {user.firstName} {user.lastName}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <p className="text-sm text-[#a855f7] font-semibold truncate group-hover:text-[#b266ff] transition-colors">
              Tap to chat with your match!
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {(user.skills || []).slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[10px] px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[#a3a3a3] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ConnectionCard;
