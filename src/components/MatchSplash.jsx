import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiMessageSquare, FiCompass } from 'react-icons/fi';

const MatchSplash = ({ matchedUser, onClose }) => {
  const navigate = useNavigate();
  const currentUser = useSelector((store) => store.user);
  
  if (!currentUser || !matchedUser) return null;

  const getInitials = (first, last) => {
    return `${(first || '?')[0]}${(last || '')[0] || ''}`.toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0a]/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-sm bg-[#141415] border border-white/[0.06] rounded-2xl p-8 flex flex-col items-center"
      >
        {/* Avatars side by side */}
        <div className="flex items-center justify-center mb-6 -space-x-4">
          {currentUser.photoUrl ? (
            <img src={currentUser.photoUrl} alt="You" className="w-16 h-16 rounded-full object-cover border-2 border-[#141415] z-10" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center text-lg font-bold text-white border-2 border-[#141415] z-10">
              {getInitials(currentUser.firstName, currentUser.lastName)}
            </div>
          )}
          {matchedUser.photoUrl ? (
            <img src={matchedUser.photoUrl} alt={matchedUser.firstName} className="w-16 h-16 rounded-full object-cover border-2 border-[#141415]" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ccff00] to-[#a3e635] flex items-center justify-center text-lg font-bold text-black border-2 border-[#141415]">
              {getInitials(matchedUser.firstName, matchedUser.lastName)}
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold text-white mb-1">Connected with {matchedUser.firstName}</h2>
        <p className="text-sm text-[#a3a3a3] text-center mb-8">
          You can now message each other and collaborate on projects.
        </p>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => navigate(`/chat/${matchedUser._id}`)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ccff00] hover:bg-[#bbf000] text-black font-bold rounded-xl transition-colors"
          >
            <FiMessageSquare size={16} /> Send Message
          </button>
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-[#a3a3a3] hover:text-white font-medium rounded-xl transition-colors border border-white/[0.06]"
          >
            <FiCompass size={16} /> Keep Exploring
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MatchSplash;
