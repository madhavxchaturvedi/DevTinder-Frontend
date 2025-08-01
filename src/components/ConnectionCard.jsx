import React from "react";

const ConnectionCard = ({ user }) => {
  return (
    <div className="relative rounded-[40px]  backdrop-blur-lg shadow-[0_0_30px_rgba(254,1,66,0.4)]">
      {/* Outer Gradient Background */}
      <div className="relative w-[318px] h-[240px] bg-gradient-to-tr from-[#fe5a33] via-[#fe0142] via-30% to-[#fe6d27] rounded-[40px] flex items-end pb-2 justify-center overflow-hidden">
        {/* 🔲 Transparent Black Layer */}
        <div className="absolute inset-0 rounded-[40px] bg-black/35 z-0" />
        {/* Inner White Card */}
        <div className="relative w-[300px] h-[150px] bg-white rounded-[40px] px-6 py-1 shadow-md z-10">
          {/* Profile Image */}
          <img
            src={user.photoUrl || "https://via.placeholder.com/80"}
            alt="profile"
            className="absolute -top-7 left-4 w-18 h-18 rounded-full object-cover shadow-lg shadow-black/60"
          />

          {/* Name and Tags */}
          <div className="ml-20">
            <h2 className="text-lg font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <div className="flex gap-2 mt-1">
              {(user.skills || []).slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className={`text-xs px-2 rounded-full ${
                    i === 0
                      ? "bg-purple-100 text-purple-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {tag || "No skills"}
                </span>
              ))}
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-gray-500 mt-2 pr-4 leading-snug">
            {user.bio || "This user hasn't written a bio yet."}
          </p>

          {/* Actions */}
          <div className="flex items-end mt-4 justify-start  gap-4">
            <button className="bg-gradient-to-b w-full from-black/80 to-[#2e2e2e] text-white py-3 rounded-full text-sm font-medium shadow-md">
              Message
            </button>
            {/* <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-lg shadow">
              ✉️
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-lg shadow">
              🔔
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionCard;
