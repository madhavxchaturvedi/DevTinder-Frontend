import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const RequestCard = ({ user, onAccept, onReject }) => {
  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#121212] border border-white/5 hover:border-white/10 hover:bg-[#1a1a1a] transition-all group"
    >
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.location.href = `/user/${user._id}`}>
        <div className="relative">
          <img
            src={user.photoUrl || "https://geographyandyou.com/images/user-profile.png"}
            alt={user.firstName}
            className="w-14 h-14 rounded-full object-cover border border-white/10 group-hover:border-[#ccff00] transition-colors"
          />
        </div>
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-[#e5e5e5] group-hover:text-white transition-colors">
            {user.firstName} {user.lastName} {user.age && <span className="font-semibold text-[#a3a3a3] ml-1">· {user.age}</span>}
          </h2>
          <p className="text-[#a3a3a3] text-[11px] font-medium mt-0.5 line-clamp-1">
            {user.about || "Developer"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onReject}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/5 text-[#a3a3a3] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all"
        >
          ✖
        </button>
        <button
          onClick={onAccept}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] hover:bg-[#ccff00] hover:text-[#0a0a0a] transition-all font-bold"
        >
          ✓
        </button>
      </div>
    </motion.div>
  );
};

export default RequestCard;
