import axios from "axios";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import React, { useState, useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeFeed } from "../redux/feedSlice";

const UserCard = ({ user, isFront, onMatch }) => {
  const dispatch = useDispatch();
  const controls = useAnimation();
  const [hasExited, setHasExited] = useState(false);

  // Motion Values for Physics
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-25, 25]);
  
  // Opacity for LIKE and NOPE stamps based on drag distance
  const likeOpacity = useTransform(x, [10, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-10, -100], [0, 1]);

  // Glow shadow that changes color based on swipe direction
  const boxShadow = useTransform(
    x,
    [-150, 0, 150],
    [
      "0 0 0px rgba(0,0,0,1)", // No glow on left, just flat shadow later
      "8px 8px 0px rgba(10,10,10,1)", // Hard drop shadow default
      "0 0 0px rgba(0,0,0,1)" // No glow on right
    ]
  );

  const handleSendRequest = async (status, userId) => {
    // Optimistic UI update
    dispatch(removeFeed(userId));

    try {
      const res = await axios.post(
        BASE_URL + "/request/send/" + status + "/" + userId,
        {},
        { withCredentials: true }
      );
      if (res.data?.isMatch && onMatch) {
        onMatch(res.data.matchedUser);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDragEnd = async (event, info) => {
    if (!isFront || hasExited) return;
    
    const swipeThreshold = 100;
    const velocityThreshold = 500;
    
    const draggedRight = info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold;
    const draggedLeft = info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold;

    if (draggedRight) {
      setHasExited(true);
      await controls.start({ x: window.innerWidth, opacity: 0, transition: { duration: 0.3 } });
      handleSendRequest("interested", user._id);
    } else if (draggedLeft) {
      setHasExited(true);
      await controls.start({ x: -window.innerWidth, opacity: 0, transition: { duration: 0.3 } });
      handleSendRequest("ignored", user._id);
    } else {
      // Snap back to center
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  const handleAction = async (status) => {
    if (!isFront || hasExited) return;
    setHasExited(true);
    
    if (status === "interested") {
      await controls.start({ x: window.innerWidth, rotate: 20, opacity: 0, transition: { duration: 0.3 } });
      handleSendRequest("interested", user._id);
    } else {
      await controls.start({ x: -window.innerWidth, rotate: -20, opacity: 0, transition: { duration: 0.3 } });
      handleSendRequest("ignored", user._id);
    }
  };

  useEffect(() => {
    if (!hasExited) {
      controls.start(
        isFront
          ? { scale: 1, y: 0, opacity: 1, zIndex: 10, transition: { type: "spring", stiffness: 350, damping: 25 } }
          : { scale: 0.94, y: 25, opacity: 0.7, zIndex: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }
      );
    }
  }, [isFront, hasExited, controls]);

  if (!user) return null;

  return (
    <div className={`${isFront !== undefined ? "absolute top-0 left-0" : "relative"} w-full flex flex-col items-center`}>
      <motion.div
        className="relative w-[340px] h-[520px] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-white/10 bg-[#121212] shadow-xl"
        drag={isFront && !hasExited ? "x" : false}
        // Remove dragConstraints so it doesn't fight the exit animation
        dragConstraints={false}
        dragElastic={1}
        onDragEnd={handleDragEnd}
        style={{ x, rotate, boxShadow }}
        animate={controls}
        initial={
          isFront 
            ? { scale: 1, y: 0, opacity: 1 } 
            : { scale: 0.94, y: 25, opacity: 0 }
        }
      >
        {/* Profile Image */}
        <img
          src={user.photoUrl || "https://geographyandyou.com/images/user-profile.png"}
          alt={user.firstName}
          className="w-full h-full object-cover pointer-events-none"
        />

        {/* ── Active LIKE / NOPE Stamps ── */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-10 left-8 z-20 pointer-events-none"
        >
          <div className="border-2 border-green-500 rounded-lg px-4 py-1 bg-green-500/20 backdrop-blur-sm transform -rotate-12">
            <span className="text-green-500 text-2xl font-bold tracking-wider uppercase">
              Like
            </span>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-10 right-8 z-20 pointer-events-none"
        >
          <div className="border-2 border-red-500 rounded-lg px-4 py-1 bg-red-500/20 backdrop-blur-sm transform rotate-12">
            <span className="text-red-500 text-2xl font-bold tracking-wider uppercase">
              Nope
            </span>
          </div>
        </motion.div>

          {/* Content gradient overlay */}
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pt-32 pb-6 px-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {user.firstName} {user.lastName}
            </h2>
            {user.age && (
              <p className="text-xs text-[#a3a3a3] font-medium mt-1 uppercase tracking-wider">
                {user.age}
              </p>
            )}

            {/* Skills tags */}
            {user.skills && user.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {user.skills.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="text-[10px] font-semibold text-[#e5e5e5] bg-white/10 border border-white/5 px-2.5 py-1 rounded-md"
                  >
                    {skill}
                  </span>
                ))}
                {user.skills.length > 4 && (
                  <span className="text-[10px] font-semibold text-[#a3a3a3] bg-transparent border border-white/5 px-2.5 py-1 rounded-md">
                    +{user.skills.length - 4}
                  </span>
                )}
              </div>
            )}

            {user.about && (
              <p className="text-xs text-[#a3a3a3] mt-4 line-clamp-2 leading-relaxed">
                {user.about}
              </p>
            )}
          </div>
      </motion.div>

      {/* Action Buttons (Only visible on front card) */}
      <motion.div 
        className="flex justify-center gap-6 mt-8 pointer-events-auto relative z-20"
        animate={{ opacity: isFront && !hasExited ? 1 : 0, scale: isFront && !hasExited ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: isFront && !hasExited ? "auto" : "none" }}
      >
        <button
          onClick={() => handleAction("ignored")}
          disabled={!isFront || hasExited}
          className="w-16 h-16 bg-white border-4 border-[#0a0a0a] rounded-full flex items-center justify-center shadow-[4px_4px_0px_#0a0a0a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0a0a0a] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50"
        >
          <span className="text-red-500 text-3xl font-black">✖</span>
        </button>
        <button
          onClick={() => handleAction("interested")}
          disabled={!isFront || hasExited}
          className="w-16 h-16 bg-[#ccff00] border-4 border-[#0a0a0a] rounded-full flex items-center justify-center shadow-[4px_4px_0px_#0a0a0a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0a0a0a] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50"
        >
          <span className="text-[#0a0a0a] text-3xl font-black">❤</span>
        </button>
      </motion.div>
    </div>
  );
};

export default UserCard;
