import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import ConnectionCard from "./ConnectionCard";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../redux/connectionSlice";
import { SkeletonConnectionCard } from "./Skeletons";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";

const ConnectionsPage = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const fetchConnections = async () => {
    if (connections && connections.length > 0) return;
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data?.data));
    } catch (err) {
      toast.error("Could not load connections.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full pt-6">
        <h1 className="text-3xl text-white font-bold mb-8 tracking-tight">Connections</h1>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonConnectionCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-24 gap-4 text-center px-4">
        <div className="w-24 h-24 bg-[#121212] border border-white/10 shadow-lg rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#ccff00]/10" />
          <FiMessageSquare className="text-4xl relative z-10 text-[#ccff00]" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">No connections yet</h1>
        <p className="text-[#a3a3a3] font-medium text-sm max-w-sm">
          Start swiping on the feed. When you both swipe right, you can chat with them here!
        </p>
        <Link to="/feed" className="mt-6 bg-[#ccff00] text-[#0a0a0a] font-bold px-6 py-2.5 rounded-lg hover:bg-[#bbf000] transition-colors">
          Keep Swiping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full pt-6 pb-20">
      
      {/* New Matches Row */}
      <div className="mb-10 bg-[#121212] border border-white/5 rounded-2xl p-6">
        <h2 className="text-xs font-bold text-[#ccff00] uppercase tracking-widest mb-4">New Matches</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-2">
          {connections.map((user) => (
            <Link key={`story-${user._id}`} to={`/chat/${user._id}`} className="flex flex-col items-center gap-2 min-w-[72px] group">
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-[#ccff00] to-[#a855f7] group-hover:scale-105 transition-transform shadow-md">
                  <img
                    src={user.photoUrl || "https://geographyandyou.com/images/user-profile.png"}
                    alt={user.firstName}
                    className="w-full h-full rounded-full object-cover border-2 border-[#121212]"
                  />
                </div>
              </div>
              <span className="text-xs text-[#e5e5e5] font-semibold truncate w-16 text-center group-hover:text-[#ccff00] transition-colors">
                {user.firstName}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div>
        <h2 className="text-xs font-bold text-[#a3a3a3] uppercase tracking-widest mb-4 px-2">Conversations</h2>
        <div className="flex flex-col gap-1">
          {connections.map((user, i) => (
            <ConnectionCard key={user._id || i} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectionsPage;
