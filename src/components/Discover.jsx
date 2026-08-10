import React, { useEffect, useState } from "react";
import UserCard from "./UserCard";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addFeed } from "../redux/feedSlice";
import axios from "axios";
import { SkeletonUserCard } from "./Skeletons";
import toast from "react-hot-toast";
import { FiSearch, FiX, FiImage, FiCheckCircle, FiArrowUp } from "react-icons/fi";
import MatchSplash from "./MatchSplash";
import { AnimatePresence } from "framer-motion";

const Discover = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [activeSkills, setActiveSkills] = useState(""); // Track currently applied skills
  const [matchedUser, setMatchedUser] = useState(null);

  const getFeed = async (forceRefetch = false, skillsToFetch = "") => {
    // If not forcing, and we already have feed data, and we aren't changing filters, skip
    if (!forceRefetch && feed && feed.length > 0 && skillsToFetch === activeSkills) return;

    try {
      setLoading(true);
      const url = skillsToFetch 
        ? `${BASE_URL}/feed?skills=${encodeURIComponent(skillsToFetch)}` 
        : `${BASE_URL}/feed`;
        
      const res = await axios.get(url, {
        withCredentials: true,
      });
      dispatch(addFeed(res?.data?.data));
    } catch (err) {
      if (err?.response?.status === 401) return;
      toast.error("Could not load feed. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeed(false, activeSkills);
  }, []);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    if (skillInput.trim() !== activeSkills) {
      setActiveSkills(skillInput.trim());
      getFeed(true, skillInput.trim());
    }
  };

  const handleClearFilter = () => {
    setSkillInput("");
    setActiveSkills("");
    getFeed(true, "");
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-start gap-8 px-4 pt-10">
      
      {/* ── Center Column (Timeline) ───────────────────────────── */}
      <div className="flex-1 flex flex-col w-full min-h-[800px]">
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Discover Builders</h2>
          <p className="text-[#a3a3a3] text-sm mt-1">Swipe right to connect with other developers, or use filters to find specific skills.</p>
        </div>

        {/* Discovery Feed (Legacy Cards) */}
        <div className="w-full flex justify-center mt-4">
          {loading ? (
            <div className="mt-4"><SkeletonUserCard /></div>
          ) : (!feed || feed.length === 0) ? (
            <div className="flex flex-col items-center justify-center mt-12 gap-4 text-center px-4 dev-card w-full max-w-md py-12">
              <FiCheckCircle className="text-5xl text-[#ccff00]" />
              <h1 className="text-2xl font-bold text-white">
                You're all caught up!
              </h1>
              <p className="text-[#a3a3a3] font-medium text-sm max-w-xs">
                Check back later to meet new builders and see top discussions.
              </p>
            </div>
          ) : (
            <div className="relative z-0 flex justify-center w-full max-w-sm h-[600px]">
              {feed.slice(0, 2).reverse().map((user) => {
                const isFront = user._id === feed[0]._id;
                return <UserCard key={user._id} user={user} isFront={isFront} onMatch={setMatchedUser} />;
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Sidebar (Widgets) ─────────────────────────────── */}
      <div className="hidden xl:flex w-[320px] flex-col gap-6 sticky top-10">
        
        {/* Upgrade Banner */}
        <div className="bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-xl p-5 relative overflow-hidden group cursor-pointer hover:bg-[#a855f7]/20 transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#a855f7]/30 rounded-full blur-xl group-hover:bg-[#a855f7]/50 transition-colors" />
          <h3 className="text-[#a855f7] font-bold mb-2 flex items-center gap-2">
            <FiArrowUp className="text-lg" /> Introducing Pro
          </h3>
          <p className="text-xs text-[#a3a3a3] font-medium mb-4 leading-relaxed">
            Boost your visibility and access live collaborative sandboxes with premium features.
          </p>
          <div className="flex gap-2">
            <button className="flex-1 bg-[#a855f7] text-white font-medium text-xs py-2 rounded-lg hover:bg-[#9240de] transition-colors">
              Upgrade
            </button>
            <button className="flex-1 bg-white/5 text-[#e5e5e5] font-medium text-xs py-2 rounded-lg hover:bg-white/10 transition-colors">
              Explore
            </button>
          </div>
        </div>

        {/* Trending Topics */}
        <div className="dev-card p-5">
          <h3 className="text-sm font-bold text-[#e5e5e5] mb-4">Trending Topics</h3>
          <div className="flex flex-wrap gap-2">
            {["#react", "#nextjs", "#machinelearning", "#rustlang", "#indiehacker", "#devtinder"].map((tag, i) => (
              <span key={i} className="text-xs font-mono text-[#a3a3a3] bg-white/5 border border-white/5 px-2.5 py-1 rounded-md hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Official Channels */}
        <div className="dev-card p-5">
          <h3 className="text-sm font-bold text-[#e5e5e5] mb-4 flex items-center gap-2">
            Official Channels <span className="text-[#a855f7]">✓</span>
          </h3>
          <div className="flex flex-col gap-4">
            {["VS Code", "React", "Tailwind CSS"].map((channel, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs">
                    {channel[0]}
                  </div>
                  <span className="text-sm font-medium text-[#a3a3a3] group-hover:text-white transition-colors">
                    {channel}
                  </span>
                </div>
                <button className="text-xs font-semibold text-white/50 bg-white/5 px-3 py-1 rounded hover:bg-white/10 transition-colors">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Match Splash Screen */}
      <AnimatePresence>
        {matchedUser && (
          <MatchSplash 
            matchedUser={matchedUser} 
            onClose={() => setMatchedUser(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Discover;
