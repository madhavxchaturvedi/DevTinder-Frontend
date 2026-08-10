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
        colors={['#fe0142', '#fe5a33', '#ffffff', '#ffd700', '#ffb6c1']}
      />
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-sm bg-[#0f0f0f] border border-white/10 rounded-[32px] p-8 flex flex-col items-center shadow-2xl shadow-black/80 relative overflow-hidden"
      >
        {/* Glow behind avatars */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#fe0142]/20 rounded-full blur-[60px]" />

        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#fe5a33] to-[#fe0142] mb-8 text-center italic tracking-wider uppercase drop-shadow-sm relative z-10">
          It's a Match!
        </h2>

        <div className="flex items-center justify-center mb-8 relative z-10">
          <motion.img
            initial={{ x: -80, opacity: 0, rotate: -15 }}
            animate={{ x: 15, opacity: 1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            src={currentUser.photoUrl}
            alt="You"
            className="w-28 h-28 rounded-full object-cover ring-[6px] ring-[#0f0f0f] shadow-xl z-10"
          />
          <motion.img
            initial={{ x: 80, opacity: 0, rotate: 15 }}
            animate={{ x: -15, opacity: 1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            src={matchedUser.photoUrl}
            alt={matchedUser.firstName}
            className="w-28 h-28 rounded-full object-cover ring-[6px] ring-[#0f0f0f] shadow-xl z-0"
          />
        </div>

        <p className="text-white/80 text-center mb-10 text-[15px] font-medium leading-relaxed relative z-10">
          You and <span className="text-white font-bold">{matchedUser.firstName}</span> have connected and can now start chatting.
        </p>

        <div className="w-full flex flex-col gap-3 relative z-10">
          <button
            onClick={() => navigate(`/chat/${matchedUser._id}`)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#fe5a33] via-[#fe0142] to-[#fe6d27] text-white font-bold shadow-lg shadow-[#fe0142]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Send Message
          </button>
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 font-semibold transition-all"
          >
            Keep Swiping
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MatchSplash;
