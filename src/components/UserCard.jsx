import { motion, useMotionValue, useTransform } from "framer-motion";
import React from "react";

const UserCard = ({ user }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 150) {
      console.log("❤️ Liked", user.firstName);
    } else if (info.offset.x < -150) {
      console.log("✖ Disliked", user.firstName);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col pt-16 items-center">
      {/* Card with Motion */}
      <motion.div
        className="relative w-[340px] h-[500px] rounded-3xl overflow-hidden shadow-xl"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, rotate }}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 1.03 }}
      >
        {/* Background Image */}
        <img
          src={user.photoUrl}
          alt={user.firstName}
          className="w-full h-full object-cover"
        />

        {/* Gradient & Content */}
        <div className="absolute bottom-0 w-full h-[30%] bg-gradient-to-t from-black via-black/50 to-transparent p-5">
          <h2 className="text-white text-xl font-bold">
            {user.firstName}, {user.age}
          </h2>
          <p className="text-white text-sm">{user.about}</p>
          <div className="mt-2">
            <p className="text-white font-semibold">Skills</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {user.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-white/20 text-white text-xs px-2 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-10 mt-6">
        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition">
          <span className="text-red-500 text-xl">✖</span>
        </button>
        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition">
          <span className="text-orange-500 text-xl">❤️</span>
        </button>
      </div>
    </div>
  );
};

export default UserCard;
