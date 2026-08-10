import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import ConnectionCard from "./ConnectionCard";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../redux/connectionSlice";
import { SkeletonConnectionCard } from "./Skeletons";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

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
        <h1 className="text-3xl text-[#0a0a0a] font-black mb-8">Matches</h1>
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
        <div className="w-24 h-24 bg-white border-4 border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">💬</span>
        </div>
        <h1 className="text-3xl font-black text-[#0a0a0a] tracking-tight">No matches yet</h1>
        <p className="text-gray-600 font-bold text-sm max-w-sm">
          Start swiping on the feed. When you both swipe right, you can chat with them here!
        </p>
        <Link to="/feed" className="mt-6 neo-btn-primary">
          Keep Swiping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full pt-6 pb-20">
      
      {/* New Matches Row */}
      <div className="mb-10">
        <h2 className="text-sm font-black text-[#a855f7] uppercase tracking-wider mb-4 px-2">New Matches</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
          {connections.map((user) => (
            <Link key={`story-${user._id}`} to={`/chat/${user._id}`} className="flex flex-col items-center gap-2 min-w-[72px] group">
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-[#ccff00] to-[#a855f7] group-hover:scale-105 transition-transform shadow-[2px_2px_0px_#0a0a0a]">
                  <img
                    src={user.photoUrl || "https://geographyandyou.com/images/user-profile.png"}
                    alt={user.firstName}
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                </div>
              </div>
              <span className="text-xs text-[#0a0a0a] font-bold truncate w-16 text-center">
                {user.firstName}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div>
        <h2 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-4 px-2">Messages</h2>
        <div className="flex flex-col">
          {connections.map((user, i) => (
            <ConnectionCard key={user._id || i} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectionsPage;
