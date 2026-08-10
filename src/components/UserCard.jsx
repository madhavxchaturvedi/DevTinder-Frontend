import axios from "axios";
import { motion, useMotionValue, useTransform } from "framer-motion";
import React, { useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeFeed } from "../redux/feedSlice";

const UserCard = ({ user, isFront }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const dispatch = useDispatch();
  const [exitX, setExitX] = useState(0);

  const handleSendRequest = async (status, userId) => {
    try {
      await axios.post(
        BASE_URL + "/request/send/" + status + "/" + userId,
        {},
        { withCredentials: true }
      );
      dispatch(removeFeed(userId));
    } catch (err) {
      console.log(err);
    }
  };

  const handleDragEnd = (_, info) => {
    // Only allow drag actions if it's the front card
    if (!isFront) return;
    
    if (info.offset.x > 150) {
      setExitX(window.innerWidth);
    } else if (info.offset.x < -150) {
      setExitX(-window.innerWidth);
    }
  };

  const handleAction = (status) => {
    if (!isFront) return;
    
    if (status === "interested") {
      setExitX(window.innerWidth);
    } else {
      setExitX(-window.innerWidth);
    }
  };

  const onAnimationComplete = () => {
    if (exitX === window.innerWidth) {
      handleSendRequest("interested", user._id);
    } else if (exitX === -window.innerWidth) {
      handleSendRequest("ignored", user._id);
    }
  };

  if (!user) return null;

  return (
    <div className="absolute top-0 left-0 w-full flex flex-col items-center">
      {/* Card with Motion */}
      <motion.div
        className="relative w-[340px] h-[500px] rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
        drag={isFront && exitX === 0 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, rotate }}
        onDragEnd={handleDragEnd}
        animate={
          exitX !== 0
            ? { x: exitX, opacity: 0, transition: { duration: 0.3 } }
            : isFront
            ? { scale: 1, y: 0, opacity: 1, filter: "blur(0px)", zIndex: 10 }
            : { scale: 0.92, y: 25, opacity: 0.8, filter: "blur(4px)", zIndex: 0 }
        }
        transition={
          exitX !== 0
            ? { duration: 0.3 }
            : { type: "spring", stiffness: 300, damping: 20 }
        }
        onAnimationComplete={onAnimationComplete}
      >
        {/* Background Image */}
        <img
          src={user.photoUrl || "https://geographyandyou.com/images/user-profile.png"}
          alt={user.firstName}
          className="w-full h-full object-cover pointer-events-none"
        />

        {/* Gradient & Content */}
        <div className="absolute bottom-0 w-full h-[45%] bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent p-5 pointer-events-none flex flex-col justify-end pb-6">
          <h2 className="text-white text-3xl font-extrabold drop-shadow-md">
            {user.firstName}{user.age && `, ${user.age}`}
          </h2>
          <p className="text-white/85 font-medium text-sm mt-1.5 leading-relaxed line-clamp-2">
            {user.about}
          </p>
          {user.skills && user.skills.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {user.skills.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="bg-white/15 backdrop-blur-md border border-white/10 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        className="flex justify-center gap-8 mt-6 pointer-events-auto"
        animate={{ opacity: isFront ? 1 : 0, scale: isFront ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: isFront ? "auto" : "none" }}
      >
        <button
          onClick={() => isFront && handleAction("ignored")}
          disabled={!isFront || exitX !== 0}
          className="w-14 h-14 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:bg-white/10 transition disabled:opacity-50"
        >
          <span className="text-[#fe0142] text-2xl font-bold">✖</span>
        </button>
        <button
          onClick={() => isFront && handleAction("interested")}
          disabled={!isFront || exitX !== 0}
          className="w-14 h-14 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:bg-white/10 transition disabled:opacity-50"
        >
          <span className="text-emerald-500 text-2xl font-bold">❤</span>
        </button>
      </motion.div>
    </div>
  );
};

export default UserCard;
