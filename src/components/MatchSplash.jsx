import React from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const MatchSplash = ({ matchedUser, onClose }) => {
  const navigate = useNavigate();
  const currentUser = useSelector((store) => store.user);
  
  if (!currentUser || !matchedUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0a]/80 backdrop-blur-lg">
      <Confetti 
        width={window.innerWidth} 
        height={window.innerHeight} 
        recycle={false} 
        numberOfPieces={400} 
        gravity={0.15}
        colors={['#ccff00', '#a855f7', '#0a0a0a', '#ffffff']}
      />
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-sm neo-card p-8 flex flex-col items-center relative overflow-hidden"
      >
        {/* Abstract background shape */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#ccff00] rounded-full border-4 border-[#0a0a0a] shadow-[8px_8px_0px_#0a0a0a] opacity-20" />

        <h2 className="text-4xl font-black text-[#a855f7] mb-8 text-center uppercase tracking-wider drop-shadow-[2px_2px_0px_#0a0a0a] relative z-10">
          It's a Match!
        </h2>

        <div className="flex items-center justify-center mb-8 relative z-10">
          <motion.img
            initial={{ x: -80, opacity: 0, rotate: -15 }}
            animate={{ x: 15, opacity: 1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            src={currentUser.photoUrl}
            alt="You"
            className="w-28 h-28 rounded-full object-cover border-4 border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] z-10 bg-white"
          />
          <motion.img
            initial={{ x: 80, opacity: 0, rotate: 15 }}
            animate={{ x: -15, opacity: 1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            src={matchedUser.photoUrl}
            alt={matchedUser.firstName}
            className="w-28 h-28 rounded-full object-cover border-4 border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] z-0 bg-white"
          />
        </div>

        <p className="text-gray-700 text-center mb-10 text-[15px] font-bold leading-relaxed relative z-10">
          You and <span className="text-[#0a0a0a]">{matchedUser.firstName}</span> have connected and can now start chatting.
        </p>

        <div className="w-full flex flex-col gap-3 relative z-10">
          <button
            onClick={() => navigate(`/chat/${matchedUser._id}`)}
            className="neo-btn-primary w-full"
          >
            Send Message
          </button>
          <button
            onClick={onClose}
            className="neo-btn-secondary w-full"
          >
            Keep Swiping
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MatchSplash;
