import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const RequestCard = ({ user, onAccept, onReject }) => {
  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full aspect-[3/4] flex flex-col rounded-2xl overflow-hidden group border-4 border-[#0a0a0a] bg-white shadow-[6px_6px_0px_#0a0a0a]"
    >
      <div className="flex-1 relative border-b-4 border-[#0a0a0a]">
        <img
          src={user.photoUrl || "https://geographyandyou.com/images/user-profile.png"}
          alt={user.firstName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 absolute inset-0"
        />
      </div>

      {/* Solid Content Block */}
      <div className="bg-white p-4 flex flex-col justify-between shrink-0">
        
        {/* Profile Info */}
        <Link to={`/user/${user._id}`} className="block mb-4 hover:opacity-80 transition-opacity cursor-pointer z-10">
          <h2 className="text-lg font-black text-[#0a0a0a] flex items-center gap-2 truncate">
            {user.firstName} {user.age && <span className="font-bold text-gray-500">{user.age}</span>}
          </h2>
          <p className="text-gray-600 text-xs font-bold mt-1 line-clamp-1">
            {user.about || "Developer"}
          </p>
        </Link>

        {/* Floating Action Buttons */}
        <div className="flex gap-3 justify-center relative z-20">
          <button
            onClick={onReject}
            className="w-10 h-10 bg-white border-2 border-[#0a0a0a] rounded-full flex items-center justify-center shadow-[2px_2px_0px_#0a0a0a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#0a0a0a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <span className="text-red-500 text-lg font-black">✖</span>
          </button>
          <button
            onClick={onAccept}
            className="w-10 h-10 bg-[#ccff00] border-2 border-[#0a0a0a] rounded-full flex items-center justify-center shadow-[2px_2px_0px_#0a0a0a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#0a0a0a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <span className="text-[#0a0a0a] text-lg font-black">❤</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RequestCard;
