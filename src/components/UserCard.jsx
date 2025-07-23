import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";

const UserCard = ({ user }) => {
  const { firstName, lastName, photoUrl, age, gender, about } = user;

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 150) {
      console.log("Liked", firstName);
    } else if (info.offset.x < -150) {
      console.log("Disliked", firstName);
    }
    setIsDragging(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden px-4">
      <motion.div
        className="w-[320px] h-[460px] bg-white/10 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden relative flex flex-col justify-start"
        style={{ x, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 1.05 }}
      >
        <img
          src={photoUrl}
          alt={firstName}
          className="h-60 w-full object-cover"
        />

        <div className="p-4 pb-20 text-white">
          <h2 className="text-xl font-bold">{firstName + " " + lastName}</h2>
          {age && gender && (
            <p className="text-sm text-gray-500">{age + "," + gender}</p>
          )}
          <p className="text-sm mt-2 text-gray-700">{about}</p>
        </div>

        {/* Overlapping Buttons */}
        <div className="absolute bottom-4 w-full flex justify-center gap-6 z-10">
          <button className="btn btn-circle bg-red-500 text-white hover:bg-red-600 text-xl shadow-md">
            ✕
          </button>
          <button className="btn btn-circle bg-green-500 text-white hover:bg-green-600 text-xl shadow-md">
            ❤️
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserCard;
