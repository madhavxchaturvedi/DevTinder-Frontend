import axios from "axios";
import { motion, useMotionValue, useTransform } from "framer-motion";
import React from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeFeed } from "../redux/feedSlice";

const UserCard = ({ user }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const dispatch = useDispatch();

  const handleSendRequest = async (status, userId) => {
    try {
      const res = await axios.post(
        BASE_URL + "/request/send/" + status + "/" + userId,
        {},
        { withCredentials: true }
      );
      dispatch(removeFeed(userId));
    } catch (err) {
      //TODO:ERROR HANDLING
      console.log(err);
    }
  };

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 150) {
      handleSendRequest("interested", user._id);
      console.log("❤️ Liked", user.firstName);
    } else if (info.offset.x < -150) {
      handleSendRequest("ignored", user._id);
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
        <div className="absolute bottom-0 w-full h-[38%] bg-gradient-to-t from-black via-black/65 to-transparent p-5">
          <h2 className="text-white text-3xl font-extrabold">
            {user.firstName}, {user.age}
          </h2>
          <p className="text-white/85 font-semibold  text-sm">{user.about}</p>
          <div className="mt-2">
            <p className="text-white font-semibold">Skills</p>
            {user.skills && (
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
            )}
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-10 mt-6">
        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition">
          <span
            className="text-red-500 text-xl"
            onClick={() => handleSendRequest("ignored", user._id)}
          >
            ✖
          </span>
        </button>
        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition">
          <span
            className="text-orange-500 text-xl"
            onClick={() => handleSendRequest("interested", user._id)}
          >
            ❤️
          </span>
        </button>
      </div>
    </div>
  );
};

export default UserCard;
