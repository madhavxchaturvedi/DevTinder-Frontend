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
        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-transparent hover:border-[#0a0a0a] hover:shadow-[4px_4px_0px_#0a0a0a] transition-all cursor-pointer group mb-2"
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={user.photoUrl || "https://geographyandyou.com/images/user-profile.png"}
            alt={user.firstName}
            className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-[#0a0a0a] group-hover:border-[#ccff00] transition-all"
          />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#ccff00] rounded-full border-2 border-[#0a0a0a]"></div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pb-2">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-black text-[#0a0a0a] truncate">
              {user.firstName} {user.lastName}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <p className="text-sm text-[#a855f7] font-bold truncate">
              Tap to chat with your match!
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {(user.skills || []).slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[#0a0a0a] text-white font-bold"
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
