import axios from "axios";
import React from "react";

const RequestCard = ({ user, onAccept, onReject }) => {
  return (
    <div className="w-full max-w-6xl mx-auto mb-6 flex items-center">
      {/* Left Galaxy Info Block */}
      <div className="flex-1 relative rounded-2xl bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.4)] p-2 backdrop-blur-md bg-opacity-60 border border-white/30 flex items-center gap-4">
        {/* Optional star overlay or blur effect background can be done via absolute if needed */}
        <img
          src={user.photoUrl || "https://via.placeholder.com/80"}
          alt="Profile"
          className="w-20 h-20 shadow-lg shadow-black/60 rounded-full border-4  object-cover"
        />
        <div>
          <h2 className="text-xl font-semibold text-white">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-white text-sm     opacity-90">
            {user.about || "This developer hasn't added an about yet."}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {user.skills?.map((skill, idx) => (
              <span
                key={idx}
                className={`text-xs px-3 py-1 rounded-full ${
                  idx === 0
                    ? "bg-purple-100 text-purple-900"
                    : "bg-yellow-100 text-yellow-900"
                }`}
              >
                {skill || "No skils"}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Floating Buttons - Transparent BG */}
      <div className="flex gap-3 ml-4">
        <button
          onClick={onAccept}
          className="px-4 py-2 rounded-full border border-green-300 text-green-300 hover:bg-green-400/10 transition"
        >
          Accept
        </button>
        <button
          onClick={onReject}
          className="px-4 py-2 rounded-full border border-red-300 text-red-300 hover:bg-red-400/10 transition"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default RequestCard;
